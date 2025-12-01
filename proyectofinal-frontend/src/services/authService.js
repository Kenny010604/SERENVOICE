// src/services/authService.js
import apiClient from "./apiClient";
import api from "../config/api";

const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post(api.endpoints.auth.login, {
        correo: email,
        contrasena: password
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Credenciales incorrectas");
      }

      const { token, user } = response.data;

      // Guardar usuario TAL CUAL VIENE DEL BACKEND
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      );
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post(api.endpoints.auth.register, {
        nombres: userData.nombre,
        apellidos: userData.apellido,
        correo: userData.correo,
        contrasena: userData.contrasena,
        genero: userData.genero,
        fechaNacimiento: userData.fechaNacimiento
      });

      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }
};

export default authService;
