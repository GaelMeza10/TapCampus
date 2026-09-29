import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PublicationType } from '../src/generated/prisma/enums.ts';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando el proceso de Seeding para TapCampus...');

  // 1. Zonas de la UABC
  const zones = [
    { name: 'Facultad de Ingeniería' },
    { name: 'Facultad de Artes' },
    { name: 'Biblioteca Central' },
    { name: 'Cafetería Principal' },
    { name: 'Gimnasio Universitario' },
    { name: 'Facultad de Ciencias' },
    { name: 'Facultad de Derecho' }
  ];

  console.log('Sembrando Zonas...');
  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { name: zone.name },
      update: {},
      create: zone,
    });
  }

  // 2. Categorías (LIVE vs STATIC)
  const categories = [
    // Ventas en Vivo
    { name: 'Comida Fuerte', type: PublicationType.LIVE },
    { name: 'Snacks', type: PublicationType.LIVE },
    { name: 'Bebidas', type: PublicationType.LIVE },
    { name: 'Postres', type: PublicationType.LIVE },
    // Ventas Estáticas
    { name: 'Libros', type: PublicationType.STATIC },
    { name: 'Material Escolar', type: PublicationType.STATIC },
    { name: 'Batas y Uniformes', type: PublicationType.STATIC },
    { name: 'Electrónica', type: PublicationType.STATIC }
  ];

  console.log('Sembrando Categorías...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: cat.name,
          type: cat.type
        }
      },
      update: {},
      create: cat,
    });
  }

  console.log('¡Seeding completado con éxito!');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
