import 'dotenv/config';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { JwtService } from '@nestjs/jwt';
import { Queue } from 'bullmq';
import { io } from 'socket.io-client';
import Redis from 'ioredis';
import { inventory } from './db-inventory.mjs';

// Prisma almacena timestamp without time zone como UTC; pg usa la zona local por defecto.
pg.types.setTypeParser(
  1114,
  (value) => new Date(value.replace(' ', 'T') + 'Z'),
);

// PostgreSQL original solo se lee. Redis usa un prefix exclusivo, nunca FLUSHDB.
const source = new URL(process.env.DATABASE_URL);
const name = `tapcampus_phase3_${Date.now()}`;
assert.match(name, /^tapcampus_phase3_\d+$/);
const testUrl = new URL(source);
testUrl.pathname = `/${name}`;
const artifacts = resolve('.local/verification', name);
mkdirSync(artifacts, { recursive: true });
const evidence = {
  date: new Date().toISOString(),
  node: process.version,
  database: name,
  redisPrefix: name,
  requests: 0,
  checks: [],
};
const admin = new pg.Client({ connectionString: source.href });
const db = new pg.Client({ connectionString: testUrl.href });
const secret = 'isolated-phase3-jwt-fixture-secret';
const jwt = new JwtService({ secret });
const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  db: Number(redisUrl.pathname.slice(1) || 0),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
};
const queues = Object.fromEntries(
  ['reservation', 'publication', 'ganga'].map((n) => [
    n,
    new Queue(`${n}_queue`, { connection, prefix: name }),
  ]),
);
const events = [[], []];
const sockets = [];
let backend, base, owner, buyer, other, common, liveCategory, staticCategory;
let dbConnected = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function pass(name, details = {}) {
  evidence.checks.push({ name, result: 'PASS', ...details });
  console.log('PASS', name);
}
async function until(fn, message, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await sleep(30);
  }
  throw new Error(`Timeout: ${message}`);
}
function command(args) {
  const r = spawnSync(process.execPath, args, {
    env: { ...process.env, DATABASE_URL: testUrl.href },
    encoding: 'utf8',
    timeout: 120000,
  });
  assert.equal(r.status, 0, r.error?.message ?? r.stdout + r.stderr);
}
async function start(interval = 600000) {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise((r) => listener.close(r));
  const env = {
    ...process.env,
    DATABASE_URL: testUrl.href,
    REDIS_URL: redisUrl.href,
    JWT_SECRET: secret,
    PORT: String(port),
    UPLOADS_DIR: resolve(artifacts, 'uploads'),
    BULLMQ_PREFIX: name,
    RECONCILIATION_INTERVAL_MS: String(interval),
  };
  delete env.PUBLIC_BASE_URL;
  backend = spawn(process.execPath, ['dist/main.js'], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  backend.stdout.on('data', (d) => {
    output += d;
  });
  backend.stderr.on('data', (d) => {
    output += d;
  });
  base = `http://127.0.0.1:${port}`;
  if (common) common.image_url = new URL(common.image_url, base).pathname;
  await until(
    async () => {
      if (backend.exitCode !== null)
        throw new Error(`Backend no arrancó: ${output}`);
      try {
        return (await fetch(base)).status === 200;
      } catch {
        return false;
      }
    },
    'arranque backend',
    60000,
  );
  backend.on('exit', () =>
    writeFileSync(resolve(artifacts, `backend-${port}.log`), output),
  );
}
async function stop() {
  for (const socket of sockets.splice(0)) socket.disconnect();
  const child = backend;
  backend = undefined;
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
}
async function connectSockets() {
  for (let index = 0; index < 2; index++) {
    const s = io(base, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: false,
    });
    sockets.push(s);
    for (const event of [
      'stock_updated',
      'publication_expired',
      'ganga_activated',
    ])
      s.on(event, (data) => events[index].push({ event, data }));
    const connected = once(s, 'connect');
    s.connect();
    await connected;
  }
  await sleep(50);
}
function matching(index, event, id) {
  return events[index].filter(
    (e) => e.event === event && e.data.publicationId === id,
  );
}
async function eventCount(event, id, count, payload) {
  await until(
    () => [0, 1].every((i) => matching(i, event, id).length >= count),
    `${event} en ambos clientes`,
  );
  for (let i = 0; i < 2; i++) {
    const all = matching(i, event, id);
    assert.equal(all.length, count, `${event}: transición duplicada`);
    if (payload) assert.deepEqual(all.at(-1).data, payload);
  }
}
async function http(
  path,
  { method = 'GET', body, token, expected = 200, headers = {} } = {},
) {
  evidence.requests++;
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (expected !== null)
    assert.equal(
      response.status,
      expected,
      `${method} ${path}: ${JSON.stringify(data)}`,
    );
  if (response.status >= 400) {
    assert.equal(data.statusCode, response.status);
    assert(data.error && data.message);
  }
  return expected === null ? { status: response.status, data } : data;
}
const post = (path, body, token, expected = 201, headers = {}) =>
  http(path, { method: 'POST', body, token, expected, headers });
