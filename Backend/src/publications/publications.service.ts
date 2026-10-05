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
import {
  publicationResponse,
  publicationSelect,
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
  ) {}

  private async validate(
    data: Prisma.PublicationUncheckedCreateInput,
    origin: string,
  ) {
    for (const field of [
      'title',
      'description',
      'price',
      'image_url',
      'zone_id',
      'category_id',
    ] as const) {
      if (data[field] === undefined || data[field] === null)
        throw new BadRequestException(`${field} es obligatorio`);
    }
    await this.catalogs.validate(data.zone_id, data.category_id, data.type);
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
      new Prisma.Decimal(min.toString()).gt(data.price.toString())
    ) {
      throw new BadRequestException(
        'La ganga requiere modo y mínimo no mayor que el precio',
      );
    }
    if (mode === 'MANUAL' && minutes != null)
      throw new BadRequestException('La ganga manual no admite minutos');
    if (mode === 'SCHEDULED') {
      const activation = end - (minutes ?? 0) * 60000;
      if (minutes == null || activation < start || activation <= Date.now()) {
        throw new BadRequestException(
          'La programación ganga debe quedar dentro del horario y en el futuro',
        );
      }
    }
  }

  async create(dto: CreatePublicationDto, sellerId: string, origin: string) {
    const data = {
      ...dto,
      seller_id: sellerId,
      start_time:
        dto.start_time === undefined ? undefined : new Date(dto.start_time),
      end_time: dto.end_time === undefined ? undefined : new Date(dto.end_time),
      current_stock: dto.type === 'LIVE' ? dto.initial_stock : undefined,
    } as Prisma.PublicationUncheckedCreateInput;
    await this.validate(data, origin);
    return publicationResponse(
      await this.prisma.publication.create({ data, select: publicationSelect }),
    );
  }

  async list(query: PublicationQueryDto) {
    await this.catalogs.validate(query.zoneId, query.categoryId, query.type);
    const publications = await this.prisma.publication.findMany({
      where: {
        AND: [
          visiblePublications(new Date()),
          {
            type: query.type,
            zone_id: query.zoneId,
            category_id: query.categoryId,
          },
        ],
      },
      select: publicationSelect,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });
    return publications.map(publicationResponse);
  }

  async detail(id: string) {
    const publication = await this.prisma.publication.findFirst({
      where: { AND: [{ id }, visiblePublications(new Date())] },
      select: publicationSelect,
    });
    if (!publication) throw new NotFoundException('Publicación no disponible');
    const response = publicationResponse(publication);
    if (publication.type === 'STATIC') {
      const seller = await this.prisma.user.findUniqueOrThrow({
        where: { id: publication.seller_id },
        select: { phone: true },
      });
      return { ...response, sellerContact: seller };
    }
    return response;
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
    return this.prisma.$transaction(async (tx) => {
      const publication = await this.owned(tx, id, sellerId);
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
      await this.validate({ ...publication, ...supplied }, origin);
      return publicationResponse(
        await tx.publication.update({
          where: { id },
          data,
          select: publicationSelect,
        }),
      );
    });
  }

  async sold(id: string, sellerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const publication = await this.owned(tx, id, sellerId);
      if (publication.type !== 'STATIC')
        throw new ConflictException('Solo STATIC puede marcarse vendido');
      return publicationResponse(
        await tx.publication.update({
          where: { id },
          data: { status: 'FINISHED' },
          select: publicationSelect,
        }),
      );
    });
  }

  async physicalSale(id: string, sellerId: string) {
    return this.prisma.$transaction(async (tx) => {
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
      return publicationResponse(
        await tx.publication.update({
          where: { id },
          data: { current_stock: { decrement: 1 } },
          select: publicationSelect,
        }),
      );
    });
  }
}
