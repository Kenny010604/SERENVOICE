import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/config";
import ApiEndpoints from "../../../constants/ApiEndpoints";

interface Recomendacion {
  id_recomendacion: number;
  tipo_recomendacion: string;
  contenido: string;
  aplicada: boolean;
  fecha_creacion: string;
}

const Recomendaciones: React.FC = () => {
  const [recs, setRecs] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token || !user?.id_usuario) {
        Alert.alert("Error", "Debes iniciar sesión");
        return;
      }

      const response = await api.get(
        ApiEndpoints.RECOMMENDATIONS.LIST,
        {
          params: { user_id: user.id_usuario },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📦 Response recomendaciones:", response.data);

      if (response.data?.success) {
        // La respuesta viene en response.data.data.recomendaciones
        const recomendacionesData = response.data.data?.recomendaciones || [];
        setRecs(recomendacionesData);
        console.log("✅ Recomendaciones cargadas:", recomendacionesData);
      }
    } catch (error) {
      console.error("❌ Error cargar recomendaciones:", error);
      Alert.alert("Error", "No se pudieron cargar las recomendaciones");
    } finally {
      setLoading(false);
    }
  };

  const markApplied = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Optimistic update
      setRecs((prev) =>
        prev.map((r) =>
          r.id_recomendacion === id ? { ...r, aplicada: true } : r
        )
      );

      await api.post(
        ApiEndpoints.RECOMMENDATIONS.APPLY.replace(":id", id.toString()),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("❌ Error marcar recomendación:", error);
      cargarRecomendaciones();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart-outline" size={28} color="#4F46E5" />
        <Text style={styles.title}>Recomendaciones</Text>
      </View>

      <Text style={styles.subtitle}>
        Sigue las recomendaciones personalizadas generadas por el sistema.
      </Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={cargarRecomendaciones}
      >
        <Text style={styles.refreshText}>🔄 Refrescar</Text>
      </TouchableOpacity>

      {recs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            No hay recomendaciones disponibles todavía.
          </Text>
        </View>
      ) : (
        recs.map((r) => (
          <View key={r.id_recomendacion} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>
                {r.tipo_recomendacion.toUpperCase()}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(r.fecha_creacion).toLocaleDateString("es-ES")}
              </Text>
            </View>

            <Text style={styles.cardText}>{r.contenido}</Text>

            <TouchableOpacity
              style={[styles.button, r.aplicada && styles.buttonDisabled]}
              disabled={r.aplicada}
              onPress={() => markApplied(r.id_recomendacion)}
            >
              {r.aplicada && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 6 }}
                />
              )}
              <Text style={styles.buttonText}>
                {r.aplicada ? "Aplicada ✓" : "Marcar como aplicada"}
              </Text>
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

export default Recomendaciones;


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: "#E0E7FF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  refreshText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardType: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4F46E5",
    letterSpacing: 0.5,
  },
  cardDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  cardText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
  },
});
