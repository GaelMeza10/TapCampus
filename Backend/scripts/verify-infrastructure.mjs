import 'dotenv/config';
import pg from 'pg';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { inventory } from './db-inventory.mjs';

// Crea bases propias; nunca resetea, migra ni siembra DATABASE_URL original.
const source = new URL(process.env.DATABASE_URL);
const prefix = `tapcampus_verify_${Date.now()}`;
const evidence = {
  date: new Date().toISOString(),
  node: process.version,
  databases: [],
  checks: [],
};
mkdirSync('.local/verification', { recursive: true });
const admin = new pg.Client({ connectionString: source.href });
await admin.connect();
const clients = [];
function command(file, args, env = {}, expected = 0) {
  const result = spawnSync(file, args, {
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 120000,
  });
  assert.equal(
    result.status,
    expected,
    `Comando ${file} ${args.slice(0, 2).join(' ')}: ${result.error?.message ?? result.stdout + result.stderr}`,
  );
  return result.stdout;
}
const node = (args, env, expected) =>
  command(process.execPath, args, env, expected);
const prisma = (args, url) =>
  node(['node_modules/prisma/build/index.js', ...args], { DATABASE_URL: url });
async function database(suffix) {
  const name = `${prefix}_${suffix}`;
  assert.match(name, /^tapcampus_verify_\d+_[a-z]+$/);
  await admin.query(`CREATE DATABASE "${name}"`);
  evidence.databases.push(name);
  const url = new URL(source);
  url.pathname = `/${name}`;
  const client = new pg.Client({ connectionString: url.href });
  await client.connect();
  clients.push(client);
  return { name, url: url.href, client };
}
async function snapshot(db) {
  await db.client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const value = await inventory(db.client);
  await db.client.query('COMMIT');
  return value;
}
function pass(name, details = {}) {
  evidence.checks.push({ name, result: 'PASS', ...details });
  console.log('PASS', name);
}
function pgtool(tool, args) {
  if (process.env.PG_TOOLS_CONTAINER)
    return command('docker', [
      'exec',
      process.env.PG_TOOLS_CONTAINER,
      tool,
      '-U',
      decodeURIComponent(source.username),
      ...args,
    ]);
  return command(tool, args, {
    PGHOST: source.hostname,
    PGPORT: source.port,
    PGUSER: decodeURIComponent(source.username),
    PGPASSWORD: decodeURIComponent(source.password),
  });
}
async function dumpAndRestore(from, to, label) {
  const dump = process.env.PG_TOOLS_CONTAINER
    ? `/tmp/${prefix}_${label}.dump`
    : `.local/verification/${prefix}_${label}.dump`;
  pgtool('pg_dump', ['-d', from.name, '-Fc', '-f', dump]);
  pgtool('pg_restore', ['-d', to.name, '--exit-on-error', '--no-owner', dump]);
  assert.deepEqual((await snapshot(from)).tables, (await snapshot(to)).tables);
  pass(`restauración ${label}: filas y hashes idénticos`);
}
let backend;
try {
  evidence.original = await inventory(admin);
  const empty = await database('empty');
  node(['scripts/migrate-safe.mjs'], { DATABASE_URL: empty.url });
  prisma(['validate'], empty.url);
  prisma(['migrate', 'status'], empty.url);
  assert.equal(
    prisma(
      [
        'migrate',
        'diff',
        '--from-config-datasource',
        '--to-schema',
        'prisma/schema.prisma',
        '--exit-code',
      ],
      empty.url,
    ).includes('No difference'),
    true,
  );
  pass('AC-02: ruta vacía, validate/status/diff sin divergencia');
  const legacy = await database('legacy');
  for (const migration of [
    '20260910011413_init',
    '20260910012517_fix_estado_reserva',
  ]) {
    await legacy.client.query(
      readFileSync(`prisma/migrations/${migration}/migration.sql`, 'utf8'),
    );
    prisma(['migrate', 'resolve', '--applied', migration], legacy.url);
  }
  // Los nombres camelCase del esquema antiguo requieren comillas.
  const fixture = readFileSync(
    'scripts/fixtures/legacy-data.sql',
    'utf8',
  ).replace(
    /\b(vendedorId|categoriaId|zonaId|stockInicial|stockDisponible|horaInicio|horaFin|createdAt|compradorId|publicacionId|usuarioId)\b/g,
    '"$1"',
  );
  await legacy.client.query(fixture);
  const restore = await database('restore');
  await dumpAndRestore(legacy, restore, 'legacy');
  const before = (await snapshot(legacy)).tables;
  node(
    ['scripts/migrate-safe.mjs', '--backup-verified'],
    { DATABASE_URL: legacy.url },
    1,
  );
  assert.deepEqual((await snapshot(legacy)).tables, before);
  // Probar además el gate dentro de la transacción, con manifiesto incompleto.
  node(
    [
      'scripts/migrate-safe.mjs',
      '--backup-verified',
      '--legacy-manifest',
      'scripts/fixtures/catalog-remap.json',
    ],
    { DATABASE_URL: legacy.url },
    1,
  );
  assert.deepEqual((await snapshot(legacy)).tables, before);
  pass('AC-04: precio sin evidencia bloquea ambas rutas sin escritura');
  node(
    [
      'scripts/migrate-safe.mjs',
      '--backup-verified',
      '--legacy-manifest',
      'scripts/fixtures/legacy-manifest.json',
    ],
    { DATABASE_URL: legacy.url },
  );
  const migrated = await snapshot(legacy);
  for (const [oldTable, newTable] of Object.entries({
    usuarios: 'users',
    zonas: 'zones',
    categorias: 'categories',
    publicaciones: 'publications',
    reservas: 'reservations',
    reportes: 'reports',
  })) {
    assert.equal(migrated.tables[newTable].count, before[oldTable].count);
    const archived = (
      await legacy.client.query(
        `SELECT to_jsonb(t) AS data FROM tapcampus_legacy."${oldTable}" t ORDER BY to_jsonb(t)::text`,
      )
    ).rows;
    const originals = (
      await restore.client.query(
        `SELECT to_jsonb(t) AS data FROM "${oldTable}" t ORDER BY to_jsonb(t)::text`,
      )
    ).rows;
    assert.deepEqual(archived, originals);
  }
  assert.equal(
    (
      await legacy.client.query(
        "SELECT count(*) FROM reservations r JOIN tapcampus_legacy.id_map m ON m.entity='reservas' AND m.new_id=r.id JOIN tapcampus_legacy.reservas old ON old.id=m.old_id JOIN tapcampus_legacy.id_map b ON b.entity='usuarios' AND b.old_id=old.\"compradorId\" AND b.new_id=r.buyer_id JOIN tapcampus_legacy.id_map p ON p.entity='publicaciones' AND p.old_id=old.\"publicacionId\" AND p.new_id=r.publication_id",
      )
    ).rows[0].count,
    '2',
  );
  assert.deepEqual(
    (
      await legacy.client.query(
        'SELECT unit_price::text FROM reservations ORDER BY reserved_at',
      )
    ).rows.map((r) => r.unit_price),
    ['12.50', '13.50'],
  );
  prisma(['migrate', 'status'], legacy.url);
  prisma(
    [
      'migrate',
      'diff',
      '--from-config-datasource',
      '--to-schema',
      'prisma/schema.prisma',
      '--exit-code',
    ],
    legacy.url,
  );
  const recovered = await database('recovered');
  await dumpAndRestore(restore, recovered, 'recovery');
  pass(
    'AC-04: 2 usuarios, 2 publicaciones, 2 reservas y 1 reporte preservados; archivo y mapa de claves íntegros',
  );
  const afterMigration = (await snapshot(legacy)).tables;
  prisma(['db', 'seed'], empty.url);
  prisma(['db', 'seed'], empty.url);
  node(
    ['node_modules/prisma/build/index.js', 'db', 'seed'],
    { DATABASE_URL: legacy.url },
    1,
  );
  assert.deepEqual((await snapshot(legacy)).tables, afterMigration);
  const env = {
    DATABASE_URL: legacy.url,
    CATALOG_REMAP_FILE: 'scripts/fixtures/catalog-remap.json',
  };
  node(['node_modules/prisma/build/index.js', 'db', 'seed'], env);
  const seedOnce = (await snapshot(legacy)).tables;
  node(['node_modules/prisma/build/index.js', 'db', 'seed'], env);
  assert.deepEqual((await snapshot(legacy)).tables, seedOnce);
  assert.deepEqual(
    (
      await legacy.client.query('SELECT name FROM zones ORDER BY name')
    ).rows.map((r) => r.name),
    [
      'Biblioteca Central',
      'Cafetería Principal',
      'Facultad de Artes',
      'Facultad de Ingeniería',
      'Gimnasio',
    ],
  );
  assert.deepEqual(
    (
      await legacy.client.query(
        'SELECT name,type::text FROM categories ORDER BY type,name',
      )
    ).rows,
    [
      { name: 'Bebidas', type: 'LIVE' },
      { name: 'Comida Fuerte', type: 'LIVE' },
      { name: 'Postres', type: 'LIVE' },
      { name: 'Snacks', type: 'LIVE' },
      { name: 'Batas/Uniformes', type: 'STATIC' },
      { name: 'Electrónica', type: 'STATIC' },
      { name: 'Libros', type: 'STATIC' },
      { name: 'Material Escolar', type: 'STATIC' },
    ],
  );
  assert.equal(
    (
      await legacy.client.query(
        'SELECT count(*) FROM publications p JOIN zones z ON z.id=p.zone_id JOIN categories c ON c.id=p.category_id',
      )
    ).rows[0].count,
    '2',
  );
  pass(
    'AC-05: seed doble vacío/poblado, gate sin remapeo y referencias válidas',
  );
  const p = (
    await legacy.client.query(
      "SELECT id,seller_id FROM publications WHERE type='LIVE'",
    )
  ).rows[0];
  const buyer = (
    await legacy.client.query('SELECT buyer_id FROM reservations LIMIT 1')
  ).rows[0].buyer_id;
  await assert.rejects(
    legacy.client.query(
      'UPDATE publications SET current_stock=-1 WHERE id=$1',
      [p.id],
    ),
    { code: '23514' },
  );
  const key = randomUUID();
  const insert = (b, k) =>
    legacy.client.query(
      'INSERT INTO reservations(id,buyer_id,publication_id,unit_price,idempotency_key) VALUES($1,$2,$3,12.50,$4)',
      [randomUUID(), b, p.id, k],
    );
  await insert(buyer, key);
  await insert(buyer, randomUUID());
  await assert.rejects(insert(buyer, key), { code: '23505' });
  await insert(p.seller_id, key);
  await assert.rejects(
    legacy.client.query(
      'INSERT INTO reservations(id,buyer_id,publication_id,idempotency_key) VALUES($1,$2,$3,$4)',
      [randomUUID(), buyer, p.id, randomUUID()],
    ),
    { code: '23502' },
  );
  await assert.rejects(
    legacy.client.query(
      'INSERT INTO reservations(id,buyer_id,publication_id,unit_price,idempotency_key) VALUES($1,$2,$3,1,$4)',
      [randomUUID(), buyer, p.id, 'bad'],
    ),
    { code: '22P02' },
  );
  await legacy.client.query(
    "UPDATE publications SET current_stock=NULL WHERE type='STATIC'",
  );
  const columns = (
    await legacy.client.query(
      "SELECT column_name,data_type,numeric_precision,numeric_scale,is_nullable FROM information_schema.columns WHERE table_name='reservations' AND table_schema='public' AND column_name IN ('unit_price','idempotency_key') ORDER BY column_name",
    )
  ).rows;
  assert.equal(columns[0].data_type, 'uuid');
  assert.equal(columns[0].is_nullable, 'NO');
  assert.equal(columns[1].numeric_precision, 10);
  assert.equal(columns[1].numeric_scale, 2);
  assert.equal(columns[1].is_nullable, 'NO');
  pass(
    'AC-03: CHECK, NOT NULL, Decimal(10,2), UUID y unicidad por comprador/clave',
    { columns },
  );
  // Gate moderno: una reserva sin instantánea no puede usar el precio actual.
  const modern = await database('modern');
  pgtool('pg_dump', [
    '-d',
    empty.name,
    '-Fc',
    '-f',
    process.env.PG_TOOLS_CONTAINER
      ? `/tmp/${prefix}_modern.dump`
      : `.local/verification/${prefix}_modern.dump`,
  ]);
  pgtool('pg_restore', [
    '-d',
    modern.name,
    '--exit-on-error',
    '--no-owner',
    process.env.PG_TOOLS_CONTAINER
      ? `/tmp/${prefix}_modern.dump`
      : `.local/verification/${prefix}_modern.dump`,
  ]);
  await modern.client.query(
    'INSERT INTO users(id,email,password_hash,name,phone) VALUES($1,$2,$3,$4,$5)',
    [p.seller_id, 'modern@uabc.edu.mx', 'fixture', 'Fixture', '+526641234567'],
  );
  await modern.client.query(
    "INSERT INTO publications(id,type,title,description,price,image_url,seller_id,zone_id,category_id) VALUES($1,'LIVE','Fixture','Fixture',99,'/fixture',$2,(SELECT min(id) FROM zones),(SELECT min(id) FROM categories))",
    [p.id, p.seller_id],
  );
  const reservationId = randomUUID();
  await modern.client.query(
    'INSERT INTO reservations(id,buyer_id,publication_id,unit_price,idempotency_key) VALUES($1,$2,$3,12.50,$4)',
    [reservationId, p.seller_id, p.id, randomUUID()],
  );
  await modern.client.query('ALTER TABLE reservations DROP COLUMN unit_price');
  await modern.client.query(
    'ALTER TABLE reservations DROP COLUMN idempotency_key',
  );
  await modern.client.query('DROP INDEX reservations_status_reserved_at_idx');
  await modern.client.query(
    'ALTER TABLE publications DROP CONSTRAINT publications_current_stock_nonnegative',
  );
  await modern.client.query(
    "DELETE FROM _prisma_migrations WHERE migration_name='20261005000100_reservation_integrity'",
  );
  const modernBefore = (await snapshot(modern)).tables;
  node(
    ['scripts/migrate-safe.mjs', '--backup-verified'],
    { DATABASE_URL: modern.url },
    1,
  );
  assert.deepEqual((await snapshot(modern)).tables, modernBefore);
  writeFileSync(
    '.local/verification/modern-prices.json',
    JSON.stringify({
      reservations: {
        [reservationId]: {
          unit_price: '12.50',
          source: 'Recibo sintético moderno',
        },
      },
    }),
  );
  node(
    [
      'scripts/backfill-reservation-prices.mjs',
      '.local/verification/modern-prices.json',
      '--backup-verified',
    ],
    { DATABASE_URL: modern.url },
  );
  node(['scripts/migrate-safe.mjs', '--backup-verified'], {
    DATABASE_URL: modern.url,
  });
  prisma(['migrate', 'status'], modern.url);
  prisma(
    [
      'migrate',
      'diff',
      '--from-config-datasource',
      '--to-schema',
      'prisma/schema.prisma',
      '--exit-code',
    ],
    modern.url,
  );
  assert.equal(
    (await modern.client.query('SELECT unit_price::text FROM reservations'))
      .rows[0].unit_price,
    '12.50',
  );
  pass(
    'AC-04: gate y backfill moderno con procedencia, precio actual 99 descartado',
  );
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((r) => server.close(r));
  backend = spawn(process.execPath, ['dist/main.js'], {
    env: {
      ...process.env,
      DATABASE_URL: empty.url,
      JWT_SECRET: 'fixture-secret-only-for-isolated-tests',
      PORT: String(port),
      CORS_ORIGINS: 'http://localhost:8081',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  backend.stdout.on('data', (d) => (output += d));
  backend.stderr.on('data', (d) => (output += d));
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(base);
      if (r.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  assert(ready, `Arranque fallido: ${output}`);
  const post = async (path, body) => {
    const r = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: r.status, body: await r.json() };
  };
  const valid = {
    name: 'Fixture HTTP',
    email: 'http@uabc.edu.mx',
    phone: '6641234567',
    password: 'fixture-password',
  };
  for (const data of [
    { ...valid, email: 'fixture@gmail.com' },
    { ...valid, phone: '+16641234567' },
    { ...valid, extra: true },
    { email: valid.email },
  ]) {
    const r = await post('/auth/register', data);
    assert.equal(r.status, 400);
    assert.equal(r.body.statusCode, 400);
    assert(Array.isArray(r.body.message));
    assert.equal(r.body.error, 'Bad Request');
  }
  assert.equal(
    (await empty.client.query('SELECT count(*) FROM users')).rows[0].count,
    '0',
  );
  const registered = await post('/auth/register', valid);
  assert.equal(registered.status, 201);
  assert.deepEqual(Object.keys(registered.body), ['access_token']);
  const { JwtService } = await import('@nestjs/jwt');
  const jwt = new JwtService({
    secret: 'fixture-secret-only-for-isolated-tests',
  });
  const payload = jwt.verify(registered.body.access_token);
  assert.match(payload.sub, /^[a-f0-9-]{36}$/);
  assert.equal(payload.email, valid.email);
  const u = (
    await empty.client.query(
      'SELECT phone,password_hash FROM users WHERE id=$1',
      [payload.sub],
    )
  ).rows[0];
  assert.equal(u.phone, '+526641234567');
  const bcrypt = await import('bcrypt');
  assert(await bcrypt.compare(valid.password, u.password_hash));
  assert.equal(
    (
      await post('/auth/register', {
        ...valid,
        email: valid.email.toUpperCase(),
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await post('/auth/register', {
        ...valid,
        email: 'phone2@uabc.edu.mx',
        phone: '+525512345678',
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await post('/auth/login', {
        email: valid.email.toUpperCase(),
        password: valid.password,
      })
    ).status,
    200,
  );
  const wrong = await post('/auth/login', {
    email: valid.email,
    password: 'wrong',
  });
  const missing = await post('/auth/login', {
    email: 'missing@uabc.edu.mx',
    password: 'wrong',
  });
  assert.equal(wrong.status, 401);
  assert.deepEqual(wrong, missing);
  const cors = await fetch(base + '/auth/register', {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:8081',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type,Idempotency-Key',
    },
  });
  assert.equal(cors.status, 204);
  assert.equal(
    cors.headers.get('access-control-allow-origin'),
    'http://localhost:8081',
  );
  const denied = await fetch(base, {
    headers: { Origin: 'https://unknown.example' },
  });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  const notfound = await fetch(base + '/missing');
  assert.equal(notfound.status, 404);
  assert.equal((await notfound.json()).error, 'Not Found');
  pass(
    'AC-01 / 0002 backend: PORT, arranque Prisma, validación, CORS, registro, hash, UUID, login y duplicados',
  );
  assert.deepEqual((await inventory(admin)).tables, evidence.original.tables);
  pass('base original sin cambios durante todas las pruebas aisladas');
} finally {
  if (backend && backend.exitCode === null) {
    backend.kill();
    await once(backend, 'exit');
  }
  for (const client of clients) await client.end();
  await admin.end();
  writeFileSync(
    `.local/verification/${prefix}.json`,
    JSON.stringify(evidence, null, 2),
  );
  console.log('Evidencia:', `.local/verification/${prefix}.json`);
}
