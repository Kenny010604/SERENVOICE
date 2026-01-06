import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../hooks/useAuth"; // ✅ Usar el hook

const ActualizarPerfil: React.FC = () => {
  const router = useRouter();
  
  // ✅ Usar el hook useAuth
  const { 
    user, 
    loading: authLoading, 
    updateProfile, 
    refreshUser,
    setError: setAuthError 
  } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    genero: "O",
    fecha_nacimiento: "",
    contraseñaActual: "",
    contraseñaNueva: "",
    confirmarContraseña: "",
    usa_medicamentos: false,
    notificaciones: true,
  });

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<any>(null);

  const isGoogleUser = user?.auth_provider === "google";

  const calcularEdad = (fechaNacimiento: string): number => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const makeFotoUrl = (path: string | undefined): string | null => {
    if (!path) return null;
    const trimmed = String(path).trim();
    const lower = trimmed.toLowerCase();

    try {
      if (lower.startsWith("http://") || lower.startsWith("https://")) {
        return trimmed;
      }
      if (lower.startsWith("//")) {
        return `https:${trimmed}`;
      }
    } catch (e) {
      return null;
    }

    // ✅ Usar Config.API_URL del hook
    const { Config } = require("../../../constants");
    return `${Config.API_URL}${trimmed}`;
  };

  // ✅ Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    let isMounted = true; // Evitar actualizaciones si el componente se desmonta
    
    const loadUserData = async () => {
      // Solo ejecutar una vez, cuando authLoading termine
      if (authLoading) {
        console.log('⏳ Auth aún cargando...');
        return;
      }

      if (!user) {
        console.log('⚠️ No hay usuario después de cargar auth, refrescando...');
        try {
          const result = await refreshUser();
          if (!isMounted) return;
          
          if (!result.success || !result.user) {
            console.error('❌ No se pudo cargar el perfil');
            Alert.alert("Error", "No se pudo cargar el perfil. Por favor inicia sesión nuevamente.");
            router.replace('/(auth)/PaginasPublicas/login');
          } else {
            console.log('✅ Usuario cargado:', result.user);
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('❌ Error al refrescar usuario:', error);
          Alert.alert("Error", "No se pudo cargar el perfil");
          router.back();
        }
      } else {
        console.log('✅ Usuario ya está cargado:', user);
      }
    };

    loadUserData();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [authLoading]); // Solo depender de authLoading

  // ✅ Actualizar formulario cuando cambie el usuario
  useEffect(() => {
    if (user) {
      console.log('✅ Cargando datos del usuario:', user);
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        correo: user.correo || "",
        genero: user.genero || "O",
        fecha_nacimiento: user.fecha_nacimiento
          ? new Date(user.fecha_nacimiento).toISOString().split("T")[0]
          : "",
        contraseñaActual: "",
        contraseñaNueva: "",
        confirmarContraseña: "",
        usa_medicamentos: user.usa_medicamentos || false,
        notificaciones: user.notificaciones ?? true,
      });

      setFotoPerfil(makeFotoUrl(user.foto_perfil));
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectFoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso denegado",
          "Se necesita acceso a la galería para seleccionar una foto"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFotoPerfil(asset.uri);
        setFotoFile(asset);
      }
    } catch (error) {
      console.error("Error al seleccionar foto:", error);
      Alert.alert("Error", "No se pudo seleccionar la foto");
    }
  };

  const handleRemoverFoto = () => {
    setFotoPerfil(null);
    setFotoFile(null);
  };

  const handleSubmit = async () => {
    try {
      // Validaciones
      if (!formData.nombre.trim() || !formData.apellido.trim()) {
        Alert.alert("Error", "El nombre y apellido son obligatorios");
        return;
      }

      if (!isGoogleUser) {
        if (
          formData.contraseñaNueva &&
          formData.contraseñaNueva !== formData.confirmarContraseña
        ) {
          Alert.alert("Error", "Las contraseñas nuevas no coinciden");
          return;
        }

        if (formData.contraseñaNueva && !formData.contraseñaActual) {
          Alert.alert(
            "Error",
            "Ingrese su contraseña actual para cambiarla"
          );
          return;
        }

        if (
          formData.contraseñaNueva &&
          formData.contraseñaNueva.length < 6
        ) {
          Alert.alert(
            "Error",
            "La contraseña debe tener al menos 6 caracteres"
          );
          return;
        }
      }

      // Calcular edad
      let edad = undefined;
      if (formData.fecha_nacimiento) {
        edad = calcularEdad(formData.fecha_nacimiento);
        if (edad < 0 || edad > 120) {
          Alert.alert("Error", "Fecha de nacimiento inválida");
          return;
        }
      }

      setSaving(true);

      // ✅ Preparar datos para el hook
      const updateData: any = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        genero: formData.genero,
        fecha_nacimiento: formData.fecha_nacimiento,
        usa_medicamentos: formData.usa_medicamentos,
        notificaciones: formData.notificaciones,
      };

      if (edad !== undefined) {
        updateData.edad = edad;
      }

      // ✅ Contraseñas (solo si no es usuario de Google)
      if (!isGoogleUser && formData.contraseñaActual && formData.contraseñaNueva) {
        updateData.contraseñaActual = formData.contraseñaActual;
        updateData.contraseñaNueva = formData.contraseñaNueva;
        updateData.confirmarContraseña = formData.confirmarContraseña;
      }

      // ✅ Foto de perfil
      if (fotoFile && fotoFile.uri) {
        const filename = fotoFile.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        updateData.foto_perfil = {
          uri: fotoFile.uri,
          name: filename,
          type: type,
        };
      }

      console.log('📤 Enviando actualización:', updateData);

      // ✅ Usar el hook para actualizar
      const result = await updateProfile(updateData);

      if (result.success) {
        Alert.alert("Éxito", "Perfil actualizado correctamente", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", "No se pudo actualizar el perfil");
      }

    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando autenticación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Actualizar Perfil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* FOTO PERFIL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto de perfil</Text>

          <View style={styles.avatarContainer}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={48} color="#6B7280" />
              </View>
            )}

            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleSelectFoto}
            >
              <Ionicons name="camera-outline" size={18} color="#FFF" />
              <Text style={styles.photoButtonText}>Seleccionar foto</Text>
            </TouchableOpacity>

            {fotoPerfil && (
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={handleRemoverFoto}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={styles.removePhotoText}>Quitar foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* DATOS PERSONALES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos personales</Text>

          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={formData.nombre}
              onChangeText={(text) => handleInputChange("nombre", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={formData.apellido}
              onChangeText={(text) => handleInputChange("apellido", text)}
            />
          </View>
        </View>

        {/* CONTACTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de contacto</Text>

          <View
            style={[styles.inputGroup, isGoogleUser && styles.disabledInput]}
          >
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              value={formData.correo}
              onChangeText={(text) => handleInputChange("correo", text)}
              editable={!isGoogleUser}
            />
          </View>

          {isGoogleUser && (
            <View style={styles.googleWarning}>
              <Ionicons name="information-circle" size={16} color="#EF4444" />
              <Text style={styles.googleWarningText}>
                El correo no se puede cambiar en cuentas de Google
              </Text>
            </View>
          )}
        </View>

        {/* INFORMACIÓN ADICIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información adicional</Text>

          <View style={styles.inputGroup}>
            <Ionicons name="male-female-outline" size={20} color="#6B7280" />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Género:</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.genero === "M" && styles.genderButtonActive,
                  ]}
                  onPress={() => handleInputChange("genero", "M")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.genero === "M" && styles.genderButtonTextActive,
                    ]}
                  >
                    M
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.genero === "F" && styles.genderButtonActive,
                  ]}
                  onPress={() => handleInputChange("genero", "F")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.genero === "F" && styles.genderButtonTextActive,
                    ]}
                  >
                    F
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.genero === "O" && styles.genderButtonActive,
                  ]}
                  onPress={() => handleInputChange("genero", "O")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.genero === "O" && styles.genderButtonTextActive,
                    ]}
                  >
                    Otro
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Fecha de nacimiento (YYYY-MM-DD)"
              value={formData.fecha_nacimiento}
              onChangeText={(text) =>
                handleInputChange("fecha_nacimiento", text)
              }
            />
          </View>
        </View>

        {/* CONTRASEÑAS - Solo si no es usuario de Google */}
        {!isGoogleUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cambiar contraseña</Text>

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Contraseña actual"
                secureTextEntry={!showPassword}
                value={formData.contraseñaActual}
                onChangeText={(text) =>
                  handleInputChange("contraseñaActual", text)
                }
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                secureTextEntry={!showNewPassword}
                value={formData.contraseñaNueva}
                onChangeText={(text) =>
                  handleInputChange("contraseñaNueva", text)
                }
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmarContraseña}
                onChangeText={(text) =>
                  handleInputChange("confirmarContraseña", text)
                }
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PREFERENCIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="medkit-outline" size={20} color="#6B7280" />
              <Text style={styles.switchText}>Uso medicamentos actualmente</Text>
            </View>
            <Switch
              value={formData.usa_medicamentos}
              onValueChange={(value) =>
                handleInputChange("usa_medicamentos", value)
              }
              trackColor={{ false: "#D1D5DB", true: "#6366F1" }}
              thumbColor={formData.usa_medicamentos ? "#FFFFFF" : "#F9FAFB"}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="notifications-outline" size={20} color="#6B7280" />
              <Text style={styles.switchText}>Recibir notificaciones</Text>
            </View>
            <Switch
              value={formData.notificaciones}
              onValueChange={(value) =>
                handleInputChange("notificaciones", value)
              }
              trackColor={{ false: "#D1D5DB", true: "#6366F1" }}
              thumbColor={formData.notificaciones ? "#FFFFFF" : "#F9FAFB"}
            />
          </View>
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? ["#9CA3AF", "#9CA3AF"] : ["#6366F1", "#8B5CF6"]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} SerenVoice
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActualizarPerfil;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  section: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: "row",
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  photoButtonText: {
    color: "#FFF",
    marginLeft: 8,
    fontWeight: "600",
  },
  removePhoto: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  removePhotoText: {
    color: "#DC2626",
    marginLeft: 4,
    fontWeight: "500",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#1F2937",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    opacity: 0.7,
  },
  googleWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  googleWarningText: {
    fontSize: 13,
    color: "#EF4444",
    marginLeft: 8,
    flex: 1,
  },
  pickerContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  pickerLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  genderButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  genderButtonTextActive: {
    color: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchText: {
    fontSize: 15,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    textAlign: "center",
    marginTop: 32,
    marginBottom: 16,
    color: "#6B7280",
    fontSize: 14,
  },
});