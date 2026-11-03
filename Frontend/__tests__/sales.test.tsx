import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Sales from '../src/app/sales';
import { completeReservation, publicationAction } from '../src/services/marketplace';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn() }) }));
jest.mock('../src/services/whatsapp', () => ({ openWhatsApp: jest.fn() }));
const mockPublication = { id: 'p1', title: 'Burrito', type: 'LIVE', status: 'ACTIVE', price: '30.00', current_stock: 2, end_time: '2099-01-01T12:00:00.000Z', ganga_activation_mode: 'MANUAL', is_ganga_active: false };
const mockReservation = { id: 'r1', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', reservedAt: '2026-10-19T12:00:00.000Z', expiresAt: '2099-01-01T12:00:00.000Z', buyer: { id: 'b1', name: 'Luis' }, buyerContact: { phone: '+526641234567' } };
beforeEach(() => { jest.clearAllMocks(); });
jest.mock('../src/services/marketplace', () => ({
  myPublications: jest.fn(async () => [mockPublication]), sellerReservations: jest.fn(async () => [mockReservation]),
  completeReservation: jest.fn(async () => ({ ...mockReservation, status: 'COMPLETED' })),
  publicationAction: jest.fn(async () => ({ ...mockPublication, current_stock: 1 })), apiMessage: () => 'Error de red',
}));

test('confirmar entrega y venta física requieren confirmación visual y conservan ID', async () => {
  const view = await render(<Sales />);
  await view.findByText('Comprador: Luis');
  expect(view.queryByText(/Reserva r1|Publicación p1|LIVE|ACTIVE/)).toBeNull();
  fireEvent.press(view.getByLabelText(/Confirmar entrega de Burrito/));
  expect(completeReservation).not.toHaveBeenCalled();
  const confirmation = await view.findByText(/¿Confirmar la entrega de Burrito/);
  expect(confirmation.props.children).not.toMatch(/r1|p1|ACTIVE|LIVE/);
  fireEvent.press(view.getByText('Confirmar entrega'));
  await waitFor(() => expect(completeReservation).toHaveBeenCalledWith('r1'));
  fireEvent.press(view.getByText('−1 venta física'));
  expect(publicationAction).not.toHaveBeenCalled();
  expect(await view.findByText(/venta física de Burrito/)).toBeTruthy();
  fireEvent.press(view.getByText('Registrar venta física'));
  await waitFor(() => expect(publicationAction).toHaveBeenCalledWith('p1', 'physical-sale'));
});

test('dos apartados del mismo segundo conservan acciones independientes y nombres accesibles', async () => {
  const second = { ...mockReservation, id: 'r2', buyer: { id: 'b2', name: 'Marta' } };
  const marketplace = require('../src/services/marketplace');
  marketplace.sellerReservations.mockResolvedValueOnce([second, mockReservation])
    .mockResolvedValue([mockReservation, { ...second, status: 'COMPLETED' }]);
  const view = await render(<Sales />);
  await view.findByText('Burrito · Unidad 2 de 2');
  expect(view.getByText('Burrito · Unidad 1 de 2')).toBeTruthy();
  expect(view.queryByText(/r1|r2|p1|LIVE|ACTIVE/)).toBeNull();
  fireEvent.press(view.getByLabelText(/Confirmar entrega de Burrito · Unidad 2 de 2/));
  const confirmation = await view.findByText(/¿Confirmar la entrega de .*Marta/);
  expect(confirmation.props.children).not.toMatch(/r2|p1|ACTIVE|LIVE/);
  fireEvent.press(view.getByText('Confirmar entrega'));
  await waitFor(() => expect(completeReservation).toHaveBeenCalledWith('r2'));
  expect(completeReservation).not.toHaveBeenCalledWith('r1');
  await view.findByText(/Estado: Entrega confirmada/);
  expect(view.getByLabelText(/Confirmar entrega de Burrito · Unidad 1 de 2/)).toBeTruthy();
});

test('vendedor lee cuatro estados en español y etiquetas accesibles sin identificadores', async () => {
  const marketplace = require('../src/services/marketplace');
  marketplace.sellerReservations.mockResolvedValueOnce([
    mockReservation,
    { ...mockReservation, id: 'r2', status: 'COMPLETED' },
    { ...mockReservation, id: 'r3', status: 'CANCELLED' },
    { ...mockReservation, id: 'r4', status: 'EXPIRED' },
  ]);
  const view = await render(<Sales />);
  await view.findByText(/Estado: Entrega confirmada/);
  expect(view.getByText(/Estado: Cancelada/)).toBeTruthy();
  expect(view.getByText(/Estado: Vencida/)).toBeTruthy();
  expect(view.getByText(/En vivo · Activa/)).toBeTruthy();
  const label = view.getByLabelText(/Confirmar entrega de Burrito · Unidad 1 de 4/).props.accessibilityLabel;
  expect(label).toContain('Luis');
  expect(label).not.toMatch(/r1|p1|LIVE|ACTIVE/);
});
