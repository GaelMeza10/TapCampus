import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import CustomInput from './CustomInput';

export default function OptionGrid({ options, value, onChange, allLabel, searchLabel }: { options: { id: number; name: string }[]; value?: number; onChange: (id?: number) => void; allLabel?: string; searchLabel?: string }) {
  const [query, setQuery] = useState('');
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = searchLabel && query ? options.filter(option => normalize(option.name).includes(normalize(query.trim()))) : options;
  const rows = allLabel ? [{ id: 0, name: allLabel }, ...filtered] : filtered;
  return <View style={styles.body}>
    {searchLabel && options.length > 8 ? <CustomInput label={searchLabel} value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} /> : null}
    <View style={styles.grid} accessibilityRole="radiogroup">{rows.map(option => <Pressable key={option.id} accessibilityRole="radio" accessibilityLabel={option.name} accessibilityState={{ checked: (value ?? 0) === option.id }} onPress={() => onChange(option.id || undefined)} style={({ pressed }) => [styles.option, (value ?? 0) === option.id && styles.selected, pressed && styles.pressed]}><AppText variant="badge" style={styles.label}>{option.name}</AppText></Pressable>)}</View>
    {!rows.length ? <AppText accessibilityLiveRegion="polite">No hay coincidencias. Prueba otro nombre.</AppText> : null}
  </View>;
}
const styles = StyleSheet.create({
  body: { gap: SPACE.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm }, option: { width: '48%', minHeight: METRICS.compactControl, borderRadius: RADIUS.md, padding: SPACE.sm, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  selected: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary }, label: { textAlign: 'center' }, pressed: { opacity: 0.7 },
});
