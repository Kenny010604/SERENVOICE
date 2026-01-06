import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  History,
  Eye,
  Clock,
  Mic,
  AlertTriangle,
} from "lucide-react-native";

import { useAnalisis } from "../../../hooks/useAnalisis";
import { useAuth } from "../../../hooks/useAuth";

interface HistorialItem {
  id: number;
  fecha: string;
  audio: string;
  duracion: string;
  estado: string;
  estres?: number | null;
  ansiedad?: number | null;
}

const Historial: React.FC = () => {
  const { user } = useAuth(); // 👈 usuario logueado
  const { getHistory, loading } = useAnalisis();

  const [history, setHistory] = useState<HistorialItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      cargarHistorial();
    }
  }, [user]);

  const cargarHistorial = async () => {
    try {
      setError(null);

      const res = await getHistory(20); // límite opcional

      if (!res.success) {
        throw new Error(res.error);
      }

      // Mapear los campos del backend a los nombres esperados por el frontend
      const mapped = (res.data || []).map((item: any) => ({
        id: item.id_analisis || item.id || 0,
        fecha: item.fecha_analisis || item.fecha || '',
        audio: item.nombre_archivo || item.audio || '',
        duracion: item.duracion != null ? String(item.duracion) : '',
        estado: item.estado_analisis || item.estado || '',
        estres: typeof item.nivel_estres !== 'undefined' ? Number(item.nivel_estres) : null,
        ansiedad: typeof item.nivel_ansiedad !== 'undefined' ? Number(item.nivel_ansiedad) : null,
      }));
      setHistory(mapped);
    } catch (err: any) {
      console.error("❌ Error historial:", err.message);
      setError("No se pudo cargar el historial del usuario.");
    }
  };

  // =============================
  // 🔄 LOADING
  // =============================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  // =============================
  // ❌ ERROR
  // =============================
  if (error) {
    return (
      <View style={styles.center}>
        <AlertTriangle size={40} color="#F59E0B" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // =============================
  // ✅ UI
  // =============================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <History size={28} color="#4F46E5" />
        <Text style={styles.title}>Historial de Análisis</Text>
      </View>

      <Text style={styles.subtitle}>
        Análisis realizados por {user?.nombre}
      </Text>

      {/* ANÁLISIS BREVE */}
      {history.length > 0 && (() => {
        // Solo tomar valores numéricos válidos
        const isValidNumber = v => typeof v === 'number' && !isNaN(v) && isFinite(v);
        const analizados = history.filter(h => isValidNumber(h.estres) && isValidNumber(h.ansiedad));
        const promEstres = analizados.length
          ? analizados.reduce((sum, h) => sum + Number(h.estres), 0) / analizados.length
          : null;
        const promAnsiedad = analizados.length
          ? analizados.reduce((sum, h) => sum + Number(h.ansiedad), 0) / analizados.length
          : null;
        return (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Resumen Breve</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Promedio Estrés</Text>
                <Text style={styles.summaryValue}>
                  {isValidNumber(promEstres) ? `${promEstres.toFixed(1)}%` : '—'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Promedio Ansiedad</Text>
                <Text style={styles.summaryValue}>
                  {isValidNumber(promAnsiedad) ? `${promAnsiedad.toFixed(1)}%` : '—'}
                </Text>
              </View>
            </View>
          </View>
        );
      })()}

      {history.length === 0 ? (
        <View style={styles.empty}>
          <History size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            No tienes análisis registrados todavía.
          </Text>
        </View>
      ) : (
        history.map((item, index) => (
          <View key={item.id ? `item-${item.id}` : `item-${index}`} style={styles.card}>
            <Text style={styles.date}>{item.fecha}</Text>

            <View style={styles.row}>
              <Mic size={18} color="#6B7280" />
              <Text style={styles.text}>{item.audio}</Text>
            </View>

            <View style={styles.row}>
              <Clock size={18} color="#6B7280" />
              <Text style={styles.text}>
                Duración: {item.duracion}
              </Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.estado}</Text>
            </View>

            {(() => {
              const isValidNumber = v => typeof v === 'number' && !isNaN(v) && isFinite(v);
              if (isValidNumber(item.estres) && isValidNumber(item.ansiedad)) {
                return (
                  <View style={styles.results}>
                    <Text style={styles.resultText}>
                      Estrés: <Text style={styles.bold}>{item.estres}%</Text>
                    </Text>
                    <Text style={styles.resultSub}>
                      Ansiedad: {item.ansiedad}%
                    </Text>
                  </View>
                );
              } else {
                return (
                  <View style={[styles.results, styles.row]}>
                    <AlertTriangle size={16} color="#F59E0B" />
                    <Text style={styles.pendingText}>
                      Análisis en proceso
                    </Text>
                  </View>
                );
              }
            })()}

            <TouchableOpacity style={styles.button}>
              <Eye size={18} color="#FFF" />
              <Text style={styles.buttonText}>Ver detalle</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={styles.footer}>
        © {new Date().getFullYear()} SerenVoice
      </Text>
    </ScrollView>
  );
};

export default Historial;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#F0F4FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  text: {
    color: "#374151",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginVertical: 8,
  },
  badgeText: {
    color: "#4338CA",
    fontWeight: "600",
    fontSize: 12,
  },
  results: {
    marginTop: 8,
  },
  resultText: {
    fontSize: 14,
    color: "#111827",
  },
  resultSub: {
    fontSize: 13,
    color: "#6B7280",
  },
  bold: {
    fontWeight: "bold",
  },
  pendingText: {
    color: "#92400E",
    marginLeft: 6,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#9CA3AF",
    marginTop: 10,
  },
  footer: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 30,
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },
  errorText: {
    marginTop: 10,
    color: "#B45309",
    textAlign: "center",
  },
});
