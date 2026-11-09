import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { COLORS } from '@/theme';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootNavigator() {
  const { estaAutenticado, estaCargando } = useAuth();
  if (estaCargando) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!estaAutenticado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={estaAutenticado}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="publication/[id]" />
        <Stack.Screen name="publication/edit" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded && !fontError) return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} accessibilityLabel="Abriendo TapCampus" /></View>;
  return <AuthProvider><StatusBar style="dark" /><RootNavigator /></AuthProvider>;
}
const styles = StyleSheet.create({ loading: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' } });
