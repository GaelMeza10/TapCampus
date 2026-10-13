// Prueba HTTP sin puertos: el controlador Nest real recibe peticiones en memoria.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ts = require('typescript');
const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { PassportModule } = require('@nestjs/passport');
const { JwtService } = require('@nestjs/jwt');
const { AxiosError } = require(resolve(__dirname, '../../Frontend/node_modules/axios'));
const { ReservationsController } = require('../dist/reservations/reservations.controller');
const { ReservationsService } = require('../dist/reservations/reservations.service');
const { JwtStrategy } = require('../dist/auth/jwt.strategy');
const { PrismaService } = require('../dist/prisma/prisma.service');

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'fase4@uabc.edu.mx' };
const storage = new Map();
const store = {
  getItemAsync: async key => storage.get(key) ?? null,
  setItemAsync: async (key, value) => { storage.set(key, value); },
  deleteItemAsync: async key => { storage.delete(key); },
};
const tokenKey = 'tapcampus_access_token';
const frontend = resolve(__dirname, '../../Frontend/src');

function loadFrontend(relativePath, dependencies) {
  const source = readFileSync(resolve(frontend, relativePath), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', js)((id) => {
    if (id in dependencies) return dependencies[id];
    throw new Error(`Import no esperado: ${id}`);
  }, mod, mod.exports);
  return mod.exports;
}

async function main() {
  process.env.JWT_SECRET = 'isolated-phase4-jwt-fixture-secret';
  const moduleRef = await Test.createTestingModule({
    imports: [PassportModule],
    controllers: [ReservationsController],
    providers: [
      JwtStrategy,
      { provide: PrismaService, useValue: { user: { findUnique: async ({ where }) => where.id === user.id ? user : null } } },
      { provide: ReservationsService, useValue: { mine: async id => { assert.equal(id, user.id); return []; } } },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  try {
    const axios = require(resolve(__dirname, '../../Frontend/node_modules/axios'));
    const constants = { API_BASE_URL: 'http://in-memory.test', TOKEN_KEY: tokenKey };
    const { default: api, setUnauthorizedHandler } = loadFrontend('services/api.ts', {
      axios,
      'expo-secure-store': store,
      '../constants/api.constants': constants,
    });
    let invalidations = 0;
    const sentAuthorizations = [];
    setUnauthorizedHandler(async () => { invalidations++; await store.deleteItemAsync(tokenKey); });
    api.defaults.adapter = async config => {
      sentAuthorizations.push(config.headers.get('Authorization'));
      const response = await request(app.getHttpServer())
        .get(config.url)
        .set(config.headers.toJSON());
      const result = { data: response.body, status: response.status, statusText: String(response.status), headers: response.headers, config };
      if (response.status >= 400) throw new AxiosError(`HTTP ${response.status}`, 'ERR_BAD_RESPONSE', config, undefined, result);
      return result;
    };
    const valid = new JwtService({ secret: process.env.JWT_SECRET }).sign({ sub: user.id }, { algorithm: 'HS256', expiresIn: '1h' });
    await store.setItemAsync(tokenKey, valid);
    const authorized = await api.get('/reservations/mine');
    assert.equal(authorized.status, 200);
    assert.deepEqual(authorized.data, []);
    assert.equal(sentAuthorizations.at(-1), `Bearer ${valid}`);
    assert.equal(invalidations, 0);
    console.log('PASS JWT almacenado: Bearer admitido por JwtAuthGuard en GET /reservations/mine');

    await store.deleteItemAsync(tokenKey);
    await assert.rejects(api.get('/reservations/mine'), error => error.response?.status === 401);
    assert.equal(sentAuthorizations.at(-1), undefined);
    assert.equal(invalidations, 1);
    assert.equal(storage.has(tokenKey), false);
    console.log('PASS sin token: 401 real, sin Authorization, sesión invalidada');

    await store.setItemAsync(tokenKey, 'token-invalido');
    await assert.rejects(api.get('/reservations/mine'), error => error.response?.status === 401);
    assert.equal(invalidations, 2);
    assert.equal(storage.has(tokenKey), false);
    console.log('PASS token inválido: 401 real y borrado de sesión');
  } finally {
    await app.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
