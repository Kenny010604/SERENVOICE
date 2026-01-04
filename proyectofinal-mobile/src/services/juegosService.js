// src/services/juegosService.js
// Servicio de juegos terapéuticos

import apiClient from './apiClient';
import api from '../config/api';

const juegosService = {
  /**
   * Obtener lista de juegos disponibles
   * @returns {Promise<Object>}
   */
  async getAll() {
    try {
      const response = await apiClient.get(api.endpoints.juegos.list);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener juegos');
    }
  },

  /**
   * Obtener juegos recomendados
   * @returns {Promise<Object>}
   */
  async getRecomendados() {
    try {
      const response = await apiClient.get(api.endpoints.juegos.recomendados);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener juegos recomendados');
    }
  },

  /**
   * Iniciar sesión de juego
   * @param {number} juegoId - ID del juego
   * @returns {Promise<Object>}
   */
  async iniciar(juegoId) {
    try {
      const response = await apiClient.post(api.endpoints.juegos.iniciar, {
        id_juego: juegoId,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al iniciar juego');
    }
  },

  /**
   * Finalizar sesión de juego
   * @param {number} sesionId - ID de la sesión
   * @param {Object} resultados - Resultados del juego
   * @returns {Promise<Object>}
   */
  async finalizar(sesionId, resultados) {
    try {
      const response = await apiClient.post(api.endpoints.juegos.finalizar, {
        id_sesion: sesionId,
        ...resultados,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al finalizar juego');
    }
  },

  /**
   * Obtener estadísticas de juegos
   * @returns {Promise<Object>}
   */
  async getEstadisticas() {
    try {
      const response = await apiClient.get(api.endpoints.juegos.estadisticas);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener estadísticas');
    }
  },

  /**
   * Obtener historial de juegos
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>}
   */
  async getHistorial(limit = 20) {
    try {
      const response = await apiClient.get(api.endpoints.juegos.historial, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener historial');
    }
  },
};

export default juegosService;
