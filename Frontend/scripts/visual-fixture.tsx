// Entrada exclusiva del verificador visual; no forma parte de las rutas de la app.
import { registerRootComponent } from 'expo';
import { ExpoRoot, Stack } from 'expo-router';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { AuthProvider } from '../src/context/AuthContext';
import api from '../src/services/api';
import type { Publication, Reservation } from '../src/services/marketplace';
import Home from '../src/app/homePage';
import Login from '../src/app/login';
import Register from '../src/app/register';
import Sales from '../src/app/sales';
import Reservations from '../src/app/reservations';
import Detail from '../src/app/publication/[id]';
import Edit from '../src/app/publication/edit';
import { COLORS } from '../src/theme';

const now = Date.now();
let scenario = new URLSearchParams(window.location.search).get('scenario') ?? 'normal';
Object.assign(window, { recoverPreview: () => { scenario = 'normal'; } });
const publication: Publication = { id: 'p1', type: 'LIVE', title: 'Bowl de pollo', description: 'Pollo con arroz y verduras. Entrego en la entrada de la Facultad de Ingeniería.', price: scenario === 'ganga' ? '65.00' : '85.00', price_before_ganga: scenario === 'ganga' ? '85.00' : null, image_url: '/uploads/10000000-0000-4000-8000-000000000011.png', status: scenario === 'finished' ? 'FINISHED' : 'ACTIVE', seller_id: 's1', seller: { id: 's1', name: 'Ana Pérez' }, zone_id: 1, category_id: 1, current_stock: 3, initial_stock: 5, start_time: new Date(now - 3600000).toISOString(), end_time: new Date(now + 12 * 60000).toISOString(), is_ganga_active: scenario === 'ganga', ganga_min_price: '65.00', ganga_activation_mode: 'MANUAL', ganga_minutes_before: null };
const book: Publication = { ...publication, id: 'book', type: 'STATIC', title: 'Cálculo I', description: 'Libro usado, completo y con algunas anotaciones.', price: '180.00', price_before_ganga: null, image_url: '/uploads/10000000-0000-4000-8000-000000000017.png', status: scenario === 'sold' ? 'FINISHED' : 'ACTIVE', category_id: 5, current_stock: null, initial_stock: null, start_time: null, end_time: null, is_ganga_active: false, ganga_min_price: null, ganga_activation_mode: null, sellerContact: { phone: '+526641234567' } };
// Contenido de muestra: la API real suministra las fotografías y textos del producto.
publication.image_url = '/uploads/10000000-0000-4000-8000-000000000009.png';
publication.title = 'Torta de pollo';
const otherRows: Publication[] = [{ ...publication, id: 'p2', title: 'Brownie de chocolate', price: '25.00', price_before_ganga: '35.00', is_ganga_active: true, current_stock: 5, zone_id: 3, end_time: new Date(now + 8 * 60000).toISOString() }, { ...publication, id: 'p3', title: 'Galletas caseras', price: '15.00', current_stock: 8, end_time: new Date(now + 25 * 60000).toISOString() }];
let reservations: Reservation[] = [8.53, 16.13].map((minutes, i) => ({ id: `r${i + 1}`, publicationId: 'p1', publicationTitle: publication.title, status: 'ACTIVE', reservedAt: new Date(now - (20 - minutes) * 60000).toISOString(), expiresAt: new Date(now + minutes * 60000).toISOString(), resolvedAt: null, unitPrice: '85.00', buyer: { id: 'b1', name: 'Ana Pérez' }, buyerContact: { phone: '+526641234567' }, sellerContact: { phone: '+526641234567' } }));
if (scenario === 'expired') reservations = reservations.map(r => ({ ...r, status: 'EXPIRED', expiresAt: new Date(now - 60000).toISOString(), resolvedAt: new Date(now - 60000).toISOString() }));
const zoneRows = ['Facultad de Ingeniería', 'Facultad de Artes', 'Biblioteca Central', 'Cafetería Principal', 'Gimnasio'].map((name, i) => ({ id: i + 1, name }));
api.interceptors.request.clear();
api.defaults.adapter = async config => {
  const path = config.url ?? '';
  const fail = (status: number, message: string): never => { throw { response: { status, data: { message } } }; };
  let data: unknown;
  if (path === '/zones') data = zoneRows;
  else if (path === '/categories') data = (config.params.type === 'LIVE' ? ['Comida Fuerte', 'Snacks', 'Bebidas', 'Postres'] : ['Libros', 'Material Escolar', 'Batas/Uniformes', 'Electrónica']).map((name, i) => ({ id: i + (config.params.type === 'LIVE' ? 1 : 5), name, type: config.params.type }));
  else if (path === '/publications/mine') data = [publication, book];
  else if (path === '/publications') {
    if (scenario === 'error') fail(503, 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.');
    data = scenario === 'empty' ? [] : [publication, ...otherRows, book].filter(p => p.type === config.params.type && p.status === 'ACTIVE' && (!config.params.zoneId || p.zone_id === config.params.zoneId) && (!config.params.categoryId || p.category_id === config.params.categoryId));
  } else if (path === '/reservations/mine' || (path.startsWith('/publications/') && path.endsWith('/reservations'))) data = reservations;
  else if (path === '/reservations' && config.method === 'post') {
    const row: Reservation = { ...reservations[0], id: `r${reservations.length + 1}`, unitPrice: publication.price, reservedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 1200000).toISOString() };
    reservations = [...reservations, row]; publication.current_stock!--; data = row;
  } else if (/\/reservations\/r\d+\/(complete|cancel)$/.test(path)) {
    const id = path.split('/')[2];
    reservations = reservations.map(r => r.id === id ? { ...r, status: path.endsWith('complete') ? 'COMPLETED' : 'CANCELLED', resolvedAt: new Date().toISOString() } : r); data = reservations.find(r => r.id === id);
  } else if (path === '/publications/p1/ganga') { publication.price_before_ganga = publication.price; publication.price = '65.00'; publication.is_ganga_active = true; data = publication; }
  else if (path.endsWith('/physical-sale')) { publication.current_stock!--; data = publication; }
  else if (path.endsWith('/finish')) { publication.status = 'FINISHED'; data = publication; }
  else if (path.endsWith('/sold')) { book.status = 'FINISHED'; data = book; }
  else if (path === '/publications/p1' || path === '/publications/book') { const p = path.endsWith('book') ? book : publication; if (p.status !== 'ACTIVE') fail(404, 'Publicación no disponible'); data = p; }
  else data = {};
  return { data: JSON.parse(JSON.stringify(data)), status: 200, statusText: 'OK', headers: {}, config };
};
const pages = { './_layout.tsx': { default: () => <AuthProvider><Stack screenOptions={{ headerShown: false, animation: 'none' }} /></AuthProvider> }, './index.tsx': { default: Home }, './homePage.tsx': { default: Home }, './login.tsx': { default: Login }, './register.tsx': { default: Register }, './sales.tsx': { default: Sales }, './reservations.tsx': { default: Reservations }, './publication/[id].tsx': { default: Detail }, './publication/edit.tsx': { default: Edit } };
const context = Object.assign((key: string) => pages[key as keyof typeof pages], { keys: () => Object.keys(pages), resolve: (key: string) => key, id: 'visual-fixture' }) as unknown as Parameters<typeof ExpoRoot>[0]['context'];
function Preview() {
  const [ready] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  return <View style={{ flex: 1, paddingTop: 47, backgroundColor: COLORS.background }}>{ready ? <ExpoRoot context={context} /> : null}</View>;
}
registerRootComponent(Preview);
