// src/screens/auth/WelcomeScreen.js
// Pantalla de bienvenida

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Image,
  ActivityIndicator
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../config/api';

const { width, height } = Dimensions.get('window');

// Logo de la aplicación
const logoImage = require('../../../assets/SerenVoice Logo.png');

const WelcomeScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'

  // Verificar conexión al backend
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    setBackendStatus('checking');
    try {
      // Crear una promesa con timeout manual (compatible con web)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );
      
      const fetchPromise = fetch(`${API_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend conectado:', data);
        setBackendStatus('connected');
      } else {
        console.log('Backend respondió con error:', response.status);
        setBackendStatus('disconnected');
      }
    } catch (error) {
      console.log('Error de conexión al backend:', error.message);
      setBackendStatus('disconnected');
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return colors.success;
      case 'disconnected': return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Conectado al servidor';
      case 'disconnected': return 'Sin conexión al servidor';
      default: return 'Verificando conexión...';
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'connected': return 'checkmark-circle';
      case 'disconnected': return 'close-circle';
      default: return 'sync-circle';
    }
  };

  return (
    <GradientBackground style={styles.container}>
      {/* Indicador de conexión al backend */}
      <TouchableOpacity 
        style={[styles.statusBar, { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() }]}
        onPress={checkBackendConnection}
      >
        {backendStatus === 'checking' ? (
          <ActivityIndicator size="small" color={getStatusColor()} />
        ) : (
          <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
        )}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {backendStatus !== 'checking' && (
          <Ionicons name="refresh" size={14} color={getStatusColor()} style={{ marginLeft: 4 }} />
        )}
      </TouchableOpacity>

      {/* Logo y título */}
      <View style={styles.header}>
        <Image 
          source={logoImage} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>SerenVoice</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tu compañero de bienestar emocional
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <FeatureItem 
          icon="mic-outline"
          title="Análisis de voz"
          description="Detecta tus emociones a través de tu voz"
          colors={colors}
        />
        <FeatureItem 
          icon="analytics-outline"
          title="Seguimiento"
          description="Monitorea tu bienestar emocional"
          colors={colors}
        />
        <FeatureItem 
          icon="game-controller-outline"
          title="Juegos terapéuticos"
          description="Ejercicios para mejorar tu estado"
          colors={colors}
        />
      </View>

      {/* Botones */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
            Iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
};

const FeatureItem = ({ icon, title, description, colors }) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
      <Ionicons name={icon} size={24} color={colors.primary} />
    </View>
    <View style={styles.featureText}>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;




