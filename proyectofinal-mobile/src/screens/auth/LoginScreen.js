// src/screens/auth/LoginScreen.js
// Pantalla de inicio de sesión

import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth } from '../../services/googleAuthService';
import googleAuthWebService from '../../services/googleAuthWebService';
import authService from '../../services/authService';

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const { request, response, signInWithGoogle } = useGoogleAuth();
  const googleButtonRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar Google Sign-In para WEB
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('[LoginScreen] Inicializando Google Sign-In Web...');
      googleAuthWebService.initGoogleSignIn({
        onSuccess: handleGoogleWebSuccess,
        onError: handleGoogleWebError,
      });
      
      // Renderizar botón de Google después de un pequeño delay
      const timer = setTimeout(() => {
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer && window.google) {
          console.log('[LoginScreen] Renderizando botón de Google...');
          try {
            googleAuthWebService.renderGoogleButton('google-signin-button');
            console.log('[LoginScreen] Botón de Google renderizado exitosamente');
          } catch (error) {
            console.error('[LoginScreen] Error renderizando botón de Google:', error);
          }
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Manejar respuesta de Google OAuth cuando el usuario regresa (SOLO MÓVIL)
  useEffect(() => {
    if (Platform.OS !== 'web' && response?.type === 'success') {
      handleGoogleResponse(response);
    }
  }, [response]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      // La navegación se maneja automáticamente por AuthContext
    } catch (error) {
      Alert.alert(
        'Error de inicio de sesión',
        error.message || 'No se pudo iniciar sesión. Verifica tus credenciales.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar éxito de Google Web Auth
   */
  const handleGoogleWebSuccess = async (googleData) => {
    setGoogleLoading(true);
    try {
      console.log('[LoginScreen] Google Web Auth exitoso:', googleData.user.email);
      
      // Enviar el credential token de Google al backend
      const result = await authService.loginWithGoogleCredential(googleData.credential);
      
      if (result.success) {
        console.log('[LoginScreen] Login exitoso con Google Web');
        
        // El token ya está guardado en secureStorage por authService
        // Recargar la página para que AuthContext detecte el cambio
        if (Platform.OS === 'web') {
          window.location.href = '/';
        } else {
          // En móvil, AuthContext manejará la navegación
          // No hacer nada aquí
        }
      } else {
        if (Platform.OS === 'web') {
          alert(result.message || 'No se pudo autenticar con Google');
        } else {
          Alert.alert(
            'Error',
            result.message || 'No se pudo autenticar con Google',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('[LoginScreen] Error en Google Web login:', error);
      if (Platform.OS === 'web') {
        alert('No se pudo iniciar sesión con Google. Intenta de nuevo.');
      } else {
        Alert.alert(
          'Error',
          'No se pudo iniciar sesión con Google. Intenta de nuevo.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Manejar error de Google Web Auth
   */
  const handleGoogleWebError = (error) => {
    console.error('[LoginScreen] Error en Google Web Auth:', error);
    setGoogleLoading(false);
    Alert.alert(
      'Error',
      'No se pudo iniciar sesión con Google. Intenta de nuevo.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Manejar la respuesta de Google OAuth (MÓVIL)
   */
  const handleGoogleResponse = async (googleResponse) => {
    setGoogleLoading(true);
    try {
      // Obtener información del usuario desde el token
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${googleResponse.authentication.accessToken}` },
        }
      );
      const userInfo = await userInfoResponse.json();

      console.log('[LoginScreen] Usuario de Google:', userInfo);
      
      // Enviar el token de Google al backend para validación
      const backendResponse = await authService.loginWithGoogle(googleResponse.authentication.accessToken);
      
      if (backendResponse.success) {
        console.log('[LoginScreen] Login exitoso con Google');
        // Login exitoso - AuthContext maneja la navegación
        await login(backendResponse.user.correo, null, backendResponse.token);
      } else {
        Alert.alert(
          'Error',
          backendResponse.message || 'No se pudo autenticar con Google',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[LoginScreen] Error en Google login:', error);
      Alert.alert(
        'Error',
        'No se pudo iniciar sesión con Google. Intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Iniciar flujo de Google OAuth
   */
  const handleGoogleLogin = async () => {
    console.log('[LoginScreen] Iniciando Google OAuth...');
    setGoogleLoading(true);
    try {
      if (Platform.OS === 'web') {
        // En web, el botón ya está renderizado en el DOM
        // El click será manejado directamente por Google SDK
        // Si el botón no está visible, mostrarlo
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          buttonContainer.style.display = 'block';
          console.log('[LoginScreen] Botón de Google mostrado');
        }
        setGoogleLoading(false);
      } else {
        // En móvil, usar expo-auth-session
        await signInWithGoogle();
      }
    } catch (error) {
      console.error('[LoginScreen] Error iniciando Google OAuth:', error);
      if (Platform.OS === 'web') {
        alert('No se pudo iniciar el proceso de autenticación con Google.');
      } else {
        Alert.alert(
          'Error',
          'No se pudo iniciar el proceso de autenticación con Google.',
          [{ text: 'OK' }]
        );
      }
      setGoogleLoading(false);
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
          keyboardShouldPersistTaps="handled"
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
            
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="mic" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>¡Bienvenido!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Inicia sesión para continuar
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Correo electrónico</Text>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: colors.panel,
                  borderColor: errors.email ? colors.error : colors.border,
                }
              ]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: colors.panel,
                  borderColor: errors.password ? colors.error : colors.border,
                }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: colors.primary },
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>o</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Button */}
            {Platform.OS === 'web' ? (
              <View style={styles.googleButtonContainer}>
                <div id="google-signin-button" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: 50
                }} />
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.googleButton, { backgroundColor: colors.panel, borderColor: colors.border }]}
                onPress={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color={colors.text} />
                    <Text style={[styles.googleButtonText, { color: colors.text }]}>
                      Continuar con Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                ¿No tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButtonContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;




