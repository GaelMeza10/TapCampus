import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { deliveryPeople } from '../prisma/delivery-data';
import { seedDelivery } from '../prisma/seed-delivery';

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const accessPath = resolve('.local/demo-access.json');
  try {
    let stored: { password?: string } = {};
    try { stored = JSON.parse(await readFile(accessPath, 'utf8')); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    const existing = await prisma.user.count({ where: { email: { in: deliveryPeople.map(p => p.email) } } });
    const supplied = process.env.SEED_DEMO_PASSWORD || stored.password;
    if (existing && !supplied) throw new Error('Las cuentas ya existen. Recupera .local/demo-access.json o indica su contraseña en SEED_DEMO_PASSWORD; no se restableció ninguna.');
    const password = supplied || `Campus-${randomBytes(12).toString('base64url')}`;
    const result = await seedDelivery(prisma, { password });
    await mkdir(resolve('.local'), { recursive: true });
    await writeFile(accessPath, JSON.stringify({ purpose: 'Demostración académica; identidades y teléfonos ficticios.', password, users: deliveryPeople.map(({ name, email }, index) => ({ name, email, recorrido: index < 4 ? 'Mis ventas y entregas' : 'Mis reservas e historial' })) }, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ ...result, accessFile: '.local/demo-access.json' }, null, 2));
  } finally { await prisma.$disconnect(); }
}
void main().catch(error => { console.error(error instanceof Error ? error.message : 'No se pudo preparar el seed de entrega.'); process.exitCode = 1; });
