import React from 'react';
import { render } from '@testing-library/react-native';
import { ExploreCard } from '../src/components/explore-ui';
import PublicationDetailContent from '../src/components/publication-detail-content';
import PublisherCard from '../src/components/Publisher_Card';
import type { Publication } from '../src/services/marketplace';

const now = Date.parse('2026-11-22T20:00:00Z');
const base = {
  id: 'same-publication', type: 'LIVE', status: 'ACTIVE', title: 'Café de olla', description: 'Preparado hoy.',
  price: '0.10', price_before_ganga: '0.30', is_ganga_active: true, current_stock: 1,
  end_time: new Date(now + 15 * 60000).toISOString(), seller: { id: 'seller', name: 'Ana' },
} as Publication;

function Surfaces({ item }: { item: Publication }) {
  return <>
    <ExploreCard item={item} now={now} onPress={() => {}} />
    <PublicationDetailContent item={item} now={now} />
    <PublisherCard item={item} now={now} onPress={() => {}} />
  </>;
}

test('la misma publicación conserva precio, ahorro, GANGA, stock y cierre en todas las tarjetas y detalle', async () => {
  const view = await render(<Surfaces item={base} />);
  for (const text of ['GANGA', 'Queda 1', 'Cierra en 15 min', 'Ahorras $0.20']) expect(view.getAllByText(text)).toHaveLength(3);
  expect(view.getAllByLabelText('Precio actual: $0.10')).toHaveLength(3);
  expect(view.getAllByLabelText('Precio anterior: $0.30')).toHaveLength(3);
  expect(view.queryByText('Oferta')).toBeNull();
});

test.each([0, 2, 3])('el stock %s utiliza el mismo plural en todas las superficies', async current_stock => {
  const view = await render(<Surfaces item={{ ...base, current_stock }} />);
  expect(view.getAllByText(`Quedan ${current_stock}`)).toHaveLength(3);
});

test('el cierre no se presenta como cero minutos en una superficie y finalizado en otra', async () => {
  const view = await render(<Surfaces item={{ ...base, end_time: new Date(now).toISOString() }} />);
  expect(view.getAllByText('Venta finalizada')).toHaveLength(3);
  expect(view.queryByText('Cierra en 0 min')).toBeNull();
});

test('un stock ausente no se inventa como cero unidades', async () => {
  const view = await render(<Surfaces item={{ ...base, current_stock: null }} />);
  expect(view.getAllByText('Stock no disponible')).toHaveLength(3);
  expect(view.queryByText('Quedan 0')).toBeNull();
});

test('los productos no muestran stock ni cuenta regresiva aunque lleguen campos residuales', async () => {
  const view = await render(<Surfaces item={{ ...base, type: 'STATIC', is_ganga_active: false }} />);
  expect(view.queryByText(/Queda|Cierra en|Venta finalizada/)).toBeNull();
  expect(view.queryByText('GANGA')).toBeNull();
  expect(view.getByText('PRODUCTO')).toBeTruthy();
});
