import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import HomePage from '../src/app/homePage';
import { listPublications } from '../src/services/marketplace';

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
  expect(listPublications).not.toHaveBeenCalledWith('LIVE', 1, 2);
  await fireEvent.press(view.getByRole('button', { name: 'Ver publicaciones' }));
  await waitFor(() => expect(listPublications).toHaveBeenCalledWith('LIVE', 1, 2));
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
  await view.findByText('Torta de pollo');
  expect(view.queryByText('No se pudieron cargar las publicaciones.')).toBeNull();
});

test('cambiar tipo ignora respuestas antiguas y el + conserva el tipo visible', async () => {
  const late: ((rows: unknown[]) => void)[] = [];
  (listPublications as jest.Mock).mockImplementation((type: string) => type === 'LIVE' ? new Promise(resolve => late.push(resolve)) : Promise.resolve([{ ...product, id: 'book', title: 'Libro de cálculo', type: 'STATIC' }]));
  const view = await render(<HomePage />);
  await fireEvent.press(view.getByRole('tab', { name: 'Catálogo' }));
  await view.findByText('Libro de cálculo');
  await act(async () => { late.forEach(resolve => resolve([product])); });
  expect(view.queryByText('Torta de pollo')).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Crear publicación' }));
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/publication/edit', params: { type: 'STATIC' } });
});

test('error al refrescar mantiene las publicaciones y la navegación', async () => {
  const list = listPublications as jest.Mock;
  list.mockResolvedValue([product]);
  const view = await render(<HomePage />);
  await view.findByText('Torta de pollo');
  list.mockRejectedValue(new Error('offline'));
  await act(async () => { mockListeners.connect(); });
  await view.findByText('Error de red');
  expect(view.getByText('Torta de pollo')).toBeTruthy();
  expect(view.getByRole('tab', { name: 'Reservas' })).toBeTruthy();
});
