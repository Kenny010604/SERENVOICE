import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [genero, setGenero] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edad, setEdad] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// ...existing code...

  const handleRegister = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!apellido.trim()) {
      Alert.alert('Error', 'El apellido es requerido');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Correo inválido');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: email.trim().toLowerCase(),
        contrasena: password,
        genero:
          genero === 'masculino'
            ? 'M'
            : genero === 'femenino'
            ? 'F'
            : genero === 'otro'
            ? 'O'
            : undefined,
        fecha_nacimiento: convertirFecha(fechaNacimiento),
        edad: edad ? parseInt(edad) : undefined,
        foto_perfil: undefined,
        auth_provider: 'local',
      };

      await register(registerData);

      Alert.alert(
        '✅ Registro exitoso',
        'Cuenta creada correctamente.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

// ...existing code...

  const handleGoogleRegister = () => {
    Alert.alert('Próximamente', 'El registro con Google estará disponible pronto');
  };

  const handleFechaChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length > 8) {
      cleaned = cleaned.substring(0, 8);
    }

    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    if (cleaned.length >= 5) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4)}`;
    }

    setFechaNacimiento(formatted);

    if (cleaned.length === 8) {
      const dia = parseInt(cleaned.substring(0, 2));
      const mes = parseInt(cleaned.substring(2, 4));
      const anio = parseInt(cleaned.substring(4, 8));
      
      const hoy = new Date();
      const nacimiento = new Date(anio, mes - 1, dia);
      
      if (nacimiento <= hoy) {
        let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
          edadCalculada--;
        }
        setEdad(edadCalculada.toString());
      }
    } else {
      setEdad('');
    }
  };

  const convertirFecha = (fecha: string): string | undefined => {
    if (!fecha || fecha.length !== 10) return undefined;
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes}-${dia}`;
  };

  return (
    <LinearGradient
      colors={['#0a4f5c', '#0d6876', '#108291']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={40} color="#fff" />
              </View>
              <Text style={styles.title}>Crear Cuenta</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={18} color="#22d3ee" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Datos personales</Text>
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  placeholderTextColor="#6B7280"
                  value={nombre}
                  onChangeText={setNombre}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Apellido"
                  placeholderTextColor="#6B7280"
                  value={apellido}
                  onChangeText={setApellido}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="image-outline" size={18} color="#22d3ee" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Foto de perfil (opcional)</Text>
              </View>

              <TouchableOpacity style={styles.photoButton}>
                <Text style={styles.photoButtonText}>Seleccionar foto</Text>
              </TouchableOpacity>
              <Text style={styles.photoNote}>
                Formato: JPG, PNG, GIF o WebP (máx. 5MB)
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="mail-outline" size={18} color="#22d3ee" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Datos de contacto</Text>
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="lock-closed-outline" size={18} color="#22d3ee" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Seguridad</Text>
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={18} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={18} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={18} color="#22d3ee" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Información adicional</Text>
              </View>

              <View style={styles.subLabelContainer}>
                <Ionicons name="male-female-outline" size={14} color="#94a3b8" style={styles.subLabelIcon} />
                <Text style={styles.subLabel}>Género</Text>
              </View>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    genero === 'masculino' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGenero('masculino')}
                  disabled={loading}
                >
                  <Ionicons name="male" size={18} color={genero === 'masculino' ? '#0a4f5c' : '#fff'} style={styles.genderIcon} />
                  <Text
                    style={[
                      styles.genderButtonText,
                      genero === 'masculino' && styles.genderButtonTextActive,
                    ]}
                  >
                    Masculino
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    genero === 'femenino' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGenero('femenino')}
                  disabled={loading}
                >
                  <Ionicons name="female" size={18} color={genero === 'femenino' ? '#0a4f5c' : '#fff'} style={styles.genderIcon} />
                  <Text
                    style={[
                      styles.genderButtonText,
                      genero === 'femenino' && styles.genderButtonTextActive,
                    ]}
                  >
                    Femenino
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    genero === 'otro' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGenero('otro')}
                  disabled={loading}
                >
                  <Ionicons name="transgender" size={18} color={genero === 'otro' ? '#0a4f5c' : '#fff'} style={styles.genderIcon} />
                  <Text
                    style={[
                      styles.genderButtonText,
                      genero === 'otro' && styles.genderButtonTextActive,
                    ]}
                  >
                    Otro
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.subLabelContainer}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" style={styles.subLabelIcon} />
                <Text style={styles.subLabel}>Fecha de nacimiento</Text>
              </View>
              <View style={styles.inputGroup}>
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor="#6B7280"
                  value={fechaNacimiento}
                  onChangeText={handleFechaChange}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!loading}
                />
                {fechaNacimiento.length === 10 && (
                  <Ionicons name="calendar" size={18} color="#22d3ee" style={styles.inputIcon} />
                )}
              </View>

              {edad && (
                <View style={styles.inputGroup}>
                  <Ionicons name="time-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: '#22d3ee' }]}
                    value={`${edad} años`}
                    editable={false}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0a4f5c" />
              ) : (
                <Text style={styles.registerButtonText}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleRegister}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={18} color="#fff" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/PaginasPublicas/login')}>
                <Text style={styles.linkText}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.copyright}>
            © 2025 SerenVoice — Todos los derechos reservados.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22d3ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  subLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  subLabelIcon: {
    marginRight: 6,
  },
  subLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 5,
  },
  photoButton: {
    backgroundColor: '#22d3ee',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  photoButtonText: {
    color: '#0a4f5c',
    fontSize: 14,
    fontWeight: '600',
  },
  photoNote: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  genderIcon: {
    marginRight: 5,
  },
  genderButtonActive: {
    backgroundColor: '#22d3ee',
  },
  genderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#0a4f5c',
  },
  registerButton: {
    backgroundColor: '#22d3ee',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#0a4f5c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#6ee7b7',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  linkText: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '600',
  },
  copyright: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});