import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PublicationQueryDto } from '../catalogs/catalog-query.dto';
import { PublicationsService } from './publications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { UploadsService } from '../uploads/uploads.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { QueueService } from '../jobs/queue.service';

describe('Búsqueda del feed', () => {
  it('normaliza frase y rechaza arrays, nulos y textos mayores de 100', () => {
    const query = plainToInstance(PublicationQueryDto, { q: '  CAFÉ   frío  ' });
    expect(query.q).toBe('CAFÉ frío');
    expect(validateSync(query)).toHaveLength(0);
    for (const q of [undefined, '', '   ']) expect(validateSync(plainToInstance(PublicationQueryDto, { q }))).toHaveLength(0);
    for (const q of [['café', 'libro'], null, 123, 'a'.repeat(101)]) expect(validateSync(plainToInstance(PublicationQueryDto, { q })).length).toBeGreaterThan(0);
  });

  it('intersecta texto literal, tipo/zona/categoría y visibilidad, conserva orden y privacidad', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const validate = jest.fn().mockResolvedValue(undefined);
    const module = await Test.createTestingModule({ providers: [PublicationsService,
      { provide: PrismaService, useValue: { publication: { findMany } } },
      { provide: CatalogsService, useValue: { validate } },
      { provide: UploadsService, useValue: {} }, { provide: RealtimeGateway, useValue: {} },
      { provide: QueueService, useValue: {} },
    ] }).compile();
    try {
      const service = module.get(PublicationsService);
      await service.list({ type: 'LIVE', zoneId: 1, categoryId: 2, q: '50%_\\' });
      const options = findMany.mock.calls[0][0];
      expect(validate).toHaveBeenCalledWith(1, 2, 'LIVE');
      expect(options.where.AND).toContainEqual({ type: 'LIVE', zone_id: 1, category_id: 2 });
      expect(options.where.AND).toContainEqual({ OR: [
        { title: { contains: '50\\%\\_\\\\', mode: 'insensitive' } },
        { description: { contains: '50\\%\\_\\\\', mode: 'insensitive' } },
      ] });
      expect(options.where.AND[0]).toHaveProperty('status', 'ACTIVE');
      expect(options.select.seller.select).toEqual({ id: true, name: true });
      expect(options.orderBy[0]).toEqual({ is_ganga_active: 'desc' });
      await service.list({ type: 'STATIC' });
      expect(findMany.mock.calls[1][0].where.AND).toHaveLength(2);
    } finally { await module.close(); }
  });
});
