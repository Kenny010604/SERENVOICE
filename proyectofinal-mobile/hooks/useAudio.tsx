// hooks/useAudio.tsx
import { useState } from "react";
import { Config, ApiEndpoints } from "../constants";

/* =========================
   Tipos
========================= */
export type EmotionMap = {
  [key: string]: number;
};

export type AudioResult = {
  success: boolean;
  mode: "authenticated" | "guest_test";

  emotions: EmotionMap;
  confidence: number;
  duration: number;

  // 🔥 calculados en frontend
  nivel_estres: number;
  nivel_ansiedad: number;

  audio_id?: number;
  analisis_id?: number;
  resultado_id?: number;
  recomendaciones?: any[];
  features?: any;
  timestamp: string;
};

export type HistorialItem = {
  id_analisis: number;
  id_audio: number;
  fecha_analisis: string;
  duracion_audio: number;
  nombre_archivo: string;
  estado: string;
  nivel_estres?: number;
  nivel_ansiedad?: number;
  confianza?: number;
  emociones?: EmotionMap;
  recomendaciones?: any[];
};

/* =========================
   Hook
========================= */
export function useAudio() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AudioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     Calcular estrés / ansiedad
  ========================= */
  const calcularNiveles = (emotions: EmotionMap) => {
    const nivel_estres = Math.max(
      emotions["estrés"] ?? emotions["estres"] ?? 0,
      (emotions["enojo"] ?? 0) * 0.6,
      (emotions["sorpresa"] ?? 0) * 0.4
    );

    const nivel_ansiedad = Math.max(
      emotions["ansiedad"] ?? 0,
      (emotions["miedo"] ?? 0) * 0.6,
      (emotions["tristeza"] ?? 0) * 0.4
    );

    return {
      nivel_estres: Number(nivel_estres.toFixed(2)),
      nivel_ansiedad: Number(nivel_ansiedad.toFixed(2)),
    };
  };

  /* =========================
     Analizar audio
  ========================= */
  const analizar = async (
    uri: string,
    duration = 0,
    userId: number | null = null,
    token: string | null = null
  ): Promise<{ success: boolean; data?: AudioResult }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎵 useAudio.analizar - Inicio');
      console.log('📁 URI:', uri);
      console.log('⏱️ Duración:', duration);
      console.log('👤 User ID:', userId);
      console.log('🔑 Token:', token ? 'Presente ✅' : 'Ausente ❌');

      /* =========================
         Preparar archivo
      ========================= */
      let audioFile: any;

      if (uri.startsWith("blob:")) {
        // 🌐 WEB (blob -> File REAL)
        console.log('🌐 Detectado blob URL (WEB)');
        const res = await fetch(uri);
        const blob = await res.blob();
        console.log('📦 Blob obtenido:', blob.type, blob.size, 'bytes');

        audioFile = new File([blob], "audio.webm", {
          type: "audio/webm",
        });
        console.log('📄 File creado:', audioFile.name, audioFile.type);
      } else {
        // 📱 MOBILE (Expo / React Native)
        console.log('📱 Detectado URI local (MOBILE)');
        audioFile = {
          uri,
          type: "audio/webm",
          name: "audio.webm",
        };
        console.log('📦 Audio file object:', audioFile);
      }

      /* =========================
         FormData (CLAVE)
      ========================= */
      const formData = new FormData();
      formData.append("audio", audioFile as any);
      formData.append("duration", duration.toString());

      if (userId) {
        formData.append("user_id", userId.toString());
      }

      console.log('📤 FormData preparado');

      /* =========================
         Headers
      ========================= */
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.log('📡 Headers:', headers);

      /* =========================
         Request
      ========================= */
      const url = `${Config.API_URL}${ApiEndpoints.AUDIO.ANALYZE}`;
      console.log('🚀 Enviando request a:', url);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      console.log('📊 Status respuesta:', response.status, response.statusText);

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Respuesta de error:', text);
        throw new Error(`Error ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('📥 Respuesta exitosa:', data);

      if (!data.success) {
        throw new Error(data.error || "Error en el análisis");
      }

      /* =========================
         Mapear emociones
      ========================= */
      const mappedEmotions: EmotionMap = {};

      if (Array.isArray(data.emotions)) {
        console.log('🎭 Mapeando emociones:', data.emotions);
        data.emotions.forEach((e: any) => {
          const emotionName = e.name.toLowerCase();
          const emotionValue = Number(e.value);
          mappedEmotions[emotionName] = emotionValue;
          console.log(`  - ${emotionName}: ${emotionValue}`);
        });
      }

      /* =========================
         Calcular niveles
      ========================= */
      const niveles = calcularNiveles(mappedEmotions);
      console.log('📈 Niveles calculados:', niveles);

      const result: AudioResult = {
        ...data,
        emotions: mappedEmotions,
        ...niveles,
      };

      console.log('✅ Resultado final:', result);
      setResultado(result);
      return { success: true, data: result };

    } catch (err: any) {
      console.error("❌ Error análisis audio:", err);
      console.error("❌ Stack:", err.stack);
      setError(err.message || "Error en el análisis");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Obtener historial
  ========================= */
  const obtenerHistorial = async (
    userId: number,
    token: string
  ): Promise<{ success: boolean; data?: HistorialItem[] }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('📜 Obteniendo historial para user:', userId);

      const url = `${Config.API_URL}${ApiEndpoints.AUDIO.ANALYZE}?user_id=${userId}`;
      console.log('🚀 Request a:', url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('📊 Status respuesta:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Error:', text);
        throw new Error(`Error ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('📥 Historial recibido:', data);

      if (!data.success) {
        throw new Error(data.error || "Error al obtener historial");
      }

      return { success: true, data: data.historial || [] };

    } catch (err: any) {
      console.error("❌ Error obtener historial:", err);
      setError(err.message || "Error al obtener historial");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Obtener detalle de análisis
  ========================= */
  const obtenerDetalle = async (
    analisisId: number,
    token: string
  ): Promise<{ success: boolean; data?: any }> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Obteniendo detalle de análisis:', analisisId);

      const url = `${Config.API_URL}/api/analisis/${analisisId}`;
      console.log('🚀 Request a:', url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('📊 Status respuesta:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Error:', text);
        throw new Error(`Error ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('📥 Detalle recibido:', data);

      if (!data.success) {
        throw new Error(data.error || "Error al obtener detalle");
      }

      return { success: true, data: data.analisis };

    } catch (err: any) {
      console.error("❌ Error obtener detalle:", err);
      setError(err.message || "Error al obtener detalle");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    analizar,
    obtenerHistorial,
    obtenerDetalle,
    resultado,
    loading,
    error,
  };
}