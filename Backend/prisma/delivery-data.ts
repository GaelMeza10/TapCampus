import type { PublicationType, ProductCondition } from '../src/generated/prisma/client';

export const deliveryId = (kind: 'user' | 'publication' | 'reservation' | 'key' | 'image', index: number) =>
  `${({ user: '46000000', publication: '46100000', reservation: '46200000', key: '46300000', image: '46400000' })[kind]}-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;

export const deliveryPeople = [
  ['ana', 'Ana Sofía Ramírez'], ['diego', 'Diego Martínez'],
  ['valeria', 'Valeria López'], ['mateo', 'Mateo Hernández'],
  ['lucia', 'Lucía García'], ['daniel', 'Daniel Ríos'],
].map(([handle, name], index) => ({ id: deliveryId('user', index), name, email: `demo.entrega.${handle}@uabc.edu.mx`, phone: `+52${String(index + 1).padStart(10, '0')}` }));

type Sample = readonly [title: string, price: string, image: string, description: string, condition?: ProductCondition];
const groups: { type: PublicationType; category: string; rows: readonly Sample[] }[] = [
  { type: 'LIVE', category: 'Comida Fuerte', rows: [
    ['Torta de pollo con aguacate', '62.00', 'torta-pollo.png', 'Bolillo con pollo, lechuga y aguacate. Salsa y aderezo aparte; precio por pieza.'],
    ['Burrito de machaca con huevo', '58.00', 'burrito-machaca.png', 'Burrito de harina con machaca, huevo y papa, envuelto individualmente. Contiene gluten y huevo.'],
    ['Torta de pollo para llevar', '65.00', 'torta-pollo.png', 'Porción individual con pollo y verduras. Empaque incluido; entrega al llegar al punto acordado.'],
    ['Burrito de machaca con salsa aparte', '55.00', 'burrito-machaca.png', 'Una pieza de tortilla de harina con machaca y huevo. Salsa servida por separado.'],
  ] },
  { type: 'LIVE', category: 'Snacks', rows: [
    ['Galletas de avena, bolsa de tres', '28.00', 'galletas-avena.png', 'Tres galletas con avena y chispas de chocolate. Contienen gluten y lácteos.'],
    ['Palomitas con chamoy', '22.00', 'palomitas-chamoy.png', 'Vaso individual de palomitas; chamoy y chile al entregar para conservar la textura.'],
    ['Galletas de avena para compartir', '45.00', 'galletas-avena.png', 'Bolsa con seis galletas pequeñas. Contienen gluten; consultar ingredientes antes de consumir.'],
    ['Palomitas con chile y limón', '25.00', 'palomitas-chamoy.png', 'Porción individual de palomitas preparadas al recoger. El chile se puede servir aparte.'],
  ] },
  { type: 'LIVE', category: 'Bebidas', rows: [
    ['Café frío de vainilla, 500 ml', '35.00', 'cafe-frio.png', 'Café con leche, hielo y vainilla. Vaso de 500 ml; contiene lácteos.'],
    ['Horchata con canela, 500 ml', '25.00', 'horchata.png', 'Vaso de horchata fría con hielo y canela. Preguntar por ingredientes si tienes alergias.'],
    ['Café frío con leche', '32.00', 'cafe-frio.png', 'Porción de 500 ml de café con leche y hielo. Azúcar por separado.'],
    ['Horchata para llevar', '28.00', 'horchata.png', 'Bebida fría en vaso individual con tapa. Agitar antes de tomar.'],
  ] },
  { type: 'LIVE', category: 'Postres', rows: [
    ['Brownie de chocolate semiamargo', '30.00', 'brownie.png', 'Brownie individual empacado. Contiene gluten, huevo y lácteos.'],
    ['Pastel de zanahoria, rebanada', '42.00', 'pastel-zanahoria.png', 'Rebanada con betún de queso crema. Contiene nueces, gluten y lácteos.'],
    ['Brownie para compartir', '55.00', 'brownie.png', 'Dos porciones individuales de brownie de chocolate. Consultar ingredientes antes de consumir.'],
    ['Rebanada de pastel con nuez', '45.00', 'pastel-zanahoria.png', 'Pastel de zanahoria con nuez y queso crema, en contenedor individual cerrado.'],
  ] },
  { type: 'LIVE', category: 'Desayunos', rows: [
    ['Burrito de huevo y machaca', '58.00', 'burrito-machaca.png', 'Desayuno individual en tortilla de harina. Incluye huevo y machaca; salsa aparte.'],
    ['Torta de pollo para el receso', '60.00', 'torta-pollo.png', 'Torta individual de pollo con verduras, lista para recoger entre clases.'],
    ['Dos burritos pequeños de machaca', '85.00', 'burrito-machaca.png', 'Paquete con dos burritos pequeños, empacados individualmente. Contiene huevo y gluten.'],
    ['Burrito de machaca y papa', '52.00', 'burrito-machaca.png', 'Tortilla de harina rellena con machaca, papa y huevo. Una pieza por pedido.'],
  ] },
  { type: 'LIVE', category: 'Panadería', rows: [
    ['Galletas de avena recién horneadas', '28.00', 'galletas-avena.png', 'Bolsa de tres galletas de avena con chocolate. Contienen gluten y lácteos.'],
    ['Panqué de zanahoria por rebanada', '40.00', 'pastel-zanahoria.png', 'Rebanada de panqué con zanahoria y nuez. Fotografía ilustrativa; contiene gluten.'],
    ['Brownie casero de horno', '30.00', 'brownie.png', 'Porción individual de brownie de chocolate. Empaque incluido; contiene huevo y gluten.'],
    ['Galletas de avena, paquete de seis', '48.00', 'galletas-avena.png', 'Paquete con seis piezas pequeñas para compartir. Contienen avena, gluten y lácteos.'],
  ] },
  { type: 'STATIC', category: 'Libros', rows: [
    ['Libro de cálculo integral', '240.00', 'libro-calculo.png', 'Libro completo con anotaciones a lápiz y desgaste en las esquinas. Se puede revisar antes de comprar.', 'USED'],
    ['Atlas de anatomía con separadores', '320.00', 'libro-anatomia.png', 'Encuadernado completo y páginas legibles. Algunos subrayados; fotografías ilustrativas del tipo de artículo.', 'USED'],
    ['Texto de cálculo para primer semestre', '280.00', 'libro-calculo.png', 'Ejemplar con ejercicios y ejemplos; revisar temario y edición al coordinar la entrega.', 'USED'],
    ['Atlas de anatomía para consulta', '450.00', 'libro-anatomia.png', 'Ejemplar sin anotaciones de uso. Acordar revisión de edición y contenido antes de entregar.', 'NEW'],
  ] },
  { type: 'STATIC', category: 'Material Escolar', rows: [
    ['Carpeta de argollas con hojas', '65.00', 'carpeta.png', 'Carpeta tamaño carta con unas 80 hojas cuadriculadas limpias. Marcas de uso por fuera.', 'USED'],
    ['Plumones de doble punta, 24 colores', '160.00', 'plumones.png', 'Estuche con 24 plumones utilizados en dos proyectos. Se pueden probar al entregar.', 'USED'],
    ['Carpeta para apuntes tamaño carta', '85.00', 'carpeta.png', 'Carpeta de argollas para organizar materias. Hojas incluidas; revisar el contenido al recoger.', 'NEW'],
    ['Estuche de plumones para clases', '210.00', 'plumones.png', 'Juego de 24 colores con estuche. Material de demostración, fotografía ilustrativa.', 'NEW'],
  ] },
  { type: 'STATIC', category: 'Batas/Uniformes', rows: [
    ['Bata de laboratorio talla M', '270.00', 'bata.png', 'Bata blanca lavada, con botones y bolsas completos. Revisar talla y largo al entregar.', 'USED'],
    ['Filipina blanca talla CH', '190.00', 'filipina.png', 'Filipina utilizada un semestre, con señales leves de uso. Costuras y bolsas completas.', 'USED'],
    ['Bata blanca talla G', '350.00', 'bata.png', 'Bata sin uso de laboratorio. Acordar revisión de medidas; imagen ilustrativa.', 'NEW'],
    ['Filipina de cocina talla M', '230.00', 'filipina.png', 'Filipina blanca con bolsas y botones. Revisar medidas y tela antes de la compra.', 'USED'],
  ] },
  { type: 'STATIC', category: 'Electrónica', rows: [
    ['Calculadora científica con estuche', '420.00', 'calculadora.png', 'Calculadora con pantalla y teclas funcionales. Incluye estuche; se puede probar antes de comprar.', 'USED'],
    ['Calculadora para álgebra y cálculo', '390.00', 'calculadora.png', 'Equipo usado con batería instalada. Confirmar funciones requeridas por la materia.', 'USED'],
    ['Calculadora científica sin uso', '550.00', 'calculadora.png', 'Calculadora sin uso, con cubierta protectora. Modelo e imagen ilustrativos para la demostración.', 'NEW'],
    ['Calculadora científica de respaldo', '320.00', 'calculadora.png', 'Teclas completas y pantalla legible; marcas de uso en la cubierta. Prueba al momento de entregar.', 'USED'],
  ] },
  { type: 'STATIC', category: 'Arte y Dibujo', rows: [
    ['Plumones para ilustración, 24 tonos', '180.00', 'plumones.png', 'Set para bocetos e ilustración con puntas probadas. Estuche incluido.', 'USED'],
    ['Marcadores de doble punta', '220.00', 'plumones.png', 'Juego de 24 colores para proyectos. Revisar puntas y tonos al coordinar entrega.', 'NEW'],
    ['Plumones para bocetos de clase', '140.00', 'plumones.png', 'Estuche con 24 plumones usados. Algunas tapas tienen marcas; se permite probar cada color.', 'USED'],
    ['Set de color para dibujo', '195.00', 'plumones.png', 'Material para proyectos e ilustración. Fotografía ilustrativa del conjunto de colores.', 'NEW'],
  ] },
  { type: 'STATIC', category: 'Audio y Accesorios', rows: [
    ['Audífonos inalámbricos con estuche', '290.00', 'audifonos.png', 'Par de audífonos con estuche de carga. Probar conexión y duración antes de cerrar la compra.', 'USED'],
    ['Audífonos para estudiar', '350.00', 'audifonos.png', 'Audífonos inalámbricos con estuche; fotografía ilustrativa. Se acuerda prueba al entregar.', 'NEW'],
    ['Audífonos Bluetooth de uso personal', '250.00', 'audifonos.png', 'Estuche y ambos audífonos incluidos. Tienen señales de uso; revisar carga y audio.', 'USED'],
    ['Audífonos inalámbricos de repuesto', '310.00', 'audifonos.png', 'Equipo sin uso habitual, con estuche. Modelo ilustrativo; no se atribuye una marca comercial.', 'NEW'],
  ] },
];

// Append only: the first 48 products and first 16 images retain their delivery UUIDs.
groups.push(...groups.filter(group => group.type === 'STATIC').map(group => ({ ...group, type: 'LIVE' as const })));
const extraProducts: { category: string; rows: readonly Sample[] }[] = [
  { category: 'Ropa y calzado', rows: [
    ['Tenis deportivos rojos talla 26', '480.00', 'tenis-rojos.png', 'Par de tenis rojos, talla 26 MX. Suela con desgaste leve; revisar talla y estado al entregar.', 'USED'],
    ['Tenis rojos para caminar talla 25', '520.00', 'tenis-rojos.png', 'Par limpio de uso ocasional. Probar ajuste y revisar ambas suelas antes de comprar.', 'USED'],
    ['Tenis deportivos rojos talla 27', '650.00', 'tenis-rojos.png', 'Par sin uso. Fotografía ilustrativa; confirmar medidas y modelo por WhatsApp.', 'NEW'],
    ['Tenis rojos de uso diario talla 26.5', '390.00', 'tenis-rojos.png', 'Par con marcas de uso visibles. Revisar costuras y talla antes de cerrar la compra.', 'USED'],
  ] },
  { category: 'Mochilas y bolsos', rows: [
    ['Mochila azul con compartimento principal', '280.00', 'mochila.png', 'Mochila azul oscuro con cierres funcionales. Caben cuadernos tamaño carta; revisar medidas al entregar.', 'USED'],
    ['Mochila para llevar apuntes', '340.00', 'mochila.png', 'Mochila sin uso habitual, con bolsa frontal. Confirmar medidas si llevarás computadora.', 'NEW'],
    ['Mochila azul para clases', '240.00', 'mochila.png', 'Tirantes completos y cierre frontal funcional. Desgaste leve en la base.', 'USED'],
    ['Mochila azul de repuesto', '310.00', 'mochila.png', 'Mochila con bolsa frontal. Fotografía ilustrativa; revisar interior y cierres al recoger.', 'NEW'],
  ] },
  { category: 'Deportes', rows: [
    ['Botella deportiva verde', '140.00', 'botella-deportiva.png', 'Botella reutilizable verde con tapa de rosca. Lavada; revisar cierre y capacidad al entregar.', 'USED'],
    ['Botella para entrenamiento', '190.00', 'botella-deportiva.png', 'Botella sin uso de color verde. Confirmar capacidad y material antes de comprar.', 'NEW'],
    ['Botella reutilizable para gimnasio', '120.00', 'botella-deportiva.png', 'Botella de uso personal con señales leves por fuera. Se entrega vacía y limpia.', 'USED'],
    ['Botella verde con tapa', '170.00', 'botella-deportiva.png', 'Botella con tapa de rosca, sin accesorios adicionales. Imagen ilustrativa del producto.', 'NEW'],
  ] },
  { category: 'Juegos y videojuegos', rows: [
    ['Control inalámbrico para videojuegos', '650.00', 'control-juegos.png', 'Control con botones y palancas funcionales. Probar conexión y compatibilidad con tu equipo antes de comprar.', 'USED'],
    ['Control de videojuegos para PC', '720.00', 'control-juegos.png', 'Control sin uso habitual. No incluye consola; confirmar compatibilidad y alimentación.', 'NEW'],
    ['Control de repuesto para jugar', '580.00', 'control-juegos.png', 'Control con señales de uso. Se permite probar botones, gatillos y palancas al entregar.', 'USED'],
    ['Control inalámbrico con botones completos', '690.00', 'control-juegos.png', 'Control sin accesorios. Fotografía ilustrativa; coordinar prueba antes de cerrar la compra.', 'NEW'],
  ] },
];
for (const type of ['LIVE', 'STATIC'] as const) groups.push(...extraProducts.map(group => ({ ...group, type })));
// New, separately identified LIVE cohort for current pickup examples; never renew old deadlines.
groups.push(...extraProducts.slice(0, 3).map(group => ({ type: 'LIVE' as const, category: group.category, rows: [group.rows[0]] })));

export const deliveryProducts = groups.flatMap(group => group.rows.map((row, variant) => ({
  type: group.type, category: group.category, variant,
  title: row[0], price: row[1], image: row[2], description: row[3], condition: row[4],
})));
export const deliveryImages = [...new Set(deliveryProducts.map(row => row.image))];
