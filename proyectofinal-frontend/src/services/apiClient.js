// src/services/apiClient.js
import axios from "axios";
import apiConfig from "../config/api";
import authService from './authService';
import logger from '../utils/logger';

// ==============================
// CONFIGURACIÓN BASE (EXPO SAFE)
// ==============================
const deriveBaseUrl = () => {
  if (apiConfig?.baseURL) return apiConfig.baseURL;
  const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const normalized = String(raw).replace(/\/+$/, "");
  return `${normalized}/api`;
};

const API_BASE_URL = deriveBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// ==============================
// NORMALIZAR URL
// ==============================
const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/\/+$/, "");
};

// ==============================
// INTERCEPTOR REQUEST
// ==============================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.url = normalizeUrl(config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Solo establecer Content-Type si no es FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    logger.debug(`REQUEST: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    logger.error("REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

// ==============================
// INTERCEPTOR RESPONSE
// ==============================
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`RESPONSE ${response.status}: ${response.config.url}`);
    return response;
  },
  (error) => {
    // Ignore cancellations (AbortController / axios cancel)
    const isCanceled = error?.code === 'ERR_CANCELED' || (axios.isCancel && axios.isCancel(error));
    const status = error.response?.status;
    const url = error.config?.url;

    if (isCanceled) {
      logger.debug(`REQUEST CANCELED: ${url}`);
      return Promise.reject(error);
    }

    logger.error(`ERROR RESPONSE ${status} en ${url}`);

    if (status === 401) {
      logger.warn("Token expirado o inválido (interceptor)");

      // Si la petición incluyó el header `X-Skip-Auth-Redirect`, no forzamos
      // la redirección automática. Esto permite llamadas de polling/filtrado
      // que no deben interrumpir la experiencia del usuario.
      const skipRedirect = error.config?.headers?.['X-Skip-Auth-Redirect'] || error.config?.skipAuthRedirect;
      if (skipRedirect) {
        logger.debug('Skipping auto-redirect for request due to X-Skip-Auth-Redirect header');
        return Promise.reject(error);
      }

      try {
        // Forzar logout local y redirigir al login para obtener credenciales nuevas
        authService.logout();
      } catch (err) {
        logger.warn('Error during auto-logout:', err);
      }
      // Redirigir a la página de login
      if (typeof window !== 'undefined') {
        window.setTimeout(() => { window.location.href = '/login'; }, 150);
      }
    }

    return Promise.reject(error);
  }
);

// ==============================
// API DE JUEGOS
// ==============================
export const juegosAPI = {
  listar: async () => {
    const response = await apiClient.get(apiConfig.endpoints.juegos.list);
    return response.data;
  },

  recomendados: async (estado) => {
    const response = await apiClient.get(apiConfig.endpoints.juegos.recomendados, { params: { estado } });
    return response.data;
  },

  iniciar: async (juegoId, estadoAntes = null) => {
    const response = await apiClient.post(apiConfig.endpoints.juegos.iniciar, {
      juego_id: juegoId,
      estado_antes: estadoAntes,
    });
    return response.data;
  },

  finalizar: async (sesionId, datos) => {
    const response = await apiClient.post(apiConfig.endpoints.juegos.finalizar, {
      sesion_id: sesionId,
      puntuacion: datos.puntuacion,
      completado: datos.completado,
      estado_despues: datos.estadoDespues,
      mejora_percibida: datos.mejora,
      notas: datos.notas || "",
    });
    return response.data;
  },

  estadisticas: async () => {
    const response = await apiClient.get(apiConfig.endpoints.juegos.estadisticas);
    return response.data;
  },

  historial: async (limit = 20) => {
    const response = await apiClient.get(apiConfig.endpoints.juegos.historial, { params: { limit } });
    return response.data;
  },
};

export default apiClient;
