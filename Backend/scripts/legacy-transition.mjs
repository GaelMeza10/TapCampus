import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';

const tables = [
  'usuarios',
  'zonas',
  'categorias',
  'publicaciones',
  'reservas',
  'reportes',
];
const uuid = (entity, id) => {
  const hex = createHash('md5')
    .update(`tapcampus:legacy:${entity}:${id}`)
    .digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
function money(value) {
  if (
    !Number.isFinite(value) ||
    Math.abs(value) >= 100000000 ||
    Number(value.toFixed(2)) !== value
  ) {
    throw new Error('DEC: importe antiguo sin conversión decimal exacta');
  }
  return value.toFixed(2);
}
export function priceEvidence(entry) {
  if (
    !entry ||
    !/^(?:0|[1-9]\d{0,7})\.\d{2}$/.test(entry.unit_price) ||
    !entry.source?.trim()
  ) {
    throw new Error(
      'DEC-02: reserva sin precio original y procedencia comprobables',
    );
  }
  return entry.unit_price;
}

// Acompaña el historial aplicado: nunca ejecuta sus DROP ni lo reescribe.
export async function transitionLegacy(client, manifest) {
  await client.query('BEGIN');
  try {
    await client.query(
      `LOCK TABLE ${tables.join(',')} IN ACCESS EXCLUSIVE MODE`,
    );
    const data = {};
    for (const table of tables)
      data[table] = (
        await client.query(`SELECT * FROM "${table}" ORDER BY id`)
      ).rows;
    for (const user of data.usuarios) {
      if (!/^(?:\+52)?\d{10}$/.test(user.telefono))
        throw new Error('DEC: teléfono histórico ambiguo');
    }
    for (const publication of data.publicaciones) {
      if (publication.zonaId === null)
        throw new Error('DEC: publicación antigua sin zona demostrable');
      if (
        publication.stockDisponible !== null &&
        publication.stockDisponible < 0
      )
        throw new Error('DEC: stock antiguo negativo');
      money(publication.precio);
      if (publication.gangaPrecioMinimo !== null)
        money(publication.gangaPrecioMinimo);
    }
    for (const reservation of data.reservas) {
      priceEvidence(manifest.reservations?.[reservation.id]);
      if (
        reservation.expiracion.getTime() !==
        reservation.createdAt.getTime() + 1200000
      ) {
        throw new Error('DEC: plazo histórico distinto de veinte minutos');
      }
    }
    const original = readFileSync(
      'prisma/migrations/20260929232323_sdd_architecture/migration.sql',
      'utf8',
    )
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/--[^\n]*/g, '');
    const creation = original
      .split(';')
      .map((s) => s.trim())
      .filter(
        (s) =>
          /^CREATE (TYPE|TABLE|UNIQUE INDEX)/.test(s) ||
          /^ALTER TABLE[\s\S]* ADD CONSTRAINT/.test(s),
      );
    for (const sql of creation) await client.query(sql);
    await client.query(
      'ALTER TABLE reservations ADD COLUMN unit_price DECIMAL(10,2), ADD COLUMN idempotency_key UUID',
    );
    await client.query('CREATE SCHEMA tapcampus_legacy');
    await client.query(
      'CREATE TABLE tapcampus_legacy.id_map (entity TEXT NOT NULL, old_id INTEGER NOT NULL, new_id UUID NOT NULL, PRIMARY KEY(entity,old_id), UNIQUE(entity,new_id))',
    );
    for (const entity of ['usuarios', 'publicaciones', 'reservas']) {
      for (const row of data[entity])
        await client.query(
          'INSERT INTO tapcampus_legacy.id_map VALUES ($1,$2,$3)',
          [entity, row.id, uuid(entity, row.id)],
        );
    }
    for (const u of data.usuarios)
      await client.query('INSERT INTO users VALUES ($1,$2,$3,$4,$5,$6,$7)', [
        uuid('usuarios', u.id),
        u.correo,
        u.contrasena,
        u.nombre,
        u.telefono.startsWith('+52') ? u.telefono : `+52${u.telefono}`,
        u.esModerador,
        u.createdAt,
      ]);
    for (const z of data.zonas)
      await client.query('INSERT INTO zones(id,name) VALUES($1,$2)', [
        z.id,
        z.nombre,
      ]);
    const type = { EN_VIVO: 'LIVE', ESTATICA: 'STATIC' };
    for (const c of data.categorias)
      await client.query(
        'INSERT INTO categories(id,name,type) VALUES($1,$2,$3)',
        [c.id, c.nombre, type[c.tipo]],
      );
    const status = {
      ACTIVA: 'ACTIVE',
      FINALIZADA_MANUALMENTE: 'FINISHED',
      EXPIRADA: 'FINISHED',
      VENDIDA: 'FINISHED',
    };
    for (const p of data.publicaciones)
      await client.query(
        `INSERT INTO publications
      (id,type,title,description,price,image_url,status,created_at,seller_id,zone_id,category_id,
       initial_stock,current_stock,start_time,end_time,is_ganga_active,ganga_min_price,ganga_activation_mode,ganga_minutes_before)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          uuid('publicaciones', p.id),
          type[p.tipo],
          p.titulo,
          p.descripcion,
          money(p.precio),
          p.foto,
          status[p.estado],
          p.createdAt,
          uuid('usuarios', p.vendedorId),
          p.zonaId,
          p.categoriaId,
          p.stockInicial,
          p.stockDisponible,
          p.horaInicio,
          p.horaFin,
          p.gangaActivada,
          p.gangaPrecioMinimo === null ? null : money(p.gangaPrecioMinimo),
          p.gangaModo === null
            ? null
            : { MANUAL: 'MANUAL', PROGRAMADO: 'SCHEDULED' }[p.gangaModo],
          p.gangaMinutosAntes,
        ],
      );
    const reservationStatus = {
      RESERVADA: 'ACTIVE',
      VENDIDA: 'COMPLETED',
      CANCELADA: 'CANCELLED',
      EXPIRADA: 'EXPIRED',
    };
    for (const r of data.reservas)
      await client.query(
        `INSERT INTO reservations
      (id,status,reserved_at,buyer_id,publication_id,unit_price,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [
          uuid('reservas', r.id),
          reservationStatus[r.estado],
          r.createdAt,
          uuid('usuarios', r.compradorId),
          uuid('publicaciones', r.publicacionId),
          priceEvidence(manifest.reservations[r.id]),
          randomUUID(),
        ],
      );
    for (const r of data.reportes)
      await client.query('INSERT INTO reports VALUES($1,$2,$3,$4,$5)', [
        r.id,
        r.motivo,
        r.createdAt,
        uuid('usuarios', r.usuarioId),
        uuid('publicaciones', r.publicacionId),
      ]);
    const pairs = {
      usuarios: 'users',
      zonas: 'zones',
      categorias: 'categories',
      publicaciones: 'publications',
      reservas: 'reservations',
      reportes: 'reports',
    };
    for (const [oldTable, newTable] of Object.entries(pairs)) {
      const count = Number(
        (await client.query(`SELECT count(*) FROM "${newTable}"`)).rows[0]
          .count,
      );
      if (count !== data[oldTable].length)
        throw new Error('Recuento de transición distinto');
      await client.query(
        `ALTER TABLE "${oldTable}" SET SCHEMA tapcampus_legacy`,
      );
    }
    for (const table of ['zones', 'categories', 'reports'])
      await client.query(
        `SELECT setval(pg_get_serial_sequence('${table}','id'), COALESCE((SELECT max(id) FROM ${table}),1), EXISTS(SELECT 1 FROM ${table}))`,
      );
    for (const name of [
      'TipoPublicacion',
      'EstadoPublicacion',
      'ModoActivacionGanga',
      'EstadoReserva',
    ]) {
      await client.query(`ALTER TYPE "${name}" SET SCHEMA tapcampus_legacy`);
    }
    // Conservar la fuente de precios permite auditar el backfill sin inventar valores.
    await client.query(
      'CREATE TABLE tapcampus_legacy.price_evidence (reservation_id UUID PRIMARY KEY, unit_price DECIMAL(10,2) NOT NULL, source TEXT NOT NULL)',
    );
    for (const r of data.reservas)
      await client.query(
        'INSERT INTO tapcampus_legacy.price_evidence VALUES($1,$2,$3)',
        [
          uuid('reservas', r.id),
          manifest.reservations[r.id].unit_price,
          manifest.reservations[r.id].source,
        ],
      );
    await client.query('COMMIT');
    return Object.fromEntries(tables.map((t) => [t, data[t].length]));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
