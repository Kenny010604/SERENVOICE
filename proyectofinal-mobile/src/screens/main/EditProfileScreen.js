// src/screens/main/EditProfileScreen.js
// Pantalla de edición de perfil

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import validators from '../../utils/validators';
import { getInitials } from '../../utils/helpers';

const EditProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    correo: user?.correo || '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (!validators.isValidName(formData.nombre)) {
      newErrors.nombre = 'El nombre solo debe contener letras';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (!validators.isValidName(formData.apellido)) {
      newErrors.apellido = 'El apellido solo debe contener letras';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Se necesita acceso a la galería para cambiar la foto de perfil'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      console.log('[EditProfile] Guardando perfil...');
      
      // Actualizar datos de perfil - pasar userId como primer argumento
      const response = await userService.updateProfile(user?.id_usuario || user?.id, {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
      });

      console.log('[EditProfile] Respuesta:', JSON.stringify(response));

      // Subir foto si se seleccionó una nueva
      if (photo) {
        try {
          await userService.uploadProfilePhoto(photo);
        } catch (photoError) {
          console.warn('[EditProfile] Error al subir foto:', photoError.message);
        }
      }

      if (response?.success) {
        // Actualizar contexto de auth
        await updateUser({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
        });

        Alert.alert('Éxito', 'Perfil actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Asegurar que el mensaje siempre sea string
        const errorMsg = response?.message 
          ? String(response.message) 
          : 'No se pudo actualizar el perfil';
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('[EditProfile] Error:', error);
      // Asegurar que el mensaje siempre sea string
      const errorMsg = error?.message 
        ? String(error.message) 
        : 'Error al actualizar el perfil';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Editar perfil</Text>
          </View>

          {/* Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={pickImage}>
              {photo || user?.foto_perfil ? (
                <Image
                  source={{ uri: photo || user?.foto_perfil }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(formData.nombre, formData.apellido)}
                  </Text>
                </View>
              )}
              <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
              Toca para cambiar la foto
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.panel,
                    borderColor: errors.nombre ? colors.error : colors.border,
                  },
                ]}
              >
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.textMuted}
                  value={formData.nombre}
                  onChangeText={(text) => updateField('nombre', text)}
                  autoCapitalize="words"
                />
              </View>
              {errors.nombre && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.nombre}
                </Text>
              )}
            </View>

            {/* Apellido */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Apellido</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.panel,
                    borderColor: errors.apellido ? colors.error : colors.border,
                  },
                ]}
              >
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tu apellido"
                  placeholderTextColor={colors.textMuted}
                  value={formData.apellido}
                  onChangeText={(text) => updateField('apellido', text)}
                  autoCapitalize="words"
                />
              </View>
              {errors.apellido && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.apellido}
                </Text>
              )}
            </View>

            {/* Correo (no editable) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Correo electrónico</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.border,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.textMuted }]}
                  value={formData.correo}
                  editable={false}
                />
                <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              </View>
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                El correo no se puede modificar
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    marginTop: 12,
    fontSize: 14,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfileScreen;




