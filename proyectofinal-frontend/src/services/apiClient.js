import axios from "axios";
import api from "../config/api";

const apiClient = axios.create({
  baseURL: api.baseURL || "", // Si está vacío usa proxy del Vite
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Normaliza URLs para evitar dobles slashes
const normalizeUrl = (url) => {
    if (!url) return url;
    return url.replace(/\/+$/, ""); // Quita / al final
};

// Interceptor REQUEST → agrega token y normaliza URL
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Normalización de URL para evitar errores como /api/usuarios/
    config.url = normalizeUrl(config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`REQUEST: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Error en request:", error);
    return Promise.reject(error);
  }
);

// Interceptor RESPONSE → captura códigos de error
apiClient.interceptors.response.use(
  (response) => {
    console.log(`RESPONSE ${response.status}: ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`ERROR RESPONSE ${status} en ${url}`);

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
