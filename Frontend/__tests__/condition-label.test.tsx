import React from 'react';
import { render } from '@testing-library/react-native';
import ConditionLabel from '../src/components/condition-label';

test('solo anuncia la condición explícita del artículo estático', async () => {
  const view = await render(<ConditionLabel item={{ type: 'STATIC', condition: 'NEW' }} />);
  expect(view.getByText('Nuevo')).toBeTruthy();
  await view.rerender(<ConditionLabel item={{ type: 'STATIC', condition: 'USED' }} />);
  expect(view.getByText('Usado')).toBeTruthy();
  for (const item of [{ type: 'STATIC', condition: null }, { type: 'LIVE', condition: 'NEW' }] as const) {
    await view.rerender(<ConditionLabel item={item} />);
    expect(view.queryByText(/Nuevo|Usado/)).toBeNull();
  }
});
