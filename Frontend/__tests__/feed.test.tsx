import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import HomePage from '../src/app/(tabs)/homePage';
import { listPublications, myReservations } from '../src/services/marketplace';
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn() }) }));

const mockListeners: Record<string, (payload?: unknown) => void> = {};
const mockPush = jest.fn();
jest.mock('socket.io-client', () => ({ io: jest.fn(() => ({ on: (event: string, callback: () => void) => { mockListeners[event] = callback; }, disconnect: jest.fn() })) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, navigate: jest.fn() }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('../src/services/marketplace', () => ({
  myReservations: jest.fn(async () => []), listPublications: jest.fn(), zones: jest.fn(async () => [{ id: 1, name: 'Ingeniería' }]),
  categories: jest.fn(async (type: string) => type === 'LIVE' ? [{ id: 2, name: 'Comida', type }] : [{ id: 3, name: 'Libros', type }]),
  apiMessage: () => 'Error de red',
}));
const product = { id: 'p1', title: 'Torta de pollo', price: '62.00', type: 'LIVE', status: 'ACTIVE', image_url: 'https://api.example/photo.png', seller: { name: 'Vendedor' }, current_stock: 6 };
beforeEach(() => { jest.clearAllMocks(); (listPublications as jest.Mock).mockResolvedValue([]); });

test('0047 creación e inicio se reflejan sin navegar, conservan consulta y agrupan la ráfaga', async () => {
  (listPublications as jest.Mock).mockResolvedValue([]);
  const view = await render(<HomePage />);
  await fireEvent.changeText(view.getByLabelText('Buscar productos'), 'Torta');
  await fireEvent(view.getByLabelText('Buscar productos'), 'submitEditing');
  await waitFor(() => expect(listPublications).toHaveBeenLastCalledWith('LIVE', undefined, undefined, 'Torta'));
  const before = (listPublications as jest.Mock).mock.calls.length;
  (listPublications as jest.Mock).mockResolvedValue([product]);
  await act(async () => { mockListeners.publication_created(); mockListeners.publication_updated(); mockListeners.publication_available(); });
  expect(await view.findByRole('button', { name: 'Ver Torta de pollo' })).toBeTruthy();
  expect((listPublications as jest.Mock).mock.calls.length).toBe(before + 1);
  expect(view.getByLabelText('Buscar productos').props.value).toBe('Torta');
  expect(mockPush).not.toHaveBeenCalled();
});

test('0047 stock cero retira la tarjeta y explica que las reservas conservan su plazo', async () => {
  (listPublications as jest.Mock).mockResolvedValue([product]);
  const view = await render(<HomePage />);
  await view.findByRole('button', { name: 'Ver Torta de pollo' });
  (listPublications as jest.Mock).mockResolvedValue([]);
  await act(async () => { mockListeners.stock_updated({ publicationId: product.id, newStock: 0 }); });
  expect(view.queryByRole('button', { name: 'Ver Torta de pollo' })).toBeNull();
  expect(view.getByText(/sin unidades disponibles. Tus reservas conservan su plazo/)).toBeTruthy();
});

test('0047 entrega por acordar aplica sin enviar zona ficticia y conserva búsqueda', async () => {
  const arranged = { ...product, id: 'arranged', type: 'STATIC', category_id: 3, zone_id: null, pickup_mode: 'ARRANGED' };
  (listPublications as jest.Mock).mockImplementation(type => Promise.resolve(type === 'STATIC' ? [arranged] : []));
  const view = await render(<HomePage />);
  await fireEvent.press(view.getByRole('tab', { name: 'Productos' }));
  await view.findByRole('button', { name: 'Ver Torta de pollo' });
  await fireEvent.press(view.getByRole('button', { name: /^Filtros\./ }));
  await fireEvent.press(await view.findByRole('radio', { name: 'Entrega por acordar' }));
  await fireEvent.press(view.getByRole('button', { name: 'Ver publicaciones' }));
  await waitFor(() => expect(listPublications).toHaveBeenLastCalledWith('STATIC', undefined, undefined, undefined, 'ARRANGED'));
});

test('filtros se aplican juntos, cerrar descarta borrador y los eventos reconsultan', async () => {
  (listPublications as jest.Mock).mockImplementation((_type, zone, category, q) => Promise.resolve(!zone && !category && !q ? [{ ...product, zone_id: 1, category_id: 2 }] : []));
  const view = await render(<HomePage />);
  await fireEvent.press(view.getByRole('button', { name: /^Filtros\./ }));
  await view.findByRole('radio', { name: 'Ingeniería' });
  await fireEvent.press(view.getByRole('radio', { name: 'Ingeniería' }));
  await fireEvent.press(view.getByRole('radio', { name: 'Comida' }));
  expect(listPublications).not.toHaveBeenCalledWith('LIVE', 1, 2, undefined);
  await fireEvent.press(view.getByRole('button', { name: 'Ver publicaciones' }));
  await waitFor(() => expect(listPublications).toHaveBeenCalledWith('LIVE', 1, 2, undefined));
  await fireEvent.press(view.getByRole('button', { name: /^Filtros\./ }));
  await fireEvent.press(view.getByRole('button', { name: 'Restablecer filtros' }));
  await fireEvent.press(view.getByRole('button', { name: 'Cerrar panel' }));
  expect(view.getByRole('button', { name: /Filtros\. Ingeniería\. Comida/ })).toBeTruthy();
  const before = (listPublications as jest.Mock).mock.calls.length;
  await act(async () => { mockListeners.stock_updated(); mockListeners.publication_expired(); mockListeners.ganga_activated(); mockListeners.connect(); });
  await waitFor(() => expect((listPublications as jest.Mock).mock.calls.length).toBeGreaterThan(before));
});

test('fallo de red termina la carga y reintentar muestra publicaciones', async () => {
  const list = listPublications as jest.Mock;
  list.mockRejectedValue(new Error('timeout'));
  const view = await render(<HomePage />);
  await view.findByText('No se pudieron cargar las publicaciones.');
  list.mockResolvedValue([product]);
  await fireEvent.press(view.getByRole('button', { name: 'Reintentar' }));
  await view.findByRole('button', { name: 'Ver Torta de pollo' });
  await fireEvent.press(view.getByRole('button', { name: 'Ver Torta de pollo' }));
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/publication/[id]', params: { id: 'p1' } });
  expect(view.queryByText('No se pudieron cargar las publicaciones.')).toBeNull();
});

test('cambiar tipo ignora respuestas antiguas y Vender permite elegir Productos', async () => {
  const late: ((rows: unknown[]) => void)[] = [];
  (listPublications as jest.Mock).mockImplementation((type: string) => type === 'LIVE' ? new Promise(resolve => late.push(resolve)) : Promise.resolve([{ ...product, id: 'book', title: 'Libro de cálculo', type: 'STATIC' }]));
  const view = await render(<HomePage />);
  await fireEvent.press(view.getByRole('tab', { name: 'Productos' }));
  await view.findByRole('button', { name: 'Ver Libro de cálculo' });
  await act(async () => { late.forEach(resolve => resolve([product])); });
  expect(view.queryByText('Torta de pollo')).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Vender' }));
  await fireEvent.press(view.getByRole('button', { name: 'Productos' }));
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/publication/edit', params: { type: 'STATIC' } });
});

test('error al refrescar mantiene las publicaciones y la navegación', async () => {
  const list = listPublications as jest.Mock;
  list.mockResolvedValue([product]);
  const view = await render(<HomePage />);
  await view.findByRole('button', { name: 'Ver Torta de pollo' });
  list.mockRejectedValue(new Error('offline'));
  await act(async () => { mockListeners.connect(); });
  await view.findByText('Error de red');
  expect(view.getByText('Torta de pollo')).toBeTruthy();
  expect(view.getByRole('tab', { name: 'Reservas' })).toBeTruthy();
});

test('buscar combina filtros; enviar es inmediato y limpiar conserva zona/categoría', async () => {
  (listPublications as jest.Mock).mockImplementation((_type, zone, category, q) => Promise.resolve(!zone && !category && !q ? [{ ...product, zone_id: 1, category_id: 2 }] : []));
  const view = await render(<HomePage />);
  await fireEvent.press(view.getByRole('button', { name: /^Filtros\./ }));
  await fireEvent.press(await view.findByRole('radio', { name: 'Ingeniería' }));
  await fireEvent.press(view.getByRole('radio', { name: 'Comida' }));
  await fireEvent.press(view.getByRole('button', { name: 'Ver publicaciones' }));
  await fireEvent.changeText(view.getByLabelText('Buscar productos'), '  Torta   de pollo  ');
  await fireEvent(view.getByLabelText('Buscar productos'), 'submitEditing');
  await waitFor(() => expect(listPublications).toHaveBeenLastCalledWith('LIVE', 1, 2, 'Torta de pollo'));
  expect(await view.findByText(/No encontramos publicaciones para «Torta de pollo»/)).toBeTruthy();
  await fireEvent.press(view.getByLabelText('Limpiar texto de búsqueda'));
  await waitFor(() => expect(listPublications).toHaveBeenLastCalledWith('LIVE', 1, 2, undefined));
  expect(view.getByLabelText('Buscar productos').props.value).toBe('');
});

test('espera 300 ms sin consultar por cada letra y conserva búsqueda al cambiar tipo', async () => {
  const view = await render(<HomePage />);
  await view.findByText('Nadie vende ahora');
  const count = (listPublications as jest.Mock).mock.calls.length;
  jest.useFakeTimers();
  try {
    await fireEvent.changeText(view.getByLabelText('Buscar productos'), 'Li');
    await act(async () => { jest.advanceTimersByTime(200); });
    expect(listPublications).toHaveBeenCalledTimes(count);
    await fireEvent.changeText(view.getByLabelText('Buscar productos'), 'Libro');
    await act(async () => { jest.advanceTimersByTime(299); });
    expect(listPublications).toHaveBeenCalledTimes(count);
    await act(async () => { jest.advanceTimersByTime(1); });
    expect(listPublications).toHaveBeenLastCalledWith('LIVE', undefined, undefined, 'Libro');
    await fireEvent.press(view.getByRole('tab', { name: 'Productos' }));
    expect(listPublications).toHaveBeenLastCalledWith('STATIC', undefined, undefined, 'Libro');
    expect(view.getByLabelText('Buscar productos').props.value).toBe('Libro');
  } finally { jest.useRealTimers(); }
});

test('otra búsqueda ignora respuesta antigua, error conserva consulta y reintenta', async () => {
  const pending: Record<string, (rows: unknown[]) => void> = {};
  (listPublications as jest.Mock).mockImplementation((_type, _zone, _category, q) => q ? new Promise(resolve => { pending[q] = resolve; }) : Promise.resolve([]));
  const view = await render(<HomePage />);
  await fireEvent.changeText(view.getByLabelText('Buscar productos'), 'Torta');
  await fireEvent(view.getByLabelText('Buscar productos'), 'submitEditing');
  await fireEvent.changeText(view.getByLabelText('Buscar productos'), 'Libro');
  await fireEvent(view.getByLabelText('Buscar productos'), 'submitEditing');
  await act(async () => { pending.Libro([{ ...product, title: 'Libro', id: 'book' }]); });
  await view.findByText('Libro');
  await act(async () => { pending.Torta([product]); });
  expect(view.queryByText('Torta de pollo')).toBeNull();
  (listPublications as jest.Mock).mockRejectedValue(new Error('offline'));
  await fireEvent.changeText(view.getByLabelText('Buscar productos'), 'Café');
  await fireEvent(view.getByLabelText('Buscar productos'), 'submitEditing');
  await view.findByText('No se pudieron cargar las publicaciones.');
  expect(view.getByLabelText('Buscar productos').props.value).toBe('Café');
  (listPublications as jest.Mock).mockResolvedValue([]);
  await fireEvent.press(view.getByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(listPublications).toHaveBeenLastCalledWith('LIVE', undefined, undefined, 'Café'));
});

test('destaca solo una Ganga real sin duplicarla y Reservar abre detalle sin enviar reserva', async () => {
  (listPublications as jest.Mock).mockResolvedValue([
    { ...product, is_ganga_active: true, price_before_ganga: '85', zone_id: 1, end_time: new Date(Date.now() + 8 * 60000).toISOString() },
    { ...product, id: 'p2', title: 'Burritos', current_stock: 1, zone_id: 1 },
  ]);
  const view = await render(<HomePage />);
  await view.findByText('GANGA');
  expect(view.getAllByText('Torta de pollo')).toHaveLength(1);
  expect(view.getByText('Queda 1')).toBeTruthy();
  expect(view.getByText('Cierra en 8 min')).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Reservar Torta de pollo' }));
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/publication/[id]', params: { id: 'p1' } });
});

test('chips del servidor combinan zona y búsqueda; anuncio omite tiempo y stock', async () => {
  (listPublications as jest.Mock).mockImplementation(type => Promise.resolve([{ ...product, type, zone_id: 1 }]));
  const view = await render(<HomePage />);
  await fireEvent.press(await view.findByRole('button', { name: 'Ingeniería' }));
  await waitFor(() => expect(listPublications).toHaveBeenLastCalledWith('LIVE', 1, undefined, undefined));
  await fireEvent.press(view.getByRole('tab', { name: 'Productos' }));
  await fireEvent.press(await view.findByRole('button', { name: 'Libros' }));
  await waitFor(() => expect(listPublications).toHaveBeenLastCalledWith('STATIC', 1, 3, undefined));
  expect(view.queryByText(/Quedan/)).toBeNull();
  expect(view.queryByText(/Cierra en/)).toBeNull();
});

test('banner escoge reserva vigente más próxima, excluye vencidas y fallo permite reintento', async () => {
  const now = Date.now();
  (myReservations as jest.Mock).mockResolvedValue([
    { id: 'old', status: 'ACTIVE', publicationTitle: 'Vencida', expiresAt: new Date(now - 1000).toISOString() },
    { id: 'late', status: 'ACTIVE', publicationTitle: 'Más tarde', expiresAt: new Date(now + 900000).toISOString() },
    { id: 'soon', status: 'ACTIVE', publicationTitle: 'Mi torta', expiresAt: new Date(now + 180000).toISOString() },
  ]);
  const view = await render(<HomePage />);
  await view.findByRole('button', { name: 'Ver reserva de Mi torta' });
  expect(view.queryByText('Vencida')).toBeNull();
  expect(view.queryByText('Más tarde')).toBeNull();
  (myReservations as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await act(async () => { mockListeners.connect(); });
  await view.findByText('No se pudieron actualizar tus reservas.');
  expect(view.getByRole('button', { name: 'Ver reserva de Mi torta' })).toBeTruthy();
});

test('vacío sin filtros no ofrece «Cambiar filtros» y explica cada pestaña', async () => {
  const view = await render(<HomePage />);
  expect(await view.findByText('Nadie vende ahora')).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Cambiar filtros' })).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Ver Productos' }));
  expect(await view.findByText('Aún no hay productos')).toBeTruthy();
  expect(view.queryByRole('button', { name: 'Cambiar filtros' })).toBeNull();
});
