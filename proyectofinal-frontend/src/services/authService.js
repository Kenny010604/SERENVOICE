// src/services/authService.js
import apiClient from "./apiClient";
import api from "../config/api";
import sesionesService from "./sesionesService";
import logger from '../utils/logger';

const authService = {
  publicMode: false, // activar para pruebas públicas

  async login(email, password) {
    if (this.publicMode) {
      logger.log("[authService] Modo público activado: login ignorado");
      return { token: null, user: null };
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.login, { correo: email, contrasena: password });
      if (!response.data.success) throw new Error(response.data.error || "Credenciales incorrectas");

      const { token, user } = response.data;
      const session_id = response.data.session_id || null;
      
      // Manejar roles como array
      const userWithRole = { 
        ...user, 
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "usuario",
        roles: user.roles || ["usuario"]
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      if (session_id) localStorage.setItem("session_id", session_id);
      return { token, user: userWithRole };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async register(userData) {
    if (this.publicMode) {
      logger.log("[authService] Modo público activado: registro ignorado");
      return { token: null, user: null };
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.register, {
        nombre: userData.nombres || userData.nombre,
        apellido: userData.apellidos || userData.apellido,
        correo: userData.correo,
        contrasena: userData.contrasena,
        genero: userData.genero,
        // Usar solo `fecha_nacimiento` para coincidir con la BD
        fecha_nacimiento: userData.fecha_nacimiento || null
      });

      if (!response.data.success) throw new Error(response.data.error || "Error al registrar usuario");

      // El backend ahora retorna requiresVerification en lugar de token
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async registerWithPhoto(formData) {
    if (this.publicMode) {
      logger.log("[authService] Modo público activado: registro ignorado");
      return { token: null, user: null };
    }

    try {
      // No especificar Content-Type, axios lo detectará automáticamente para FormData
      const response = await apiClient.post(api.endpoints.auth.register, formData);

      if (!response.data.success) throw new Error(response.data.error || "Error al registrar usuario");

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async logout() {
    if (this.publicMode) return;
    try {
      const sessionId = localStorage.getItem("session_id");
      logger.debug('[authService] logout called, session_id=', sessionId);
      if (sessionId) {
        try {
          logger.debug('[authService] attempting to close remote session', sessionId);
          await sesionesService.closeSession(sessionId);
          logger.debug('[authService] remote session closed successfully');
        } catch (e) {
          logger.warn("Error cerrando sesión remota:", e);
        }
      } else {
        logger.debug('[authService] no session_id found in localStorage — attempting to close all active sessions');
        try {
          await sesionesService.closeAllSessions();
          logger.debug('[authService] closeAllSessions succeeded');
        } catch (e) {
          logger.warn('[authService] closeAllSessions failed:', e);
        }
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("session_id");
    }
  },

  getToken() {
    if (this.publicMode) return null;
    return localStorage.getItem("token");
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
    return !this.publicMode && !!localStorage.getItem("user");
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
      logger.log("[authService] Modo público activado: Google Auth ignorado");
      return { token: null, user: null };
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.google, googleData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || "Error en autenticación de Google");
      }

      const { token, user } = response.data;
      
      // Manejar roles como array
      const userWithRole = { 
        ...user, 
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "usuario",
        roles: user.roles || ["usuario"]
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      if (response.data.session_id) localStorage.setItem("session_id", response.data.session_id);
      return { token, user: userWithRole };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }
};

export default authService;
