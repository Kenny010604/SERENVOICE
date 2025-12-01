import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const user = authService.getUser();

  // No logueado
  if (!authService.isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.rol?.toLowerCase();

  // Si requiere rol pero no coincide
  if (requiredRole && role !== requiredRole.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
