import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import type { PublicationType } from '@/services/marketplace';

export type MarketTab = 'explore' | 'reservations' | 'sales' | 'account';
const tabs = [
  { key: 'explore', label: 'Explorar', href: '/homePage', icon: require('@/assets/icons/marketplace/explore.svg') },
  { key: 'reservations', label: 'Reservas', href: '/reservations', icon: require('@/assets/icons/marketplace/reservations.svg') },
  { key: 'sales', label: 'Mis ventas', href: '/sales', icon: require('@/assets/icons/marketplace/sales.svg') },
  { key: 'account', label: 'Cuenta', href: '/account', icon: require('@/assets/icons/marketplace/account.svg') },
] as const;

export function BottomNavigation({ active, disabled = false }: { active: MarketTab; disabled?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <View style={[styles.nav, { paddingBottom: Math.max(SPACE.sm, insets.bottom) }]} accessibilityRole="tablist">
    {tabs.map(tab => <Pressable key={tab.key} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected: active === tab.key, disabled }} aria-selected={active === tab.key} aria-disabled={disabled} disabled={disabled} onPress={() => { if (active !== tab.key) router.navigate(tab.href); }} style={({ pressed }) => [styles.navItem, active === tab.key && styles.navSelected, disabled && styles.disabled, pressed && styles.pressed]}>
      {tab.key === 'account' ? <Ionicons name="person-outline" size={24} color={active === tab.key ? COLORS.primary : COLORS.textMedium} accessible={false} /> : <Image source={tab.icon} style={styles.navIcon} tintColor={active === tab.key ? COLORS.primary : COLORS.textMedium} accessible={false} />}
      <AppText variant="badge" style={active === tab.key ? styles.active : styles.muted}>{tab.label}</AppText>
    </Pressable>)}
  </View>;
}

export function MarketplaceShell({ active, children, navigationDisabled }: { active: MarketTab; children: ReactNode; navigationDisabled?: boolean }) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}><View style={styles.content}>{children}</View><BottomNavigation active={active} disabled={navigationDisabled} /></SafeAreaView>;
}

export function PageHeader({ title, action, brand }: { title: string; action?: ReactNode; brand?: boolean }) {
  return <View style={styles.header}><View style={styles.headerRow}><AppText variant={brand ? 'brand' : 'title'} style={[styles.headerTitle, brand && styles.marketBrand]}>{title}</AppText>{action}</View></View>;
}

export function TypeSelector({ value, onChange, disabled, liveLabel = 'Disponibles ahora' }: { value: PublicationType; onChange: (value: PublicationType) => void; disabled?: boolean; liveLabel?: string }) {
  return <View style={styles.selector} accessibilityRole="tablist">{(['LIVE', 'STATIC'] as const).map(type => <Pressable key={type} accessibilityRole="tab" accessibilityState={{ selected: value === type, disabled: !!disabled }} disabled={disabled} onPress={() => onChange(type)} style={({ pressed }) => [styles.option, value === type && styles.selected, disabled && styles.disabled, pressed && styles.pressed]}><AppText variant="badge" style={[styles.optionText, value !== type && styles.muted]}>{type === 'LIVE' ? liveLabel : 'Catálogo'}</AppText></Pressable>)}</View>;
}

export function PublishButton({ type }: { type: PublicationType }) {
  const router = useRouter();
  return <Pressable accessibilityRole="button" accessibilityLabel="Crear publicación" style={({ pressed }) => [styles.fab, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/publication/edit', params: { type } })}><AppText style={styles.plus}>+</AppText></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, content: { flex: 1 },
  nav: { flexDirection: 'row', backgroundColor: COLORS.white, minHeight: METRICS.tabBar, paddingTop: SPACE.sm, paddingHorizontal: SPACE.sm, gap: SPACE.xs },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 56, gap: SPACE.xs, paddingHorizontal: SPACE.xs, paddingVertical: SPACE.sm, borderRadius: RADIUS.md },
  navSelected: { backgroundColor: COLORS.navigationSelected },
  navIcon: { width: 24, height: 24 }, active: { color: COLORS.primary, fontFamily: FONTS.bold }, muted: { color: COLORS.textMedium }, disabled: { opacity: 0.6 },
  header: { paddingHorizontal: SPACE.page, paddingTop: SPACE.xs, paddingBottom: SPACE.md, gap: SPACE.xs },
  marketBrand: { fontSize: 24, lineHeight: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md }, headerTitle: { flex: 1, minWidth: 0 },
  selector: { flexDirection: 'row', gap: SPACE.sm }, option: { flex: 1, minWidth: 0, minHeight: METRICS.compactControl, paddingVertical: SPACE.sm, paddingHorizontal: SPACE.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.white },
  selected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft }, optionText: { fontSize: 13, textAlign: 'center' },
  fab: { position: 'absolute', right: SPACE.page, bottom: SPACE.lg, width: METRICS.fab, height: METRICS.fab, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  plus: { color: COLORS.white, fontSize: 32, lineHeight: 40 }, pressed: { opacity: 0.7 },
});
