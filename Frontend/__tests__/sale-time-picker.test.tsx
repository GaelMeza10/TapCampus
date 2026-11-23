import React from 'react';
import { act, cleanup, render } from '@testing-library/react-native';
import SaleTimePicker from '../src/components/sale-time-picker.ios';

jest.mock('@expo/ui/swift-ui', () => {
  const { View } = require('react-native');
  return {
    Host: (props: object) => <View testID="picker-host" {...props} />,
    DatePicker: (props: object) => <View testID="native-wheel" {...props} />,
  };
});

afterEach(async () => { await cleanup(); });

test('iOS monta rueda con altura estable y conserva fecha/hora local elegida', async () => {
  const onValueChange = jest.fn();
  const value = new Date(2026, 10, 21, 12, 0);
  const view = await render(<SaleTimePicker value={value} onValueChange={onValueChange} />);
  const host = view.getByTestId('picker-host');
  expect(host.props.style).toMatchObject({ height: 216, alignSelf: 'stretch' });
  expect(host.props.matchContents).toBeUndefined();
  expect(host.props.colorScheme).toBe('light');
  const wheel = view.getByTestId('native-wheel');
  expect(wheel.props.selection).toEqual(value);
  expect(wheel.props.displayedComponents).toEqual(['date', 'hourAndMinute']);
  expect(wheel.props.modifiers).toEqual(expect.arrayContaining([
    expect.objectContaining({ $type: 'datePickerStyle', style: 'wheel' }),
    expect.objectContaining({ $type: 'environment', key: 'locale', value: 'es_MX' }),
  ]));
  const selected = new Date(2026, 10, 22, 15, 45);
  await act(() => wheel.props.onDateChange(selected));
  expect(onValueChange).toHaveBeenCalledWith({ nativeEvent: {
    timestamp: selected.getTime(), utcOffset: -selected.getTimezoneOffset(),
  } }, selected);
});
