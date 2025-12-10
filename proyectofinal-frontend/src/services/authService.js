// src/services/authService.js
import apiClient from "./apiClient";
import api from "../config/api";

const authService = {
  publicMode: false, // activar para pruebas públicas

  async login(email, password) {
    if (this.publicMode) {
      console.log("[authService] Modo público activado: login ignorado");
      return { token: null, user: null };
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.login, { correo: email, contrasena: password });
      if (!response.data.success) throw new Error(response.data.error || "Credenciales incorrectas");

      const { token, user } = response.data;
      const userWithRole = { ...user, role: user.role || (user.roles?.[0] || "usuario") };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      return { token, user: userWithRole };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  async register(userData) {
    if (this.publicMode) {
      console.log("[authService] Modo público activado: registro ignorado");
      return { token: null, user: null };
    }

    try {
      const response = await apiClient.post(api.endpoints.auth.register, {
        nombre: userData.nombres || userData.nombre,
        apellido: userData.apellidos || userData.apellido,
        correo: userData.correo,
        contrasena: userData.contrasena,
        genero: userData.genero,
        fechaNacimiento: userData.fecha_nacimiento
      });

      if (!response.data.success) throw new Error(response.data.error || "Error al registrar usuario");

      const { token, user } = response.data;
      const userWithRole = { ...user, role: user.role || (user.roles?.[0] || "usuario") };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userWithRole));
      return { token, user: userWithRole };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  logout() {
    if (this.publicMode) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

  isAuthenticated() {
    return !this.publicMode && !!localStorage.getItem("user");
  },

  setUser(updatedUser) {
    if (this.publicMode) return;
    const userWithRole = { ...updatedUser, role: updatedUser.role || (updatedUser.roles?.[0] || "usuario") };
    localStorage.setItem("user", JSON.stringify(userWithRole));
  }
};

export default authService;
