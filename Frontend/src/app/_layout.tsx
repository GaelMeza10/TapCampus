import {useEffect} from 'react'
import {AuthProvider, useAuth} from '../context/AuthContext'
import {Stack, router } from 'expo-router'

function RedireccionInicio(){ //renombrar con mayuscula
    const {estaAutenticado, estaCargando} = useAuth();

    useEffect(() => {
        if(estaCargando) return;
        if(estaAutenticado){
            router.replace('/inicio');
        }
        if(!estaAutenticado){
            router.replace('/login');
        }
    },[estaAutenticado, estaCargando]);

    return(
        <Stack screenOptions={{headerShown: false}}/>
    )
}
    
 export default function RootLayout() {
      return (
        <AuthProvider>
          <RedireccionInicio/>
        </AuthProvider>
      );
    }