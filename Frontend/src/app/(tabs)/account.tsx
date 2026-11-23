import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
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
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import { CampusHeader } from '@/components/campus-header';
import { MARKETPLACE_SCROLL_PROPS, MarketplaceShell, PageHeader } from '@/components/marketplace-shell';
import { ConfirmationDialog, InlineMessage } from '@/components/feedback';
import AppText from '@/components/app-text';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import CustomInput from '@/components/CustomInput';
import { NAME_MAX } from '@/lib/field-limits';
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
  const logoutTrigger = useRef<ComponentRef<typeof Pressable>>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
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
          {...MARKETPLACE_SCROLL_PROPS}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <CampusHeader />
          <View style={styles.body}>
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
                  }}
                  maxLength={NAME_MAX}
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
                    variant="section"
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
                  <AppText variant="caption">Compradores y vendedores te escriben a este número por WhatsApp. Mantenlo actualizado.</AppText>
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
            {logoutError && !confirmLogout ? <InlineMessage>{logoutError}</InlineMessage> : null}
            <Pressable
              ref={logoutTrigger}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              accessibilityState={{ disabled: busy || saving, busy }}
              disabled={busy || saving}
              onPress={() => { setLogoutError(''); setConfirmLogout(true); }}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmationDialog visible={confirmLogout} title="¿Cerrar sesión?"
        returnFocusRef={logoutTrigger}
        description={editing && changed ? 'Los cambios de tu perfil sin guardar se perderán. Tendrás que iniciar sesión para volver a usar tu cuenta.' : 'Tendrás que iniciar sesión para volver a usar tu cuenta.'}
        confirmTitle="Cerrar sesión" loadingTitle="Cerrando sesión…" variant="destructive"
        busy={busy} error={logoutError} onClose={() => { setConfirmLogout(false); setLogoutError(''); }} onConfirm={() => void signOut()} />
    </MarketplaceShell>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: SPACE.xl, flexGrow: 1 },
  body: { paddingHorizontal: SPACE.page, width: '100%', maxWidth: 680, alignSelf: 'center' },
  editor: { gap: SPACE.lg, paddingTop: SPACE.sm },
  saveActions: { gap: SPACE.sm, marginTop: SPACE.sm },
  contactSection: { gap: SPACE.md, marginTop: SPACE.lg },
  session: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACE.xxl,
    paddingTop: SPACE.lg,
    gap: SPACE.sm,
  },
  logout: {
    minHeight: METRICS.control,
    flexDirection: 'row',
    gap: SPACE.md,
    alignItems: 'center',
    paddingVertical: SPACE.md,
    justifyContent: 'center',
    paddingHorizontal: SPACE.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
  },
  logoutText: { color: COLORS.error, flexShrink: 1 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.75 },
  success: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginTop: SPACE.lg },
  successText: { color: COLORS.primary, flexShrink: 1 },
});
