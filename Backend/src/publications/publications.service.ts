import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Publication } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { UploadsService } from '../uploads/uploads.service';
import { PublicationQueryDto } from '../catalogs/catalog-query.dto';
import { CreatePublicationDto, UpdatePublicationDto } from './publication.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { QueueService, RESERVATION_MS } from '../jobs/queue.service';
import { blockedContentFields } from './content-policy';
import {
  publicationResponse,
  publicationSelect,
  ownedPublicationResponse,
  ownedPublicationSelect,
  visiblePublications,
} from './publication.select';

const liveFields = [
  'initial_stock',
  'current_stock',
  'start_time',
  'end_time',
  'ganga_min_price',
  'ganga_activation_mode',
  'ganga_minutes_before',
];

@Injectable()
export class PublicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogs: CatalogsService,
    private readonly uploads: UploadsService,
    private readonly events: RealtimeGateway,
    private readonly queue: QueueService,
  ) {}

  private validateContent(data: { title?: string; description?: string }, editing = false) {
    const fields = blockedContentFields(data);
    if (fields.length) throw new BadRequestException({
      code: 'PUBLICATION_CONTENT_BLOCKED',
      message: [`Se detectó una palabra ofensiva o no permitida, modifícala si deseas ${editing ? 'guardar' : 'crear'} la publicación`],
      fields,
    });
  }

  private async validate(
    data: Prisma.PublicationUncheckedCreateInput,
    origin: string,
    requireFutureGanga = true,
    requireLowerPrice = true,
  ) {
    if (data.type === 'LIVE' && data.condition != null) {
      throw new BadRequestException('La condición Nuevo/Usado solo corresponde a Productos');
    }
    for (const field of [
      'title',
      'description',
      'price',
      'image_url',
      'category_id',
    ] as const) {
      if (data[field] === undefined || data[field] === null)
        throw new BadRequestException(`${field} es obligatorio`);
    }
    const pickupMode = data.pickup_mode ?? 'SPECIFIC_ZONE';
    if (pickupMode === 'ARRANGED' ? data.type !== 'STATIC' || data.zone_id !== null : data.zone_id == null) {
      throw new BadRequestException('Elige una zona concreta; solo Productos permite entrega por acordar sin zona');
    }
    await this.catalogs.validate(data.zone_id ?? undefined, data.category_id, data.type);
    await this.uploads.validateImageUrl(data.image_url, origin);
    if (data.type === 'STATIC') {
      if (
        liveFields.some((field) => data[field as keyof typeof data] != null)
      ) {
        throw new BadRequestException(
          'STATIC no admite stock, horario ni ganga',
        );
      }
      return;
    }
    if (
      data.initial_stock == null ||
      data.current_stock == null ||
      !data.start_time ||
      !data.end_time
    ) {
      throw new BadRequestException('LIVE requiere stock inicial y horario');
    }
    const start = new Date(data.start_time).getTime();
    const end = new Date(data.end_time).getTime();
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start >= end ||
      end <= Date.now()
    ) {
      throw new BadRequestException(
        'El inicio debe preceder al fin y el fin debe ser futuro',
      );
    }
    const min = data.ganga_min_price;
    const mode = data.ganga_activation_mode;
    const minutes = data.ganga_minutes_before;
    if (min == null && mode == null && minutes == null) return;
    if (
      min == null ||
      !mode ||
      (requireLowerPrice && (
        !new Prisma.Decimal(min.toString()).gt(0) ||
        new Prisma.Decimal(min.toString()).gte(data.price.toString())
      ))
    ) {
      throw new BadRequestException(
        'La oferta requiere modo y un mínimo positivo menor que el precio normal',
      );
    }
    if (mode === 'MANUAL' && minutes != null)
      throw new BadRequestException('La ganga manual no admite minutos');
    if (mode === 'SCHEDULED') {
      const activation = end - (minutes ?? 0) * 60000;
      if (
        minutes == null ||
        activation < start ||
        (!data.is_ganga_active &&
          requireFutureGanga &&
          activation <= Date.now())
      ) {
        throw new BadRequestException(
          'La programación ganga debe quedar dentro del horario y en el futuro',
        );
      }
    }
  }

  async create(dto: CreatePublicationDto, sellerId: string, origin: string) {
    this.validateContent(dto);
    if (dto.type === 'STATIC' && !dto.condition) {
      throw new BadRequestException('Selecciona si el artículo es nuevo o usado');
    }
    const data = {
      ...dto,
      seller_id: sellerId,
      start_time:
        dto.start_time === undefined ? undefined : new Date(dto.start_time),
      end_time: dto.end_time === undefined ? undefined : new Date(dto.end_time),
      current_stock: dto.type === 'LIVE' ? dto.initial_stock : undefined,
    } as Prisma.PublicationUncheckedCreateInput;
    await this.validate(data, origin);
    if (dto.type === 'LIVE' && dto.start_time && new Date(dto.start_time).getTime() <= Date.now()) {
      data.availability_announced_for = new Date(dto.start_time);
    }
    const publication = await this.prisma.publication.create({
      data,
      select: ownedPublicationSelect,
    });
    this.events.publicationChanged('publication_created', publication.id, publication.type);
    await this.queue.publication(publication);
    return ownedPublicationResponse(publication);
  }

  async list(query: PublicationQueryDto) {
    if (query.pickupMode === 'ARRANGED' && (query.type !== 'STATIC' || query.zoneId !== undefined)) {
      throw new BadRequestException('Entrega por acordar requiere Productos y no admite zona concreta');
    }
    await this.catalogs.validate(query.zoneId, query.categoryId, query.type);
    const text = query.q?.replace(/[\\%_]/g, '\\$&');
    const search: Prisma.PublicationWhereInput[] = text ? [{
      OR: [
        { title: { contains: text, mode: 'insensitive' } },
        { description: { contains: text, mode: 'insensitive' } },
      ],
    }] : [];
    const publications = await this.prisma.publication.findMany({
      where: {
        AND: [
          visiblePublications(new Date()),
          {
            type: query.type,
            zone_id: query.zoneId,
            ...(query.pickupMode ? { pickup_mode: query.pickupMode } : {}),
            category_id: query.categoryId,
          },
          ...search,
        ],
      },
      select: publicationSelect,
      orderBy: [
        { is_ganga_active: 'desc' },
        { created_at: 'desc' },
        { id: 'desc' },
      ],
    });
    return publications.map(publicationResponse);
  }

  async mine(sellerId: string) {
    const publications = await this.prisma.publication.findMany({
      where: { seller_id: sellerId },
      select: ownedPublicationSelect,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });
    return publications.map(ownedPublicationResponse);
  }

  async detail(id: string) {
    const publication = await this.prisma.publication.findFirst({
      where: { AND: [{ id }, visiblePublications(new Date())] },
      select: publicationSelect,
    });
    if (!publication) throw new NotFoundException('Publicación no disponible');
    const response = publicationResponse(publication);
    const seller = await this.prisma.user.findUniqueOrThrow({
      where: { id: publication.seller_id },
      select: { phone: true },
    });
    return { ...response, sellerContact: seller };
  }

  private async owned(
    tx: Prisma.TransactionClient,
    id: string,
    sellerId: string,
  ) {
    const rows = await tx.$queryRaw<
      Publication[]
    >`SELECT * FROM publications WHERE id = ${id}::uuid FOR UPDATE`;
    const publication = rows[0];
    if (!publication) throw new NotFoundException('Publicación inexistente');
    if (publication.seller_id !== sellerId)
      throw new ForbiddenException(
        'Solo el propietario puede modificar la publicación',
      );
    if (publication.status !== 'ACTIVE')
      throw new ConflictException('La publicación no está activa');
    if (
      publication.type === 'LIVE' &&
      (!publication.end_time || publication.end_time.getTime() <= Date.now())
    ) {
      throw new ConflictException('El horario de la publicación terminó');
    }
    return publication;
  }

  async update(
    id: string,
    dto: UpdatePublicationDto,
    sellerId: string,
    origin: string,
  ) {
    const fields = Object.keys(dto).filter(
      (key) => dto[key as keyof UpdatePublicationDto] !== undefined,
    );
    if (!fields.length)
      throw new BadRequestException('Envía al menos un campo editable');
    const result = await this.prisma.$transaction(async (tx) => {
      const publication = await this.owned(tx, id, sellerId);
      if (publication.type === 'LIVE' && dto.zone_id !== undefined && dto.zone_id !== publication.zone_id) {
        const active = await tx.reservation.count({ where: {
          publication_id: id, status: 'ACTIVE',
          reserved_at: { gt: new Date(Date.now() - RESERVATION_MS) },
        } });
        if (active) throw new ConflictException('No puedes cambiar el punto de recogida mientras haya reservas vigentes');
      }
      this.validateContent(dto, true);
      if (
        publication.type === 'STATIC' &&
        liveFields.some((field) => fields.includes(field))
      ) {
        throw new BadRequestException(
          'STATIC no admite stock, horario ni ganga',
        );
      }
      if (
        publication.is_ganga_active &&
        [
          'price',
          'ganga_min_price',
          'ganga_activation_mode',
          'ganga_minutes_before',
        ].some((field) => fields.includes(field))
      ) {
        throw new ConflictException('La ganga activa no se puede reconfigurar');
      }
      const configurationFields = [
        'ganga_min_price', 'ganga_activation_mode', 'ganga_minutes_before',
      ] as const;
      const withdrawing = configurationFields.every((field) => dto[field] === null);
      if (
        !withdrawing &&
        (dto.ganga_min_price === null || dto.ganga_activation_mode === null ||
          (dto.ganga_minutes_before === null &&
            (dto.ganga_activation_mode ?? publication.ganga_activation_mode) !== 'MANUAL'))
      ) throw new BadRequestException('Retira la oferta enviando sus tres campos en null');
      const data = {
        ...dto,
        start_time:
          dto.start_time === undefined ? undefined : new Date(dto.start_time),
        end_time:
          dto.end_time === undefined ? undefined : new Date(dto.end_time),
      };
      // No sobrescribir con undefined los campos ya persistidos al validar PATCH.
      const supplied = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
      );
      await this.validate(
        { ...publication, ...supplied },
        origin,
        [
          'start_time',
          'end_time',
          'ganga_min_price',
          'ganga_activation_mode',
          'ganga_minutes_before',
        ].some((field) => fields.includes(field)),
        !publication.is_ganga_active && [
          'price', 'ganga_min_price', 'ganga_activation_mode', 'ganga_minutes_before',
        ].some((field) => fields.includes(field)),
      );
      const combined = { ...publication, ...supplied };
      const announce = combined.type === 'LIVE' && combined.start_time && combined.end_time &&
        new Date(combined.start_time).getTime() <= Date.now() && new Date(combined.end_time).getTime() > Date.now() &&
        (combined.current_stock ?? 0) > 0 && publication.availability_announced_for?.getTime() !== new Date(combined.start_time).getTime();
      const updated = await tx.publication.update({
        where: { id },
        data: { ...data, ...(announce ? { availability_announced_for: new Date(combined.start_time!) } : {}) },
        select: ownedPublicationSelect,
      });
      return {
        updated,
        announce: !!announce,
        stockChanged: publication.current_stock !== updated.current_stock,
      };
    });
    if (result.stockChanged && result.updated.current_stock !== null)
      this.events.stockUpdated(id, result.updated.current_stock);
    this.events.publicationChanged('publication_updated', id, result.updated.type);
    if (result.announce) this.events.publicationChanged('publication_available', id, 'LIVE');
    await this.queue.publication(result.updated);
    return ownedPublicationResponse(result.updated);
  }

  async sold(id: string, sellerId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const publication = await this.owned(tx, id, sellerId);
      if (publication.type !== 'STATIC')
        throw new ConflictException('Solo STATIC puede marcarse vendido');
      return ownedPublicationResponse(
        await tx.publication.update({
          where: { id },
          data: { status: 'FINISHED' },
          select: ownedPublicationSelect,
        }),
      );
    });
    this.events.publicationChanged('publication_updated', id, 'STATIC');
    return result;
  }

  async available(id: string, expectedAt?: number) {
    const changed = await this.prisma.$transaction(async tx => {
      const [p] = await tx.$queryRaw<Publication[]>`SELECT * FROM publications WHERE id = ${id}::uuid FOR UPDATE`;
      if (!p || p.type !== 'LIVE' || p.status !== 'ACTIVE' || !p.start_time || !p.end_time ||
        p.start_time.getTime() > Date.now() || p.end_time.getTime() <= Date.now() ||
        !p.current_stock || (expectedAt !== undefined && p.start_time.getTime() !== expectedAt) ||
        p.availability_announced_for?.getTime() === p.start_time.getTime()) return false;
      await tx.publication.update({ where: { id }, data: { availability_announced_for: p.start_time } });
      return true;
    });
    if (changed) this.events.publicationChanged('publication_available', id, 'LIVE');
    return changed;
  }

  async physicalSale(id: string, sellerId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const publication = await this.owned(tx, id, sellerId);
      if (
        publication.type !== 'LIVE' ||
        !publication.start_time ||
        publication.start_time.getTime() > Date.now()
      ) {
        throw new ConflictException(
          'La venta física requiere LIVE dentro del horario',
        );
      }
      if (!publication.current_stock || publication.current_stock <= 0)
        throw new ConflictException('Stock agotado');
      return ownedPublicationResponse(
        await tx.publication.update({
          where: { id },
          data: { current_stock: { decrement: 1 } },
          select: ownedPublicationSelect,
        }),
      );
    });
    this.events.stockUpdated(id, result.current_stock!);
    return result;
  }

  async finish(id: string, sellerId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const p = await this.owned(tx, id, sellerId);
      if (p.type !== 'LIVE')
        throw new ConflictException('Solo LIVE admite cierre manual');
      return tx.publication.update({
        where: { id },
        data: { status: 'FINISHED' },
        select: ownedPublicationSelect,
      });
    });
    this.events.publicationExpired(id);
    return ownedPublicationResponse(result);
  }

  async expire(id: string, expectedAt?: number) {
    const changed = await this.prisma.$transaction(async (tx) => {
      const [p] = await tx.$queryRaw<
        Publication[]
      >`SELECT * FROM publications WHERE id = ${id}::uuid FOR UPDATE`;
      if (
        !p ||
        p.type !== 'LIVE' ||
        p.status !== 'ACTIVE' ||
        !p.end_time ||
        p.end_time.getTime() > Date.now() ||
        (expectedAt !== undefined && p.end_time.getTime() !== expectedAt)
      )
        return false;
      await tx.publication.update({
        where: { id },
        data: { status: 'FINISHED' },
      });
      return true;
    });
    if (changed) this.events.publicationExpired(id);
    return changed;
  }

  async activateGanga(id: string, sellerId?: string, expectedAt?: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const [p] = await tx.$queryRaw<
        Publication[]
      >`SELECT * FROM publications WHERE id = ${id}::uuid FOR UPDATE`;
      if (!p) {
        if (!sellerId) return null;
        throw new NotFoundException('Publicación inexistente');
      }
      if (sellerId && p.seller_id !== sellerId)
        throw new ForbiddenException('Publicación ajena');
      const at =
        p.end_time && p.ganga_minutes_before
          ? p.end_time.getTime() - p.ganga_minutes_before * 60000
          : null;
      const now = new Date();
      const valid =
        p.type === 'LIVE' &&
        p.status === 'ACTIVE' &&
        p.start_time &&
        p.start_time <= now &&
        p.end_time &&
        p.end_time > now &&
        p.ganga_min_price &&
        p.ganga_min_price.gt(0) &&
        p.ganga_min_price.lt(p.price) &&
        !p.is_ganga_active &&
        (sellerId
          ? p.ganga_activation_mode === 'MANUAL'
          : p.ganga_activation_mode === 'SCHEDULED' &&
            at !== null &&
            at <= now.getTime() &&
            (expectedAt === undefined || expectedAt === at));
      if (!valid) {
        if (!sellerId) return null;
        throw new ConflictException('Oferta no disponible: revisa el estado, modo y que el mínimo sea menor al precio normal');
      }
      return tx.publication.update({
        where: { id },
        data: { price_before_ganga: p.price, price: p.ganga_min_price!, is_ganga_active: true },
        select: ownedPublicationSelect,
      });
    });
    if (result) this.events.gangaActivated(id, result.price.toFixed(2));
    return result ? ownedPublicationResponse(result) : null;
  }
}
