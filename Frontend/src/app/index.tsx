import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { estaAutenticado } = useAuth();
  return <Redirect href={estaAutenticado ? '/homePage' : '/login'} />;
}
