import * as SecureStore from 'expo-secure-store';
import api from './api';
import { TOKEN_KEY } from '../constants/api.constants';

// Login y registro suelen ser la primera petición: en Render gratuito el servidor puede tardar ~1 min en despertar.
const AUTH_TIMEOUT_MS = 70000;

interface RegistrarPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface AuthResponse {
    access_token: string;
}

export type UserProfile = { id: string; name: string; email: string; phone: string };
export async function updateProfile(payload: { name?: string; phone?: string }): Promise<UserProfile> {
    const { data } = await api.patch<UserProfile>('/auth/me', payload);
    return data;
}
export async function myProfile(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/auth/me');
    return data;
}

/** Id del usuario de la sesión, leído del `sub` del JWT guardado. Sin red; undefined si no hay sesión. */
export async function currentUserId(): Promise<string | undefined> {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const part = token?.split('.')[1];
        if (!part) return undefined;
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
        const payload = JSON.parse(atob(base64)) as { sub?: unknown };
        return typeof payload.sub === 'string' ? payload.sub : undefined;
    } catch {
        return undefined;
    }
}

export async function register(payload: RegistrarPayload): Promise<void> {
    const {data} = await api.post<AuthResponse>('/auth/register', payload, { timeout: AUTH_TIMEOUT_MS });
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
}

export async function login(payload: LoginPayload): Promise<void> {

    const {data} = await api.post<AuthResponse>('/auth/login', payload, { timeout: AUTH_TIMEOUT_MS });
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
}
export async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}
