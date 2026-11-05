import { Pressable, StyleSheet, View } from 'react-native';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';

export default function OptionGrid({ options, value, onChange, allLabel }: { options: { id: number; name: string }[]; value?: number; onChange: (id?: number) => void; allLabel?: string }) {
  const rows = allLabel ? [{ id: 0, name: allLabel }, ...options] : options;
  return <View style={styles.grid} accessibilityRole="radiogroup">{rows.map(option => <Pressable key={option.id} accessibilityRole="radio" accessibilityLabel={option.name} accessibilityState={{ checked: (value ?? 0) === option.id }} onPress={() => onChange(option.id || undefined)} style={({ pressed }) => [styles.option, (value ?? 0) === option.id && styles.selected, pressed && styles.pressed]}><AppText variant="badge" style={styles.label}>{option.name}</AppText></Pressable>)}</View>;
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm }, option: { width: '48%', minHeight: METRICS.compactControl, borderRadius: RADIUS.md, padding: SPACE.sm, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  selected: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary }, label: { textAlign: 'center' }, pressed: { opacity: 0.7 },
});
