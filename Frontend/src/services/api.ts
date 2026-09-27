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
//interceptor para agregar el token a cada request
api.interceptors.request.use( async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export default api;