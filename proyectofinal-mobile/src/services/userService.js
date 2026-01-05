// src/services/userService.js
// Servicio de usuarios

import apiClient from './apiClient';
import api from '../config/api';
import secureStorage from '../utils/secureStorage';
import { Platform } from 'react-native';

const userService = {
  /**
   * Obtener perfil del usuario actual
   * @returns {Promise<Object>}
   */
  async getProfile() {
    try {
      const response = await apiClient.get(api.endpoints.usuarios.me);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener perfil');
    }
  },

  /**
   * Actualizar perfil del usuario autenticado
   * El backend espera FormData, no JSON
   * @param {number} userId - ID del usuario (se ignora, se usa token)
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, data) {
    try {
      console.log('[userService] Actualizando perfil con datos:', Object.keys(data));
      
      // Crear FormData ya que el backend espera multipart/form-data
      const formData = new FormData();
      
      // Agregar cada campo al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convertir todo a string para evitar errores de tipo
          formData.append(key, String(value));
        }
      });
      
      console.log('[userService] Enviando FormData a:', api.endpoints.usuarios.perfil);
      
      // Usar endpoint /perfil que usa el token JWT para identificar al usuario
      const response = await apiClient.put(api.endpoints.usuarios.perfil, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data, // Evitar transformación del FormData
      });
      
      console.log('[userService] Respuesta recibida:', response.data?.success);
      
      if (response.data?.success) {
        // Actualizar usuario en storage
        const currentUser = await secureStorage.getUser();
        const updatedUser = { ...currentUser, ...data };
        await secureStorage.setUser(updatedUser);
      }
      
      return response.data;
    } catch (error) {
      console.error('[userService] Error al actualizar perfil:', error.message);
      throw new Error(error.response?.data?.error || 'Error al actualizar perfil');
    }
  },

  /**
   * Actualizar foto de perfil
   * @param {number} userId - ID del usuario
   * @param {Object} imageData - Datos de la imagen
   * @returns {Promise<Object>}
   */
  async updateProfilePhoto(userId, imageData) {
    try {
      const formData = new FormData();
      formData.append('foto_perfil', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.name || 'profile.jpg',
      });

      const response = await apiClient.put(
        api.endpoints.usuarios.update(userId), 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar foto');
    }
  },

  /**
   * Cambiar contraseña
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post('/usuarios/change-password', {
        contrasena_actual: currentPassword,
        nueva_contrasena: newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al cambiar contraseña');
    }
  },
};

export default userService;
