import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useAuth } from "../../../hooks/useAuth";
import groupsApi from "../../../api/groups";

const { width } = Dimensions.get("window");

interface Participante {
  id_participacion: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  estado: "pendiente" | "grabando" | "analizando" | "completado" | "error";
  fecha_completado?: string;
}

interface SesionData {
  id_sesion: number;
  id_grupo: number;
  titulo: string;
  descripcion?: string;
  estado: "pendiente" | "en_progreso" | "completada" | "cancelada";
  total_participantes: number;
  participantes_completados: number;
  porcentaje_completado: number;
  fecha_inicio: string;
  fecha_limite?: string;
  iniciador_nombre?: string;
  iniciador_apellido?: string;
  mi_participacion?: {
    estado: string;
    id_resultado?: number;
  };
}

interface ResultadoIndividual {
  emociones: {
    felicidad?: number;
    tristeza?: number;
    enojo?: number;
    miedo?: number;
    sorpresa?: number;
    neutral?: number;
  };
  nivel_estres?: number;
  nivel_ansiedad?: number;
  emocion_predominante?: string;
  confianza?: number;
}

interface ResultadoGrupal {
  id_resultado_grupal: number;
  promedio_felicidad: number;
  promedio_tristeza: number;
  promedio_enojo: number;
  promedio_miedo: number;
  promedio_sorpresa: number;
  promedio_neutral: number;
  promedio_estres: number;
  promedio_ansiedad: number;
  emocion_predominante: string;
  nivel_bienestar_grupal: number;
  recomendacion_grupal?: string;
  total_participantes: number;
}

