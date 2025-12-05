const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class AudioService {
  // Analiza el audio y envía userId
  async analyzeAudio(audioBlob, duration, userId) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('duration', duration);
      formData.append('user_id', userId); // <-- enviar id del usuario

      const response = await fetch(`${API_URL}/api/audio/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al analizar audio');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en análisis de audio:', error);
      throw error;
    }
  }

  // Verificar estado del servicio
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/api/audio/health`);
      return await response.json();
    } catch (error) {
      console.error('Error verificando servicio:', error);
      return { status: 'error' };
    }
  }

  // Obtener estadísticas de entrenamiento
  async getTrainingStats() {
    try {
      const response = await fetch(`${API_URL}/api/audio/training-stats`);
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { error: error.message };
    }
  }

  // Reentrenar modelo manualmente
  async retrainModel() {
    try {
      const response = await fetch(`${API_URL}/api/audio/retrain`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error reentrenando modelo:', error);
      return { error: error.message };
    }
  }
}

export default new AudioService();
