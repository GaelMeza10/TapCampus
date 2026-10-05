import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { priceEvidence } from './legacy-transition.mjs';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  if (!process.argv.includes('--backup-verified') || !process.argv[2])
    throw new Error(
      'Requiere manifiesto y --backup-verified tras ensayo de recuperación',
    );
  const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  await client.connect();
  await client.query('BEGIN');
  await client.query('LOCK TABLE reservations IN ACCESS EXCLUSIVE MODE');
  const rows = (await client.query('SELECT id FROM reservations')).rows;
  for (const row of rows) priceEvidence(manifest.reservations?.[row.id]);
  await client.query(
    'ALTER TABLE reservations ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2)',
  );
  await client.query('CREATE SCHEMA IF NOT EXISTS tapcampus_legacy');
  await client.query(
    'CREATE TABLE IF NOT EXISTS tapcampus_legacy.price_evidence(reservation_id UUID PRIMARY KEY,unit_price DECIMAL(10,2) NOT NULL,source TEXT NOT NULL)',
  );
  for (const row of rows) {
    const e = manifest.reservations[row.id];
    const result = await client.query(
      'UPDATE reservations SET unit_price=$2 WHERE id=$1 AND (unit_price IS NULL OR unit_price=$2)',
      [row.id, e.unit_price],
    );
    if (result.rowCount !== 1)
      throw new Error(
        'Precio persistido contradice la evidencia; no sobrescribir',
      );
    await client.query(
      'INSERT INTO tapcampus_legacy.price_evidence VALUES($1,$2,$3) ON CONFLICT(reservation_id) DO NOTHING',
      [row.id, e.unit_price, e.source],
    );
  }
  await client.query('COMMIT');
  console.log('Backfill comprobado:', rows.length);
} catch {
  await client.query('ROLLBACK').catch(() => {});
  console.error(
    'Backfill detenido sin cambios; revisar precios originales y procedencia',
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
