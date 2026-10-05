import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { transitionLegacy } from './legacy-transition.mjs';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
function prisma(...args) {
  const result = spawnSync(
    process.execPath,
    ['node_modules/prisma/build/index.js', ...args],
    { stdio: 'inherit' },
  );
  if (result.status !== 0)
    throw new Error(
      'Prisma terminó con error; revisar historial antes de reintentar',
    );
}
try {
  await client.connect();
  const tables = (
    await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'",
    )
  ).rows.map((t) => t.tablename);
  if (
    tables.some((t) => t !== '_prisma_migrations') &&
    !process.argv.includes('--backup-verified')
  ) {
    throw new Error(
      'Base existente: requiere inventario, respaldo restaurado y ensayo aislado; indicar --backup-verified solo tras comprobarlos',
    );
  }
  if (tables.includes('usuarios')) {
    if (!tables.includes('_prisma_migrations'))
      throw new Error(
        'DEC: esquema antiguo sin historial verificable; requiere inventario y baseline explícito',
      );
    const history = (
      await client.query(
        'SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL',
      )
    ).rows.map((r) => r.migration_name);
    if (
      !['20260910011413_init', '20260910012517_fix_estado_reserva'].every((m) =>
        history.includes(m),
      )
    ) {
      throw new Error(
        'DEC: transición requiere las dos migraciones antiguas comprobadas; revisar estados antes de convertir',
      );
    }
    const arg = process.argv.indexOf('--legacy-manifest');
    const count = Number(
      (await client.query('SELECT count(*) FROM reservas')).rows[0].count,
    );
    if (arg < 0 && count > 0)
      throw new Error(
        'DEC-02: se requiere --legacy-manifest con precios originales y procedencia',
      );
    const manifest =
      arg < 0 ? {} : JSON.parse(readFileSync(process.argv[arg + 1], 'utf8'));
    console.log(
      'Transición preservada:',
      await transitionLegacy(client, manifest),
    );
    prisma(
      'migrate',
      'resolve',
      '--applied',
      '20260929232323_sdd_architecture',
    );
  } else if (tables.includes('reservations')) {
    const history = (
      await client.query(
        'SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL',
      )
    ).rows.map((r) => r.migration_name);
    if (!history.includes('20260929232323_sdd_architecture')) {
      throw new Error(
        'DEC: tablas modernas sin historial de arquitectura confirmado; comprobar transición y resolver historial antes de desplegar',
      );
    }
    const count = Number(
      (await client.query('SELECT count(*) FROM reservations')).rows[0].count,
    );
    const hasPrice = (
      await client.query(
        "SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservations' AND column_name='unit_price'",
      )
    ).rowCount;
    if (
      count &&
      (!hasPrice ||
        Number(
          (
            await client.query(
              'SELECT count(*) FROM reservations WHERE unit_price IS NULL',
            )
          ).rows[0].count,
        ))
    ) {
      throw new Error(
        'DEC-02: reservas sin precio original comprobado; ejecutar backfill-reservation-prices.mjs con manifiesto antes de desplegar',
      );
    }
  }
  prisma('migrate', 'deploy');
} catch (error) {
  console.error(
    error.message.startsWith('DEC') ||
      error.message.startsWith('Base existente')
      ? error.message
      : 'Migración detenida: revisar inventario, conversión e historial.',
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
