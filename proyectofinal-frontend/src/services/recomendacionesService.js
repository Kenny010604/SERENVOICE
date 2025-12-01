// src/services/recomendacionesService.js
import apiClient from "./apiClient";

const recomendacionesService = {
  // Obtener recomendaciones de un resultado
  async getByResultado(id_resultado) {
    try {
      const response = await apiClient.get(`/api/recomendaciones/resultado/${id_resultado}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener recomendaciones'
      );
    }
  },

  // Obtener una recomendación específica
  async getById(id_recomendacion) {
    try {
      const response = await apiClient.get(`/api/recomendaciones/${id_recomendacion}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener recomendación'
      );
    }
  }
};

export default recomendacionesService;