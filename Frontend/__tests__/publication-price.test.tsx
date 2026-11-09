import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import PublicationPrice from '../src/components/publication-price';

test('precio de oferta actual primero, anterior tachado después y ahorro exacto', async () => {
  const view = await render(<PublicationPrice item={{ price: '49.00', price_before_ganga: '62.00', is_ganga_active: true }} />);
  const current = view.getByLabelText('Precio actual: $49');
  const previous = view.getByLabelText('Precio anterior: $62');
  const prices = view.getAllByText(/^\$/);
  expect(prices).toEqual([current, previous]);
  expect(StyleSheet.flatten(previous.props.style).textDecorationLine).toBe('line-through');
  expect(view.getByText('Ahorras $13')).toBeTruthy();
});

test.each([undefined, null, '', 'NaN', 'Infinity', '0', '-12', '48', '49'])('no inventa comparación con precio previo %s', async previous => {
  const view = await render(<PublicationPrice item={{ price: '49', price_before_ganga: previous, is_ganga_active: true }} />);
  expect(view.queryByLabelText(/Precio anterior/)).toBeNull();
  expect(view.queryByText(/Ahorras/)).toBeNull();
});

test('producto normal no muestra descuento aunque exista precio anterior', async () => {
  const view = await render(<PublicationPrice item={{ price: '49', price_before_ganga: '62', is_ganga_active: false }} />);
  expect(view.queryByText(/Ahorras/)).toBeNull();
  expect(view.queryByLabelText(/Precio anterior/)).toBeNull();
});

test('descuento de centavos se calcula sin residuos de punto flotante', async () => {
  const view = await render(<PublicationPrice item={{ price: '0.10', price_before_ganga: '0.30', is_ganga_active: true }} />);
  expect(view.getByText('Ahorras $0.20')).toBeTruthy();
});
