// components/Juegos/JuegoMandalaCanvas.tsx
// REQUIERE: npm install @shopify/react-native-skia
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, PanResponder } from "react-native";
import { Canvas, Path, Skia, SkPath } from "@shopify/react-native-skia";
import { JuegoProps } from "../../types/juegos.types";

const { width } = Dimensions.get("window");
const CANVAS_SIZE = Math.min(width - 40, 400);

interface Mandala {
  id: number;
  nombre: string;
  emoji: string;
  descripcion: string;
  paths: string[];
  dificultad: "fácil" | "media" | "difícil";
}

interface Trazo {
  path: SkPath;
  color: string;
  width: number;
}

const JuegoMandalaCanvas: React.FC<JuegoProps> = ({ juego, onFinish, onExit }) => {
  const [colorActual, setColorActual] = useState("#FF6B9D");
  const [grosorLinea, setGrosorLinea] = useState(4);
  const [mandalaSeleccionado, setMandalaSeleccionado] = useState<Mandala | null>(null);
  const [trazos, setTrazos] = useState<Trazo[]>([]);
  const [trazoActual, setTrazoActual] = useState<SkPath | null>(null);
  const [porcentajeCompletado, setPorcentajeCompletado] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [mostrarSeleccion, setMostrarSeleccion] = useState(true);

  const paleta = [
    { color: "#FF6B9D", nombre: "Rosa" },
    { color: "#C44569", nombre: "Vino" },
    { color: "#F8B500", nombre: "Oro" },
    { color: "#FFA801", nombre: "Naranja" },
    { color: "#4ECDC4", nombre: "Turquesa" },
    { color: "#44A08D", nombre: "Verde Agua" },
    { color: "#6C5CE7", nombre: "Morado" },
    { color: "#A29BFE", nombre: "Lavanda" },
    { color: "#00B894", nombre: "Verde" },
    { color: "#00D2D3", nombre: "Cyan" },
    { color: "#FD79A8", nombre: "Rosa Claro" },
    { color: "#FDCB6E", nombre: "Amarillo" },
    { color: "#74B9FF", nombre: "Azul Cielo" },
    { color: "#E17055", nombre: "Coral" },
    { color: "#2D3436", nombre: "Negro" },
    { color: "#FFFFFF", nombre: "Blanco" }
  ];

  const mandalas: Mandala[] = [
    {
      id: 1,
      nombre: "Flor de Loto",
      emoji: "🪷",
      descripcion: "Símbolo de paz y serenidad",
      dificultad: "fácil",
      paths: [
        "M200,200 m-150,0 a150,150 0 1,0 300,0 a150,150 0 1,0 -300,0",
        "M200,200 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0",
        "M200,200 m-50,0 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0",
        "M200,50 L200,200 M150,80 L200,200 M250,80 L200,200",
        "M200,350 L200,200 M150,320 L200,200 M250,320 L200,200",
        "M50,200 L200,200 M80,150 L200,200 M80,250 L200,200",
        "M350,200 L200,200 M320,150 L200,200 M320,250 L200,200"
      ]
    },
    {
      id: 2,
      nombre: "Estrella Sagrada",
      emoji: "⭐",
      descripcion: "Para centrar la energía",
      dificultad: "media",
      paths: [
        "M200,200 L200,60 L215,155 L310,155 L235,210 L265,305 L200,250 L135,305 L165,210 L90,155 L185,155 Z",
        "M200,200 m-140,0 a140,140 0 1,0 280,0 a140,140 0 1,0 -280,0",
        "M200,200 m-90,0 a90,90 0 1,0 180,0 a90,90 0 1,0 -180,0",
        "M200,200 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0"
      ]
    },
    {
      id: 3,
      nombre: "Círculos Zen",
      emoji: "🔵",
      descripcion: "Equilibrio y armonía",
      dificultad: "fácil",
      paths: [
        "M200,200 m-180,0 a180,180 0 1,0 360,0 a180,180 0 1,0 -360,0",
        "M200,200 m-140,0 a140,140 0 1,0 280,0 a140,140 0 1,0 -280,0",
        "M200,200 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0",
        "M200,200 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0",
        "M200,200 m-25,0 a25,25 0 1,0 50,0 a25,25 0 1,0 -50,0"
      ]
    },
    {
      id: 4,
      nombre: "Pétalos de Paz",
      emoji: "🌸",
      descripcion: "Calma y tranquilidad",
      dificultad: "media",
      paths: [
        "M200,200 m-160,0 a160,160 0 1,0 320,0 a160,160 0 1,0 -320,0",
        "M200,40 Q200,120 200,200 Q200,120 200,40",
        "M200,360 Q200,280 200,200 Q200,280 200,360",
        "M40,200 Q120,200 200,200 Q120,200 40,200",
        "M360,200 Q280,200 200,200 Q280,200 360,200",
        "M80,80 Q140,140 200,200 Q140,140 80,80",
        "M320,320 Q260,260 200,200 Q260,260 320,320",
        "M320,80 Q260,140 200,200 Q260,140 320,80",
        "M80,320 Q140,260 200,200 Q140,260 80,320"
      ]
    },
    {
      id: 5,
      nombre: "Geometría Sagrada",
      emoji: "🔷",
      descripcion: "Concentración profunda",
      dificultad: "difícil",
      paths: [
        "M200,200 m-170,0 a170,170 0 1,0 340,0 a170,170 0 1,0 -340,0",
        "M200,30 L330,200 L200,370 L70,200 Z",
        "M200,80 L280,200 L200,320 L120,200 Z",
        "M200,30 L200,370 M70,200 L330,200",
        "M200,200 m-120,0 a120,120 0 1,0 240,0 a120,120 0 1,0 -240,0",
        "M200,200 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0"
      ]
    },
    {
      id: 6,
      nombre: "Sol Radiante",
      emoji: "☀️",
      descripcion: "Energía y vitalidad",
      dificultad: "media",
      paths: [
        "M200,200 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0",
        "M200,200 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0",
        "M200,30 L200,100 M200,300 L200,370",
        "M70,70 L130,130 M270,270 L330,330",
        "M30,200 L100,200 M300,200 L370,200",
        "M70,330 L130,270 M270,130 L330,70",
        "M200,200 L200,30 M200,200 L330,70 M200,200 L370,200 M200,200 L330,330",
        "M200,200 L200,370 M200,200 L70,330 M200,200 L30,200 M200,200 L70,70"
      ]
    }
  ];

  // Timer effect
  useEffect(() => {
    if (tiempoInicio !== null) {
      const interval = setInterval(() => {
        setSegundos(Math.floor((Date.now() - tiempoInicio) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tiempoInicio]);

  // Calcular progreso basado en trazos
  useEffect(() => {
    if (trazos.length > 0) {
      const progreso = Math.min(Math.floor((trazos.length / 20) * 100), 100);
      setPorcentajeCompletado(progreso);
    }
  }, [trazos.length]);

  const seleccionarMandala = (mandala: Mandala) => {
    setMandalaSeleccionado(mandala);
    setMostrarSeleccion(false);
    setTiempoInicio(Date.now());
    setTrazos([]);
    setPorcentajeCompletado(0);
    setSegundos(0);
  };

  // PanResponder para manejar el dibujo
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      try {
        const newPath = Skia.Path.Make();
        newPath.moveTo(locationX, locationY);
        setTrazoActual(newPath);
      } catch (error) {
        console.log("Error al iniciar trazo:", error);
      }
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (trazoActual) {
        try {
          const newPath = trazoActual.copy();
          newPath.lineTo(locationX, locationY);
          setTrazoActual(newPath);
        } catch (error) {
          console.log("Error al dibujar:", error);
        }
      }
    },
    onPanResponderRelease: () => {
      if (trazoActual) {
        try {
          setTrazos([...trazos, { path: trazoActual, color: colorActual, width: grosorLinea }]);
          setTrazoActual(null);
        } catch (error) {
          console.log("Error al finalizar trazo:", error);
        }
      }
    },
  });

  const limpiarCanvas = () => {
    Alert.alert(
      "Limpiar Lienzo",
      "¿Deseas borrar todo tu progreso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: () => {
            setTrazos([]);
            setTrazoActual(null);
            setPorcentajeCompletado(0);
          }
        }
      ]
    );
  };

  const deshacerTrazo = () => {
    if (trazos.length > 0) {
      setTrazos(trazos.slice(0, -1));
    }
  };

  const finalizarJuego = () => {
    const puntuacion = Math.floor((porcentajeCompletado * 0.7) + ((300 - Math.min(segundos, 300)) / 300 * 30));
    Alert.alert(
      "🎨 ¡Mandala Completado!",
      `¡Excelente trabajo!\n\n⏱️ Tiempo: ${segundos}s\n🎨 Completado: ${porcentajeCompletado}%\n⭐ Puntuación: ${puntuacion}\n\n¿Cómo te sientes después de esta sesión?`,
      [
        {
          text: "😌 Relajado",
          onPress: () => onFinish(puntuacion, true)
        },
        {
          text: "😊 Mejor",
          onPress: () => onFinish(puntuacion, true)
        }
      ]
    );
  };

  const cambiarMandala = () => {
    Alert.alert(
      "Cambiar Mandala",
      "¿Quieres elegir otro mandala? Se perderá tu progreso actual.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cambiar",
          onPress: () => {
            setMostrarSeleccion(true);
            setTrazos([]);
            setTrazoActual(null);
          }
        }
      ]
    );
  };

  if (mostrarSeleccion) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🧘‍♀️</Text>
          <Text style={styles.title}>Arte Mandala</Text>
          <Text style={styles.description}>
            Colorea mandalas para reducir el estrés y encontrar paz interior
          </Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>✨ Beneficios Terapéuticos</Text>
          <Text style={styles.benefitItem}>🧠 Reduce el estrés y la ansiedad</Text>
          <Text style={styles.benefitItem}>🎯 Mejora la concentración</Text>
          <Text style={styles.benefitItem}>😌 Promueve la relajación profunda</Text>
          <Text style={styles.benefitItem}>🎨 Estimula la creatividad</Text>
          <Text style={styles.benefitItem}>💆‍♀️ Práctica de mindfulness</Text>
        </View>

        <Text style={styles.sectionTitle}>Elige tu Mandala</Text>

        <View style={styles.mandalasGrid}>
          {mandalas.map((mandala) => (
            <TouchableOpacity
              key={mandala.id}
              style={styles.mandalaCard}
              onPress={() => seleccionarMandala(mandala)}
              activeOpacity={0.7}
            >
              <Text style={styles.mandalaEmoji}>{mandala.emoji}</Text>
              <Text style={styles.mandalaName}>{mandala.nombre}</Text>
              <Text style={styles.mandalaDescription}>{mandala.descripcion}</Text>
              <View style={[styles.dificultadBadge, 
                mandala.dificultad === "fácil" && styles.facilBadge,
                mandala.dificultad === "media" && styles.mediaBadge,
                mandala.dificultad === "difícil" && styles.dificilBadge
              ]}>
                <Text style={styles.dificultadText}>
                  {mandala.dificultad === "fácil" && "⭐ Fácil"}
                  {mandala.dificultad === "media" && "⭐⭐ Medio"}
                  {mandala.dificultad === "difícil" && "⭐⭐⭐ Difícil"}
                </Text>
              </View>
              <View style={styles.comenzarButton}>
                <Text style={styles.comenzarText}>Comenzar →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gameHeader}>
        <View style={styles.gameHeaderTop}>
          <Text style={styles.gameTitle}>
            {mandalaSeleccionado?.emoji} {mandalaSeleccionado?.nombre}
          </Text>
          <TouchableOpacity onPress={cambiarMandala} style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>⏱️ {Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, '0')}</Text>
          <Text style={styles.statText}>🎨 {porcentajeCompletado}%</Text>
          <Text style={styles.statText}>✏️ {trazos.length} trazos</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${porcentajeCompletado}%` }]} />
        </View>
      </View>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Canvas style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
          {mandalaSeleccionado?.paths.map((pathData, index) => {
            try {
              const path = Skia.Path.MakeFromSVGString(pathData);
              if (path) {
                return (
                  <Path
                    key={`mandala-${index}`}
                    path={path}
                    color="#E0E0E0"
                    style="stroke"
                    strokeWidth={2}
                  />
                );
              }
            } catch (error) {
              console.log("Error al renderizar path del mandala:", error);
            }
            return null;
          })}

          {trazos.map((trazo, index) => (
            <Path
              key={`trazo-${index}`}
              path={trazo.path}
              color={trazo.color}
              style="stroke"
              strokeWidth={trazo.width}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}

          {trazoActual && (
            <Path
              path={trazoActual}
              color={colorActual}
              style="stroke"
              strokeWidth={grosorLinea}
              strokeCap="round"
              strokeJoin="round"
            />
          )}
        </Canvas>
      </View>

      <View style={styles.paletaContainer}>
        <Text style={styles.paletaTitle}>🎨 Colores</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.paletaScroll}>
            {paleta.map((item) => (
              <TouchableOpacity
                key={item.color}
                style={[
                  styles.colorButton,
                  { 
                    backgroundColor: item.color,
                    borderWidth: colorActual === item.color ? 4 : 2,
                    borderColor: colorActual === item.color ? "#333" : "#ddd",
                    transform: colorActual === item.color ? [{ scale: 1.1 }] : [{ scale: 1 }]
                  }
                ]}
                onPress={() => setColorActual(item.color)}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.grosorContainer}>
        <Text style={styles.grosorTitle}>✏️ Grosor del Trazo</Text>
        <View style={styles.grosorButtons}>
          {[2, 4, 6, 8, 10].map((grosor) => (
            <TouchableOpacity
              key={grosor}
              style={[
                styles.grosorButton,
                grosorLinea === grosor && styles.grosorButtonActive
              ]}
              onPress={() => setGrosorLinea(grosor)}
            >
              <View style={[styles.grosorPreview, { 
                width: grosor * 2, 
                height: grosor * 2,
                backgroundColor: grosorLinea === grosor ? "#fff" : "#333"
              }]} />
              <Text style={[
                styles.grosorButtonText,
                grosorLinea === grosor && styles.grosorButtonTextActive
              ]}>{grosor}px</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { opacity: trazos.length === 0 ? 0.5 : 1 }]}
          onPress={deshacerTrazo}
          disabled={trazos.length === 0}
        >
          <Text style={styles.quickActionText}>↶ Deshacer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: "#FF5252" }]}
          onPress={limpiarCanvas}
        >
          <Text style={styles.quickActionText}>🗑️ Limpiar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={finalizarJuego}
        >
          <Text style={styles.buttonText}>✅ Guardar y Finalizar</Text>
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
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  emoji: {
    fontSize: 70,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 24,
  },
  benefitsCard: {
    backgroundColor: "#e8f5e9",
    margin: 20,
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 15,
    textAlign: "center",
  },
  benefitItem: {
    fontSize: 16,
    color: "#1b5e20",
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  mandalasGrid: {
    padding: 20,
    gap: 20,
  },
  mandalaCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  mandalaEmoji: {
    fontSize: 70,
    marginBottom: 15,
  },
  mandalaName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  mandalaDescription: {
    fontSize: 15,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 15,
  },
  dificultadBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  facilBadge: {
    backgroundColor: "#e8f5e9",
  },
  mediaBadge: {
    backgroundColor: "#fff3e0",
  },
  dificilBadge: {
    backgroundColor: "#ffebee",
  },
  dificultadText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2c3e50",
  },
  comenzarButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  comenzarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  gameHeader: {
    backgroundColor: "#667eea",
    padding: 20,
    margin: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gameHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  changeButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  canvasContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  paletaContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  paletaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  paletaScroll: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  grosorContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  grosorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  grosorButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  grosorButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  grosorButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  grosorPreview: {
    borderRadius: 50,
    marginBottom: 6,
  },
  grosorButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c3e50",
  },
  grosorButtonTextActive: {
    color: "#fff",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  actionButtons: {
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  exitButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 40,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
});

export default JuegoMandalaCanvas;