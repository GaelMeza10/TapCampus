import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import OptionGrid from '../src/components/option-grid';
const categories = require('../scripts/catalog-fixture.json').filter((row: { type: string }) => row.type === 'LIVE');

test('categorías se buscan sin tildes y conservan la identidad seleccionada', async () => {
  const selected = categories.find((row: { name: string }) => row.name === 'Electrónica').id;
  const onChange = jest.fn();
  const view = await render(<OptionGrid options={categories} value={selected} onChange={onChange} searchLabel="Buscar categorías" />);
  await fireEvent.changeText(view.getByLabelText('Buscar categorías'), 'electronica');
  expect(view.getAllByRole('radio')).toHaveLength(1);
  expect(view.getByRole('radio', { name: 'Electrónica' }).props.accessibilityState.checked).toBe(true);
  expect(onChange).not.toHaveBeenCalled();
  await fireEvent.changeText(view.getByLabelText('Buscar categorías'), 'videojuegos');
  await fireEvent.press(view.getByRole('radio', { name: 'Juegos y videojuegos' }));
  expect(onChange).toHaveBeenCalledWith(categories.find((row: { name: string }) => row.name === 'Juegos y videojuegos').id);
  await fireEvent.changeText(view.getByLabelText('Buscar categorías'), 'sin coincidencias');
  expect(view.getByText('No hay coincidencias. Prueba otro nombre.')).toBeTruthy();
  expect(view.queryAllByRole('radio')).toHaveLength(0);
});
