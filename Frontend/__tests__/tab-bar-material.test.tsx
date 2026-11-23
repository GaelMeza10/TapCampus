import React from 'react';
import { AccessibilityInfo, Platform, Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import TabBarMaterial from '../src/components/tab-bar-material';

let mockAvailable = true;
jest.mock('expo-glass-effect', () => ({
  GlassView: (props: object) => { const { View } = require('react-native'); return <View {...props} />; },
  isGlassEffectAPIAvailable: () => mockAvailable,
  isLiquidGlassAvailable: () => mockAvailable,
}));

const originalOS = Platform.OS;
afterEach(() => { Platform.OS = originalOS; jest.restoreAllMocks(); });

test.each([
  ['ios', true, false, 'tab-bar-glass'],
  ['ios', true, true, 'tab-bar-solid'],
  ['ios', false, false, 'tab-bar-solid'],
  ['android', true, false, 'tab-bar-solid'],
  ['web', true, false, 'tab-bar-solid'],
] as const)('%s soportado=%s transparencia reducida=%s', async (os, available, reduced, id) => {
  Platform.OS = os;
  mockAvailable = available;
  jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(reduced);
  const view = await render(<TabBarMaterial><Text>Tabs</Text></TabBarMaterial>);
  expect(await view.findByTestId(id)).toBeTruthy();
  expect(view.getByText('Tabs')).toBeTruthy();
});

test('activar transparencia reducida reemplaza glass conservando los controles', async () => {
  Platform.OS = 'ios'; mockAvailable = true;
  jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(false);
  let changed: ((enabled: boolean) => void) | undefined;
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_event, listener) => {
    changed = listener as (enabled: boolean) => void;
    return { remove: jest.fn() };
  });
  const view = await render(<TabBarMaterial><Text>Tabs</Text></TabBarMaterial>);
  await view.findByTestId('tab-bar-glass');
  await act(() => changed!(true));
  expect(view.queryByTestId('tab-bar-glass')).toBeNull();
  expect(view.getByTestId('tab-bar-solid')).toBeTruthy();
  expect(view.getByText('Tabs')).toBeTruthy();
});
