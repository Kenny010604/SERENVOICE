import { useState } from "react";
import API from "../api/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const useAnalisis = () => {
  const [loading, setLoading] = useState(false);

  // ============================
  // 🔵 Obtener historial
  // ============================
  const getHistory = async (limit: number = 10): Promise<ApiResponse<any[]>> => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const response = await API.get(
        `/api/analisis/history?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error: any) {
      console.error("❌ Error getHistory:", error);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al cargar historial",
      };
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 🔵 Obtener análisis por ID
  // ============================
  const getAnalisisById = async (
    id_analisis: number
  ): Promise<ApiResponse<any>> => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const response = await API.get(
        `/api/analisis/${id_analisis}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("❌ Error getAnalisisById:", error);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al obtener el análisis",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getHistory,
    getAnalisisById,
  };
};
