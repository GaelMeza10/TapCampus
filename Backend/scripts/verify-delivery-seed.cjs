require('dotenv/config');
require('ts-node/register');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma/client');
const { seedDelivery } = require('../prisma/seed-delivery');
const { deliveryId, deliveryPeople, deliveryProducts } = require('../prisma/delivery-data');
const { categoryNames } = require('../prisma/catalogs');
const categoryCount = categoryNames.LIVE.length + categoryNames.STATIC.length;
const apply = process.argv.includes('--apply-local');
const evidenceDir = resolve('../specs/0047-usabilidad-y-recogida/evidence');
mkdirSync(evidenceDir, { recursive: true });
const tables = ['users', 'zones', 'categories', 'publications', 'reservations', 'reports'];
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function snapshot(client) {
  const rows = {};
  for (const table of tables) rows[table] = (await client.query(`SELECT to_jsonb(t) AS data FROM "${table}" t ORDER BY id`)).rows.map(r => r.data);
  return rows;
}
function preserved(before, after) {
  const summary = {};
  for (const table of tables) {
    const ids = new Set(before[table].map(r => r.id));
    const originals = after[table].filter(r => ids.has(r.id));
    assert.deepEqual(originals, before[table], `Se modificaron filas originales de ${table}`);
    summary[table] = { before: before[table].length, after: after[table].length, originalHash: digest(before[table]), preserved: true };
  }
  return summary;
}
async function apiChecks(password) {
  const { Test } = require('@nestjs/testing');
  const request = require('supertest');
  const { AppModule } = require('../dist/app.module');
  const { configureApp } = require('../dist/common/configure-app');
  const { JobsService } = require('../dist/jobs/jobs.service');
  const { QueueService } = require('../dist/jobs/queue.service');
  const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(JobsService).useValue({}).overrideProvider(QueueService).useValue({}).compile();
  const app = module.createNestApplication({ logger: false }); configureApp(app);
  try {
    await app.init(); const http = request(app.getHttpServer());
    const login = await http.post('/auth/login').send({ email: deliveryPeople[4].email, password }).expect(200);
    const token = login.body.access_token; assert(token);
    const categories = await http.get('/categories').expect(200); assert.equal(categories.body.length, categoryCount);
    const zones = await http.get('/zones').expect(200); assert.equal(zones.body.length, 5);
    const counts = {};
    for (const type of ['LIVE', 'STATIC']) {
      const feed = await http.get(`/publications?type=${type}`).expect(200);
      const rows = feed.body.filter(p => p.id.startsWith('46100000-'));
      assert(rows.length >= 17, 'El feed de entrega no tiene suficientes ejemplos visibles');
      assert(rows.every(p => !p.sellerContact && !p.buyerContact)); counts[type] = rows.length;
      const image = await http.get(rows[0].image_url).expect(200); assert.match(image.headers['content-type'], /image\/png/);
    }
    const mine = await http.get('/reservations/mine').auth(token, { type: 'bearer' }).expect(200);
    if (!apply) assert(mine.body.some(r => r.status === 'ACTIVE'));
    assert(mine.body.some(r => r.status === 'COMPLETED'));
    const sellerLogin = await http.post('/auth/login').send({ email: deliveryPeople[0].email, password }).expect(200);
    const sales = await http.get('/publications/mine').auth(sellerLogin.body.access_token, { type: 'bearer' }).expect(200);
    assert.equal(sales.body.filter(p => p.id.startsWith('46100000-')).length, deliveryProducts.filter((_, i) => i % 4 === 0).length);
    const deliveries = await http.get(`/publications/${deliveryId('publication', 0)}/reservations`).auth(sellerLogin.body.access_token, { type: 'bearer' }).expect(200);
    assert.equal(deliveries.body.length, 4);
    return { login: true, categories: categoryCount, zones: 5, visibleDeliveryFeed: counts, buyerReservations: mine.body.length, sellerPublications: deliveryProducts.filter((_, i) => i % 4 === 0).length, sellerReservationStates: deliveries.body.map(r => r.status), png: true, publicContactsAbsent: true };
  } finally { await app.close(); }
}

