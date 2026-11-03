import { constants as fsConstants } from 'node:fs';
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { uploadsDirectory } from '../src/uploads/uploads.config';

const demo = [
  { title: 'Demo: Torta de jamón', type: 'LIVE', category: 'Comida Fuerte', zone: 'Cafetería Principal', price: '55.00', stock: 8, color: [230, 126, 58] },
  { title: 'Demo: Café frío', type: 'LIVE', category: 'Bebidas', zone: 'Facultad de Ingeniería', price: '32.00', stock: 12, color: [63, 119, 151] },
  { title: 'Demo: Galletas caseras', type: 'LIVE', category: 'Snacks', zone: 'Facultad de Artes', price: '18.00', stock: 16, color: [186, 123, 75] },
  { title: 'Demo: Brownie', type: 'LIVE', category: 'Postres', zone: 'Biblioteca Central', price: '28.00', stock: 10, color: [114, 75, 82] },
  { title: 'Demo: Libro de cálculo', type: 'STATIC', category: 'Libros', zone: 'Biblioteca Central', price: '280.00', color: [58, 112, 159] },
  { title: 'Demo: Kit de dibujo', type: 'STATIC', category: 'Material Escolar', zone: 'Facultad de Artes', price: '190.00', color: [127, 104, 173] },
  { title: 'Demo: Bata de laboratorio', type: 'STATIC', category: 'Batas/Uniformes', zone: 'Facultad de Ingeniería', price: '350.00', color: [58, 147, 144] },
  { title: 'Demo: Calculadora científica', type: 'STATIC', category: 'Electrónica', zone: 'Gimnasio', price: '420.00', color: [71, 90, 129] },
] as const;

// Los UUID 1–8 pertenecen al seed original. Los nuevos anuncios empiezan en 9.
const realisticDemo = [
  { title: 'Demo: Torta de pollo asado', type: 'LIVE', category: 'Comida Fuerte', zone: 'Cafetería Principal', price: '62.00', stock: 6, image: 'torta-pollo.png', description: 'Bolillo tostado con pollo asado, aguacate, lechuga y aderezo aparte. Entrego junto a la entrada de la cafetería; precio por pieza.', ganga: { mode: 'MANUAL', minPrice: '52.00' } },
  { title: 'Demo: Burrito de machaca con huevo', type: 'LIVE', category: 'Comida Fuerte', zone: 'Facultad de Ingeniería', price: '58.00', stock: 5, image: 'burrito-machaca.png', description: 'Burrito grande de machaca con huevo y papa, envuelto en aluminio. Entrega en la entrada principal de Ingeniería; salsa aparte.' },
  { title: 'Demo: Café frío de vainilla', type: 'LIVE', category: 'Bebidas', zone: 'Biblioteca Central', price: '35.00', stock: 9, image: 'cafe-frio.png', description: 'Vaso de 500 ml con café, leche y hielo; vainilla suave. Entrego frente a la Biblioteca Central. Avisar si lo prefieres sin azúcar.' },
  { title: 'Demo: Horchata con hielo', type: 'LIVE', category: 'Bebidas', zone: 'Cafetería Principal', price: '25.00', stock: 12, image: 'horchata.png', description: 'Vaso de 500 ml de horchata fría con canela. Entrega en la Cafetería Principal; cantidad limitada.' },
  { title: 'Demo: Galletas de avena y chocolate', type: 'LIVE', category: 'Snacks', zone: 'Facultad de Artes', price: '28.00', stock: 10, image: 'galletas-avena.png', description: 'Bolsa con tres galletas caseras de avena y chispas de chocolate. Entrega en el acceso de la Facultad de Artes; contienen gluten y lácteos.' },
  { title: 'Demo: Palomitas con chamoy', type: 'LIVE', category: 'Snacks', zone: 'Gimnasio', price: '22.00', stock: 14, image: 'palomitas-chamoy.png', description: 'Vaso individual de palomitas con chamoy y chile; se sirve al entregar para conservar la textura. Punto de encuentro: acceso del Gimnasio.' },
  { title: 'Demo: Brownie de chocolate', type: 'LIVE', category: 'Postres', zone: 'Biblioteca Central', price: '30.00', stock: 8, image: 'brownie.png', description: 'Brownie casero individual con chocolate semiamargo, empacado por pieza. Entrego afuera de la Biblioteca Central; contiene gluten, huevo y lácteos.', ganga: { mode: 'SCHEDULED', minPrice: '24.00', minutesBefore: 120 } },
  { title: 'Demo: Rebanada de pastel de zanahoria', type: 'LIVE', category: 'Postres', zone: 'Facultad de Artes', price: '42.00', stock: 6, image: 'pastel-zanahoria.png', description: 'Rebanada individual de pastel de zanahoria con betún de queso crema en contenedor cerrado. Entrega en la entrada de Artes; contiene nueces y lácteos.' },
  { title: 'Demo: Libro de cálculo integral usado', type: 'STATIC', category: 'Libros', zone: 'Biblioteca Central', price: '240.00', image: 'libro-calculo.png', description: 'Libro de cálculo integral usado, completo y con algunas anotaciones a lápiz. Se puede revisar antes de comprar; entrega frente a la Biblioteca Central.' },
  { title: 'Demo: Atlas de anatomía usado', type: 'STATIC', category: 'Libros', zone: 'Biblioteca Central', price: '320.00', image: 'libro-anatomia.png', description: 'Atlas de anatomía en buen estado, con separadores y desgaste leve en las esquinas. Entrega en la Biblioteca Central; puedes revisar páginas y encuadernado.' },
  { title: 'Demo: Plumones para dibujo, 24 colores', type: 'STATIC', category: 'Material Escolar', zone: 'Facultad de Artes', price: '160.00', image: 'plumones.png', description: 'Estuche con 24 plumones de doble punta; usados en dos proyectos y probados recientemente. Entrega en la entrada de la Facultad de Artes.' },
  { title: 'Demo: Carpeta con hojas cuadriculadas', type: 'STATIC', category: 'Material Escolar', zone: 'Facultad de Ingeniería', price: '65.00', image: 'carpeta.png', description: 'Carpeta de argollas tamaño carta con aproximadamente 80 hojas cuadriculadas limpias. Tiene marcas de uso por fuera; entrega en Ingeniería.' },
  { title: 'Demo: Bata de laboratorio talla M', type: 'STATIC', category: 'Batas/Uniformes', zone: 'Facultad de Ingeniería', price: '270.00', image: 'bata.png', description: 'Bata blanca talla mediana, lavada y sin manchas visibles. Bolsas y botones completos; se puede revisar antes de la entrega en Ingeniería.' },
  { title: 'Demo: Filipina blanca talla CH', type: 'STATIC', category: 'Batas/Uniformes', zone: 'Cafetería Principal', price: '190.00', image: 'filipina.png', description: 'Filipina blanca talla chica, usada un semestre. Costuras y bolsas en buen estado; entrega en la Cafetería Principal para revisar la talla.' },
  { title: 'Demo: Calculadora científica usada', type: 'STATIC', category: 'Electrónica', zone: 'Facultad de Ingeniería', price: '420.00', image: 'calculadora.png', description: 'Calculadora científica funcional, con estuche y batería instalada. Pantalla y teclas probadas; entrega en Ingeniería para que puedas revisarla.' },
  { title: 'Demo: Audífonos inalámbricos usados', type: 'STATIC', category: 'Electrónica', zone: 'Gimnasio', price: '290.00', image: 'audifonos.png', description: 'Par de audífonos inalámbricos con estuche de carga. Funcionan y tienen señales leves de uso; entrega junto al Gimnasio para probar conexión.' },
] as const;

