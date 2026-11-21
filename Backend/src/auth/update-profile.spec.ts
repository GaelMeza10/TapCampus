import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { configureApp } from '../common/configure-app';
import { ReservationsService } from '../reservations/reservations.service';
import { QueueService } from '../jobs/queue.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Prisma } from '../generated/prisma/client';

describe('PATCH /auth/me con JWT real y repositorio aislado', () => {
  const owner = '10000000-0000-4000-8000-000000000001';
  const other = '10000000-0000-4000-8000-000000000002';
  type Profile = { id: string; name: string; email: string; phone: string; password_hash: string };
  let users: Map<string, Profile>;
  let app: INestApplication;
  let token: string;
  let reservations: ReservationsService;
  const select = (row: Profile, fields: Record<string, boolean>) => Object.fromEntries(Object.keys(fields).filter(key => fields[key]).map(key => [key, row[key as keyof Profile]]));
  const update = jest.fn();

  beforeAll(async () => {
    process.env.JWT_SECRET = 'profile-test-secret-with-at-least-thirty-two-characters';
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
      controllers: [AuthController],
      providers: [AuthService, UsuariosService, JwtStrategy, ReservationsService,
        { provide: PrismaService, useValue: {
          user: { findUnique: async ({ where, select: fields }: { where: { id: string }; select: Record<string, boolean> }) => { const row = users.get(where.id); return row ? select(row, fields) : null; }, update },
          reservation: { findMany: async () => [{ id: 'r1', publication_id: 'p1', buyer_id: other, status: 'ACTIVE', reserved_at: new Date(), resolved_at: null, unit_price: { toFixed: () => '30.00' }, publication: { title: 'Burrito', image_url: '', seller_id: owner, seller: users.get(owner) }, buyer: users.get(other) }] },
        } },
        { provide: QueueService, useValue: {} }, { provide: RealtimeGateway, useValue: {} },
      ],
    }).compile();
    app = module.createNestApplication(); configureApp(app); await app.init();
    token = module.get(JwtService).sign({ sub: owner, email: 'ana@uabc.edu.mx' });
    reservations = module.get(ReservationsService);
  });
  beforeEach(() => {
    users = new Map([
      [owner, { id: owner, name: 'Ana', email: 'ana@uabc.edu.mx', phone: '+526641234567', password_hash: 'private' }],
      [other, { id: other, name: 'Luis', email: 'luis@uabc.edu.mx', phone: '+525512345678', password_hash: 'other-private' }],
    ]);
    update.mockReset().mockImplementation(async ({ where, data, select: fields }: { where: { id: string }; data: Partial<Profile>; select: Record<string, boolean> }) => {
      const row = { ...users.get(where.id)!, ...data }; users.set(where.id, row); return select(row, fields);
    });
  });
  afterAll(async () => { await app.close(); delete process.env.JWT_SECRET; });

  it('actualiza nombre/teléfono propios, persiste en GET y mantiene identidad/sesión/contacto de reserva', async () => {
    const response = await request(app.getHttpServer()).patch('/auth/me').auth(token, { type: 'bearer' }).send({ name: '  Ana   María Pérez  ', phone: '5512345678' }).expect(200);
    expect(response.body).toEqual({ id: owner, name: 'Ana María Pérez', email: 'ana@uabc.edu.mx', phone: '+525512345678' });
    expect(users.get(other)?.name).toBe('Luis');
    const profile = await request(app.getHttpServer()).get('/auth/me').auth(token, { type: 'bearer' }).expect(200);
    expect(profile.body).toEqual(response.body);
    expect(users.get(owner)?.password_hash).toBe('private');
    const reservation = (await reservations.mine(other))[0];
    expect('sellerContact' in reservation).toBe(true);
    if (!('sellerContact' in reservation)) throw new Error('Falta el contacto del vendedor');
    expect(reservation.sellerContact.phone).toBe('+525512345678');
    expect((await reservations.mine(other))[0].unitPrice).toBe('30.00');
  });
  it('acepta cambios parciales y teléfono canónico sin duplicar prefijo', async () => {
    await request(app.getHttpServer()).patch('/auth/me').auth(token, { type: 'bearer' }).send({ phone: '+523312345678' }).expect(200);
    expect(users.get(owner)).toMatchObject({ name: 'Ana', phone: '+523312345678' });
    await request(app.getHttpServer()).patch('/auth/me').auth(token, { type: 'bearer' }).send({ name: 'José de la Cruz' }).expect(200);
    expect(users.get(owner)?.phone).toBe('+523312345678');
  });
  it.each([{}, { name: '  ' }, { name: null }, { phone: null }, { phone: '123' }, { phone: '+15512345678' }, { email: 'otra@uabc.edu.mx', name: 'Otra' }, { password: 'secret', name: 'Otra' }, { id: other, name: 'Otra' }])('rechaza cuerpo inválido o campos protegidos: %j', async body => {
    await request(app.getHttpServer()).patch('/auth/me').auth(token, { type: 'bearer' }).send(body).expect(400);
    expect(update).not.toHaveBeenCalled();
  });
  it('rechaza sin JWT y JWT inválido', async () => {
    await request(app.getHttpServer()).patch('/auth/me').send({ name: 'Otra' }).expect(401);
    await request(app.getHttpServer()).patch('/auth/me').auth('invalid', { type: 'bearer' }).send({ name: 'Otra' }).expect(401);
    expect(update).not.toHaveBeenCalled();
  });
  it('rechaza cuenta eliminada incluso entre validación JWT y actualización', async () => {
    update.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('missing', { code: 'P2025', clientVersion: '7.10.0' }));
    await request(app.getHttpServer()).patch('/auth/me').auth(token, { type: 'bearer' }).send({ name: 'Otra' }).expect(401);
    users.delete(owner);
    await request(app.getHttpServer()).patch('/auth/me').auth(token, { type: 'bearer' }).send({ name: 'Otra' }).expect(401);
  });
});
