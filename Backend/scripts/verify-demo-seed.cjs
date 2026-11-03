require('ts-node/register');

const assert = require('node:assert/strict');
const { mkdir, mkdtemp, readFile, stat } = require('node:fs/promises');
const { join } = require('node:path');
const { seedDemoPublications } = require('../prisma/seed-demo-publications.ts');
const { zoneNames, categoryNames } = require('../prisma/catalogs.ts');

async function main() {
  const records = new Map();
  const zones = zoneNames.map((name, index) => ({ id: index + 1, name }));
  const categories = Object.entries(categoryNames).flatMap(([type, names]) =>
    names.map((name, index) => ({ id: type === 'LIVE' ? index + 1 : index + 5, name, type })),
  );
  let sellerExists = true;
  const prisma = {
    user: { findUnique: async () => sellerExists ? { id: '30000000-0000-4000-8000-000000000001' } : null },
    $transaction: async (callback) => callback({
      zone: { findMany: async () => zones },
      category: { findMany: async () => categories },
      publication: {
        createMany: async ({ data, skipDuplicates }) => {
          assert.equal(skipDuplicates, true);
          let count = 0;
          for (const row of data) {
            if (records.has(row.id)) continue;
            records.set(row.id, structuredClone(row));
            count++;
          }
          return { count };
        },
      },
    }),
  };

  await mkdir(join(process.cwd(), '.local'), { recursive: true });
  process.env.UPLOADS_DIR = await mkdtemp(join(process.cwd(), '.local', 'demo-seed-'));
  process.env.SEED_DEMO_SELLER_EMAIL = 'demo@uabc.edu.mx';
  process.env.SEED_PUBLIC_BASE_URL = 'http://127.0.0.1:3000';

  sellerExists = false;
  await assert.rejects(seedDemoPublications(prisma), /vendedor de demo/);
  assert.equal(records.size, 0);
  sellerExists = true;
  process.env.SEED_PUBLIC_BASE_URL = 'http://127.0.0.1:3000/ruta';
  await assert.rejects(seedDemoPublications(prisma), /origen HTTP/);
  assert.equal(records.size, 0);
  process.env.SEED_PUBLIC_BASE_URL = 'http://127.0.0.1:3000';

  assert.equal(await seedDemoPublications(prisma), 24);
  assert.equal(records.size, 24);
  const firstRun = structuredClone([...records]);
  assert.equal(await seedDemoPublications(prisma), 0);
  assert.deepEqual([...records], firstRun);

  const all = [...records.values()];
  assert.equal(all.filter((row) => row.type === 'LIVE').length, 12);
  assert.equal(all.filter((row) => row.type === 'STATIC').length, 12);
  const newRows = all.filter((row) => Number(row.id.slice(-12)) > 8);
  assert.equal(newRows.length, 16);
  for (const category of categories) {
    assert.equal(newRows.filter((row) => row.category_id === category.id).length, 2);
  }
  assert.equal(new Set(newRows.map((row) => row.title)).size, 16);
  assert.equal(newRows.filter((row) => row.ganga_activation_mode === 'MANUAL').length, 1);
  assert.equal(newRows.filter((row) => row.ganga_activation_mode === 'SCHEDULED').length, 1);

  for (const row of all) {
    assert.match(row.title, /^Demo: /);
    assert.ok(zones.some((zone) => zone.id === row.zone_id));
    assert.ok(categories.some((category) => category.id === row.category_id && category.type === row.type));
    if (row.type === 'LIVE') {
      assert.ok(row.initial_stock > 0 && row.current_stock === row.initial_stock);
      assert.ok(row.start_time < row.end_time);
    } else {
      assert.equal(row.initial_stock, undefined);
      assert.equal(row.end_time, undefined);
    }
    const filename = row.image_url.split('/').at(-1);
    const path = join(process.env.UPLOADS_DIR, filename);
    assert.ok((await stat(path)).size > (newRows.includes(row) ? 100_000 : 100));
    assert.deepEqual((await readFile(path)).subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  assert.ok(newRows.every((row) => row.description.includes('imagen y contacto ilustrativos')));
  console.log('PASS: 24 publicaciones (12 LIVE/12 STATIC), 16 nuevas, dos por categoría, PNG y seed repetible');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
