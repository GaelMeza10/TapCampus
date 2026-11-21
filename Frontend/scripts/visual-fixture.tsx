// Entrada exclusiva del verificador visual; no forma parte de las rutas de la app.
import { registerRootComponent } from 'expo';
import { ExpoRoot, Stack } from 'expo-router';
import { Dimensions, View } from 'react-native';
// Adaptador interno exclusivamente para la entrada auxiliar, sin exportarlo a la app.
import PreviewLinking from '../node_modules/expo-linking/build/RNLinking.web';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { AuthProvider } from '../src/context/AuthContext';
import api from '../src/services/api';
import type { Publication, OwnedPublication, Reservation } from '../src/services/marketplace';
import Home from '../src/app/(tabs)/homePage';
import MarketplaceTabs, { unstable_settings as tabSettings } from '../src/app/(tabs)/_layout';
import Login from '../src/app/login';
import Register from '../src/app/register';
import Sales from '../src/app/(tabs)/sales';
import Reservations from '../src/app/(tabs)/reservations';
import Detail from '../src/app/publication/[id]';
import Edit from '../src/app/publication/edit';
import Account from '../src/app/(tabs)/account';
import { COLORS } from '../src/theme';

const now = Date.now();
// La entrada auxiliar intercepta el adaptador web real de expo-linking, que navega
// con location (no con window.open). Nunca sale a WhatsApp ni envía mensajes.
const contactPreview = { links: [] as string[], fail: false };
Object.assign(window, { contactPreview });
PreviewLinking.openURL = async url => {
  contactPreview.links.push(url);
  if (contactPreview.fail) throw new Error('Simulated opening failure');
};
function publicPublication(p: Publication) {
  const { ganga_min_price, ganga_activation_mode, ganga_minutes_before, sellerContact, ...visible } = p as OwnedPublication;
  return visible;
}
let scenario = new URLSearchParams(window.location.search).get('scenario') ?? 'normal';
// Solo fixture: simula la decisión de layout por fontScale; el verificador amplía el texto CSS por separado.
if (new URLSearchParams(window.location.search).get('fontScale') === '1.5') {
  const getDimensions = Dimensions.get.bind(Dimensions);
  Dimensions.get = name => ({ ...getDimensions(name), fontScale: 1.5 });
}
Object.assign(window, { recoverPreview: () => { scenario = 'normal'; } });
const publication: OwnedPublication = { id: 'p1', type: 'LIVE', title: 'Bowl de pollo', description: 'Pollo con arroz y verduras. Entrego en la entrada de la Facultad de Ingeniería.', price: scenario === 'ganga' ? '49.00' : '85.00', price_before_ganga: scenario === 'ganga' ? '62.00' : null, image_url: '/uploads/10000000-0000-4000-8000-000000000011.png', status: scenario === 'finished' ? 'FINISHED' : 'ACTIVE', seller_id: 's1', seller: { id: 's1', name: 'Ana Pérez' }, zone_id: 1, category_id: 1, current_stock: 3, initial_stock: 5, start_time: new Date(now - 3600000).toISOString(), end_time: new Date(now + 12 * 60000).toISOString(), is_ganga_active: scenario === 'ganga', ganga_min_price: '65.00', ganga_activation_mode: 'MANUAL', ganga_minutes_before: null };
const book: OwnedPublication = { ...publication, id: 'book', type: 'STATIC', title: 'Cálculo I', description: 'Libro usado, completo y con algunas anotaciones.', price: '180.00', price_before_ganga: null, image_url: '/uploads/10000000-0000-4000-8000-000000000017.png', status: scenario === 'sold' ? 'FINISHED' : 'ACTIVE', category_id: 5, current_stock: null, initial_stock: null, start_time: null, end_time: null, is_ganga_active: false, ganga_min_price: null, ganga_activation_mode: null, sellerContact: { phone: '+526641234567' } };
// Contenido de muestra: la API real suministra las fotografías y textos del producto.
if (scenario === 'offer-scheduled') {
  publication.ganga_activation_mode = 'SCHEDULED';
  publication.ganga_minutes_before = 5;
}
publication.image_url = '/uploads/10000000-0000-4000-8000-000000000009.png';
publication.title = 'Torta de pollo';
if (scenario === 'missing-photo') publication.image_url = '';
if (scenario === 'long') publication.title = 'Torta de pollo con verduras y aguacate para recoger en la Facultad de Ingeniería';
const otherRows: Publication[] = [{ ...publication, id: 'p2', title: 'Brownie de chocolate', price: '25.00', price_before_ganga: '35.00', is_ganga_active: true, current_stock: 5, zone_id: 3, end_time: new Date(now + 8 * 60000).toISOString() }, { ...publication, id: 'p3', title: 'Galletas caseras', price: '15.00', current_stock: 8, end_time: new Date(now + 25 * 60000).toISOString() }];
let reservations: Reservation[] = [8.53, 16.13].map((minutes, i) => ({ id: `r${i + 1}`, publicationId: 'p1', publicationTitle: publication.title, status: 'ACTIVE', reservedAt: new Date(now - (20 - minutes) * 60000).toISOString(), expiresAt: new Date(now + minutes * 60000).toISOString(), resolvedAt: null, unitPrice: '85.00', buyer: { id: 'b1', name: 'Ana Pérez' }, buyerContact: { phone: '+526641234567' }, sellerContact: { phone: '+526641234567' } }));
if (scenario === 'expired') reservations = reservations.map(r => ({ ...r, status: 'EXPIRED', expiresAt: new Date(now - 60000).toISOString(), resolvedAt: new Date(now - 60000).toISOString() }));
reservations = reservations.map(r => ({ ...r, publicationImageUrl: publication.image_url }));
if (scenario === 'reservation-history' || scenario === 'reservation-mixed') {
  const history = (['COMPLETED', 'CANCELLED', 'EXPIRED'] as const).map((status, i) => ({
    ...reservations[0], id: `r${i + 3}`, publicationId: `history-${i}`, status,
    publicationTitle: ['Esquites', 'Café frío', 'Torta de pollo'][i],
    publicationImageUrl: `/uploads/10000000-0000-4000-8000-${['000000000014', '000000000012', '000000000009'][i]}.png`,
    unitPrice: ['25.00', '35.00', '85.00'][i],
    expiresAt: new Date(now - (i + 1) * 3600000).toISOString(), resolvedAt: new Date(now - (i + 1) * 3600000).toISOString(),
  }));
  reservations = scenario === 'reservation-history' ? history : [...reservations, ...history];
}
if (scenario === 'reservation-pending') reservations = [{ ...reservations[0], expiresAt: new Date(now - 60000).toISOString() }];
if (scenario === 'reservation-missing') reservations = reservations.map(r => ({ ...r, publicationImageUrl: null }));
const zoneRows = ['Facultad de Ingeniería', 'Facultad de Artes', 'Biblioteca Central', 'Cafetería Principal', 'Gimnasio'].map((name, i) => ({ id: i + 1, name }));
let fixtureProfile = { id: 'fixture-user', name: scenario === 'long' ? 'María Fernanda García López de la Facultad de Ingeniería' : 'Ana Pérez', email: scenario === 'long' ? 'maria.fernanda.garcia.lopez.estudiante.ingenieria@uabc.edu.mx' : 'ana@uabc.edu.mx', phone: '+526641234567' };
api.interceptors.request.clear();
api.defaults.adapter = async config => {
  const path = config.url ?? '';
  const fail = (status: number, message: string): never => { throw { response: { status, data: { message } } }; };
  let data: unknown;
  if (scenario === 'sending' && (path === '/auth/login' || path === '/auth/register')) await new Promise(() => {});
  if (path === '/zones') { if (scenario === 'form-zone-error') fail(503, 'No se pudieron cargar las zonas.'); data = zoneRows; }
  else if (path === '/auth/me') {
    if (config.method === 'patch') {
      if (scenario === 'profile-save-sending') await new Promise(() => {});
      if (scenario === 'profile-save-error') fail(503, 'Error simulado de guardado');
      fixtureProfile = { ...fixtureProfile, ...JSON.parse(config.data as string) };
    }
    if (scenario === 'profile-loading') await new Promise(() => {});
      if (scenario === 'profile-error') fail(404, 'Cannot GET /auth/me');
    data = fixtureProfile;
  }
  else if (path === '/categories') data = (config.params.type === 'LIVE' ? ['Comida Fuerte', 'Snacks', 'Bebidas', 'Postres'] : ['Libros', 'Material Escolar', 'Batas/Uniformes', 'Electrónica']).map((name, i) => ({ id: i + (config.params.type === 'LIVE' ? 1 : 5), name, type: config.params.type }));
  else if (path === '/publications/mine') data = [publication, book];
  else if (path === '/publications') {
    if (scenario === 'error') fail(503, 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.');
    const text = String(config.params.q ?? '').toLowerCase();
    data = scenario === 'empty' ? [] : [publication, ...otherRows, book].filter(p => p.type === config.params.type && p.status === 'ACTIVE' && (!config.params.zoneId || p.zone_id === config.params.zoneId) && (!config.params.categoryId || p.category_id === config.params.categoryId) && (!text || p.title.toLowerCase().includes(text) || p.description.toLowerCase().includes(text)));
  } else if (path === '/reservations/mine' || (path.startsWith('/publications/') && path.endsWith('/reservations'))) {
    if (scenario === 'reservation-loading') await new Promise(() => {});
    if (scenario === 'reservation-error') fail(503, 'Revisa tu conexión e inténtalo de nuevo.');
    data = scenario === 'reservation-empty' || scenario === 'contact-empty' ? [] : reservations;
  }
  else if (path === '/reservations' && config.method === 'post') {
    if (scenario === 'reserve-sending') await new Promise(() => {});
    if (scenario === 'reserve-error') fail(503, 'No se pudo apartar. Inténtalo de nuevo.');
    const row: Reservation = { ...reservations[0], id: `r${reservations.length + 1}`, unitPrice: publication.price, reservedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 1200000).toISOString() };
    reservations = [...reservations, row]; publication.current_stock!--; data = row;
  } else if (/\/reservations\/r\d+\/(complete|cancel)$/.test(path)) {
    const id = path.split('/')[2];
    reservations = reservations.map(r => r.id === id ? { ...r, status: path.endsWith('complete') ? 'COMPLETED' : 'CANCELLED', resolvedAt: new Date().toISOString() } : r); data = reservations.find(r => r.id === id);
  } else if (path === '/publications/p1/ganga') { publication.price_before_ganga = publication.price; publication.price = '65.00'; publication.is_ganga_active = true; data = publication; }
  else if (path.endsWith('/physical-sale')) { publication.current_stock!--; data = publication; }
  else if (path.endsWith('/finish')) { publication.status = 'FINISHED'; data = publication; }
  else if (path.endsWith('/sold')) { book.status = 'FINISHED'; data = book; }
  else if (path === '/publications/p1' || path === '/publications/book') {
    const p = path.endsWith('book') ? book : publication;
    if (p.status !== 'ACTIVE' || scenario === 'contact-invisible') fail(404, 'Publicación no disponible');
    if (config.method === 'patch') {
      if (scenario === 'form-content') throw { response: { status: 400, data: { code: 'PUBLICATION_CONTENT_BLOCKED', fields: ['title'], message: ['Se detectó una palabra ofensiva o no permitida, modifícala si deseas guardar la publicación'] } } };
      if (scenario === 'form-network') fail(503, 'No se pudo guardar. Revisa tu conexión y vuelve a intentarlo.');
      Object.assign(p, JSON.parse(config.data as string));
    }
    data = p;
  }
  else data = {};
  if (config.method === 'get' && path === '/publications') {
    data = (data as Publication[]).map(p => publicPublication(p));
  } else if (config.method === 'get' && (path === '/publications/p1' || path === '/publications/book')) {
    data = { ...publicPublication(data as Publication), ...(scenario === 'contact-legacy' ? {} : { sellerContact: { phone: fixtureProfile.phone } }) };
  }
  return { data: JSON.parse(JSON.stringify(data)), status: 200, statusText: 'OK', headers: {}, config };
};
const pages = { './_layout.tsx': { default: () => <AuthProvider><Stack screenOptions={{ headerShown: false, animation: 'none' }} /></AuthProvider> }, './(tabs)/_layout.tsx': { default: MarketplaceTabs, unstable_settings: tabSettings }, './(tabs)/homePage.tsx': { default: Home }, './login.tsx': { default: Login }, './register.tsx': { default: Register }, './(tabs)/sales.tsx': { default: Sales }, './(tabs)/reservations.tsx': { default: Reservations }, './(tabs)/account.tsx': { default: Account }, './publication/[id].tsx': { default: Detail }, './publication/edit.tsx': { default: Edit } };
const context = Object.assign((key: string) => pages[key as keyof typeof pages], { keys: () => Object.keys(pages), resolve: (key: string) => key, id: 'visual-fixture' }) as unknown as Parameters<typeof ExpoRoot>[0]['context'];
function Preview() {
  const [ready] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  return <View style={{ flex: 1, paddingTop: 47, backgroundColor: COLORS.background }}>{ready ? <ExpoRoot context={context} /> : null}</View>;
}
registerRootComponent(Preview);
