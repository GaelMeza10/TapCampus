import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { zoneNames, categoryNames } from './catalogs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
type Remap = { zones?: Record<string, { target: string; source: string }> };
const remap: Remap = process.env.CATALOG_REMAP_FILE
  ? JSON.parse(readFileSync(process.env.CATALOG_REMAP_FILE, 'utf8'))
  : {};

async function main() {
  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(
        'LOCK TABLE zones, categories, publications IN SHARE ROW EXCLUSIVE MODE',
      );
      const zones = await tx.zone.findMany({
        include: { _count: { select: { publications: true } } },
      });
      const categories = await tx.category.findMany({
        include: { _count: { select: { publications: true } } },
      });
      for (const zone of zones) {
        if (
          zoneNames.includes(zone.name) ||
          zone.name === 'Gimnasio Universitario'
        )
          continue;
        const mapping = remap.zones?.[zone.name];
        if (
          mapping &&
          (!zoneNames.includes(mapping.target) || !mapping.source?.trim())
        ) {
          throw new Error('Remapeo de zona inválido o sin procedencia');
        }
        if (zone._count.publications && !mapping) {
          throw new Error(
            `Zona referenciada sin remapeo aprobado: id=${zone.id}`,
          );
        }
      }
      for (const category of categories) {
        if (
          categoryNames[category.type].includes(category.name) ||
          (category.type === 'STATIC' && category.name === 'Batas y Uniformes')
        )
          continue;
        if (category._count.publications)
          throw new Error(
            `Categoría referenciada sin conversión: id=${category.id}`,
          );
      }
      for (const name of zoneNames) {
        await tx.zone.upsert({ where: { name }, update: {}, create: { name } });
      }
      for (const type of ['LIVE', 'STATIC'] as const) {
        for (const name of categoryNames[type]) {
          await tx.category.upsert({
            where: { name_type: { name, type } },
            update: {},
            create: { name, type },
          });
        }
      }
      for (const zone of zones.filter((z) => !zoneNames.includes(z.name))) {
        const name =
          zone.name === 'Gimnasio Universitario'
            ? 'Gimnasio'
            : remap.zones?.[zone.name]?.target;
        if (name) {
          const target = await tx.zone.findUniqueOrThrow({ where: { name } });
          await tx.publication.updateMany({
            where: { zone_id: zone.id },
            data: { zone_id: target.id },
          });
        }
        await tx.zone.delete({ where: { id: zone.id } });
      }
      for (const category of categories.filter(
        (c) => !categoryNames[c.type].includes(c.name),
      )) {
        if (
          category.type === 'STATIC' &&
          category.name === 'Batas y Uniformes'
        ) {
          const target = await tx.category.findUniqueOrThrow({
            where: { name_type: { name: 'Batas/Uniformes', type: 'STATIC' } },
          });
          await tx.publication.updateMany({
            where: { category_id: category.id },
            data: { category_id: target.id },
          });
        }
        await tx.category.delete({ where: { id: category.id } });
      }
    },
    { timeout: 30000 },
  );
  console.log('Seed verificado: 5 zonas, 4 categorías LIVE y 4 STATIC.');
}
main()
  .catch(() => {
    console.error(
      'Seed detenido; transacción revertida. Revisar inventario y remapeos de catálogos.',
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
