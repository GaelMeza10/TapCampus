import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Detail from '../src/app/publication/[id]';
import { cancelReservation, myReservations, publicationDetail, reserve } from '../src/services/marketplace';
import { randomUUID } from 'expo-crypto';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }), useLocalSearchParams: () => ({ id: 'p1' }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({
  zones: jest.fn(async () => []),
  publicationDetail: jest.fn(async () => ({ id: 'p1', type: 'LIVE', status: 'ACTIVE', title: 'Burrito', description: 'Caliente', price: '30.00', image_url: 'https://example.com/a.jpg', seller: { id: 's1', name: 'Ana' }, current_stock: 2, end_time: '2099-01-01T12:00:00.000Z', is_ganga_active: false })),
  myReservations: jest.fn(async () => []), reserve: jest.fn(), cancelReservation: jest.fn(), apiMessage: () => 'Error de red',
}));

beforeEach(() => { jest.clearAllMocks(); });

test('reintento conserva UUID; apartar otra unidad inicia UUID nuevo y muestra reserva propia', async () => {
  (randomUUID as jest.Mock).mockReturnValueOnce('uuid-uno').mockReturnValueOnce('uuid-dos');
  (reserve as jest.Mock).mockRejectedValueOnce(new Error('sin conexión'))
    .mockResolvedValueOnce({ id: 'r1', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', expiresAt: '2099-01-01T12:00:00.000Z', sellerContact: { phone: '+526641234567' } })
    .mockResolvedValueOnce({ id: 'r2', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', expiresAt: '2099-01-01T12:00:00.000Z', sellerContact: { phone: '+526641234567' } });
  const view = await render(<Detail />);
  await view.findByText('Burrito');
  await fireEvent.press(view.getByText('Apartar una unidad'));
  await view.findByText('Error de red');
  await fireEvent.press(view.getByText('Apartar una unidad'));
  await view.findByText('Reserva confirmada');
  expect((reserve as jest.Mock).mock.calls.slice(0, 2).map(call => call[1])).toEqual(['uuid-uno', 'uuid-uno']);
  await fireEvent.press(view.getByText('Apartar otra unidad'));
  await waitFor(() => expect(reserve).toHaveBeenCalledTimes(3));
  expect((reserve as jest.Mock).mock.calls[2][1]).toBe('uuid-dos');
});

test('409 muestra agotamiento sin crear una reserva local', async () => {
  (randomUUID as jest.Mock).mockReturnValue('uuid-409');
  (publicationDetail as jest.Mock).mockResolvedValueOnce({ id: 'p1', type: 'LIVE', status: 'ACTIVE', title: 'Burrito', description: 'Caliente', price: '30.00', image_url: 'https://example.com/a.jpg', seller: { id: 's1', name: 'Ana' }, current_stock: 1, end_time: '2099-01-01T12:00:00.000Z', is_ganga_active: false })
    .mockRejectedValueOnce({ response: { status: 404 } });
  (reserve as jest.Mock).mockRejectedValueOnce({ response: { status: 409 } });
  const view = await render(<Detail />);
  await view.findByText('Burrito');
  await fireEvent.press(view.getByText('Apartar una unidad'));
  await view.findByText(/Sin stock o publicación no disponible/);
  expect(view.queryByText('Reserva confirmada')).toBeNull();
  expect(reserve).toHaveBeenCalledWith('p1', 'uuid-409');
});

test('detalle muestra dos unidades sin UUID y cancela la tarjeta seleccionada', async () => {
  const base = { publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00',
    reservedAt: '2026-10-19T12:00:00.000Z', expiresAt: '2099-01-01T12:00:00.000Z', resolvedAt: null };
  (myReservations as jest.Mock).mockResolvedValue([{ ...base, id: 'r2' }, { ...base, id: 'r1' }]);
  (cancelReservation as jest.Mock).mockResolvedValue({ ...base, id: 'r2', status: 'CANCELLED' });
  const view = await render(<Detail />);
  await view.findByText('Burrito · Unidad 2 de 2');
  expect(view.getByText('Burrito · Unidad 1 de 2')).toBeTruthy();
  expect(view.queryByText(/r1|r2|ACTIVE/)).toBeNull();
  await fireEvent.press(view.getByLabelText(/Cancelar Burrito · Unidad 2 de 2/));
  expect(await view.findByText(/¿Cancelar Burrito · Unidad 2 de 2/)).toBeTruthy();
  await fireEvent.press(view.getByText('Sí, cancelar reserva'));
  await waitFor(() => expect(cancelReservation).toHaveBeenCalledWith('r2'));
  expect(cancelReservation).not.toHaveBeenCalledWith('r1');
});
