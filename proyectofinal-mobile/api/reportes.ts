import api from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "/api/reportes";

// Helper para obtener token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface EmotionData {
  emocion_principal: string;
  cantidad: number;
}

export interface TendenciaItem {
  fecha?: string;
  mes?: string;
  estres: number;
  ansiedad: number;
  cantidad?: number;
  total_analisis?: number;
  promedio_estres?: number;
  promedio_ansiedad?: number;
}

export interface AnalisisItem {
  id_resultado: number;
  id_analisis: number;
  nivel_estres: number;
  nivel_ansiedad: number;
  emocion_principal: string;
  clasificacion: string;
  fecha_analisis: string;
  nombre_archivo?: string;
}

export interface ActividadHoraria {
  hora: number;
  cantidad: number;
}

export interface ActividadSemanal {
  dia: number;
  cantidad: number;
}

export interface ReporteCompleto {
  usuario: {
    nombre: string;
    apellido: string;
    correo: string;
    fecha_registro: string;
    foto_perfil?: string;
  };
  resumen: {
    total_analisis: number;
    promedio_estres: number;
    promedio_ansiedad: number;
    max_estres: number;
    max_ansiedad: number;
    min_estres: number;
    min_ansiedad: number;
  };
  emociones: EmotionData[];
  clasificaciones: Record<string, number>;
  tendencia_diaria: TendenciaItem[];
  tendencia_mensual: TendenciaItem[];
  ultimos_analisis: AnalisisItem[];
  actividad_horaria: ActividadHoraria[];
  actividad_semanal: ActividadSemanal[];
  juegos: {
    total: number;
    completados: number;
    promedio_puntuacion: number;
  };
  grupos: number;
  recomendaciones: {
    total: number;
    aplicadas: number;
  };
  alertas: {
    total: number;
    criticas: number;
  };
}

const reportesApi = {
  /**
   * Obtener reporte completo del usuario actual
   */
  obtenerReporteCompleto: async (): Promise<ReporteCompleto> => {
    const headers = await getAuthHeader();
    const res = await api.get(`${BASE}/mi-reporte-completo`, { headers });
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message || "Error al obtener reporte");
  },

  /**
   * Obtener mis reportes guardados
   */
  misReportes: async () => {
    const headers = await getAuthHeader();
    const res = await api.get(`${BASE}/my-reports`, { headers });
    return res.data;
  },

  /**
   * Generar nuevo reporte
   */
  generarReporte: async (data: {
    fecha_inicio: string;
    fecha_fin: string;
    formato?: string;
  }) => {
    const headers = await getAuthHeader();
    const res = await api.post(`${BASE}/generate`, data, { headers });
    return res.data;
  },
};

export default reportesApi;
