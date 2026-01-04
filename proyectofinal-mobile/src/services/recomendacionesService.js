// src/services/recomendacionesService.js
// Servicio de recomendaciones

import apiClient from './apiClient';
import api from '../config/api';

const recomendacionesService = {
  /**
   * Obtener todas las recomendaciones del usuario
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>}
   */
  async getAll(limit = 20) {
    try {
      const response = await apiClient.get(api.endpoints.recomendaciones.list, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener recomendaciones');
    }
  },

  /**
   * Obtener recomendaciones por análisis
   * @param {number} analisisId - ID del análisis
   * @returns {Promise<Object>}
   */
  async getByAnalisis(analisisId) {
    try {
      const response = await apiClient.get(api.endpoints.recomendaciones.byAnalisis(analisisId));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener recomendaciones');
    }
  },
};

export default recomendacionesService;
