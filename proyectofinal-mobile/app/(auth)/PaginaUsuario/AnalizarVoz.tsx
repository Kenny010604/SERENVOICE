import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudio } from "../../../hooks/useAudio";
import { useAuth } from "../../../hooks/useAuth";
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);


const { width } = Dimensions.get("window");

// 📝 Frases largas para lectura (como en web)
const FRASES_SUGERIDAS = [
  "Me siento tranquilo hoy, aunque a veces me preocupo por el futuro y las decisiones que debo tomar.",
  "Ayer tuve un día complicado en el trabajo, pero logré resolver los problemas con calma y paciencia.",
  "A veces me siento abrumado con tantas responsabilidades, pero intento mantenerme positivo.",
  "Estoy trabajando en mejorar mi bienestar emocional y mental cada día que pasa.",
  "Me gusta pasar tiempo con mi familia y amigos, eso me hace sentir muy feliz y en paz.",
  "Hoy desperté sintiéndome un poco cansado, pero con la motivación de hacer las cosas bien.",
  "Creo que expresar mis emociones me ayuda a sentirme mejor y a conectar con los demás.",
  "A veces la ansiedad me visita, pero he aprendido técnicas para manejarla mejor.",
  "Estoy agradecido por las pequeñas cosas de la vida que me hacen sonreír cada día.",
  "El estrés del trabajo puede ser difícil, pero encontrar momentos de calma es importante.",
];

