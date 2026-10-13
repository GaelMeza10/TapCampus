import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, TOKEN_KEY } from '../constants/api.constants';
//instancia de axios con la url base del backend
const api = axios.create({
    baseURL: API_BASE_URL,
    headers:{
        'Content-Type': 'application/json',
    },
})
let onUnauthorized: (() => Promise<void>) | undefined;
export function setUnauthorizedHandler(handler?: () => Promise<void>) {
    onUnauthorized = handler;
}
//interceptor para agregar el token a cada request
api.interceptors.request.use( async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }
    return config;
})
api.interceptors.response.use(
    response => response,
    async error => {
        const path = error.config?.url ?? '';
        if (error.response?.status === 401 && !path.startsWith('/auth/') && onUnauthorized) {
            await onUnauthorized();
        }
        return Promise.reject(error);
    },
);

export default api;
