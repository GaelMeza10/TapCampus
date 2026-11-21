import 'dotenv/config';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync, readdirSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { inventory } from './db-inventory.mjs';

// Solo se migra/siembra una BD nueva. DATABASE_URL original permanece en lectura.
const source = new URL(process.env.DATABASE_URL);
const name = `tapcampus_phase2_${Date.now()}`;
assert.match(name, /^tapcampus_phase2_\d+$/);
const testUrl = new URL(source);
testUrl.pathname = `/${name}`;
const artifacts = resolve('.local/verification', name);
const uploadDir = resolve(artifacts, 'uploads');
mkdirSync(artifacts, { recursive: true });
const evidence = {
  date: new Date().toISOString(),
  node: process.version,
  database: name,
  requests: 0,
  checks: [],
};
const admin = new pg.Client({ connectionString: source.href });
const db = new pg.Client({ connectionString: testUrl.href });
let backend;
let base;
let dbConnected = false;
const secret = 'isolated-phase2-jwt-fixture-secret';
const jwt = new JwtService({ secret });
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1sAAAAASUVORK5CYII=',
  'base64',
);
function pass(name, details = {}) {
  evidence.checks.push({ name, result: 'PASS', ...details });
  console.log('PASS', name);
}
function command(args) {
  const result = spawnSync(process.execPath, args, {
    env: { ...process.env, DATABASE_URL: testUrl.href },
    encoding: 'utf8',
    timeout: 120000,
  });
  assert.equal(
    result.status,
    0,
    result.error?.message ?? result.stdout + result.stderr,
  );
}
async function start(uploads = uploadDir, publicBase) {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((r) => server.close(r));
  const env = {
    ...process.env,
    DATABASE_URL: testUrl.href,
    JWT_SECRET: secret,
    PORT: String(port),
    UPLOADS_DIR: uploads,
    BULLMQ_PREFIX: name,
    RECONCILIATION_INTERVAL_MS: '600000',
  };
  env.PUBLIC_BASE_URL = publicBase ?? `http://127.0.0.1:${port}`;
  backend = spawn(process.execPath, ['dist/main.js'], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  backend.stdout.on('data', (d) => (output += d));
  backend.stderr.on('data', (d) => (output += d));
  base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 600; i++) {
    try {
      if ((await fetch(base)).status === 200) return;
    } catch {}
    if (backend.exitCode !== null) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Backend no arrancó: ${output}`);
}
async function stop() {
  const process = backend;
  backend = undefined;
  if (process && process.exitCode === null && process.signalCode === null) {
    const exit = once(process, 'exit');
    process.kill();
    await exit;
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
  if (response.ok && method === 'GET' && (
    path === '/publications' || path.startsWith('/publications?') ||
    /^\/publications\/[0-9a-f-]+$/i.test(path)
  )) assert(!/"(?:ganga_min_price|ganga_activation_mode|ganga_minutes_before)"/.test(JSON.stringify(data)),
    'configuración privada en respuesta pública');
  assert.equal(
    response.status,
    expected,
    `${method} ${path}: ${JSON.stringify(data)}`,
  );
  if (expected >= 400) {
    assert.equal(data.statusCode, expected);
    assert(data.message && data.error);
    assert(!JSON.stringify(data).includes('password_hash'));
  }
  return data;
}
async function upload(
  token,
  {
    buffer = png,
    mime = 'image/png',
    field = 'file',
    extra,
    second = false,
    expected = 201,
  } = {},
) {
  const form = new FormData();
  if (buffer !== null)
    form.append(
      field,
      new Blob([buffer], { type: mime }),
      '../../original-dangerous-name.txt',
    );
  if (extra) form.append('extra', 'invalid');
  if (second)
    form.append('file', new Blob([png], { type: 'image/png' }), 'other.png');
  evidence.requests++;
  const response = await fetch(base + '/uploads', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await response.json();
  assert.equal(response.status, expected, `upload: ${JSON.stringify(data)}`);
  if (expected >= 400) assert.equal(data.statusCode, expected);
  return data;
}
const post = (path, body, token, expected = 201) =>
  http(path, { method: 'POST', body, token, expected });
const patch = (id, body, token, expected = 200) =>
  http(`/publications/${id}`, { method: 'PATCH', body, token, expected });
const sale = (id, token, expected = 200, body = {}) =>
  post(`/publications/${id}/physical-sale`, body, token, expected);
const sold = (id, token, expected = 200) =>
  post(`/publications/${id}/sold`, {}, token, expected);
const rows = async (sql, values = []) => (await db.query(sql, values)).rows;
const countPublications = async () =>
  Number((await rows('SELECT count(*) FROM publications'))[0].count);
function assertPrivate(value) {
  assert(
    !JSON.stringify(value).match(/phone|password|email|sellerContact/i),
    JSON.stringify(value),
  );
}
try {
  await admin.connect();
  evidence.postgres = (
    await admin.query('SHOW server_version')
  ).rows[0].server_version;
  evidence.originalBefore = (await inventory(admin)).tables;
  assert.equal(evidence.originalBefore.zones.count, 5);
  assert.equal(evidence.originalBefore.categories.count, 8);
  const migrationCount = readdirSync('prisma/migrations', { withFileTypes: true }).filter(entry => entry.isDirectory()).length;
  assert.equal(evidence.originalBefore._prisma_migrations.count, migrationCount);
  await admin.query(`CREATE DATABASE "${name}"`);
  await db.connect();
  dbConnected = true;
  command(['node_modules/prisma/build/index.js', 'migrate', 'deploy']);
  command(['node_modules/prisma/build/index.js', 'db', 'seed']);
  const beforeRepeat = (await inventory(db)).tables;
  command(['node_modules/prisma/build/index.js', 'db', 'seed']);
  assert.deepEqual((await inventory(db)).tables, beforeRepeat);
  pass('fase 1 reutilizada: migraciones, CHECK y seed repetible 5/8');
  await start();
  const valid = {
    name: 'Vendedor fixture',
    email: 'seller@uabc.edu.mx',
    password: 'fixture-password',
    phone: '6641234567',
  };
  for (const invalid of [
    { ...valid, email: 'outside@gmail.com' },
    { ...valid, email: 'a@evil-uabc.edu.mx' },
    { ...valid, email: 'a@uabc.edu.mx.evil.com' },
    ...[
      '+16641234567',
      '526641234567',
      '+5216641234567',
      '664 123 4567',
      '123',
      null,
    ].map((phone) => ({ ...valid, phone })),
    ...Object.keys(valid).map((key) => ({ ...valid, [key]: undefined })),
    { ...valid, password: 'short' },
    { ...valid, is_moderator: true },
  ])
    await post('/auth/register', invalid, undefined, 400);
  assert.equal((await rows('SELECT count(*) FROM users'))[0].count, '0');
  const registered = await post('/auth/register', valid);
  assert.deepEqual(Object.keys(registered), ['access_token']);
  const ownerToken = registered.access_token;
  const ownerId = jwt.verify(ownerToken).sub;
  const user = (await rows('SELECT * FROM users WHERE id=$1', [ownerId]))[0];
  assert.equal(user.phone, '+526641234567');
  assert.notEqual(user.password_hash, valid.password);
  assert(await bcrypt.compare(valid.password, user.password_hash));
  assert.equal(user.is_moderator, false);
  await post(
    '/auth/register',
    { ...valid, email: valid.email.toUpperCase() },
    undefined,
    409,
  );
  const other = await post('/auth/register', {
    ...valid,
    email: 'other@uabc.edu.mx',
    phone: '+525512345678',
  });
  const otherToken = other.access_token;
  const otherId = jwt.verify(otherToken).sub;
  assert.equal(
    (await rows('SELECT phone FROM users WHERE id=$1', [otherId]))[0].phone,
    '+525512345678',
  );
  const double = await Promise.all(
    [1, 2].map(() =>
      fetch(base + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...valid, email: 'race@uabc.edu.mx' }),
      }),
    ),
  );
  assert.deepEqual(double.map((r) => r.status).sort(), [201, 409]);
  await post(
    '/auth/login',
    { email: valid.email.toUpperCase(), password: valid.password },
    undefined,
    200,
  );
  const badLogin = await post(
    '/auth/login',
    { email: valid.email, password: 'bad' },
    undefined,
    401,
  );
  assert.deepEqual(
    await post(
      '/auth/login',
      { email: 'missing@uabc.edu.mx', password: 'bad' },
      undefined,
      401,
    ),
    badLogin,
  );
  for (const token of [
    undefined,
    'garbage',
    jwt.sign({ sub: ownerId }, { secret: 'wrong' }),
    jwt.sign({ sub: ownerId }, { expiresIn: -1 }),
    jwt.sign({ sub: 'not-uuid' }),
    jwt.sign({ sub: randomUUID() }),
    jwt.sign({ sub: ownerId }, { algorithm: 'HS384' }),
  ]) {
    await post('/publications', {}, token, 401);
    await upload(token, { expected: 401 });
  }
  pass('0002 EV-08: registro/hash/teléfonos/duplicados/login/JWT/CurrentUser');

  const image = await upload(ownerToken);
  assert.match(
    image.image_url,
    new RegExp(`^${base}/uploads/[a-f0-9-]{36}\\.png$`),
  );
  const downloaded = await fetch(image.image_url);
  assert.equal(downloaded.status, 200);
  assert.equal(downloaded.headers.get('content-type'), 'image/png');
  assert.equal(downloaded.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), png);
  const names = readdirSync(uploadDir);
  assert.equal(names.length, 1);
  for (const options of [
    { buffer: null },
    { buffer: Buffer.alloc(0) },
    { buffer: Buffer.from('not an image'), mime: 'image/png' },
    {
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
      mime: 'image/svg+xml',
    },
    { field: 'photo' },
    { extra: true },
    { second: true },
  ])
    await upload(ownerToken, { ...options, expected: 400 });
  await upload(ownerToken, {
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
    expected: 413,
  });
  assert.deepEqual(readdirSync(uploadDir), names);
  // El MIME se deriva del contenido, no del nombre o etiqueta del cliente.
  const disguised = await upload(ownerToken, {
    mime: 'application/octet-stream',
  });
  assert(disguised.image_url.endsWith('.png'));
  pass(
    '0003 EV-08: uploads autenticado, contenido/tamaño/campos, URL estática y sin residuos rechazados',
  );

  const zones = await http('/zones');
  const liveCategories = await http('/categories?type=LIVE');
  const staticCategories = await http('/categories?type=STATIC');
  assert.deepEqual(
    zones.map((z) => z.name).sort(),
    [
      'Facultad de Ingeniería',
      'Facultad de Artes',
      'Biblioteca Central',
      'Cafetería Principal',
      'Gimnasio',
    ].sort(),
  );
  assert.deepEqual(
    liveCategories.map((c) => c.name).sort(),
    ['Comida Fuerte', 'Snacks', 'Bebidas', 'Postres'].sort(),
  );
  assert.deepEqual(
    staticCategories.map((c) => c.name).sort(),
    ['Libros', 'Material Escolar', 'Batas/Uniformes', 'Electrónica'].sort(),
  );
  assert(liveCategories.every((c) => c.type === 'LIVE'));
  assert(staticCategories.every((c) => c.type === 'STATIC'));
  assert.equal((await http('/categories')).length, 8);
  const common = {
    title: 'Artículo fixture',
    description: 'Descripción fixture',
    price: 12.5,
    image_url: image.image_url,
    zone_id: zones[0].id,
  };
  const live = {
    ...common,
    type: 'LIVE',
    category_id: liveCategories[0].id,
    initial_stock: 3,
    start_time: new Date(Date.now() - 60000).toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
  };
  const stat = {
    ...common,
    type: 'STATIC',
    category_id: staticCategories[0].id,
  };
  for (const body of [live, stat]) {
    const invalids = [
      ...[
        'title',
        'description',
        'price',
        'image_url',
        'zone_id',
        'category_id',
        'type',
      ].map((key) => ({ ...body, [key]: undefined })),
      ...[0, -1, 1.123, 100000000, '12.50', null].map((price) => ({
        ...body,
        price,
      })),
      ...['', '  ', null, 5].map((title) => ({ ...body, title })),
      { ...body, zone_id: 2147483647 },
      { ...body, zone_id: -1 },
      { ...body, zone_id: 1.5 },
      {
        ...body,
        category_id:
          body.type === 'LIVE' ? staticCategories[0].id : liveCategories[0].id,
      },
      { ...body, category_id: 2147483647 },
      { ...body, category_id: '1' },
      { ...body, image_url: '/uploads/missing.png' },
      { ...body, image_url: `/uploads/${randomUUID()}.png` },
      {
        ...body,
        image_url: image.image_url.replace(base, 'https://unrelated.example'),
      },
      { ...body, image_url: '/uploads/../../package.json' },
      { ...body, seller_id: otherId },
      { ...body, status: 'FINISHED' },
      { ...body, current_stock: 9 },
    ];
    if (body.type === 'LIVE')
      invalids.push(
        ...[undefined, 0, -1, 1.5, null].map((initial_stock) => ({
          ...body,
          initial_stock,
        })),
        { ...body, start_time: undefined },
        { ...body, end_time: undefined },
        { ...body, start_time: body.end_time },
        { ...body, end_time: body.start_time },
        { ...body, end_time: 'not-date' },
        { ...body, end_time: body.end_time.slice(0, -1) },
        { ...body, ganga_min_price: 13, ganga_activation_mode: 'MANUAL' },
        { ...body, ganga_min_price: body.price, ganga_activation_mode: 'MANUAL' },
        ...['ganga_min_price', 'ganga_activation_mode', 'ganga_minutes_before'].map(field => ({ ...body, [field]: null })),
        { ...body, ganga_min_price: 0, ganga_activation_mode: 'MANUAL' },
        { ...body, ganga_min_price: 10 },
        { ...body, ganga_activation_mode: 'MANUAL' },
        {
          ...body,
          ganga_min_price: 10,
          ganga_activation_mode: 'MANUAL',
          ganga_minutes_before: 5,
        },
        {
          ...body,
          ganga_min_price: 10,
          ganga_activation_mode: 'SCHEDULED',
          ganga_minutes_before: 100,
        },
        {
          ...body,
          ganga_min_price: 10,
          ganga_activation_mode: 'SCHEDULED',
          ganga_minutes_before: 0,
        },
      );
    else
      invalids.push(
        ...[
          'initial_stock',
          'start_time',
          'end_time',
          'ganga_min_price',
          'ganga_activation_mode',
          'ganga_minutes_before',
        ].map((field) => ({
          ...body,
          [field]: field.endsWith('time')
            ? live.start_time
            : field === 'ganga_activation_mode'
              ? 'MANUAL'
              : 1,
        })),
        { ...body, initial_stock: null },
      );
    const before = await countPublications();
    for (const invalid of invalids)
      await post('/publications', invalid, ownerToken, 400);
    assert.equal(await countPublications(), before);
  }
  const livePub = await post('/publications', live, ownerToken);
  const staticPub = await post('/publications', stat, ownerToken);
  assert.equal(livePub.seller_id, ownerId);
  assert.equal(livePub.current_stock, 3);
  assert.equal(livePub.initial_stock, 3);
  assert.equal(livePub.price, '12.50');
  assert.equal(livePub.end_time, live.end_time);
  assert.equal(staticPub.status, 'ACTIVE');
  assert.equal(staticPub.current_stock, null);
  assert.equal(staticPub.start_time, null);
  assertPrivate(livePub);
  assertPrivate(staticPub);
  const manual = await post(
    '/publications',
    { ...live, ganga_min_price: 10, ganga_activation_mode: 'MANUAL' },
    ownerToken,
  );
  const scheduled = await post(
    '/publications',
    {
      ...live,
      ganga_min_price: 10,
      ganga_activation_mode: 'SCHEDULED',
      ganga_minutes_before: 5,
    },
    ownerToken,
  );
  assert.equal(manual.price, '12.50');
  assert.equal(manual.is_ganga_active, false);
  assert.equal(scheduled.ganga_minutes_before, 5);
  pass(
    '0003 EV-09 / 0004 EV-06: creación estricta LIVE/STATIC y configuración básica sin activación',
  );

  for (const publication of [livePub, staticPub]) {
    await patch(publication.id, { title: 'Ajeno' }, otherToken, 403);
    await patch(publication.id, { title: 'Ajeno' }, undefined, 401);
    for (const body of [
      {},
      { type: 'STATIC' },
      { seller_id: otherId },
      { initial_stock: 2 },
      { status: 'FINISHED' },
      { is_ganga_active: true },
      { title: null },
      { price: 0 },
      {
        category_id:
          publication.type === 'LIVE'
            ? staticCategories[0].id
            : liveCategories[0].id,
      },
      { extra: true },
    ]) {
      await patch(publication.id, body, ownerToken, 400);
    }
    const edited = await patch(
      publication.id,
      {
        title: 'Editado',
        description: 'Texto editado',
        price: 13.75,
        zone_id: zones[1].id,
      },
      ownerToken,
    );
    assert.equal(edited.title, 'Editado');
    assert.equal(edited.price, '13.75');
    assert.equal(edited.zone_id, zones[1].id);
  }
  for (const body of [
    { current_stock: -1 },
    { current_stock: 1.5 },
    { current_stock: null },
    { end_time: live.start_time },
  ])
    await patch(livePub.id, body, ownerToken, 400);
  for (const body of [
    { current_stock: 1 },
    { start_time: live.start_time },
    { ganga_min_price: 5, ganga_activation_mode: 'MANUAL' },
  ])
    await patch(staticPub.id, body, ownerToken, 400);
  await patch(randomUUID(), { title: 'No existe' }, ownerToken, 404);
  await patch('invalid', { title: 'No existe' }, ownerToken, 400);
  const snapshot = JSON.stringify(
    (await rows('SELECT * FROM publications WHERE id=$1', [livePub.id]))[0],
  );
  await patch(livePub.id, { price: -1, title: 'Parcial' }, ownerToken, 400);
  assert.equal(
    JSON.stringify(
      (await rows('SELECT * FROM publications WHERE id=$1', [livePub.id]))[0],
    ),
    snapshot,
  );
  const gangChanged = await patch(
    manual.id,
    { price: 15, ganga_min_price: 9 },
    ownerToken,
  );
  assert.equal(gangChanged.ganga_min_price, '9.00');
  await patch(manual.id, { price: 8 }, ownerToken, 400);
  await patch(
    scheduled.id,
    { end_time: new Date(Date.now() + 60000).toISOString() },
    ownerToken,
    400,
  );
  pass(
    '0003 EV-09 / 0004 EV-06: PATCH combinado, inmutables, permisos y rollback',
  );

  const future = await post(
    '/publications',
    { ...live, start_time: new Date(Date.now() + 1800000).toISOString() },
    ownerToken,
  );
  const zero = await post('/publications', live, ownerToken);
  await patch(zero.id, { current_stock: 0 }, ownerToken);
  const expired = await post('/publications', live, ownerToken);
  await db.query(
    "UPDATE publications SET end_time=now()-interval '1 second' WHERE id=$1",
    [expired.id],
  );
  const hidden = await post('/publications', live, ownerToken);
  const finished = await post('/publications', stat, ownerToken);
  const hiddenStatic = await post('/publications', stat, ownerToken);
  await db.query(
    "UPDATE publications SET status='HIDDEN_BY_REPORTS' WHERE id = ANY($1::uuid[])",
    [[hidden.id, hiddenStatic.id]],
  );
  await sold(finished.id, ownerToken);
  const all = await http('/publications');
  assertPrivate(all);
  const invisible = [
    future.id,
    zero.id,
    expired.id,
    hidden.id,
    hiddenStatic.id,
    finished.id,
  ];
  assert(all.every((p) => !invisible.includes(p.id)));
  assert(
    all.some((p) => p.id === livePub.id) &&
      all.some((p) => p.id === staticPub.id),
  );
  for (const id of invisible)
    await http(`/publications/${id}`, { expected: 404 });
  await http(`/publications/${randomUUID()}`, { expected: 404 });
  await http('/publications/invalid', { expected: 400 });
  const beforeConsult = await rows('SELECT * FROM publications WHERE id=$1', [livePub.id]);
  const reservationsBeforeConsult = await rows('SELECT * FROM reservations ORDER BY id');
  const liveDetail = await http(`/publications/${livePub.id}`);
  assert.deepEqual(liveDetail.sellerContact, { phone: user.phone });
  assert.deepEqual(Object.keys(liveDetail.seller).sort(), ['id', 'name']);
  assert(!JSON.stringify(liveDetail).match(/password|email|buyerContact/));
  assert.deepEqual(await rows('SELECT * FROM publications WHERE id=$1', [livePub.id]), beforeConsult);
  assert.deepEqual(await rows('SELECT * FROM reservations ORDER BY id'), reservationsBeforeConsult);
  assertPrivate(await http('/publications/mine', { token: ownerToken }));
  const staticDetail = await http(`/publications/${staticPub.id}`);
  assert.deepEqual(staticDetail.sellerContact, { phone: user.phone });
  assert.deepEqual(Object.keys(staticDetail.seller).sort(), ['id', 'name']);
  assert(!JSON.stringify(staticDetail).match(/password|email/));
  assert.equal(staticDetail.end_time, null);
  await http('/auth/me', { method: 'PATCH', body: { phone: '3312345678' }, token: ownerToken });
  for (const id of [livePub.id, staticPub.id]) {
    assert.deepEqual((await http(`/publications/${id}`)).sellerContact, { phone: '+523312345678' });
  }
  await http('/auth/me', { method: 'PATCH', body: { phone: user.phone }, token: ownerToken });
  pass('0039 EV-01/02: detalle LIVE/STATIC sin reserva ni escrituras, contacto vigente, feed/mine sin teléfonos y no visibles 404');
  for (const query of [
    '',
    `?type=LIVE`,
    `?zoneId=${zones[1].id}`,
    `?categoryId=${liveCategories[0].id}`,
    `?type=LIVE&zoneId=${zones[1].id}&categoryId=${liveCategories[0].id}`,
    `?type=STATIC&zoneId=${zones[1].id}&categoryId=${staticCategories[0].id}`,
  ]) {
    const actual = await http('/publications' + query);
    const filters = new URLSearchParams(query);
    const expected = all.filter(
      (p) =>
        (!filters.has('type') || p.type === filters.get('type')) &&
        (!filters.has('zoneId') ||
          p.zone_id === Number(filters.get('zoneId'))) &&
        (!filters.has('categoryId') ||
          p.category_id === Number(filters.get('categoryId'))),
    );
    assert.deepEqual(
      actual.map((p) => p.id),
      expected.map((p) => p.id),
    );
    assertPrivate(actual);
  }
  assert.deepEqual(
    await http(
      `/publications?type=LIVE&zoneId=${zones[4].id}&categoryId=${liveCategories[3].id}`,
    ),
    [],
  );
  for (const query of [
    'type=wrong',
    'zoneId=0',
    'zoneId=-1',
    'zoneId=1.5',
    'zoneId=1e0',
    'zoneId=1&zoneId=2',
    'zoneId=2147483648',
    'zoneId=2147483647',
    'categoryId=no',
    'categoryId=2147483647',
    'extra=yes',
    `type=LIVE&categoryId=${staticCategories[0].id}`,
    `type=STATIC&categoryId=${liveCategories[0].id}`,
    'type=LIVE&type=STATIC',
  ])
    await http('/publications?' + query, { expected: 400 });
  await http('/categories?type=wrong', { expected: 400 });
  await http('/categories?extra=yes', { expected: 400 });
  await http('/zones?extra=yes', { expected: 400 });
  pass(
    '0005 EV-06 / 0003 EV-09 / 0004 EV-06: catálogos exactos, filtros AND, visibilidad y contacto protegido',
  );

  await sale(livePub.id, otherToken, 403);
  await sold(staticPub.id, otherToken, 403);
  await sale(livePub.id, undefined, 401);
  await sold(staticPub.id, undefined, 401);
  await sale(staticPub.id, ownerToken, 409);
  await sold(livePub.id, ownerToken, 409);
  for (const id of [future.id, expired.id, hidden.id, zero.id])
    await sale(id, ownerToken, 409);
  for (const id of [expired.id, hidden.id])
    await patch(id, { title: 'invalid state' }, ownerToken, 409);
  await sale(randomUUID(), ownerToken, 404);
  await sold(randomUUID(), ownerToken, 404);
  await sale('bad-uuid', ownerToken, 400);
  await sale(livePub.id, ownerToken, 400, { current_stock: 999 });
  await post(
    `/publications/${staticPub.id}/sold`,
    { status: 'ACTIVE' },
    ownerToken,
    400,
  );
  const reservationId = randomUUID();
  await db.query(
    'INSERT INTO reservations(id,buyer_id,publication_id,unit_price,idempotency_key) VALUES($1,$2,$3,12.50,$4)',
    [reservationId, otherId, livePub.id, randomUUID()],
  );
  // Fixture representa una pieza previamente reservada, ya descontada del disponible.
  await db.query(
    'UPDATE publications SET current_stock=current_stock-1 WHERE id=$1',
    [livePub.id],
  );
  const reservationsBefore = await rows('SELECT * FROM reservations');
  assert.equal((await sale(livePub.id, ownerToken)).current_stock, 1);
  assert.deepEqual(
    await rows('SELECT * FROM reservations'),
    reservationsBefore,
  );
  const concurrent = await Promise.all(
    Array.from({ length: 25 }, () =>
      fetch(base + `/publications/${livePub.id}/physical-sale`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      }),
    ),
  );
  const statuses = concurrent.map((r) => r.status);
  assert.equal(statuses.filter((s) => s === 200).length, 1);
  assert.equal(statuses.filter((s) => s === 409).length, 24);
  assert.equal(
    (
      await rows('SELECT current_stock FROM publications WHERE id=$1', [
        livePub.id,
      ])
    )[0].current_stock,
    0,
  );
  assert.deepEqual(
    await rows('SELECT * FROM reservations'),
    reservationsBefore,
  );
  assert(!(await http('/publications')).some((p) => p.id === livePub.id));
  await patch(livePub.id, { current_stock: 2, price: 16 }, ownerToken);
  assert.deepEqual(
    await rows('SELECT * FROM reservations'),
    reservationsBefore,
  );
  assert((await http('/publications')).some((p) => p.id === livePub.id));
  await assert.rejects(
    db.query('UPDATE publications SET current_stock=-1 WHERE id=$1', [
      livePub.id,
    ]),
    { code: '23514' },
  );

  // Bloqueo real del contrato previsto para reservas, sin crear endpoint de fase 3.
  const locker = new pg.Client({ connectionString: testUrl.href });
  await locker.connect();
  try {
    await patch(livePub.id, { current_stock: 1 }, ownerToken);
    await locker.query('BEGIN');
    await locker.query('SELECT id FROM publications WHERE id=$1 FOR UPDATE', [
      livePub.id,
    ]);
    let settled = false;
    const waitingSale = sale(livePub.id, ownerToken, 409).finally(
      () => (settled = true),
    );
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(settled, false, 'la venta debe esperar al bloqueo');
    await locker.query(
      'UPDATE publications SET current_stock=current_stock-1 WHERE id=$1',
      [livePub.id],
    );
    await locker.query('COMMIT');
    await waitingSale;
    await patch(livePub.id, { current_stock: 1 }, ownerToken);
    await locker.query('BEGIN');
    await locker.query('SELECT id FROM publications WHERE id=$1 FOR UPDATE', [
      livePub.id,
    ]);
    let editSettled = false;
    const waitingEdit = patch(
      livePub.id,
      { title: 'Edición tras bloqueo' },
      ownerToken,
    ).finally(() => (editSettled = true));
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(
      editSettled,
      false,
      'la edición debe esperar al mismo bloqueo',
    );
    await locker.query(
      'UPDATE publications SET current_stock=current_stock-1 WHERE id=$1',
      [livePub.id],
    );
    await locker.query('COMMIT');
    assert.equal((await waitingEdit).current_stock, 0);
  } finally {
    await locker.query('ROLLBACK');
    await locker.end();
  }
  pass(
    '0003 EV-10: 25 ventas físicas por última unidad = 1x200/24x409, bloqueo compartido, CHECK y reservas intactas',
    { concurrency: { requests: 25, success: 1, conflict: 24 } },
  );

  const soldRace = await Promise.all(
    [1, 2].map(() =>
      fetch(base + `/publications/${staticPub.id}/sold`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      }),
    ),
  );
  assert.deepEqual(soldRace.map((r) => r.status).sort(), [200, 409]);
  assert.equal(
    (
      await rows('SELECT status FROM publications WHERE id=$1', [staticPub.id])
    )[0].status,
    'FINISHED',
  );
  await sold(staticPub.id, ownerToken, 409);
  await patch(staticPub.id, { title: 'Vendida' }, ownerToken, 409);
  await http(`/publications/${staticPub.id}`, { expected: 404 });
  assert(
    !(await http('/publications?type=STATIC')).some(
      (p) => p.id === staticPub.id,
    ),
  );
  await http(`/publications/${livePub.id}`, {
    method: 'DELETE',
    expected: 404,
  });
  pass(
    '0004 EV-06: sold propio, ajeno, incompatible, repetido y concurrente; no DELETE',
  );

  for (const body of [live, stat]) {
    const before = await countPublications();
    for (const fields of [{ title: '¡PÉNDEJO!' }, { description: 'ARMA-de-FUEGO' }, { title: 'imbécil', description: 'municiones' }]) {
      const rejection = await post('/publications', { ...body, ...fields }, ownerToken, 400);
      assert.equal(rejection.code, 'PUBLICATION_CONTENT_BLOCKED');
      assert.deepEqual(rejection.fields, Object.keys(fields));
      assert.equal(rejection.message[0], 'Se detectó una palabra ofensiva o no permitida, modifícala si deseas crear la publicación');
      assert(!JSON.stringify(rejection).includes('PÉNDEJO'));
    }
    assert.equal(await countPublications(), before);
    await post('/publications', { ...body, title: 'pendejo' }, null, 401);
    const permitted = await post('/publications', { ...body, title: 'Computadora usada', description: 'Bata negra, Coca-Cola y libro de una heroína.' }, ownerToken);
    const beforeEdit = (await rows('SELECT * FROM publications WHERE id=$1', [permitted.id]))[0];
    const rejected = await patch(permitted.id, { title: 'pendejo', description: 'municiones' }, ownerToken, 400);
    assert.equal(rejected.code, 'PUBLICATION_CONTENT_BLOCKED');
    assert.deepEqual(rejected.fields, ['title', 'description']);
    assert.equal(rejected.message[0], 'Se detectó una palabra ofensiva o no permitida, modifícala si deseas guardar la publicación');
    assert.deepEqual((await rows('SELECT * FROM publications WHERE id=$1', [permitted.id]))[0], beforeEdit);
    await patch(permitted.id, { title: 'pendejo' }, otherToken, 403);
    // El texto histórico no enviado no bloquea un ajuste legítimo.
    await db.query('UPDATE publications SET description=$1 WHERE id=$2', ['pendejo', permitted.id]);
    await patch(permitted.id, body.type === 'LIVE' ? { current_stock: 4 } : { price: 15 }, ownerToken);
    await patch(permitted.id, { title: 'Título permitido' }, ownerToken);
    assert.equal((await rows('SELECT description FROM publications WHERE id=$1', [permitted.id]))[0].description, 'pendejo');
    await patch(permitted.id, { description: 'Texto corregido' }, ownerToken);
    await patch(permitted.id, { title: 'arma', description: 'de fuego' }, ownerToken);
    await patch(permitted.id, { description: 'arma de fuego' }, ownerToken, 400);
    if (body.type === 'STATIC') {
      await sold(permitted.id, ownerToken);
      await patch(permitted.id, { title: 'pendejo' }, ownerToken, 409);
    }
  }
  pass('0038 EV-01/03/05: POST/PATCH LIVE/STATIC, código/campos, falsos positivos, permisos y texto histórico; rechazos sin filas/cambios');

  await stop();
  // PUBLIC_BASE_URL sirve dispositivos/proxy, independiente del Host interno.
  await start(uploadDir, 'https://campus.example');
  const publicImage = await upload(ownerToken);
  assert(publicImage.image_url.startsWith('https://campus.example/uploads/'));
  await post(
    '/publications',
    { ...stat, image_url: publicImage.image_url },
    ownerToken,
  );
  const path = new URL(publicImage.image_url).pathname;
  assert.equal((await fetch(base + path)).status, 200);
  // Fallo real de escritura, sin cambiar credenciales ni rutas de la BD original.
  renameSync(uploadDir, resolve(artifacts, 'uploads-saved'));
  writeFileSync(uploadDir, 'archivo que impide mkdir');
  await upload(ownerToken, { expected: 500 });
  await stop();
  pass(
    '0003 EV-08: origen público configurable y error de almacenamiento 500 controlado',
  );
  evidence.originalAfter = (await inventory(admin)).tables;
  assert.deepEqual(evidence.originalAfter, evidence.originalBefore);
  pass('base original conservada: hashes/recuentos idénticos');
  evidence.result = 'PASS';
} finally {
  await stop();
  if (dbConnected) await db.end();
  await admin.end();
  writeFileSync(
    resolve(artifacts, 'phase2.json'),
    JSON.stringify(evidence, null, 2),
  );
  console.log('Evidencia:', resolve(artifacts, 'phase2.json'));
}
