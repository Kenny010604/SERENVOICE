import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import type { UserData } from "../../hooks/useAuth";

export default function Profile() {
  const { user, updateProfile, loading } = useAuth();
  const [form, setForm] = useState<UserData | null>(null);

  // Cargar datos del usuario al formulario
  useEffect(() => {
    if (user) {
      setForm(user);
    }
  }, [user]);

  const save = async () => {
    if (!form) return;

    const res = await updateProfile({
      nombre: form.nombre,
      apellido: form.apellido,
      correo: form.correo,
    });

    if (!res.success) {
      alert("Error al actualizar perfil");
      return;
    }

    alert("Perfil actualizado");
  };

  if (loading || !form) return <Text>Cargando...</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Mi Perfil</Text>

      <Text>Nombre</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 8 }}
        value={form.nombre}
        onChangeText={(t) => setForm({ ...form, nombre: t })}
      />

      <Text>Apellido</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 8 }}
        value={form.apellido}
        onChangeText={(t) => setForm({ ...form, apellido: t })}
      />

      <Text>Correo</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 8 }}
        value={form.correo}
        onChangeText={(t) => setForm({ ...form, correo: t })}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        onPress={save}
        style={{ backgroundColor: "black", padding: 12, marginTop: 20 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Guardar Cambios
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
