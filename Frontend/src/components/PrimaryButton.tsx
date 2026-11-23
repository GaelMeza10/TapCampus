import type { ComponentRef, ReactNode, Ref } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS, FONTS, METRICS, RADIUS, SPACE, TYPE } from '@/theme';
import AppText from './app-text';

interface Props {
  ref?: Ref<ComponentRef<typeof Pressable>>;
  title: string;
  icon?: ReactNode;
  onPress: () => void;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'danger-ghost' | 'warning' | 'field';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({ ref, title, onPress, loading = false, loadingTitle, disabled = false, testID, accessibilityLabel, accessibilityHint, variant = 'primary', compact, style, icon }: Props) {
  const blocked = loading || disabled;
  const textColor = variant === 'field' ? COLORS.textDark : variant === 'danger-ghost' ? COLORS.error : variant === 'secondary' || variant === 'ghost' ? COLORS.primary : COLORS.white;
  return (
    <Pressable
      ref={ref}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], compact && styles.compact, blocked && styles.disabled, pressed && !blocked && styles.pressed, style]}
    >
      <View style={[styles.content, variant === 'field' && styles.fieldContent]}>{loading ? <ActivityIndicator color={textColor} /> : icon ?? null}<AppText variant="label" style={[styles.label, compact && styles.compactLabel, variant === 'field' && styles.fieldLabel, { color: textColor }]}>{loading ? loadingTitle ?? title : title}</AppText></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm, maxWidth: '100%' }, fieldContent: { alignSelf: 'stretch', justifyContent: 'flex-start' },
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
  compactLabel: { ...TYPE.controlCompact },
  disabled: { backgroundColor: COLORS.disabled },
  pressed: { opacity: 0.75 },
  label: { textAlign: 'center', flexShrink: 1 },
});
