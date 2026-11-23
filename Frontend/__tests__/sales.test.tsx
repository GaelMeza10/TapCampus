import React from 'react';
import { fireEvent, render, waitFor, within } from '@testing-library/react-native';
import Sales from '../src/app/(tabs)/sales';
import { completeReservation, publicationAction } from '../src/services/marketplace';

let mockRouteType: string | undefined;
const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn(), navigate: jest.fn(), setParams: mockSetParams }), useLocalSearchParams: () => ({ type: mockRouteType }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn() }) }));
jest.mock('../src/services/whatsapp', () => ({ openWhatsApp: jest.fn() }));
const mockPublication = { id: 'p1', title: 'Burrito', type: 'LIVE', status: 'ACTIVE', price: '30.00', current_stock: 2, end_time: '2099-01-01T12:00:00.000Z', ganga_activation_mode: 'MANUAL', is_ganga_active: false };
const mockReservation = { id: 'r1', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', reservedAt: '2026-10-19T12:00:00.000Z', expiresAt: '2099-01-01T12:00:00.000Z', buyer: { id: 'b1', name: 'Luis' }, buyerContact: { phone: '+526641234567' } };
beforeEach(() => {
  jest.clearAllMocks();
  mockRouteType = undefined;
  const market = require('../src/services/marketplace');
  market.myPublications.mockResolvedValue([mockPublication]);
  market.sellerReservations.mockResolvedValue([mockReservation]);
  market.publicationAction.mockResolvedValue({ ...mockPublication, current_stock: 1 });
});

test('una acción fallida conserva publicaciones y deja el error fuera de la lista', async () => {
  (publicationAction as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const view = await render(<Sales />);
  await view.findByText('Unidad 1 · Luis');
  await fireEvent.press(view.getByText('−1 venta física'));
  await fireEvent.press(view.getByRole('button', { name: 'Registrar venta física' }));
  expect(await view.findByTestId('persistent-error')).toBeTruthy();
  expect(view.getByText('Error de red')).toBeTruthy();
  expect(view.getByText('Burrito')).toBeTruthy();
  expect(publicationAction).toHaveBeenCalledTimes(1);
});

test('volver de guardar cambia el tipo en ventas ya montada y el selector mantiene la URL sincronizada', async () => {
  const view = await render(<Sales />);
  await view.findByText('Unidad 1 · Luis');
  mockRouteType = 'STATIC';
  await view.rerender(<Sales />);
  expect(view.getByRole('tab', { name: 'Productos' }).props.accessibilityState.selected).toBe(true);
  expect(view.queryByText('Unidad 1 · Luis')).toBeNull();
  await fireEvent.press(view.getByRole('tab', { name: 'Ahora en el campus' }));
  expect(mockSetParams).toHaveBeenCalledWith({ type: 'LIVE' });
  expect(view.getByRole('tab', { name: 'Ahora en el campus' }).props.accessibilityState.selected).toBe(true);
});
jest.mock('../src/services/marketplace', () => ({
  zones: jest.fn(async () => []),
  myPublications: jest.fn(async () => [mockPublication]), sellerReservations: jest.fn(async () => [mockReservation]),
  completeReservation: jest.fn(async () => ({ ...mockReservation, status: 'COMPLETED' })),
  publicationAction: jest.fn(async () => ({ ...mockPublication, current_stock: 1 })), apiMessage: () => 'Error de red',
}));

test('confirmar entrega y venta física requieren confirmación visual y conservan ID', async () => {
  const view = await render(<Sales />);
  await view.findByText('Unidad 1 · Luis');
  expect(view.queryByText(/Reserva r1|Publicación p1|LIVE|ACTIVE/)).toBeNull();
  await fireEvent.press(view.getByLabelText(/Confirmar entrega de Burrito/));
  expect(completeReservation).not.toHaveBeenCalled();
  const confirmation = await view.findByText(/¿Confirmar la entrega de Burrito/);
  expect(confirmation.props.children).not.toMatch(/r1|p1|ACTIVE|LIVE/);
  await fireEvent.press(view.getByRole('button', { name: 'Confirmar entrega' }));
  await waitFor(() => expect(completeReservation).toHaveBeenCalledWith('r1'));
  await fireEvent.press(view.getByText('−1 venta física'));
  expect(publicationAction).not.toHaveBeenCalled();
  expect(await view.findByText(/venta física de Burrito/)).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Registrar venta física' }));
  await waitFor(() => expect(publicationAction).toHaveBeenCalledWith('p1', 'physical-sale'));
});

test('dos apartados del mismo segundo conservan acciones independientes y nombres accesibles', async () => {
  const second = { ...mockReservation, id: 'r2', buyer: { id: 'b2', name: 'Marta' } };
  const marketplace = require('../src/services/marketplace');
  marketplace.sellerReservations.mockResolvedValueOnce([second, mockReservation])
    .mockResolvedValue([mockReservation, { ...second, status: 'COMPLETED' }]);
  const view = await render(<Sales />);
  await view.findByText('Unidad 2 de 2 · Marta');
  expect(view.getByText('Unidad 1 de 2 · Luis')).toBeTruthy();
  expect(view.queryByText(/r1|r2|p1|LIVE|ACTIVE/)).toBeNull();
  await fireEvent.press(view.getByLabelText(/Confirmar entrega de Burrito · Unidad 2 de 2/));
  const confirmation = await view.findByText(/¿Confirmar la entrega de .*Marta/);
  expect(confirmation.props.children).not.toMatch(/r2|p1|ACTIVE|LIVE/);
  await fireEvent.press(view.getByRole('button', { name: 'Confirmar entrega' }));
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
  expect(view.getByText(/AHORA EN EL CAMPUS · ACTIVA/)).toBeTruthy();
  const label = view.getByLabelText(/Confirmar entrega de Burrito · Unidad 1 de 4/).props.accessibilityLabel;
  expect(label).toContain('Luis');
  expect(label).not.toMatch(/r1|p1|LIVE|ACTIVE/);
});

test('venta finalizada oculta acciones de publicación y permite entregar una reserva vigente', async () => {
  const market = require('../src/services/marketplace');
  market.myPublications.mockResolvedValue([{ ...mockPublication, status: 'FINISHED', end_time: '2000-01-01T12:00:00Z' }]);
  market.sellerReservations.mockResolvedValueOnce([mockReservation]).mockResolvedValue([{ ...mockReservation, status: 'COMPLETED' }]);
  const view = await render(<Sales />);
  await view.findByText(/AHORA EN EL CAMPUS · FINALIZADA/);
  expect(view.queryByText('−1 venta física')).toBeNull();
  expect(view.queryByText('Editar publicación')).toBeNull();
  expect(view.queryByText(/Activar oferta/)).toBeNull();
  await fireEvent.press(view.getByLabelText(/Confirmar entrega de Burrito/));
  await fireEvent.press(view.getByRole('button', { name: 'Confirmar entrega' }));
  await waitFor(() => expect(completeReservation).toHaveBeenCalledWith('r1'));
  await view.findByText(/Estado: Entrega confirmada/);
});

test('Catálogo permite marcar vendido con confirmación y retira acciones al terminar', async () => {
  const market = require('../src/services/marketplace');
  const book = { ...mockPublication, id: 'book', type: 'STATIC', title: 'Cálculo I', description: 'Libro completo.', price: '180.00', current_stock: null };
  market.myPublications.mockResolvedValueOnce([book]).mockResolvedValue([{ ...book, status: 'FINISHED' }]);
  market.publicationAction.mockResolvedValue({ ...book, status: 'FINISHED' });
  const view = await render(<Sales />);
  expect(view.getByRole('tab', { name: 'Ahora en el campus' }).props.accessibilityState.selected).toBe(true);
  await fireEvent.press(view.getByRole('tab', { name: 'Productos' }));
  expect(view.getByRole('tab', { name: 'Productos' }).props.accessibilityState.selected).toBe(true);
  await view.findByText('Cálculo I');
  expect(view.queryByText('−1 venta física')).toBeNull();
  expect(view.queryByText(/Reservas por entregar/)).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Marcar vendido' }));
  expect(publicationAction).not.toHaveBeenCalled();
  await fireEvent.press(within(view.getByTestId('confirmation-dialog')).getByRole('button', { name: 'Marcar vendido' }));
  await waitFor(() => expect(publicationAction).toHaveBeenCalledWith('book', 'sold'));
  await view.findByText(/PRODUCTO · VENDIDO/);
  expect(view.queryByText('Editar publicación')).toBeNull();
});
