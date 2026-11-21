import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Prisma } from '../generated/prisma/client';
import { CreatePublicationDto, UpdatePublicationDto } from './publication.dto';
import { ownedPublicationResponse, ownedPublicationSelect, publicationResponse, publicationSelect } from './publication.select';

describe('Contrato de ofertas 0037', () => {
  const row = {
    id: 'p1', type: 'LIVE', title: 'Burrito', description: 'Caliente', price: new Prisma.Decimal('12.50'),
    price_before_ganga: null, image_url: '/uploads/test.png', status: 'ACTIVE', created_at: new Date(),
    seller_id: 's1', zone_id: 1, category_id: 1, initial_stock: 4, current_stock: 4,
    start_time: new Date(), end_time: new Date(Date.now() + 3600000), is_ganga_active: false,
    ganga_min_price: new Prisma.Decimal('8.25'), ganga_activation_mode: 'SCHEDULED', ganga_minutes_before: 5,
    seller: { id: 's1', name: 'Ana', phone: '+525512345678' },
  } satisfies Prisma.PublicationGetPayload<{ select: typeof ownedPublicationSelect }> & { seller: { phone: string } };

  it('omite configuración y contacto incluso al serializar accidentalmente una fila propia completa', () => {
    const response = publicationResponse(row);
    for (const field of ['ganga_min_price', 'ganga_activation_mode', 'ganga_minutes_before']) {
      expect(response).not.toHaveProperty(field);
      expect(publicationSelect).not.toHaveProperty(field);
    }
    expect(response.seller).toEqual({ id: 's1', name: 'Ana' });
    expect(response.price).toBe('12.50');
    expect(response.is_ganga_active).toBe(false);
  });

  it('la proyección propia conserva la configuración decimal sin añadir teléfono', () => {
    expect(ownedPublicationResponse(row)).toMatchObject({
      ganga_min_price: '8.25', ganga_activation_mode: 'SCHEDULED', ganga_minutes_before: 5,
      seller: { id: 's1', name: 'Ana' },
    });
    expect(ownedPublicationResponse(row).seller).not.toHaveProperty('phone');
  });

  it.each(['ganga_min_price', 'ganga_activation_mode', 'ganga_minutes_before'])(
    'creación rechaza null explícito en %s, pero PATCH permite expresarlo para validación combinada', field => {
      expect(validateSync(plainToInstance(CreatePublicationDto, { type: 'LIVE', [field]: null })).length).toBeGreaterThan(0);
      expect(validateSync(plainToInstance(UpdatePublicationDto, { [field]: null }))).toHaveLength(0);
    },
  );

  it.each([
    { ganga_min_price: 0 }, { ganga_min_price: 1.001 }, { ganga_min_price: '8' },
    { ganga_activation_mode: 'NONE' }, { ganga_minutes_before: 0 }, { ganga_minutes_before: '5' },
    { price: null }, { current_stock: null },
  ])('PATCH rechaza tipos/rangos inválidos sin ampliar null a otros campos: %j', body => {
    expect(validateSync(plainToInstance(UpdatePublicationDto, body)).length).toBeGreaterThan(0);
  });
});
