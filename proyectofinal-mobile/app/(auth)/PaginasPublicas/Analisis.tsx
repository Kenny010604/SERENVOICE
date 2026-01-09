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
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { ApiClient, ApiEndpoints, Config } from "../../../constants";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// ✅ TIPOS
interface EmotionResult {
  emotions: Array<{ name: string; value: number }>;
  status: string;
  timestamp?: string;
}

// 🎭 FRASES LARGAS PARA LECTURA EN VOZ ALTA (igual que web)
const FRASES_SUGERIDAS = [
  "En un día soleado caminé por un sendero lleno de hojas crujientes, respiré profundamente y observé cómo la luz jugaba entre las ramas, sintiendo la calma recorrer mi cuerpo mientras avanzaba paso a paso.",
  "Había una pequeña cafetería en la esquina donde el aroma del café recién hecho llenaba el aire y la gente conversaba en voz baja, una escena cotidiana que invitaba a quedarse y escuchar el murmullo de la ciudad.",
  "El río corría pausado junto al puente, reflejando el cielo y las nubes que pasaban lentamente, mientras una brisa suave traía recuerdos de otras tardes similares que ahora parecían memorias cálidas.",
  "Una mañana comencé a ordenar mi escritorio, encontré notas antiguas y pequeñas fotos, recordé sonrisas y conversaciones y me detuve un momento para sonreír sin razón antes de seguir con el día.",
  "Caminé por la playa sintiendo la arena fría bajo los pies, vi las olas romper en la orilla y dejé que el sonido rítmico del mar me llevara siguiendo la respiración hasta relajar mi cuerpo por completo.",
  "En un jardín florecido observé los colores y los insectos trabajando, pensé en las pequeñas cosas que pasan desapercibidas y en cómo cada detalle forma parte de una escena tranquila y agradable."
];

// 🎯 BENEFICIOS DEL REGISTRO (carrusel)
const BENEFIT_CARDS = [
  { icon: "lock", title: "Privacidad Garantizada", description: "Tus grabaciones se guardan de forma segura en tu cuenta personal." },
  { icon: "chart-line", title: "Análisis Avanzado", description: "Acceso a análisis detallado y patrones emocionales en el tiempo." },
  { icon: "user", title: "Perfil Personal", description: "Mantén tu historial y seguimiento personalizado de bienestar." },
  { icon: "gamepad", title: "Juegos Terapéuticos", description: "Accede a juegos diseñados para mejorar tu bienestar emocional." },
  { icon: "users", title: "Grupos de Apoyo", description: "Únete a comunidades de apoyo y comparte experiencias." },
  { icon: "lightbulb", title: "Recomendaciones IA", description: "Recibe sugerencias personalizadas basadas en tus análisis." },
];

