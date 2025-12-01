// src/config/api.js
const API_BASE_URL = ''; // ✅ DEBE ESTAR VACÍO

const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout'
    },
    usuarios: {
      list: '/api/usuarios',
      detail: (id) => `/api/usuarios/${id}`,
      create: '/api/usuarios',
      update: (id) => `/api/usuarios/${id}`,
      delete: (id) => `/api/usuarios/${id}`
    }
  }
};

export default api;