export default function AnalizarVoz() {
  const { user } = useAuth();
  const { analizar, loading: analyzing, resultado, error: audioError } = useAudio();

  // Estados
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [fraseActual, setFraseActual] = useState(FRASES_SUGERIDAS[0]);
  const [recTime, setRecTime] = useState(0);
  
  // Timer ref
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  

  useEffect(() => {
    obtenerFraseAleatoria();
  }, []);

  // Actualizar resultado cuando cambie
  useEffect(() => {
    if (resultado) {
      setAnalysisResult(resultado);
    }
  }, [resultado]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const obtenerFraseAleatoria = () => {
    const randomIndex = Math.floor(Math.random() * FRASES_SUGERIDAS.length);
    setFraseActual(FRASES_SUGERIDAS[randomIndex]);
  };

  // 🎙️ Iniciar grabación
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere acceso al micrófono");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setAudioUri(null);
      setAnalysisResult(null);
      setRecTime(0);

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecTime((prev) => prev + 1);
      }, 1000);

      console.log("🎙️ Grabación iniciada");
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      Alert.alert("Error", "No se pudo iniciar la grabación");
    }
  };

  // ⏹️ Detener grabación
  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Detener timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const status = await recording.getStatusAsync();
      const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
      setAudioDuration(duration);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setIsRecording(false);

      console.log("⏹️ Grabación detenida:", uri);
    } catch (error) {
      console.error("Error al detener grabación:", error);
      setIsRecording(false);
    }
  };

  // 🔍 Analizar audio
  const analyzeAudio = async () => {
    if (!audioUri) {
      Alert.alert("Error", "No hay audio para analizar");
      return;
    }

    try {
      console.log("🔍 Analizando audio:", audioUri);
      const token = await AsyncStorage.getItem("token");
      const userId = user?.id_usuario || null;
      await analizar(audioUri, audioDuration, userId, token);
    } catch (error: any) {
      console.error("❌ Error en análisis:", error);
      Alert.alert("Error", error.message || "No se pudo analizar el audio");
    }
  };

  // 🔥 Calcular indicadores de estrés y ansiedad
  const calcularIndicadores = () => {
    if (!analysisResult?.emotions) return null;

    let nivelEstres = 0;
    let nivelAnsiedad = 0;

    Object.entries(analysisResult.emotions).forEach(([name, value]: [string, any]) => {
      const lowerName = name.toLowerCase();
      if (["enojo", "miedo", "asustado", "estres", "estrés"].includes(lowerName)) {
        nivelEstres += value;
      }
      if (["miedo", "asustado", "ansiedad"].includes(lowerName)) {
        nivelAnsiedad += value;
      }
    });

    const calcNivel = (valor: number) => {
      if (valor >= 70) return { text: "ALTO", color: "#e53935" };
      if (valor >= 40) return { text: "MEDIO", color: "#ff9800" };
      return { text: "BAJO", color: "#4caf50" };
    };

    return {
      estres: { porcentaje: Math.min(100, nivelEstres), nivel: calcNivel(nivelEstres) },
      ansiedad: { porcentaje: Math.min(100, nivelAnsiedad), nivel: calcNivel(nivelAnsiedad) },
    };
  };

  // 🎨 Obtener icono y color según emoción
  const getEmotionStyle = (emotion: string) => {
    const emotionStyles: Record<string, { icon: string; color: string; iconType: "ionicons" | "fa5" }> = {
      felicidad: { icon: "happy", color: "#ffb703", iconType: "ionicons" },
      tristeza: { icon: "sad", color: "#4361ee", iconType: "ionicons" },
      enojo: { icon: "angry", color: "#e63946", iconType: "fa5" },
      miedo: { icon: "ghost", color: "#7e22ce", iconType: "fa5" },
      sorpresa: { icon: "surprise", color: "#2a9d8f", iconType: "fa5" },
      neutral: { icon: "meh", color: "#6c757d", iconType: "fa5" },
      "estrés": { icon: "tired", color: "#e76f51", iconType: "fa5" },
      estres: { icon: "tired", color: "#e76f51", iconType: "fa5" },
      ansiedad: { icon: "flushed", color: "#9b5de5", iconType: "fa5" },
    };
    return emotionStyles[emotion.toLowerCase()] || { icon: "help-circle", color: "#607d8b", iconType: "ionicons" };
  };

  // 📊 Ordenar emociones por valor
  const getSortedEmotions = () => {
    if (!analysisResult?.emotions) return [];
    return Object.entries(analysisResult.emotions)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);
  };

  const indicadores = calcularIndicadores();

  // 🎭 Renderizar icono de emoción
  const renderEmotionIcon = (emotionStyle: { icon: string; color: string; iconType: string }) => {
    if (emotionStyle.iconType === "fa5") {
      return <FontAwesome5 name={emotionStyle.icon} size={28} color={emotionStyle.color} />;
    }
    return <Ionicons name={emotionStyle.icon as any} size={28} color={emotionStyle.color} />;
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={["#1a3a52", "#0f2537"]}
        style={styles.header}
      >
        <Text style={styles.title}>🎙️ Análisis Emocional por Voz</Text>
        <Text style={styles.subtitle}>
          Graba al menos 5 segundos de tu voz hablando naturalmente. La IA analizará tus emociones.
        </Text>
      </LinearGradient>

      {/* Tarjeta de frase sugerida */}
      <View style={styles.card}>
        <View style={styles.phraseHeader}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#4dd4ac" />
          <Text style={styles.phraseLabel}>Lee en voz alta:</Text>
        </View>
        <Text style={styles.phraseText}>"{fraseActual}"</Text>
        <TouchableOpacity style={styles.changeButton} onPress={obtenerFraseAleatoria}>
          <Ionicons name="shuffle" size={16} color="#4dd4ac" />
          <Text style={styles.changeButtonText}>Cambiar frase</Text>
        </TouchableOpacity>
      </View>

      {/* Controles de grabación */}
      <View style={styles.card}>
        <View style={styles.controlsRow}>
          {!isRecording ? (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
              <Ionicons name="mic" size={24} color="#fff" />
              <Text style={styles.buttonText}>Empezar a grabar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.buttonText}>Detener</Text>
            </TouchableOpacity>
          )}

          {/* Timer */}
          <View style={[styles.timerBox, isRecording && styles.timerBoxRecording]}>
            <Text style={[styles.timerText, isRecording && styles.timerTextRecording]}>
              {Math.floor(recTime / 60)}:{String(recTime % 60).padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* Indicador de grabación activa */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Grabando...</Text>
          </View>
        )}

        {/* Audio grabado */}
        {audioUri && !isRecording && (
          <View style={styles.audioInfo}>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            <Text style={styles.audioInfoText}>
              Audio grabado ({audioDuration.toFixed(1)}s)
            </Text>
          </View>
        )}

        {/* Botón analizar */}
        {audioUri && !isRecording && (
          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.buttonDisabled]}
            onPress={analyzeAudio}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="analytics" size={22} color="#fff" />
                <Text style={styles.buttonText}>Analizar</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {analyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4dd4ac" />
            <Text style={styles.loadingText}>Analizando emociones con IA...</Text>
          </View>
        )}
      </View>

      {/* Resultados del análisis */}
      {analysisResult && analysisResult.emotions && (
        <View style={styles.card}>
          <View style={styles.resultsHeader}>
            <Ionicons name="bar-chart" size={22} color="#4dd4ac" />
            <Text style={styles.resultsTitle}>Resultados del Análisis</Text>
          </View>

          {/* Grid de emociones */}
          <View style={styles.emotionsGrid}>
            {getSortedEmotions().slice(0, 6).map((emotion, idx) => {
              const emotionStyle = getEmotionStyle(emotion.name);
              return (
                <View key={idx} style={[styles.emotionCard, { borderColor: emotionStyle.color }]}>
                  {renderEmotionIcon(emotionStyle)}
                  <Text style={[styles.emotionLabel, { color: emotionStyle.color }]}>
                    {emotion.name.charAt(0).toUpperCase() + emotion.name.slice(1)}
                  </Text>
                  <Text style={styles.emotionValue}>{emotion.value.toFixed(1)}%</Text>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(100, emotion.value)}%`, backgroundColor: emotionStyle.color }
                      ]}
                    />
                  </View>
                </View>
              );
            })}

            {/* Tarjeta de Estrés */}
            {indicadores && (
              <View style={[styles.emotionCard, { borderColor: "#e76f51" }]}>
                <FontAwesome5 name="tired" size={28} color="#e76f51" />
                <Text style={[styles.emotionLabel, { color: "#e76f51" }]}>Estrés</Text>
                <Text style={styles.emotionValue}>
                  {Math.round(indicadores.estres.porcentaje)}%
                </Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${indicadores.estres.porcentaje}%`, backgroundColor: "#e76f51" }
                    ]}
                  />
                </View>
                <View style={[styles.levelBadge, { backgroundColor: indicadores.estres.nivel.color }]}>
                  <Text style={styles.levelText}>{indicadores.estres.nivel.text}</Text>
                </View>
              </View>
            )}

            {/* Tarjeta de Ansiedad */}
            {indicadores && (
              <View style={[styles.emotionCard, { borderColor: "#9b5de5" }]}>
                <FontAwesome5 name="flushed" size={28} color="#9b5de5" />
                <Text style={[styles.emotionLabel, { color: "#9b5de5" }]}>Ansiedad</Text>
                <Text style={styles.emotionValue}>
                  {Math.round(indicadores.ansiedad.porcentaje)}%
                </Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${indicadores.ansiedad.porcentaje}%`, backgroundColor: "#9b5de5" }
                    ]}
                  />
                </View>
                <View style={[styles.levelBadge, { backgroundColor: indicadores.ansiedad.nivel.color }]}>
                  <Text style={styles.levelText}>{indicadores.ansiedad.nivel.text}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Métricas adicionales */}
      {analysisResult && (
        <View style={styles.card}>
          <View style={styles.resultsHeader}>
            <Ionicons name="stats-chart" size={22} color="#4dd4ac" />
            <Text style={styles.resultsTitle}>Métricas de Bienestar</Text>
          </View>

          <View style={styles.metricsList}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>😰 Nivel de Estrés</Text>
              <Text style={[
                styles.metricValue,
                { color: analysisResult.nivel_estres > 60 ? "#e53935" : "#4caf50" }
              ]}>
                {analysisResult.nivel_estres}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>😟 Nivel de Ansiedad</Text>
              <Text style={[
                styles.metricValue,
                { color: analysisResult.nivel_ansiedad > 60 ? "#e53935" : "#4caf50" }
              ]}>
                {analysisResult.nivel_ansiedad}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>🎯 Confianza del Modelo</Text>
              <Text style={styles.metricValue}>
                {(analysisResult.confidence * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>⏱️ Duración del Audio</Text>
              <Text style={styles.metricValue}>{audioDuration.toFixed(1)}s</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recomendaciones */}
      {analysisResult?.recomendaciones && analysisResult.recomendaciones.length > 0 && (
        <View style={styles.card}>
          <View style={styles.resultsHeader}>
            <Ionicons name="bulb" size={22} color="#ffc107" />
            <Text style={styles.resultsTitle}>Recomendaciones Personalizadas</Text>
          </View>

          {analysisResult.recomendaciones.map((rec: any, idx: number) => (
            <View key={idx} style={styles.recCard}>
              <View style={styles.recHeader}>
                <Text style={styles.recType}>
                  {rec.tipo_recomendacion?.toUpperCase() || "GENERAL"}
                </Text>
              </View>
              <Text style={styles.recContent}>{rec.contenido}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#0f2537",
  },
  container: {
    paddingBottom: 20,
  },
  header: {
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#b8c5d0",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#1a3a52",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  phraseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  phraseLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4dd4ac",
    marginLeft: 8,
  },
  phraseText: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#fff",
    lineHeight: 22,
    marginBottom: 12,
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  changeButtonText: {
    color: "#4dd4ac",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recordButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4dd4ac",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  stopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  timerBox: {
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#2d4a5e",
    borderRadius: 12,
    alignItems: "center",
  },
  timerBoxRecording: {
    backgroundColor: "#ffebee",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  timerTextRecording: {
    color: "#d32f2f",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff6b6b",
    marginRight: 8,
  },
  recordingText: {
    color: "#ff6b6b",
    fontWeight: "600",
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: "#2d4a5e",
    borderRadius: 8,
  },
  audioInfoText: {
    color: "#4caf50",
    fontWeight: "600",
    marginLeft: 8,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a90e2",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 16,
    padding: 20,
  },
  loadingText: {
    color: "#b8c5d0",
    marginTop: 12,
    fontSize: 14,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
  emotionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  emotionCard: {
    width: (width - 64) / 2 - 6,
    backgroundColor: "#0f2537",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 3,
  },
  emotionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  emotionValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#2d4a5e",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  levelBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  metricsList: {
    gap: 12,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2d4a5e",
  },
  metricLabel: {
    fontSize: 14,
    color: "#b8c5d0",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4caf50",
  },
  recCard: {
    backgroundColor: "#0f2537",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  recHeader: {
    marginBottom: 6,
  },
  recType: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffc107",
    letterSpacing: 0.5,
  },
  recContent: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
  },
});