// services/adminUsuarios.js
import { useState, useEffect } from "react";
import apiClient from "./apiClient";

/**
 * Custom hook para obtener la lista de usuarios desde /admin/usuarios
 */
export const useAdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/admin/usuarios");
      if (response.data.success) {
        setUsuarios(response.data.usuarios);
      } else {
        setError(response.data.error || "Error al obtener usuarios");
      }
    } catch (err) {
      console.error("❌ Error fetching usuarios:", err);
      setError(err.message || "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return { usuarios, loading, error, refresh: fetchUsuarios };
};
