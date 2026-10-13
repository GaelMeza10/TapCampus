import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { COLORS, RADIUS } from '@/theme';

interface Props extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export default function CustomInput({ icon, error, secureTextEntry, editable = true, ...props }: Props) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.group}>
      {error ? <View style={styles.errorBox} accessibilityRole="alert"><Ionicons name="alert-circle-outline" size={16} color={COLORS.error} /><Text selectable style={styles.errorText}>{error}</Text></View> : null}
      <View style={[styles.box, error ? styles.boxError : null, !editable ? styles.boxDisabled : null]}>
        {icon ? <Ionicons name={icon} size={18} color={COLORS.textLight} style={styles.icon} /> : null}
        <TextInput
          {...props}
          editable={editable}
          secureTextEntry={secureTextEntry && !revealed}
          placeholderTextColor={COLORS.textLight}
          autoCorrect={false}
          style={styles.input}
          accessibilityState={{ disabled: !editable }}
        />
        {secureTextEntry ? <Pressable accessibilityRole="button" accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setRevealed(!revealed)} hitSlop={10}><Ionicons name={revealed ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textLight} /></Pressable> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 12 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, padding: 12, marginBottom: 8 },
  errorText: { flex: 1, color: COLORS.error, fontSize: 13 },
  box: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.inputBg },
  boxError: { borderWidth: 1, borderColor: COLORS.error },
  boxDisabled: { opacity: 0.55 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: COLORS.textDark },
});
