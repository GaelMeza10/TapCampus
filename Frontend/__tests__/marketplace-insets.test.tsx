import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { BottomNavigation, MarketplaceShell, MarketplaceViewport, MARKETPLACE_SCROLL_PROPS, type MarketTab } from '../src/components/marketplace-shell';

jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: jest.fn() }) }));

test('las pantallas no reaplican el espacio superior cuando cambian los insets del tab', async () => {
  const rootInsets = { top: 47, bottom: 34, left: 0, right: 0 };
  function Screen({ active, top }: { active: MarketTab; top: number }) {
    return <SafeAreaInsetsContext.Provider value={rootInsets}><MarketplaceViewport>
      <SafeAreaInsetsContext.Provider value={{ ...rootInsets, top, bottom: 0 }}>
        <MarketplaceShell active={active}><Text>Contenido</Text></MarketplaceShell>
        <BottomNavigation active={active} />
      </SafeAreaInsetsContext.Provider>
    </MarketplaceViewport></SafeAreaInsetsContext.Provider>;
  }
  const view = await render(<Screen active="explore" top={0} />);
  for (const [active, top] of [['reservations', 47], ['sales', 0], ['account', 47], ['explore', 47]] as const) {
    await view.rerender(<Screen active={active} top={top} />);
    expect(StyleSheet.flatten(view.getByTestId('marketplace-screen').props.style).paddingTop).toBeUndefined();
    expect(view.getAllByTestId('marketplace-viewport')).toHaveLength(1);
    expect(StyleSheet.flatten(view.getByTestId('marketplace-viewport').props.style).paddingTop).toBe(47);
    expect(view.getAllByTestId('marketplace-navigation')).toHaveLength(1);
    expect(StyleSheet.flatten(view.getByTestId('marketplace-navigation').props.style).paddingBottom).toBe(34);
  }
});

test('el scroll no vuelve a aplicar los insets que ya posee el viewport', () => {
  expect(MARKETPLACE_SCROLL_PROPS).toMatchObject({ contentInsetAdjustmentBehavior: 'never', automaticallyAdjustContentInsets: false, automaticallyAdjustsScrollIndicatorInsets: false });
});

test('la barra compartida bloquea la navegación durante una operación y se recupera', async () => {
  const Screen = ({ busy }: { busy: boolean }) => <MarketplaceViewport>
    <MarketplaceShell active="account" navigationDisabled={busy}><Text>Cuenta</Text></MarketplaceShell>
    <BottomNavigation active="account" />
  </MarketplaceViewport>;
  const view = await render(<Screen busy={false} />);
  expect(view.getByRole('tab', { name: 'Explorar' }).props.accessibilityState.disabled).toBe(false);
  await view.rerender(<Screen busy />);
  expect(view.getByRole('tab', { name: 'Explorar' }).props.accessibilityState.disabled).toBe(true);
  await view.rerender(<Screen busy={false} />);
  expect(view.getByRole('tab', { name: 'Explorar' }).props.accessibilityState.disabled).toBe(false);
  expect(view.getAllByTestId('marketplace-navigation')).toHaveLength(1);
});
