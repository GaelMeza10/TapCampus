import { Tabs } from 'expo-router';

export const unstable_settings = { initialRouteName: 'homePage' };

export default function MarketplaceTabs() {
  return (
    <Tabs backBehavior="initialRoute" tabBar={() => null} screenOptions={{ headerShown: false, animation: 'none' }}>
      <Tabs.Screen name="homePage" />
      <Tabs.Screen name="reservations" />
      <Tabs.Screen name="sales" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
