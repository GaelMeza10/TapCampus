import { Test } from '@nestjs/testing';
import { PublicationsService } from './publications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { UploadsService } from '../uploads/uploads.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { QueueService } from '../jobs/queue.service';

it('rechazar contenido antes de persistir no crea filas, trabajos ni eventos', async () => {
  const create = jest.fn(), enqueue = jest.fn(), event = jest.fn();
  const module = await Test.createTestingModule({ providers: [PublicationsService,
    { provide: PrismaService, useValue: { publication: { create } } },
    { provide: CatalogsService, useValue: {} }, { provide: UploadsService, useValue: {} },
    { provide: RealtimeGateway, useValue: { stockUpdated: event, gangaActivated: event } },
    { provide: QueueService, useValue: { publication: enqueue } },
  ] }).compile();
  try {
    await expect(module.get(PublicationsService).create({ type: 'LIVE', title: '¡PÉNDEJO!', description: 'municiones' }, 'seller', 'http://localhost'))
      .rejects.toMatchObject({ response: { code: 'PUBLICATION_CONTENT_BLOCKED', fields: ['title', 'description'] } });
    expect(create).not.toHaveBeenCalled(); expect(enqueue).not.toHaveBeenCalled(); expect(event).not.toHaveBeenCalled();
  } finally { await module.close(); }
});
