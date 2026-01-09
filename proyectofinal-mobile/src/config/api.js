// src/config/api.js
// Configuración de la API para React Native

// Para desarrollo local:
// - En emulador Android: usa 10.0.2.2 en lugar de localhost
// - En emulador iOS: usa localhost
// - En dispositivo físico: usa la IP de tu computadora

// URL base del servidor
const DEV_SERVER_URL = 'http://192.168.54.14:5000';
const PROD_SERVER_URL = 'https://api.serenvoice.com';

const getServerUrl = () => {
  const isDev = __DEV__;
  return isDev ? DEV_SERVER_URL : PROD_SERVER_URL;
};

const getBaseUrl = () => {
  return `${getServerUrl()}/api`;
};

// URL del servidor (sin /api) para health check
export const API_URL = getServerUrl();

const API_BASE = getBaseUrl();

const api = {
  baseURL: API_BASE,
  endpoints: {
    auth: {
      base: '/auth',
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      google: '/auth/google',
      googleWeb: '/auth/google-web',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      verifyEmail: '/auth/verify-email',
      resendVerification: '/auth/resend-verification',
    },
    usuarios: {
      list: '/usuarios',
      detail: (id) => `/usuarios/${id}`,
      me: '/usuarios/me',
      perfil: '/usuarios/perfil',
      update: (id) => `/usuarios/${id}`,
    },
    audio: {
      analyze: '/audio/analyze',
      upload: '/audio/upload',
    },
    analisis: {
      get: (id) => `/analisis/${id}`,
      audio: (id) => `/analisis/${id}/audio`,
      history: '/analisis/history',
      today: '/analisis/hoy',
      stats: '/analisis/stats',
    },
    juegos: {
      list: '/juegos',
      recomendados: '/juegos/recomendados',
      iniciar: '/juegos/iniciar',
      finalizar: '/juegos/finalizar',
      estadisticas: '/juegos/estadisticas',
      historial: '/juegos/historial',
    },
    alertas: {
      myAlerts: '/alertas/my-alerts',
      active: '/alertas/active',
    },
    recomendaciones: {
      list: '/recomendaciones',
      byAnalisis: (id) => `/recomendaciones/analisis/${id}`,
    },
    notificaciones: {
      list: '/notificaciones',
      unread: '/notificaciones/unread',
      markRead: (id) => `/notificaciones/${id}/read`,
      preferences: '/notificaciones/preferences',
    },
    grupos: {
      list: '/grupos',
      detail: (id) => `/grupos/${id}`,
      miembros: (id) => `/grupos/${id}/miembros`,
    },
    health: '/health',
  },
};

export default api;
