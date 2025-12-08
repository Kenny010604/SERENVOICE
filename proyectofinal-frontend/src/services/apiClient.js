import axios from "axios";
import api from "../config/api";

const apiClient = axios.create({
  baseURL: api.baseURL || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/\/+$/, ""); 
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
