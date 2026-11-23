const { checkDesign, compareDesign, compareSidecar, inspectSource, inspectStylesheet, readInputs } = require('../scripts/check-design-consistency.cjs');

test('todas las fuentes respetan la autoridad visual y terminológica de DESIGN.md', () => {
  expect(checkDesign()).toEqual([]);
});

test.each([
  ['components/example.tsx', '<Text>VENTA EN VIVO</Text>', 'Etiqueta anterior'],
  ['components/example.tsx', '<Text>Anuncios</Text>', 'Etiqueta anterior'],
  ['components/example.tsx', '<Text>Mira los anuncios disponibles.</Text>', 'Etiqueta anterior'],
  ['components/example.tsx', '<Button title="Nuevo anuncio" />', 'Etiqueta anterior'],
  ['components/example.tsx', "const s = {color:'#123456'}", 'Color local'],
  ['components/example.tsx', '<Icon color="#123456" />', 'Color local'],
  ['components/example.tsx', "<Icon color={'#123456'} />", 'Color local'],
  ['components/example.tsx', '<Button title="Nueva venta en vivo" />', 'Etiqueta anterior'],
  ['components/example.tsx', '<Text>Oferta</Text>', 'insignia compartida'],
  ['components/example.tsx', "const s = {fontFamily:'Arial'}", 'Fuente local'],
  ['components/example.tsx', "import { GlassView } from 'expo-glass-effect'", 'Glass/blur'],
  ['app/(tabs)/sales.tsx', '<SafeAreaView />', 'MarketplaceViewport'],
  ['components/example.tsx', '<TypeSelector liveLabel="Otro nombre" />', 'vocabulario compartido'],
])('la protección detecta una regresión: %s / %s', (file, source, message) => {
  expect(inspectSource(file, source).join('\n')).toContain(message);
});

test('cambiar un token o nombre sin actualizar DESIGN.md hace fallar la comprobación', () => {
  const { design, theme, copy } = readInputs();
  expect(compareDesign(design, theme.replace('#17613B', '#123456'), copy).join('\n')).toContain('COLORS.primary');
  expect(compareDesign(design, theme, copy.replace('Ahora en el campus', 'Ventas rápidas')).join('\n')).toContain('PUBLICATION_COPY.LIVE.label');
});

test('los nombres compartidos no vuelven a copiarse en una pantalla', () => {
  const labels = new Set(['Ahora en el campus']);
  expect(inspectSource('app/example.tsx', '<Text>Ahora en el campus</Text>', labels).join('\n')).toContain('Texto de tipo duplicado');
  expect(inspectSource('app/example.tsx', '<Text>{PUBLICATION_COPY.LIVE.label}</Text>', labels)).toEqual([]);
});

test('el índice auxiliar de Impeccable no puede recuperar nombres ni colores anteriores', () => {
  const { design, theme } = readInputs();
  const old = { components: [{ name: 'Selector', refersTo: 'type-selected', html: '<button>Disponibles ahora</button><button>Catálogo</button>', css: 'button{border-color:#E2E7E1}' }] };
  const issues = compareSidecar(old, design, theme).join('\n');
  expect(issues).toContain('color anterior');
  expect(issues).toContain('nombres anteriores');
});

test('las hojas CSS auxiliares tampoco pueden recuperar fuentes de plantilla', () => {
  const { theme } = readInputs();
  expect(inspectStylesheet('global.css', ':root{--font-display:Spline Sans, sans-serif}', theme).join('\n')).toContain('fuente CSS ajena');
  expect(inspectStylesheet('global.css', ':root{--font-serif:Georgia}', theme).join('\n')).toContain('rol de fuente CSS ajeno');
});