const patch = (id, body, token = owner.token, expected = 200) =>
  http(`/publications/${id}`, { method: 'PATCH', body, token, expected });
const reserve = (id, key = randomUUID(), token = buyer.token, expected = 201) =>
  post('/reservations', { publicationId: id }, token, expected, {
    'Idempotency-Key': key,
  });
const action = (id, verb, token, expected = 200) =>
  post(`/reservations/${id}/${verb}`, {}, token, expected);
const ganga = (id, token = owner.token, expected = 200) =>
  http(`/publications/${id}/ganga`, {
    method: 'PATCH',
    body: {},
    token,
    expected,
  });
const finish = (id, token = owner.token, expected = 200) =>
  post(`/publications/${id}/finish`, {}, token, expected);
const rows = async (sql, values = []) => (await db.query(sql, values)).rows;
const pub = async (id) =>
  (await rows('SELECT * FROM publications WHERE id=$1', [id]))[0];
const res = async (id) =>
  (await rows('SELECT * FROM reservations WHERE id=$1', [id]))[0];
const live = (stock = 3, extra = {}) =>
  post(
    '/publications',
    {
      ...common,
      type: 'LIVE',
      category_id: liveCategory,
      initial_stock: stock,
      start_time: new Date(Date.now() - 60000).toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      ...extra,
    },
    owner.token,
  );
async function person(index) {
  const id = randomUUID();
  await db.query(
    'INSERT INTO users (id,email,password_hash,name,phone) VALUES ($1,$2,$3,$4,$5)',
    [
      id,
      `fixture${index}@uabc.edu.mx`,
      'synthetic-hash-not-used-for-login',
      `Fixture ${index}`,
      '+525512345678',
    ],
  );
  return { id, token: jwt.sign({ sub: id }, { expiresIn: '1h' }) };
}
async function addJob(queue, data, delay = 0) {
  const job = await queues[queue].add('fixture', data, {
    jobId: randomUUID(),
    delay,
    removeOnComplete: false,
  });
  if (!delay)
    await until(
      async () => ['completed', 'failed'].includes(await job.getState()),
      'job consumido',
    );
  return job;
}
async function assertJob(job) {
  await until(
    async () => ['completed', 'failed'].includes(await job.getState()),
    'job pendiente procesado',
  );
  assert.equal(
    await job.getState(),
    'completed',
    (await job.toJSON()).failedReason,
  );
}
function assertPublic(data) {
  assert(
    !/phone|password|email|Contact/i.test(JSON.stringify(data)),
    'contacto en canal público',
  );
}

