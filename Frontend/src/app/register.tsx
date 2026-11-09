import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { COLORS, SPACE, TYPE } from '../theme';
import AppText from '@/components/app-text';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import CustomInput from '@/components/CustomInput';
import PrimaryButton from '@/components/PrimaryButton';
import { mexicanPhone, uabcEmail } from '@/services/auth-validation';
import { InlineMessage } from '@/components/feedback';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<keyof typeof form>();
  const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof form, value: string) => { setForm(previous => ({ ...previous, [key]: value })); setError(''); };
  const complete = Boolean(form.name.trim() && form.email.trim() && form.phone.trim() && form.password && accepted);
  async function submit() {
    if (!complete || loading) return;
    const email = uabcEmail(form.email);
    if (!email) { setErrorField('email'); setError('Ingresa tu correo @uabc.edu.mx.'); return; }
    const phone = mexicanPhone(form.phone);
    if (!phone) { setErrorField('phone'); setError('Ingresa diez dígitos mexicanos, con o sin +52.'); return; }
    if (form.password.length < 8) { setErrorField('password'); setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setLoading(true);
    setError('');
    setErrorField(undefined);
    try { await register({ name: form.name.trim(), email, phone, password: form.password }); }
    catch (cause: any) {
      const message = cause?.response?.data?.message;
      setError(Array.isArray(message) ? message.join('\n') : message || 'No se pudo crear la cuenta.');
    } finally { setLoading(false); }
  }
  return <SafeAreaView style={styles.screen}>
    <StatusBar barStyle="dark-content" />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Link href="/login" asChild><Pressable accessibilityRole="link" style={styles.back}><AppText style={styles.link}>‹ Volver</AppText></Pressable></Link>
        <AppText variant="title">Crea tu cuenta</AppText>
        <Card style={styles.card}>
          <CustomInput label="Nombre completo" placeholder="Nombre completo" value={form.name} editable={!loading} onChangeText={value => update('name', value)} autoCapitalize="words" textContentType="name" autoComplete="name" />
          <CustomInput label="Correo institucional" placeholder="nombre@uabc.edu.mx" value={form.email} editable={!loading} error={errorField === 'email' ? error : undefined} onChangeText={value => update('email', value)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" />
          <CustomInput label="Teléfono mexicano" accessibilityLabel="Teléfono" placeholder="+52 664 123 4567" value={form.phone} editable={!loading} error={errorField === 'phone' ? error : undefined} onChangeText={value => update('phone', value)} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
          <CustomInput label="Contraseña" placeholder="Mínimo 8 caracteres" value={form.password} editable={!loading} onChangeText={value => update('password', value)} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={errorField === 'password' ? error : undefined} />
          {error && !errorField ? <InlineMessage>{error}</InlineMessage> : null}
          <Pressable disabled={loading} accessibilityRole="checkbox" accessibilityState={{ checked: accepted, disabled: loading }} onPress={() => setAccepted(!accepted)} style={styles.terms}><AppText variant="caption">{accepted ? '☑' : '☐'} Acepto el aviso de privacidad y los términos de uso de TapCampus.</AppText></Pressable>
          <PrimaryButton title="Crear cuenta" loadingTitle="Creando cuenta…" loading={loading} disabled={!complete} onPress={() => void submit()} />
        </Card>
        <View style={styles.footer}><AppText variant="caption">¿Ya tienes cuenta? </AppText><Link href="/login" asChild><Pressable accessibilityRole="link" style={styles.footerLink}><AppText style={styles.link}>Inicia sesión</AppText></Pressable></Link></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACE.page, paddingVertical: SPACE.lg, gap: SPACE.sm },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: SPACE.sm },
  card: { padding: SPACE.page, gap: SPACE.lg, marginTop: SPACE.md },
  terms: { minHeight: 44, justifyContent: 'center', paddingVertical: SPACE.sm },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: SPACE.md },
  footerLink: { minHeight: 44, justifyContent: 'center' }, link: { ...TYPE.label, color: COLORS.primary },
});
