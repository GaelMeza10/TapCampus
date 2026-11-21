import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/context/AuthContext';
import { myProfile, updateProfile, type UserProfile } from '@/services/auth.service';
import { mexicanPhone } from '@/services/auth-validation';
import { COLORS, METRICS, SPACE } from '@/theme';
import { MarketplaceShell, PageHeader } from '@/components/marketplace-shell';
import { InlineMessage } from '@/components/feedback';
import AppText from '@/components/app-text';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import CustomInput from '@/components/CustomInput';
import { AccountContact, AccountIdentity, AccountState } from '@/components/account-ui';

const cleanName = (value: string) => value.trim().replace(/\s+/g, ' ');

export default function MyAccount() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const saveLock = useRef(false);
  const mounted = useRef(true);
  const sequence = useRef(0);
  const submitting = useRef(false);
  const load = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true);
    setError('');
    try {
      const result = await myProfile();
      if (request === sequence.current) setProfile(result);
    } catch {
      if (request === sequence.current)
        setError(
          'Revisa tu conexión y vuelve a intentarlo. Puedes seguir usando la app o cerrar sesión desde aquí.',
        );
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
      sequence.current++;
    };
  }, [load]);

  useEffect(() => {
    if (Platform.OS !== 'web' && (busy || logoutError))
      AccessibilityInfo.announceForAccessibility(busy ? 'Cerrando sesión…' : logoutError);
  }, [busy, logoutError]);

  useEffect(() => {
    if (Platform.OS !== 'web' && (saving || saveError || saved))
      AccessibilityInfo.announceForAccessibility(
        saving ? 'Guardando cambios…' : saveError || 'Datos actualizados.',
      );
  }, [saving, saveError, saved]);
  const name = cleanName(draft.name);
  const phone = mexicanPhone(draft.phone);
  const changed = !!profile && (name !== cleanName(profile.name) || phone !== profile.phone);

  function edit() {
    if (!profile || busy || saveLock.current) return;
    setDraft({ name: profile.name, phone: profile.phone });
    setSaved(false);
    setSaveError('');
    setEditing(true);
  }

  async function save() {
    if (!profile || !name || !phone || !changed || saveLock.current || busy) return;
    saveLock.current = true;
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const result = await updateProfile({
        ...(name !== cleanName(profile.name) ? { name } : {}),
        ...(phone !== profile.phone ? { phone } : {}),
      });
      if (mounted.current) {
        setProfile(result);
        setEditing(false);
        setSaved(true);
      }
    } catch {
      if (mounted.current)
        setSaveError(
          'No se pudieron guardar tus cambios. Revisa tu conexión e inténtalo de nuevo.',
        );
    } finally {
      saveLock.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  async function signOut() {
    if (submitting.current || saveLock.current) return;
    submitting.current = true;
    setBusy(true);
    setLogoutError('');
    try {
      await logout();
    } catch {
      setLogoutError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <MarketplaceShell
      active="account"
      navigationDisabled={busy || saving}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.fill}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <PageHeader
            title="Mi cuenta"
            contained
          />
          {loading || error ? (
            <AccountState
              loading={loading}
              error={error}
              onRetry={() => void load()}
            />
          ) : profile ? (
            editing ? (
              <View style={styles.editor}>
                <AppText
                  variant="heading"
                  accessibilityRole="header"
                >
                  Editar datos
                </AppText>
                <CustomInput
                  label="Nombre completo"
                  value={draft.name}
                  onChangeText={value => {
                    setDraft(previous => ({ ...previous, name: value }));
                    setSaveError('');
                  }}
                  editable={!saving && !busy}
                  autoFocus
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  error={!name ? 'Escribe tu nombre completo.' : undefined}
                />
                <CustomInput
                  label="Teléfono"
                  value={draft.phone}
                  onChangeText={value => {
                    setDraft(previous => ({ ...previous, phone: value }));
                    setSaveError('');
                  }}
                  editable={!saving && !busy}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  error={!phone ? 'Ingresa diez dígitos mexicanos, con o sin +52.' : undefined}
                />
                <Card>
                  <AccountContact
                    label="Correo institucional"
                    value={profile.email}
                    readOnly
                  />
                </Card>
                <View style={styles.saveActions}>
                  {saveError ? <InlineMessage>{saveError}</InlineMessage> : null}
                  <PrimaryButton
                    title="Guardar cambios"
                    loadingTitle="Guardando cambios…"
                    loading={saving}
                    disabled={busy || !changed || !name || !phone}
                    onPress={() => void save()}
                  />
                  <PrimaryButton
                    title="Cancelar"
                    compact
                    variant="ghost"
                    disabled={saving || busy}
                    onPress={() => {
                      setEditing(false);
                      setSaveError('');
                    }}
                  />
                </View>
              </View>
            ) : (
              <>
                <AccountIdentity
                  name={profile.name}
                  disabled={busy}
                  onEdit={edit}
                />
                <View style={styles.contactSection}>
                  <AppText
                    variant="heading"
                    accessibilityRole="header"
                  >
                    Datos de contacto
                  </AppText>
                  <Card>
                    <AccountContact
                      label="Correo institucional"
                      value={profile.email}
                      readOnly
                      divider
                    />
                    <AccountContact
                      label="Teléfono"
                      value={profile.phone}
                    />
                  </Card>
                </View>
              </>
            )
          ) : null}
          {saved ? (
            <View
              style={styles.success}
              accessibilityLiveRegion="polite"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={COLORS.primary}
                accessible={false}
              />
              <AppText style={styles.successText}>Datos actualizados.</AppText>
            </View>
          ) : null}
          <View style={styles.session}>
            {logoutError ? <InlineMessage>{logoutError}</InlineMessage> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              accessibilityState={{ disabled: busy || saving, busy }}
              disabled={busy || saving}
              onPress={() => void signOut()}
              style={({ pressed }) => [
                styles.logout,
                (busy || saving) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              {busy ? (
                <ActivityIndicator color={COLORS.error} />
              ) : (
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={COLORS.error}
                  accessible={false}
                />
              )}
              <AppText
                variant="label"
                style={styles.logoutText}
              >
                {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MarketplaceShell>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.xl, flexGrow: 1 },
  editor: { gap: SPACE.lg, paddingTop: SPACE.sm },
  saveActions: { gap: SPACE.sm, marginTop: SPACE.sm },
  contactSection: { gap: SPACE.md, marginTop: SPACE.lg },
  session: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACE.xxl,
    paddingTop: SPACE.sm,
    gap: SPACE.sm,
  },
  logout: {
    minHeight: METRICS.control,
    flexDirection: 'row',
    gap: SPACE.md,
    alignItems: 'center',
    paddingVertical: SPACE.md,
  },
  logoutText: { color: COLORS.error, flexShrink: 1 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.75 },
  success: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginTop: SPACE.lg },
  successText: { color: COLORS.primary, flexShrink: 1 },
});
