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
import { uabcEmail } from '@/services/auth-validation';
import { InlineMessage } from '@/components/feedback';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<'email' | 'password'>();
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (loading) return;
    const normalizedEmail = uabcEmail(email);
    if (!normalizedEmail) { setErrorField('email'); setError('Ingresa tu correo @uabc.edu.mx.'); return; }
    if (!password) { setErrorField('password'); setError('La contraseña es obligatoria.'); return; }
    setLoading(true);
    setError('');
    setErrorField(undefined);
    try { await login({ email: normalizedEmail, password }); }
    catch (cause: any) {
      const message = cause?.response?.data?.message;
      setError(Array.isArray(message) ? message.join('\n') : message || 'Correo o contraseña incorrectos.');
    } finally { setLoading(false); }
  }
  return <SafeAreaView style={styles.screen}>
    <StatusBar barStyle="dark-content" />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandGroup}><AppText variant="brand">TapCampus</AppText></View>
        <Card style={styles.card}>
          <AppText variant="section">Bienvenido de nuevo</AppText>
          <CustomInput label="Correo institucional" placeholder="tu.nombre@uabc.edu.mx" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" editable={!loading} value={email} onChangeText={value => { setEmail(value); setError(''); }} error={errorField === 'email' ? error : undefined} />
          <CustomInput label="Contraseña" placeholder="Contraseña" textContentType="password" autoComplete="current-password" secureTextEntry editable={!loading} value={password} onChangeText={value => { setPassword(value); setError(''); }} error={errorField === 'password' ? error : undefined} />
          {error && !errorField ? <InlineMessage>{error}</InlineMessage> : null}
          <PrimaryButton title="Iniciar sesión" loadingTitle="Entrando…" loading={loading} onPress={() => void submit()} />
        </Card>
        <View style={styles.footer}><AppText style={styles.link}>¿Aún no tienes cuenta? </AppText><Link href="/register" asChild><Pressable accessibilityRole="link" style={styles.footerLink}><AppText style={styles.link}>Regístrate</AppText></Pressable></Link></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACE.page, paddingTop: SPACE.section, paddingBottom: SPACE.xl },
  brandGroup: { paddingHorizontal: SPACE.xs, marginBottom: SPACE.xl },
  card: { padding: SPACE.xl, gap: SPACE.lg },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginTop: SPACE.xl },
  footerLink: { minHeight: 44, justifyContent: 'center' }, link: { ...TYPE.label, color: COLORS.primary },
});
