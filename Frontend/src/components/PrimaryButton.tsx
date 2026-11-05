import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS, FONTS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'danger-ghost' | 'warning' | 'field';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, testID, accessibilityLabel, variant = 'primary', compact, style }: Props) {
  const blocked = loading || disabled;
  const textColor = variant === 'field' ? COLORS.textDark : variant === 'danger-ghost' ? COLORS.error : variant === 'secondary' || variant === 'ghost' ? COLORS.primary : COLORS.white;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], compact && styles.compact, blocked && styles.disabled, pressed && !blocked && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <AppText variant="label" style={[styles.label, compact && styles.compactLabel, variant === 'field' && styles.fieldLabel, { color: textColor }]}>{title}</AppText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: METRICS.control, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.primarySoft },
  destructive: { backgroundColor: COLORS.error },
  ghost: { backgroundColor: 'transparent' },
  'danger-ghost': { backgroundColor: 'transparent' },
  field: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, alignItems: 'stretch' },
  fieldLabel: { fontFamily: FONTS.regular, textAlign: 'left' },
  warning: { backgroundColor: COLORS.ganga },
  compact: { minHeight: METRICS.compactControl, paddingVertical: SPACE.sm, paddingHorizontal: SPACE.md },
  compactLabel: { fontSize: 13, lineHeight: 19 },
  disabled: { backgroundColor: COLORS.disabled },
  pressed: { opacity: 0.75 },
  label: { textAlign: 'center', flexShrink: 1 },
});
