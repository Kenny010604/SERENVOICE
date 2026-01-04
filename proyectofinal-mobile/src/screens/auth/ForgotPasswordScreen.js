// src/screens/auth/ForgotPasswordScreen.js
// Pantalla de recuperación de contraseña

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';
import validators from '../../utils/validators';

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }

    if (!validators.isValidEmail(email)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <GradientBackground>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="mail-open" size={60} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>¡Correo enviado!</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Hemos enviado un enlace de recuperación a{'\n'}
            <Text style={{ fontWeight: '600' }}>{email}</Text>
          </Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Revisa tu bandeja de entrada y spam. El enlace expira en 24 horas.
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => setSent(false)}
          >
            <Text style={[styles.resendText, { color: colors.primary }]}>
              ¿No recibiste el correo? Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="key" size={50} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>¿Olvidaste tu contraseña?</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Correo electrónico</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.panel,
                borderColor: error ? colors.error : colors.border,
              },
            ]}
          >
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Enviar enlace</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLogin}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={[styles.backToLoginText, { color: colors.primary }]}>
            Volver al inicio de sesión
          </Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 24,
    padding: 4,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;




