import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import MyReservations from '../src/app/reservations';
import { cancelReservation, myReservations } from '../src/services/marketplace';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('../src/services/whatsapp', () => ({ openWhatsApp: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({ myReservations: jest.fn(), cancelReservation: jest.fn(), apiMessage: () => 'Error de red' }));

const base = { publicationId: 'p1', publicationTitle: 'Burrito', unitPrice: '30.00',
  reservedAt: '2026-10-19T12:00:00.000Z', expiresAt: '2099-10-19T12:20:00.000Z', resolvedAt: null };

beforeEach(() => { jest.clearAllMocks(); });

test('comprador distingue dos reservas del mismo segundo y cancela solo la elegida', async () => {
  const first = { ...base, id: 'r1', status: 'ACTIVE' };
  const second = { ...base, id: 'r2', status: 'ACTIVE' };
  (myReservations as jest.Mock).mockResolvedValueOnce([second, first])
    .mockResolvedValue([first, { ...second, status: 'CANCELLED' }]);
  (cancelReservation as jest.Mock).mockResolvedValue({ ...second, status: 'CANCELLED' });
  const view = await render(<MyReservations />);
  await view.findByText('Unidad 2 de 2');
  expect(view.getByText('Unidad 1 de 2')).toBeTruthy();
  expect(view.queryByText(/r1|r2|ACTIVE/)).toBeNull();
  await fireEvent.press(view.getByLabelText(/Cancelar Burrito · Unidad 2 de 2/));
  expect(view.getByLabelText(/Cancelar Burrito · Unidad 2 de 2/).props.accessibilityLabel).not.toMatch(/r2|ACTIVE/);
  expect(await view.findByText(/¿Cancelar Burrito · Unidad 2 de 2/)).toBeTruthy();
  await fireEvent.press(view.getByText('Sí, cancelar reserva'));
  await waitFor(() => expect(cancelReservation).toHaveBeenCalledWith('r2'));
  expect(cancelReservation).not.toHaveBeenCalledWith('r1');
  await view.findByText(/Estado: Cancelada/);
  expect(view.getByLabelText(/Cancelar Burrito · Unidad 1 de 2/)).toBeTruthy();
});

test('muestra los cuatro estados y avisa al vencer antes de la confirmación del servidor', async () => {
  (myReservations as jest.Mock).mockResolvedValue([
    { ...base, id: 'r1', publicationId: 'p1', status: 'ACTIVE' },
    { ...base, id: 'r2', publicationId: 'p2', status: 'COMPLETED' },
    { ...base, id: 'r3', publicationId: 'p3', status: 'CANCELLED' },
    { ...base, id: 'r4', publicationId: 'p4', status: 'EXPIRED' },
    { ...base, id: 'r5', publicationId: 'p5', status: 'ACTIVE', expiresAt: '2000-01-01T00:00:00.000Z' },
  ]);
  const view = await render(<MyReservations />);
  await view.findByText(/Estado: Activa/);
  expect(view.getByText(/Estado: Entrega confirmada/)).toBeTruthy();
  expect(view.getByText(/Estado: Cancelada/)).toBeTruthy();
  expect(view.getByText(/Estado: Vencida/)).toBeTruthy();
  expect(view.getByText(/Plazo terminado; actualizando/)).toBeTruthy();
  await waitFor(() => expect(myReservations).toHaveBeenCalledTimes(2));
  expect(view.queryByText(/r1|r2|r3|r4|r5|ACTIVE|COMPLETED|CANCELLED|EXPIRED/)).toBeNull();
});