export default function Analisis() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmotionResult | null>(null);
  const [mostrarFrases, setMostrarFrases] = useState(true);
  const [fraseActual, setFraseActual] = useState("");
  const [recTime, setRecTime] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const sound = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // ⏱️ Timer funciones
  const startTimer = () => {
    setRecTime(0);
    timerRef.current = setInterval(() => setRecTime((t) => t + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 🎨 Obtener icono de emoción
  const getEmotionIcon = (emotion: string) => {
    const iconMap: { [key: string]: string } = {
      Felicidad: "emoticon-happy",
      felicidad: "emoticon-happy",
      Tristeza: "emoticon-sad",
      tristeza: "emoticon-sad",
      Enojo: "emoticon-angry",
      enojo: "emoticon-angry",
      enojado: "emoticon-angry",
      Neutral: "emoticon-neutral",
      neutral: "emoticon-neutral",
      Miedo: "emoticon-frown",
      miedo: "emoticon-frown",
      asustado: "emoticon-frown",
      Sorpresa: "emoticon-excited",
      sorpresa: "emoticon-excited",
      sorprendido: "emoticon-excited",
    };
    return iconMap[emotion] || "emoticon-neutral";
  };

  // 🎨 Obtener color de emoción (igual que web)
  const getEmotionColor = (emotion: string) => {
    const colorMap: { [key: string]: string } = {
      Felicidad: "#ffb703",
      felicidad: "#ffb703",
      Tristeza: "#4361ee",
      tristeza: "#4361ee",
      triste: "#4361ee",
      Enojo: "#e63946",
      enojo: "#e63946",
      enojado: "#e63946",
      Neutral: "#6c757d",
      neutral: "#6c757d",
      Miedo: "#7e22ce",
      miedo: "#7e22ce",
      asustado: "#7e22ce",
      Sorpresa: "#2a9d8f",
      sorpresa: "#2a9d8f",
      sorprendido: "#2a9d8f",
    };
    return colorMap[emotion] || "#6c757d";
  };

  // 📊 Calcular indicadores de estrés y ansiedad
  const calcularIndicadores = () => {
    if (!analysisResult || !analysisResult.emotions) return null;

    let nivelEstres = 0;
    let nivelAnsiedad = 0;

    analysisResult.emotions.forEach((emo) => {
      const nombre = emo.name.toLowerCase();
      if (["enojo", "enojado", "miedo", "asustado"].includes(nombre)) {
        nivelEstres += emo.value;
      }
      if (["miedo", "asustado"].includes(nombre)) {
        nivelAnsiedad += emo.value;
      }
    });

    return {
      estres: nivelEstres,
      ansiedad: nivelAnsiedad,
    };
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
      startTimer();
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
      stopTimer();
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
        setAnalysisResult({
          emotions: data.emotions.map((emotion: any) => ({
            name: emotion.name,
            value: parseFloat(emotion.value),
          })),
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
    setRecTime(0);
    if (sound.current) {
      sound.current.unloadAsync();
    }
  };

  // Carrusel navegación
  const handlePrevCard = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextCard = () => {
    setCarouselIndex((prev) => (prev < BENEFIT_CARDS.length - 1 ? prev + 1 : prev));
  };

  // Indicadores calculados
  const indicadores = calcularIndicadores();

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
          {/* CARD PRINCIPAL */}
          <View style={styles.card}>
            <Text style={styles.title}>Análisis Emocional por Voz</Text>
            <Text style={styles.subtitle}>
              Graba al menos 5 segundos de tu voz hablando naturalmente. La IA analizará tus emociones.
            </Text>

            {/* 💡 SECCIÓN DE FRASES - Lee en voz alta */}
            <View style={styles.phraseCard}>
              <Text style={styles.phraseLabel}>Lee en voz alta:</Text>
              <Text style={styles.phraseText}>{fraseActual}</Text>
              <TouchableOpacity
                style={styles.changePhraseButton}
                onPress={obtenerFraseAleatoria}
              >
                <Ionicons name="shuffle" size={16} color="#4dd4ac" />
                <Text style={styles.changePhraseText}>Cambiar frase</Text>
              </TouchableOpacity>
            </View>

            {/* CONTROLES DE GRABACIÓN */}
            <View style={styles.controlsRow}>
              {!isRecording ? (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startRecording}
                  disabled={isAnalyzing}
                >
                  <Ionicons name="mic" size={20} color="white" />
                  <Text style={styles.buttonText}>Empezar a grabar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop" size={20} color="white" />
                  <Text style={styles.buttonText}>Detener</Text>
                </TouchableOpacity>
              )}

              {/* Timer */}
              <View style={[styles.timerBox, isRecording && styles.timerRecording]}>
                <Text style={[styles.timerText, isRecording && styles.timerTextRecording]}>
                  {Math.floor(recTime / 60)}:{String(recTime % 60).padStart(2, "0")}
                </Text>
              </View>
            </View>

            {/* BOTONES DESPUÉS DE GRABAR */}
            {hasRecorded && !isAnalyzing && (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.playButton} onPress={playAudio}>
                  <Ionicons name="play" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Reproducir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.analyzeButton}
                  onPress={analyzeAudio}
                >
                  <Ionicons name="analytics" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Analizar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetRecording}
                >
                  <Ionicons name="refresh" size={18} color="#6c8ba3" />
                  <Text style={styles.resetButtonText}>Nueva</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* LOADING */}
            {isAnalyzing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4dd4ac" />
                <Text style={styles.loadingText}>Analizando emociones con IA...</Text>
              </View>
            )}
          </View>

          {/* CARD DE RESULTADOS */}
          {analysisResult && !isAnalyzing && (
            <View style={styles.resultsCard}>
              <View style={styles.resultsHeader}>
                <Ionicons name="stats-chart" size={22} color="#4dd4ac" />
                <Text style={styles.resultsTitle}>Resultados del Análisis</Text>
              </View>

              {/* Grid de emociones */}
              <View style={styles.emotionsGrid}>
                {analysisResult.emotions.map((emotion, idx) => {
                  const color = getEmotionColor(emotion.name);
                  const iconName = getEmotionIcon(emotion.name);
                  return (
                    <View key={idx} style={[styles.emotionCard, { borderColor: color }]}>
                      <MaterialCommunityIcons name={iconName as any} size={32} color={color} />
                      <Text style={[styles.emotionCardLabel, { color }]}>{emotion.name}</Text>
                      <Text style={styles.emotionCardValue}>{emotion.value.toFixed(1)}%</Text>
                      <View style={styles.emotionCardBar}>
                        <View 
                          style={[
                            styles.emotionCardBarFill, 
                            { width: `${Math.min(100, emotion.value)}%`, backgroundColor: color }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}

                {/* Card de Estrés */}
                {indicadores && (
                  <View style={[styles.emotionCard, { borderColor: "#e76f51" }]}>
                    <MaterialCommunityIcons name="emoticon-frown" size={32} color="#e76f51" />
                    <Text style={[styles.emotionCardLabel, { color: "#e76f51" }]}>Estrés</Text>
                    <Text style={styles.emotionCardValue}>{Math.round(indicadores.estres)}%</Text>
                    <View style={styles.emotionCardBar}>
                      <View 
                        style={[
                          styles.emotionCardBarFill, 
                          { width: `${Math.min(100, indicadores.estres)}%`, backgroundColor: "#e76f51" }
                        ]} 
                      />
                    </View>
                  </View>
                )}

                {/* Card de Ansiedad */}
                {indicadores && (
                  <View style={[styles.emotionCard, { borderColor: "#9b5de5" }]}>
                    <MaterialCommunityIcons name="emoticon-neutral" size={32} color="#9b5de5" />
                    <Text style={[styles.emotionCardLabel, { color: "#9b5de5" }]}>Ansiedad</Text>
                    <Text style={styles.emotionCardValue}>{Math.round(indicadores.ansiedad)}%</Text>
                    <View style={styles.emotionCardBar}>
                      <View 
                        style={[
                          styles.emotionCardBarFill, 
                          { width: `${Math.min(100, indicadores.ansiedad)}%`, backgroundColor: "#9b5de5" }
                        ]} 
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Estado */}
              {analysisResult.status && (
                <View style={styles.statusCard}>
                  <Text style={styles.statusTitle}>Estado del análisis:</Text>
                  <Text style={styles.statusText}>{analysisResult.status}</Text>
                </View>
              )}
            </View>
          )}

          {/* CARD DE REGISTRO CTA */}
          {analysisResult && (
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Desbloquea el Potencial Completo</Text>
              <Text style={styles.ctaSubtitle}>
                Regístrate ahora para acceder a análisis avanzados, historial de grabaciones y reportes personalizados.
              </Text>

              {/* Carrusel de beneficios */}
              <View style={styles.carouselContainer}>
                <TouchableOpacity
                  style={[styles.carouselArrow, carouselIndex === 0 && styles.carouselArrowDisabled]}
                  onPress={handlePrevCard}
                  disabled={carouselIndex === 0}
                >
                  <Text style={[styles.carouselArrowText, carouselIndex === 0 && styles.carouselArrowTextDisabled]}>‹</Text>
                </TouchableOpacity>

                <View style={styles.benefitCard}>
                  <FontAwesome5 name={BENEFIT_CARDS[carouselIndex].icon} size={28} color="#4dd4ac" />
                  <Text style={styles.benefitTitle}>{BENEFIT_CARDS[carouselIndex].title}</Text>
                  <Text style={styles.benefitDesc}>{BENEFIT_CARDS[carouselIndex].description}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.carouselArrow, carouselIndex >= BENEFIT_CARDS.length - 1 && styles.carouselArrowDisabled]}
                  onPress={handleNextCard}
                  disabled={carouselIndex >= BENEFIT_CARDS.length - 1}
                >
                  <Text style={[styles.carouselArrowText, carouselIndex >= BENEFIT_CARDS.length - 1 && styles.carouselArrowTextDisabled]}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Indicadores del carrusel */}
              <View style={styles.carouselDots}>
                {BENEFIT_CARDS.map((_, idx) => (
                  <View 
                    key={idx} 
                    style={[styles.carouselDot, idx === carouselIndex && styles.carouselDotActive]} 
                  />
                ))}
              </View>

              {/* Botón CTA */}
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push("/(auth)/PaginasPublicas/register")}
              >
                <Text style={styles.ctaButtonText}>Crear Cuenta</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* FOOTER */}
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
  container: { 
    flex: 1, 
    backgroundColor: "#0f2537" 
  },
  scrollContent: { 
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#1a3a52",
    padding: 16,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2a4a62",
  },
  brandName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  exitButton: { 
    color: "#4dd4ac", 
    fontSize: 15, 
    fontWeight: "600" 
  },
  content: { 
    flex: 1, 
    padding: 16,
  },

  // Card Principal
  card: {
    backgroundColor: "#1a3a52",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#b8c5d0",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },

  // Frase para leer
  phraseCard: {
    backgroundColor: "#2d4a5e",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  phraseLabel: {
    color: "#4dd4ac",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  phraseText: {
    color: "#fff",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 10,
  },
  changePhraseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "rgba(77, 212, 172, 0.15)",
    borderRadius: 8,
  },
  changePhraseText: {
    color: "#4dd4ac",
    fontSize: 13,
    fontWeight: "600",
  },

  // Controles
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  startButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4dd4ac",
    padding: 14,
    borderRadius: 10,
  },
  stopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ff6b6b",
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  timerBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2d4a5e",
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  timerRecording: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  timerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  timerTextRecording: {
    color: "#EF4444",
  },

  // Acciones post-grabación
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 10,
  },
  analyzeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#4a90e2",
    padding: 12,
    borderRadius: 10,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#6c8ba3",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  resetButtonText: {
    color: "#6c8ba3",
    fontSize: 14,
    fontWeight: "600",
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    color: "#4dd4ac",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
  },

  // Resultados Card
  resultsCard: {
    backgroundColor: "#1a3a52",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  resultsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Grid de emociones
  emotionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  emotionCard: {
    width: (width - 72) / 2,
    backgroundColor: "#2d4a5e",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 6,
  },
  emotionCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    textTransform: "capitalize",
  },
  emotionCardValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4,
  },
  emotionCardBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#1a3a52",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  },
  emotionCardBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Status
  statusCard: {
    backgroundColor: "#2d4a5e",
    padding: 14,
    borderRadius: 10,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#4dd4ac",
  },
  statusTitle: {
    color: "#b8c5d0",
    fontSize: 13,
    marginBottom: 4,
  },
  statusText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // CTA Card
  ctaCard: {
    backgroundColor: "#1a3a52",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  ctaTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: "#b8c5d0",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },

  // Carrusel
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  carouselArrow: {
    padding: 8,
  },
  carouselArrowDisabled: {
    opacity: 0.3,
  },
  carouselArrowText: {
    color: "#4dd4ac",
    fontSize: 32,
    fontWeight: "bold",
  },
  carouselArrowTextDisabled: {
    color: "#6c8ba3",
  },
  benefitCard: {
    flex: 1,
    backgroundColor: "#2d4a5e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 8,
  },
  benefitTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  benefitDesc: {
    color: "#b8c5d0",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3a5a70",
  },
  carouselDotActive: {
    backgroundColor: "#4dd4ac",
    width: 20,
  },

  // CTA Button
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4dd4ac",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50,
    alignSelf: "center",
  },
  ctaButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Footer
  footer: {
    backgroundColor: "#1a3a52",
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2a4a62",
  },
  footerText: {
    color: "#6c8ba3",
    fontSize: 12,
  },
});