import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {TOKEN_KEY} from "../constants/api.constants";
import {login as loginService, register as registerService, logout as logoutService} from "../services/auth.service";
import { setUnauthorizedHandler } from '../services/api';

interface RegisterData{
    name: string;
    email: string;
    phone: string;
    password: string;
}

interface LoginData{
    email: string;
    password: string;
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
        let active = true;
        async function verificarToken(){
            try {
                const token = await SecureStore.getItemAsync(TOKEN_KEY);
                if (active) setEstaAutenticado(Boolean(token));
            } finally {
                if (active) setEstaCargando(false);
            }
        }       
        void verificarToken();
        setUnauthorizedHandler(async () => {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            if (active) setEstaAutenticado(false);
        });
        return () => { active = false; setUnauthorizedHandler(); };
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
