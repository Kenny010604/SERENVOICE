// components/Juegos/JuegoMemoria.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { JuegoProps } from "../../types/juegos.types";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 100) / 4;

interface Carta {
  id: number;
  emoji: string;
  emparejada: boolean;
}

const JuegoMemoria: React.FC<JuegoProps> = ({ juego, onFinish, onExit }) => {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [cartasVolteadas, setCartasVolteadas] = useState<number[]>([]);
  const [cartasEmparejadas, setCartasEmparejadas] = useState<number[]>([]);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [juegoCompletado, setJuegoCompletado] = useState(false);

  const emojis = ["😊", "❤️", "🌟", "🌈", "🦋", "🌸", "🎵", "☀️"];

  useEffect(() => {
    if (juegoIniciado && cartasEmparejadas.length === cartas.length && cartas.length > 0) {
      setJuegoCompletado(true);
    }
  }, [cartasEmparejadas, cartas]);

  const iniciarJuego = () => {
    const paresCartas = emojis.flatMap((emoji, index) => [
      { id: index * 2, emoji, emparejada: false },
      { id: index * 2 + 1, emoji, emparejada: false }
    ]);

    const cartasMezcladas = paresCartas.sort(() => Math.random() - 0.5);
    setCartas(cartasMezcladas);
    setCartasVolteadas([]);
    setCartasEmparejadas([]);
    setMovimientos(0);
    setJuegoIniciado(true);
    setJuegoCompletado(false);
  };

  const voltearCarta = (id: number) => {
    if (cartasVolteadas.length === 2 || cartasEmparejadas.includes(id)) return;
    if (cartasVolteadas.includes(id)) return;

    const nuevasVolteadas = [...cartasVolteadas, id];
    setCartasVolteadas(nuevasVolteadas);

    if (nuevasVolteadas.length === 2) {
      setMovimientos(movimientos + 1);

      const [id1, id2] = nuevasVolteadas;
      const carta1 = cartas.find(c => c.id === id1);
      const carta2 = cartas.find(c => c.id === id2);

      if (carta1 && carta2 && carta1.emoji === carta2.emoji) {
        setTimeout(() => {
          setCartasEmparejadas([...cartasEmparejadas, id1, id2]);
          setCartasVolteadas([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCartasVolteadas([]);
        }, 1000);
      }
    }
  };

  const calcularPuntuacion = (): number => {
    const movimientosOptimos = cartas.length / 2;
    const puntuacion = Math.max(0, 100 - (movimientos - movimientosOptimos) * 5);
    return Math.round(puntuacion);
  };

  if (juegoCompletado) {
    const puntuacion = calcularPuntuacion();

    return (
      <View style={styles.container}>
        <View style={styles.completedCard}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>¡Felicitaciones!</Text>
          <Text style={styles.completedText}>
            Completaste el juego en {movimientos} movimientos
          </Text>
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
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>{juego.nombre}</Text>
        <Text style={styles.description}>{juego.descripcion}</Text>
      </View>

      {!juegoIniciado ? (
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📋 Cómo jugar</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>🃏 Voltea dos cartas en cada turno</Text>
              <Text style={styles.instructionItem}>🎯 Encuentra todos los pares de emojis</Text>
              <Text style={styles.instructionItem}>
                🧠 Usa tu memoria para recordar las posiciones
              </Text>
              <Text style={styles.instructionItem}>⭐ Menos movimientos = Más puntos</Text>
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
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{movimientos}</Text>
              <Text style={styles.statLabel}>Movimientos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>
                {cartasEmparejadas.length / 2}/{cartas.length / 2}
              </Text>
              <Text style={styles.statLabel}>Pares encontrados</Text>
            </View>
          </View>

          <View style={styles.cardsGrid}>
            {cartas.map((carta) => {
              const volteada = cartasVolteadas.includes(carta.id) || cartasEmparejadas.includes(carta.id);
              const emparejada = cartasEmparejadas.includes(carta.id);

              return (
                <TouchableOpacity
                  key={carta.id}
                  onPress={() => !volteada && voltearCarta(carta.id)}
                  disabled={volteada}
                  style={[
                    styles.card,
                    {
                      backgroundColor: volteada 
                        ? (emparejada ? "#4CAF50" : "#2196F3")
                        : "#667eea",
                      opacity: emparejada ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text style={styles.cardText}>
                    {volteada ? carta.emoji : "?"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardText: {
    fontSize: 40,
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
    marginBottom: 15,
  },
  completedText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
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

export default JuegoMemoria;