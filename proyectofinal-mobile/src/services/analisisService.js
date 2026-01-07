// src/services/analisisService.js
// Servicio para análisis de voz

import apiClient from './apiClient';
import api, { API_URL } from '../config/api';
import { Platform } from 'react-native';
import secureStorage from '../utils/secureStorage';

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
          const blobResponse = await fetch(audioUri);
          const blob = await blobResponse.blob();
          
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
          
          // Agregar duración si está disponible
          if (duration > 0) {
            formData.append('duracion', duration.toString());
          }
          
          console.log('Audio file prepared for web:', {
            name: file.name,
            size: file.size,
            type: file.type,
          });
          
          // Enviar usando axios para web
          const apiResponse = await apiClient.post(api.endpoints.audio.analyze, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 180000,
            transformRequest: (data) => data,
          });
          
          console.log('[analisisService] Respuesta exitosa (web):', apiResponse.status);
          return apiResponse.data;
          
        } catch (fetchError) {
          console.error('Error fetching audio blob:', fetchError);
          throw new Error('No se pudo procesar el archivo de audio');
        }
      } else {
        // En mobile (iOS/Android), usar fetch nativo para mejor compatibilidad con Expo Go
        const audioFile = {
          uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
          type: mimeType,
          name: fileName || `recording_${Date.now()}.m4a`,
        };
        
        console.log('[analisisService] Audio file para mobile:', audioFile);
        console.log('[analisisService] Platform:', Platform.OS);
        console.log('[analisisService] AudioURI:', audioUri);
        
        formData.append('audio', audioFile);
        
        if (duration > 0) {
          formData.append('duracion', duration.toString());
        }
        
        // Usar fetch nativo para mobile (mejor compatibilidad con Expo Go)
        const token = await secureStorage.getAccessToken();
        const fullUrl = `${API_URL}/api${api.endpoints.audio.analyze}`;
        
        console.log('[analisisService] Enviando audio con fetch a:', fullUrl);
        
        const fetchResponse = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            // NO incluir Content-Type para que fetch lo maneje automáticamente con FormData
          },
          body: formData,
        });
        
        console.log('[analisisService] Fetch response status:', fetchResponse.status);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('[analisisService] Error response:', errorText);
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const jsonResponse = await fetchResponse.json();
        console.log('[analisisService] Respuesta exitosa (fetch)');
        return jsonResponse;
      }
    } catch (error) {
      console.log('[analisisService] Error en upload:', {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        responseData: error.response?.data,
        isNetworkError: error.message === 'Network Error',
      });
      
      if (error.message === 'Network Error') {
        throw new Error('Error de red. Verifica tu conexión a internet y que el servidor esté activo.');
      }
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
