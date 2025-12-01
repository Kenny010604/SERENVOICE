// src/services/sesionesService.js
import apiClient from "./apiClient";

const sesionesService = {
  // Obtener sesiones del usuario actual
  async getMySessions(limit = 10) {
    try {
      const response = await apiClient.get('/api/sesiones/my-sessions', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener sesiones'
      );
    }
  },

  // Obtener sesiones activas del usuario
  async getActiveSessions() {
    try {
      const response = await apiClient.get('/api/sesiones/active');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener sesiones activas'
      );
    }
  },

  // Cerrar sesión específica
  async closeSession(id_sesion) {
    try {
      const response = await apiClient.put(`/api/sesiones/${id_sesion}/close`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cerrar sesión'
      );
    }
  }
};

export default sesionesService;