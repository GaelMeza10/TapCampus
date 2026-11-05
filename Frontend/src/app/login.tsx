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

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (loading) return;
    const normalizedEmail = uabcEmail(email);
    if (!normalizedEmail) { setError('Ingresa tu correo @uabc.edu.mx.'); return; }
    if (!password) { setError('La contraseña es obligatoria.'); return; }
    setLoading(true);
    setError('');
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
        <View style={styles.brandGroup}><AppText variant="brand">TapCampus</AppText><AppText style={styles.subtitle}>Tu campus, más cerca</AppText></View>
        <Card style={styles.card}>
          <AppText variant="section">Bienvenido de nuevo</AppText>
          <AppText variant="caption">Entra con tu cuenta universitaria.</AppText>
          <CustomInput label="Correo institucional" placeholder="tu.nombre@uabc.edu.mx" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" value={email} onChangeText={value => { setEmail(value); setError(''); }} error={error && !uabcEmail(email) ? error : undefined} />
          <CustomInput label="Contraseña" placeholder="Contraseña" textContentType="password" autoComplete="current-password" secureTextEntry value={password} onChangeText={value => { setPassword(value); setError(''); }} error={error && !!uabcEmail(email) ? error : undefined} />
          <PrimaryButton title="Iniciar sesión" loading={loading} onPress={submit} />
        </Card>
        <View style={styles.footer}><AppText style={styles.link}>¿Aún no tienes cuenta? </AppText><Link href="/register" asChild><Pressable accessibilityRole="link" style={styles.footerLink}><AppText style={styles.link}>Regístrate</AppText></Pressable></Link></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACE.page, paddingTop: SPACE.section, paddingBottom: SPACE.xl },
  brandGroup: { gap: SPACE.xs, paddingHorizontal: SPACE.xs, marginBottom: 52 }, subtitle: { color: COLORS.textMedium },
  card: { padding: SPACE.xl, gap: SPACE.lg },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginTop: SPACE.xl },
  footerLink: { minHeight: 44, justifyContent: 'center' }, link: { ...TYPE.label, color: COLORS.primary },
});
