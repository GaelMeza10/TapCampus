const { spawnSync, spawn } = require('node:child_process');
if (!process.env.PUBLIC_BASE_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.PUBLIC_BASE_URL = process.env.RENDER_EXTERNAL_URL;
}
if (!process.env.CORS_ORIGINS && process.env.PUBLIC_BASE_URL) {
  process.env.CORS_ORIGINS = process.env.PUBLIC_BASE_URL;
}
for (const args of [
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  ['-r', 'ts-node/register', 'scripts/seed-delivery.ts'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
}
const server = spawn(process.execPath, ['dist/main.js'], { stdio: 'inherit', env: process.env });
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.kill(signal));
server.on('error', () => process.exit(1));
server.on('exit', (code, signal) => process.exit(code ?? (signal ? 0 : 1)));
