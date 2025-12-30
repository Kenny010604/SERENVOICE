// src/config/api.js
const API_BASE_URL = "http://localhost:5000/api";  // ← include '/api' so apiClient baseURL matches backend blueprint

// Google OAuth Client ID
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      base: "/auth",
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      google: "/auth/google",
      forgotPassword: "/auth/forgot-password",
      resetPassword: "/auth/reset-password",
      verifyEmail: "/auth/verify-email",
      resendVerification: "/auth/resend-verification",
    },
    usuarios: {
      list: "/usuarios",
      detail: (id) => `/usuarios/${id}`,
      search: "/usuarios/search",
      create: "/usuarios",
      update: (id) => `/usuarios/${id}`,
      delete: (id) => `/usuarios/${id}`,
    },
    // alias in English for existing code that references api.endpoints.users
    users: {
      list: "/usuarios",
      me: "/usuarios/me",
      byId: (id) => `/usuarios/${id}`,
      create: "/usuarios",
      update: (id) => `/usuarios/${id}`,
      delete: (id) => `/usuarios/${id}`,
    },
contacto: "/contact/send",
  },
};

export default api;
