// components/Juegos/JuegoMandalaCanvas.tsx
// REQUIERE: npm install @shopify/react-native-skia
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from "react-native";
import { Canvas, Path, Skia, useCanvasRef, SkPath } from "@shopify/react-native-skia";
import { JuegoProps } from "../../types/juegos.types";

const { width } = Dimensions.get("window");
const CANVAS_SIZE = Math.min(width - 40, 400);

interface Mandala {
  id: number;
  nombre: string;
  paths: string[];
}

interface Trazo {
  path: SkPath;
  color: string;
  width: number;
}

const JuegoMandalaCanvas: React.FC<JuegoProps> = ({ juego, onFinish, onExit }) => {
  // HOOKS AL INICIO
  const canvasRef = useCanvasRef();
  const [colorActual, setColorActual] = useState("#FF6B9D");
  const [grosorLinea, setGrosorLinea] = useState(3);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [mandalaSeleccionado, setMandalaSeleccionado] = useState<Mandala | null>(null);
  const [trazos, setTrazos] = useState<Trazo[]>([]);
  const [trazoActual, setTrazoActual] = useState<SkPath | null>(null);
  const [porcentajeCompletado, setPorcentajeCompletado] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(0);

  // LOGS Y LÓGICA DESPUÉS DE LOS HOOKS
  console.log('[Mandala] Componente montado');
  console.log('[Mandala] Skia:', !!Skia, 'Skia.Path:', !!(Skia && Skia.Path), 'Skia.Path.MakeFromSVGString:', !!(Skia && Skia.Path && Skia.Path.MakeFromSVGString));
  console.log('[Mandala] juegoIniciado:', juegoIniciado, 'mandalaSeleccionado:', mandalaSeleccionado);
  if (mandalaSeleccionado?.paths) {
    mandalaSeleccionado.paths.forEach((pathData, index) => {
      console.log('[Mandala] Renderizando path', index, pathData);
    });
  }
  if (trazos) {
    trazos.forEach((trazo, index) => {
      console.log('[Mandala] Renderizando trazo', index, trazo);
    });
  }
  if (trazoActual) {
    console.log('[Mandala] Renderizando trazo actual', trazoActual);
  }

  // Validar si Skia está disponible (por ejemplo, en web no lo está)
  if (!Skia || !Skia.Path || !Skia.Path.MakeFromSVGString) {
    console.warn('[Mandala] Skia no disponible, mostrando mensaje de advertencia');
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: 20 }}>⚠️</Text>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>
            Este juego solo funciona en la app móvil
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 }}>
            El mandala interactivo requiere capacidades gráficas avanzadas que no están disponibles en la versión web. Por favor, usa la app móvil para jugar.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#667eea', padding: 15, borderRadius: 8, alignItems: 'center', width: 200 }}
            onPress={onExit}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const paleta = [
    "#FF6B9D", "#C44569", "#F8B500", "#FFA801",
    "#4ECDC4", "#44A08D", "#6C5CE7", "#A29BFE",
    "#00B894", "#00D2D3", "#FD79A8", "#FDCB6E",
    "#74B9FF", "#A29BFE", "#FF7675", "#FFFFFF"
  ];

  const mandalas: Mandala[] = [
    {
      id: 1,
      nombre: "Flor de Loto",
      paths: [
        "M200,200 m-150,0 a150,150 0 1,0 300,0 a150,150 0 1,0 -300,0",
        "M200,200 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0",
        "M200,200 m-50,0 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0"
      ]
    },
    {
      id: 2,
      nombre: "Estrella Sagrada",
      paths: [
        "M200,200 L200,80 L220,160 L300,160 L240,210 L260,290 L200,240 L140,290 L160,210 L100,160 L180,160 Z",
        "M200,200 m-120,0 a120,120 0 1,0 240,0 a120,120 0 1,0 -240,0"
      ]
    },
    {
      id: 3,
      nombre: "Círculos Zen",
      paths: [
        "M200,200 m-180,0 a180,180 0 1,0 360,0 a180,180 0 1,0 -360,0",
        "M200,200 m-140,0 a140,140 0 1,0 280,0 a140,140 0 1,0 -280,0",
        "M200,200 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0",
        "M200,200 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0"
      ]
    }
  ];

