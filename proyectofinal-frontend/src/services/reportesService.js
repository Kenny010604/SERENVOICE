// src/services/reportesService.js
import apiClient from "./apiClient";

const reportesService = {
  // Generar nuevo reporte
  async generateReport(fecha_inicio, fecha_fin, formato = 'pdf') {
    try {
      const response = await apiClient.post('/reportes/generate', {
        fecha_inicio,
        fecha_fin,
        formato
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al generar reporte'
      );
    }
  },

  // Obtener reportes del usuario actual
  async getMyReports() {
    try {
      const response = await apiClient.get('/reportes/my-reports');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener reportes'
      );
    }
  },

  // Obtener detalles de un reporte
  async getReportById(id_reporte) {
    try {
      const response = await apiClient.get(`/reportes/${id_reporte}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener reporte'
      );
    }
  }
};

export default reportesService;