// src/context/AuthContext.js
// Contexto de autenticación

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import secureStorage from '../utils/secureStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar sesión al iniciar
  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        secureStorage.getAccessToken(),
        secureStorage.getUser(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading stored session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (email, password) => {
    try {
      const result = await authService.login(email, password);
      setToken(result.token);
      setUser(result.user);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Registrar usuario
   */
  const register = useCallback(async (userData) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async () => {
    console.log('[AuthContext] Iniciando logout...');
    try {
      // Intentar cerrar sesión en el backend
      await authService.logout();
      console.log('[AuthContext] Logout en backend exitoso');
    } catch (error) {
      console.error('[AuthContext] Error durante logout en backend:', error);
      // Continuar con el logout local aunque falle el backend
    }
    
    // Limpiar estado local PRIMERO
    console.log('[AuthContext] Limpiando estado local...');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Limpiar almacenamiento seguro
    try {
      console.log('[AuthContext] Limpiando almacenamiento...');
      await secureStorage.clearTokens();
      await secureStorage.removeUser();
      console.log('[AuthContext] Almacenamiento limpiado');
    } catch (storageError) {
      console.error('[AuthContext] Error limpiando almacenamiento:', storageError);
    }
    
    console.log('[AuthContext] Logout completado');
  }, []);

  /**
   * Actualizar datos del usuario
   */
  const updateUser = useCallback(async (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await secureStorage.setUser(updatedUser);
  }, [user]);

  /**
   * Obtener rol del usuario
   */
  const getUserRole = useCallback(() => {
    return user?.role || user?.roles?.[0] || 'usuario';
  }, [user]);

  /**
   * Verificar si tiene un rol específico
   */
  const hasRole = useCallback((role) => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    getUserRole,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
