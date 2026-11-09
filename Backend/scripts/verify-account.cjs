require('dotenv/config');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { JwtService } = require('@nestjs/jwt');
const { jwtSecret } = require('../dist/auth/jwt-secret');

(async () => {
  const prisma = new PrismaService();
  try {
    const user = await prisma.user.findFirstOrThrow({ select: { id: true, name: true, email: true, phone: true } });
    const token = new JwtService({ secret: jwtSecret() }).sign({ sub: user.id }, { expiresIn: '60s' });
    const origins = ['http://127.0.0.1:3000'];
    const publicOrigin = process.env.VERIFY_PUBLIC_ORIGIN;
    assert(publicOrigin, 'Configura VERIFY_PUBLIC_ORIGIN igual al origen usado por Expo');
    const checks = [];
    for (const origin of origins) {
      const response = await fetch(origin + '/auth/me', { headers: { Authorization: 'Bearer ' + token } });
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.deepEqual(Object.keys(data).sort(), ['email', 'id', 'name', 'phone']);
      assert.deepEqual(data, user);
      const anonymous = await fetch(origin + '/auth/me');
      assert.equal(anonymous.status, 401);
      const invalid = await fetch(origin + '/auth/me', { headers: { Authorization: 'Bearer invalid' } });
      assert.equal(invalid.status, 401);
      const other = await fetch(origin + '/auth/me?id=00000000-0000-4000-8000-000000000000', { headers: { Authorization: 'Bearer ' + token } });
      assert.equal(other.status, 200);
      assert.deepEqual(await other.json(), user);
      checks.push({ origin, authenticatedStatus: 200, ownProfileMatches: true, anonymousStatus: 401, invalidStatus: 401, clientIdCannotChangeOwner: true });
    }
    // En LAN solo verificar existencia y protección; nunca enviar tokens o datos personales.
    const publicResponse = await fetch(publicOrigin + '/auth/me');
    assert.equal(publicResponse.status, 401);
    const evidence = { date: new Date().toISOString(), fields: ['email', 'id', 'name', 'phone'], checks, lan: { origin: publicOrigin, anonymousStatus: 401 }, note: 'JWT temporal de 60s solo loopback; no se registran token ni datos personales; LAN sin credenciales.' };
    fs.mkdirSync('.local', { recursive: true });
    fs.writeFileSync('.local/account-0026-smoke.json', JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify(evidence));
  } finally { await prisma.$disconnect(); }
})().catch(() => { console.error('FAIL: el perfil real no cumple el contrato en loopback/LAN.'); process.exitCode = 1; });
