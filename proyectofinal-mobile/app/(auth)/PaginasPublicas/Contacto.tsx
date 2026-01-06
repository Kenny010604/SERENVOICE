import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Mail, User, Send, Phone, Clock } from "lucide-react-native";

const Contacto: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* TÍTULO */}
      <Text style={styles.title}>Contacto</Text>
      <Text style={styles.subtitle}>
        ¿Tienes preguntas o sugerencias? Ponte en contacto con nuestro equipo.
      </Text>

      {/* TARJETA EMAIL */}
      <View style={styles.card}>
        <Mail size={28} color="#4F46E5" />
        <Text style={styles.cardTitle}>Email</Text>
        <Text style={styles.cardText}>contacto@serenvoice.com</Text>
      </View>

      {/* TARJETA TELÉFONO */}
      <View style={styles.card}>
        <Phone size={28} color="#4F46E5" />
        <Text style={styles.cardTitle}>Teléfono</Text>
        <Text style={styles.cardText}>+1 (234) 567-890</Text>
      </View>

      {/* TARJETA HORARIO */}
      <View style={styles.card}>
        <Clock size={28} color="#4F46E5" />
        <Text style={styles.cardTitle}>Horario</Text>
        <Text style={styles.cardText}>Lunes a Viernes: 9 AM - 6 PM</Text>
      </View>

      {/* FORMULARIO */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Envíanos un mensaje</Text>

        <View style={styles.inputGroup}>
          <User size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <View style={styles.inputGroup}>
          <Mail size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Tu correo"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />
        </View>

        <View style={styles.inputGroup}>
          <Send size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Asunto"
            value={asunto}
            onChangeText={setAsunto}
          />
        </View>

        <TextInput
          style={styles.textArea}
          placeholder="Tu mensaje"
          multiline
          numberOfLines={5}
          value={mensaje}
          onChangeText={setMensaje}
        />

        <TouchableOpacity style={styles.button}>
          <Send size={18} color="#FFF" />
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        © {new Date().getFullYear()} SerenVoice
      </Text>
    </ScrollView>
  );
};

export default Contacto;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#374151",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#374151",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    marginTop: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: "top",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
  },
});
