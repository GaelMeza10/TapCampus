// Renombra únicamente los tres títulos originales de 0027, sin modificar otros datos.
require('dotenv/config');
const { Client } = require('pg');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pairs = ['Brownie de chocolate', 'Café frío de vainilla', 'Torta de pollo'].map((name, i) => ({
  id: `27000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
  old: `Demo: ${name} en ganga`, title: `Demo: ${name} en oferta`,
}));
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const before = (await client.query('SELECT * FROM publications ORDER BY id FOR UPDATE')).rows;
    let changed = 0;
    for (const row of pairs) {
      changed += (await client.query('UPDATE publications SET title=$1 WHERE id=$2 AND title=$3', [row.title, row.id, row.old])).rowCount;
    }
    const after = (await client.query('SELECT * FROM publications ORDER BY id')).rows;
    assert.deepEqual(after, before.map(row => {
      const pair = pairs.find(pair => pair.id === row.id && pair.old === row.title);
      return pair ? { ...row, title: pair.title } : row;
    }));
    let repeated = 0;
    for (const row of pairs) repeated += (await client.query('UPDATE publications SET title=$1 WHERE id=$2 AND title=$3', [row.title, row.id, row.old])).rowCount;
    assert.equal(repeated, 0);
    await client.query('COMMIT');
    const evidence = { date: new Date().toISOString(), changed, repeated, allOtherPublicationFieldsPreserved: true, titles: after.filter(row => pairs.some(pair => pair.id === row.id)).map(row => ({ id: row.id, title: row.title })) };
    fs.mkdirSync('.local', { recursive: true });
    fs.writeFileSync('.local/offer-titles-0030.json', JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify(evidence));
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
})().catch(() => { console.error('No se pudieron renombrar las demos; transacción revertida.'); process.exitCode = 1; });
