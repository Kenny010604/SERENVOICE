// src/services/authService.js
// Servicio de autenticación

import apiClient from './apiClient';
import api from '../config/api';
import secureStorage from '../utils/secureStorage';
import validators from '../utils/validators';

const authService = {
  /**
   * Login de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async login(email, password) {
    // Sanitizar email
    const sanitizedEmail = validators.sanitizeEmail(email);
    
    if (!validators.isValidEmail(sanitizedEmail)) {
      throw new Error('Formato de correo electrónico inválido');
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.login, {
        correo: sanitizedEmail,
        contrasena: password,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Credenciales incorrectas');
      }

      const { token, refresh_token, user, session_id } = response.data;

      // Guardar tokens y usuario en almacenamiento seguro
      await secureStorage.setAccessToken(token);
      if (refresh_token) {
        await secureStorage.setRefreshToken(refresh_token);
      }
      if (session_id) {
        await secureStorage.setSessionId(session_id);
      }

      // Preparar usuario con roles
      const userWithRoles = {
        ...user,
        role: user.roles?.[0] || 'usuario',
        roles: user.roles || ['usuario'],
      };

      await secureStorage.setUser(userWithRoles);

      return { token, refresh_token, user: userWithRoles };
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      throw new Error(message);
    }
  },

  /**
   * Registro de usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async register(userData) {
    // Validaciones
    if (!validators.isValidEmail(userData.correo)) {
      throw new Error('Formato de correo electrónico inválido');
    }

    if (!validators.isValidName(userData.nombre)) {
      throw new Error('El nombre solo debe contener letras');
    }

    if (!validators.isValidName(userData.apellido)) {
      throw new Error('El apellido solo debe contener letras');
    }

    const passwordValidation = validators.isValidPassword(userData.contrasena);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    if (userData.fecha_nacimiento) {
      const ageValidation = validators.isValidAge(userData.fecha_nacimiento);
      if (!ageValidation.valid) {
        throw new Error(ageValidation.message);
      }
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.register, {
        nombre: validators.sanitizeText(userData.nombre),
        apellido: validators.sanitizeText(userData.apellido),
        correo: validators.sanitizeEmail(userData.correo),
        contrasena: userData.contrasena,
        genero: userData.genero,
        fecha_nacimiento: userData.fecha_nacimiento || null,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al registrar usuario');
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      throw new Error(message);
    }
  },

  /**
   * Logout de usuario
   */
  async logout() {
    try {
      const sessionId = await secureStorage.getSessionId();
      
      if (sessionId) {
        try {
          await apiClient.post(api.endpoints.auth.logout, { session_id: sessionId });
        } catch (e) {
          console.warn('Error closing remote session');
        }
      }
    } finally {
      await secureStorage.clearAll();
    }
  },

  /**
   * Obtener token almacenado
   */
  async getToken() {
    return await secureStorage.getAccessToken();
  },

  /**
   * Obtener usuario almacenado
   */
  async getUser() {
    return await secureStorage.getUser();
  },

  /**
   * Verificar si está autenticado
   */
  async isAuthenticated() {
    return await secureStorage.hasValidToken();
  },

  /**
   * Actualizar datos del usuario en storage
   */
  async setUser(user) {
    await secureStorage.setUser(user);
  },

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email) {
    const sanitizedEmail = validators.sanitizeEmail(email);
    
    if (!validators.isValidEmail(sanitizedEmail)) {
      throw new Error('Formato de correo electrónico inválido');
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.forgotPassword, {
        correo: sanitizedEmail,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      throw new Error(message);
    }
  },

  /**
   * Resetear contraseña
   */
  async resetPassword(token, newPassword) {
    const passwordValidation = validators.isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.resetPassword, {
        token,
        nueva_contrasena: newPassword,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      throw new Error(message);
    }
  },

  /**
   * Login con Google usando credential JWT (para Web)
   * @param {string} credential - JWT credential token de Google
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async loginWithGoogleCredential(credential) {
    try {
      const response = await apiClient.post(api.endpoints.auth.googleWeb, {
        credential,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al autenticar con Google');
      }

      const { token, refresh_token, user, session_id } = response.data;

      // Guardar tokens y usuario
      await secureStorage.setAccessToken(token);
      if (refresh_token) {
        await secureStorage.setRefreshToken(refresh_token);
      }
      if (session_id) {
        await secureStorage.setSessionId(session_id);
      }

      const userWithRoles = {
        ...user,
        role: user.roles?.[0] || 'usuario',
        roles: user.roles || ['usuario'],
      };

      await secureStorage.setUser(userWithRoles);

      return { token, refresh_token, user: userWithRoles, success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      throw new Error(message);
    }
  },

  /**
   * Login con Google usando access token (para Móvil - legacy)
   * @param {string} accessToken - Access token de Google
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async loginWithGoogle(accessToken) {
    try {
      const response = await apiClient.post(api.endpoints.auth.googleLogin, {
        access_token: accessToken,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al autenticar con Google');
      }

      const { token, refresh_token, user, session_id } = response.data;

      await secureStorage.setAccessToken(token);
      if (refresh_token) {
        await secureStorage.setRefreshToken(refresh_token);
      }
      if (session_id) {
        await secureStorage.setSessionId(session_id);
      }

      const userWithRoles = {
        ...user,
        role: user.roles?.[0] || 'usuario',
        roles: user.roles || ['usuario'],
      };

      await secureStorage.setUser(userWithRoles);

      return { token, refresh_token, user: userWithRoles, success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      throw new Error(message);
    }
  },
};

export default authService;
