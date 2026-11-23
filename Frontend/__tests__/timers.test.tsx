import React from 'react';
import { render } from '@testing-library/react-native';
import { ClosingBadge } from '../src/components/publication-badges';
import { ActiveReservationBanner } from '../src/components/explore-ui';

const now = Date.parse('2026-11-22T12:00:00.000Z');
const live = (minutes: number) => ({ type: 'LIVE' as const, status: 'ACTIVE' as const, current_stock: 3, end_time: new Date(now + minutes * 60000).toISOString() });

test.each([
  [45, 'Cierra en 45 min'],
  [60, 'Cierra en 1 h'],
  [340, 'Cierra en 5 h 40 min'],
])('cierre a %i minutos se lee «%s»', async (minutes, text) => {
  const view = await render(<ClosingBadge item={live(minutes)} now={now} />);
  expect(view.getByText(text)).toBeTruthy();
});

const reservation = (minutes: number) => ({ id: 'r1', publicationId: 'p1', publicationTitle: 'Burrito', status: 'ACTIVE', unitPrice: '30.00', expiresAt: new Date(now + minutes * 60000).toISOString() });

test('banner de reserva dice «Quedan» y avisa con texto cuando faltan 5 minutos o menos', async () => {
  const calm = await render(<ActiveReservationBanner item={reservation(19) as never} now={now} onPress={() => {}} />);
  expect(calm.getByText('Reserva activa')).toBeTruthy();
  expect(calm.getByText('Quedan 19:00')).toBeTruthy();
  calm.unmount();
  const urgent = await render(<ActiveReservationBanner item={reservation(4) as never} now={now} onPress={() => {}} />);
  expect(urgent.getByText('Por vencer')).toBeTruthy();
  expect(urgent.getByText('Quedan 04:00')).toBeTruthy();
});
