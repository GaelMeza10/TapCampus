import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, METRICS, SPACE } from '@/theme';
import AppText from './app-text';
import { durationParts, type OfferDurationProps } from './offer-duration.types';

export default function OfferDuration({ value, onChange, disabled, error, maxMinutes }: OfferDurationProps) {
  const parts = durationParts(value);
  return <View style={styles.group}>
    <AppText variant="label">Anticipación antes del fin</AppText>
    <View style={styles.row}>
      {(['hours', 'minutes'] as const).map(unit => {
        const step = unit === 'hours' ? 60 : 1;
        const label = unit === 'hours' ? 'Horas' : 'Minutos';
        return <View key={unit} style={styles.control}>
          <AppText variant="label">{label}</AppText>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Reducir ${label.toLowerCase()}`} disabled={disabled || value < step} onPress={() => onChange(value - step)} style={styles.button}><Ionicons name="remove" size={22} color={disabled || value < step ? COLORS.disabled : COLORS.primary} /></Pressable>
            <AppText variant="heading" accessibilityLabel={`${label}: ${parts[unit]}`}>{parts[unit]}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={`Aumentar ${label.toLowerCase()}`} disabled={disabled || value + step > maxMinutes} onPress={() => onChange(value + step)} style={styles.button}><Ionicons name="add" size={22} color={disabled || value + step > maxMinutes ? COLORS.disabled : COLORS.primary} /></Pressable>
          </View>
        </View>;
      })}
    </View>
    <AppText variant="caption">{parts.hours} h {parts.minutes} min antes de terminar. La activación debe quedar en el futuro y dentro del horario.</AppText>
    {error ? <AppText accessibilityRole="alert" style={styles.error}>{error}</AppText> : null}
  </View>;
}
const styles = StyleSheet.create({ group: { gap: SPACE.sm }, row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACE.sm }, control: { flexGrow: 1, gap: SPACE.xs }, button: { minWidth: METRICS.compactControl, minHeight: METRICS.compactControl, justifyContent: 'center', alignItems: 'center' }, error: { color: COLORS.error } });
