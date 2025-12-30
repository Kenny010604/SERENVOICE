// src/utils/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";
import logger from './logger';

const ProtectedRoute = ({ children, requiredRole }) => {
  useEffect(() => {
    logger.debug("[DEBUG] ProtectedRoute montado, verificando usuario...");
  }, []);
  const user = authService.getUser();
  logger.debug("[DEBUG] Usuario obtenido de authService:", user);
  logger.debug("[DEBUG] Rol requerido:", requiredRole, ", usuario tiene:", user?.role);

  if (!user) {
    logger.debug("[DEBUG] No hay usuario → redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    logger.debug(`[DEBUG] Rol incorrecto → redirigiendo a /`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
