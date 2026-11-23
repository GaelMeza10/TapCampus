import { Tabs } from 'expo-router';
import { BottomNavigation, MarketplaceViewport, type MarketTab } from '@/components/marketplace-shell';
import { COLORS } from '@/theme';

const destinations: Record<string, MarketTab> = { homePage: 'explore', reservations: 'reservations', sales: 'sales', account: 'account' };

export const unstable_settings = { initialRouteName: 'homePage' };

export default function MarketplaceTabs() {
  return (
    <MarketplaceViewport><Tabs
      backBehavior="initialRoute"
      tabBar={({ state }) => <BottomNavigation active={destinations[state.routes[state.index].name] ?? 'explore'} />}
      screenOptions={{ headerShown: false, animation: 'none', sceneStyle: { backgroundColor: COLORS.background, minHeight: 0 } }}
    >
      <Tabs.Screen name="homePage" />
      <Tabs.Screen name="reservations" />
      <Tabs.Screen name="sales" />
      <Tabs.Screen name="account" />
    </Tabs></MarketplaceViewport>
  );
}
