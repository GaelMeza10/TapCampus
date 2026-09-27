import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from './styles/theme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function PantallaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();

  async function handleLogin() {
    try {
      await login({ correo: email, contrasena: password });
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      const mensaje = error?.response?.data?.message || 'Error de conexión con el servidor.';
      Alert.alert('Error al iniciar sesión', String(mensaje));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      
      <View style={styles.gridOverlay} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="location-sharp" size={22} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.logoName}>TapCampus</Text>
              <Text style={styles.logoTagline}>TU CAMPUS EN LÍNEA</Text>
            </View>
          </View>

          {/* Card principal */}
          <View style={styles.card}>
            <Text style={styles.title}>Bienvenido a{'\n'}TapCampus</Text>
            <Text style={styles.subtitle}>
              Accede con tu correo institucional.
            </Text>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="tu.nombre@uabc.edu.mx"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View> 

            {/* Contraseña */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline" 
                size={18}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Botón iniciar sesión */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
              onPress={async () => {
                setLoading(true);
                await handleLogin();
                setLoading(false);
              }}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>

          
          </View>

          {/* Pie: ir a registro */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Aún no tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Cuadrícula muy sutil para imitar mapa topográfico del prototipo
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
    backgroundColor: 'transparent',
    borderColor: '#8FAB8A',
    // En producción puedes usar una imagen SVG de mapa como backgroundImage
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    marginTop: 16,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  logoTagline: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMedium,
    letterSpacing: 1.2,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 28,
    ...SHADOW.card,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 28,
    lineHeight: 20,
  },

  // Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    height: '100%',
  },
  inputPassword: {
    paddingRight: 8,
  },
  eyeButton: {
    padding: 4,
  },

  // Botón primario
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMedium,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
});