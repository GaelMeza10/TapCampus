import 'dotenv/config';
import { constants } from 'node:fs';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { uploadsDirectory } from '../src/uploads/uploads.config';

const samples = [
  { title: 'Brownie de chocolate en oferta', image: 'brownie.png', category: 'Postres', zone: 'Biblioteca Central', before: '30.00', price: '24.00', description: 'Brownie individual de chocolate. Contiene gluten, huevo y lácteos.' },
  { title: 'Café frío de vainilla en oferta', image: 'cafe-frio.png', category: 'Bebidas', zone: 'Facultad de Ingeniería', before: '35.00', price: '27.00', description: 'Vaso de 500 ml con café, leche, hielo y vainilla.' },
  { title: 'Torta de pollo en oferta', image: 'torta-pollo.png', category: 'Comida Fuerte', zone: 'Cafetería Principal', before: '62.00', price: '49.00', description: 'Bolillo con pollo asado, aguacate y lechuga; aderezo aparte.' },
] as const;

export async function seedDemoGangas(prisma: PrismaClient) {
  const origin = new URL(process.env.SEED_PUBLIC_BASE_URL || '');
  if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('Se requiere un origen público HTTP(S) válido');
  const reference = await prisma.publication.findUnique({ where: { id: '20000000-0000-4000-8000-000000000009' }, select: { seller_id: true, title: true } });
  if (!reference?.title.startsWith('Demo:')) throw new Error('Se requiere el vendedor de la demo 0012 existente');
  const directory = uploadsDirectory();
  await mkdir(directory, { recursive: true });
  // Validar todos los archivos antes de insertar datos; nunca sobrescribir imágenes.
  for (const sample of samples) {
    if (!(await stat(join(__dirname, '../prisma/demo-images', sample.image))).isFile()) throw new Error('Falta una foto de demo');
  }
  for (const [index, sample] of samples.entries()) {
    const image = `27000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}.png`;
    try { await copyFile(join(__dirname, '../prisma/demo-images', sample.image), join(directory, image), constants.COPYFILE_EXCL); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  }
  const now = Date.now();
  return prisma.$transaction(async tx => {
    const zones = await tx.zone.findMany();
    const categories = await tx.category.findMany({ where: { type: 'LIVE' } });
    const data = samples.map((sample, index) => {
      const zone = zones.find(row => row.name === sample.zone);
      const category = categories.find(row => row.name === sample.category);
      if (!zone || !category) throw new Error('Falta un catálogo de demo');
      const id = `27000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
      return { id, type: 'LIVE' as const, status: 'ACTIVE' as const, seller_id: reference.seller_id,
        title: `Demo: ${sample.title}`, description: `${sample.description} Publicación de demostración: producto, imagen y contacto ilustrativos. Precio por unidad.`,
        zone_id: zone.id, category_id: category.id, image_url: `${origin.origin}/uploads/${id}.png`,
        price: sample.price, price_before_ganga: sample.before, ganga_min_price: sample.price,
        ganga_activation_mode: 'MANUAL' as const, is_ganga_active: true,
        initial_stock: 8, current_stock: 8, start_time: new Date(now - 60000), end_time: new Date(now + 7 * 86400000) };
    });
    return (await tx.publication.createMany({ data, skipDuplicates: true })).count;
  });
}

if (require.main === module) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  seedDemoGangas(prisma).then(created => console.log(JSON.stringify({ created })))
    .catch(() => { console.error('No se pudieron crear las gangas de demo. Revisa BD, catálogos, fotos y origen público.'); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
