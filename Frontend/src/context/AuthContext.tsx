import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {TOKEN_KEY} from "../constants/api.constants";
import {login as loginService, register as registerService, logout as logoutService} from "../services/auth.service";
//tipos
interface RegisterData{
    nombre: string;
    correo: string;
    telefono: string;
    contrasena: string;
}

interface LoginData{
    correo: string;
    contrasena: string;
}
interface AuthContextType{
    estaAutenticado: boolean;
    estaCargando: boolean;
    login: (data: LoginData) => Promise<void>;
    register:(data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
}
//contexto
const AuthContext = createContext<AuthContextType | null>(null);

//funcion del provider
export function  AuthProvider({children}: {children: React.ReactNode}){
    const [estaAutenticado, setEstaAutenticado] = useState(false);
    const [estaCargando, setEstaCargando] = useState(true);

    //al abrir la app revisamos si ya esta un token guardado
    useEffect(() =>{
        async function verificarToken(){
            //se obtiene el token
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token){
                //si hay token se actualiza el estado
                setEstaAutenticado(true);
            }
            setEstaCargando(false);
        }       
        verificarToken();
    },[]);

    async function login(data: LoginData){
        await loginService(data);
        setEstaAutenticado(true);
    }

    async function register(data: RegisterData){
        await registerService(data);
        setEstaAutenticado(true);
    }

    async function logout(){
        await logoutService();
        setEstaAutenticado(false);
    }
    return (
        <AuthContext.Provider value={{estaAutenticado, estaCargando, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

//hook para usar el contexto
export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}