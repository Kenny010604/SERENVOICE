// src/services/authService.js
import apiClient from "./apiClient";
import api from "../config/api";
import sesionesService from "./sesionesService";
import secureLogger from '../utils/secureLogger';
import secureStorage from '../utils/secureStorage';
import { sanitizeEmail, sanitizeName } from '../utils/sanitize';

const authService = {
  publicMode: false, // activar para pruebas públicas

  async login(email, password) {
    if (this.publicMode) {
      secureLogger.debug("[authService] Modo público activado: login ignorado");
      return { token: null, user: null };
    }

    // Sanitizar email antes de enviar
    const { sanitized: sanitizedEmail, valid } = sanitizeEmail(email);
    if (!valid) {
      throw new Error("Formato de correo electrónico inválido");
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.login, { 
        correo: sanitizedEmail, 
        contrasena: password // No sanitizar contraseñas
      });
      
      if (!response.data.success) throw new Error(response.data.error || "Credenciales incorrectas");

      const { token, refresh_token, user } = response.data;
      const session_id = response.data.session_id || null;
      
      // Manejar roles como array
      const userWithRole = { 
        ...user, 
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "usuario",
        roles: user.roles || ["usuario"]
      };

      // Guardar token en almacenamiento seguro (memoria)
      secureStorage.setAccessToken(token);
      if (refresh_token) {
        secureStorage.setRefreshToken(refresh_token);
      }
      
      // También en localStorage para compatibilidad durante migración
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      if (session_id) localStorage.setItem("session_id", session_id);
      
      secureLogger.info('Login exitoso');
      return { token, refresh_token, user: userWithRole };
    } catch (error) {
      secureLogger.warn('Login fallido');
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async register(userData) {
    if (this.publicMode) {
      secureLogger.debug("[authService] Modo público activado: registro ignorado");
      return { token: null, user: null };
    }

    // Sanitizar datos de entrada
    const { sanitized: sanitizedEmail, valid } = sanitizeEmail(userData.correo);
    if (!valid) {
      throw new Error("Formato de correo electrónico inválido");
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.register, {
        nombre: sanitizeName(userData.nombres || userData.nombre),
        apellido: sanitizeName(userData.apellidos || userData.apellido),
        correo: sanitizedEmail,
        contrasena: userData.contrasena, // No sanitizar contraseñas
        genero: userData.genero,
        fecha_nacimiento: userData.fecha_nacimiento || null
      });

      if (!response.data.success) throw new Error(response.data.error || "Error al registrar usuario");

      secureLogger.info('Registro exitoso');
      return response.data;
    } catch (error) {
      secureLogger.warn('Registro fallido');
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async registerWithPhoto(formData) {
    if (this.publicMode) {
      secureLogger.debug("[authService] Modo público activado: registro ignorado");
      return { token: null, user: null };
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.register, formData);

      if (!response.data.success) throw new Error(response.data.error || "Error al registrar usuario");

      secureLogger.info('Registro con foto exitoso');
      return response.data;
    } catch (error) {
      secureLogger.warn('Registro con foto fallido');
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async logout() {
    if (this.publicMode) return;
    try {
      const sessionId = localStorage.getItem("session_id");
      secureLogger.debug('[authService] logout called');
      
      if (sessionId) {
        try {
          secureLogger.debug('[authService] attempting to close remote session');
          await sesionesService.closeSession(sessionId);
          secureLogger.debug('[authService] remote session closed successfully');
        } catch (e) {
          secureLogger.warn("Error cerrando sesión remota");
        }
      } else {
        secureLogger.debug('[authService] no session_id found — attempting to close all active sessions');
        try {
          await sesionesService.closeAllSessions();
          secureLogger.debug('[authService] closeAllSessions succeeded');
        } catch (e) {
          secureLogger.warn('[authService] closeAllSessions failed');
        }
      }
    } finally {
      // Limpiar almacenamiento seguro
      secureStorage.clearTokens();
      
      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("session_id");
      
      secureLogger.info('Logout completado');
    }
  },

  getToken() {
    if (this.publicMode) return null;
    // Preferir token de memoria segura
    return secureStorage.getAccessToken() || localStorage.getItem("token");
  },

  getUser() {
    if (this.publicMode) return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getCurrentUser() {
    return this.getUser();
  },

  isAuthenticated() {
    if (this.publicMode) return false;
    // Verificar tanto memoria segura como localStorage
    return secureStorage.hasValidToken() || !!localStorage.getItem("token");
  },

  setUser(updatedUser) {
    if (this.publicMode) return;
    const userWithRole = { 
      ...updatedUser, 
      role: updatedUser.role || (updatedUser.roles?.[0] || "usuario"),
      roles: updatedUser.roles || ["usuario"]
    };
    localStorage.setItem("user", JSON.stringify(userWithRole));
  },

  // Método para autenticación con Google
  async googleAuth(googleData) {
    if (this.publicMode) {
      secureLogger.debug("[authService] Modo público activado: Google Auth ignorado");
      return { token: null, user: null };
    }

    try {
      // Sanitizar datos de Google
      const sanitizedData = {
        google_uid: googleData.google_uid,
        correo: sanitizeEmail(googleData.correo).sanitized,
        nombre: sanitizeName(googleData.nombre || ''),
        apellido: sanitizeName(googleData.apellido || ''),
        foto_perfil: googleData.foto_perfil || '',
        fecha_nacimiento: googleData.fecha_nacimiento,
        genero: googleData.genero
      };

      const response = await apiClient.post(api.endpoints.auth.google, sanitizedData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || "Error en autenticación de Google");
      }

      const { token, refresh_token, user } = response.data;
      
      // Manejar roles como array
      const userWithRole = { 
        ...user, 
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "usuario",
        roles: user.roles || ["usuario"]
      };

      // Guardar en almacenamiento seguro
      secureStorage.setAccessToken(token);
      if (refresh_token) {
        secureStorage.setRefreshToken(refresh_token);
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      if (response.data.session_id) localStorage.setItem("session_id", response.data.session_id);
      
      secureLogger.info('Google Auth exitoso');
      return { token, refresh_token, user: userWithRole };
    } catch (error) {
      secureLogger.warn('Google Auth fallido');
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  // Verificar si el token está por expirar
  isTokenExpiringSoon() {
    return secureStorage.isTokenExpiringSoon();
  },

  // Refrescar token manualmente
  async refreshToken() {
    const currentRefreshToken = secureStorage.getRefreshToken();
    if (!currentRefreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.refresh || '/auth/refresh', {}, {
        headers: { 'Authorization': `Bearer ${currentRefreshToken}` }
      });

      if (response.data.token) {
        secureStorage.setAccessToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        secureLogger.debug('Token refrescado exitosamente');
        return response.data.token;
      }
      
      throw new Error('No se recibió nuevo token');
    } catch (error) {
      secureLogger.warn('Error refrescando token');
      throw error;
    }
  }
};

export default authService;
