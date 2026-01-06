import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "../../../constants";

interface UserData {
  id_usuario?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  fecha_nacimiento?: string;
  genero?: string;
  usa_medicamentos?: boolean;
  rol?: string;
  foto_perfil?: string;
  notificaciones?: boolean;
  auth_provider?: string;
}

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [edad, setEdad] = useState<number | string>("—");

  const calcularEdad = (fecha: string | undefined): number | string => {
    if (!fecha) return "—";
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const obtenerGenero = (genero: string | undefined): string => {
    if (!genero) return "No especificado";
    switch (genero.toUpperCase()) {
      case "M":
        return "Masculino";
      case "F":
        return "Femenino";
      case "O":
        return "Otro";
      default:
        return "No especificado";
    }
  };

  const makeFotoUrl = (path: string | undefined): string | null => {
    if (!path) return null;
    const trimmed = String(path).trim();
    const lower = trimmed.toLowerCase();

    try {
      if (lower.startsWith("http://") || lower.startsWith("https://")) {
        return trimmed;
      }
      if (lower.startsWith("//")) {
        return `https:${trimmed}`;
      }
    } catch (e) {
      return null;
    }

    return `${API_URL}${trimmed}`;
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Sesión expirada", "Por favor, inicia sesión nuevamente.");
        router.replace("/(auth)/PaginasPublicas/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar el perfil");
      }

      const data = await response.json();
      setUser(data.usuario);
      if (data.usuario?.fecha_nacimiento) {
        setEdad(calcularEdad(data.usuario.fecha_nacimiento));
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      Alert.alert("Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fotoUrl = makeFotoUrl(user?.foto_perfil);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con degradado */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {fotoUrl ? (
                <Image source={{ uri: fotoUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={60} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text style={styles.userName}>
              {user?.nombre} {user?.apellido}
            </Text>
            <Text style={styles.userRole}>
              {user?.rol === "usuario" ? "Usuario" : "Administrador"}
            </Text>
          </View>
        </LinearGradient>

        {/* Información del perfil */}
        <View style={styles.contentContainer}>
          {/* Información personal */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={24} color="#6366F1" />
              <Text style={styles.cardTitle}>Información Personal</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nombre completo</Text>
                <Text style={styles.infoValue}>
                  {user?.nombre} {user?.apellido}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Género</Text>
                <Text style={styles.infoValue}>{obtenerGenero(user?.genero)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
                <Text style={styles.infoValue}>
                  {formatearFecha(user?.fecha_nacimiento)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Edad</Text>
                <Text style={styles.infoValue}>{edad} años</Text>
              </View>
            </View>
          </View>

          {/* Información de contacto */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="mail-outline" size={24} color="#6366F1" />
              <Text style={styles.cardTitle}>Contacto</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{user?.correo}</Text>
              </View>
            </View>

            {user?.auth_provider === "google" && (
              <View style={styles.googleBadge}>
                <Ionicons name="logo-google" size={16} color="#4285F4" />
                <Text style={styles.googleBadgeText}>
                  Cuenta vinculada con Google
                </Text>
              </View>
            )}
          </View>

          {/* Información médica */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="medkit-outline" size={24} color="#6366F1" />
              <Text style={styles.cardTitle}>Información Médica</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Usa medicamentos</Text>
                <View style={styles.medicamentosBadge}>
                  <Ionicons
                    name={user?.usa_medicamentos ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={user?.usa_medicamentos ? "#10B981" : "#EF4444"}
                  />
                  <Text
                    style={[
                      styles.medicamentosText,
                      {
                        color: user?.usa_medicamentos ? "#10B981" : "#EF4444",
                      },
                    ]}
                  >
                    {user?.usa_medicamentos ? "Sí" : "No"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preferencias */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="notifications-outline" size={24} color="#6366F1" />
              <Text style={styles.cardTitle}>Preferencias</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Notificaciones</Text>
                <View style={styles.medicamentosBadge}>
                  <Ionicons
                    name={
                      user?.notificaciones
                        ? "notifications"
                        : "notifications-off"
                    }
                    size={18}
                    color={user?.notificaciones ? "#10B981" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.medicamentosText,
                      {
                        color: user?.notificaciones ? "#10B981" : "#6B7280",
                      },
                    ]}
                  >
                    {user?.notificaciones ? "Activadas" : "Desactivadas"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Botón de editar perfil */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/(auth)/PaginaUsuario/editarperfil")}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={styles.editButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 12,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  googleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  googleBadgeText: {
    fontSize: 14,
    color: "#4285F4",
    marginLeft: 8,
    fontWeight: "500",
  },
  medicamentosBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  medicamentosText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  editButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  editButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
