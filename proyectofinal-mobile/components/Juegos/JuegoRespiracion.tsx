// components/Juegos/JuegoRespiracion.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { JuegoProps } from "../../types/juegos.types";

type Fase = "preparacion" | "inhalar" | "mantener" | "exhalar" | "completado";

const JuegoRespiracion: React.FC<JuegoProps> = ({ juego, onFinish, onExit }) => {
  const [fase, setFase] = useState<Fase>("preparacion");
  const [ciclo, setCiclo] = useState(0);
  const [segundos, setSegundos] = useState(4);
  const [iniciado, setIniciado] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const CICLOS_TOTALES = 5;
  const TIEMPO_INHALAR = 4;
  const TIEMPO_MANTENER = 4;
  const TIEMPO_EXHALAR = 6;

  useEffect(() => {
    if (!iniciado || fase === "preparacion" || fase === "completado") return;

    if (segundos > 0) {
      const timer = setTimeout(() => setSegundos(segundos - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Cambiar de fase cuando termina el contador
    if (segundos === 0) {
      if (fase === "inhalar") {
        setFase("mantener");
        setSegundos(TIEMPO_MANTENER);
      } else if (fase === "mantener") {
        setFase("exhalar");
        setSegundos(TIEMPO_EXHALAR);
      } else if (fase === "exhalar") {
        if (ciclo + 1 >= CICLOS_TOTALES) {
          setFase("completado");
        } else {
          setCiclo(ciclo + 1);
          setFase("inhalar");
          setSegundos(TIEMPO_INHALAR);
        }
      }
    }
  }, [segundos, iniciado, fase, ciclo]);

  useEffect(() => {
    // Animar el círculo según la fase
    let toValue = 1;
    let duration = 1000;

    if (fase === "inhalar") {
      toValue = 1.8;
      duration = TIEMPO_INHALAR * 1000;
    } else if (fase === "exhalar") {
      toValue = 1;
      duration = TIEMPO_EXHALAR * 1000;
    } else if (fase === "mantener") {
      toValue = 1.8;
      duration = 1000;
    }

    Animated.timing(scaleAnim, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  }, [fase, segundos]);

  const iniciarEjercicio = () => {
    setIniciado(true);
    setFase("inhalar");
    setCiclo(0);
    setSegundos(TIEMPO_INHALAR);
  };

  const getFaseTexto = (): string => {
    switch (fase) {
      case "inhalar":
        return "Inhala profundamente";
      case "mantener":
        return "Mantén el aire";
      case "exhalar":
        return "Exhala lentamente";
      default:
        return "";
    }
  };

  const getFaseColor = (): string => {
    switch (fase) {
      case "inhalar":
        return "#4CAF50";
      case "mantener":
        return "#2196F3";
      case "exhalar":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  if (fase === "completado") {
    return (
      <View style={styles.container}>
        <View style={styles.completedCard}>
          <Text style={styles.completedEmoji}>✅</Text>
          <Text style={styles.completedTitle}>¡Ejercicio Completado!</Text>
          <Text style={styles.completedText}>
            Has completado {CICLOS_TOTALES} ciclos de respiración consciente.
          </Text>
          <Text style={styles.questionText}>¿Cómo te sientes ahora?</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4CAF50" }]}
              onPress={() => onFinish(100, true)}
            >
              <Text style={styles.buttonText}>😊 Mejor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#2196F3" }]}
              onPress={() => onFinish(50, true)}
            >
              <Text style={styles.buttonText}>😐 Igual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#FF9800" }]}
              onPress={() => onFinish(0, true)}
            >
              <Text style={styles.buttonText}>😔 No ayudó</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🫁</Text>
        <Text style={styles.title}>{juego.nombre}</Text>
        <Text style={styles.description}>{juego.descripcion}</Text>
      </View>

      {!iniciado ? (
        <View style={styles.preparationContainer}>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📋 Instrucciones</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>
                🟢 Inhala profundamente por {TIEMPO_INHALAR} segundos
              </Text>
              <Text style={styles.instructionItem}>
                🔵 Mantén el aire por {TIEMPO_MANTENER} segundos
              </Text>
              <Text style={styles.instructionItem}>
                🟠 Exhala lentamente por {TIEMPO_EXHALAR} segundos
              </Text>
              <Text style={styles.instructionItem}>
                🔄 Repite {CICLOS_TOTALES} ciclos completos
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: "#4CAF50" }]}
            onPress={iniciarEjercicio}
          >
            <Text style={styles.startButtonText}>▶️ Comenzar Ejercicio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.exerciseContainer}>
          <View style={styles.progressContainer}>
            <Text style={styles.cycleText}>
              Ciclo {ciclo + 1} de {CICLOS_TOTALES}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((ciclo + 1) / CICLOS_TOTALES) * 100}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathCircle,
                {
                  backgroundColor: getFaseColor(),
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={[styles.secondsText, { color: "#FFF" }]}>
                {segundos}
              </Text>
              <Text style={[styles.phaseText, { color: "#FFF" }]}>
                {getFaseTexto()}
              </Text>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[styles.exitButton, { backgroundColor: "#9e9e9e" }]}
            onPress={onExit}
          >
            <Text style={styles.buttonText}>⏸️ Salir</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  preparationContainer: {
    flex: 1,
    justifyContent: "center",
  },
  instructionsCard: {
    backgroundColor: "#f0f9ff",
    padding: 30,
    borderRadius: 12,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  instructionsList: {
    gap: 15,
  },
  instructionItem: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  startButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  progressContainer: {
    marginBottom: 30,
  },
  cycleText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  circleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondsText: {
    fontSize: 64,
    fontWeight: "bold",
  },
  phaseText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  exitButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  completedCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completedEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  completedText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default JuegoRespiracion;