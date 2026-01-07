import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";

export default function HomeScreen() {
  const [mensaje, setMensaje] = useState("Conectando...");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const URL = "http://192.168.1.61:5000/";

    axios
      .get(URL)
      .then((res) => setMensaje(res.data.mensaje))
      .catch(() => setMensaje("❌ Error al conectar con Flask"))
      .finally(() => setCargando(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Flask + Expo + React Native Hola soy Kenny</Text>
      {cargando ? (
        <ActivityIndicator size="large" color="#00bfff" />
      ) : (
        <View style={styles.card}>
          <Text style={styles.text}>{mensaje}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4facfe",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
