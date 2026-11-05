import { formatReservationDate, presentReservations, publicationStatusLabel, publicationTypeLabel, reservationStatusLabel } from '../src/lib/reservation-presentation';
import type { Reservation } from '../src/services/marketplace';

const base: Reservation = {
  id: 'b', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE',
  reservedAt: '2026-10-19T12:00:00.000Z', expiresAt: '2026-10-19T12:20:00.000Z',
  resolvedAt: null, unitPrice: '30.00',
};

test('traduce estados, tipos y valores futuros sin filtrar enums', () => {
  const now = Date.parse('2026-10-19T12:05:00.000Z');
  expect(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'].map(status => reservationStatusLabel({ ...base, status: status as Reservation['status'] }, now)))
    .toEqual(['Activa', 'Entrega confirmada', 'Cancelada', 'Vencida']);
  expect(reservationStatusLabel(base, Date.parse(base.expiresAt))).toBe('Plazo terminado; actualizando');
  expect(reservationStatusLabel({ ...base, status: 'UNKNOWN' as Reservation['status'] }, now)).toBe('Estado no disponible');
  expect(publicationTypeLabel('LIVE')).toBe('Disponibles ahora');
  expect(publicationTypeLabel('STATIC')).toBe('Catálogo');
  expect(publicationTypeLabel('UNKNOWN')).toBe('Tipo no disponible');
  expect(publicationStatusLabel('FINISHED', 'STATIC')).toBe('Vendida');
  expect(publicationStatusLabel('FINISHED', 'LIVE')).toBe('Finalizada');
  expect(publicationStatusLabel('HIDDEN_BY_REPORTS', 'LIVE')).toBe('Oculta por reportes');
  expect(publicationStatusLabel('UNKNOWN', 'LIVE')).toBe('Estado no disponible');
});

test('fecha española local, fecha inválida y desempate interno sin mostrar ID', () => {
  expect(formatReservationDate(base.reservedAt)).toMatch(/2026/);
  expect(formatReservationDate('sin fecha')).toBe('Fecha no disponible');
  const rows = presentReservations([{ ...base, id: 'b' }, { ...base, id: 'a' }]);
  expect(rows.map(row => [row.reservation.id, row.unitLabel])).toEqual([['a', 'Unidad 1 de 2'], ['b', 'Unidad 2 de 2']]);
});
