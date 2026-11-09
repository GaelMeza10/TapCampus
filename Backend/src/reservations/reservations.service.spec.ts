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
    publication: { title: 'Burrito', image_url: 'https://old.example/uploads/photo.png', seller_id: 'seller', status: 'FINISHED', current_stock: 0, seller: { phone: '+526641234567' } },
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
      expect(result).not.toHaveProperty('buyerContact');
      await expect(service.detail('r1', 'stranger')).rejects.toBeInstanceOf(ForbiddenException);
      findMany.mockResolvedValue([{ ...row, publication: { ...row.publication, image_url: '' } }]);
      expect((await service.mine('buyer'))[0].publicationImageUrl).toBeNull();
    } finally { await module.close(); }
  });
});
