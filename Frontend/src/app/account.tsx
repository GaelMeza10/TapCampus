import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { myProfile, type UserProfile } from '@/services/auth.service';
import { SPACE } from '@/theme';
import { MarketplaceShell, PageHeader } from '@/components/marketplace-shell';
import { DataState, InlineMessage } from '@/components/feedback';
import AppText from '@/components/app-text';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';

export default function MyAccount() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const sequence = useRef(0);
  const submitting = useRef(false);
  const load = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true); setError('');
    try { const result = await myProfile(); if (request === sequence.current) setProfile(result); }
    catch { if (request === sequence.current) setError('Revisa tu conexión y vuelve a intentarlo. Puedes seguir usando la app o cerrar sesión desde aquí.'); }
    finally { if (request === sequence.current) setLoading(false); }
  }, []);
  useEffect(() => { void load(); return () => { sequence.current++; }; }, [load]);
  useEffect(() => {
    if (Platform.OS !== 'web' && (busy || logoutError)) AccessibilityInfo.announceForAccessibility(busy ? 'Cerrando sesión…' : logoutError);
  }, [busy, logoutError]);
  async function signOut() {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setLogoutError('');
    try { await logout(); }
    catch { setLogoutError('No se pudo cerrar la sesión. Inténtalo de nuevo.'); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <MarketplaceShell active="account" navigationDisabled={busy}>
    <PageHeader title="Mi cuenta" />
    <ScrollView contentContainerStyle={styles.content}>
      {loading ? <DataState kind="loading" title="Cargando tu cuenta…" /> : error ? <DataState kind="error" title="No pudimos cargar tu información" description={error} action="Reintentar" onAction={() => void load()} /> : profile ? <Card style={styles.details}>
        <View style={styles.field}><AppText variant="caption">Nombre completo</AppText><AppText variant="heading" selectable>{profile.name}</AppText></View>
        <View style={styles.field}><AppText variant="caption">Correo institucional</AppText><AppText selectable>{profile.email}</AppText></View>
        <View style={styles.field}><AppText variant="caption">Teléfono</AppText><AppText selectable>{profile.phone}</AppText></View>
      </Card> : null}
      {logoutError ? <InlineMessage>{logoutError}</InlineMessage> : null}
      <PrimaryButton title="Cerrar sesión" loadingTitle="Cerrando sesión…" variant="destructive" loading={busy} onPress={() => void signOut()} />
    </ScrollView>
  </MarketplaceShell>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.page, gap: SPACE.lg }, details: { padding: SPACE.page, gap: SPACE.xl }, field: { gap: SPACE.xs } });
