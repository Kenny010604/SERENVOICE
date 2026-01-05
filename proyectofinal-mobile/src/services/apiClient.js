// src/services/apiClient.js
// Cliente HTTP para React Native

import axios from 'axios';
import { Platform } from 'react-native';
import api from '../config/api';
import secureStorage from '../utils/secureStorage';

const apiClient = axios.create({
  baseURL: api.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Obtener token del almacenamiento seguro
    const token = await secureStorage.getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si es FormData, configurar correctamente
    if (config.data instanceof FormData) {
      // En React Native, axios necesita esto para FormData
      config.headers['Content-Type'] = 'multipart/form-data';
      // Agregar timeout más largo para uploads
      config.timeout = config.timeout || 180000;
    }

    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data instanceof FormData) {
        console.log('[API] Sending FormData');
      }
    }

    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] Response ${response.status}: ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (__DEV__) {
      console.error(`[API] Error ${status}: ${error.config?.url}`);
    }

    // Si es 401 y no es un retry, intentar refresh del token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStorage.getRefreshToken();
        
        if (refreshToken) {
          const response = await axios.post(`${api.baseURL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          if (response.data.token) {
            await secureStorage.setAccessToken(response.data.token);
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed');
      }

      // Si el refresh falla, limpiar tokens
      await secureStorage.clearTokens();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