(async () => {
  const originalUrl = process.env.DATABASE_URL;
  const source = new URL(originalUrl);
  const admin = new pg.Client({ connectionString: originalUrl, connectionTimeoutMillis: 5000 });
  await admin.connect();
  let db, prisma, ownName;
  const result = { date: new Date().toISOString(), mode: apply ? 'local' : 'isolated', checks: [] };
  try {
    const originalBefore = await snapshot(admin);
    if (apply) {
      for (let i = 0; i < 2; i++) {
        const run = spawnSync(process.execPath, ['-r', 'ts-node/register', 'scripts/seed-delivery.ts'], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
        assert.equal(run.status, 0, run.stderr); result.checks.push(JSON.parse(run.stdout));
      }
      assert.deepEqual(result.checks[1].created, { users: 0, publications: 0, reservations: 0 });
      const access = JSON.parse(readFileSync('.local/demo-access.json', 'utf8'));
      result.api = await apiChecks(access.password);
      result.preservation = preserved(originalBefore, await snapshot(admin));
    } else {
      ownName = `tapcampus_delivery_${Date.now()}`; assert.match(ownName, /^tapcampus_delivery_\d+$/);
      assert.notEqual('/' + ownName, source.pathname);
      await admin.query(`CREATE DATABASE "${ownName}"`);
      source.pathname = '/' + ownName; process.env.DATABASE_URL = source.href;
      const migration = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { encoding: 'utf8', windowsHide: true, timeout: 120000 });
      assert.equal(migration.status, 0, migration.stdout + migration.stderr);
      const directory = resolve('.local/verification', ownName, 'uploads'); process.env.UPLOADS_DIR = directory;
      prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: source.href }) });
      db = new pg.Client({ connectionString: source.href }); await db.connect();
      const password = randomUUID() + 'Aa';
      const first = await seedDelivery(prisma, { password, directory });
      assert.deepEqual(first.created, { users: 6, publications: deliveryProducts.length, reservations: 24 });
      const before = await snapshot(db);
      const second = await seedDelivery(prisma, { password, directory });
      assert.deepEqual(second.created, { users: 0, publications: 0, reservations: 0 });
      assert.deepEqual(await snapshot(db), before);
      await prisma.publication.update({ where: { id: deliveryId('publication', 0) }, data: { title: 'Torta con descripción editada durante la prueba', current_stock: { decrement: 1 } } });
      const edited = await snapshot(db); await seedDelivery(prisma, { password, directory }); assert.deepEqual(await snapshot(db), edited);
      await assert.rejects(seedDelivery(prisma, { password: 'otra-password-no-reset', directory }), /otra contraseña/);
      assert.deepEqual(await snapshot(db), edited);
      const person = deliveryPeople[0];
      await prisma.user.update({ where: { id: person.id }, data: { email: 'conflicto.fixture@uabc.edu.mx' } });
      const conflict = await snapshot(db); await assert.rejects(seedDelivery(prisma, { password, directory }), /Conflicto de identidad/); assert.deepEqual(await snapshot(db), conflict);
      await prisma.user.update({ where: { id: person.id }, data: { email: person.email } });
      result.checks.push({ initial: first.created, repeated: second.created, unchangedOnRepeat: true, editsPreserved: true, passwordNotReset: true, identityConflictAtomic: true });
      result.api = await apiChecks(password);
      result.preservation = preserved(originalBefore, await snapshot(admin));
    }
    result.result = 'PASS';
    writeFileSync(resolve(evidenceDir, apply ? 'local-seed.json' : 'isolated-seed.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ mode: result.mode, result: 'PASS', api: result.api }));
  } finally {
    if (prisma) await prisma.$disconnect(); if (db) await db.end();
    if (ownName) { assert.match(ownName, /^tapcampus_delivery_\d+$/); await admin.query(`DROP DATABASE "${ownName}"`); }
    process.env.DATABASE_URL = originalUrl; await admin.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
