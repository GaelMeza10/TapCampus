import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import type { PublicationType } from '@/services/marketplace';
import { PUBLICATION_COPY } from '@/lib/publication-copy';
import TabBarMaterial from './tab-bar-material';
import { LayoutSceneContext, recordLayout, recordScroll, useLayoutFrame, useTabLayoutDiagnostics, useViewportDiagnostics } from '@/lib/layout-diagnostics';

export type MarketTab = 'explore' | 'reservations' | 'sales' | 'account';
const MarketplaceInsets = createContext<EdgeInsets | null>(null);
const NavigationLock = createContext({ disabled: false, setDisabled: (_value: boolean) => {} });

// Safe areas belong to the viewport; scroll views must not add them again on iOS.
export const MARKETPLACE_SCROLL_PROPS = {
  contentInsetAdjustmentBehavior: 'never',
  automaticallyAdjustContentInsets: false,
  automaticallyAdjustsScrollIndicatorInsets: false,
  onScroll: recordScroll,
  scrollEventThrottle: 200,
} as const;

// One native safe-area container remains mounted around the entire tab navigator.
// A newly attached screen must never add the top inset a second time.
export function MarketplaceViewport({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const diagnostic = useLayoutFrame('viewport');
  useViewportDiagnostics(insets);
  const [disabled, setDisabled] = useState(false);
  return <MarketplaceInsets.Provider value={insets}>
    <NavigationLock.Provider value={{ disabled, setDisabled }}>
      <View {...diagnostic} testID="marketplace-viewport" style={[styles.screen, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>{children}</View>
    </NavigationLock.Provider>
  </MarketplaceInsets.Provider>;
}
const tabs = [
  { key: 'explore', label: 'Explorar', href: '/homePage', icon: require('@/assets/icons/marketplace/explore.svg') },
  { key: 'reservations', label: 'Reservas', href: '/reservations', icon: require('@/assets/icons/marketplace/reservations.svg') },
  { key: 'sales', label: 'Mis ventas', href: '/sales', icon: require('@/assets/icons/marketplace/sales.svg') },
  { key: 'account', label: 'Cuenta', href: '/account', icon: require('@/assets/icons/marketplace/account.svg') },
] as const;

export function BottomNavigation({ active, disabled = false }: { active: MarketTab; disabled?: boolean }) {
  const diagnostic = useLayoutFrame('navigation');
  const router = useRouter();
  const localInsets = useSafeAreaInsets();
  const insets = useContext(MarketplaceInsets) ?? localInsets;
  const lock = useContext(NavigationLock);
  const blocked = disabled || lock.disabled;
  return <View {...diagnostic} testID="marketplace-navigation" style={[styles.nav, { paddingBottom: Math.max(SPACE.sm, insets.bottom) }]}>
    <TabBarMaterial><View style={styles.navItems} accessibilityRole="tablist">
    {tabs.map(tab => <Pressable key={tab.key} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected: active === tab.key, disabled: blocked }} aria-selected={active === tab.key} aria-disabled={blocked} disabled={blocked} onPress={() => { if (active !== tab.key) router.navigate(tab.href); }} style={({ pressed }) => [styles.navItem, active === tab.key && styles.navSelected, blocked && styles.disabled, pressed && styles.pressed]}>
      {tab.key === 'account' ? <Ionicons name="person-outline" size={24} color={active === tab.key ? COLORS.white : COLORS.navigationText} accessible={false} /> : <Image source={tab.icon} style={styles.navIcon} tintColor={active === tab.key ? COLORS.white : COLORS.navigationText} accessible={false} />}
      <AppText variant="badge" style={active === tab.key ? styles.active : styles.navMuted}>{tab.label}</AppText>
    </Pressable>)}
    </View></TabBarMaterial>
  </View>;
}

export function MarketplaceShell({ active, children, navigationDisabled }: { active: MarketTab; children: ReactNode; navigationDisabled?: boolean }) {
  const diagnostic = useLayoutFrame(`scene-${active}`, active);
  useTabLayoutDiagnostics(active);
  const insets = useSafeAreaInsets();
  const viewport = useContext(MarketplaceInsets);
  useEffect(() => { recordLayout('scene-safe-area', { scene: active, local: insets, viewport }); }, [active, insets.top, insets.bottom, insets.left, insets.right, viewport]);
  const { setDisabled } = useContext(NavigationLock);
  useEffect(() => {
    if (!navigationDisabled) return;
    setDisabled(true);
    return () => setDisabled(false);
  }, [navigationDisabled, setDisabled]);
  return <View {...diagnostic} testID="marketplace-screen" style={[styles.screen, !viewport && { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}><LayoutSceneContext.Provider value={active}><View style={styles.content}>{children}</View></LayoutSceneContext.Provider>{!viewport ? <BottomNavigation active={active} disabled={navigationDisabled} /> : null}</View>;
}

export function PageHeader({ title, action, brand, contained }: { title: string; action?: ReactNode; brand?: boolean; contained?: boolean }) {
  return <View style={[styles.header, contained && styles.containedHeader]}><View style={styles.headerRow}><AppText variant={brand ? 'brand' : 'title'} style={[styles.headerTitle, brand && styles.marketBrand]}>{title}</AppText>{action}</View></View>;
}

export function TypeSelector({ value, onChange, disabled }: { value: PublicationType; onChange: (value: PublicationType) => void; disabled?: boolean }) {
  return <View style={styles.selector} accessibilityRole="tablist">{(['LIVE', 'STATIC'] as const).map(type => <Pressable key={type} accessibilityRole="tab" accessibilityState={{ selected: value === type, disabled: !!disabled }} disabled={disabled} onPress={() => onChange(type)} style={({ pressed }) => [styles.option, value === type && styles.selected, disabled && styles.disabled, pressed && styles.pressed]}><AppText variant="controlCompact" style={[styles.optionText, value !== type && styles.muted]}>{PUBLICATION_COPY[type].label}</AppText></Pressable>)}</View>;
}

export function PublishButton({ type }: { type: PublicationType }) {
  const router = useRouter();
  return <Pressable accessibilityRole="button" accessibilityLabel="Crear publicación" style={({ pressed }) => [styles.fab, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/publication/edit', params: { type } })}><Ionicons name="add" size={30} color={COLORS.white} accessible={false} /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, backgroundColor: COLORS.background }, content: { flex: 1, minHeight: 0 },
  nav: { flexShrink: 0, backgroundColor: COLORS.background, paddingTop: SPACE.sm, paddingHorizontal: SPACE.md },
  navItems: { flexDirection: 'row', minHeight: METRICS.tabBar, padding: SPACE.sm, gap: SPACE.xs },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 56, gap: SPACE.xs, paddingHorizontal: SPACE.xs, paddingVertical: SPACE.sm, borderRadius: RADIUS.md },
  navSelected: { backgroundColor: COLORS.navigationSelected },
  navMuted: { color: COLORS.navigationText, textAlign: 'center' },
  navIcon: { width: 24, height: 24 }, active: { color: COLORS.white, fontFamily: FONTS.bold, textAlign: 'center' }, muted: { color: COLORS.textMedium }, disabled: { opacity: 0.6 },
  header: { paddingHorizontal: SPACE.page, paddingTop: SPACE.md, paddingBottom: SPACE.lg, gap: SPACE.xs },
  containedHeader: { paddingHorizontal: 0 },
  marketBrand: { fontSize: 26, lineHeight: 34, letterSpacing: -0.7 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md }, headerTitle: { flex: 1, minWidth: 0 },
  selector: { flexDirection: 'row', gap: SPACE.sm }, option: { flex: 1, minWidth: 0, minHeight: METRICS.compactControl, paddingVertical: SPACE.sm, paddingHorizontal: SPACE.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  selected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary }, optionText: { textAlign: 'center', color: COLORS.white },
  fab: { position: 'absolute', right: SPACE.page, bottom: SPACE.lg, width: METRICS.fab, height: METRICS.fab, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
