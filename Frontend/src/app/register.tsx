import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { COLORS } from '../theme';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import CustomInput from '@/components/CustomInput';
import PrimaryButton from '@/components/PrimaryButton';
import { mexicanPhone, uabcEmail } from '@/services/auth-validation';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof form, value: string) => { setForm(previous => ({ ...previous, [key]: value })); setError(''); };
  const complete = Boolean(form.name.trim() && form.email.trim() && form.phone.trim() && form.password && accepted);
  async function submit() {
    if (!complete || loading) return;
    const email = uabcEmail(form.email);
    if (!email) { setError('Ingresa tu correo @uabc.edu.mx.'); return; }
    const phone = mexicanPhone(form.phone);
    if (!phone) { setError('Ingresa diez dígitos mexicanos, con o sin +52.'); return; }
    setLoading(true);
    setError('');
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
        <Link href="/login" asChild><Pressable accessibilityRole="link" style={styles.back}><Text style={styles.link}>‹ Volver</Text></Pressable></Link>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Solo para estudiantes con correo institucional.</Text>
        <Card style={styles.card}>
          <CustomInput icon="person-outline" accessibilityLabel="Nombre completo" placeholder="Nombre completo" value={form.name} onChangeText={value => update('name', value)} autoCapitalize="words" />
          <CustomInput icon="mail-outline" accessibilityLabel="Correo institucional" placeholder="Correo institucional" value={form.email} onChangeText={value => update('email', value)} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput icon="call-outline" accessibilityLabel="Teléfono" placeholder="+52 664 123 4567" value={form.phone} onChangeText={value => update('phone', value)} keyboardType="phone-pad" />
          <CustomInput icon="lock-closed-outline" accessibilityLabel="Contraseña" placeholder="Crea una contraseña" value={form.password} onChangeText={value => update('password', value)} secureTextEntry error={error || undefined} />
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={styles.terms}><Text style={styles.termsText}>{accepted ? '☑' : '☐'} Acepto el aviso de privacidad y los términos de uso de TapCampus.</Text></Pressable>
          <PrimaryButton title="Crear cuenta" loading={loading} disabled={!complete} onPress={submit} />
        </Card>
        <View style={styles.footer}><Text style={styles.footerText}>¿Ya tienes cuenta? </Text><Link href="/login" asChild><Pressable accessibilityRole="link"><Text style={styles.link}>Inicia sesión</Text></Pressable></Link></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  back: { alignSelf: 'flex-start', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textDark, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMedium, marginBottom: 24 },
  card: { padding: 24 },
  terms: { paddingVertical: 16 },
  termsText: { color: COLORS.textMedium, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: COLORS.textMedium, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
