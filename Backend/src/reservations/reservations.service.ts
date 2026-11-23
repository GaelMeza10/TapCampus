import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Publication, Reservation } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { QueueService, RESERVATION_MS } from '../jobs/queue.service';

const include = {
  publication: {
    select: {
      title: true,
      image_url: true,
      seller_id: true,
      seller: { select: { phone: true, name: true } },
      zone: { select: { id: true, name: true } },
    },
  },
  buyer: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.ReservationInclude;
type DetailedReservation = Prisma.ReservationGetPayload<{
  include: typeof include;
}>;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: RealtimeGateway,
    private readonly queue: QueueService,
  ) {}

  private response(r: DetailedReservation, actor: string) {
    const expiresAt = new Date(r.reserved_at.getTime() + RESERVATION_MS);
    return {
      id: r.id,
      publicationId: r.publication_id,
      publicationTitle: r.publication.title,
      publicationImageUrl: r.publication.image_url || null,
      status: r.status,
      reservedAt: r.reserved_at.toISOString(),
      expiresAt: expiresAt.toISOString(),
      resolvedAt: r.resolved_at?.toISOString() ?? null,
      unitPrice: r.unit_price.toFixed(2),
      sellerName: r.publication.seller.name,
      pickupLocation: r.pickup_zone_id != null && r.pickup_zone_name != null
        ? { zoneId: r.pickup_zone_id, name: r.pickup_zone_name, source: 'SNAPSHOT' as const }
        : r.publication.zone
          ? { zoneId: r.publication.zone.id, name: r.publication.zone.name, source: 'LEGACY_CURRENT' as const }
          : null,
      ...(actor === r.buyer_id
        ? { sellerContact: { phone: r.publication.seller.phone } }
        : {
            buyer: { id: r.buyer.id, name: r.buyer.name },
            ...(r.status === 'ACTIVE' && expiresAt.getTime() > Date.now()
              ? { buyerContact: { phone: r.buyer.phone } }
              : {}),
          }),
    };
  }
  async create(publicationId: string, buyerId: string, key: string) {
    const result = await this.prisma.$transaction(
      async (tx) => {
        // Serializa una clave del comprador incluso si dos solicitudes apuntan a publicaciones distintas.
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${buyerId}::uuid FOR UPDATE`;
        const existing = await tx.reservation.findUnique({
          where: {
            buyer_id_idempotency_key: {
              buyer_id: buyerId,
              idempotency_key: key,
            },
          },
          include,
        });
        if (existing) {
          if (existing.publication_id !== publicationId)
            throw new ConflictException(
              'La clave ya pertenece a otra publicación',
            );
          return { reservation: existing, created: false, stock: 0 };
        }
        const [p] = await tx.$queryRaw<
          Publication[]
        >`SELECT * FROM publications WHERE id = ${publicationId}::uuid FOR UPDATE`;
        if (!p) throw new NotFoundException('Publicación inexistente');
        const now = new Date();
        if (
          p.type !== 'LIVE' ||
          p.status !== 'ACTIVE' ||
          !p.start_time ||
          !p.end_time ||
          p.start_time > now ||
          p.end_time <= now ||
          !p.current_stock
        ) {
          throw new ConflictException(
            'Stock agotado o publicación no disponible',
          );
        }
        const zone = await tx.zone.findUniqueOrThrow({ where: { id: p.zone_id! }, select: { name: true } });
        const reservation = await tx.reservation.create({
          data: {
            publication_id: publicationId,
            buyer_id: buyerId,
            idempotency_key: key,
            unit_price: p.price,
            reserved_at: now,
            pickup_zone_id: p.zone_id,
            pickup_zone_name: zone.name,
          },
          include,
        });
        await tx.publication.update({
          where: { id: publicationId },
          data: { current_stock: { decrement: 1 } },
        });
        return { reservation, created: true, stock: p.current_stock - 1 };
      },
      { maxWait: 30000, timeout: 30000 },
    );
    if (result.created) {
      this.events.stockUpdated(publicationId, result.stock);
      await this.queue.reservation(
        result.reservation.id,
        result.reservation.reserved_at,
      );
    }
    return {
      created: result.created,
      reservation: this.response(result.reservation, buyerId),
    };
  }
  async mine(buyerId: string) {
    return (
      await this.prisma.reservation.findMany({
        where: { buyer_id: buyerId },
        include,
        orderBy: [{ reserved_at: 'desc' }, { id: 'desc' }],
      })
    ).map((r) => this.response(r, buyerId));
  }
  async detail(id: string, actor: string) {
    const r = await this.prisma.reservation.findUnique({
      where: { id },
      include,
    });
    if (!r) throw new NotFoundException('Reserva inexistente');
    if (r.buyer_id !== actor && r.publication.seller_id !== actor)
      throw new ForbiddenException('Reserva ajena');
    return this.response(r, actor);
  }
  async sellerList(publicationId: string, actor: string) {
    const p = await this.prisma.publication.findUnique({
      where: { id: publicationId },
    });
    if (!p) throw new NotFoundException('Publicación inexistente');
    if (p.seller_id !== actor)
      throw new ForbiddenException('Publicación ajena');
    return (
      await this.prisma.reservation.findMany({
        where: { publication_id: publicationId },
        include,
        orderBy: [{ reserved_at: 'desc' }, { id: 'desc' }],
      })
    ).map((r) => this.response(r, actor));
  }
  async resolve(
    id: string,
    action: 'COMPLETED' | 'CANCELLED' | 'EXPIRED',
    actor?: string,
  ) {
    const initial = await this.prisma.reservation.findUnique({
      where: { id },
      select: { publication_id: true },
    });
    if (!initial) {
      if (action === 'EXPIRED') return false;
      throw new NotFoundException('Reserva inexistente');
    }
    const changed = await this.prisma.$transaction(
      async (tx) => {
        // Orden común: publication → reservation. No bloquear reservation antes del inventario.
        const [p] = await tx.$queryRaw<
          Publication[]
        >`SELECT * FROM publications WHERE id = ${initial.publication_id}::uuid FOR UPDATE`;
        const [r] = await tx.$queryRaw<
          Reservation[]
        >`SELECT * FROM reservations WHERE id = ${id}::uuid FOR UPDATE`;
        if (!r || !p) return null;
        const now = new Date();
        const expired =
          r.reserved_at.getTime() + RESERVATION_MS <= now.getTime();
        if (
          action !== 'EXPIRED' &&
          (action === 'COMPLETED' ? p.seller_id : r.buyer_id) !== actor
        )
          throw new ForbiddenException('Acción no autorizada');
        if (action === 'EXPIRED') {
          if (r.status !== 'ACTIVE' || !expired) return null;
        } else if (r.status !== 'ACTIVE' || expired)
          throw new ConflictException('Reserva resuelta o vencida');
        await tx.reservation.update({
          where: { id },
          data: { status: action, resolved_at: now },
        });
        if (action !== 'COMPLETED') {
          await tx.publication.update({
            where: { id: p.id },
            data: { current_stock: { increment: 1 } },
          });
        }
        return { publicationId: p.id, stock: (p.current_stock ?? 0) + 1 };
      },
      { maxWait: 30000, timeout: 30000 },
    );
    if (changed && action !== 'COMPLETED')
      this.events.stockUpdated(changed.publicationId, changed.stock);
    if (action === 'EXPIRED') return !!changed;
    return this.detail(id, actor!);
  }
}
