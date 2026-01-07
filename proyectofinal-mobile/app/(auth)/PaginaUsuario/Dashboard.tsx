import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL, ApiEndpoints } from '../../../constants';
import { LinearGradient } from 'expo-linear-gradient';

interface UserData {
  id_usuario?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  fecha_nacimiento?: string;
  genero?: string;
  usa_medicamentos?: boolean;
  rol?: string;
}

export default function Dashboard() {
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

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Sesión expirada", "Por favor, inicia sesión nuevamente.");
        router.replace("/(auth)/PaginasPublicas/login");
        return;
      }

      const response = await fetch(`${API_URL}${ApiEndpoints.AUTH.VERIFY}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError);
        Alert.alert("Error", "Respuesta inválida del servidor");
        return;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 422) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          Alert.alert("Sesión expirada", "Por favor, inicia sesión nuevamente.");
          router.replace("/(auth)/PaginasPublicas/login");
        } else {
          Alert.alert("Error", data.error || "No se pudo cargar la información del usuario.");
        }
        return;
      }

      if (data.success && data.user) {
        setUser(data.user);
        setEdad(calcularEdad(data.user.fecha_nacimiento));
      } else {
        Alert.alert("Error", "No se pudo cargar la información del usuario.");
      }
    } catch (error: any) {
      console.error("Error cargando datos del usuario:", error);
      Alert.alert("Error", "Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            router.replace("/(auth)/PaginasPublicas/login");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4dd4ac" />
        <Text style={styles.loaderText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#1e3c72', '#2a5298', '#4a90e2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeTitle}>
                ¡Bienvenido, {user?.nombre || "Usuario"}! 👋
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Aquí puedes gestionar tu cuenta y acceder a todas las funciones de SerenVoice.
              </Text>
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>

          <View style={styles.cardsGrid}>
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/historial")}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="time-outline" size={40} color="#2196F3" />
              </View>
              <Text style={styles.cardTitle}>Historial</Text>
              <Text style={styles.cardDescription}>
                Revisa tu historial de sesiones y actividades.
              </Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Ver Historial</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/recomendaciones")}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="heart-outline" size={40} color="#E91E63" />
              </View>
              <Text style={styles.cardTitle}>Métricas de Salud</Text>
              <Text style={styles.cardDescription}>
                Accede a recomendaciones personalizadas.
              </Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Ver Recomendaciones</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/AnalizarVoz")}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="mic-outline" size={40} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>Registrar Sesión</Text>
              <Text style={styles.cardDescription}>
                Graba y analiza tu voz ahora mismo.
              </Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Grabar Ahora</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/GamesPage")}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="game-controller-outline" size={40} color="#FF9800" />
              </View>
              <Text style={styles.cardTitle}>Juegos Terapéuticos</Text>
              <Text style={styles.cardDescription}>
                Relájate y mejora tu bienestar con juegos de mindfulness.
              </Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Jugar Ahora</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/Grupos")}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="search-outline" size={40} color="#9C27B0" />
              </View>
              <Text style={styles.cardTitle}>Buscar Grupos</Text>
              <Text style={styles.cardDescription}>
                Encuentra grupos disponibles y únete a los que te interesen.
              </Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Buscar Grupos</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/GrupoForm")}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2F1' }]}>
                <Ionicons name="people-outline" size={40} color="#009688" />
              </View>
              <Text style={styles.cardTitle}>Gestionar Mis Grupos</Text>
              <Text style={styles.cardDescription}>
                Administra los grupos que has creado y gestiona miembros y actividades.
              </Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Mis Grupos</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Información de Perfil</Text>

          <View style={styles.profileCard}>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Nombre Completo</Text>
                <Text style={styles.profileValue}>
                  {user?.nombre} {user?.apellido}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Correo</Text>
                <Text style={styles.profileValue}>{user?.correo}</Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Edad</Text>
                <Text style={styles.profileValue}>{edad} años</Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Género</Text>
                <Text style={styles.profileValue}>
                  {user?.genero === "M"
                    ? "Masculino"
                    : user?.genero === "F"
                    ? "Femenino"
                    : "Otro"}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Usa medicamentos</Text>
                <Text style={styles.profileValue}>
                  {user?.usa_medicamentos ? "Sí" : "No"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/(auth)/PaginaUsuario/editarperfil")}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f2537",
  },
  container: {
    flex: 1,
    backgroundColor: "#0f2537",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f2537",
  },
  loaderText: {
    marginTop: 10,
    color: "#b8c5d0",
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#b8c5d0",
    lineHeight: 20,
    maxWidth: "85%",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
  },
  cardsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  cardsGrid: {
    gap: 15,
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
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#b8c5d0",
    lineHeight: 20,
    marginBottom: 15,
  },
  cardButton: {
    backgroundColor: "#4dd4ac",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileSection: {
    padding: 20,
    paddingTop: 0,
  },
  profileCard: {
    backgroundColor: "#1a3a52",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileGrid: {
    gap: 20,
    marginBottom: 20,
  },
  profileItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#2a4a62",
    paddingBottom: 15,
  },
  profileLabel: {
    fontSize: 12,
    color: "#b8c5d0",
    marginBottom: 5,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  editButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1a3a52",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#6c8ba3",
    textAlign: "center",
  },
});