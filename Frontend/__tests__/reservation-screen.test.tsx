import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Detail from '../src/app/publication/[id]';
import { cancelReservation, myReservations, publicationDetail, reserve } from '../src/services/marketplace';
import { randomUUID } from 'expo-crypto';

let mockSync: () => Promise<void>;
let mockRouteId = 'p1';
jest.mock('../src/hooks/use-marketplace-sync', () => ({ useMarketplaceSync: (refresh: () => Promise<void>) => { mockSync = refresh; } }));

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }), useLocalSearchParams: () => ({ id: mockRouteId }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({
  zones: jest.fn(async () => []),
  publicationDetail: jest.fn(async () => ({ id: 'p1', type: 'LIVE', status: 'ACTIVE', title: 'Burrito', description: 'Caliente', price: '30.00', image_url: 'https://example.com/a.jpg', seller: { id: 's1', name: 'Ana' }, current_stock: 2, end_time: '2099-01-01T12:00:00.000Z', is_ganga_active: false })),
  myReservations: jest.fn(async () => []), reserve: jest.fn(), cancelReservation: jest.fn(), apiMessage: () => 'Error de red',
}));

const product = { id: 'p1', type: 'LIVE', status: 'ACTIVE', title: 'Burrito', description: 'Caliente', price: '30.00', image_url: 'https://example.com/a.jpg', seller: { id: 's1', name: 'Ana' }, current_stock: 2, end_time: '2099-01-01T12:00:00.000Z', is_ganga_active: false };
const reservation = { id: 'r1', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', expiresAt: '2099-01-01T12:00:00.000Z', sellerContact: { phone: '+526641234567' } };
beforeEach(() => {
  mockRouteId = 'p1';
  jest.clearAllMocks();
  (publicationDetail as jest.Mock).mockReset().mockResolvedValue(product);
  (myReservations as jest.Mock).mockReset().mockResolvedValue([]);
  (reserve as jest.Mock).mockReset();
  (randomUUID as jest.Mock).mockReset().mockReturnValue('uuid-one');
});

test('foto fallida en detalle conserva información y permite apartar', async () => {
  const view = await render(<Detail />);
  const photo = await view.findByLabelText('Foto de Burrito');
  await fireEvent(photo, 'error', { nativeEvent: { error: 'Sin conexión' } });
  expect(view.getByLabelText('Foto no disponible de Burrito')).toBeTruthy();
  expect(view.getByText('Burrito')).toBeTruthy();
  expect(view.getByText('$30')).toBeTruthy();
  expect(view.getByRole('button', { name: 'Apartar una unidad' })).toBeTruthy();
  expect(reserve).not.toHaveBeenCalled();
});

test('reintento conserva UUID; apartar otra unidad inicia UUID nuevo y muestra reserva propia', async () => {
  (randomUUID as jest.Mock).mockReturnValueOnce('uuid-uno').mockReturnValueOnce('uuid-dos');
  (reserve as jest.Mock).mockRejectedValueOnce(new Error('sin conexión'))
    .mockResolvedValueOnce({ id: 'r1', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', expiresAt: '2099-01-01T12:00:00.000Z', sellerContact: { phone: '+526641234567' } })
    .mockResolvedValueOnce({ id: 'r2', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', expiresAt: '2099-01-01T12:00:00.000Z', sellerContact: { phone: '+526641234567' } });
  const view = await render(<Detail />);
  await view.findByText('Burrito');
  await fireEvent.press(view.getByText('Apartar una unidad'));
  await fireEvent.press(view.getByText('Sí, apartar'));
  await view.findByText('Error de red');
  await fireEvent.press(view.getByText('Reintentar apartado'));
  await view.findByText('Reserva confirmada');
  expect((reserve as jest.Mock).mock.calls.slice(0, 2).map(call => call[1])).toEqual(['uuid-uno', 'uuid-uno']);
  await fireEvent.press(view.getByText('Apartar otra unidad'));
  expect(reserve).toHaveBeenCalledTimes(2);
  await fireEvent.press(view.getByText('Sí, apartar'));
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
  await fireEvent.press(view.getByText('Sí, apartar'));
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

test('abrir, volver y cerrar con el sistema no envía ni crea clave', async () => {
  const view = await render(<Detail />);
  await fireEvent.press(await view.findByText('Apartar una unidad'));
  expect(view.getByText(/1 unidad · Precio actual: \$30/)).toBeTruthy();
  expect(view.queryByText('Contactar por WhatsApp')).toBeNull();
  expect(reserve).not.toHaveBeenCalled();
  expect(randomUUID).not.toHaveBeenCalled();
  await fireEvent.press(view.getByText('Volver'));
  expect(view.queryByText('¿Quieres apartar una unidad?')).toBeNull();
  await fireEvent.press(view.getByText('Apartar una unidad'));
  await fireEvent(view.getByTestId('confirmation-dialog'), 'requestClose');
  expect(view.queryByText('¿Quieres apartar una unidad?')).toBeNull();
  expect(reserve).not.toHaveBeenCalled();
  expect(randomUUID).not.toHaveBeenCalled();
});

test('confirmación pendiente bloquea doble toque y ambos cierres', async () => {
  let resolve!: (value: typeof reservation) => void;
  (reserve as jest.Mock).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const view = await render(<Detail />);
  await fireEvent.press(await view.findByText('Apartar una unidad'));
  await fireEvent.press(view.getByText('Sí, apartar'));
  expect(view.getByText('Apartando…')).toBeTruthy();
  await fireEvent.press(view.getByText('Apartando…'));
  await fireEvent.press(view.getByText('Volver'));
  await fireEvent(view.getByTestId('confirmation-dialog'), 'requestClose');
  expect(view.getByText('¿Quieres apartar una unidad?')).toBeTruthy();
  expect(reserve).toHaveBeenCalledTimes(1);
  await act(async () => resolve(reservation));
  expect(await view.findByText('Reserva confirmada')).toBeTruthy();
  expect(view.queryByText('¿Quieres apartar una unidad?')).toBeNull();
});

test('otra unidad conserva reserva anterior al volver y clave al fallar/cerrar/reabrir', async () => {
  (randomUUID as jest.Mock).mockReturnValueOnce('first').mockReturnValueOnce('second');
  (reserve as jest.Mock).mockResolvedValueOnce(reservation).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ ...reservation, id: 'r2' });
  const view = await render(<Detail />);
  await fireEvent.press(await view.findByText('Apartar una unidad'));
  await fireEvent.press(view.getByText('Sí, apartar'));
  await view.findByText('Reserva confirmada');
  await fireEvent.press(view.getByText('Apartar otra unidad'));
  await fireEvent.press(view.getByText('Volver'));
  expect(view.getByText('Reserva confirmada')).toBeTruthy();
  expect(randomUUID).toHaveBeenCalledTimes(1);
  await fireEvent.press(view.getByText('Apartar otra unidad'));
  await fireEvent.press(view.getByText('Sí, apartar'));
  await view.findByText('Error de red');
  await fireEvent.press(view.getByText('Volver'));
  await fireEvent.press(view.getByText('Reintentar apartado'));
  await fireEvent.press(view.getByText('Reintentar apartado'));
  await view.findByText('Reserva confirmada');
  expect((reserve as jest.Mock).mock.calls.map(call => call[1])).toEqual(['first', 'second', 'second']);
  expect(randomUUID).toHaveBeenCalledTimes(2);
});

test('resultado incierto permite recuperar misma clave aunque detalle refrescado sea 404', async () => {
  (reserve as jest.Mock).mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce(reservation);
  const view = await render(<Detail />);
  await fireEvent.press(await view.findByText('Apartar una unidad'));
  (publicationDetail as jest.Mock).mockRejectedValue({ response: { status: 404 } });
  await fireEvent.press(view.getByText('Sí, apartar'));
  await view.findByText('Error de red');
  await fireEvent.press(view.getByText('Volver'));
  await fireEvent.press(view.getByText('Reintentar apartado'));
  await fireEvent.press(view.getByText('Reintentar apartado'));
  await view.findByText('Reserva confirmada');
  expect((reserve as jest.Mock).mock.calls).toEqual([['p1', 'uuid-one'], ['p1', 'uuid-one']]);
  expect(randomUUID).toHaveBeenCalledTimes(1);
});

test.each([{ current_stock: 0 }, { end_time: '2000-01-01T00:00:00.000Z' }])('cambio conocido de disponibilidad %j impide envío nuevo', async change => {
  const view = await render(<Detail />);
  await fireEvent.press(await view.findByText('Apartar una unidad'));
  (publicationDetail as jest.Mock).mockResolvedValue({ ...product, ...change });
  await act(async () => mockSync());
  expect(view.getByText('Ya no se pueden apartar unidades de esta publicación.')).toBeTruthy();
  await fireEvent.press(view.getByText('Sí, apartar'));
  expect(reserve).not.toHaveBeenCalled();
  expect(randomUUID).not.toHaveBeenCalled();
});

test('precio actualizado requiere revisión y otra confirmación', async () => {
  (reserve as jest.Mock).mockResolvedValue(reservation);
  const view = await render(<Detail />);
  await fireEvent.press(await view.findByText('Apartar una unidad'));
  (publicationDetail as jest.Mock).mockResolvedValue({ ...product, price: '25.00' });
  await act(async () => mockSync());
  expect(view.getByText(/Precio actual: \$25/)).toBeTruthy();
  await fireEvent.press(view.getByText('Revisar nuevo precio'));
  expect(reserve).not.toHaveBeenCalled();
  await fireEvent.press(view.getByText('Sí, apartar'));
  await view.findByText('Reserva confirmada');
  expect(reserve).toHaveBeenCalledTimes(1);
});

test('STATIC conserva contacto directo y no ofrece apartado', async () => {
  (publicationDetail as jest.Mock).mockResolvedValue({ ...product, type: 'STATIC', sellerContact: { phone: '+526641234567' } });
  const view = await render(<Detail />);
  expect(await view.findByText('Contactar por WhatsApp')).toBeTruthy();
  expect(view.queryByText('Apartar una unidad')).toBeNull();
  expect(view.queryByText('¿Quieres apartar una unidad?')).toBeNull();
  expect(reserve).not.toHaveBeenCalled();
});

test('fin por reloj impide confirmar aunque el modal estuviera abierto', async () => {
  jest.useFakeTimers();
  try {
    (publicationDetail as jest.Mock).mockResolvedValue({ ...product, end_time: new Date(Date.now() + 2000).toISOString() });
    const view = await render(<Detail />);
    await fireEvent.press(await view.findByText('Apartar una unidad'));
    await act(async () => { jest.advanceTimersByTime(3000); });
    await fireEvent.press(view.getByText('Sí, apartar'));
    expect(view.getByText('Ya no se pueden apartar unidades de esta publicación.')).toBeTruthy();
    expect(reserve).not.toHaveBeenCalled();
  } finally { jest.useRealTimers(); }
});

test('cambiar de producto descarta el diálogo y una respuesta anterior no invade la nueva pantalla', async () => {
  let resolve!: (value: typeof reservation) => void;
  (reserve as jest.Mock).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const view = await render(<Detail />);
  await fireEvent.press(await view.findByText('Apartar una unidad'));
  await fireEvent.press(view.getByText('Sí, apartar'));
  mockRouteId = 'p2';
  (publicationDetail as jest.Mock).mockResolvedValue({ ...product, id: 'p2', title: 'Libro' });
  await view.rerender(<Detail />);
  await view.findByText('Libro');
  await act(async () => resolve(reservation));
  expect(view.queryByText('Reserva confirmada')).toBeNull();
  expect(view.queryByText('¿Quieres apartar una unidad?')).toBeNull();
  expect(view.getByText('Libro')).toBeTruthy();
  expect(reserve).toHaveBeenCalledTimes(1);
});
