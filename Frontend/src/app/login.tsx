import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { COLORS } from '../theme';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import CustomInput from '@/components/CustomInput';
import PrimaryButton from '@/components/PrimaryButton';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (loading) return;
    if (!email.trim().toLowerCase().endsWith('@uabc.edu.mx')) { setError('Ingresa tu correo @uabc.edu.mx.'); return; }
    if (!password) { setError('La contraseña es obligatoria.'); return; }
    setLoading(true);
    setError('');
    try { await login({ email: email.trim(), password }); }
    catch (cause: any) {
      const message = cause?.response?.data?.message;
      setError(Array.isArray(message) ? message.join('\n') : message || 'Correo o contraseña incorrectos.');
    } finally { setLoading(false); }
  }
  return <SafeAreaView style={styles.screen}>
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>TapCampus</Text>
        <Card style={styles.card}>
          <Text style={styles.title}>Bienvenido a TapCampus</Text>
          <Text style={styles.subtitle}>Accede con tu correo institucional.</Text>
          <CustomInput icon="mail-outline" accessibilityLabel="Correo institucional" placeholder="tu.nombre@uabc.edu.mx" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={value => { setEmail(value); setError(''); }} error={error && !email.trim().toLowerCase().endsWith('@uabc.edu.mx') ? error : undefined} />
          <CustomInput icon="lock-closed-outline" accessibilityLabel="Contraseña" placeholder="Contraseña" secureTextEntry value={password} onChangeText={value => { setPassword(value); setError(''); }} error={error && email.trim().toLowerCase().endsWith('@uabc.edu.mx') ? error : undefined} />
          <PrimaryButton title="Iniciar sesión" loading={loading} onPress={submit} />
        </Card>
        <View style={styles.footer}><Text style={styles.footerText}>¿Aún no tienes cuenta? </Text><Link href="/register" asChild><Pressable accessibilityRole="link"><Text style={styles.link}>Regístrate</Text></Pressable></Link></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  fill: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  brand: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 24 },
  card: { padding: 24 },
  title: { color: COLORS.textDark, fontSize: 30, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.textMedium, fontSize: 14, marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: COLORS.textMedium, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
