import { Stack } from 'expo-router';
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
        <Stack.Screen name="homePage" />
        <Stack.Screen name="publication/[id]" />
        <Stack.Screen name="publication/edit" />
        <Stack.Screen name="sales" />
        <Stack.Screen name="reservations" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthProvider><RootNavigator /></AuthProvider>;
}
