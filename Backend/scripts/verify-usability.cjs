require('dotenv').config({ quiet: true });
require('ts-node/register');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma/client');
const { Test } = require('@nestjs/testing');
const { io } = require('../../Frontend/node_modules/socket.io-client');
const { seedDelivery } = require('../prisma/seed-delivery');
const { deliveryPeople } = require('../prisma/delivery-data');

const evidenceDir = resolve('../specs/0047-usabilidad-y-recogida/evidence');
mkdirSync(evidenceDir, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const tables = ['users', 'zones', 'categories', 'publications', 'reservations', 'reports'];
async function snapshot(client) {
  const data = {};
  for (const table of tables) data[table] = (await client.query(`SELECT to_jsonb(t) AS row FROM "${table}" t ORDER BY id`)).rows.map(r => r.row);
  return data;
}
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

(async () => {
  const originalUrl = process.env.DATABASE_URL;
  const originalPrefix = process.env.BULLMQ_PREFIX;
  const admin = new pg.Client({ connectionString: originalUrl });
  await admin.connect();
  const sourceBefore = await snapshot(admin);
  const database = `tapcampus_usability_${Date.now()}`;
  assert.match(database, /^tapcampus_usability_\d+$/);
  const ownUrl = new URL(originalUrl); assert.notEqual('/' + database, ownUrl.pathname);
  let app, prisma, sockets = [], redis, failure;
  const checks = [];
  const check = (name, detail = {}) => { checks.push({ name, ...detail }); console.log('PASS', name); };
  try {
    await admin.query(`CREATE DATABASE "${database}"`);
    ownUrl.pathname = '/' + database; process.env.DATABASE_URL = ownUrl.href;
    process.env.BULLMQ_PREFIX = database; process.env.RECONCILIATION_INTERVAL_MS = '100';
    process.env.UPLOADS_DIR = resolve('.local/verification', database, 'uploads');
    const migration = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { windowsHide: true, encoding: 'utf8', timeout: 120000 });
    assert.equal(migration.status, 0, migration.stdout + migration.stderr);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: ownUrl.href }) });
    const password = randomUUID() + 'Aa';
    await seedDelivery(prisma, { password, directory: process.env.UPLOADS_DIR });
    const { AppModule } = require('../dist/app.module');
    const { configureApp } = require('../dist/common/configure-app');
    const { QueueService, redisConnection } = require('../dist/jobs/queue.service');
    const { PublicationsService } = require('../dist/publications/publications.service');
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication({ logger: false }); configureApp(app); await app.listen(0, '127.0.0.1');
    const origin = await app.getUrl();
    let requests = 0;
    async function http(method, path, body, token, status = 200, key) {
      requests++;
      const r = await fetch(origin + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(key ? { 'Idempotency-Key': key } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      const result = await r.json(); assert.equal(r.status, status, `${method} ${path}: ${JSON.stringify(result)}`); return result;
    }
    const seller = (await http('POST', '/auth/login', { email: deliveryPeople[0].email, password })).access_token;
    const buyer = (await http('POST', '/auth/login', { email: deliveryPeople[4].email, password })).access_token;
    const otherBuyer = (await http('POST', '/auth/login', { email: deliveryPeople[5].email, password })).access_token;
    const events = [[], []];
    for (let i = 0; i < 2; i++) {
      const socket = io(origin, { transports: ['websocket'], reconnection: false, autoConnect: false }); sockets.push(socket);
      socket.onAny((event, payload) => events[i].push({ event, payload, at: Date.now() }));
      await new Promise((yes, no) => { socket.once('connect', yes); socket.once('connect_error', no); socket.connect(); });
    }
    async function received(event, id, after = 0, timeout = 3500) {
      const until = Date.now() + timeout;
      while (Date.now() < until) {
        const found = events.map(rows => rows.find(row => row.event === event && row.payload.publicationId === id && row.at >= after));
        if (found.every(Boolean)) return found;
        await sleep(20);
      }
      throw Error(`Falta ${event} en dos sockets: ${id}`);
    }
    const zones = await http('GET', '/zones'); const cats = await http('GET', '/categories');
    assert.equal(cats.length, 26); assert.equal(cats.filter(c => c.type === 'LIVE').length, 16); assert.equal(cats.filter(c => c.type === 'STATIC').length, 10);
    const image = (await prisma.publication.findFirstOrThrow()).image_url;
    const common = { title: 'Producto de prueba 0047', description: 'Entrega revisada dentro del campus.', price: 70, image_url: image, zone_id: zones[0].id };
    const live = (extra = {}) => ({ ...common, type: 'LIVE', category_id: cats.find(c => c.type === 'LIVE').id, initial_stock: 2, start_time: new Date(Date.now() - 60000).toISOString(), end_time: new Date(Date.now() + 600000).toISOString(), ...extra });
    const product = { ...common, type: 'STATIC', condition: 'USED', category_id: cats.find(c => c.type === 'STATIC').id };
    const at = Date.now();
    const arranged = await http('POST', '/publications', { ...product, pickup_mode: 'ARRANGED', zone_id: null }, seller, 201);
    const created = await received('publication_created', arranged.id, at);
    created.forEach(e => { assert.deepEqual(Object.keys(e.payload).sort(), ['publicationId', 'type']); assert(Date.now() - e.at < 2000); });
    assert.equal(arranged.pickup_mode, 'ARRANGED'); assert.equal(arranged.zone_id, null);
    const arrangedFeed = await http('GET', '/publications?type=STATIC&pickupMode=ARRANGED'); assert(arrangedFeed.some(p => p.id === arranged.id)); assert(arrangedFeed.every(p => p.zone_id === null));
    const zoneFeed = await http('GET', `/publications?type=STATIC&zoneId=${zones[0].id}`); assert(!zoneFeed.some(p => p.id === arranged.id));
    const oldClient = await http('POST', '/publications', product, seller, 201); assert.equal(oldClient.pickup_mode, 'SPECIFIC_ZONE');
    for (const body of [{ ...live(), pickup_mode: 'ARRANGED', zone_id: null }, { ...product, zone_id: null }, { ...product, pickup_mode: 'ARRANGED' }]) await http('POST', '/publications', body, seller, 400);
    await http('GET', '/publications?type=LIVE&pickupMode=ARRANGED', undefined, undefined, 400);
    await http('GET', `/publications?type=STATIC&pickupMode=ARRANGED&zoneId=${zones[0].id}`, undefined, undefined, 400);
    await http('PATCH', `/publications/${arranged.id}`, { title: 'Producto actualizado' }, seller); await received('publication_updated', arranged.id);
    assert.equal((await http('GET', `/publications/${arranged.id}`)).zone_id, null);
    await http('PATCH', `/publications/${arranged.id}`, { pickup_mode: 'SPECIFIC_ZONE' }, seller, 400);
    await http('PATCH', `/publications/${arranged.id}`, { pickup_mode: 'SPECIFIC_ZONE', zone_id: zones[1].id }, seller);
    check('26 categorías y contratos de ubicación, filtros y compatibilidad');
    check('creación y edición postcommit recibidas por dos clientes reales', { latenciesMs: created.map(e => e.at - at) });

    const p = await http('POST', '/publications', live({ initial_stock: 1 }), seller, 201);
    const key = randomUUID();
    const reservation = await http('POST', '/reservations', { publicationId: p.id }, buyer, 201, key);
    const retry = await http('POST', '/reservations', { publicationId: p.id }, buyer, 200, key); assert.equal(reservation.id, retry.id);
    assert.deepEqual(reservation.pickupLocation, { zoneId: zones[0].id, name: zones[0].name, source: 'SNAPSHOT' }); assert.equal(reservation.sellerName, deliveryPeople[0].name);
    await received('stock_updated', p.id); assert.equal((await http('GET', '/publications?type=LIVE')).some(row => row.id === p.id), false);
    await http('GET', `/publications/${p.id}`, undefined, undefined, 404);
    const mine = await http('GET', '/reservations/mine', undefined, buyer); assert.deepEqual(mine.find(r => r.id === reservation.id).pickupLocation, reservation.pickupLocation);
    assert.equal((await http('GET', `/reservations/${reservation.id}`, undefined, buyer)).unitPrice, '70.00');
    await http('PATCH', `/publications/${p.id}`, { zone_id: zones[1].id }, seller, 409);
    await http('POST', `/reservations/${reservation.id}/complete`, {}, buyer, 403);
    await http('POST', `/reservations/${reservation.id}/cancel`, {}, buyer);
    assert((await http('GET', '/publications?type=LIVE')).some(row => row.id === p.id));
    await http('PATCH', `/publications/${p.id}`, { zone_id: zones[1].id }, seller);
    assert.deepEqual((await http('GET', `/reservations/${reservation.id}`, undefined, buyer)).pickupLocation, reservation.pickupLocation);
    await prisma.reservation.update({ where: { id: reservation.id }, data: { pickup_zone_id: null, pickup_zone_name: null } });
    const legacy = await http('GET', `/reservations/${reservation.id}`, undefined, buyer); assert.equal(legacy.pickupLocation.source, 'LEGACY_CURRENT'); assert.equal(legacy.pickupLocation.name, zones[1].name);
    await http('GET', `/reservations/${reservation.id}`, undefined, otherBuyer, 403);
    check('recogida independiente del feed, idempotencia, privacidad, stock cero y retorno válido');
    check('bloqueo de cambio de zona y fallback histórico explícito');
    for (let i = 0; i < 8; i++) {
      const race = await http('POST', '/publications', live(), seller, 201);
      const [edit, booking] = await Promise.all([
        fetch(origin + `/publications/${race.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${seller}` }, body: JSON.stringify({ zone_id: zones[1].id }) }),
        fetch(origin + '/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${otherBuyer}`, 'Idempotency-Key': randomUUID() }, body: JSON.stringify({ publicationId: race.id }) }),
      ]); requests += 2;
      assert.equal(booking.status, 201); const row = await booking.json(); assert([200,409].includes(edit.status)); assert.equal(row.pickupLocation.zoneId, zones[edit.status === 200 ? 1 : 0].id);
    }
    check('ocho carreras reserva/cambio de zona conservan la promesa');

    const futureStart = Date.now() + 1600;
    const future = await http('POST', '/publications', live({ start_time: new Date(futureStart).toISOString() }), seller, 201);
    assert(!(await http('GET', '/publications?type=LIVE')).some(row => row.id === future.id));
    const starts = await received('publication_available', future.id, futureStart, 4000);
    assert(starts.every(e => e.at - futureStart < 2000));
    assert((await http('GET', '/publications?type=LIVE')).some(row => row.id === future.id));
    await sleep(350); assert(events.every(rows => rows.filter(e => e.event === 'publication_available' && e.payload.publicationId === future.id).length === 1));
    const oldStart = Date.now() + 900;
    const moved = await http('POST', '/publications', live({ start_time: new Date(oldStart).toISOString() }), seller, 201);
    const newStart = Date.now() + 2300;
    await http('PATCH', `/publications/${moved.id}`, { start_time: new Date(newStart).toISOString() }, seller);
    await sleep(Math.max(0, oldStart + 250 - Date.now()));
    assert(events.every(rows => !rows.some(e => e.event === 'publication_available' && e.payload.publicationId === moved.id)));
    await received('publication_available', moved.id, newStart);
    const queue = app.get(QueueService); await queue.publications.pause();
    const recoveredAt = Date.now() + 750;
    const recovered = await http('POST', '/publications', live({ start_time: new Date(recoveredAt).toISOString() }), seller, 201);
    await received('publication_available', recovered.id, recoveredAt);
    await queue.publications.resume();
    const service = app.get(PublicationsService); assert.equal(await service.available(recovered.id), false);
    check('inicio durable, trabajo obsoleto y conciliación sin eventos duplicados', { startLatenciesMs: starts.map(e => e.at - futureStart) });
    const sourceAfter = await snapshot(admin); assert.equal(digest(sourceAfter), digest(sourceBefore));
    check('base original intacta', { tables: tables.length, sha256: digest(sourceAfter) });
    writeFileSync(resolve(evidenceDir, 'contracts-and-sockets.json'), JSON.stringify({ date: new Date().toISOString(), result: 'PASS', requests, checks, environment: { node: process.version, sockets: 2, database: 'isolated', mobile: false } }, null, 2));
  } catch (error) { failure = error; }
  finally {
    sockets.forEach(s => s.disconnect());
    if (app) await app.close(); if (prisma) await prisma.$disconnect();
    // Delete only keys in the unique namespace owned by this run.
    if (app) {
      const Redis = require('ioredis'); const { redisConnection } = require('../dist/jobs/queue.service');
      redis = new Redis({ ...redisConnection(), lazyConnect: true }); await redis.connect();
      let cursor = '0'; do { const page = await redis.scan(cursor, 'MATCH', `${database}:*`, 'COUNT', 500); cursor = page[0]; if (page[1].length) { assert(page[1].every(k => k.startsWith(database + ':'))); await redis.del(...page[1]); } } while (cursor !== '0'); await redis.quit();
    }
    assert.match(database, /^tapcampus_usability_\d+$/); await admin.query(`DROP DATABASE IF EXISTS "${database}"`); await admin.end();
    process.env.DATABASE_URL = originalUrl; process.env.BULLMQ_PREFIX = originalPrefix;
  }
  if (failure) throw failure;
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
