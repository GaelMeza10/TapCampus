import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { COLORS, METRICS, RADIUS, SPACE, TYPE } from '@/theme';
import AppText from './app-text';

interface Props extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  label?: string;
  surface?: 'muted' | 'white';
}

export default function CustomInput({ icon, error, secureTextEntry, editable = true, label, surface = 'muted', style, multiline, ...props }: Props) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.group}>
      {label ? <AppText variant="label" style={styles.label}>{label}</AppText> : null}
      {error ? <View style={styles.errorBox} accessibilityRole="alert"><Ionicons name="alert-circle-outline" size={16} color={COLORS.error} /><Text selectable style={styles.errorText}>{error}</Text></View> : null}
      <View style={[styles.box, surface === 'white' && styles.white, multiline && styles.multilineBox, error ? styles.boxError : null, !editable ? styles.boxDisabled : null]}>
        {icon ? <Ionicons name={icon} size={18} color={COLORS.textLight} style={styles.icon} /> : null}
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel ?? label}
          multiline={multiline}
          editable={editable}
          secureTextEntry={secureTextEntry && !revealed}
          placeholderTextColor={COLORS.textMedium}
          autoCorrect={false}
          style={[styles.input, multiline && styles.multiline, style]}
          accessibilityState={{ disabled: !editable }}
        />
        {secureTextEntry ? <Pressable style={styles.reveal} accessibilityRole="button" accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setRevealed(!revealed)}><Ionicons name={revealed ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMedium} /></Pressable> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: SPACE.sm }, label: { color: COLORS.textMedium },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, padding: 12, marginBottom: 8 },
  errorText: { flex: 1, color: COLORS.error, fontSize: 13 },
  box: { minHeight: METRICS.control, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACE.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.inputBg },
  white: { backgroundColor: COLORS.white },
  multilineBox: { alignItems: 'flex-start', minHeight: 100 },
  boxError: { borderWidth: 1, borderColor: COLORS.error },
  boxDisabled: { opacity: 0.55 },
  icon: { marginRight: 10 },
  input: { ...TYPE.body, flex: 1, minHeight: METRICS.control, paddingVertical: SPACE.md },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  reveal: { minHeight: METRICS.compactControl, minWidth: METRICS.compactControl, alignItems: 'center', justifyContent: 'center' },
});
