import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./index";

/* =======================
   TIPOS
======================= */

export interface NotificacionesPreferences {
  invitacion_grupo_app: boolean;
  invitacion_grupo_email: boolean;
  invitacion_grupo_push: boolean;

  actividad_grupo_app: boolean;
  actividad_grupo_email: boolean;
  actividad_grupo_push: boolean;

  recomendacion_app: boolean;
  recomendacion_email: boolean;
  recomendacion_push: boolean;

  alerta_critica_app: boolean;
  alerta_critica_email: boolean;
  alerta_critica_push: boolean;

  recordatorio_app: boolean;
  recordatorio_email: boolean;
  recordatorio_push: boolean;

  horario_inicio: string;
  horario_fin: string;

  pausar_notificaciones: boolean;
  fecha_pausa_hasta: string | null;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/* =======================
   HELPERS
======================= */

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/* =======================
   SERVICE
======================= */

const notificacionesService = {
  /* 🔹 Obtener preferencias */
  async getPreferences(): Promise<ApiResponse<NotificacionesPreferences>> {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/notificaciones/preferencias`, {
      method: "GET",
      headers,
    });

    return await res.json();
  },

  /* 🔹 Actualizar preferencias */
  async updatePreferences(
    preferences: NotificacionesPreferences
  ): Promise<ApiResponse> {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/notificaciones/preferencias`, {
      method: "PUT",
      headers,
      body: JSON.stringify(preferences),
    });

    return await res.json();
  },

  /* 🔹 Pausar notificaciones */
  async pauseNotifications(
    horas?: number
  ): Promise<ApiResponse> {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/notificaciones/pausar`, {
      method: "POST",
      headers,
      body: JSON.stringify({ horas }),
    });

    return await res.json();
  },

  /* 🔹 Reanudar notificaciones */
  async resumeNotifications(): Promise<ApiResponse> {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/notificaciones/reanudar`, {
      method: "POST",
      headers,
    });

    return await res.json();
  },
};

export default notificacionesService;
