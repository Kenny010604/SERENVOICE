// src/utils/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children, requiredRole }) => {
  useEffect(() => {
    console.log("[DEBUG] ProtectedRoute montado, verificando usuario...");
  }, []);

  const user = authService.getUser();
  console.log("[DEBUG] Usuario obtenido de authService:", user);
  console.log("[DEBUG] Rol requerido:", requiredRole, ", usuario tiene:", user?.role);

  if (!user) {
    console.log("[DEBUG] No hay usuario → redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`[DEBUG] Rol incorrecto → redirigiendo a /`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
