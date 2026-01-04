import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Tipo de cada opción
interface ConfigOption {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const Configuracion: React.FC = () => {
  const router = useRouter();

  const configOptions: ConfigOption[] = [
    {
      title: "Mi Perfil",
      description: "Ver y editar tu información personal",
      icon: "person-outline",
      path: "/perfil",
    },
    {
      title: "Notificaciones",
      description: "Configurar preferencias de notificaciones",
      icon: "notifications-outline",
      path: "/notificaciones/configuracion",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Configuración</Text>
      <Text style={styles.subtitulo}>
        Administra tu perfil y preferencias
      </Text>

      <View style={styles.optionsContainer}>
        {configOptions.map(option => (
          <TouchableOpacity
            key={option.path}
            style={styles.card}
            onPress={() => router.push(option.path as any)}
          >
            <Ionicons name={option.icon} size={36} color="#4f46e5" style={styles.icon} />

            <View>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardDesc}>{option.description}</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push(option.path as any)}
            >
              <Text style={styles.buttonText}>Ir a {option.title}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitulo: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  icon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  cardDesc: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#4f46e5",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default Configuracion;
