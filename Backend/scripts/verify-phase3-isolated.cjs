// Keeps the verifier's preservation baseline separate from a developer using the local app.
require('dotenv').config({ quiet: true });
const pg = require('pg');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdirSync, readFileSync, readdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
(async () => {
  const original = new URL(process.env.DATABASE_URL);
  const reference = `tapcampus_reference_${Date.now()}`;
  assert.match(reference, /^tapcampus_reference_\d+$/); assert.notEqual('/' + reference, original.pathname);
  const admin = new pg.Client({ connectionString: original.href }); await admin.connect();
  let db;
  try {
    await admin.query(`CREATE DATABASE "${reference}"`);
    const url = new URL(original); url.pathname = '/' + reference;
    db = new pg.Client({ connectionString: url.href }); await db.connect();
    await db.query('CREATE TABLE preservation_reference (id integer PRIMARY KEY, value text NOT NULL)');
    await db.query('INSERT INTO preservation_reference VALUES (1,$1)', ['Fuente aislada: conservar este registro']);
    const directory = resolve('.local/verification'); const before = new Set(readdirSync(directory));
    const run = spawnSync(process.execPath, ['scripts/verify-phase3.mjs'], { env: { ...process.env, DATABASE_URL: url.href }, encoding: 'utf8', windowsHide: true, timeout: 240000 });
    process.stdout.write(run.stdout ?? ''); process.stderr.write(run.stderr ?? '');
    const created = readdirSync(directory).filter(name => /^tapcampus_phase3_\d+$/.test(name) && !before.has(name)); assert.equal(created.length, 1);
    const evidence = JSON.parse(readFileSync(resolve(directory, created[0], 'phase3.json'), 'utf8'));
    const dir = resolve('../specs/0047-usabilidad-y-recogida/evidence'); mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'phase3-current.json'), JSON.stringify({ referenceIsolated: true, explanation: 'El origen de preservación es una referencia propia con datos. La app local puede seguir en uso; sus cambios no invalidan la prueba ni se revierten.', ...evidence }, null, 2));
    assert.equal(run.status, 0, 'Regresión de fase 3 fallida; revisar evidencia');
    assert.deepEqual((await db.query('SELECT * FROM preservation_reference')).rows, [{ id: 1, value: 'Fuente aislada: conservar este registro' }]);
  } finally {
    if (db) await db.end(); await admin.query(`DROP DATABASE IF EXISTS "${reference}"`); await admin.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
