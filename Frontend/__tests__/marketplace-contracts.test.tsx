import api from '../src/services/api';
import * as Linking from 'expo-linking';
import { apiMessage, listPublications, myPublications, reserve, savePublication, uploadImage } from '../src/services/marketplace';
import { openWhatsApp, whatsappUrl } from '../src/services/whatsapp';

jest.mock('../src/services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() } }));
jest.mock('expo-linking', () => ({ openURL: jest.fn() }));
jest.mock('../src/constants/api.constants', () => ({ API_BASE_URL: 'https://api.example', TOKEN_KEY: 'test' }));

const post = api.post as jest.Mock;
const get = api.get as jest.Mock;
const open = Linking.openURL as jest.Mock;

beforeEach(() => { jest.clearAllMocks(); });

test('feed usa el origen actual para uploads guardados con una IP anterior y conserva otras imágenes', async () => {
  const path = '/uploads/10000000-0000-4000-8000-000000000009.png';
  get.mockResolvedValue({ data: [
    { id: 'p1', image_url: `http://10.41.60.121:3000${path}` },
    { id: 'p2', image_url: 'https://other.example/photo.jpg' },
  ] });
  const rows = await listPublications('LIVE');
  expect(rows[0].image_url).toBe(`https://api.example${path}`);
  expect(rows[1].image_url).toBe('https://other.example/photo.jpg');
});

test('timeout muestra un error recuperable y conserva el mensaje de validación del servidor', () => {
  expect(apiMessage({ code: 'ECONNABORTED' })).toContain('tardó demasiado');
  expect(apiMessage({ response: { status: 400, data: { message: 'Zona inválida' } } })).toBe('Zona inválida');
});

test('reserva transmite la misma clave al reintentar y permite otra acción con clave nueva', async () => {
  post.mockRejectedValueOnce(new Error('sin conexión')).mockResolvedValue({ data: { id: 'r1' } });
  await expect(reserve('publicacion', 'clave-1')).rejects.toThrow('sin conexión');
  await reserve('publicacion', 'clave-1');
  expect(post.mock.calls[0][2].headers['Idempotency-Key']).toBe('clave-1');
  expect(post.mock.calls[1][2].headers['Idempotency-Key']).toBe('clave-1');
  await reserve('publicacion', 'clave-2');
  expect(post.mock.calls[2][2].headers['Idempotency-Key']).toBe('clave-2');
});

test('Mis Ventas consulta la ruta autenticada propia y no el feed público', async () => {
  get.mockResolvedValue({ data: [] });
  await myPublications();
  expect(get).toHaveBeenCalledWith('/publications/mine');
});

test('upload usa multipart con campo file y conserva la URL del servidor', async () => {
  post.mockResolvedValue({ data: { image_url: 'https://api.example/uploads/a.jpg' } });
  await expect(uploadImage({ uri: 'file:///foto.jpg', mimeType: 'image/jpeg' })).resolves.toBe('https://api.example/uploads/a.jpg');
  const form = post.mock.calls[0][1] as FormData;
  expect(form).toBeInstanceOf(FormData);
  expect(post.mock.calls[0][0]).toBe('/uploads');
});

test('crear STATIC envía solo campos del catálogo estático a la API', async () => {
  post.mockResolvedValue({ data: { id: 'p2' } });
  await savePublication({ type: 'STATIC', title: 'Libro', description: 'Edición 8', price: 250,
    image_url: 'https://api.example/uploads/libro.jpg', zone_id: 1, category_id: 3 });
  expect(post).toHaveBeenCalledWith('/publications', {
    type: 'STATIC', title: 'Libro', description: 'Edición 8', price: 250,
    image_url: 'https://api.example/uploads/libro.jpg', zone_id: 1, category_id: 3,
  });
});

test('WhatsApp usa teléfono canónico y codifica título sin duplicar 52', () => {
  const url = whatsappUrl('+525512345678', 'Cálculo & café', true);
  expect(url).toContain('https://wa.me/525512345678?text=');
  expect(decodeURIComponent(url.split('text=')[1])).toContain('Cálculo & café');
  expect(() => whatsappUrl('+15551234567', 'Libro', false)).toThrow('teléfono');
  expect(whatsappUrl('+526641234567', 'Libro', false)).toContain('me%20interesa');
});

test('fallo de Linking se muestra como error útil', async () => {
  open.mockRejectedValue(new Error('sin navegador'));
  await expect(openWhatsApp('+526641234567', 'Libro', false)).rejects.toThrow('No se pudo abrir WhatsApp');
});
