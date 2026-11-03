require('dotenv/config');

const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/common/configure-app');
const { JobsService } = require('../dist/jobs/jobs.service');

async function main() {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(JobsService)
    .useValue({})
    .compile();
  const app = module.createNestApplication();
  configureApp(app);
  try {
    await app.init();
    const http = request(app.getHttpServer());
    for (const type of ['LIVE', 'STATIC']) {
      const response = await http.get(`/publications?type=${type}`).expect(200);
      assert.ok(Array.isArray(response.body));
      const newRows = response.body.filter((row) =>
        row.id.startsWith('20000000-0000-4000-8000-') &&
        Number(row.id.slice(-12)) >= 9 && Number(row.id.slice(-12)) <= 24,
      );
      assert.equal(newRows.length, 8, `${type}: deben aparecer los ocho anuncios nuevos`);
      assert.ok(newRows.every((row) => row.type === type));
      assert.ok(newRows.every((row) => row.title.startsWith('Demo: ')));
    }
    const image = await http.get('/uploads/10000000-0000-4000-8000-000000000009.png').expect(200);
    assert.match(image.headers['content-type'], /^image\/png/);
    assert.ok(image.body.length > 100_000);
    console.log('PASS: feed HTTP muestra 8 LIVE y 8 STATIC nuevos; fotografía local responde PNG 200');
  } finally {
    await app.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
