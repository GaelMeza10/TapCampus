import 'dotenv/config';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import pg from 'pg';

// Rehearsal on a restored copy. Source migration is opt-in, after every check passes.
const require = createRequire(import.meta.url);
const source = new URL(process.env.DATABASE_URL);
assert(['localhost', '127.0.0.1'].includes(source.hostname), 'Solo entorno local');
const stamp = Date.now();
const database = `tapcampus_condition_${stamp}`;
const restoreUrl = new URL(source); restoreUrl.pathname = `/${database}`;
const backup = `/tmp/${database}.dump`;
const container = process.env.PG_TOOLS_CONTAINER ?? 'backend-postgres-1';
const migration = '20261122010000_product_condition';
const folder = '.local/verification/condition';
mkdirSync(folder, { recursive: true });
const evidence = { date: new Date().toISOString(), database, backup, checks: [], requests: 0, appliedLocal: false };
const admin = new pg.Client({ connectionString: source.href });
let db, app, prisma;
function command(file, args, env = {}) {
  const result = spawnSync(file, args, { env: { ...process.env, ...env }, encoding: 'utf8', timeout: 120000, windowsHide: true });
  assert.equal(result.status, 0, result.error?.message ?? result.stderr + result.stdout);
}
function pass(check) { evidence.checks.push(check); console.log('PASS', check); }
function pgtool(tool, args) { command('docker', ['exec', container, tool, '-U', decodeURIComponent(source.username), ...args]); }
async function snapshot(client) {
  const { rows: tables } = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations' ORDER BY tablename");
  const result = {};
  for (const { tablename } of tables) {
    const { rows } = await client.query(`SELECT to_jsonb(t) - 'condition' AS data FROM "${tablename.replaceAll('"', '""')}" t ORDER BY (to_jsonb(t) - 'condition')::text`);
    result[tablename] = { count: rows.length, hash: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
  }
  return result;
}
try {
  await admin.connect();
  const history = (await admin.query('SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL')).rows.map(r => r.migration_name);
  const pending = readdirSync('prisma/migrations', { withFileTypes: true }).filter(d => d.isDirectory() && !history.includes(d.name)).map(d => d.name);
  assert(pending.every(name => name === migration), 'Hay otras migraciones pendientes: no aplicar');
  const before = await snapshot(admin);
  writeFileSync(`${folder}/inventory-before.json`, JSON.stringify(before, null, 2));
  pgtool('pg_dump', ['-d', decodeURIComponent(source.pathname.slice(1)), '-Fc', '-f', backup]);
  await admin.query(`CREATE DATABASE "${database}"`);
  pgtool('pg_restore', ['-d', database, '--exit-on-error', '--no-owner', backup]);
  db = new pg.Client({ connectionString: restoreUrl.href }); await db.connect();
  assert.deepEqual(await snapshot(db), before); pass('respaldo restaurado: filas y hashes idénticos');
  command(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { DATABASE_URL: restoreUrl.href });
  assert.deepEqual(await snapshot(db), before); pass('migración ensayada sin alterar datos históricos');
  if (!history.includes(migration)) {
    assert.equal(Number((await db.query('SELECT count(*) FROM publications WHERE condition IS NOT NULL')).rows[0].count), 0);
    pass('condición histórica NULL sin backfill inventado');
  }
  const { Test } = require('@nestjs/testing');
  const { ValidationPipe } = require('@nestjs/common');
  const { PassportModule } = require('@nestjs/passport');
  const { JwtService } = require('@nestjs/jwt');
  const request = require('supertest');
  process.env.DATABASE_URL = restoreUrl.href;
  process.env.JWT_SECRET = 'isolated-product-condition-fixture-secret';
  const { PrismaService } = require('../dist/prisma/prisma.service');
  const { CatalogsService } = require('../dist/catalogs/catalogs.service');
  const { PublicationsService } = require('../dist/publications/publications.service');
  const { PublicationsController } = require('../dist/publications/publications.controller');
  const { JwtStrategy } = require('../dist/auth/jwt.strategy');
  prisma = new PrismaService(); await prisma.$connect();
  const sellerId = randomUUID(), otherId = randomUUID();
  for (const id of [sellerId, otherId]) await prisma.user.create({ data: { id, name: 'Fixture condición', email: `${id}@uabc.edu.mx`, password_hash: 'fixture', phone: '+526641234567' } });
  const zone = await prisma.zone.findFirstOrThrow();
  const category = await prisma.category.findFirstOrThrow({ where: { type: 'STATIC' } });
  const liveCategory = await prisma.category.findFirstOrThrow({ where: { type: 'LIVE' } });
  const service = new PublicationsService(prisma, new CatalogsService(prisma), { validateImageUrl: async () => {} }, { stockUpdated() {} }, { publication: async () => {} });
  const module = await Test.createTestingModule({ imports: [PassportModule], controllers: [PublicationsController], providers: [JwtStrategy, { provide: PrismaService, useValue: prisma }, { provide: PublicationsService, useValue: service }] }).compile();
  app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
  const jwt = new JwtService({ secret: process.env.JWT_SECRET });
  const token = jwt.sign({ sub: sellerId }, { expiresIn: '1h' });
  const otherToken = jwt.sign({ sub: otherId }, { expiresIn: '1h' });
  async function http(method, path, body, expected, auth = token) {
    let req = request(app.getHttpServer())[method](path);
    if (auth) req = req.set('Authorization', `Bearer ${auth}`);
    if (body !== undefined) req = req.send(body);
    const response = await req; evidence.requests++;
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(response.body)}`);
    return response.body;
  }
  const payload = { type: 'STATIC', title: 'Libro de prueba', description: 'Artículo de prueba aislado', price: 120, image_url: '/uploads/fixture.png', zone_id: zone.id, category_id: category.id };
  for (const condition of [undefined, null, 'BROKEN', 1]) await http('post', '/publications', { ...payload, ...(condition !== undefined ? { condition } : {}) }, 400);
  const fresh = await http('post', '/publications', { ...payload, condition: 'NEW' }, 201);
  const used = await http('post', '/publications', { ...payload, condition: 'USED' }, 201);
  assert.equal(fresh.condition, 'NEW'); assert.equal(used.condition, 'USED');
  assert.equal((await prisma.publication.findUniqueOrThrow({ where: { id: fresh.id } })).condition, 'NEW');
  pass('POST STATIC exige condición y persiste NEW/USED');
  for (const condition of [null, 'BROKEN', 1]) await http('patch', `/publications/${fresh.id}`, { condition }, 400);
  await http('patch', `/publications/${fresh.id}`, { condition: 'USED' }, 403, otherToken);
  await http('patch', `/publications/${fresh.id}`, { condition: 'USED' }, 401, null);
  assert.equal((await http('patch', `/publications/${fresh.id}`, { condition: 'USED' }, 200)).condition, 'USED');
  assert.equal((await http('patch', `/publications/${fresh.id}`, { title: 'Título actualizado' }, 200)).condition, 'USED');
  assert.equal((await http('get', `/publications/${fresh.id}`, undefined, 200)).condition, 'USED');
  const rows = await http('get', '/publications?type=STATIC', undefined, 200);
  assert.equal(rows.find(r => r.id === used.id).condition, 'USED');
  assert(!rows.some(r => r.sellerContact || r.ganga_min_price));
  pass('PATCH conserva omisión, valida, protege propiedad y expone condición pública sin contactos');
  const legacy = await prisma.publication.create({ data: { ...payload, seller_id: sellerId } });
  assert.equal((await http('patch', `/publications/${legacy.id}`, { title: 'Histórico actualizado' }, 200)).condition, null);
  assert.equal((await http('patch', `/publications/${legacy.id}`, { condition: 'NEW' }, 200)).condition, 'NEW');
  const live = { ...payload, type: 'LIVE', category_id: liveCategory.id, initial_stock: 3, start_time: new Date(Date.now() - 60000).toISOString(), end_time: new Date(Date.now() + 3600000).toISOString() };
  await http('post', '/publications', { ...live, condition: 'NEW' }, 400);
  const open = await http('post', '/publications', live, 201);
  assert.equal(open.condition, null);
  await http('patch', `/publications/${open.id}`, { condition: 'USED' }, 400);
  await db.query('BEGIN');
  try {
    await assert.rejects(db.query('UPDATE publications SET condition=$1 WHERE id=$2', ['NEW', open.id]), e => e.code === '23514');
  } finally { await db.query('ROLLBACK'); }
  pass('históricos editables y LIVE protegido también por CHECK SQL');
  await app.close(); app = undefined; await prisma.$disconnect(); prisma = undefined;
  process.env.DATABASE_URL = source.href;
  assert.deepEqual(await snapshot(admin), before);
  if (process.argv.includes('--apply-local')) {
    command(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { DATABASE_URL: source.href });
    assert.deepEqual(await snapshot(admin), before);
    evidence.appliedLocal = true;
    pass('migración local aplicada con datos originales intactos');
  }
} catch (error) {
  evidence.error = error.message; process.exitCode = 1; console.error(error.message);
} finally {
  await app?.close(); await prisma?.$disconnect(); await db?.end(); await admin.end();
  writeFileSync(`${folder}/result.json`, JSON.stringify(evidence, null, 2));
}
