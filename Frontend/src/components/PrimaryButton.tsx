import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, RADIUS } from '@/theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, testID }: Props) {
  const blocked = loading || disabled;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [styles.button, blocked && styles.disabled, pressed && !blocked && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.label}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: 52, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  disabled: { backgroundColor: COLORS.disabled },
  pressed: { backgroundColor: COLORS.primaryDark },
  label: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
