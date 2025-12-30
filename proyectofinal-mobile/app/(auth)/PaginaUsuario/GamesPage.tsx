// app/(auth)/PaginasUsuarios/gamepage.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Juego } from "../../../types/juegos.types";

export default function GamePage() {
  const router = useRouter();

  const juegos: Juego[] = [
    {
      id: 1,
      nombre: "Respiración Consciente",
      tipo_juego: "respiracion",
      descripcion: "Ejercicios de respiración guiada para reducir el estrés y la ansiedad",
      duracion_estimada: 5,
      icono: "🫁",
      color: "#4CAF50",
      nivel_dificultad: "facil",
    },
    {
      id: 2,
      nombre: "Puzzle Deslizante",
      tipo_juego: "puzzle",
      descripcion: "Resuelve el puzzle numérico para mejorar tu concentración",
      duracion_estimada: 10,
      icono: "🧩",
      color: "#2196F3",
      nivel_dificultad: "medio",
    },
    {
      id: 3,
      nombre: "Juego de Memoria",
      tipo_juego: "memoria",
      descripcion: "Encuentra los pares y ejercita tu memoria",
      duracion_estimada: 8,
      icono: "🧠",
      color: "#9C27B0",
      nivel_dificultad: "facil",
    },
    {
      id: 4,
      nombre: "Mandala para Colorear",
      tipo_juego: "mandala",
      descripcion: "Colorea mandalas y relájate mientras estimulas tu creatividad",
      duracion_estimada: 15,
      icono: "🎨",
      color: "#E91E63",
      nivel_dificultad: "facil",
    },
    {
      id: 5,
      nombre: "Jardín Mindfulness",
      tipo_juego: "mindfulness",
      descripcion: "Crea y cuida tu jardín zen virtual",
      duracion_estimada: 20,
      icono: "🧘",
      color: "#00BCD4",
      nivel_dificultad: "medio",
    },
  ];

  const handleJuegoPress = (juego: Juego) => {
    router.push({
      pathname: "/(auth)/PaginaUsuario/JuegoContainer" as any,
      params: {
        id: juego.id.toString(),
        juegoData: JSON.stringify(juego),
        estadoAntes: "neutral",
      },
    });
  };

  const getDificultadColor = (dificultad?: string) => {
    switch (dificultad) {
      case "facil":
        return "#4CAF50";
      case "medio":
        return "#FF9800";
      case "dificil":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getDificultadTexto = (dificultad?: string) => {
    switch (dificultad) {
      case "facil":
        return "Fácil";
      case "medio":
        return "Medio";
      case "dificil":
        return "Difícil";
      default:
        return "Normal";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🎮</Text>
            <Text style={styles.headerTitle}>Juegos Terapéuticos</Text>
            <Text style={styles.headerSubtitle}>
              Elige un juego para mejorar tu bienestar emocional
            </Text>
          </View>
        </LinearGradient>

        {/* BENEFICIOS */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>✨ Beneficios de los Juegos</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <Ionicons name="heart" size={24} color="#E91E63" />
              <Text style={styles.benefitText}>Reduce el estrés</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="happy" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Mejora el ánimo</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="bulb" size={24} color="#FF9800" />
              <Text style={styles.benefitText}>Estimula la mente</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="fitness" size={24} color="#2196F3" />
              <Text style={styles.benefitText}>Promueve la calma</Text>
            </View>
          </View>
        </View>

        {/* LISTA DE JUEGOS */}
        <View style={styles.juegosSection}>
          <Text style={styles.sectionTitle}>Juegos Disponibles</Text>

          {juegos.map((juego) => (
            <TouchableOpacity
              key={juego.id}
              style={styles.juegoCard}
              activeOpacity={0.8}
              onPress={() => handleJuegoPress(juego)}
            >
              {/* Icono y Header */}
              <View style={styles.juegoHeader}>
                <View
                  style={[
                    styles.juegoIconContainer,
                    { backgroundColor: juego.color + "20" },
                  ]}
                >
                  <Text style={styles.juegoIcon}>{juego.icono}</Text>
                </View>

                <View style={styles.juegoHeaderInfo}>
                  <Text style={styles.juegoNombre}>{juego.nombre}</Text>
                  <View style={styles.juegoMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#b8c5d0" />
                      <Text style={styles.metaText}>
                        {juego.duracion_estimada} min
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.dificultadBadge,
                        {
                          backgroundColor:
                            getDificultadColor(juego.nivel_dificultad) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dificultadText,
                          {
                            color: getDificultadColor(juego.nivel_dificultad),
                          },
                        ]}
                      >
                        {getDificultadTexto(juego.nivel_dificultad)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Descripción */}
              <Text style={styles.juegoDescripcion}>{juego.descripcion}</Text>

              {/* Botón de Jugar */}
              <View style={styles.juegoFooter}>
                <View
                  style={[
                    styles.playButton,
                    { backgroundColor: juego.color },
                  ]}
                >
                  <Ionicons name="play" size={18} color="#fff" />
                  <Text style={styles.playButtonText}>Jugar Ahora</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Juega de 5 a 15 minutos diarios para mejores resultados
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
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e8e8e8",
    textAlign: "center",
    lineHeight: 20,
  },
  benefitsSection: {
    padding: 20,
    paddingTop: 30,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  benefitItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1a3a52",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 13,
    color: "#b8c5d0",
    flex: 1,
  },
  juegosSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  juegoCard: {
    backgroundColor: "#1a3a52",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  juegoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  juegoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  juegoIcon: {
    fontSize: 32,
  },
  juegoHeaderInfo: {
    flex: 1,
  },
  juegoNombre: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  juegoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: "#b8c5d0",
  },
  dificultadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dificultadText: {
    fontSize: 11,
    fontWeight: "600",
  },
  juegoDescripcion: {
    fontSize: 14,
    color: "#b8c5d0",
    lineHeight: 20,
    marginBottom: 15,
  },
  juegoFooter: {
    alignItems: "flex-end",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: "#6c8ba3",
    textAlign: "center",
    lineHeight: 20,
  },
});