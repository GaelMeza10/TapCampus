import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { COLORS, METRICS, RADIUS, SPACE, TYPE } from '@/theme';
import AppText from './app-text';

interface Props extends TextInputProps {
  ref?: Ref<ComponentRef<typeof TextInput>>;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trailingAction?: ReactNode;
  error?: string;
  announceError?: boolean;
  label?: string;
  surface?: 'muted' | 'white';
}

export default function CustomInput({ ref: inputRef, icon, iconColor = COLORS.textLight, trailingAction, error, announceError = true, secureTextEntry, editable = true, label, surface = 'muted', style, multiline, ...props }: Props) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.group}>
      {label ? <AppText variant="label" style={styles.label}>{label}</AppText> : null}
      <View style={[styles.box, surface === 'white' && styles.white, multiline && styles.multilineBox, error ? styles.boxError : null, !editable ? styles.boxDisabled : null]}>
        {icon ? <Ionicons name={icon} size={18} color={iconColor} style={styles.icon} accessible={false} /> : null}
        <TextInput
          ref={inputRef}
          {...props}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityHint={error || props.accessibilityHint}
          multiline={multiline}
          editable={editable}
          secureTextEntry={secureTextEntry && !revealed}
          placeholderTextColor={COLORS.textMedium}
          autoCorrect={false}
          style={[styles.input, multiline && styles.multiline, style]}
          accessibilityState={{ disabled: !editable }}
        />
        {trailingAction}
        {secureTextEntry ? <Pressable disabled={!editable} style={styles.reveal} accessibilityRole="button" accessibilityState={{ disabled: !editable }} accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setRevealed(!revealed)}><Ionicons name={revealed ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMedium} /></Pressable> : null}
      </View>
      {error ? <View style={styles.errorBox} accessibilityRole={announceError ? 'alert' : undefined}><Ionicons name="alert-circle-outline" size={16} color={COLORS.error} accessible={false} /><AppText selectable style={styles.errorText}>{error}</AppText></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: SPACE.sm, minWidth: 0 }, label: { color: COLORS.textMedium },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.sm },
  errorText: { flex: 1, color: COLORS.error, fontSize: 13 },
  box: { minHeight: METRICS.control, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACE.lg, borderRadius: RADIUS.lg, backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border },
  white: { backgroundColor: COLORS.white },
  multilineBox: { alignItems: 'flex-start', minHeight: 100 },
  boxError: { borderWidth: 1, borderColor: COLORS.error },
  boxDisabled: { opacity: 0.55 },
  icon: { marginRight: 10 },
  input: { ...TYPE.body, flex: 1, minWidth: 0, minHeight: METRICS.control, paddingVertical: SPACE.md },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  reveal: { minHeight: METRICS.compactControl, minWidth: METRICS.compactControl, alignItems: 'center', justifyContent: 'center' },
});