try {
  await admin.connect();
  evidence.postgres = (
    await admin.query('SHOW server_version')
  ).rows[0].server_version;
  evidence.originalBefore = (await inventory(admin)).tables;
  await admin.query(`CREATE DATABASE "${name}"`);
  await db.connect();
  dbConnected = true;
  command(['node_modules/prisma/build/index.js', 'migrate', 'deploy']);
  command(['node_modules/prisma/build/index.js', 'db', 'seed']);
  await Promise.all(Object.values(queues).map((q) => q.waitUntilReady()));
  const probe = new Redis(redisUrl.href);
  try {
    evidence.redis = (await probe.info('server')).match(
      /redis_version:([^\r\n]+)/,
    )[1];
  } finally {
    probe.disconnect();
  }
  await start();
  await connectSockets();
  const registered = await post('/auth/register', {
    name: 'Vendedor',
    email: 'seller@uabc.edu.mx',
    password: 'fixture-password',
    phone: '6641234567',
  });
  owner = {
    token: registered.access_token,
    id: jwt.verify(registered.access_token).sub,
  };
  buyer = await person(1);
  other = await person(2);
  const zones = await http('/zones');
  liveCategory = (await http('/categories?type=LIVE'))[0].id;
  staticCategory = (await http('/categories?type=STATIC'))[0].id;
  const form = new FormData();
  form.append(
    'file',
    new Blob(
      [
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1sAAAAASUVORK5CYII=',
          'base64',
        ),
      ],
      { type: 'image/png' },
    ),
    'fixture.png',
  );
  const uploaded = await fetch(base + '/uploads', {
    method: 'POST',
    headers: { Authorization: `Bearer ${owner.token}` },
    body: form,
  });
  assert.equal(uploaded.status, 201);
  common = {
    title: 'Torta & café / ñ',
    description: 'Fixture fase 3',
    price: 12.5,
    image_url: (await uploaded.json()).image_url,
    zone_id: zones[0].id,
  };

  const p = await live(3);
  const key = randomUUID();
  for (const token of [
    null,
    'invalid',
    jwt.sign({ sub: buyer.id }, { expiresIn: -1 }),
  ]) {
    await reserve(p.id, key, token, 401);
    await http('/reservations/mine', { token, expected: 401 });
  }
  await post('/reservations', { publicationId: p.id }, buyer.token, 400);
  await reserve(p.id, 'invalid', buyer.token, 400);
  await post(
    '/reservations',
    { publicationId: p.id, unitPrice: 1 },
    buyer.token,
    400,
    { 'Idempotency-Key': key },
  );
  await reserve('invalid', key, buyer.token, 400);
  await reserve(randomUUID(), key, buyer.token, 404);
  const r1 = await reserve(p.id, key);
  assert.equal(r1.unitPrice, '12.50');
  assert.equal(r1.status, 'ACTIVE');
  assert.equal(Date.parse(r1.expiresAt) - Date.parse(r1.reservedAt), 1200000);
  assert.deepEqual(r1.sellerContact, { phone: '+526641234567' });
  assert.equal((await pub(p.id)).current_stock, 2);
  await eventCount('stock_updated', p.id, 1, {
    publicationId: p.id,
    newStock: 2,
  });
  assert.equal(
    (await queues.reservation.getJob(r1.id)).data.reservationId,
    r1.id,
  );
  const delayed = await queues.reservation.getJob(r1.id);
  assert.equal(await delayed.getState(), 'delayed');
  assert(
    Math.abs(delayed.timestamp + delayed.delay - Date.parse(r1.expiresAt)) <
      1000,
  );
  const sellerDetail = await http(`/reservations/${r1.id}`, {
    token: owner.token,
  });
  assert.deepEqual(sellerDetail.buyerContact, { phone: '+525512345678' });
  assert(!sellerDetail.sellerContact);
  for (const path of [
    `/reservations/${r1.id}`,
    `/publications/${p.id}/reservations`,
  ]) {
    await http(path, { token: other.token, expected: 403 });
    await http(path, { expected: 401 });
  }
  await http(`/reservations/${randomUUID()}`, {
    token: buyer.token,
    expected: 404,
  });
  await http('/reservations/invalid', { token: buyer.token, expected: 400 });
  await http(`/publications/${randomUUID()}/reservations`, {
    token: owner.token,
    expected: 404,
  });
  const r2 = await reserve(p.id);
  await patch(p.id, { price: 13.75 });
  assert.equal(
    (await http(`/reservations/${r1.id}`, { token: buyer.token })).unitPrice,
    '12.50',
  );
  const mine = await http('/reservations/mine', { token: buyer.token });
  const listed = await http(`/publications/${p.id}/reservations`, {
    token: owner.token,
  });
  assert.equal(mine.filter((r) => r.publicationId === p.id).length, 2);
  assert.equal(listed.length, 2);
  assert.notEqual(r1.id, r2.id);
  assert.equal(
    (await reserve(p.id.toUpperCase(), key.toUpperCase(), buyer.token, 200)).id,
    r1.id,
  );
  await reserve((await live()).id, key, buyer.token, 409);
  assertPublic(await http('/publications'));
  assertPublic(await http(`/publications/${p.id}`));
  pass(
    'reservas EV-01/09: JWT, DTO, 20 minutos, precio fijo, múltiples acciones, consultas y privacidad',
  );

  const unavailable = [
    await post(
      '/publications',
      { ...common, type: 'STATIC', category_id: staticCategory },
      owner.token,
    ),
    await live(),
    await live(),
    await live(),
    await live(),
  ];
  await finish(unavailable[1].id);
  await db.query(
    "UPDATE publications SET end_time=now()-interval '1 second' WHERE id=$1",
    [unavailable[2].id],
  );
  await patch(unavailable[3].id, {
    start_time: new Date(Date.now() + 60000).toISOString(),
  });
  await patch(unavailable[4].id, { current_stock: 0 });
  for (const item of unavailable) {
    const before = await pub(item.id);
    await reserve(item.id, randomUUID(), buyer.token, 409);
    assert.deepEqual(await pub(item.id), before);
  }
  pass(
    'reservas EV-03: STATIC, FINISHED, fuera de horario y sin stock ->409 sin mutación',
  );

  const contenders = [];
  for (let i = 0; i < 50; i++) contenders.push(await person(100 + i));
  const last = await live(1);
  const outcomes = await Promise.all(
    contenders.map((u) => reserve(last.id, randomUUID(), u.token, null)),
  );
  const counts = outcomes.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(counts, { 201: 1, 409: 49 });
  assert.equal((await pub(last.id)).current_stock, 0);
  assert.equal(
    (
      await rows('SELECT count(*) FROM reservations WHERE publication_id=$1', [
        last.id,
      ])
    )[0].count,
    '1',
  );
  await eventCount('stock_updated', last.id, 1, {
    publicationId: last.id,
    newStock: 0,
  });
  pass(
    'reservas EV-02: 50 compradores/claves distintas, exactamente 1x201 / 49x409',
    { counts },
  );
  const same = await live(1);
  const sameKey = randomUUID();
  const retries = await Promise.all(
    Array.from({ length: 50 }, () =>
      reserve(same.id, sameKey, buyer.token, null),
    ),
  );
  assert.equal(retries.filter((r) => r.status === 201).length, 1);
  assert.equal(retries.filter((r) => r.status === 200).length, 49);
  assert.equal(new Set(retries.map((r) => r.data.id)).size, 1);
  assert.equal((await pub(same.id)).current_stock, 0);
  await eventCount('stock_updated', same.id, 1);
  const cross = await Promise.all([live(1), live(1)]);
  const crossKey = randomUUID();
  const crossRetries = await Promise.all(
    cross.map((p) => reserve(p.id, crossKey, buyer.token, null)),
  );
  assert.deepEqual(crossRetries.map((r) => r.status).sort(), [201, 409]);
  assert.equal(
    (await pub(cross[0].id)).current_stock +
      (await pub(cross[1].id)).current_stock,
    1,
  );
  pass(
    'reservas EV-09: 50 reintentos misma clave = 1x201/49x200, ID único; clave cruzada simultánea 201/409',
  );

  await action(r1.id, 'complete', buyer.token, 403);
  await action(r1.id, 'cancel', owner.token, 403);
  await action(r1.id, 'complete', other.token, 403);
  await action(r1.id, 'cancel', other.token, 403);
  const completed = await action(r1.id, 'complete', owner.token);
  assert.equal(completed.status, 'COMPLETED');
  assert(!completed.buyerContact);
  assert.equal((await pub(p.id)).current_stock, 1);
  await action(r1.id, 'complete', owner.token, 409);
  await action(r1.id, 'cancel', buyer.token, 409);
  await assertJob(await addJob('reservation', { reservationId: r1.id }));
  assert.equal(
    (await reserve(p.id, key, buyer.token, 200)).status,
    'COMPLETED',
  );
  const cancelled = await action(r2.id, 'cancel', buyer.token);
  assert.equal(cancelled.status, 'CANCELLED');
  assert.equal((await pub(p.id)).current_stock, 2);
  await action(r2.id, 'cancel', buyer.token, 409);
  await action(r2.id, 'complete', owner.token, 409);
  await assertJob(await addJob('reservation', { reservationId: r2.id }));
  assert.equal((await pub(p.id)).current_stock, 2);
  pass(
    'reservas EV-04/05: solo vendedor completa, solo comprador cancela, terminales 409, jobs atrasados no cambian stock',
  );

  const visible = await live(1);
  const visibleR = await reserve(visible.id);
  assert(!(await http('/publications')).some((p) => p.id === visible.id));
  await action(visibleR.id, 'cancel', buyer.token);
  assert((await http('/publications')).some((p) => p.id === visible.id));
  const manualClose = await live(2);
  const prior = await reserve(manualClose.id);
  await finish(manualClose.id, other.token, 403);
  await finish(manualClose.id, null, 401);
  await finish(manualClose.id);
  await finish(manualClose.id, owner.token, 409);
  await reserve(manualClose.id, randomUUID(), buyer.token, 409);
  await action(prior.id, 'complete', owner.token);
  await eventCount('publication_expired', manualClose.id, 1, {
    publicationId: manualClose.id,
  });
  const timed = await live(3);
  const priorTimed = await reserve(timed.id);
  const toExpire = await reserve(timed.id);
  await db.query(
    "UPDATE publications SET end_time=now()-interval '1 second' WHERE id=$1",
    [timed.id],
  );
  const endAt = (await pub(timed.id)).end_time.getTime();
  await assertJob(
    await addJob('publication', { publicationId: timed.id, expectedAt: endAt }),
  );
  assert.equal((await pub(timed.id)).status, 'FINISHED');
  await eventCount('publication_expired', timed.id, 1, {
    publicationId: timed.id,
  });
  await assertJob(
    await addJob('publication', { publicationId: timed.id, expectedAt: endAt }),
  );
  await action(priorTimed.id, 'complete', owner.token);
  await reserve(timed.id, randomUUID(), buyer.token, 409);
  await db.query(
    "UPDATE reservations SET reserved_at=now()-interval '21 minutes' WHERE id=$1",
    [toExpire.id],
  );
  await assertJob(await addJob('reservation', { reservationId: toExpire.id }));
  assert.equal((await res(toExpire.id)).status, 'EXPIRED');
  assert.equal((await pub(timed.id)).current_stock, 2);
  assert(!(await http('/publications')).some((p) => p.id === timed.id));
  pass(
    'publicaciones EV-04/07, reservas EV-07/08: cierre/fin únicos, confirma tras end_time, libera sin reactivar FINISHED',
  );

  const early = await live(1);
  const earlyR = await reserve(early.id);
  await assertJob(await addJob('reservation', { reservationId: earlyR.id }));
  assert.equal((await res(earlyR.id)).status, 'ACTIVE');
  assert.equal((await pub(early.id)).current_stock, 0);
  await db.query(
    "UPDATE reservations SET reserved_at=now()-interval '21 minutes' WHERE id=$1",
    [earlyR.id],
  );
  await action(earlyR.id, 'complete', owner.token, 409);
  await action(earlyR.id, 'cancel', buyer.token, 409);
  assert(
    !(await http(`/reservations/${earlyR.id}`, { token: owner.token }))
      .buyerContact,
  );
  await assertJob(await addJob('reservation', { reservationId: earlyR.id }));
  await assertJob(await addJob('reservation', { reservationId: earlyR.id }));
  assert.equal((await res(earlyR.id)).status, 'EXPIRED');
  assert.equal((await pub(early.id)).current_stock, 1);
  await eventCount('stock_updated', early.id, 2, {
    publicationId: early.id,
    newStock: 1,
  });
  assert((await http('/publications')).some((p) => p.id === early.id));
  await action(earlyR.id, 'complete', owner.token, 409);
  await action(earlyR.id, 'cancel', buyer.token, 409);
  pass(
    'reservas EV-06/08: job temprano no actúa, plazo vencido rechaza acciones, expiración y duplicado liberan una vez',
  );

  const raceSummary = [];
  for (const expired of [false, true]) {
    for (let i = 0; i < 5; i++) {
      const race = await live(1);
      const rr = await reserve(race.id);
      if (expired)
        await db.query(
          "UPDATE reservations SET reserved_at=now()-interval '21 minutes' WHERE id=$1",
          [rr.id],
        );
      const [complete, cancel, job] = await Promise.all([
        action(rr.id, 'complete', owner.token, null),
        action(rr.id, 'cancel', buyer.token, null),
        addJob('reservation', { reservationId: rr.id }),
      ]);
      await assertJob(job);
      const final = await res(rr.id);
      const stock = (await pub(race.id)).current_stock;
      if (expired) {
        assert.equal(final.status, 'EXPIRED');
        assert.equal(complete.status, 409);
        assert.equal(cancel.status, 409);
        assert.equal(stock, 1);
      } else {
        assert(['COMPLETED', 'CANCELLED'].includes(final.status));
        assert.deepEqual([complete.status, cancel.status].sort(), [200, 409]);
        assert.equal(stock, final.status === 'COMPLETED' ? 0 : 1);
      }
      await assertJob(await addJob('reservation', { reservationId: rr.id }));
      assert.equal((await pub(race.id)).current_stock, stock);
      raceSummary.push({
        expired,
        final: final.status,
        stock,
        complete: complete.status,
        cancel: cancel.status,
      });
    }
  }
  pass(
    'reservas EV-04/05/06: 10 carreras confirmación/cancelación/worker, transición única e inventario conservado',
    { races: raceSummary },
  );
  const physicalResults = [];
  for (let i = 0; i < 10; i++) {
    const race = await live(1);
    const [reservation, physical] = await Promise.all([
      reserve(race.id, randomUUID(), buyer.token, null),
      post(`/publications/${race.id}/physical-sale`, {}, owner.token, null),
    ]);
    assert([201, 409].includes(reservation.status));
    assert.equal(physical.status, reservation.status === 201 ? 409 : 200);
    assert.equal((await pub(race.id)).current_stock, 0);
    await eventCount('stock_updated', race.id, 1);
    physicalResults.push({
      reservation: reservation.status,
      physical: physical.status,
    });
  }
  pass(
    'publicaciones EV-05: 10 carreras HTTP reserva/venta física por stock 1, un solo ganador',
    { races: physicalResults },
  );

  const locked = await live(1);
  const locker = new pg.Client({ connectionString: testUrl.href });
  await locker.connect();
  try {
    await locker.query('BEGIN');
    await locker.query('SELECT id FROM publications WHERE id=$1 FOR UPDATE', [
      locked.id,
    ]);
    const waiting = reserve(locked.id, randomUUID(), buyer.token, null);
    await sleep(150);
    assert.equal(matching(0, 'stock_updated', locked.id).length, 0);
    await locker.query('UPDATE publications SET current_stock=0 WHERE id=$1', [
      locked.id,
    ]);
    await locker.query('COMMIT');
    assert.equal((await waiting).status, 409);
    assert.equal(matching(0, 'stock_updated', locked.id).length, 0);

    const deadline = await live(1);
    const deadlineR = await reserve(deadline.id);
    await db.query(
      "UPDATE reservations SET reserved_at=now()-interval '19 minutes 58 seconds' WHERE id=$1",
      [deadlineR.id],
    );
    await locker.query('BEGIN');
    await locker.query('SELECT id FROM publications WHERE id=$1 FOR UPDATE', [
      deadline.id,
    ]);
    const completing = action(deadlineR.id, 'complete', owner.token, null);
    const cancelling = action(deadlineR.id, 'cancel', buyer.token, null);
    const expiring = queues.reservation.add(
      'fixture',
      { reservationId: deadlineR.id },
      { jobId: randomUUID(), delay: 2100, removeOnComplete: false },
    );
    await sleep(2400);
    await locker.query('COMMIT');
    assert.equal((await completing).status, 409);
    assert.equal((await cancelling).status, 409);
    await assertJob(await expiring);
    assert.equal((await res(deadlineR.id)).status, 'EXPIRED');
    assert.equal((await pub(deadline.id)).current_stock, 1);
    await eventCount('stock_updated', deadline.id, 2);
  } finally {
    await locker.query('ROLLBACK');
    await locker.end();
  }
  pass(
    'reservas EV-02/04/05/06, sockets EV-05: bloqueo real, sin evento antes del commit, plazo releído tras espera',
  );

  const manual = await live(3, {
    ganga_min_price: 9.25,
    ganga_activation_mode: 'MANUAL',
  });
  const beforeGanga = await reserve(manual.id);
  assert.equal(manual.price, '12.50');
  assert.equal(manual.price_before_ganga, null);
  assert.equal(manual.is_ganga_active, false);
  await ganga(manual.id, other.token, 403);
  await ganga(manual.id, null, 401);
  await ganga(randomUUID(), owner.token, 404);
  await ganga('invalid', owner.token, 400);
  const active = await ganga(manual.id);
  assert.equal(active.price, '9.25');
  assert.equal(active.price_before_ganga, '12.50');
  assert.equal(Number((await pub(manual.id)).price_before_ganga).toFixed(2), '12.50');
  assert.equal(active.is_ganga_active, true);
  await eventCount('ganga_activated', manual.id, 1, {
    publicationId: manual.id,
    newPrice: '9.25',
  });
  await ganga(manual.id, owner.token, 409);
  await patch(manual.id, { price: 8 }, owner.token, 409);
  assert.equal((await reserve(manual.id)).unitPrice, '9.25');
  assert.equal((await res(beforeGanga.id)).unit_price, '12.50');
  const feed = await http('/publications');
  assert.equal(feed[0].id, manual.id);
  const noConfig = await live();
  await ganga(noConfig.id, owner.token, 409);
  await ganga(unavailable[0].id, owner.token, 409);
  await ganga(unavailable[1].id, owner.token, 409);
  await finish(manual.id);
  await ganga(manual.id, owner.token, 409);
  for (const invalid of [
    { ganga_min_price: 0, ganga_activation_mode: 'MANUAL' },
    { ganga_min_price: 15, ganga_activation_mode: 'MANUAL' },
    {
      ganga_min_price: 9,
      ganga_activation_mode: 'SCHEDULED',
      ganga_minutes_before: 100,
    },
    {
      ganga_min_price: 9,
      ganga_activation_mode: 'SCHEDULED',
      ganga_minutes_before: 0,
    },
  ]) {
    const before = await pub(noConfig.id);
    const jobsBefore = await queues.ganga.getJobCounts('delayed', 'wait');
    await patch(noConfig.id, invalid, owner.token, 400);
    assert.deepEqual(await pub(noConfig.id), before);
    assert.deepEqual(
      await queues.ganga.getJobCounts('delayed', 'wait'),
      jobsBefore,
    );
  }
  pass(
    'ganga EV-01/02/03/06: configuración, validación sin jobs, manual/propiedad, prioridad, decimal y precio histórico',
  );

  const scheduled = await live(2, {
    ganga_min_price: 7.5,
    ganga_activation_mode: 'SCHEDULED',
    ganga_minutes_before: 1,
    end_time: new Date(Date.now() + 63000).toISOString(),
  });
  await ganga(scheduled.id, owner.token, 409);
  const oldAt = Date.parse(scheduled.end_time) - 60000;
  const oldJob = await queues.ganga.getJob(`${scheduled.id}-${oldAt}`);
  assert(oldJob);
  assert.equal(await oldJob.getState(), 'delayed');
  const updated = await patch(scheduled.id, {
    end_time: new Date(Date.now() + 67000).toISOString(),
  });
  const newAt = Date.parse(updated.end_time) - 60000;
  assert(await queues.ganga.getJob(`${scheduled.id}-${newAt}`));
  await assertJob(
    await addJob('ganga', { publicationId: scheduled.id, expectedAt: oldAt }),
  );
  await sleep(Math.max(0, oldAt - Date.now()) + 300);
  assert.equal((await pub(scheduled.id)).is_ganga_active, false);
  await until(
    async () => (await pub(scheduled.id)).is_ganga_active,
    'ganga reprogramada',
  );
  await eventCount('ganga_activated', scheduled.id, 1, {
    publicationId: scheduled.id,
    newPrice: '7.50',
  });
  await assertJob(
    await addJob('ganga', { publicationId: scheduled.id, expectedAt: newAt }),
  );
  await eventCount('ganga_activated', scheduled.id, 1);
  const titleEdited = await patch(scheduled.id, {
    title: 'Ganga activa editada',
    current_stock: 3,
  });
  assert.equal(titleEdited.price, '7.50');
  assert.equal(titleEdited.price_before_ganga, '12.50');
  assert.equal(titleEdited.is_ganga_active, true);
  assert.equal(titleEdited.current_stock, 3);
  const stoppedGanga = await live(1, {
    ganga_min_price: 9,
    ganga_activation_mode: 'SCHEDULED',
    ganga_minutes_before: 1,
    end_time: new Date(Date.now() + 63000).toISOString(),
  });
  await finish(stoppedGanga.id);
  await sleep(3300);
  assert.equal((await pub(stoppedGanga.id)).is_ganga_active, false);
  assert.equal(matching(0, 'ganga_activated', stoppedGanga.id).length, 0);
  pass(
    'ganga EV-04/05/06: job real con delay, reprogramación ignora job antiguo, duplicado y fin sin activación',
  );

  // Redis conserva trabajos mientras el proceso que contiene los workers está detenido.
  const recovery = await live(1);
  const recoveryR = await reserve(recovery.id);
  const lost = await live(1);
  const lostR = await reserve(lost.id);
  const restartGanga = await live(1, {
    ganga_min_price: 6.75,
    ganga_activation_mode: 'SCHEDULED',
    ganga_minutes_before: 1,
    end_time: new Date(Date.now() + 90000).toISOString(),
  });
  await stop();
  const pending = await addJob(
    'reservation',
    { reservationId: recoveryR.id },
    1500,
  );
  await (await queues.reservation.getJob(lostR.id)).remove();
  await db.query(
    "UPDATE reservations SET reserved_at=now()-interval '21 minutes' WHERE id=ANY($1::uuid[])",
    [[recoveryR.id, lostR.id]],
  );
  await db.query(
    "UPDATE publications SET end_time=now()+interval '59 seconds' WHERE id=$1",
    [restartGanga.id],
  );
  const restartAt = (await pub(restartGanga.id)).end_time.getTime() - 60000;
  const pendingGanga = await addJob(
    'ganga',
    { publicationId: restartGanga.id, expectedAt: restartAt },
    1500,
  );
  await sleep(1700);
  assert.equal((await res(recoveryR.id)).status, 'ACTIVE');
  assert.equal((await pub(restartGanga.id)).is_ganga_active, false);
  assert.notEqual(await pending.getState(), 'completed');
  await start(250);
  await connectSockets();
  await assertJob(pending);
  await assertJob(pendingGanga);
  await until(
    async () =>
      (await res(lostR.id)).status === 'EXPIRED' &&
      (await res(recoveryR.id)).status === 'EXPIRED',
    'conciliación al arrancar',
  );
  assert.equal((await pub(recovery.id)).current_stock, 1);
  assert.equal((await pub(lost.id)).current_stock, 1);
  assert.equal((await pub(restartGanga.id)).price, '6.75');
  assert.equal((await pub(restartGanga.id)).is_ganga_active, true);
  await assertJob(await addJob('reservation', { reservationId: recoveryR.id }));
  assert.equal((await pub(recovery.id)).current_stock, 1);
  const periodic = await live(1);
  const periodicR = await reserve(periodic.id);
  await (await queues.reservation.getJob(periodicR.id)).remove();
  await db.query(
    "UPDATE reservations SET reserved_at=now()-interval '21 minutes' WHERE id=$1",
    [periodicR.id],
  );
  await until(
    async () => (await res(periodicR.id)).status === 'EXPIRED',
    'conciliación periódica sin job',
  );
  assert.equal((await pub(periodic.id)).current_stock, 1);
  pass(
    'reservas EV-06, ganga EV-04: proceso worker detenido/reiniciado, jobs Redis persistentes, jobs perdidos y conciliación periódica',
  );

  // Fin natural con el job creado por la API; evento observable por dos clientes.
  const natural = await live(2, {
    end_time: new Date(Date.now() + 2000).toISOString(),
  });
  const naturalR = await reserve(natural.id);
  await until(
    async () => (await pub(natural.id)).status === 'FINISHED',
    'fin natural programado',
  );
  await eventCount('publication_expired', natural.id, 1, {
    publicationId: natural.id,
  });
  await action(naturalR.id, 'complete', owner.token);
  await reserve(natural.id, randomUUID(), buyer.token, 409);
  pass(
    'publicaciones EV-04: fin natural job API + conciliación, evento único y reserva previa confirmable',
  );

  const reconnect = await live(2);
  sockets[1].disconnect();
  const disconnectedCount = events[1].length;
  await reserve(reconnect.id);
  assert.equal(events[1].length, disconnectedCount);
  const connected = once(sockets[1], 'connect');
  sockets[1].connect();
  await connected;
  const synchronized = await http('/publications');
  assert.equal(
    synchronized.find((p) => p.id === reconnect.id).current_stock,
    1,
  );
  await sleep(50);
  await reserve(reconnect.id);
  await until(
    () => matching(1, 'stock_updated', reconnect.id).length === 1,
    'evento tras reconexión',
  );
  const beforeEvents = events.map((e) => e.length);
  await reserve(reconnect.id, randomUUID(), buyer.token, 409);
  await sleep(100);
  assert.deepEqual(
    events.map((e) => e.length),
    beforeEvents,
  );
  for (const all of events)
    for (const e of all) {
      assertPublic(e.data);
      assert.deepEqual(
        Object.keys(e.data).sort(),
        (e.event === 'stock_updated'
          ? ['publicationId', 'newStock']
          : e.event === 'ganga_activated'
            ? ['publicationId', 'newPrice']
            : ['publicationId']
        ).sort(),
      );
    }
  pass(
    'sockets EV-01..05: dos clientes, payloads exactos/públicos, cambios postcommit, rechazos sin eventos y REST al reconectar',
  );

  await stop();
  evidence.originalAfter = (await inventory(admin)).tables;
  assert.deepEqual(evidence.originalAfter, evidence.originalBefore);
  pass('base original intacta: inventario/hash antes y después idénticos');
  evidence.result = 'PASS';
} catch (error) {
  evidence.result = 'FAIL';
  evidence.error = error.message;
  console.error(error);
  process.exitCode = 1;
} finally {
  await stop();
  await Promise.all(Object.values(queues).map((q) => q.close()));
  writeFileSync(
    resolve(artifacts, 'phase3.json'),
    JSON.stringify(evidence, null, 2) + '\n',
  );
  console.log('Evidencia:', resolve(artifacts, 'phase3.json'));
  if (dbConnected) await db.end();
  await admin.end();
}