interface Trazo {
  path: SkPath;
  color: string;
  width: number;
}

const JuegoMandalaCanvas: React.FC<JuegoProps> = ({ juego, onFinish, onExit }) => {
  const canvasRef = useCanvasRef();
  const [colorActual, setColorActual] = useState("#FF6B9D");
  const [grosorLinea, setGrosorLinea] = useState(3);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [mandalaSeleccionado, setMandalaSeleccionado] = useState<Mandala | null>(null);
  const [trazos, setTrazos] = useState<Trazo[]>([]);
  const [trazoActual, setTrazoActual] = useState<SkPath | null>(null);
  const [porcentajeCompletado, setPorcentajeCompletado] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(0);

  const paleta = [
    "#FF6B9D", "#C44569", "#F8B500", "#FFA801",
    "#4ECDC4", "#44A08D", "#6C5CE7", "#A29BFE",
    "#00B894", "#00D2D3", "#FD79A8", "#FDCB6E",
    "#74B9FF", "#A29BFE", "#FF7675", "#FFFFFF"
  ];

  const mandalas: Mandala[] = [
    {
      id: 1,
      nombre: "Flor de Loto",
      paths: [
        "M200,200 m-150,0 a150,150 0 1,0 300,0 a150,150 0 1,0 -300,0",
        "M200,200 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0",
        "M200,200 m-50,0 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0"
      ]
    },
    {
      id: 2,
      nombre: "Estrella Sagrada",
      paths: [
        "M200,200 L200,80 L220,160 L300,160 L240,210 L260,290 L200,240 L140,290 L160,210 L100,160 L180,160 Z",
        "M200,200 m-120,0 a120,120 0 1,0 240,0 a120,120 0 1,0 -240,0"
      ]
    },
    {
      id: 3,
      nombre: "Círculos Zen",
      paths: [
        "M200,200 m-180,0 a180,180 0 1,0 360,0 a180,180 0 1,0 -360,0",
        "M200,200 m-140,0 a140,140 0 1,0 280,0 a140,140 0 1,0 -280,0",
        "M200,200 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0",
        "M200,200 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0"
      ]
    }
  ];

  useEffect(() => {
    if (juegoIniciado && tiempoInicio) {
      const timer = setInterval(() => {
        setSegundos(Math.floor((Date.now() - tiempoInicio) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [juegoIniciado, tiempoInicio]);

  const iniciarJuego = (mandala: Mandala) => {
    setMandalaSeleccionado(mandala);
    setJuegoIniciado(true);
    setTiempoInicio(Date.now());
    setTrazos([]);
    setPorcentajeCompletado(0);
  };

  const handleTouchStart = (event: any) => {
    // Validar que Skia.Path existe
    if (!Skia || !Skia.Path || !Skia.Path.Make) {
      console.warn('Skia.Path.Make no disponible - juego no compatible en web');
      Alert.alert(
        'No disponible',
        'Este juego solo funciona en dispositivos móviles nativos. Por favor usa la app móvil.',
        [{ text: 'Entendido', onPress: onExit }]
      );
      return;
    }
    
    const { locationX, locationY } = event.nativeEvent;
    const path = Skia.Path.Make();
    path.moveTo(locationX, locationY);
    setTrazoActual(path);
  };

  const handleTouchMove = (event: any) => {
    if (!trazoActual) return;
    
    const { locationX, locationY } = event.nativeEvent;
    trazoActual.lineTo(locationX, locationY);
    setTrazoActual({ ...trazoActual });
  };

  const handleTouchEnd = () => {
    if (!trazoActual) return;

    const nuevoTrazo: Trazo = {
      path: trazoActual,
      color: colorActual,
      width: grosorLinea
    };

    setTrazos([...trazos, nuevoTrazo]);
    setTrazoActual(null);

    // Calcular progreso
    const porcentaje = Math.min(100, (trazos.length / 50) * 100);
    setPorcentajeCompletado(Math.round(porcentaje));
  };

  const limpiarCanvas = () => {
    Alert.alert(
      "¿Borrar todo?",
      "¿Quieres borrar todo y empezar de nuevo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar", 
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

  const finalizarJuego = () => {
    const puntuacion = Math.min(100, porcentajeCompletado + (segundos < 300 ? 20 : 0));
    onFinish(puntuacion, porcentajeCompletado > 50);
  };

  const formatearTiempo = (segs: number): string => {
    const mins = Math.floor(segs / 60);
    const secs = segs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!juegoIniciado) {
          // Mensaje visual temporal para depuración
          return (
            <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Text style={{ fontSize: 32, color: 'red', marginBottom: 30 }}>
                  Pantalla de selección activa
                </Text>
              </View>
              {/* ...el resto del return original de la selección de mandala... */}
              <View style={styles.header}>
                <Text style={styles.emoji}>🎨</Text>
                <Text style={styles.title}>{juego.nombre}</Text>
                <Text style={styles.description}>{juego.descripcion}</Text>
              </View>

              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>📋 Beneficios del Mandala</Text>
                <Text style={styles.benefitItem}>🧘 Reduce el estrés y la ansiedad</Text>
                <Text style={styles.benefitItem}>🎨 Estimula la creatividad</Text>
                <Text style={styles.benefitItem}>💭 Mejora la concentración</Text>
                <Text style={styles.benefitItem}>😌 Promueve la relajación profunda</Text>
              </View>

              <Text style={styles.sectionTitle}>Elige tu Mandala</Text>

              <View style={styles.mandalasGrid}>
                {mandalas.map((mandala) => (
                  <View key={mandala.id} style={styles.mandalaCard}>
                    <Text style={styles.mandalaEmoji}>
                      {mandala.id === 1 ? "🌸" : mandala.id === 2 ? "⭐" : "⭕"}
                    </Text>
                    <Text style={styles.mandalaName}>{mandala.nombre}</Text>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "#667eea" }]}
                      onPress={() => iniciarJuego(mandala)}
                    >
                      <Text style={styles.buttonText}>Colorear</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#9e9e9e", marginTop: 20 }]}
                onPress={onExit}
              >
                <Text style={styles.buttonText}>← Volver</Text>
              </TouchableOpacity>
            </ScrollView>
          );
      console.log('[Mandala] Mostrando pantalla de selección de mandala');
      console.log('[Mandala] Mostrando pantalla de juego mandala', mandalaSeleccionado);
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎨</Text>
          <Text style={styles.title}>{juego.nombre}</Text>
          <Text style={styles.description}>{juego.descripcion}</Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>📋 Beneficios del Mandala</Text>
          <Text style={styles.benefitItem}>🧘 Reduce el estrés y la ansiedad</Text>
          <Text style={styles.benefitItem}>🎨 Estimula la creatividad</Text>
          <Text style={styles.benefitItem}>💭 Mejora la concentración</Text>
          <Text style={styles.benefitItem}>😌 Promueve la relajación profunda</Text>
        </View>

        <Text style={styles.sectionTitle}>Elige tu Mandala</Text>

        <View style={styles.mandalasGrid}>
          {mandalas.map((mandala) => (
            <View key={mandala.id} style={styles.mandalaCard}>
              <Text style={styles.mandalaEmoji}>
                {mandala.id === 1 ? "🌸" : mandala.id === 2 ? "⭐" : "⭕"}
              </Text>
              <Text style={styles.mandalaName}>{mandala.nombre}</Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#667eea" }]}
                onPress={() => iniciarJuego(mandala)}
              >
                <Text style={styles.buttonText}>Colorear</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#9e9e9e", marginTop: 20 }]}
          onPress={onExit}
        >
          <Text style={styles.buttonText}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>{mandalaSeleccionado?.nombre}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>⏱️ {formatearTiempo(segundos)}</Text>
          <Text style={styles.statText}>🎨 {porcentajeCompletado}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${porcentajeCompletado}%` }]} />
        </View>
      </View>

      {/* Canvas de dibujo */}
      <View style={styles.canvasContainer}>
        <Canvas
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Dibujar el mandala de fondo */}
          {mandalaSeleccionado?.paths.map((pathData, index) => {
                      // Log de paths antes del render
                      if (mandalaSeleccionado?.paths) {
                        mandalaSeleccionado.paths.forEach((pathData, index) => {
                          console.log('[Mandala] Renderizando path', index, pathData);
                        });
                      }
            // Validar que Skia.Path existe y que pathData es válido antes de usarlo
            if (!Skia || !Skia.Path || !Skia.Path.MakeFromSVGString) {
              console.warn('Skia.Path.MakeFromSVGString no disponible en web');
              return null;
            }
            if (!pathData || typeof pathData !== 'string' || pathData.trim() === '') {
              // Evitar procesar paths vacíos o inválidos
              return null;
            }
            const path = Skia.Path.MakeFromSVGString(pathData);
            if (path) {
              return (
                <Path
                  key={index}
                  path={path}
                  color="#E0E0E0"
                  style="stroke"
                  strokeWidth={2}
                />
              );
            }
            return null;
          })}

          {/* Dibujar trazos guardados */}
          {trazos.map((trazo, index) => (
            <Path
              key={index}
              path={trazo.path}
              color={trazo.color}
              style="stroke"
              strokeWidth={trazo.width}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}
            <Path
              key={index}
              path={trazo.path}
              color={trazo.color}
              style="stroke"
              strokeWidth={trazo.width}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}

          {/* Dibujar trazo actual */}
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

      {/* Paleta de colores */}
      <View style={styles.paletaContainer}>
        <Text style={styles.paletaTitle}>🎨 Colores</Text>
        <View style={styles.paletaGrid}>
          {paleta.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { 
                  backgroundColor: color,
                  borderWidth: colorActual === color ? 4 : 2,
                  borderColor: colorActual === color ? "#333" : "#ddd"
                }
              ]}
              onPress={() => setColorActual(color)}
            />
          ))}
        </View>
      </View>

      {/* Control de grosor */}
      <View style={styles.grosorContainer}>
        <Text style={styles.grosorTitle}>✏️ Grosor del Pincel</Text>
        <View style={styles.grosorButtons}>
          {[1, 3, 5, 8, 10].map((grosor) => (
            <TouchableOpacity
              key={grosor}
              style={[
                styles.grosorButton,
                grosorLinea === grosor && styles.grosorButtonActive
              ]}
              onPress={() => setGrosorLinea(grosor)}
            >
              <Text style={styles.grosorButtonText}>{grosor}px</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={finalizarJuego}
        >
          <Text style={styles.buttonText}>✅ Guardar y Finalizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
          onPress={limpiarCanvas}
        >
          <Text style={styles.buttonText}>🔄 Limpiar</Text>
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
}
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
  benefitsCard: {
    backgroundColor: "#f0f9ff",
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  benefitItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  mandalasGrid: {
    gap: 20,
  },
  mandalaCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  mandalaEmoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  mandalaName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  gameHeader: {
    backgroundColor: "#667eea",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statText: {
    fontSize: 16,
    color: "#fff",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  canvasContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  paletaContainer: {
    marginBottom: 20,
  },
  paletaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  paletaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorButton: {
    width: "21%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  grosorContainer: {
    marginBottom: 20,
  },
  grosorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  grosorButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  grosorButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  grosorButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  grosorButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default JuegoMandalaCanvas;