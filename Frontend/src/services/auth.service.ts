import * as SecureStore from 'expo-secure-store';
import api from './api';
import { TOKEN_KEY } from '../constants/api.constants';

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

export async function register(payload: RegistrarPayload): Promise<void> {
    const {data} = await api.post<AuthResponse>('/auth/register', payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
}

export async function login(payload: LoginPayload): Promise<void> {

    const {data} = await api.post<AuthResponse>('/auth/login', payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
}
export async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}
