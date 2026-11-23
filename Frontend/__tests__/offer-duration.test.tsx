import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { durationParts, maximumOfferMinutes } from '../src/components/offer-duration.types';
const Duration = require('../src/components/offer-duration.tsx').default;

test('75 minutos se editan como 1 h 15 min; controles conservan el entero sin teclado', async () => {
  const changed = jest.fn();
  function Harness() { const [value, setValue] = useState(75); return <Duration value={value} maxMinutes={180} onChange={(n: number) => { setValue(n); changed(n); }} />; }
  const view = await render(<Harness />);
  expect(view.getByLabelText('Horas: 1')).toBeTruthy(); expect(view.getByLabelText('Minutos: 15')).toBeTruthy();
  expect(view.queryByRole('textbox')).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Aumentar minutos' })); expect(changed).toHaveBeenLastCalledWith(76);
  await fireEvent.press(view.getByRole('button', { name: 'Reducir horas' })); expect(changed).toHaveBeenLastCalledWith(16);
});
test('límites dependen del horario y del reloj, sin capar a 23 horas ni corregir valor inválido', async () => {
  expect(maximumOfferMinutes(0, 3600000, 0)).toBe(59);
  expect(maximumOfferMinutes(600000, 3600000, 0)).toBe(49);
  expect(maximumOfferMinutes(0, 3600000, 3600000)).toBe(0);
  expect(maximumOfferMinutes(0, Infinity, 0)).toBe(0);
  expect(maximumOfferMinutes(0, Number.MAX_SAFE_INTEGER, 0)).toBe(2147483647);
  expect(durationParts(1500)).toEqual({ hours: 25, minutes: 0 });
  const change = jest.fn();
  const view = await render(<Duration value={75} maxMinutes={20} onChange={change} error="Revisa el horario" />);
  expect(view.getByText('Revisa el horario')).toBeTruthy(); expect(view.getByLabelText('Horas: 1')).toBeTruthy(); expect(change).not.toHaveBeenCalled();
  await fireEvent.press(view.getByRole('button', { name: 'Aumentar minutos' })); expect(change).not.toHaveBeenCalled();
});
