// app/auth/PaginasUsuarios/JuegoContainer.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import JuegoRespiracion from "../../../components/Juegos/JuegoRespiracion";
import JuegoPuzzle from "../../../components/Juegos/JuegoPuzzle";
import JuegoMemoria from "../../../components/Juegos/JuegoMemoria";
import JuegoMandala from "../../../components/Juegos/JuegoMandala";
import JuegoMindfulness from "../../../components/Juegos/JuegoMindfulness";

// Tipos
interface Juego {
  id: string | number;
  nombre: string;
  tipo_juego: "respiracion" | "puzzle" | "memoria" | "mandala" | "mindfulness";
  descripcion?: string;
}

const JuegoContainer: React.FC = () => {
  // Sin tipado específico para evitar conflictos con expo-router
  const params = useLocalSearchParams();
  const router = useRouter();

  const [juego, setJuego] = useState<Juego | null>(null);
  const [estadoAntes, setEstadoAntes] = useState<string>("");
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [sesionId, setSesionId] = useState<string | null>(null);
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null);
  const [sesionIniciada, setSesionIniciada] = useState(false);

  useEffect(() => {
    if (
      params.juegoData &&
      typeof params.juegoData === 'string' &&
      !sesionIniciada
    ) {
      try {
        const juegoParseado = JSON.parse(params.juegoData);
        setJuego(juegoParseado);
        setEstadoAntes((params.estadoAntes as string) || "");
        iniciarSesion();
        setSesionIniciada(true);
      } catch (error) {
        console.error("Error parseando datos del juego:", error);
        Alert.alert("Error", "No se pudo cargar el juego");
        router.back();
      }
    } else if (!params.juegoData) {
      Alert.alert("Error", "Juego no encontrado");
      router.back();
    }
  }, [params, sesionIniciada]);

  const iniciarSesion = () => {
    setJuegoIniciado(true);
    setTiempoInicio(Date.now());
    // Aquí podrías llamar a la API para iniciar sesión si quieres guardar en BD
    console.log("Sesión de juego iniciada");
  };

  const finalizarJuego = (puntuacion: number = 0, completado: boolean = true) => {
    if (!tiempoInicio || !juego) return;

    const duracionSegundos = Math.floor((Date.now() - tiempoInicio) / 1000);
    
    // Aquí podrías llamar a la API para guardar la sesión
    console.log("Juego finalizado:", {
      juegoId: juego.id,
      estadoAntes,
      duracionSegundos,
      puntuacion,
      completado
    });

    // Navegar de vuelta - usa router.back() o la ruta correcta de tu app
    router.back();
    
    // O si tienes una ruta específica, ajusta según tu estructura:
    // router.push("/auth/PaginasUsuarios/juegos" as any);
  };

  const handleExit = () => {
    Alert.alert(
      "Salir del juego",
      "¿Estás seguro de que quieres salir? Se perderá tu progreso.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive",
          onPress: () => router.back()
        }
      ]
    );
  };

  if (!juego) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Juego no encontrado</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Volver a juegos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Renderizar el juego correcto según el tipo
  const renderJuego = () => {
    const props = {
      juego,
      onFinish: finalizarJuego,
      onExit: handleExit
    };

    switch (juego.tipo_juego) {
      case "respiracion":
        return <JuegoRespiracion {...props} />;
      case "puzzle":
        return <JuegoPuzzle {...props} />;
      case "memoria":
        return <JuegoMemoria {...props} />;
      case "mandala":
        return <JuegoMandala {...props} />;
      case "mindfulness":
        return <JuegoMindfulness {...props} />;
      default:
        return (
          <View style={styles.unavailableContainer}>
            <Text style={styles.unavailableTitle}>
              Este juego aún no está disponible
            </Text>
            <Text style={styles.unavailableText}>Tipo: {juego.tipo_juego}</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderJuego()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  unavailableText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default JuegoContainer;