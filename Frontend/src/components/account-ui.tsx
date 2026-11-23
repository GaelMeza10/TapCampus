import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import PrimaryButton from './PrimaryButton';

export function accountInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? [words[0], words[words.length - 1]].map(word => Array.from(word)[0]).join('') : Array.from(words[0] ?? '').slice(0, 2).join('')).toLocaleUpperCase('es-MX');
}

export function accountPhone(phone: string) {
  return phone.replace(/^\+52(\d{3})(\d{3})(\d{4})$/, '+52 $1 $2 $3');
}

export function AccountIdentity({ name, disabled, onEdit }: { name: string; disabled: boolean; onEdit: () => void }) {
  const { fontScale } = useWindowDimensions();
  return <View style={[styles.identity, fontScale > 1.2 && styles.stacked]}>
    <View style={styles.monogram} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      <AppText variant="section" style={styles.initials}>{accountInitials(name)}</AppText>
    </View>
    <View style={styles.identityBody}>
      <AppText variant="section" selectable>{name}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel="Editar datos" accessibilityState={{ disabled }} disabled={disabled} onPress={onEdit} style={({ pressed }) => [styles.edit, disabled && styles.disabled, pressed && styles.pressed]}>
        <Ionicons name="create-outline" size={18} color={COLORS.primary} accessible={false} />
        <AppText variant="label" style={styles.green}>Editar datos</AppText>
      </Pressable>
    </View>
  </View>;
}

export function AccountContact({ label, value, readOnly, divider }: { label: string; value: string; readOnly?: boolean; divider?: boolean }) {
  return <View style={[styles.contact, divider && styles.divider]}>
    <Ionicons name={readOnly ? 'mail-outline' : 'call-outline'} size={21} color={COLORS.primaryDark} style={styles.contactIcon} accessible={false} />
    <View style={styles.contactBody}>
      <View style={styles.contactLabel}><AppText variant="caption">{label}</AppText>{readOnly ? <View style={styles.readOnly}><Ionicons name="lock-closed-outline" size={12} color={COLORS.textMedium} accessible={false} /><AppText variant="caption">Solo lectura</AppText></View> : null}</View>
      <AppText variant="label" selectable>{readOnly ? value : accountPhone(value)}</AppText>
    </View>
  </View>;
}

export function AccountState({ loading, error, onRetry }: { loading: boolean; error: string; onRetry: () => void }) {
  if (loading) return <View accessible accessibilityRole="progressbar" accessibilityLabel="Cargando tu cuenta…" accessibilityState={{ busy: true }} style={styles.loading}>
    <AppText variant="caption">Cargando tu cuenta…</AppText>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={styles.skeletonIdentity}><View style={styles.skeletonAvatar} /><View style={styles.skeletonBody}><View style={styles.skeletonName} /><View style={styles.skeletonAction} /></View></View>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={styles.skeletonContacts}>{[0, 1].map(index => <View key={index} style={styles.skeletonField}><View style={styles.skeletonLabel} /><View style={styles.skeletonValue} /></View>)}</View>
  </View>;
  return <View style={styles.error}>
    <Ionicons name="cloud-offline-outline" size={32} color={COLORS.textMedium} accessible={false} />
    <AppText variant="section" accessibilityRole="header">No pudimos cargar tu información</AppText>
    <AppText variant="caption">{error}</AppText>
    <PrimaryButton title="Reintentar" onPress={onRetry} />
  </View>;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.lg, paddingVertical: SPACE.lg },
  stacked: { flexDirection: 'column' },
  monogram: { width: 80, minHeight: 80, borderRadius: RADIUS.full, backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', padding: SPACE.sm },
  initials: { color: COLORS.primary },
  identityBody: { flex: 1, minWidth: 0, gap: SPACE.xs },
  edit: { alignSelf: 'flex-start', minHeight: METRICS.compactControl, flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, paddingVertical: SPACE.sm, paddingHorizontal: SPACE.md, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: RADIUS.sm },
  green: { color: COLORS.primary }, pressed: { opacity: 0.75 }, disabled: { opacity: 0.55 },
  contact: { padding: SPACE.lg, flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.md },
  contactIcon: { marginTop: SPACE.xs },
  contactBody: { flex: 1, minWidth: 0, gap: SPACE.sm },
  contactLabel: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACE.sm },
  readOnly: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, backgroundColor: COLORS.inputBg, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.sm },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  loading: { gap: SPACE.xl, paddingVertical: SPACE.lg },
  skeletonIdentity: { flexDirection: 'row', gap: SPACE.lg },
  skeletonAvatar: { width: 64, height: 64, borderRadius: RADIUS.full, backgroundColor: COLORS.border },
  skeletonBody: { flex: 1, gap: SPACE.md, paddingTop: SPACE.sm },
  skeletonName: { height: 24, width: '80%', borderRadius: RADIUS.sm, backgroundColor: COLORS.border },
  skeletonAction: { height: 14, width: '40%', borderRadius: RADIUS.sm, backgroundColor: COLORS.border },
  skeletonContacts: { padding: SPACE.lg, gap: SPACE.xl, borderRadius: RADIUS.lg, backgroundColor: COLORS.white },
  skeletonField: { gap: SPACE.sm },
  skeletonLabel: { height: 14, width: '40%', borderRadius: RADIUS.sm, backgroundColor: COLORS.inputBg },
  skeletonValue: { height: 20, width: '85%', borderRadius: RADIUS.sm, backgroundColor: COLORS.inputBg },
  error: { paddingVertical: SPACE.xl, gap: SPACE.lg },
});
