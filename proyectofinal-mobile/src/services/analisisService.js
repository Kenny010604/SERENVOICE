// src/services/analisisService.js
// Servicio para análisis de voz

import apiClient from './apiClient';
import api from '../config/api';
import { Platform } from 'react-native';

const analisisService = {
  /**
   * Obtener historial de análisis
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>}
   */
  async getHistory(limit = 50) {
    try {
      const response = await apiClient.get(api.endpoints.analisis.history, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener historial');
    }
  },

  /**
   * Obtener análisis por ID
   * @param {number} id - ID del análisis
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await apiClient.get(api.endpoints.analisis.get(id));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener análisis');
    }
  },

  /**
   * Obtener análisis del día
   * @returns {Promise<Object>}
   */
  async getToday() {
    try {
      const response = await apiClient.get(api.endpoints.analisis.today);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener análisis del día');
    }
  },

  /**
   * Subir y analizar archivo de audio
   * @param {string} audioUri - URI del archivo de audio local
   * @param {number} duration - Duración de la grabación en segundos
   * @returns {Promise<Object>}
   */
  async uploadAudio(audioUri, duration = 0) {
    try {
      // Crear FormData con el archivo de audio
      const formData = new FormData();
      
      // Extraer nombre del archivo desde la URI
      const uriParts = audioUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      // Determinar el tipo MIME basado en la extensión
      const extension = fileName.split('.').pop().toLowerCase();
      const mimeTypes = {
        'm4a': 'audio/m4a',
        'mp4': 'audio/mp4',
        'caf': 'audio/x-caf',
        'wav': 'audio/wav',
        'mp3': 'audio/mpeg',
        'aac': 'audio/aac',
        'webm': 'audio/webm',
        'ogg': 'audio/ogg',
      };
      const mimeType = mimeTypes[extension] || 'audio/webm';
      
      // Diferentes implementaciones para web vs mobile
      if (Platform.OS === 'web') {
        // En web, el audioUri es un blob URL, necesitamos convertirlo a File/Blob
        try {
          const response = await fetch(audioUri);
          const blob = await response.blob();
          
          // Determinar extensión y nombre basado en el tipo del blob
          let fileExtension = 'webm'; // Default para web
          if (blob.type) {
            const typeMap = {
              'audio/webm': 'webm',
              'audio/ogg': 'ogg',
              'audio/wav': 'wav',
              'audio/mpeg': 'mp3',
              'audio/mp3': 'mp3',
            };
            fileExtension = typeMap[blob.type] || 'webm';
          }
          
          // Crear nombre de archivo con extensión correcta
          const timestamp = Date.now();
          const finalFileName = fileName && fileName.includes('.') 
            ? fileName 
            : `recording_${timestamp}.${fileExtension}`;
          
          // Crear un File desde el Blob para mejor compatibilidad
          const file = new File([blob], finalFileName, {
            type: blob.type || mimeType,
          });
          
          formData.append('audio', file);
          console.log('Audio file prepared for web:', {
            name: file.name,
            size: file.size,
            type: file.type,
          });
        } catch (fetchError) {
          console.error('Error fetching audio blob:', fetchError);
          throw new Error('No se pudo procesar el archivo de audio');
        }
      } else {
        // En mobile (iOS/Android), usar el formato nativo de React Native
        formData.append('audio', {
          uri: audioUri,
          type: mimeType,
          name: fileName || `recording_${Date.now()}.m4a`,
        });
      }
      
      // Agregar duración si está disponible
      if (duration > 0) {
        formData.append('duracion', duration.toString());
      }

      const response = await apiClient.post(api.endpoints.audio.analyze, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutos para upload y análisis
      });
      
      return response.data;
    } catch (error) {
      console.log('Upload audio error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Error al subir y analizar audio');
    }
  },

  /**
   * Analizar audio con FormData preformado
   * @param {FormData} formData - FormData con el archivo de audio
   * @returns {Promise<Object>}
   */
  async analyzeAudio(formData) {
    try {
      const response = await apiClient.post(api.endpoints.audio.analyze, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 segundos para análisis
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al analizar audio');
    }
  },

  /**
   * Obtener estadísticas del usuario
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const response = await apiClient.get(api.endpoints.analisis.stats);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener estadísticas');
    }
  },
};

export default analisisService;
