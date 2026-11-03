import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import HomePage from '../src/app/homePage';
import { listPublications } from '../src/services/marketplace';

const mockListeners: Record<string, () => void> = {};
jest.mock('socket.io-client', () => ({ io: jest.fn(() => ({ on: (event: string, callback: () => void) => { mockListeners[event] = callback; }, disconnect: jest.fn() })) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('../src/services/marketplace', () => ({
  listPublications: jest.fn(async () => []), zones: jest.fn(async () => [{ id: 1, name: 'FIAD' }]),
  categories: jest.fn(async () => [{ id: 2, name: 'Comida', type: 'LIVE' }]),
  apiMessage: () => 'Error de red',
}));

test('feed filtra por zona/categoría y reconsulta tras eventos y reconexión', async () => {
  const view = await render(<HomePage />);
  await waitFor(() => expect(view.getByText('FIAD')).toBeTruthy());
  fireEvent.press(view.getByText('FIAD'));
  await waitFor(() => expect(listPublications).toHaveBeenCalledWith('LIVE', 1, undefined));
  fireEvent.press(view.getByText('Comida'));
  await waitFor(() => expect(listPublications).toHaveBeenCalledWith('LIVE', 1, 2));
  const before = (listPublications as jest.Mock).mock.calls.length;
  await act(async () => { mockListeners.stock_updated(); mockListeners.publication_expired(); mockListeners.ganga_activated(); mockListeners.connect(); });
  await waitFor(() => expect((listPublications as jest.Mock).mock.calls.length).toBeGreaterThan(before));
});

test('fallo de red termina la carga y reintentar muestra las publicaciones recibidas', async () => {
  const list = listPublications as jest.Mock;
  list.mockRejectedValue(new Error('timeout'));
  const view = await render(<HomePage />);
  await view.findByText('No se pudieron cargar las publicaciones.');
  list.mockResolvedValue([{ id: 'p1', title: 'Torta de pollo', price: '62.00', type: 'LIVE',
    image_url: 'https://api.example/uploads/photo.png', seller: { name: 'Vendedor' }, current_stock: 6 }]);
  fireEvent.press(view.getByText('Reintentar'));
  await view.findByText('Torta de pollo');
  expect(view.queryByText('No se pudieron cargar las publicaciones.')).toBeNull();
  list.mockResolvedValue([]);
});
