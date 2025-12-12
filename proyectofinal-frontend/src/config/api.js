// src/config/api.js
const API_BASE_URL = "http://localhost:5000";  // ← ✔ Ajusta si usas otro puerto

const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      base: "/api/auth",
      login: "/api/auth/login",
      register: "/api/auth/register",
      logout: "/api/auth/logout",
      google: "/api/auth/google",
      forgotPassword: "/api/auth/forgot-password",
      resetPassword: "/api/auth/reset-password",
      verifyEmail: "/api/auth/verify-email",
      resendVerification: "/api/auth/resend-verification",
    },
    usuarios: {
      list: "/api/usuarios",
      detail: (id) => `/api/usuarios/${id}`,
      create: "/api/usuarios",
      update: (id) => `/api/usuarios/${id}`,
      delete: (id) => `/api/usuarios/${id}`,
    },
contacto: "/api/contact/send",
  },
};

export default api;
