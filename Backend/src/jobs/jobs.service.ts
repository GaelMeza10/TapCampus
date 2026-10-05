import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  BeforeApplicationShutdown,
} from '@nestjs/common';
import { Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Publication, Reservation } from '../generated/prisma/client';
import { PublicationsService } from '../publications/publications.service';
import { ReservationsService } from '../reservations/reservations.service';
import {
  QueueService,
  queuePrefix,
  redisConnection,
  RESERVATION_MS,
} from './queue.service';

@Injectable()
export class JobsService
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly logger = new Logger(JobsService.name);
  private workers: Worker[] = [];
  private timer?: NodeJS.Timeout;
  private reconciling?: Promise<void>;
  private stopping = false;
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservations: ReservationsService,
    private readonly publications: PublicationsService,
    private readonly queue: QueueService,
  ) {}

  onApplicationBootstrap() {
    const options = {
      connection: redisConnection(true),
      prefix: queuePrefix(),
      concurrency: 5,
    };
    this.workers = [
      new Worker(
        'reservation_queue',
        (job) => this.reservations.resolve(job.data.reservationId, 'EXPIRED'),
        options,
      ),
      new Worker(
        'publication_queue',
        (job) =>
          this.publications.expire(job.data.publicationId, job.data.expectedAt),
        options,
      ),
      new Worker(
        'ganga_queue',
        (job) =>
          this.publications.activateGanga(
            job.data.publicationId,
            undefined,
            job.data.expectedAt,
          ),
        options,
      ),
    ];
    for (const worker of this.workers) {
      worker.on('error', () =>
        this.logger.warn(`Redis no disponible: ${worker.name}`),
      );
      worker.on('failed', (job) =>
        this.logger.warn(
          `Trabajo ${worker.name}/${job?.id} fallido; reintento/conciliación pendiente`,
        ),
      );
    }
    const interval = Number(process.env.RECONCILIATION_INTERVAL_MS ?? 30000);
    if (!Number.isInteger(interval) || interval < 100)
      throw new Error('RECONCILIATION_INTERVAL_MS debe ser entero >=100');
    this.timer = setInterval(() => this.kick(), interval);
    this.timer.unref();
    this.kick();
  }
  private kick() {
    if (this.stopping || this.reconciling) return;
    this.reconciling = this.reconcile()
      .catch(() => this.logger.error('Conciliación fallida; se reintentará'))
      .finally(() => {
        this.reconciling = undefined;
      });
  }
  private async reconcile() {
    let cursor: string | undefined;
    do {
      const rows: Reservation[] = await this.prisma.reservation.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { id: 'asc' },
        take: 200,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      for (const r of rows) {
        if (this.stopping) return;
        if (r.reserved_at.getTime() + RESERVATION_MS <= Date.now())
          await this.reservations.resolve(r.id, 'EXPIRED');
        else await this.queue.reservation(r.id, r.reserved_at);
      }
      cursor = rows.length === 200 ? rows.at(-1)!.id : undefined;
    } while (cursor);
    cursor = undefined;
    do {
      const rows: Publication[] = await this.prisma.publication.findMany({
        where: { type: 'LIVE', status: 'ACTIVE' },
        orderBy: { id: 'asc' },
        take: 200,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      for (const p of rows) {
        if (this.stopping) return;
        await this.publications.expire(p.id);
        await this.publications.activateGanga(p.id);
        await this.queue.publication(p);
      }
      cursor = rows.length === 200 ? rows.at(-1)!.id : undefined;
    } while (cursor);
  }
  async beforeApplicationShutdown() {
    this.stopping = true;
    if (this.timer) clearInterval(this.timer);
    await Promise.all(this.workers.map((worker) => worker.close()));
    await this.reconciling;
  }
}
