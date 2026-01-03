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

interface UltimoAnalisis {
  id_analisis?: number;
  id?: number;
  id_resultado?: number;
  emocion_dominante?: string;
  clasificacion?: string;
  fecha_analisis?: string;
  fecha_grabacion?: string;
  fecha?: string;
  nivel_estres?: number;
  nivel_ansiedad?: number;
  nivel_felicidad?: number;
  nivel_tristeza?: number;
  nivel_miedo?: number;
  nivel_neutral?: number;
  nivel_enojo?: number;
  nivel_sorpresa?: number;
  confianza_modelo?: number;
  resultado?: {
    emocion_principal?: string;
  };
}

interface EstadisticasJuegos {
  total_sesiones?: number;
  success?: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [edad, setEdad] = useState<number | string>("—");
  const [ultimoAnalisis, setUltimoAnalisis] = useState<UltimoAnalisis | null>(null);
  const [estadisticasJuegos, setEstadisticasJuegos] = useState<EstadisticasJuegos | null>(null);
  const [totalAnalisis, setTotalAnalisis] = useState(0);

  const calcularEdad = (fecha: string | undefined): number | string => {
    if (!fecha) return "—";
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const getEmotionIcon = (emotion: string | undefined): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      felicidad: "happy-outline",
      feliz: "happy-outline",
      tristeza: "sad-outline",
      triste: "sad-outline",
      enojo: "flame-outline",
      enojado: "flame-outline",
      neutral: "remove-outline",
      estres: "warning-outline",
      "estrés": "warning-outline",
      ansiedad: "pulse-outline",
      miedo: "alert-outline",
      asustado: "alert-outline",
      sorpresa: "flash-outline",
      sorprendido: "flash-outline",
    };
    return iconMap[emotion?.toLowerCase() || ""] || "remove-outline";
  };

  const getEmotionColor = (emotion: string | undefined): string => {
    const colorMap: Record<string, string> = {
      felicidad: "#ffb703",
      feliz: "#ffb703",
      tristeza: "#4361ee",
      triste: "#4361ee",
      enojo: "#e63946",
      enojado: "#e63946",
      neutral: "#6c757d",
      estres: "#e76f51",
      "estrés": "#e76f51",
      ansiedad: "#9b5de5",
      miedo: "#7e22ce",
      asustado: "#7e22ce",
      sorpresa: "#2a9d8f",
      sorprendido: "#2a9d8f",
    };
    return colorMap[emotion?.toLowerCase() || ""] || "#4dd4ac";
  };

  // Helper para obtener la emoción dominante del análisis
  const getEmocionDominante = (analisis: UltimoAnalisis | null): string => {
    if (!analisis) return "Sin determinar";
    
    // Prioridad: emocion_dominante > clasificacion > resultado.emocion_principal
    const emocion = analisis.emocion_dominante || 
                    analisis.clasificacion || 
                    analisis.resultado?.emocion_principal;
    
    if (!emocion) return "Sin determinar";
    
    // Capitalizar primera letra
    return emocion.charAt(0).toUpperCase() + emocion.slice(1).toLowerCase();
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHoras < 1) return "Hace unos minutos";
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short'
    });
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
    }
  };

  const cargarDatosActividad = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Cargar historial de análisis - usar limit más alto para contar total
      try {
        const historialResponse = await fetch(`${API_URL}/api/analisis/history?limit=100`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (historialResponse.ok) {
          const historialData = await historialResponse.json();
          console.log("📊 Historial response:", JSON.stringify(historialData, null, 2));
          
          if (historialData?.success && historialData?.data?.length > 0) {
            // El primer elemento es el más reciente
            const ultimo = historialData.data[0];
            console.log("🔍 Último análisis completo:", ultimo);
            console.log("� Fecha análisis:", ultimo.fecha_analisis);
            console.log("🆔 ID análisis:", ultimo.id_analisis);
            console.log("🆔 ID resultado:", ultimo.id_resultado);
            console.log("📈 Nivel estrés:", ultimo.nivel_estres);
            console.log("📈 Nivel ansiedad:", ultimo.nivel_ansiedad);
            console.log("😊 Emoción dominante:", ultimo.emocion_dominante);
            console.log("📊 Clasificación:", ultimo.clasificacion);
            setUltimoAnalisis(ultimo);
            // Contar el total real de análisis
            setTotalAnalisis(historialData.total || historialData.data.length);
          }
        }
      } catch (error) {
        console.log("No hay historial de análisis disponible", error);
      }

      // Cargar estadísticas de juegos
      try {
        const juegosResponse = await fetch(`${API_URL}/api/juegos/estadisticas`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (juegosResponse.ok) {
          const juegosData = await juegosResponse.json();
          if (juegosData?.success) {
            setEstadisticasJuegos(juegosData);
          }
        }
      } catch (error) {
        console.log("No hay estadísticas de juegos disponibles");
      }
    } catch (error) {
      console.error("Error cargando datos de actividad:", error);
    }
  };

  useEffect(() => {
    const cargarTodo = async () => {
      setLoading(true);
      await fetchUserData();
      await cargarDatosActividad();
      setLoading(false);
    };
    cargarTodo();
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
        <Text style={styles.loaderText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header de Bienvenida */}
        <LinearGradient
          colors={['#1e3c72', '#2a5298', '#4a90e2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeTitle}>
                ¡Hola, {user?.nombre || "Usuario"}! 👋
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Bienvenido a tu espacio de bienestar emocional
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.newAnalysisButton}
              onPress={() => router.push("/(auth)/PaginaUsuario/AnalizarVoz")}
            >
              <Ionicons name="mic" size={20} color="#fff" />
              <Text style={styles.newAnalysisText}>Nuevo Análisis</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Resumen de Actividad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={22} color="#4dd4ac" />
            <Text style={styles.sectionTitle}>Resumen de Actividad</Text>
          </View>

          {/* Último Análisis */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={20} color="#4dd4ac" />
              <Text style={styles.cardTitle}>Último Análisis</Text>
            </View>
            
            {ultimoAnalisis ? (
              <View>
                {/* Emoción Principal */}
                <View style={styles.analysisContent}>
                  <View style={[
                    styles.emotionIcon, 
                    { backgroundColor: `${getEmotionColor(getEmocionDominante(ultimoAnalisis))}20` }
                  ]}>
                    <Ionicons 
                      name={getEmotionIcon(getEmocionDominante(ultimoAnalisis))} 
                      size={32} 
                      color={getEmotionColor(getEmocionDominante(ultimoAnalisis))} 
                    />
                  </View>
                  <View style={styles.analysisInfo}>
                    <Text style={[
                      styles.emotionText,
                      { color: getEmotionColor(getEmocionDominante(ultimoAnalisis)) }
                    ]}>
                      {getEmocionDominante(ultimoAnalisis)}
                    </Text>
                    <Text style={styles.dateText}>
                      {formatearFecha(ultimoAnalisis.fecha_analisis || ultimoAnalisis.fecha)}
                    </Text>
                  </View>
                </View>

                {/* Indicadores de Bienestar */}
                <View style={styles.indicatorsGrid}>
                  {/* Nivel de Estrés */}
                  <View style={styles.indicatorCard}>
                    <View style={styles.indicatorHeader}>
                      <Ionicons name="warning-outline" size={16} color="#e76f51" />
                      <Text style={styles.indicatorLabel}>Estrés</Text>
                    </View>
                    <Text style={[styles.indicatorValue, { color: "#e76f51" }]}>
                      {ultimoAnalisis.nivel_estres != null ? Number(ultimoAnalisis.nivel_estres).toFixed(1) : "0.0"}%
                    </Text>
                    <View style={styles.indicatorBar}>
                      <View style={[styles.indicatorBarFill, { width: `${Math.min(100, Number(ultimoAnalisis.nivel_estres) || 0)}%`, backgroundColor: "#e76f51" }]} />
                    </View>
                  </View>

                  {/* Nivel de Ansiedad */}
                  <View style={styles.indicatorCard}>
                    <View style={styles.indicatorHeader}>
                      <Ionicons name="pulse-outline" size={16} color="#9b5de5" />
                      <Text style={styles.indicatorLabel}>Ansiedad</Text>
                    </View>
                    <Text style={[styles.indicatorValue, { color: "#9b5de5" }]}>
                      {ultimoAnalisis.nivel_ansiedad != null ? Number(ultimoAnalisis.nivel_ansiedad).toFixed(1) : "0.0"}%
                    </Text>
                    <View style={styles.indicatorBar}>
                      <View style={[styles.indicatorBarFill, { width: `${Math.min(100, Number(ultimoAnalisis.nivel_ansiedad) || 0)}%`, backgroundColor: "#9b5de5" }]} />
                    </View>
                  </View>
                </View>

                {/* Fecha del análisis */}
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={16} color="#4dd4ac" />
                  <Text style={styles.dateRowText}>
                    Realizado: {(() => {
                      // Priorizar fecha_grabacion que tiene la hora exacta
                      const fechaStr = ultimoAnalisis.fecha_grabacion || ultimoAnalisis.fecha_analisis || ultimoAnalisis.fecha;
                      if (!fechaStr) return "—";
                      
                      // Parsear la fecha como UTC y mostrar sin conversión de zona horaria
                      const fecha = new Date(fechaStr);
                      if (isNaN(fecha.getTime())) return "—";
                      
                      // Usar UTC para evitar conversión de zona horaria
                      const dia = fecha.getUTCDate();
                      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                      const mes = meses[fecha.getUTCMonth()];
                      const año = fecha.getUTCFullYear();
                      const hora = fecha.getUTCHours().toString().padStart(2, '0');
                      const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
                      
                      return `${dia} de ${mes} de ${año}, ${hora}:${minutos}`;
                    })()}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => router.push(`/(auth)/PaginaUsuario/resultado-detallado/${ultimoAnalisis.id_analisis || ultimoAnalisis.id}`)}
                >
                  <Text style={styles.primaryButtonText}>Ver Más Detalles</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="mic-outline" size={40} color="#6c8ba3" />
                <Text style={styles.emptyText}>Aún no tienes análisis</Text>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => router.push("/(auth)/PaginaUsuario/AnalizarVoz")}
                >
                  <Text style={styles.primaryButtonText}>Hacer mi primer análisis</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tu Progreso */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy" size={20} color="#4dd4ac" />
              <Text style={styles.cardTitle}>Tu Progreso</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalAnalisis}</Text>
                <Text style={styles.statLabel}>Análisis totales</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{estadisticasJuegos?.total_sesiones || 0}</Text>
                <Text style={styles.statLabel}>Juegos completados</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/PaginaUsuario/historial")}
            >
              <Text style={styles.primaryButtonText}>Ver Historial Completo</Text>
            </TouchableOpacity>
          </View>

          {/* Acciones Recomendadas */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={20} color="#4dd4ac" />
              <Text style={styles.cardTitle}>Acciones Recomendadas</Text>
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push("/(auth)/PaginaUsuario/recomendaciones")}
              >
                <Ionicons name="heart" size={20} color="#4dd4ac" />
                <Text style={styles.actionButtonText}>Ver mis recomendaciones</Text>
                <Ionicons name="chevron-forward" size={18} color="#6c8ba3" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push("/(auth)/PaginaUsuario/GamesPage")}
              >
                <Ionicons name="game-controller" size={20} color="#4dd4ac" />
                <Text style={styles.actionButtonText}>Juegos terapéuticos</Text>
                <Ionicons name="chevron-forward" size={18} color="#6c8ba3" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push("/(auth)/PaginaUsuario/historial")}
              >
                <Ionicons name="bar-chart" size={20} color="#4dd4ac" />
                <Text style={styles.actionButtonText}>Ver mis reportes</Text>
                <Ionicons name="chevron-forward" size={18} color="#6c8ba3" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Acceso Rápido */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={22} color="#4dd4ac" />
            <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          </View>

          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/AnalizarVoz")}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="mic-outline" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.quickCardTitle}>Analizar Voz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/GamesPage")}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="game-controller-outline" size={32} color="#FF9800" />
              </View>
              <Text style={styles.quickCardTitle}>Juegos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/Grupos")}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="people-outline" size={32} color="#9C27B0" />
              </View>
              <Text style={styles.quickCardTitle}>Grupos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/PaginaUsuario/historial")}
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="time-outline" size={32} color="#2196F3" />
              </View>
              <Text style={styles.quickCardTitle}>Historial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de Perfil */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={22} color="#4dd4ac" />
            <Text style={styles.sectionTitle}>Información de Perfil</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.profileGrid}>
              <View style={styles.profileRow}>
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
              </View>

              <View style={styles.profileRow}>
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

        {/* Footer */}
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
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: 'wrap',
    gap: 15,
  },
  headerLeft: {
    flex: 1,
    minWidth: 200,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#b8c5d0",
    lineHeight: 20,
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4dd4ac',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  newAnalysisText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 8,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  card: {
    backgroundColor: "#1a3a52",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  analysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  emotionIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisInfo: {
    flex: 1,
  },
  emotionText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#b8c5d0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  emptyText: {
    color: '#6c8ba3',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#4dd4ac',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Estilos para indicadores de bienestar
  indicatorsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  indicatorCard: {
    flex: 1,
    backgroundColor: '#0f2537',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a4a62',
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  indicatorLabel: {
    fontSize: 12,
    color: '#b8c5d0',
    fontWeight: '500',
  },
  indicatorValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  indicatorBar: {
    height: 4,
    backgroundColor: '#2a4a62',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(77, 212, 172, 0.1)',
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 13,
    color: '#4dd4ac',
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(77, 212, 172, 0.1)',
    borderRadius: 8,
  },
  dateRowText: {
    fontSize: 13,
    color: '#4dd4ac',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4dd4ac',
  },
  statLabel: {
    fontSize: 12,
    color: '#b8c5d0',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a4a62',
    marginVertical: 15,
  },
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#0f2537',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a4a62',
  },
  actionButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickCard: {
    backgroundColor: '#1a3a52',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  profileGrid: {
    gap: 15,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 15,
  },
  profileItem: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#2a4a62',
    paddingBottom: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: '#b8c5d0',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a3a52',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6c8ba3',
    textAlign: 'center',
  },
});