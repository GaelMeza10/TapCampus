// Pruebas CL de 0040 sobre una BD/API/colas nuevas. --serve conserva solo el fixture.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { inventory } from './db-inventory.mjs';

const run = `tapcampus_edges_${Date.now()}`;
const artifacts = resolve('.local/verification', run);
mkdirSync(artifacts, { recursive: true });
const source = new URL(process.env.DATABASE_URL);
const testUrl = new URL(source); testUrl.pathname = `/${run}`;
const admin = new pg.Client({ connectionString: source.href });
const db = new pg.Client({ connectionString: testUrl.href });
const port = Number(process.env.EDGE_QA_PORT ?? 43840);
const base = `http://127.0.0.1:${port}`;
const evidence = { date: new Date().toISOString(), run, node: process.version, requests: 0, checks: [], result: 'RUNNING' };
const jwtSecret = randomUUID() + randomUUID();
const password = 'QA-' + randomUUID();
let server, connected = false, stopping = false, expiryTimer;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function persist() { writeFileSync(resolve(artifacts, 'edges.json'), JSON.stringify(evidence, null, 2)); }
async function request(path, { method = 'GET', body, token, expected } = {}) {
  evidence.requests++;
  const result = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  const data = await result.json();
  if (expected !== undefined) assert.equal(result.status, expected, `${method} ${path}: expected ${expected}, received ${result.status}`);
  return { status: result.status, data };
}
async function check(caseId, variant, action) {
  try { await action(); evidence.checks.push({ caseId, variant, result: 'PASS', surface: 'HTTP/SQL' }); console.log('PASS', caseId, variant); }
  catch (error) { evidence.checks.push({ caseId, variant, result: 'FAIL', surface: 'HTTP/SQL', error: error.message }); console.log('FAIL', caseId, variant, error.message); }
  persist();
}
function command(args) {
  const result = spawnSync(process.execPath, args, { env: { ...process.env, DATABASE_URL: testUrl.href }, encoding: 'utf8', timeout: 120000, windowsHide: true });
  assert.equal(result.status, 0, 'Fixture schema/seed failed');
}
async function stop() {
  if (stopping) return; stopping = true; clearInterval(expiryTimer);
  if (server && server.exitCode === null) { const exited = once(server, 'exit'); server.kill(); await exited; }
  if (connected) await db.end();
  evidence.originalAfter = (await inventory(admin)).tables;
  assert.deepEqual(evidence.originalAfter, evidence.originalBefore);
  evidence.originalDataUnchanged = true; persist(); await admin.end();
  console.log('Fixture detenido; datos originales intactos. Evidencia:', resolve(artifacts, 'edges.json'));
}
try {
  await admin.connect(); evidence.originalBefore = (await inventory(admin)).tables;
  assert.match(run, /^tapcampus_edges_\d+$/);
  await admin.query(`CREATE DATABASE "${run}"`);
  command(['node_modules/prisma/build/index.js', 'migrate', 'deploy']);
  command(['node_modules/prisma/build/index.js', 'db', 'seed']);
  await db.connect(); connected = true;
  server = spawn(process.execPath, ['dist/main.js'], { env: { ...process.env, DATABASE_URL: testUrl.href, JWT_SECRET: jwtSecret, PORT: String(port), PUBLIC_BASE_URL: base, UPLOADS_DIR: resolve(artifacts, 'uploads'), BULLMQ_PREFIX: run, RECONCILIATION_INTERVAL_MS: '1000' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let serverLog = ''; server.stdout.on('data', data => { serverLog += data; }); server.stderr.on('data', data => { serverLog += data; });
  server.on('exit', () => writeFileSync(resolve(artifacts, 'backend.log'), serverLog));
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw Error('Fixture API did not start');
    try { ready = (await fetch(base)).ok; } catch {}
    if (ready) break; await sleep(500);
  }
  assert(ready, 'Fixture readiness timed out');
  const people = {};
  for (const [index, role] of ['buyer', 'seller', 'other'].entries()) {
    const email = `qa.${role}.${Date.now()}@uabc.edu.mx`;
    const registration = await request('/auth/register', { method: 'POST', body: { name: `QA ${role}`, email, password, phone: index ? '5512345678' : '6641234567' }, expected: 201 });
    people[role] = { email, password, token: registration.data.access_token };
  }
  const seller = people.seller.token;
  const zones = (await request('/zones')).data;
  const liveCategory = (await request('/categories?type=LIVE')).data[0].id;
  const staticCategory = (await request('/categories?type=STATIC')).data[0].id;
  const form = new FormData(); form.append('file', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1sAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'qa.png');
  const upload = await fetch(base + '/uploads', { method: 'POST', headers: { Authorization: `Bearer ${seller}` }, body: form }); assert.equal(upload.status, 201);
  const image = (await upload.json()).image_url;
  const common = { title: 'QA Producto', description: 'Solo fixture aislado de casos limite', image_url: image, price: 30, zone_id: zones[0].id };
  const live = { ...common, type: 'LIVE', category_id: liveCategory, initial_stock: 3, start_time: new Date(Date.now() - 60000).toISOString(), end_time: new Date(Date.now() + 4 * 3600000).toISOString() };
  const stat = { ...common, type: 'STATIC', condition: 'USED', category_id: staticCategory };
  const create = async body => (await request('/publications', { method: 'POST', body, token: seller, expected: 201 })).data;
  const product = await create(live), book = await create(stat), expiryProduct = await create({ ...live, title: 'QA Expiracion real 20 min', initial_stock: 1 });
  const expiredResponse = await fetch(base + '/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${people.buyer.token}`, 'Idempotency-Key': randomUUID() }, body: JSON.stringify({ publicationId: expiryProduct.id }) });
  assert.equal(expiredResponse.status, 201); const expiry = await expiredResponse.json();
  evidence.expiry = { reservationId: expiry.id, publicationId: expiryProduct.id, reservedAt: expiry.reservedAt, expiresAt: expiry.expiresAt, realTimeCheck: 'PENDING' };
  const credentials = { run, port, base, artifacts, people, publicationId: product.id, staticId: book.id, expiryId: expiry.id };
  writeFileSync(resolve(artifacts, 'private-fixture.json'), JSON.stringify(credentials, null, 2));
  writeFileSync(resolve('.local', 'edge0040-current.json'), JSON.stringify({ run, artifacts, base, port }, null, 2));
  const patch = (body, expected = 400) => request(`/publications/${product.id}`, { method: 'PATCH', body, token: seller, expected });
  await check('CL-07', 'login vacio', () => request('/auth/login', { method: 'POST', body: {}, expected: 400 }));
  await check('CL-08', 'registro vacio', () => request('/auth/register', { method: 'POST', body: {}, expected: 400 }));
  for (const type of ['LIVE', 'STATIC']) await check(type === 'LIVE' ? 'CL-09' : 'CL-10', `${type} vacia`, () => request('/publications', { method: 'POST', body: { type }, token: seller, expected: 400 }));
  for (const body of [{ name: '' }, { phone: '' }]) await check('CL-11', `perfil vacio ${Object.keys(body)[0]}`, () => request('/auth/me', { method: 'PATCH', body, token: seller, expected: 400 }));
  for (const field of ['price', 'current_stock']) {
    for (const value of ['abc', '1e3']) await check('CL-12', `${field}=${value}`, () => patch({ [field]: value }));
    await check('CL-13', `${field} negativo`, () => patch({ [field]: -1 }));
  }
  for (const value of [0, 0.001, 1.234, 100000000, 'Infinity']) await check('CL-14', `precio invalido ${value}`, () => patch({ price: value }));
  for (const value of [0.01, 99999999.99]) await check('CL-14', `precio extremo valido ${value}`, async () => { const r = await patch({ price: value }, 200); assert.equal(r.data.price, value.toFixed(2)); });
  await patch({ price: 30 }, 200);
  for (const value of [1.5, 2147483648]) await check('CL-15', `stock invalido ${value}`, () => patch({ current_stock: value }));
  await check('CL-15', 'crear stock cero', () => request('/publications', { method: 'POST', body: { ...live, initial_stock: 0 }, token: seller, expected: 400 }));
  for (const value of [0, 1, 2147483647]) await check('CL-15', `stock editable ${value}`, () => patch({ current_stock: value }, 200));
  await patch({ current_stock: 3 }, 200);
  await check('CL-16', 'nombre 200 letras persistido en perfil', async () => { const r = await request('/auth/me', { method: 'PATCH', token: seller, body: { name: 'A'.repeat(200) }, expected: 200 }); assert.equal(r.data.name.length, 200); });
  await check('CL-16', 'registro nombre 200 letras', () => request('/auth/register', { method: 'POST', body: { name: 'A'.repeat(200), email: `long.${Date.now()}@uabc.edu.mx`, password, phone: '6641234567' }, expected: 201 }));
  await check('CL-17', 'titulo 200 y descripcion 5000', async () => { const r = await patch({ title: 'A'.repeat(200), description: 'a'.repeat(5000) }, 200); assert.equal(r.data.title.length, 200); assert.equal(r.data.description.length, 5000); });
  await check('CL-17', 'Unicode y simbolos', () => patch({ title: 'Café & libro / ñ + 50% 📚' }, 200));
  for (const field of ['title', 'description']) await check('CL-18', `${field} espacios`, () => patch({ [field]: '   ' }));
  await check('CL-18', 'perfil nombre espacios', () => request('/auth/me', { method: 'PATCH', token: seller, body: { name: '   ' }, expected: 400 }));
  await check('CL-18', 'registro nombre espacios', () => request('/auth/register', { method: 'POST', body: { name: '   ', email: `spaces.${Date.now()}@uabc.edu.mx`, password, phone: '6641234567' }, expected: 400 }));
  for (const email of ['qa@gmail.com', 'qa@uabc.edu.mx.otro.mx', 'qa@']) await check('CL-19', `correo invalido ${email}`, () => request('/auth/register', { method: 'POST', body: { name: 'QA', email, password, phone: '6641234567' }, expected: 400 }));
  for (const phone of ['123', '-6641234567', '66412345678', '+15551234567']) await check('CL-20', 'telefono invalido ' + phone.length, () => request('/auth/me', { method: 'PATCH', token: seller, body: { phone }, expected: 400 }));
  for (const phone of ['6641234567', '+526641234567']) await check('CL-20', 'telefono canonico ' + phone.length, async () => { const r = await request('/auth/me', { method: 'PATCH', token: seller, body: { phone }, expected: 200 }); assert.equal(r.data.phone, '+526641234567'); });
  await check('CL-33', 'reservas y ventas de cuenta nueva vacias', async () => { assert.deepEqual((await request('/reservations/mine', { token: people.other.token, expected: 200 })).data, []); assert.deepEqual((await request('/publications/mine', { token: people.other.token, expected: 200 })).data, []); });
  await check('CL-34', 'busqueda sin coincidencias', async () => { assert.deepEqual((await request('/publications?q=zzzz-no-existe-qa', { expected: 200 })).data, []); });
  await check('CL-42', 'ajeno no edita ni lee reserva de otro', async () => { await request(`/publications/${product.id}`, { method: 'PATCH', token: people.other.token, body: { price: 1 }, expected: 403 }); await request(`/reservations/${expiry.id}`, { token: people.other.token, expected: 403 }); });
  for (const type of ['LIVE', 'STATIC']) for (const field of ['title', 'description']) await check('CL-43', `${type} contenido ${field}`, async () => { const id = type === 'LIVE' ? product.id : book.id; const r = await request(`/publications/${id}`, { method: 'PATCH', token: seller, body: { [field]: 'pendejo' }, expected: 400 }); assert.equal(r.data.code, 'PUBLICATION_CONTENT_BLOCKED'); });
  await patch({ title: 'QA Producto', description: common.description }, 200);
  await request('/auth/me', { method: 'PATCH', token: seller, body: { name: 'QA seller' }, expected: 200 });
  evidence.result = evidence.checks.some(c => c.result === 'FAIL') ? 'FAILURES_FOUND' : 'PASS';
  evidence.originalAfter = (await inventory(admin)).tables; assert.deepEqual(evidence.originalAfter, evidence.originalBefore); evidence.originalDataUnchanged = true; persist();
  console.log('HTTP cases:', evidence.checks.length, 'fallos:', evidence.checks.filter(c => c.result === 'FAIL').length, 'Evidencia:', resolve(artifacts, 'edges.json'));
  if (process.argv.includes('--serve')) {
    console.log('Fixture listo en', base, '; credenciales privadas solo en .local. Escribir stop para detener.');
    expiryTimer = setInterval(async () => {
      if (evidence.expiry.realTimeCheck !== 'PENDING') return;
      try {
        const row = (await db.query('SELECT status FROM reservations WHERE id=$1', [expiry.id])).rows[0];
        if (row.status !== 'EXPIRED') return;
        const observedAt = new Date();
        const stock = (await db.query('SELECT current_stock FROM publications WHERE id=$1', [expiryProduct.id])).rows[0].current_stock;
        evidence.expiry = { ...evidence.expiry, observedAt: observedAt.toISOString(), elapsedMs: observedAt.getTime() - Date.parse(expiry.reservedAt), stock, realTimeCheck: stock === 1 && observedAt.getTime() >= Date.parse(expiry.expiresAt) ? 'PASS' : 'FAIL' }; persist();
        console.log('CL-39 expiracion real:', evidence.expiry.realTimeCheck);
      } catch { console.log('No se pudo observar expiracion; revisar fixture.'); }
    }, 10000);
    process.stdin.resume(); process.stdin.on('data', async bytes => { if (bytes.toString().trim() === 'stop') { await stop(); process.exitCode = evidence.result === 'FAILURES_FOUND' ? 1 : 0; process.stdin.pause(); } });
    process.on('SIGINT', async () => { await stop(); process.exit(0); });
  } else { await stop(); process.exitCode = evidence.result === 'FAILURES_FOUND' ? 1 : 0; }
} catch (error) { evidence.result = 'ERROR'; evidence.error = error.message; persist(); try { await stop(); } catch {} console.error(error.message); process.exitCode = 1; }
