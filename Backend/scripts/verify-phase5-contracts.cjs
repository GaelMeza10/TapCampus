// Contratos nuevos de fase 5 sin iniciar procesos ni escuchar puertos de aplicación.
const assert = require('node:assert/strict');
const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { PassportModule } = require('@nestjs/passport');
const { JwtService } = require('@nestjs/jwt');
const { PublicationsController } = require('../dist/publications/publications.controller');
const { PublicationsService } = require('../dist/publications/publications.service');
const { ReservationsService } = require('../dist/reservations/reservations.service');
const { JwtStrategy } = require('../dist/auth/jwt.strategy');
const { PrismaService } = require('../dist/prisma/prisma.service');

const sellerA = '11111111-1111-4111-8111-111111111111';
const sellerB = '22222222-2222-4222-8222-222222222222';
const publication = id => ({
  id, type: 'LIVE', title: 'Burrito', description: 'Caliente', status: 'FINISHED',
  seller_id: sellerA, seller: { id: sellerA, name: 'Ana' },
  price: { toFixed: () => '30.00' }, ganga_min_price: null, current_stock: 0,
});

async function main() {
  process.env.JWT_SECRET = 'isolated-phase5-jwt-fixture-secret';
  const calls = [];
  const prisma = {
    user: { findUnique: async ({ where }) => [sellerA, sellerB].includes(where.id) ? { id: where.id, email: 'vendedor@uabc.edu.mx' } : null },
    publication: { findMany: async ({ where }) => {
      calls.push(where.seller_id);
      return where.seller_id === sellerA ? [publication('33333333-3333-4333-8333-333333333333')] : [];
    } },
  };
  const service = new PublicationsService(prisma, {}, {}, {}, {});
  const rows = await service.mine(sellerA);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'FINISHED');
  assert.equal(rows[0].current_stock, 0);
  assert.equal(JSON.stringify(rows).includes('phone'), false);
  assert.deepEqual(calls, [sellerA]);
  console.log('PASS proyección propia sin contacto');

  const moduleRef = await Test.createTestingModule({
    imports: [PassportModule], controllers: [PublicationsController],
    providers: [JwtStrategy, { provide: PrismaService, useValue: prisma }, { provide: PublicationsService, useValue: service }],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  console.log('PASS Nest inicializado');
  try {
    const jwt = new JwtService({ secret: process.env.JWT_SECRET });
    const tokenA = jwt.sign({ sub: sellerA }, { algorithm: 'HS256', expiresIn: '1h' });
    const tokenB = jwt.sign({ sub: sellerB }, { algorithm: 'HS256', expiresIn: '1h' });
    const own = await request(app.getHttpServer()).get('/publications/mine').set('Authorization', `Bearer ${tokenA}`);
    console.log('PASS petición propietario recibida', own.status);
    assert.equal(own.status, 200);
    assert.equal(own.body.length, 1);
    const other = await request(app.getHttpServer()).get('/publications/mine').set('Authorization', `Bearer ${tokenB}`);
    assert.equal(other.status, 200);
    assert.deepEqual(other.body, []);
    const anonymous = await request(app.getHttpServer()).get('/publications/mine');
    assert.equal(anonymous.status, 401);
    assert.deepEqual(calls.slice(1), [sellerA, sellerB]);
  } finally { await app.close(); }

  const reservations = Object.create(ReservationsService.prototype);
  const result = reservations.response({
    id: 'r1', publication_id: 'p1', buyer_id: sellerB, status: 'ACTIVE',
    reserved_at: new Date(), resolved_at: null, unit_price: { toFixed: () => '30.00' },
    publication: { title: 'Burrito & café', seller_id: sellerA, seller: { phone: '+526641234567' } },
    buyer: { id: sellerB, name: 'Luis', phone: '+525512345678' },
  }, sellerB);
  assert.equal(result.publicationTitle, 'Burrito & café');
  assert.equal(result.sellerContact.phone, '+526641234567');
  console.log('PASS: GET /publications/mine JWT/propiedad/estado terminal/sin teléfono; reserva incluye título autorizado');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
