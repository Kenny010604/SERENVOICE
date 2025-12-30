// components/Juegos/JuegoPuzzle.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { JuegoProps } from "../../types/juegos.types";

const { width } = Dimensions.get("window");
const PUZZLE_SIZE = Math.min(width - 80, 350);

const JuegoPuzzle: React.FC<JuegoProps> = ({ juego, onFinish, onExit }) => {
  const [piezas, setPiezas] = useState<number[]>([]);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(0);

  const TAMANO = 3; // Puzzle 3x3
  const TOTAL_PIEZAS = TAMANO * TAMANO;

  useEffect(() => {
    if (juegoIniciado && !juegoCompletado && tiempoInicio) {
      const timer = setInterval(() => {
        setSegundos(Math.floor((Date.now() - tiempoInicio) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [juegoIniciado, juegoCompletado, tiempoInicio]);

  useEffect(() => {
    if (juegoIniciado && estaResuelto()) {
      setJuegoCompletado(true);
    }
  }, [piezas]);

  const iniciarJuego = () => {
    // Crear array de números del 1 al 8, y un 0 para el espacio vacío
    let numeros = Array.from({ length: TOTAL_PIEZAS - 1 }, (_, i) => i + 1);
    numeros.push(0); // 0 representa el espacio vacío

    // Mezclar
    for (let i = 0; i < 100; i++) {
      numeros = moverAleatorio(numeros);
    }

    setPiezas(numeros);
    setMovimientos(0);
    setJuegoIniciado(true);
    setJuegoCompletado(false);
    setTiempoInicio(Date.now());
    setSegundos(0);
  };

  const moverAleatorio = (arr: number[]): number[] => {
    const posVacio = arr.indexOf(0);
    const vecinos = obtenerVecinos(posVacio);
    const posAleatorio = vecinos[Math.floor(Math.random() * vecinos.length)];
    return moverPieza(arr, posAleatorio);
  };

  const obtenerVecinos = (pos: number): number[] => {
    const vecinos: number[] = [];
    const fila = Math.floor(pos / TAMANO);
    const col = pos % TAMANO;

    if (fila > 0) vecinos.push(pos - TAMANO); // Arriba
    if (fila < TAMANO - 1) vecinos.push(pos + TAMANO); // Abajo
    if (col > 0) vecinos.push(pos - 1); // Izquierda
    if (col < TAMANO - 1) vecinos.push(pos + 1); // Derecha

    return vecinos;
  };

  const moverPieza = (arr: number[], pos: number): number[] => {
    const nuevoArr = [...arr];
    const posVacio = arr.indexOf(0);
    [nuevoArr[pos], nuevoArr[posVacio]] = [nuevoArr[posVacio], nuevoArr[pos]];
    return nuevoArr;
  };

  const handleClick = (pos: number) => {
    const posVacio = piezas.indexOf(0);
    const vecinos = obtenerVecinos(posVacio);

    if (vecinos.includes(pos)) {
      setPiezas(moverPieza(piezas, pos));
      setMovimientos(movimientos + 1);
    }
  };

  const estaResuelto = (): boolean => {
    if (piezas.length === 0) return false;
    for (let i = 0; i < piezas.length - 1; i++) {
      if (piezas[i] !== i + 1) return false;
    }
    return piezas[piezas.length - 1] === 0;
  };

  const calcularPuntuacion = (): number => {
    const movimientosOptimos = 20;
    const tiempoOptimo = 60; // segundos
    
    let puntos = 100;
    puntos -= Math.max(0, (movimientos - movimientosOptimos) * 2);
    puntos -= Math.max(0, (segundos - tiempoOptimo) * 0.5);
    
    return Math.max(0, Math.round(puntos));
  };

  const formatearTiempo = (segs: number): string => {
    const mins = Math.floor(segs / 60);
    const secs = segs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (juegoCompletado) {
    const puntuacion = calcularPuntuacion();

    return (
      <View style={styles.container}>
        <View style={styles.completedCard}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>¡Puzzle Resuelto!</Text>
          <Text style={styles.statsText}>Tiempo: {formatearTiempo(segundos)}</Text>
          <Text style={styles.statsText}>Movimientos: {movimientos}</Text>
          <Text style={styles.scoreText}>{puntuacion} puntos</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4CAF50" }]}
              onPress={iniciarJuego}
            >
              <Text style={styles.buttonText}>🔄 Jugar de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#2196F3" }]}
              onPress={() => onFinish(puntuacion, true)}
            >
              <Text style={styles.buttonText}>✅ Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🧩</Text>
        <Text style={styles.title}>{juego.nombre}</Text>
        <Text style={styles.description}>{juego.descripcion}</Text>
      </View>

      {!juegoIniciado ? (
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📋 Cómo jugar</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>🔢 Ordena los números del 1 al 8</Text>
              <Text style={styles.instructionItem}>
                🖱️ Toca las piezas junto al espacio vacío
              </Text>
              <Text style={styles.instructionItem}>
                🎯 El objetivo es ordenarlos en secuencia
              </Text>
              <Text style={styles.instructionItem}>
                ⏱️ Hazlo en el menor tiempo posible
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: "#4CAF50" }]}
            onPress={iniciarJuego}
          >
            <Text style={styles.startButtonText}>▶️ Comenzar Juego</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={styles.statValue}>{formatearTiempo(segundos)}</Text>
              <Text style={styles.statLabel}>Tiempo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{movimientos}</Text>
              <Text style={styles.statLabel}>Movimientos</Text>
            </View>
          </View>

          {/* Grid del puzzle */}
          <View style={[styles.puzzleGrid, { width: PUZZLE_SIZE, height: PUZZLE_SIZE }]}>
            {piezas.map((numero, index) => {
              const esVacio = numero === 0;
              const vecinos = obtenerVecinos(piezas.indexOf(0));
              const estaEnPosicionCorrecta = numero === index + 1 || (numero === 0 && index === TOTAL_PIEZAS - 1);
              const esMovible = vecinos.includes(index);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => !esVacio && handleClick(index)}
                  disabled={esVacio || !esMovible}
                  style={[
                    styles.puzzlePiece,
                    {
                      width: (PUZZLE_SIZE - 24) / 3,
                      height: (PUZZLE_SIZE - 24) / 3,
                      backgroundColor: esVacio 
                        ? "#f5f5f5" 
                        : estaEnPosicionCorrecta 
                          ? "#4CAF50"
                          : "#2196F3",
                      opacity: esVacio ? 0.3 : 1,
                    },
                  ]}
                >
                  {!esVacio && (
                    <Text style={styles.puzzleNumber}>{numero}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botones */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
              onPress={iniciarJuego}
            >
              <Text style={styles.buttonText}>🔄 Reiniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#9e9e9e" }]}
              onPress={onExit}
            >
              <Text style={styles.buttonText}>⏸️ Salir</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 20,
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
  instructionsContainer: {
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
  gameContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statEmoji: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  puzzleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
    gap: 8,
    marginVertical: 20,
  },
  puzzlePiece: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  puzzleNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    marginTop: "auto",
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  completedCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  completedEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  statsText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4CAF50",
    marginVertical: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
    marginTop: 20,
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

export default JuegoPuzzle;