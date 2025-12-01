import { useState, useEffect } from "react";
import authService from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getCurrentUser();

        // Normalizamos rol
        const normalizedUser = {
          ...userData,
          rol: userData?.rol?.toLowerCase()
        };

        setUser(normalizedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);

    const normalizedUser = {
      ...data.user,
      rol: data.user?.rol?.toLowerCase()
    };

    setUser(normalizedUser);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);

    const normalizedUser = {
      ...data.user,
      rol: data.user?.rol?.toLowerCase()
    };

    setUser(normalizedUser);
    setIsAuthenticated(true);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  };
};
