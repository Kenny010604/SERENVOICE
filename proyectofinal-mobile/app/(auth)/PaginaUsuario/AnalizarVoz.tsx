import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudio } from "../../../hooks/useAudio";
import { useAuth } from "../../../hooks/useAuth";

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

export default function AnalizarVoz() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { analizar, loading: analyzing, resultado, error: audioError } = useAudio();
  const { user } = useAuth();

  const [recording, setRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [success, setSuccess] = useState(false);
  const [mostrarFrases, setMostrarFrases] = useState(false);
  const [fraseActual, setFraseActual] = useState("");

  // 🎲 Obtener frase aleatoria
  const obtenerFraseAleatoria = () => {
    const indice = Math.floor(Math.random() * FRASES_SUGERIDAS.length);
    setFraseActual(FRASES_SUGERIDAS[indice]);
  };

  // 🚀 Cargar frase aleatoria al montar el componente
  useEffect(() => {
    obtenerFraseAleatoria();
  }, []);

  // 🎤 Permisos de micrófono
  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Debes permitir el acceso al micrófono");
      return false;
    }
    return true;
  };

  // ▶️ Iniciar grabación
  const startRecording = async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      const startTime = Date.now();
      await recording.startAsync();

      recordingRef.current = recording;
      setRecording(true);
      setSuccess(false);
      setAudioUri(null);
      
      (recording as any)._startTime = startTime;

      console.log("🎤 Grabación iniciada");
    } catch (error) {
      console.error("❌ Error al iniciar grabación:", error);
      Alert.alert("Error", "No se pudo iniciar la grabación");
    }
  };

  // ⏹️ Detener grabación
  const stopRecording = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const startTime = (recording as any)._startTime || Date.now();
      const duration = (Date.now() - startTime) / 1000;

      setAudioUri(uri ?? null);
      setAudioDuration(duration);
      recordingRef.current = null;
      setRecording(false);

      console.log(`✅ Grabación detenida - URI: ${uri}, Duración: ${duration}s`);
    } catch (error) {
      console.error("❌ Error al detener grabación:", error);
      Alert.alert("Error", "No se pudo detener la grabación");
    }
  };

  // 📡 Enviar audio al backend
  const analyzeAudio = async () => {
    if (!audioUri) {
      Alert.alert("Aviso", "No hay audio grabado");
      return;
    }

    try {
      setSuccess(false);

      const token = await AsyncStorage.getItem("token");
      const userId = user?.id_usuario || null;

      console.log("🔍 Analizando audio...");
      console.log("📊 User ID:", userId);
      console.log("🔑 Token:", token ? "Presente ✅" : "Ausente ❌");
      console.log("⏱️ Duración:", audioDuration);
      console.log("📁 URI:", audioUri);

      const result = await analizar(
        audioUri,
        audioDuration,
        userId,
        token
      );

      if (result.success && result.data) {
        console.log("✅ Análisis completado:", result.data);
        setSuccess(true);
        
        // Construir mensaje con todas las emociones
        const emotions = result.data.emotions;
        let emotionsText = "";
        Object.keys(emotions).forEach((key) => {
          const value = emotions[key];
          emotionsText += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.toFixed(1)}%\n`;
        });

        Alert.alert(
          "✅ Análisis Completado",
          `${emotionsText}\n` +
          `Estrés: ${result.data.nivel_estres}%\n` +
          `Ansiedad: ${result.data.nivel_ansiedad}%\n` +
          `Confianza: ${(result.data.confidence * 100).toFixed(1)}%`,
          [
            { text: "Ver detalles", onPress: () => console.log(result.data) },
            { text: "OK" }
          ]
        );
      } else {
        throw new Error(audioError || "Error en el análisis");
      }
    } catch (error: any) {
      console.error("❌ Error en análisis:", error);
      Alert.alert("Error", error.message || "No se pudo analizar el audio");
    }
  };

  // 🎨 Obtener emoji y color según emoción
  const getEmotionStyle = (emotion: string) => {
    const styles: any = {
      felicidad: { emoji: "😊", color: "#4caf50" },
      tristeza: { emoji: "😢", color: "#2196f3" },
      enojo: { emoji: "😠", color: "#f44336" },
      miedo: { emoji: "😨", color: "#9c27b0" },
      sorpresa: { emoji: "😲", color: "#ff9800" },
      neutral: { emoji: "😐", color: "#757575" },
      "estrés": { emoji: "😰", color: "#e91e63" },
      estres: { emoji: "😰", color: "#e91e63" },
      ansiedad: { emoji: "😟", color: "#673ab7" },
    };
    return styles[emotion.toLowerCase()] || { emoji: "🎭", color: "#607d8b" };
  };

  // 📊 Ordenar emociones por valor
  const getSortedEmotions = () => {
    if (!resultado?.emotions) return [];
    
    return Object.entries(resultado.emotions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎙️ Análisis Emocional por Voz</Text>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>
            👤 {user.nombre} {user.apellido}
          </Text>
        </View>
      )}

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
              Lee en voz alta cualquiera de estas frases para obtener mejores resultados:
            </Text>

            {fraseActual ? (
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
            ) : (
              <TouchableOpacity
                style={styles.obtenerFraseButton}
                onPress={obtenerFraseAleatoria}
              >
                <Ionicons name="dice" size={20} color="#fff" />
                <Text style={styles.obtenerFraseText}>Obtener frase aleatoria</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {!recording ? (
        <TouchableOpacity style={styles.button} onPress={startRecording}>
          <Ionicons name="mic-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>Iniciar Grabación</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stopRecording}
        >
          <Ionicons name="stop-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>Detener Grabación</Text>
        </TouchableOpacity>
      )}

      {audioUri && !recording && (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ✅ Audio grabado ({audioDuration.toFixed(1)}s)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.analyzeButton]}
            onPress={analyzeAudio}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="analytics-outline" size={22} color="#fff" />
                <Text style={styles.buttonText}>Analizar Voz</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      {analyzing && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4dd4ac" />
          <Text style={styles.loadingText}>Analizando audio...</Text>
        </View>
      )}

      {success && resultado && (
        <View style={styles.successBox}>
          <Ionicons
            name="checkmark-circle-outline"
            size={32}
            color="#2e7d32"
          />
          <Text style={styles.successText}>
            ✅ Análisis completado exitosamente
          </Text>

          {/* 🎭 TODAS LAS EMOCIONES DETECTADAS */}
          <View style={styles.emotionsBox}>
            <Text style={styles.emotionsTitle}>🎭 Emociones Detectadas</Text>
            {getSortedEmotions().map(({ name, value }, idx) => {
              const style = getEmotionStyle(name);
              return (
                <View key={idx} style={styles.emotionItem}>
                  <View style={styles.emotionHeader}>
                    <Text style={styles.emotionEmoji}>{style.emoji}</Text>
                    <Text style={styles.emotionName}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Text>
                    <Text style={[styles.emotionValue, { color: style.color }]}>
                      {value.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.emotionBarContainer}>
                    <View
                      style={[
                        styles.emotionBar,
                        { 
                          width: `${value}%`,
                          backgroundColor: style.color
                        }
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* 📊 MÉTRICAS PRINCIPALES */}
          <View style={styles.resultsBox}>
            <Text style={styles.resultsTitle}>📊 Métricas de Bienestar</Text>
            
            <View style={styles.metricRow}>
              <Text style={styles.resultLabel}>😰 Nivel de Estrés:</Text>
              <Text style={[
                styles.resultValue,
                { color: resultado.nivel_estres > 60 ? "#e53935" : "#4caf50" }
              ]}>
                {resultado.nivel_estres}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.resultLabel}>😟 Nivel de Ansiedad:</Text>
              <Text style={[
                styles.resultValue,
                { color: resultado.nivel_ansiedad > 60 ? "#e53935" : "#4caf50" }
              ]}>
                {resultado.nivel_ansiedad}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.resultLabel}>🎯 Confianza del Modelo:</Text>
              <Text style={styles.resultValue}>
                {(resultado.confidence * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.resultLabel}>⏱️ Duración del Audio:</Text>
              <Text style={styles.resultValue}>
                {audioDuration.toFixed(1)}s
              </Text>
            </View>
          </View>

          {/* 💡 RECOMENDACIONES */}
          {resultado.recomendaciones && resultado.recomendaciones.length > 0 && (
            <View style={styles.recsBox}>
              <Text style={styles.recsTitle}>💡 Recomendaciones Personalizadas</Text>
              {resultado.recomendaciones.map((rec: any, idx: number) => (
                <View key={idx} style={styles.recItem}>
                  <Text style={styles.recType}>
                    {rec.tipo_recomendacion.toUpperCase()}
                  </Text>
                  <Text style={styles.recContent}>{rec.contenido}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#0f2537",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  userInfo: {
    backgroundColor: "#1a3a52",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  userInfoText: {
    color: "#4dd4ac",
    fontSize: 14,
    fontWeight: "600",
  },
  
  // 💡 ESTILOS PARA FRASES SUGERIDAS
  suggestionsCard: {
    backgroundColor: "#1a3a52",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2d4a5e",
  },
  suggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  suggestionsTitle: {
    color: "#4dd4ac",
    fontSize: 16,
    fontWeight: "700",
  },
  suggestionsContent: {
    padding: 15,
    paddingTop: 0,
  },
  suggestionsSubtitle: {
    color: "#b8c5d0",
    fontSize: 13,
    marginBottom: 15,
    lineHeight: 18,
  },
  fraseDestacada: {
    backgroundColor: "#2d4a5e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
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
  },
  cambiarFraseText: {
    color: "#4dd4ac",
    fontSize: 13,
    fontWeight: "600",
  },
  obtenerFraseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4dd4ac",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  obtenerFraseText: {
    color: "#0f2537",
    fontSize: 14,
    fontWeight: "700",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4caf50",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
  },
  stopButton: {
    backgroundColor: "#e53935",
  },
  analyzeButton: {
    backgroundColor: "#4a90e2",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: "#1a3a52",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  infoText: {
    color: "#4dd4ac",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingBox: {
    backgroundColor: "#1a3a52",
    padding: 20,
    borderRadius: 14,
    marginTop: 15,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#b8c5d0",
    fontSize: 14,
  },
  successBox: {
    backgroundColor: "#e8f5e9",
    padding: 18,
    borderRadius: 14,
    marginTop: 25,
  },
  successText: {
    marginTop: 10,
    color: "#2e7d32",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 15,
  },
  
  // 🎭 ESTILOS PARA EMOCIONES
  emotionsBox: {
    marginTop: 15,
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
  },
  emotionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  emotionItem: {
    marginBottom: 12,
  },
  emotionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  emotionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  emotionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  emotionValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  emotionBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  emotionBar: {
    height: "100%",
    borderRadius: 4,
  },

  // 📊 ESTILOS PARA MÉTRICAS
  resultsBox: {
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultLabel: {
    fontSize: 14,
    color: "#666",
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e7d32",
  },

  // 💡 ESTILOS PARA RECOMENDACIONES
  recsBox: {
    width: "100%",
    padding: 15,
    backgroundColor: "#fff3cd",
    borderRadius: 10,
  },
  recsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#856404",
    marginBottom: 10,
    textAlign: "center",
  },
  recItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  recType: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  recContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});