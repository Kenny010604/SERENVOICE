import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../../constants";
import { LinearGradient } from "expo-linear-gradient";

interface AnalisisData {
  analisis: {
    id_analisis: number;
    fecha_analisis: string;
    estado_analisis: string;
    modelo_usado: string;
    nombre_archivo: string;
    duracion: number;
    fecha_grabacion: string;
    ruta_archivo: string;
  } | null;
  resultado: {
    clasificacion: string;
    confianza_modelo: number;
    nivel_felicidad: number;
    nivel_tristeza: number;
    nivel_enojo: number;
    nivel_estres: number;
    nivel_ansiedad: number;
    nivel_neutral: number;
    nivel_miedo: number;
    nivel_sorpresa: number;
  } | null;
  recomendaciones: Array<{
    titulo?: string;
    tipo_recomendacion?: string;
    descripcion?: string;
    contenido?: string;
    texto?: string;
    tipo?: string;
    origen?: string;
  }>;
}

interface EmotionInfo {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: number;
}

export default function ResultadoDetallado() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalisisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado");
          return;
        }

        const response = await fetch(`${API_URL}/api/analisis/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();
        console.log("[ResultadoDetallado] payload", json);

        if (!response.ok || json?.success === false) {
          throw new Error(json.message || json.error || "Error al obtener detalle");
        }

        const payload = json.data || { analisis: null, resultado: null, recomendaciones: [] };
        setData(payload);
      } catch (e: any) {
        console.error("[ResultadoDetallado] error:", e);
        setError(e.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      Felicidad: "#4CAF50",
      Tristeza: "#2196F3",
      Enojo: "#f44336",
      Estrés: "#ff9800",
      Ansiedad: "#9c27b0",
      Neutral: "#9e9e9e",
      Miedo: "#7e22ce",
      Sorpresa: "#00bcd4",
    };
    return colors[emotion] || "#9e9e9e";
  };

  const getEmotionIcon = (emotion: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      Felicidad: "happy-outline",
      Tristeza: "sad-outline",
      Enojo: "flame-outline",
      Estrés: "pulse-outline",
      Ansiedad: "alert-circle-outline",
      Neutral: "remove-outline",
      Miedo: "skull-outline",
      Sorpresa: "eye-outline",
    };
    return icons[emotion] || "help-outline";
  };

  const getNumericValue = (val: any): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : Math.round(num * 10) / 10;
  };

  const getPrioridadColor = (prioridad: string): string => {
    switch (prioridad) {
      case "alta":
        return "#d32f2f";
      case "media":
        return "#ff9800";
      case "baja":
        return "#4caf50";
      default:
        return "#6c8ba3";
    }
  };

  const getTipoIcon = (tipo: string): keyof typeof Ionicons.glyphMap => {
    const t = (tipo || "").toString().toLowerCase();
    switch (t) {
      case "respiracion":
        return "fitness-outline";
      case "pausa_activa":
        return "pause-circle-outline";
      case "meditacion":
        return "leaf-outline";
      case "ejercicio":
        return "barbell-outline";
      case "profesional":
        return "medkit-outline";
      case "habito":
        return "cafe-outline";
      default:
        return "bulb-outline";
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4dd4ac" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={60} color="#ff9800" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={60} color="#6c8ba3" />
          <Text style={styles.errorText}>No se encontraron datos para este análisis</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Preparar emociones
  const emociones: EmotionInfo[] = data.resultado
    ? [
        { name: "Felicidad", icon: getEmotionIcon("Felicidad"), color: getEmotionColor("Felicidad"), value: getNumericValue(data.resultado.nivel_felicidad) },
        { name: "Tristeza", icon: getEmotionIcon("Tristeza"), color: getEmotionColor("Tristeza"), value: getNumericValue(data.resultado.nivel_tristeza) },
        { name: "Enojo", icon: getEmotionIcon("Enojo"), color: getEmotionColor("Enojo"), value: getNumericValue(data.resultado.nivel_enojo) },
        { name: "Estrés", icon: getEmotionIcon("Estrés"), color: getEmotionColor("Estrés"), value: getNumericValue(data.resultado.nivel_estres) },
        { name: "Ansiedad", icon: getEmotionIcon("Ansiedad"), color: getEmotionColor("Ansiedad"), value: getNumericValue(data.resultado.nivel_ansiedad) },
        { name: "Neutral", icon: getEmotionIcon("Neutral"), color: getEmotionColor("Neutral"), value: getNumericValue(data.resultado.nivel_neutral) },
        { name: "Miedo", icon: getEmotionIcon("Miedo"), color: getEmotionColor("Miedo"), value: getNumericValue(data.resultado.nivel_miedo) },
        { name: "Sorpresa", icon: getEmotionIcon("Sorpresa"), color: getEmotionColor("Sorpresa"), value: getNumericValue(data.resultado.nivel_sorpresa) },
      ]
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#1e3c72", "#2a5298", "#4a90e2"]} style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resultado Detallado</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Detalles del Análisis */}
        {data.analisis && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={22} color="#4dd4ac" />
              <Text style={styles.sectionTitle}>Detalles del Análisis</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.detailsGrid}>
                {data.analisis.fecha_analisis && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Fecha del análisis</Text>
                    <Text style={styles.detailValue}>{formatDate(data.analisis.fecha_analisis)}</Text>
                  </View>
                )}

                {data.analisis.estado_analisis && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Estado</Text>
                    <View style={[styles.statusBadge, { backgroundColor: data.analisis.estado_analisis === "completado" ? "#4CAF50" : "#ff9800" }]}>
                      <Text style={styles.statusText}>{data.analisis.estado_analisis}</Text>
                    </View>
                  </View>
                )}

                {data.analisis.modelo_usado && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Modelo</Text>
                    <Text style={styles.detailValue}>{data.analisis.modelo_usado}</Text>
                  </View>
                )}

                {data.analisis.duracion !== undefined && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Duración</Text>
                    <Text style={styles.detailValue}>{data.analisis.duracion}s</Text>
                  </View>
                )}

                {data.resultado?.clasificacion && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Clasificación</Text>
                    <Text style={[styles.detailValue, { color: "#4dd4ac", fontWeight: "700" }]}>{data.resultado.clasificacion}</Text>
                  </View>
                )}

                {data.resultado?.confianza_modelo && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Confianza</Text>
                    <Text style={styles.detailValue}>{data.resultado.confianza_modelo}%</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Niveles Emocionales */}
        {data.resultado && emociones.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={22} color="#4dd4ac" />
              <Text style={styles.sectionTitle}>Niveles Emocionales</Text>
            </View>

            <View style={styles.emotionsGrid}>
              {emociones.map((emo, idx) => (
                <View key={idx} style={[styles.emotionCard, { borderColor: emo.color }]}>
                  <View style={[styles.emotionIconContainer, { backgroundColor: `${emo.color}20` }]}>
                    <Ionicons name={emo.icon} size={28} color={emo.color} />
                  </View>
                  <Text style={[styles.emotionName, { color: emo.color }]}>{emo.name}</Text>
                  <Text style={styles.emotionValue}>{emo.value.toFixed(1)}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, emo.value)}%`, backgroundColor: emo.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recomendaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={22} color="#4dd4ac" />
            <Text style={styles.sectionTitle}>Recomendaciones Personalizadas</Text>
          </View>

          {data.recomendaciones && data.recomendaciones.length > 0 ? (
            <View style={styles.recommendationsContainer}>
              {data.recomendaciones.map((rec, idx) => {
                const titulo = rec.titulo || (rec.tipo_recomendacion ? rec.tipo_recomendacion.charAt(0).toUpperCase() + rec.tipo_recomendacion.slice(1) : `Recomendación ${idx + 1}`);
                const texto = rec.descripcion || rec.contenido || rec.texto || "";
                const tipo = (rec.tipo_recomendacion || rec.tipo || "").toString().toLowerCase();
                const prioridad = tipo === "profesional" ? "alta" : "media";
                const icon = getTipoIcon(tipo);

                return (
                  <View key={idx} style={[styles.recommendationCard, { borderLeftColor: getPrioridadColor(prioridad) }]}>
                    <View style={styles.recommendationHeader}>
                      <View style={styles.recommendationTitleRow}>
                        <Ionicons name={icon} size={24} color="#4dd4ac" />
                        <Text style={styles.recommendationTitle}>{titulo}</Text>
                        {rec.origen === "ia" && (
                          <View style={styles.iaBadge}>
                            <Text style={styles.iaBadgeText}>IA</Text>
                          </View>
                        )}
                      </View>
                      <View style={[styles.prioridadBadge, { backgroundColor: getPrioridadColor(prioridad) }]}>
                        <Text style={styles.prioridadText}>{prioridad.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.recommendationText}>{texto}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No hay recomendaciones registradas para este análisis.</Text>
            </View>
          )}
        </View>

        {/* Botón Volver */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(auth)/PaginaUsuario/historial")}>
            <Ionicons name="time-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Ver Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/(auth)/PaginaUsuario/Dashboard")}>
            <Ionicons name="home-outline" size={20} color="#4dd4ac" />
            <Text style={styles.secondaryButtonText}>Ir al Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2537",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#b8c5d0",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#b8c5d0",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#4dd4ac",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  card: {
    backgroundColor: "#1a3a52",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  detailItem: {
    width: "45%",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: "#b8c5d0",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emotionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  emotionCard: {
    backgroundColor: "#1a3a52",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 5,
  },
  emotionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emotionName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  emotionValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#0f2537",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: "#1a3a52",
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  recommendationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  iaBadge: {
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#64b5f6",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  iaBadgeText: {
    fontSize: 10,
    color: "#1565c0",
    fontWeight: "600",
  },
  prioridadBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  prioridadText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  recommendationText: {
    fontSize: 14,
    color: "#b8c5d0",
    lineHeight: 20,
  },
  emptyText: {
    color: "#6c8ba3",
    fontSize: 14,
    textAlign: "center",
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4dd4ac",
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4dd4ac",
  },
  secondaryButtonText: {
    color: "#4dd4ac",
    fontSize: 16,
    fontWeight: "600",
  },
});
