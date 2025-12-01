// src/services/alertasService.js
import apiClient from "./apiClient";

const alertasService = {
  // Obtener alertas del usuario actual
  async getMyAlerts() {
    try {
      const response = await apiClient.get('/api/alertas/my-alerts');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener alertas'
      );
    }
  },

  // Obtener todas las alertas activas (solo admin)
  async getActiveAlerts() {
    try {
      const response = await apiClient.get('/api/alertas/active');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener alertas activas'
      );
    }
  },

  // Obtener alerta específica
  async getAlertById(id_alerta) {
    try {
      const response = await apiClient.get(`/api/alertas/${id_alerta}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener alerta'
      );
    }
  }
};

export default alertasService;