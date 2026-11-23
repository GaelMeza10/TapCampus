import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../jobs/queue.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

describe('Fotografía de reservas autorizadas', () => {
  const row = {
    id: 'r1', publication_id: 'p1', buyer_id: 'buyer', status: 'ACTIVE',
    reserved_at: new Date(), resolved_at: null, unit_price: { toFixed: () => '30.00' },
    pickup_zone_id: 1, pickup_zone_name: 'Cafetería Central',
    publication: { title: 'Burrito', image_url: 'https://old.example/uploads/photo.png', seller_id: 'seller', status: 'FINISHED', current_stock: 0, seller: { phone: '+526641234567', name: 'Ana' }, zone: { id: 2, name: 'Biblioteca Central' } },
    buyer: { id: 'buyer', name: 'Ana', phone: '+525512345678' },
  };
  it('mine incluye imagen con venta finalizada/stock cero sin consultar detalle público; ajeno se rechaza', async () => {
    const findMany = jest.fn().mockResolvedValue([row]);
    const findUnique = jest.fn().mockResolvedValue(row);
    const module = await Test.createTestingModule({ providers: [ReservationsService,
      { provide: PrismaService, useValue: { reservation: { findMany, findUnique } } },
      { provide: QueueService, useValue: {} }, { provide: RealtimeGateway, useValue: {} },
    ] }).compile();
    try {
      const service = module.get(ReservationsService);
      const [result] = await service.mine('buyer');
      expect(findMany.mock.calls[0][0].where).toEqual({ buyer_id: 'buyer' });
      expect(findMany.mock.calls[0][0].include.publication.select.image_url).toBe(true);
      expect(result.publicationImageUrl).toBe(row.publication.image_url);
      expect(result.unitPrice).toBe('30.00');
      expect(result.pickupLocation).toEqual({ zoneId: 1, name: 'Cafetería Central', source: 'SNAPSHOT' });
      expect(result.sellerName).toBe('Ana');
      expect(result).not.toHaveProperty('buyerContact');
      await expect(service.detail('r1', 'stranger')).rejects.toBeInstanceOf(ForbiddenException);
      findMany.mockResolvedValue([{ ...row, pickup_zone_id: null, pickup_zone_name: null, publication: { ...row.publication, image_url: '' } }]);
      const [legacy] = await service.mine('buyer');
      expect(legacy.publicationImageUrl).toBeNull();
      expect(legacy.pickupLocation).toEqual({ zoneId: 2, name: 'Biblioteca Central', source: 'LEGACY_CURRENT' });
    } finally { await module.close(); }
  });
});

describe('Apartado de la propia publicación', () => {
  it('rechaza con 403 en español y no descuenta stock ni crea reserva', async () => {
    const create = jest.fn();
    const update = jest.fn();
    const tx = {
      $queryRaw: jest.fn()
        .mockResolvedValueOnce([{ id: 'seller' }])
        .mockResolvedValueOnce([{ id: 'p1', seller_id: 'seller', type: 'LIVE', status: 'ACTIVE', current_stock: 3 }]),
      reservation: { findUnique: jest.fn().mockResolvedValue(null), create },
      publication: { update },
    };
    const module = await Test.createTestingModule({ providers: [ReservationsService,
      { provide: PrismaService, useValue: { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } },
      { provide: QueueService, useValue: {} }, { provide: RealtimeGateway, useValue: {} },
    ] }).compile();
    try {
      const service = module.get(ReservationsService);
      const attempt = service.create('p1', 'seller', '00000000-0000-4000-8000-000000000000');
      await expect(attempt).rejects.toBeInstanceOf(ForbiddenException);
      await expect(attempt).rejects.toThrow('No puedes apartar tu propia publicación');
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    } finally { await module.close(); }
  });
});
