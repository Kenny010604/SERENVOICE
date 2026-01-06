// components/Juegos/JuegoMindfulness.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from "react-native";
import { JuegoProps } from "../../types/juegos.types";

const { width } = Dimensions.get("window");

interface Planta {
  id: string;
  emoji: string;
  nombre: string;
  costo: { agua: number; sol: number };
  puntos: number;
}

interface PlantaJardin {
  id: number;
  tipo: string;
  emoji: string;
  nombre: string;
  posX: number;
  posY: number;
  tamaño: number;
  edad: number;
}

const JuegoMindfulness: React.FC<JuegoProps> = ({ juego, onFinish, onExit }) => {
  const [jardin, setJardin] = useState<PlantaJardin[]>([]);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState<PlantaJardin | null>(null);
  const [agua, setAgua] = useState(100);
  const [sol, setSol] = useState(100);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [nivelJardin, setNivelJardin] = useState(1);

  const plantas: Planta[] = [
    { id: "flor1", emoji: "🌸", nombre: "Flor de Cerezo", costo: { agua: 10, sol: 15 }, puntos: 10 },
    { id: "flor2", emoji: "🌺", nombre: "Hibisco", costo: { agua: 15, sol: 10 }, puntos: 15 },
    { id: "flor3", emoji: "🌻", nombre: "Girasol", costo: { agua: 20, sol: 25 }, puntos: 20 },
    { id: "flor4", emoji: "🌷", nombre: "Tulipán", costo: { agua: 12, sol: 12 }, puntos: 12 },
    { id: "arbol1", emoji: "🌳", nombre: "Árbol", costo: { agua: 30, sol: 30 }, puntos: 30 },
    { id: "arbol2", emoji: "🌲", nombre: "Pino", costo: { agua: 25, sol: 35 }, puntos: 25 },
    { id: "cactus", emoji: "🌵", nombre: "Cactus", costo: { agua: 5, sol: 40 }, puntos: 15 },
    { id: "hongo", emoji: "🍄", nombre: "Hongo Mágico", costo: { agua: 8, sol: 5 }, puntos: 8 }
  ];

  useEffect(() => {
    if (juegoIniciado && tiempoInicio) {
      const timer = setInterval(() => {
        const segs = Math.floor((Date.now() - tiempoInicio) / 1000);
        setSegundos(segs);
        
        if (segs % 5 === 0) {
          setAgua(prev => Math.min(100, prev + 5));
          setSol(prev => Math.min(100, prev + 5));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [juegoIniciado, tiempoInicio, segundos]);

  useEffect(() => {
    const puntosTotales = jardin.reduce((acc, item) => {
      const planta = plantas.find(p => p.id === item.tipo);
      return acc + (planta?.puntos || 0);
    }, 0);
    
    const nuevoNivel = Math.floor(puntosTotales / 50) + 1;
    if (nuevoNivel > nivelJardin) {
      setNivelJardin(nuevoNivel);
      mostrarMensaje(`¡Nivel ${nuevoNivel} alcanzado! 🎉`);
    }
  }, [jardin]);

  const iniciarJuego = () => {
    setJuegoIniciado(true);
    setTiempoInicio(Date.now());
    setJardin([]);
    setAgua(100);
    setSol(100);
    setNivelJardin(1);
    mostrarMensaje("¡Bienvenido a tu jardín de mindfulness! 🌱");
  };

  const mostrarMensaje = (msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 3000);
  };

  const plantarPlanta = (planta: Planta) => {
    if (agua < planta.costo.agua || sol < planta.costo.sol) {
      mostrarMensaje("⚠️ No tienes suficientes recursos");
      return;
    }

    const nuevaPlanta: PlantaJardin = {
      id: Date.now(),
      tipo: planta.id,
      emoji: planta.emoji,
      nombre: planta.nombre,
      posX: Math.random() * 60 + 20,
      posY: Math.random() * 50 + 25,
      tamaño: 1,
      edad: 0
    };

    setJardin([...jardin, nuevaPlanta]);
    setAgua(agua - planta.costo.agua);
    setSol(sol - planta.costo.sol);
    mostrarMensaje(`${planta.emoji} ${planta.nombre} plantado!`);
  };

  const regarPlanta = (plantaId: number) => {
    if (agua < 5) {
      mostrarMensaje("⚠️ No tienes suficiente agua");
      return;
    }

    setJardin(jardin.map(p => 
      p.id === plantaId 
        ? { ...p, tamaño: Math.min(2, p.tamaño + 0.2), edad: p.edad + 1 }
        : p
    ));
    setAgua(agua - 5);
    mostrarMensaje("💧 Planta regada");
  };

  const eliminarPlanta = (plantaId: number) => {
    Alert.alert(
      "Eliminar planta",
      "¿Estás seguro de eliminar esta planta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            setJardin(jardin.filter(p => p.id !== plantaId));
            setPlantaSeleccionada(null);
            mostrarMensaje("🗑️ Planta eliminada");
          }
        }
      ]
    );
  };

  const calcularPuntuacion = (): number => {
    const puntosPlantas = jardin.reduce((acc, item) => {
      const planta = plantas.find(p => p.id === item.tipo);
      return acc + (planta?.puntos || 0) * item.tamaño;
    }, 0);
    
    return Math.round(puntosPlantas + nivelJardin * 10);
  };

  const formatearTiempo = (segs: number): string => {
    const mins = Math.floor(segs / 60);
    const secs = segs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!juegoIniciado) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🧘</Text>
          <Text style={styles.title}>{juego.nombre}</Text>
          <Text style={styles.description}>{juego.descripcion}</Text>
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🌱 Cultiva la Calma Interior</Text>
          <Text style={styles.introItem}>🌸 Planta flores y árboles en tu jardín virtual</Text>
          <Text style={styles.introItem}>💧 Riega tus plantas con atención plena</Text>
          <Text style={styles.introItem}>☀️ Observa cómo crecen con el tiempo</Text>
          <Text style={styles.introItem}>🦋 Descubre decoraciones especiales</Text>
          <Text style={styles.introItem}>😌 Relájate mientras cuidas tu jardín</Text>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: "#84fab0" }]}
          onPress={iniciarJuego}
        >
          <Text style={styles.buttonText}>🌱 Crear Mi Jardín</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#9e9e9e", marginTop: 15 }]}
          onPress={onExit}
        >
          <Text style={styles.buttonText}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.gameHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.gardenTitle}>Mi Jardín Zen</Text>
            <Text style={styles.gardenSubtitle}>
              Nivel {nivelJardin} • ⏱️ {formatearTiempo(segundos)}
            </Text>
          </View>
          <View style={styles.resourcesContainer}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceEmoji}>💧</Text>
              <Text style={styles.resourceValue}>{agua}%</Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceEmoji}>☀️</Text>
              <Text style={styles.resourceValue}>{sol}%</Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceEmoji}>🌱</Text>
              <Text style={styles.resourceValue}>{jardin.length}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mensaje flotante */}
      {mensaje && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{mensaje}</Text>
        </View>
      )}

      {/* Área del jardín */}
      <View style={styles.gardenArea}>
        <View style={styles.sky}>
          <Text style={styles.decoration}>☁️</Text>
          <Text style={styles.sun}>☀️</Text>
        </View>
        <View style={styles.ground}>
          {jardin.map((planta) => (
            <TouchableOpacity
              key={planta.id}
              style={[
                styles.plantaItem,
                {
                  left: `${planta.posX}%`,
                  top: `${planta.posY}%`,
                },
              ]}
              onPress={() => setPlantaSeleccionada(planta)}
            >
              <Text style={[styles.plantaEmoji, { fontSize: 30 + planta.tamaño * 20 }]}>
                {planta.emoji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Planta seleccionada */}
      {plantaSeleccionada && (
        <View style={styles.selectedPlantCard}>
          <View style={styles.selectedPlantInfo}>
            <Text style={styles.selectedPlantEmoji}>{plantaSeleccionada.emoji}</Text>
            <View style={styles.selectedPlantDetails}>
              <Text style={styles.selectedPlantName}>{plantaSeleccionada.nombre}</Text>
              <Text style={styles.selectedPlantSize}>
                Tamaño: {plantaSeleccionada.tamaño.toFixed(1)}x
              </Text>
            </View>
          </View>
          <View style={styles.selectedPlantActions}>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: "#2196F3" }]}
              onPress={() => regarPlanta(plantaSeleccionada.id)}
            >
              <Text style={styles.buttonText}>💧 Regar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: "#f44336" }]}
              onPress={() => eliminarPlanta(plantaSeleccionada.id)}
            >
              <Text style={styles.buttonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de plantas */}
      <Text style={styles.sectionTitle}>🌱 Plantas Disponibles</Text>
      <View style={styles.plantasGrid}>
        {plantas.map((planta) => {
          const puedeComprarse = agua >= planta.costo.agua && sol >= planta.costo.sol;
          
          return (
            <TouchableOpacity
              key={planta.id}
              style={[
                styles.plantaCard,
                { 
                  backgroundColor: puedeComprarse ? "#fff" : "#e0e0e0",
                  borderColor: puedeComprarse ? "#4CAF50" : "#ccc",
                }
              ]}
              onPress={() => puedeComprarse && plantarPlanta(planta)}
              disabled={!puedeComprarse}
            >
              <Text style={styles.plantaCardEmoji}>{planta.emoji}</Text>
              <Text style={styles.plantaCardName}>{planta.nombre}</Text>
              <Text style={styles.plantaCardCost}>
                💧 {planta.costo.agua} • ☀️ {planta.costo.sol}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => onFinish(calcularPuntuacion(), jardin.length > 5)}
        >
          <Text style={styles.buttonText}>
            ✅ Guardar Jardín ({calcularPuntuacion()} pts)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#9e9e9e" }]}
          onPress={onExit}
        >
          <Text style={styles.buttonText}>⏸️ Salir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  introCard: {
    backgroundColor: "#e8f5e9",
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  introItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 24,
  },
  startButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  gameHeader: {
    backgroundColor: "#84fab0",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gardenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  gardenSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  resourcesContainer: {
    flexDirection: "row",
    gap: 15,
  },
  resourceItem: {
    alignItems: "center",
  },
  resourceEmoji: {
    fontSize: 24,
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  messageBox: {
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 15,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 15,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  gardenArea: {
    height: 300,
    backgroundColor: "#87CEEB",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
  },
  sky: {
    height: "60%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  decoration: {
    fontSize: 24,
  },
  sun: {
    fontSize: 36,
  },
  ground: {
    height: "40%",
    backgroundColor: "#8B7355",
  },
  plantaItem: {
    position: "absolute",
  },
  plantaEmoji: {
    fontSize: 30,
  },
  selectedPlantCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  selectedPlantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedPlantEmoji: {
    fontSize: 40,
    marginRight: 10,
  },
  selectedPlantDetails: {
    flex: 1,
  },
  selectedPlantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  selectedPlantSize: {
    fontSize: 14,
    color: "#666",
  },
  selectedPlantActions: {
    flexDirection: "row",
    gap: 10,
  },
  smallButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  plantasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  plantaCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  plantaCardEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  plantaCardName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  plantaCardCost: {
    fontSize: 12,
    color: "#666",
  },
  actionButtons: {
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
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

export default JuegoMindfulness;