export { default as ApiEndpoints } from './ApiEndpoints';
export { default as ApiClient } from './ApiClient';
export { default as Config } from './Config';

// Export directo de API_URL para compatibilidad
// Usa tu IP local para acceder desde dispositivos físicos (celular)
// Cambia a "http://localhost:5000" si usas emulador/web
export const API_URL = "http://192.168.1.61:5000";