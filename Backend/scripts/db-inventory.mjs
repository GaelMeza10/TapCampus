import dotenv from 'dotenv';
import pg from 'pg';
import { createHash } from 'node:crypto';
dotenv.config({ quiet: true });

export async function inventory(client) {
  const { rows: tables } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
  );
  const result = {
    server: (await client.query('SELECT version()')).rows[0].version,
    tables: {},
  };
  for (const { tablename } of tables) {
    const quoted = '"' + tablename.replaceAll('"', '""') + '"';
    const { rows } = await client.query(
      `SELECT to_jsonb(t) AS data FROM ${quoted} t ORDER BY to_jsonb(t)::text`,
    );
    result.tables[tablename] = {
      count: rows.length,
      sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex'),
    };
  }
  if (tables.some((t) => t.tablename === '_prisma_migrations')) {
    result.migrations = (
      await client.query(
        'SELECT migration_name, checksum, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at',
      )
    ).rows;
  }
  result.constraints = (
    await client.query(
      "SELECT conname, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY conname",
    )
  ).rows;
  return result;
}

if (process.argv[1]?.endsWith('db-inventory.mjs')) {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    console.log(JSON.stringify(await inventory(client), null, 2));
    await client.query('COMMIT');
  } catch (error) {
    console.error('Inventario fallido:', error.code ?? error.name);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
