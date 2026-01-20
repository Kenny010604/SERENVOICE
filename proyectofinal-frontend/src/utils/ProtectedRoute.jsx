// src/utils/ProtectedRoute.jsx
import React, { useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/authContextDef";
import secureStorage from "./secureStorage";
import logger from './logger';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);
  
  useEffect(() => {
    logger.debug("[DEBUG] ProtectedRoute montado, verificando usuario...");
  }, []);
  
  const hasToken = secureStorage.hasValidToken();
  
  logger.debug("[DEBUG] Loading:", loading);
  logger.debug("[DEBUG] Usuario obtenido:", user);
  logger.debug("[DEBUG] Token válido:", hasToken);
  logger.debug("[DEBUG] Rol requerido:", requiredRole, ", usuario tiene:", user?.role);

  // ESPERAR a que AuthContext termine de cargar
  if (loading) {
    logger.debug("[DEBUG] AuthContext cargando... esperando");
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: 'var(--color-text-main, #000)'
    }}>Verificando sesión...</div>;
  }

  // Verificar DESPUÉS de que cargue si hay token válido
  if (!hasToken || !user) {
    logger.debug("[DEBUG] Sin token o sin usuario → redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = (user.role || '').toString().toLowerCase();
    const reqRole = (requiredRole || '').toString().toLowerCase();
    if (userRole !== reqRole) {
      logger.debug(`[DEBUG] Rol incorrecto → redirigiendo a /`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
