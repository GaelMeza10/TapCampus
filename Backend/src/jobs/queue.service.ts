import {
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Queue, ConnectionOptions } from 'bullmq';
import { Publication } from '../generated/prisma/client';

export const RESERVATION_MS = 20 * 60 * 1000;
export function redisConnection(worker = false): ConnectionOptions {
  const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
  if (!['redis:', 'rediss:'].includes(url.protocol))
    throw new Error('REDIS_URL debe usar redis:// o rediss://');
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: Number(url.pathname.slice(1) || 0),
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
    maxRetriesPerRequest: worker ? null : 1,
    enableOfflineQueue: worker,
    connectTimeout: 1000,
  };
}
export function queuePrefix() {
  return process.env.BULLMQ_PREFIX ?? 'tapcampus';
}

@Injectable()
export class QueueService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(QueueService.name);
  reservations: Queue;
  publications: Queue;
  gangas: Queue;
  onModuleInit() {
    const options = { connection: redisConnection(), prefix: queuePrefix() };
    this.reservations = new Queue('reservation_queue', options);
    this.publications = new Queue('publication_queue', options);
    this.gangas = new Queue('ganga_queue', options);
    for (const queue of [this.reservations, this.publications, this.gangas]) {
      queue.on('error', () =>
        this.logger.warn(
          `Redis no disponible: ${queue.name}; conciliación pendiente`,
        ),
      );
    }
  }
  private async enqueue(
    queue: Queue,
    name: string,
    id: string,
    at: number,
    data: object,
  ) {
    try {
      await queue.add(name, data, {
        jobId: id,
        delay: Math.max(0, at - Date.now()),
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 1000,
      });
    } catch {
      // La mutación SQL ya está confirmada. La conciliación recupera el trabajo.
      this.logger.warn(
        `No se encoló ${name}; será recuperado desde PostgreSQL`,
      );
    }
  }
  async reservation(id: string, reservedAt: Date) {
    await this.enqueue(
      this.reservations,
      'expire',
      id,
      reservedAt.getTime() + RESERVATION_MS,
      { reservationId: id },
    );
  }
  async publication(p: Publication) {
    if (p.type !== 'LIVE' || p.status !== 'ACTIVE' || !p.end_time) return;
    const endAt = p.end_time.getTime();
    await this.enqueue(this.publications, 'expire', `${p.id}-${endAt}`, endAt, {
      publicationId: p.id,
      expectedAt: endAt,
    });
    if (
      !p.is_ganga_active &&
      p.ganga_activation_mode === 'SCHEDULED' &&
      p.ganga_min_price &&
      p.ganga_minutes_before
    ) {
      const at = endAt - p.ganga_minutes_before * 60000;
      await this.enqueue(this.gangas, 'activate', `${p.id}-${at}`, at, {
        publicationId: p.id,
        expectedAt: at,
      });
    }
  }
  async onApplicationShutdown() {
    await Promise.all(
      [this.reservations, this.publications, this.gangas]
        .filter(Boolean)
        .map((q) => q.close()),
    );
  }
}
