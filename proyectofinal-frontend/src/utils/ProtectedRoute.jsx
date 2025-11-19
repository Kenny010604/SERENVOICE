import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const auth = useAuth();
  const location = useLocation();

  // If no token, redirect to login
  if (!auth || !auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a role is required, ensure userRole matches
  if (requiredRole) {
    const role = auth.userRole || localStorage.getItem("userRole");
    if (!role || role !== requiredRole) {
      // Optionally redirect to login or to a "not authorized" page
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
