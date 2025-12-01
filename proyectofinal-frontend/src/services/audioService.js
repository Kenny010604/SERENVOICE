// src/services/audioService.js
import apiClient from "./apiClient";

const audioService = {
  // Subir y procesar audio
  async uploadAudio(audioFile) {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await apiClient.post('/api/audios/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al subir audio'
      );
    }
  },

  // Obtener audios del usuario actual
  async getMyAudios(page = 1, per_page = 20) {
    try {
      const response = await apiClient.get('/api/audios/my-audios', {
        params: { page, per_page }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener audios'
      );
    }
  },

  // Eliminar audio
  async deleteAudio(id_audio) {
    try {
      const response = await apiClient.delete(`/api/audios/${id_audio}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al eliminar audio'
      );
    }
  }
};

export default audioService;