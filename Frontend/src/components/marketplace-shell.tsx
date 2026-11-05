import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import type { PublicationType } from '@/services/marketplace';

export type MarketTab = 'explore' | 'reservations' | 'sales';
const tabs = [
  { key: 'explore', label: 'Explorar', href: '/homePage' },
  { key: 'reservations', label: 'Reservas', href: '/reservations' },
  { key: 'sales', label: 'Mis ventas', href: '/sales' },
] as const;

export function BottomNavigation({ active }: { active: MarketTab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <View style={[styles.nav, { paddingBottom: Math.max(SPACE.sm, insets.bottom) }]} accessibilityRole="tablist">
    {tabs.map(tab => <Pressable key={tab.key} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected: active === tab.key }} onPress={() => { if (active !== tab.key) router.navigate(tab.href); }} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
      <AppText style={[styles.dot, active === tab.key ? styles.active : styles.muted]}>{active === tab.key ? '●' : '○'}</AppText>
      <AppText variant="badge" style={active === tab.key ? styles.active : styles.muted}>{tab.label}</AppText>
    </Pressable>)}
  </View>;
}

export function MarketplaceShell({ active, children }: { active: MarketTab; children: ReactNode }) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}><View style={styles.content}>{children}</View><BottomNavigation active={active} /></SafeAreaView>;
}

export function PageHeader({ title, subtitle, action, brand }: { title: string; subtitle?: string; action?: ReactNode; brand?: boolean }) {
  return <View style={styles.header}><View style={styles.headerRow}><AppText variant={brand ? 'brand' : 'title'} style={[styles.headerTitle, brand && styles.marketBrand]}>{title}</AppText>{action}</View>{subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}</View>;
}

export function TypeSelector({ value, onChange, disabled }: { value: PublicationType; onChange: (value: PublicationType) => void; disabled?: boolean }) {
  return <View style={styles.selector} accessibilityRole="tablist">{(['LIVE', 'STATIC'] as const).map(type => <Pressable key={type} accessibilityRole="tab" accessibilityState={{ selected: value === type, disabled }} disabled={disabled} onPress={() => onChange(type)} style={({ pressed }) => [styles.option, value === type && styles.selected, pressed && styles.pressed]}><AppText variant="badge" style={[styles.optionText, value !== type && styles.muted]}>{type === 'LIVE' ? 'Disponibles ahora' : 'Catálogo'}</AppText></Pressable>)}</View>;
}

export function PublishButton({ type }: { type: PublicationType }) {
  const router = useRouter();
  return <Pressable accessibilityRole="button" accessibilityLabel="Crear publicación" style={({ pressed }) => [styles.fab, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/publication/edit', params: { type } })}><AppText style={styles.plus}>+</AppText></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, content: { flex: 1 },
  nav: { flexDirection: 'row', backgroundColor: COLORS.white, minHeight: METRICS.tabBar, paddingTop: SPACE.sm },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: METRICS.compactControl, gap: SPACE.xs, paddingHorizontal: SPACE.xs },
  dot: { fontSize: 22, lineHeight: 26 }, active: { color: COLORS.primary }, muted: { color: COLORS.textMedium },
  header: { paddingHorizontal: SPACE.page, paddingTop: SPACE.xs, paddingBottom: SPACE.md, gap: SPACE.xs },
  marketBrand: { fontSize: 24, lineHeight: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md }, headerTitle: { flex: 1 },
  selector: { flexDirection: 'row', gap: SPACE.sm }, option: { flex: 1, minHeight: METRICS.compactControl, paddingVertical: SPACE.md, paddingHorizontal: SPACE.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.white },
  selected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft }, optionText: { fontSize: 13, textAlign: 'center' },
  fab: { position: 'absolute', right: SPACE.page, bottom: SPACE.lg, width: METRICS.fab, height: METRICS.fab, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  plus: { color: COLORS.white, fontSize: 32, lineHeight: 40 }, pressed: { opacity: 0.7 },
});
