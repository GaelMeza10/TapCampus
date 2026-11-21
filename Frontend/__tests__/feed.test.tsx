import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import HomePage from '../src/app/(tabs)/homePage';
import { listPublications } from '../src/services/marketplace';
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn() }) }));

const mockListeners: Record<string, () => void> = {};
const mockPush = jest.fn();
jest.mock('socket.io-client', () => ({ io: jest.fn(() => ({ on: (event: string, callback: () => void) => { mockListeners[event] = callback; }, disconnect: jest.fn() })) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, navigate: jest.fn() }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('../src/services/marketplace', () => ({
  listPublications: jest.fn(), zones: jest.fn(async () => [{ id: 1, name: 'Ingeniería' }]),
  categories: jest.fn(async (type: string) => type === 'LIVE' ? [{ id: 2, name: 'Comida', type }] : [{ id: 3, name: 'Libros', type }]),
  apiMessage: () => 'Error de red',
}));
const product = { id: 'p1', title: 'Torta de pollo', price: '62.00', type: 'LIVE', image_url: 'https://api.example/photo.png', seller: { name: 'Vendedor' }, current_stock: 6 };
beforeEach(() => { jest.clearAllMocks(); (listPublications as jest.Mock).mockResolvedValue([]); });

test('filtros se aplican juntos, cerrar descarta borrador y los eventos reconsultan', async () => {
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
  await fireEvent.press(view.getByRole('button', { name: 'Descubrir Torta de pollo' }));
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/publication/[id]', params: { id: 'p1' } });
  expect(view.queryByText('No se pudieron cargar las publicaciones.')).toBeNull();
});

test('cambiar tipo ignora respuestas antiguas y el + conserva el tipo visible', async () => {
  const late: ((rows: unknown[]) => void)[] = [];
  (listPublications as jest.Mock).mockImplementation((type: string) => type === 'LIVE' ? new Promise(resolve => late.push(resolve)) : Promise.resolve([{ ...product, id: 'book', title: 'Libro de cálculo', type: 'STATIC' }]));
  const view = await render(<HomePage />);
  await fireEvent.press(view.getByRole('tab', { name: 'Catálogo' }));
  await view.findByRole('button', { name: 'Ver Libro de cálculo' });
  await act(async () => { late.forEach(resolve => resolve([product])); });
  expect(view.queryByText('Torta de pollo')).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Crear publicación' }));
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
  await view.findByText('Sin resultados');
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
    await fireEvent.press(view.getByRole('tab', { name: 'Catálogo' }));
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
