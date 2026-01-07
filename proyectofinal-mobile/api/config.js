import axios from "axios";

// Usa tu IP local para acceder desde dispositivos físicos (celular)
// Cambia a "http://localhost:5000" si usas emulador/web
const api = axios.create({
  baseURL: "http://192.168.1.61:5000",
  timeout: 30000, // Aumentado a 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
