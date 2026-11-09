require('dotenv/config');
require('ts-node/register');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { seedDemoGangas } = require('./seed-demo-gangas.ts');
const ids = [1, 2, 3].map(n => `27000000-0000-4000-8000-${String(n).padStart(12, '0')}`);
const hash = rows => createHash('sha256').update(JSON.stringify(rows)).digest('hex');

(async () => {
  const prisma = new PrismaService();
  async function snapshot() {
    return {
      publications: hash(await prisma.publication.findMany({ where: { id: { notIn: ids } }, orderBy: { id: 'asc' } })),
      users: hash(await prisma.user.findMany({ orderBy: { id: 'asc' } })),
      reservations: hash(await prisma.reservation.findMany({ orderBy: { id: 'asc' } })),
      zones: hash(await prisma.zone.findMany({ orderBy: { id: 'asc' } })),
      categories: hash(await prisma.category.findMany({ orderBy: { id: 'asc' } })),
    };
  }
  try {
    const before = await snapshot();
    const existing = await prisma.publication.count({ where: { id: { in: ids } } });
    const firstCreated = await seedDemoGangas(prisma);
    const secondCreated = await seedDemoGangas(prisma);
    assert.equal(firstCreated, 3 - existing);
    assert.equal(secondCreated, 0);
    const after = await snapshot();
    assert.deepEqual(after, before, 'La demo no puede modificar filas anteriores');
    const rows = await prisma.publication.findMany({ where: { id: { in: ids } } });
    assert.equal(rows.length, 3);
    for (const row of rows) {
      assert(row.title.startsWith('Demo:') && row.is_ganga_active);
      assert(row.price_before_ganga.greaterThan(row.price));
      assert(row.price.equals(row.ganga_min_price));
      assert(row.current_stock > 0 && row.end_time > new Date());
    }
    const evidence = { date: new Date().toISOString(), firstCreated, secondCreated, count: rows.length, allDiscountsValid: true, unchanged: Object.keys(before), before, after };
    fs.mkdirSync('.local', { recursive: true });
    fs.writeFileSync('.local/gangas-0027.json', JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify(evidence));
  } finally { await prisma.$disconnect(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
