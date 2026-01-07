import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { ApiClient, ApiEndpoints, Config } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";

// ✅ TIPOS
interface EmotionResult {
  emotions: {
    [key: string]: number;
  };
  status: string;
  timestamp?: string;
}

// 🎭 FRASES GENERALES SUGERIDAS PARA PRACTICAR
const FRASES_SUGERIDAS = [
  "Hoy es un día especial para mí",
  "Me gusta pasar tiempo con mi familia",
  "El clima está muy agradable hoy",
  "Tengo muchas cosas que hacer esta semana",
  "Me encanta escuchar música en mis tiempos libres",
  "Ayer tuve una conversación muy interesante",
  "Estoy pensando en mis planes para el fin de semana",
  "La comida que preparé hoy quedó deliciosa",
  "Necesito organizar mejor mi tiempo",
  "Me gustaría aprender algo nuevo este año",
  "El trabajo ha estado bastante ocupado últimamente",
  "Disfruto caminar por el parque por las tardes",
  "Tengo que terminar varios pendientes esta semana",
  "Me siento agradecido por las cosas buenas que tengo",
  "Quiero mejorar en muchos aspectos de mi vida",
];

export default function Analisis() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmotionResult | null>(null);
  const [mostrarFrases, setMostrarFrases] = useState(true); // ✅ Mostrar por defecto
  const [fraseActual, setFraseActual] = useState("");

  const sound = useRef<Audio.Sound | null>(null);

  // ✅ Cargar frase aleatoria al inicio
  useEffect(() => {
    obtenerFraseAleatoria();
  }, []);

  // 🎲 Obtener frase aleatoria
  const obtenerFraseAleatoria = () => {
    const indice = Math.floor(Math.random() * FRASES_SUGERIDAS.length);
    const nuevaFrase = FRASES_SUGERIDAS[indice];
    setFraseActual(nuevaFrase);
    console.log("🎲 Nueva frase:", nuevaFrase);
  };

  // --------------------------
  // INICIAR GRABACIÓN
  // --------------------------
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permiso denegado", "Necesitamos acceso al micrófono.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setHasRecorded(false);
      setAnalysisResult(null);
      console.log("🎤 Grabando...");
    } catch (error) {
      console.error("Error al grabar:", error);
      Alert.alert("Error", "No se pudo iniciar la grabación.");
    }
  };

  // --------------------------
  // DETENER GRABACIÓN
  // --------------------------
  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      setHasRecorded(true);
      console.log("⏹️ Grabación detenida");
    } catch (error) {
      console.error("Error al detener:", error);
      Alert.alert("Error", "No se pudo detener la grabación.");
    }
  };

  // --------------------------
  // REPRODUCIR AUDIO GRABADO
  // --------------------------
  const playAudio = async () => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }

      const newSound = new Audio.Sound();
      const uri = recording?.getURI();
      if (!uri) return;
 
      await newSound.loadAsync({ uri });
      await newSound.playAsync();
      sound.current = newSound;

      console.log("▶️ Reproduciendo audio");
    } catch (error) {
      console.error("Error al reproducir:", error);
      Alert.alert("Error", "No se pudo reproducir el audio.");
    }
  };

  // --------------------------
  // ANALIZAR AUDIO EN BACKEND
  // --------------------------
  const analyzeAudio = async () => {
    if (!recording) {
      Alert.alert("Error", "No hay grabación para analizar");
      return;
    }

    const uri = recording.getURI();

    if (!uri) {
      Alert.alert(
        "Error",
        "No se pudo obtener el archivo de audio. Intenta grabar nuevamente."
      );
      return;
    }

    try {
      setIsAnalyzing(true);

      console.log("📤 Enviando audio desde:", uri);

      let audioFile: File | { uri: string; name: string; type: string };

      if (uri.startsWith("blob:")) {
        const response = await fetch(uri);
        const blob = await response.blob();

        audioFile = new File([blob], "audio.m4a", {
          type: "audio/m4a",
        });

        console.log("📦 File creado desde blob:", audioFile);
      } else {
        audioFile = {
          uri,
          name: "audio.m4a",
          type: "audio/m4a",
        };
      }

      const formData = new FormData();
      formData.append("audio", audioFile as any);
      formData.append("duration", "0");

      console.log("📦 FormData preparado");

      const response = await fetch(
        `${Config.API_URL}${ApiEndpoints.AUDIO.ANALYZE}`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("📡 Respuesta status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Respuesta del backend:", data);

      if (data.success && data.emotions) {
        const mappedEmotions: Record<string, number> = {};

        data.emotions.forEach((emotion: any) => {
          mappedEmotions[emotion.name.toLowerCase()] =
            parseFloat(emotion.value);
        });

        setAnalysisResult({
          emotions: mappedEmotions,
          status:
            data.mode === "authenticated"
              ? "Análisis completado"
              : "Análisis en modo prueba",
          timestamp: data.timestamp,
        });
      }
    } catch (error: any) {
      console.error("❌ Error al analizar:", error);

      Alert.alert(
        "Error de Análisis",
        error?.message || "Hubo un problema al analizar el audio."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --------------------------
  // LIMPIAR Y GRABAR NUEVO
  // --------------------------
  const resetRecording = () => {
    setRecording(null);
    setHasRecorded(false);
    setAnalysisResult(null);
    if (sound.current) {
      sound.current.unloadAsync();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.brandName}>🎤 SerenVoice</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.exitButton}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>Análisis Emocional por Voz</Text>
            <Text style={styles.subtitle}>
              Graba tu voz y descubre tu estado emocional
            </Text>

            {/* 💡 SECCIÓN DE FRASES SUGERIDAS */}
            <View style={styles.suggestionsCard}>
              <TouchableOpacity
                style={styles.suggestionsHeader}
                onPress={() => setMostrarFrases(!mostrarFrases)}
              >
                <Text style={styles.suggestionsTitle}>
                  💬 Frases Sugeridas para Practicar
                </Text>
                <Ionicons
                  name={mostrarFrases ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#4dd4ac"
                />
              </TouchableOpacity>

              {mostrarFrases && (
                <View style={styles.suggestionsContent}>
                  <Text style={styles.suggestionsSubtitle}>
                    Lee en voz alta esta frase para obtener mejores resultados:
                  </Text>

                  {/* ✅ FRASE DESTACADA - SIEMPRE SE MUESTRA */}
                  <View style={styles.fraseDestacada}>
                    <Text style={styles.fraseDestacadaText}>
                      "{fraseActual}"
                    </Text>
                    <TouchableOpacity
                      style={styles.cambiarFraseButton}
                      onPress={obtenerFraseAleatoria}
                    >
                      <Ionicons name="shuffle" size={16} color="#4dd4ac" />
                      <Text style={styles.cambiarFraseText}>Cambiar frase</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* ESTADO DE GRABACIÓN */}
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Grabando...</Text>
              </View>
            )}

            {/* BOTÓN GRABAR/DETENER */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isRecording ? styles.recordingButton : styles.primaryButton,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
            >
              <Text style={styles.controlButtonText}>
                {isRecording ? "⏹️ Detener Grabación" : "🎤 Iniciar Grabación"}
              </Text>
            </TouchableOpacity>

            {/* BOTONES DESPUÉS DE GRABAR */}
            {hasRecorded && !isAnalyzing && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={playAudio}
                >
                  <Text style={styles.controlButtonText}>▶️ Reproducir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.analyzeButton}
                  onPress={analyzeAudio}
                >
                  <Text style={styles.controlButtonText}>🔬 Analizar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetRecording}
                >
                  <Text style={styles.resetButtonText}>🔄 Nueva Grabación</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* LOADING */}
            {isAnalyzing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4dd4ac" />
                <Text style={styles.loadingText}>
                  Analizando tus emociones...
                </Text>
                <Text style={styles.loadingSubtext}>
                  Esto puede tomar unos segundos
                </Text>
              </View>
            )}

            {/* RESULTADOS DEL BACKEND */}
            {analysisResult && !isAnalyzing && (
              <View style={styles.resultsContainer}>
                <Text style={styles.sectionTitle}>📊 Resultados del Análisis</Text>

                {/* Emociones */}
                {analysisResult.emotions && (
                  <View style={styles.emotionsContainer}>
                    {Object.entries(analysisResult.emotions).map(([emotion, percentage]: [string, number]) => (
                      <View style={styles.emotionRow} key={emotion}>
                        <Text style={styles.emotionLabel}>
                          {getEmotionEmoji(emotion)} {capitalizeFirst(emotion)}
                        </Text>
                        <View style={styles.emotionBarContainer}>
                          <View 
                            style={[
                              styles.emotionBar, 
                              { width: `${percentage}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.emotionValue}>{percentage.toFixed(1)}%</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Estado */}
                {analysisResult.status && (
                  <View style={styles.statusCard}>
                    <Text style={styles.statusTitle}>Estado Emocional:</Text>
                    <Text style={styles.statusText}>
                      {analysisResult.status}
                    </Text>
                  </View>
                )}

                {/* Botón para ver recomendaciones */}
                <TouchableOpacity
                  style={styles.recommendationsButton}
                  onPress={() => router.push('/(auth)/PaginaUsuario/recomendaciones')}
                >
                  <Text style={styles.recommendationsButtonText}>
                    Ver Recomendaciones 💡
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Función helper para emojis
function getEmotionEmoji(emotion: string): string {
  const emojis: { [key: string]: string } = {
    felicidad: "😊",
    feliz: "😊",
    tristeza: "😢",
    triste: "😢",
    enojado: "😠",
    enojo: "😠",
    neutral: "😐",
    sorprendido: "😲",
    sorpresa: "😲",
    asustado: "😨",
    miedo: "😨",
    ansiedad: "😟",
    estres: "😰",
    "estrés": "😰",
  };
  return emojis[emotion.toLowerCase()] || "😐";
}

// Función helper para capitalizar
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f2537" 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 40 
  },
  header: {
    backgroundColor: "#1a3a52",
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2a4a62",
  },
  brandName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  exitButton: { 
    color: "#4dd4ac", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  content: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 30 
  },
  card: {
    backgroundColor: "#1a3a52",
    borderRadius: 20,
    padding: 25,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#b8c5d0",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },

  // 💡 ESTILOS PARA FRASES SUGERIDAS
  suggestionsCard: {
    backgroundColor: "#2d4a5e",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3a5a70",
  },
  suggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  suggestionsTitle: {
    color: "#4dd4ac",
    fontSize: 15,
    fontWeight: "700",
  },
  suggestionsContent: {
    padding: 15,
    paddingTop: 0,
  },
  suggestionsSubtitle: {
    color: "#b8c5d0",
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  fraseDestacada: {
    backgroundColor: "#3a5a70",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4dd4ac",
  },
  fraseDestacadaText: {
    color: "#fff",
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: 10,
    lineHeight: 22,
  },
  cambiarFraseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    backgroundColor: "rgba(77, 212, 172, 0.1)",
    borderRadius: 8,
  },
  cambiarFraseText: {
    color: "#4dd4ac",
    fontSize: 13,
    fontWeight: "600",
  },

  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444",
    marginRight: 10,
  },
  recordingText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  controlButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButton: { 
    backgroundColor: "#4dd4ac" 
  },
  recordingButton: { 
    backgroundColor: "#EF4444" 
  },
  actionsContainer: {
    gap: 12,
    marginTop: 10,
  },
  playButton: { 
    backgroundColor: "#10B981", 
    padding: 15, 
    borderRadius: 12,
    alignItems: "center",
  },
  analyzeButton: { 
    backgroundColor: "#4a90e2", 
    padding: 15, 
    borderRadius: 12,
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6c8ba3",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#6c8ba3",
    fontSize: 16,
    fontWeight: "600",
  },
  controlButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    color: "#4dd4ac",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  loadingSubtext: {
    color: "#b8c5d0",
    fontSize: 13,
    marginTop: 5,
  },
  resultsContainer: {
    marginTop: 25,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emotionsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  emotionRow: {
    marginBottom: 12,
  },
  emotionLabel: { 
    color: "white", 
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emotionBarContainer: {
    height: 10,
    backgroundColor: "#2a4a62",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 5,
  },
  emotionBar: {
    height: "100%",
    backgroundColor: "#4dd4ac",
    borderRadius: 5,
  },
  emotionValue: { 
    color: "#4dd4ac", 
    fontSize: 14, 
    fontWeight: "bold",
    textAlign: "right",
  },
  statusCard: {
    backgroundColor: "#2a4a62",
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4dd4ac",
  },
  statusTitle: {
    color: "#b8c5d0",
    fontSize: 14,
    marginBottom: 5,
  },
  statusText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  recommendationsButton: {
    backgroundColor: "#4a90e2",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  recommendationsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});