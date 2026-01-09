import axios from "axios";
import { API_URL } from "../constants/env";

// Usa la URL de la API desde el archivo de entorno centralizado
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentado a 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
