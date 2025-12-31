// src/services/analisisService.js
import apiClient from "./apiClient";
import api from '../config/api';

const analisisService = {
  // Obtener detalle de un análisis
  async getAnalisisById(id_analisis) {
    try {
      const response = await apiClient.get(api.endpoints.analisis.get(id_analisis));
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener análisis'
      );
    }
  },

  // Obtener historial de análisis del usuario
  async getHistory(limit = 10) {
    try {
      const response = await apiClient.get(api.endpoints.analisis.history, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener historial'
      );
    }
  }
};

export default analisisService;