const allDemo = [...demo, ...realisticDemo] as const;

function crc32(bytes: Buffer) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(name: string, data: Buffer) {
  const type = Buffer.from(name, 'ascii');
  const size = Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([size, type, data, checksum]);
}

function placeholder(color: readonly [number, number, number]) {
  const width = 400;
  const height = 240;
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 3) + 1 + x * 3;
      const shade = 0.74 + 0.26 * (x / width) + 0.11 * (y / height);
      for (let channel = 0; channel < 3; channel++) {
        raw[offset + channel] = Math.min(255, Math.round(color[channel] * shade));
      }
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function publicBaseUrl() {
  const value = process.env.SEED_PUBLIC_BASE_URL;
  if (!value) throw new Error('SEED_PUBLIC_BASE_URL es obligatorio para la demo');
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error('SEED_PUBLIC_BASE_URL debe ser un origen HTTP(S) sin ruta');
  }
  return url.origin;
}

export async function seedDemoPublications(prisma: PrismaClient) {
  const email = process.env.SEED_DEMO_SELLER_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('SEED_DEMO_SELLER_EMAIL es obligatorio');
  const seller = await prisma.user.findUnique({ where: { email } });
  if (!seller) throw new Error('El vendedor de demo debe existir antes del seed');
  const base = publicBaseUrl();
  const directory = uploadsDirectory();
  await mkdir(directory, { recursive: true });
  for (const [index, item] of allDemo.entries()) {
    const filename = `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}.png`;
    try {
      if ('image' in item) {
        const source = join(__dirname, 'demo-images', item.image);
        const asset = await stat(source);
        if (!asset.isFile() || asset.size === 0 || asset.size > 5 * 1024 * 1024) {
          throw new Error(`Imagen de demo inválida: ${item.image}`);
        }
        await copyFile(source, join(directory, filename), fsConstants.COPYFILE_EXCL);
      } else {
        await writeFile(join(directory, filename), placeholder(item.color), { flag: 'wx' });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }

  const now = Date.now();
  const start = new Date(now - 60_000);
  const end = new Date(now + 7 * 24 * 60 * 60_000);
  return prisma.$transaction(async (tx) => {
    const zones = await tx.zone.findMany();
    const categories = await tx.category.findMany();
    const records: Prisma.PublicationCreateManyInput[] = allDemo.map((item, index) => {
      const zone = zones.find((row) => row.name === item.zone);
      const category = categories.find((row) => row.name === item.category && row.type === item.type);
      if (!zone || !category) throw new Error('Falta una zona o categoría de demo');
      return {
        id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        type: item.type,
        title: item.title,
        description: 'description' in item
          ? `${item.description} Publicación de demostración: producto, imagen y contacto ilustrativos.`
          : 'Publicación de demostración para probar TapCampus. Producto y contacto de ejemplo.',
        price: item.price,
        image_url: `${base}/uploads/10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}.png`,
        seller_id: seller.id,
        zone_id: zone.id,
        category_id: category.id,
        status: 'ACTIVE',
        ...(item.type === 'LIVE'
          ? { initial_stock: item.stock, current_stock: item.stock, start_time: start, end_time: end }
          : {}),
        ...('ganga' in item
          ? {
              ganga_min_price: item.ganga.minPrice,
              ganga_activation_mode: item.ganga.mode,
              ...('minutesBefore' in item.ganga
                ? { ganga_minutes_before: item.ganga.minutesBefore }
                : {}),
            }
          : {}),
      };
    });
    const result = await tx.publication.createMany({ data: records, skipDuplicates: true });
    return result.count;
  });
}