export default function SesionGrupal() {
  const router = useRouter();
  const { id, sesionId, grupoNombre } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [sesion, setSesion] = useState<SesionData | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [resultadoIndividual, setResultadoIndividual] = useState<ResultadoIndividual | null>(null);
  const [resultadoGrupal, setResultadoGrupal] = useState<ResultadoGrupal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de grabación
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  
  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const idSesion = typeof sesionId === "string" ? parseInt(sesionId) : Array.isArray(sesionId) ? parseInt(sesionId[0]) : 0;
  const idGrupo = typeof id === "string" ? parseInt(id) : Array.isArray(id) ? parseInt(id[0]) : 0;
  const nombreGrupo = typeof grupoNombre === "string" ? grupoNombre : "";

  // Intervalo para actualizar duración de grabación
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Cargar datos de la sesión
  const cargarDatos = useCallback(async () => {
    if (!idSesion) return;
    
    try {
      console.log("📡 Cargando sesión grupal:", idSesion);
      
      const [sesionData, participantesData] = await Promise.all([
        groupsApi.obtenerEstadoSesion(idSesion),
        groupsApi.obtenerParticipantesSesion(idSesion),
      ]);
      
      console.log("📦 Sesión:", sesionData);
      console.log("👥 Participantes:", participantesData);
      
      if (sesionData?.success) {
        setSesion(sesionData.data);
        
        // Si ya completé, cargar mi resultado individual
        if (sesionData.data?.mi_participacion?.estado === "completado" && sesionData.data?.mi_participacion?.id_resultado) {
          try {
            const miParticipacion = await groupsApi.obtenerMiParticipacion(idSesion);
            if (miParticipacion?.success && miParticipacion?.data?.resultado) {
              setResultadoIndividual(miParticipacion.data.resultado);
              setRecordingCompleted(true);
            }
          } catch (e) {
            console.log("No se pudo cargar resultado individual");
          }
        }
        
        // Si la sesión está completada, cargar resultado grupal
        if (sesionData.data?.estado === "completada") {
          try {
            const resultGrupal = await groupsApi.obtenerResultadoGrupal(idSesion);
            if (resultGrupal?.success) {
              setResultadoGrupal(resultGrupal.data);
            }
          } catch (e) {
            console.log("No se pudo cargar resultado grupal");
          }
        }
      }
      
      if (participantesData?.success) {
        setParticipantes(participantesData.data || []);
      }
      
    } catch (error: any) {
      console.error("❌ Error cargando sesión:", error);
      Alert.alert("Error", "No se pudo cargar la información de la sesión");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [idSesion]);

  useEffect(() => {
    cargarDatos();
    
    // Auto-refresh cada 10 segundos si la sesión está en progreso
    const interval = setInterval(() => {
      if (sesion?.estado === "en_progreso" && !isRecording && !isProcessing) {
        cargarDatos();
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [cargarDatos, sesion?.estado, isRecording, isProcessing]);

  // Animación de pulso durante grabación
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRecording, pulseAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarDatos();
  }, [cargarDatos]);

  // Iniciar grabación
  const startRecording = async () => {
    try {
      // Solicitar permisos
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permisos Requeridos", "Necesitamos acceso al micrófono para grabar tu voz");
        return;
      }
      
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Crear grabación
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Iniciar contador de duración
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      console.log("🎤 Grabación iniciada");
    } catch (error) {
      console.error("Error iniciando grabación:", error);
      Alert.alert("Error", "No se pudo iniciar la grabación");
    }
  };

  // Detener grabación y procesar
  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      console.log("🛑 Deteniendo grabación...");
      
      // Detener contador
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      setIsRecording(false);
      setIsProcessing(true);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (!uri) {
        throw new Error("No se pudo obtener el archivo de audio");
      }
      
      console.log("📤 Enviando audio para análisis...");
      
      // Enviar al servidor para análisis
      const response = await groupsApi.registrarParticipacionAudio(idSesion, uri);
      
      if (response?.success) {
        console.log("✅ Participación registrada:", response);
        setRecordingCompleted(true);
        
        // Cargar resultado individual si viene en la respuesta
        if (response.data?.resultado) {
          setResultadoIndividual(response.data.resultado);
        }
        
        Alert.alert(
          "¡Listo!",
          "Tu audio ha sido analizado. Puedes ver tus resultados mientras esperamos a los demás miembros.",
          [{ text: "Ver Resultados", onPress: () => cargarDatos() }]
        );
      } else {
        throw new Error(response?.error || "Error al procesar el audio");
      }
      
    } catch (error: any) {
      console.error("Error procesando audio:", error);
      Alert.alert("Error", error.message || "No se pudo procesar tu audio");
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancelar grabación
  const cancelRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsRecording(false);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setRecordingDuration(0);
  };

  // Formatear duración
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener color de emoción
  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      felicidad: "#4ade80",
      tristeza: "#60a5fa",
      enojo: "#f87171",
      miedo: "#a78bfa",
      sorpresa: "#fbbf24",
      neutral: "#94a3b8",
    };
    return colors[emotion.toLowerCase()] || "#5ad0d2";
  };

  // Obtener icono de estado de participante
  const getParticipantStatusIcon = (estado: string) => {
    switch (estado) {
      case "completado":
        return { icon: "checkmark-circle", color: "#4ade80" };
      case "grabando":
      case "analizando":
        return { icon: "hourglass", color: "#fbbf24" };
      case "error":
        return { icon: "alert-circle", color: "#ef4444" };
      default:
        return { icon: "time-outline", color: "#94a3b8" };
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b", "#0f172a"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5ad0d2" />
            <Text style={styles.loadingText}>Cargando sesión...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!sesion) {
    return (
      <LinearGradient colors={["#0f172a", "#1e293b", "#0f172a"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sesión no encontrada</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#475569" />
            <Text style={styles.emptyText}>La sesión no existe o no tienes acceso</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const miParticipacionCompleta = sesion?.mi_participacion?.estado === "completado" || recordingCompleted;
  const sesionCompletada = sesion?.estado === "completada";
  const faltanParticipantes = sesion.participantes_completados < sesion.total_participantes;

  return (
    <LinearGradient colors={["#0f172a", "#1e293b", "#0f172a"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {sesion.titulo}
            </Text>
            <Text style={styles.headerSubtitle}>{nombreGrupo}</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={22} color="#5ad0d2" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#5ad0d2"
            />
          }
        >
          {/* Progreso de la sesión */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Progreso del Grupo</Text>
                <Text style={styles.progressSubtitle}>
                  {sesion.participantes_completados} de {sesion.total_participantes} han completado
                </Text>
              </View>
              <View style={[
                styles.progressBadge,
                sesionCompletada ? styles.progressBadgeComplete : styles.progressBadgePending
              ]}>
                <Text style={styles.progressBadgeText}>
                  {sesionCompletada ? "Completada" : "En Progreso"}
                </Text>
              </View>
            </View>
            
            {/* Barra de progreso */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${sesion.porcentaje_completado}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(sesion.porcentaje_completado)}%</Text>
            </View>
          </View>

          {/* Sección de grabación (si no he completado) */}
          {!miParticipacionCompleta && !sesionCompletada && (
            <View style={styles.recordingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="mic" size={20} color="#5ad0d2" /> Tu Participación
              </Text>
              
              {!isRecording && !isProcessing ? (
                <View style={styles.recordingPrompt}>
                  <Ionicons name="mic-outline" size={48} color="#5ad0d2" />
                  <Text style={styles.recordingPromptText}>
                    Graba un audio expresando cómo te sientes hoy
                  </Text>
                  <Text style={styles.recordingHint}>
                    Habla durante al menos 10 segundos para un mejor análisis
                  </Text>
                  <TouchableOpacity style={styles.startRecordingBtn} onPress={startRecording}>
                    <Ionicons name="mic" size={24} color="#0f172a" />
                    <Text style={styles.startRecordingText}>Iniciar Grabación</Text>
                  </TouchableOpacity>
                </View>
              ) : isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#5ad0d2" />
                  <Text style={styles.processingText}>Analizando tu audio...</Text>
                  <Text style={styles.processingHint}>
                    Esto puede tomar unos segundos
                  </Text>
                </View>
              ) : (
                <View style={styles.recordingActive}>
                  <Animated.View 
                    style={[
                      styles.recordingIndicator,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <View style={styles.recordingDot} />
                  </Animated.View>
                  <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
                  <Text style={styles.recordingLabel}>Grabando...</Text>
                  
                  <View style={styles.recordingActions}>
                    <TouchableOpacity 
                      style={styles.cancelRecordingBtn} 
                      onPress={cancelRecording}
                    >
                      <Ionicons name="close" size={24} color="#ef4444" />
                      <Text style={styles.cancelRecordingText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.stopRecordingBtn,
                        recordingDuration < 5 && styles.stopRecordingBtnDisabled
                      ]} 
                      onPress={stopRecording}
                      disabled={recordingDuration < 5}
                    >
                      <Ionicons name="stop" size={24} color="#fff" />
                      <Text style={styles.stopRecordingText}>
                        {recordingDuration < 5 ? `Espera ${5 - recordingDuration}s` : "Detener"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Mi resultado individual */}
          {miParticipacionCompleta && resultadoIndividual && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="analytics" size={24} color="#5ad0d2" />
                <Text style={styles.resultTitle}>Tu Resultado</Text>
                <View style={styles.resultBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                  <Text style={styles.resultBadgeText}>Completado</Text>
                </View>
              </View>
              
              {/* Emoción predominante */}
              {resultadoIndividual.emocion_predominante && (
                <View style={styles.predominantEmotion}>
                  <Text style={styles.predominantLabel}>Emoción Predominante</Text>
                  <View style={[
                    styles.emotionChip,
                    { backgroundColor: `${getEmotionColor(resultadoIndividual.emocion_predominante)}20` }
                  ]}>
                    <Text style={[
                      styles.emotionChipText,
                      { color: getEmotionColor(resultadoIndividual.emocion_predominante) }
                    ]}>
                      {resultadoIndividual.emocion_predominante.charAt(0).toUpperCase() + 
                       resultadoIndividual.emocion_predominante.slice(1)}
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Barras de emociones */}
              <View style={styles.emotionBars}>
                {resultadoIndividual.emociones && Object.entries(resultadoIndividual.emociones).map(([emotion, value]) => (
                  <View key={emotion} style={styles.emotionBar}>
                    <View style={styles.emotionLabelRow}>
                      <Text style={styles.emotionLabel}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </Text>
                      <Text style={styles.emotionValue}>
                        {typeof value === 'number' ? Math.round(value) : 0}%
                      </Text>
                    </View>
                    <View style={styles.barBackground}>
                      <View 
                        style={[
                          styles.barFill,
                          { 
                            width: `${typeof value === 'number' ? value : 0}%`,
                            backgroundColor: getEmotionColor(emotion)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Mensaje de espera */}
              {faltanParticipantes && (
                <View style={styles.waitingMessage}>
                  <Ionicons name="hourglass-outline" size={20} color="#fbbf24" />
                  <Text style={styles.waitingText}>
                    Esperando a que los demás miembros completen para ver el resultado grupal
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Resultado Grupal (cuando todos completan) */}
          {sesionCompletada && resultadoGrupal && (
            <View style={styles.groupResultCard}>
              <LinearGradient
                colors={["#1e3a5f", "#0f2744"]}
                style={styles.groupResultGradient}
              >
                <View style={styles.groupResultHeader}>
                  <Ionicons name="people" size={28} color="#5ad0d2" />
                  <Text style={styles.groupResultTitle}>Resultado Grupal</Text>
                </View>
                
                {/* Bienestar grupal */}
                <View style={styles.bienestarContainer}>
                  <Text style={styles.bienestarLabel}>Nivel de Bienestar Grupal</Text>
                  <View style={styles.bienestarCircle}>
                    <Text style={styles.bienestarValue}>
                      {Math.round(resultadoGrupal.nivel_bienestar_grupal)}
                    </Text>
                    <Text style={styles.bienestarUnit}>/100</Text>
                  </View>
                </View>
                
                {/* Emoción predominante del grupo */}
                <View style={styles.groupEmotionContainer}>
                  <Text style={styles.groupEmotionLabel}>Emoción Predominante del Grupo</Text>
                  <View style={[
                    styles.groupEmotionChip,
                    { backgroundColor: `${getEmotionColor(resultadoGrupal.emocion_predominante)}30` }
                  ]}>
                    <Text style={[
                      styles.groupEmotionText,
                      { color: getEmotionColor(resultadoGrupal.emocion_predominante) }
                    ]}>
                      {resultadoGrupal.emocion_predominante.charAt(0).toUpperCase() + 
                       resultadoGrupal.emocion_predominante.slice(1)}
                    </Text>
                  </View>
                </View>
                
                {/* Promedios de emociones */}
                <View style={styles.groupAverages}>
                  <Text style={styles.groupAveragesTitle}>Promedios del Grupo</Text>
                  <View style={styles.averagesGrid}>
                    {[
                      { label: "Felicidad", value: resultadoGrupal.promedio_felicidad, color: "#4ade80" },
                      { label: "Tristeza", value: resultadoGrupal.promedio_tristeza, color: "#60a5fa" },
                      { label: "Enojo", value: resultadoGrupal.promedio_enojo, color: "#f87171" },
                      { label: "Miedo", value: resultadoGrupal.promedio_miedo, color: "#a78bfa" },
                      { label: "Estrés", value: resultadoGrupal.promedio_estres, color: "#fb923c" },
                      { label: "Ansiedad", value: resultadoGrupal.promedio_ansiedad, color: "#f472b6" },
                    ].map((item) => (
                      <View key={item.label} style={styles.averageItem}>
                        <View style={[styles.averageDot, { backgroundColor: item.color }]} />
                        <Text style={styles.averageLabel}>{item.label}</Text>
                        <Text style={[styles.averageValue, { color: item.color }]}>
                          {Math.round(item.value)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Recomendación grupal */}
                {resultadoGrupal.recomendacion_grupal && (
                  <View style={styles.groupRecommendation}>
                    <Ionicons name="bulb" size={20} color="#fbbf24" />
                    <Text style={styles.groupRecommendationText}>
                      {resultadoGrupal.recomendacion_grupal}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Lista de participantes */}
          <View style={styles.participantsSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="people-outline" size={20} color="#94a3b8" /> Participantes
            </Text>
            
            {participantes.map((participante) => {
              const statusInfo = getParticipantStatusIcon(participante.estado);
              const esYo = participante.id_usuario === user?.id_usuario;
              
              return (
                <View 
                  key={participante.id_participacion} 
                  style={[styles.participantCard, esYo && styles.participantCardMe]}
                >
                  <View style={styles.participantInfo}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantInitial}>
                        {participante.nombre.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.participantName}>
                        {participante.nombre} {participante.apellido}
                        {esYo && " (Tú)"}
                      </Text>
                      <Text style={styles.participantStatus}>
                        {participante.estado === "completado" 
                          ? `Completado${participante.fecha_completado ? ` • ${formatDate(participante.fecha_completado)}` : ""}`
                          : participante.estado.charAt(0).toUpperCase() + participante.estado.slice(1)
                        }
                      </Text>
                    </View>
                  </View>
                  <Ionicons 
                    name={statusInfo.icon as any} 
                    size={24} 
                    color={statusInfo.color} 
                  />
                </View>
              );
            })}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
  },
  refreshButton: {
    padding: 8,
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  progressSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 4,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgePending: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  progressBadgeComplete: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  progressBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#5ad0d2",
    borderRadius: 4,
  },
  progressPercentage: {
    color: "#5ad0d2",
    fontSize: 14,
    fontWeight: "600",
    width: 45,
    textAlign: "right",
  },
  
  // Recording Section
  recordingSection: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(90, 208, 210, 0.3)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  recordingPrompt: {
    alignItems: "center",
    paddingVertical: 24,
  },
  recordingPromptText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  recordingHint: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
  },
  startRecordingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5ad0d2",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  startRecordingText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "600",
  },
  
  processingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  processingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  processingHint: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 8,
  },
  
  recordingActive: {
    alignItems: "center",
    paddingVertical: 24,
  },
  recordingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  recordingDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ef4444",
  },
  recordingTime: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  recordingLabel: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  recordingActions: {
    flexDirection: "row",
    gap: 16,
  },
  cancelRecordingBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef4444",
    gap: 8,
  },
  cancelRecordingText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
  stopRecordingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5ad0d2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  stopRecordingBtnDisabled: {
    backgroundColor: "#475569",
  },
  stopRecordingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Result Card
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  resultTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "500",
  },
  predominantEmotion: {
    alignItems: "center",
    marginBottom: 20,
  },
  predominantLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
  },
  emotionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emotionChipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emotionBars: {
    gap: 12,
  },
  emotionBar: {
    gap: 6,
  },
  emotionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emotionLabel: {
    color: "#e2e8f0",
    fontSize: 13,
  },
  emotionValue: {
    color: "#94a3b8",
    fontSize: 13,
  },
  barBackground: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  waitingMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  waitingText: {
    color: "#fbbf24",
    fontSize: 13,
    flex: 1,
  },
  
  // Group Result
  groupResultCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  groupResultGradient: {
    padding: 20,
  },
  groupResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  groupResultTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  bienestarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  bienestarLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 12,
  },
  bienestarCircle: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bienestarValue: {
    color: "#5ad0d2",
    fontSize: 48,
    fontWeight: "700",
  },
  bienestarUnit: {
    color: "#94a3b8",
    fontSize: 18,
    marginLeft: 4,
  },
  groupEmotionContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  groupEmotionLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
  },
  groupEmotionChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  groupEmotionText: {
    fontSize: 18,
    fontWeight: "600",
  },
  groupAverages: {
    marginBottom: 20,
  },
  groupAveragesTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  averagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  averageItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    width: "48%",
  },
  averageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  averageLabel: {
    color: "#94a3b8",
    fontSize: 12,
    flex: 1,
  },
  averageValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  groupRecommendation: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    padding: 14,
    borderRadius: 12,
  },
  groupRecommendationText: {
    color: "#fef3c7",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  
  // Participants
  participantsSection: {
    marginTop: 8,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  participantCardMe: {
    borderWidth: 1,
    borderColor: "rgba(90, 208, 210, 0.3)",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(90, 208, 210, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  participantInitial: {
    color: "#5ad0d2",
    fontSize: 16,
    fontWeight: "600",
  },
  participantName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  participantStatus: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
});
