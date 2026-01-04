// src/screens/auth/RegisterScreen.js
// Pantalla de registro

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
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import validators from '../../utils/validators';

// Componente DatePicker para Web (HTML5 input date)
const WebDatePicker = ({ value, onChange, colors }) => {
  const handleChange = (event) => {
    const selectedDate = new Date(event.target.value);
    onChange({ type: 'set' }, selectedDate);
  };

  const formatForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <input
      type="date"
      value={formatForInput(value)}
      onChange={handleChange}
      max={formatForInput(new Date())}
      min="1950-01-01"
      style={{
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        backgroundColor: colors.panel,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        fontFamily: 'inherit',
      }}
    />
  );
};

const genderOptions = [
  { label: 'Masculino', value: 'masculino', icon: 'male' },
  { label: 'Femenino', value: 'femenino', icon: 'female' },
  { label: 'Otro', value: 'otro', icon: 'male-female' },
];

const RegisterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    genero: '',
    fecha_nacimiento: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: datos básicos, 2: datos adicionales

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateStep1 = () => {
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

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!validators.isValidEmail(formData.correo)) {
      newErrors.correo = 'Ingresa un correo válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else {
      const passwordValidation = validators.isValidPassword(formData.contrasena);
      if (!passwordValidation.valid) {
        newErrors.contrasena = passwordValidation.message;
      }
    }

    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Confirma tu contraseña';
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    if (!formData.genero) {
      newErrors.genero = 'Selecciona un género';
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const ageValidation = validators.isValidAge(formData.fecha_nacimiento);
      if (!ageValidation.valid) {
        newErrors.fecha_nacimiento = ageValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim().toLowerCase(),
        contrasena: formData.contrasena,
        genero: formData.genero,
        fecha_nacimiento: formData.fecha_nacimiento?.toISOString().split('T')[0],
      });

      Alert.alert(
        '¡Registro exitoso!',
        'Se ha enviado un correo de verificación. Por favor, verifica tu cuenta antes de iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateField('fecha_nacimiento', selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 1 ? 'Paso 1 de 2: Información básica' : 'Paso 2 de 2: Seguridad y más'}
            </Text>

            {/* Progress bar */}
            <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: colors.primary, width: step === 1 ? '50%' : '100%' },
                ]}
              />
            </View>
          </View>

          {/* Step 1: Basic Info */}
          {step === 1 && (
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
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.nombre}</Text>
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
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.apellido}</Text>
                )}
              </View>

              {/* Correo */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Correo electrónico</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.panel,
                      borderColor: errors.correo ? colors.error : colors.border,
                    },
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="tu@email.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.correo}
                    onChangeText={(text) => updateField('correo', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                {errors.correo && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.correo}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Siguiente</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Password & Additional */}
          {step === 2 && (
            <View style={styles.form}>
              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.panel,
                      borderColor: errors.contrasena ? colors.error : colors.border,
                    },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={formData.contrasena}
                    onChangeText={(text) => updateField('contrasena', text)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.contrasena && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.contrasena}</Text>
                )}
                <Text style={[styles.hint, { color: colors.textMuted }]}>
                  Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                </Text>
              </View>

              {/* Confirmar Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Confirmar contraseña</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.panel,
                      borderColor: errors.confirmarContrasena ? colors.error : colors.border,
                    },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={formData.confirmarContrasena}
                    onChangeText={(text) => updateField('confirmarContrasena', text)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmarContrasena && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.confirmarContrasena}
                  </Text>
                )}
              </View>

              {/* Género */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Género</Text>
                <View style={styles.genderContainer}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderOption,
                        {
                          backgroundColor:
                            formData.genero === option.value
                              ? colors.primary + '20'
                              : colors.panel,
                          borderColor:
                            formData.genero === option.value ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => updateField('genero', option.value)}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={formData.genero === option.value ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.genderLabel,
                          {
                            color:
                              formData.genero === option.value ? colors.primary : colors.textSecondary,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.genero && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.genero}</Text>
                )}
              </View>

              {/* Fecha de nacimiento */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Fecha de nacimiento</Text>
                
                {Platform.OS === 'web' ? (
                  // Usar input HTML5 en web
                  <WebDatePicker
                    value={formData.fecha_nacimiento || new Date(2000, 0, 1)}
                    onChange={handleDateChange}
                    colors={colors}
                  />
                ) : (
                  // Usar TouchableOpacity en móvil
                  <>
                    <TouchableOpacity
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.panel,
                          borderColor: errors.fecha_nacimiento ? colors.error : colors.border,
                        },
                      ]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                      <Text
                        style={[
                          styles.dateText,
                          {
                            color: formData.fecha_nacimiento ? colors.text : colors.textMuted,
                          },
                        ]}
                      >
                        {formData.fecha_nacimiento
                          ? formatDate(formData.fecha_nacimiento)
                          : 'Seleccionar fecha'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={formData.fecha_nacimiento || new Date(2000, 0, 1)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1950, 0, 1)}
                      />
                    )}
                  </>
                )}
                
                {errors.fecha_nacimiento && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.fecha_nacimiento}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Inicia sesión</Text>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    padding: 4,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
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
  dateText: {
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
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;




