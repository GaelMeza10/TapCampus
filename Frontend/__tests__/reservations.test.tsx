import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import MyReservations from '../src/app/(tabs)/reservations';
import { cancelReservation, myReservations } from '../src/services/marketplace';
import { openWhatsApp } from '../src/services/whatsapp';
import { reservationSections } from '../src/lib/reservation-presentation';
import type { Reservation } from '../src/services/marketplace';
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn() }) }));

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), navigate: mockNavigate }), useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }));
jest.mock('../src/services/whatsapp', () => ({ openWhatsApp: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({ myReservations: jest.fn(), cancelReservation: jest.fn(), apiMessage: () => 'Error de red' }));

const base = { publicationId: 'p1', publicationTitle: 'Burrito', unitPrice: '30.00',
  reservedAt: '2026-10-19T12:00:00.000Z', expiresAt: '2099-10-19T12:20:00.000Z', resolvedAt: null };

beforeEach(() => { jest.clearAllMocks(); });

test('0047 ubicación guardada y vendedor se leen sin consultar el detalle público', async () => {
  (myReservations as jest.Mock).mockResolvedValue([{ ...base, id: 'pickup', status: 'ACTIVE', sellerName: 'Ana López', pickupLocation: { zoneId: 1, name: 'Cafetería Central', source: 'SNAPSHOT' } }]);
  const view = await render(<MyReservations />);
  expect(await view.findByText('Ubicación: Cafetería Central')).toBeTruthy();
  expect(view.getByText('Vendedor: Ana López')).toBeTruthy();
});
test('0047 histórico diferencia ubicación de referencia sin inventar el punto original', async () => {
  (myReservations as jest.Mock).mockResolvedValue([{ ...base, id: 'legacy', status: 'ACTIVE', pickupLocation: { zoneId: 1, name: 'Biblioteca Central', source: 'LEGACY_CURRENT' } }]);
  const view = await render(<MyReservations />);
  expect(await view.findByText('Ubicación de referencia: Biblioteca Central')).toBeTruthy();
  expect(view.getByText(/Esta reserva no guardó el punto original/)).toBeTruthy();
});

test('cancelación fallida conserva el apartado y error persistente sin repetir la acción', async () => {
  (myReservations as jest.Mock).mockResolvedValue([{ ...base, id: 'r1', status: 'ACTIVE' }]);
  (cancelReservation as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const view = await render(<MyReservations />);
  await view.findByText('Burrito');
  await fireEvent.press(view.getByRole('button', { name: /Cancelar Burrito/ }));
  await fireEvent.press(view.getByText('Sí, cancelar reserva'));
  expect(await view.findByTestId('persistent-error')).toBeTruthy();
  expect(view.getByText('Error de red')).toBeTruthy();
  expect(view.getByText('Activa')).toBeTruthy();
  expect(cancelReservation).toHaveBeenCalledTimes(1);
});

test('una reserva a menos de cinco minutos muestra urgencia sin cambiar precio ni acciones', async () => {
  (myReservations as jest.Mock).mockResolvedValue([{ ...base, id: 'urgent', status: 'ACTIVE', expiresAt: new Date(Date.now() + 120000).toISOString(), sellerContact: { phone: '+526641234567' } }]);
  const view = await render(<MyReservations />);
  expect(await view.findByText('Por vencer')).toBeTruthy();
  expect(view.getByLabelText('Precio reservado: $30')).toBeTruthy();
  expect(view.getByRole('button', { name: /Cancelar Burrito/ })).toBeTruthy();
  expect(view.getByRole('button', { name: /Contactar por WhatsApp sobre Burrito/ })).toBeTruthy();
  expect(cancelReservation).not.toHaveBeenCalled();
});

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
  await view.findByText('Cancelada');
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
  await view.findByText('Activa');
  expect(view.getByText('Entrega confirmada')).toBeTruthy();
  expect(view.getByText('Cancelada')).toBeTruthy();
  expect(view.getByText('Vencida')).toBeTruthy();
  expect(view.getByText(/Plazo terminado; actualizando/)).toBeTruthy();
  await waitFor(() => expect(myReservations).toHaveBeenCalledTimes(2));
  expect(view.queryByText(/r1|r2|r3|r4|r5|ACTIVE|COMPLETED|CANCELLED|EXPIRED/)).toBeNull();
});

test('reserva muestra foto sin consultar detalle público y conserva precio/acciones si falla', async () => {
  (myReservations as jest.Mock).mockResolvedValue([{ ...base, id: 'r1', status: 'ACTIVE', publicationImageUrl: 'https://api.example/photo.png', sellerContact: { phone: '+526641234567' } }]);
  const view = await render(<MyReservations />);
  const photo = await view.findByLabelText('Foto de Burrito');
  expect(photo.props.source).toEqual([{ uri: 'https://api.example/photo.png' }]);
  await fireEvent(photo, 'error', { nativeEvent: { error: 'offline' } });
  expect(view.getByLabelText('Foto no disponible de Burrito')).toBeTruthy();
  expect(view.getByLabelText('Precio reservado: $30')).toBeTruthy();
  expect(view.getByLabelText(/Cancelar Burrito/)).toBeTruthy();
  expect(view.getByText('WhatsApp')).toBeTruthy();
});

test('prioriza vencimientos sin renumerar unidades ni perder reservas y ordena el historial', () => {
  const rows: Reservation[] = [
    { ...base, id: 'r1', status: 'ACTIVE', expiresAt: '2099-10-19T12:19:00Z' },
    { ...base, id: 'r2', status: 'ACTIVE', expiresAt: '2099-10-19T12:18:00Z' },
    { ...base, id: 'r3', status: 'COMPLETED', resolvedAt: '2026-11-09T12:00:00Z' },
    { ...base, id: 'r4', status: 'EXPIRED', resolvedAt: '2026-11-10T12:00:00Z' },
  ];
  const sections = reservationSections(rows);
  expect(sections.map(section => section.title)).toEqual(['Por recoger', 'Anteriores']);
  expect(sections.map(section => section.data.map(row => row.reservation.id))).toEqual([['r2', 'r1'], ['r4', 'r3']]);
  expect(sections[0].data[0].unitLabel).toBe('Unidad 2 de 4');
  expect(rows.map(row => row.id)).toEqual(['r1', 'r2', 'r3', 'r4']);
  expect(reservationSections([])).toEqual([]);
  expect(reservationSections([rows[3]])[0].title).toBe('Anteriores');
});

test('contacta la reserva autorizada y oculta acciones cuando terminó el plazo', async () => {
  (myReservations as jest.Mock).mockResolvedValue([
    { ...base, id: 'r1', status: 'ACTIVE', sellerContact: { phone: '+526641234567' } },
    { ...base, id: 'r2', status: 'ACTIVE', expiresAt: '2000-01-01T00:00:00Z', sellerContact: { phone: '+526641234567' } },
    { ...base, id: 'r3', status: 'COMPLETED', sellerContact: { phone: '+526641234567' } },
  ]);
  const view = await render(<MyReservations />);
  const contacts = await view.findAllByLabelText(/Contactar por WhatsApp sobre/);
  expect(contacts).toHaveLength(1);
  expect(view.getAllByRole('button', { name: /^Cancelar Burrito/ })).toHaveLength(1);
  await fireEvent.press(contacts[0]);
  expect(openWhatsApp).toHaveBeenCalledWith('+526641234567', 'Burrito', true);
  expect(view.getByText('Plazo terminado; actualizando')).toBeTruthy();
});

test('recupera un error inicial sin inventar reservas y el vacío lleva a Explorar', async () => {
  (myReservations as jest.Mock).mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]);
  const view = await render(<MyReservations />);
  await view.findByText('No pudimos cargar tus reservas');
  await fireEvent.press(view.getByRole('button', { name: 'Reintentar' }));
  await view.findByText('Aún no tienes reservas');
  expect(view.queryByText('Por recoger')).toBeNull();
  expect(view.queryByText('Anteriores')).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Explorar publicaciones' }));
  expect(mockNavigate).toHaveBeenCalledWith('/homePage');
});

test('la carga anuncia su estado una sola vez y no muestra datos ficticios', async () => {
  (myReservations as jest.Mock).mockImplementation(() => new Promise(() => {}));
  const view = await render(<MyReservations />);
  expect(view.getByRole('progressbar').props.accessibilityLabel).toBe('Cargando reservas…');
  expect(view.queryByText('Precio reservado')).toBeNull();
  expect(view.queryByText('Por recoger')).toBeNull();
});
