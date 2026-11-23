import { constants } from 'node:fs';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import * as bcrypt from 'bcrypt';
import { Prisma, PrismaClient, ReservationStatus } from '../src/generated/prisma/client';
import { uploadsDirectory } from '../src/uploads/uploads.config';
import { categoryNames, zoneNames } from './catalogs';
import { deliveryId, deliveryImages, deliveryPeople, deliveryProducts } from './delivery-data';

export function deliveryRecords(now = Date.now()) {
  const minute = 60000;
  const publications = deliveryProducts.map((item, index) => {
    const arranged = item.type === 'STATIC' && index >= 48 && item.variant % 2 === 0;
    const finished = [3, 7, 11, 15].includes(index % 24);
    const initial = index === 2 ? 2 : 8 + index % 9;
    const activeOffer = index === 0 || index === 12;
    const discount = index === 0 ? '49.00' : '24.00';
    return {
      id: deliveryId('publication', index), type: item.type, condition: item.type === 'STATIC' ? item.condition : null,
      title: item.title,
      description: `${item.description} ${arranged ? 'Punto de entrega por acordar dentro del campus' : `Entrega en ${zoneNames[index % zoneNames.length]}`}; coordina el punto exacto por WhatsApp. Datos de demostración: producto, precio, fotografía y contacto ilustrativos; no es una venta real.`,
      pickup_mode: arranged ? 'ARRANGED' as const : 'SPECIFIC_ZONE' as const,
      price: activeOffer ? discount : item.price,
      seller_id: deliveryPeople[index % 4].id,
      image_url: `/uploads/${deliveryId('image', deliveryImages.indexOf(item.image))}.png`,
      status: finished ? 'FINISHED' as const : 'ACTIVE' as const,
      created_at: new Date(now - 2 * 86400000 - index * minute),
      ...(item.type === 'LIVE' ? {
        initial_stock: initial, current_stock: initial - (index < 3 || (index >= 104 && index <= 106) ? 2 : 0),
        start_time: new Date(now + (finished ? -360 : index === 21 ? 45 : -120) * minute),
        end_time: new Date(now + (finished ? -180 : 120 + index % 4 * 45) * minute),
        ...(activeOffer ? { is_ganga_active: true, price_before_ganga: item.price, ganga_min_price: discount, ganga_activation_mode: 'MANUAL' as const } : {}),
        ...(index === 4 ? { ganga_min_price: '22.00', ganga_activation_mode: 'MANUAL' as const } : {}),
        ...(index === 8 ? { ganga_min_price: '28.00', ganga_activation_mode: 'SCHEDULED' as const, ganga_minutes_before: 60 } : {}),
      } : {}),
    };
  });
  const reservations: Prisma.ReservationCreateManyInput[] = (['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as ReservationStatus[]).flatMap((status, stateIndex) =>
    [0, 1, 2].map(publicationIndex => {
      const reservedAt = new Date(now - [2, 90, 70, 40][stateIndex] * minute);
      return {
        id: deliveryId('reservation', stateIndex * 3 + publicationIndex), idempotency_key: deliveryId('key', stateIndex * 3 + publicationIndex),
        publication_id: publications[publicationIndex].id, buyer_id: deliveryPeople[4 + (stateIndex + publicationIndex) % 2].id,
        status, unit_price: stateIndex === 0 ? publications[publicationIndex].price : deliveryProducts[publicationIndex].price,
        reserved_at: reservedAt, resolved_at: status === 'ACTIVE' ? null : new Date(reservedAt.getTime() + (status === 'EXPIRED' ? 20 : status === 'COMPLETED' ? 5 : 3) * minute),
      };
    }));
  for (const [stateIndex, status] of (['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as ReservationStatus[]).entries()) {
    for (let slot = 0; slot < 3; slot++) {
      const index = 12 + stateIndex * 3 + slot;
      const p = publications[104 + slot];
      const reservedAt = new Date(now - [2, 90, 70, 40][stateIndex] * minute);
      reservations.push({ id: deliveryId('reservation', index), idempotency_key: deliveryId('key', index),
        publication_id: p.id, buyer_id: deliveryPeople[4 + (stateIndex + slot) % 2].id, status, unit_price: p.price,
        reserved_at: reservedAt, resolved_at: status === 'ACTIVE' ? null : new Date(reservedAt.getTime() + (status === 'EXPIRED' ? 20 : status === 'COMPLETED' ? 5 : 3) * minute) });
    }
  }
  return { publications, reservations };
}

async function prepareImages(directory: string) {
  await mkdir(directory, { recursive: true });
  // Validar todos los assets antes de copiar o insertar datos.
  const originals = await Promise.all(deliveryImages.map(async name => {
    const source = join(__dirname, 'demo-images', name);
    const bytes = await readFile(source);
    if (!bytes.length || bytes.length > 5 * 1024 * 1024 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
      throw new Error(`Imagen de entrega inválida: ${name}`);
    return { source, bytes };
  }));
  for (const [index, asset] of originals.entries()) {
    const destination = join(directory, `${deliveryId('image', index)}.png`);
    try { await copyFile(asset.source, destination, constants.COPYFILE_EXCL); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const existing = await readFile(destination);
      if (createHash('sha256').update(existing).digest('hex') !== createHash('sha256').update(asset.bytes).digest('hex'))
        throw new Error('Una imagen de entrega existente difiere del asset esperado; no se sobrescribió.');
    }
  }
}

export async function seedDelivery(prisma: PrismaClient, options: { password: string; now?: number; directory?: string }) {
  if (options.password.length < 8) throw new Error('La contraseña de demostración debe tener al menos ocho caracteres.');
  await prepareImages(options.directory ?? uploadsDirectory());
  const hash = await bcrypt.hash(options.password, 10);
  const { publications, reservations } = deliveryRecords(options.now);
  return prisma.$transaction(async tx => {
    // Serializa semillas y escrituras mientras se valida el namespace y se insertan relaciones.
    await tx.$executeRaw`LOCK TABLE users, zones, categories, publications, reservations IN SHARE ROW EXCLUSIVE MODE`;
    const existingPeople = await tx.user.findMany({ where: { OR: [{ id: { in: deliveryPeople.map(p => p.id) } }, { email: { in: deliveryPeople.map(p => p.email) } }] } });
    for (const person of existingPeople) {
      const expected = deliveryPeople.find(p => p.id === person.id && p.email === person.email);
      if (!expected) throw new Error('Conflicto de identidad: la semilla no modificó una cuenta existente.');
      if (!await bcrypt.compare(options.password, person.password_hash)) throw new Error('Las cuentas de demostración existen con otra contraseña; no se restablecieron.');
    }
    for (const publication of await tx.publication.findMany({ where: { id: { in: publications.map(p => p.id) } }, select: { id: true, seller_id: true, type: true } })) {
      const expected = publications.find(p => p.id === publication.id)!;
      if (publication.seller_id !== expected.seller_id || publication.type !== expected.type)
        throw new Error('Conflicto de publicación existente; no se sobrescribió.');
    }
    for (const reservation of await tx.reservation.findMany({ where: { OR: [{ id: { in: reservations.map(r => r.id!) } }, { idempotency_key: { in: reservations.map(r => r.idempotency_key) } }] }, select: { id: true, buyer_id: true, publication_id: true, idempotency_key: true } })) {
      const expected = reservations.find(r => r.id === reservation.id);
      if (!expected || expected.buyer_id !== reservation.buyer_id || expected.publication_id !== reservation.publication_id || expected.idempotency_key !== reservation.idempotency_key)
        throw new Error('Conflicto de reserva existente; no se modificó.');
    }
    for (const name of zoneNames) await tx.zone.upsert({ where: { name }, create: { name }, update: {} });
    for (const type of ['LIVE', 'STATIC'] as const)
      for (const name of categoryNames[type]) await tx.category.upsert({ where: { name_type: { name, type } }, create: { name, type }, update: {} });
    const zones = await tx.zone.findMany();
    const categories = await tx.category.findMany();
    const users = await tx.user.createMany({ data: deliveryPeople.map(p => ({ ...p, password_hash: hash })), skipDuplicates: true });
    const rows: Prisma.PublicationCreateManyInput[] = publications.map((p, index) => ({ ...p,
      zone_id: p.pickup_mode === 'ARRANGED' ? null : zones.find(z => z.name === zoneNames[index % zoneNames.length])!.id,
      category_id: categories.find(c => c.name === deliveryProducts[index].category && c.type === p.type)!.id,
    }));
    const posts = await tx.publication.createMany({ data: rows, skipDuplicates: true });
    const bookings = await tx.reservation.createMany({ data: reservations.map(r => {
      const p = rows.find(p => p.id === r.publication_id)!;
      return { ...r, pickup_zone_id: p.zone_id, pickup_zone_name: zones.find(z => z.id === p.zone_id)!.name };
    }), skipDuplicates: true });
    return { created: { users: users.count, publications: posts.count, reservations: bookings.count }, totals: { users: 6, publications: publications.length, reservations: reservations.length, categories: categoryNames.LIVE.length + categoryNames.STATIC.length, zones: 5 } };
  }, { timeout: 30000 });
}
