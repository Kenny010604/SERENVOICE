// src/screens/main/GameDetailScreen.js
// Pantalla de detalle de juego terapéutico

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Importar los juegos
import BreathingGame from '../../components/games/BreathingGame';
import MemoryGame from '../../components/games/MemoryGame';
import MandalaGame from '../../components/games/MandalaGame';
import PuzzleGame from '../../components/games/PuzzleGame';
import MindfulnessGame from '../../components/games/MindfulnessGame';

// Iconos para cada tipo de juego
const gameIcons = {
  respiracion: 'leaf',
  mindfulness: 'flower',
  mandala: 'color-palette',
  puzzle: 'grid',
  memoria: 'albums',
  meditacion: 'flower',
  relajacion: 'water',
  ejercicio: 'fitness',
  default: 'game-controller',
};

// Colores consistentes con el tema de SerenVoice (global.css)
const gameColors = {
  respiracion: '#4caf50',   // Verde - calma, naturaleza
  mindfulness: '#5ad0d2',   // Primary - atención plena
  mandala: '#9c27b0',       // Morado - creatividad
  puzzle: '#ff9800',        // Naranja - concentración
  memoria: '#2196f3',       // Azul - cognición
  meditacion: '#5ad0d2',    // Primary
  relajacion: '#4caf50',    // Verde - relajación
  ejercicio: '#ff9800',     // Naranja - actividad
  default: '#5ad0d2',       // Primary color de SerenVoice
};

const GameDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { game } = route.params || {};
  const [isPlaying, setIsPlaying] = useState(false);

  if (!game) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Juego no encontrado
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  // Obtener tipo del juego (soporta tanto 'tipo' como 'tipo_juego' de la BD)
  const getGameType = () => game.tipo || game.tipo_juego || 'default';
  const color = gameColors[getGameType()] || gameColors.default;
  const icon = gameIcons[getGameType()] || gameIcons.default;

  const handleStartGame = () => {
    // Mapear nombres de juegos a componentes
    // Soporta tanto nombres exactos como tipo_juego de la BD
    const gameComponentMap = {
      // Nombres oficiales de la BD (después de corrección)
      'Respiración Guiada': 'BreathingGame',
      'Jardín Zen': 'MindfulnessGame',
      'Mandala Creativo': 'MandalaGame',
      'Puzzle Numérico': 'PuzzleGame',
      'Juego de Memoria': 'MemoryGame',
      // Mapeo por tipo_juego de la BD
      'respiracion': 'BreathingGame',
      'mindfulness': 'MindfulnessGame',
      'mandala': 'MandalaGame',
      'puzzle': 'PuzzleGame',
      'memoria': 'MemoryGame',
      // Alias alternativos (por compatibilidad)
      'Mindfulness': 'MindfulnessGame',
    };

    // Buscar por nombre, luego por tipo, luego por tipo_juego (campo de BD)
    const gameScreen = gameComponentMap[game.nombre] || 
                       gameComponentMap[game.tipo] || 
                       gameComponentMap[game.tipo_juego];

    if (gameScreen) {
      setIsPlaying(true);
      navigation.navigate(gameScreen, { game });
    } else {
      Alert.alert(
        'Juego no disponible',
        'Este juego aún no está disponible en la versión móvil.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Game Icon */}
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={80} color={color} />
        </View>

        {/* Game Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.gameName, { color: colors.text }]}>
            {game.nombre}
          </Text>
          <Text style={[styles.gameDescription, { color: colors.textSecondary }]}>
            {game.descripcion}
          </Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={[styles.metaCard, { backgroundColor: colors.panel }]}>
              <Ionicons name="time-outline" size={24} color={color} />
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                Duración
              </Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>
                {game.duracion_minutos} min
              </Text>
            </View>

            <View style={[styles.metaCard, { backgroundColor: colors.panel }]}>
              <Ionicons name="trending-up" size={24} color={color} />
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                Nivel
              </Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>
                Básico
              </Text>
            </View>
          </View>

          {/* Benefits */}
          <View style={[styles.benefitsCard, { backgroundColor: colors.panel }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Beneficios
            </Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={color} />
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  Reduce el estrés y la ansiedad
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={color} />
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  Mejora la concentración
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={color} />
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  Promueve el bienestar emocional
                </Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={[styles.instructionsCard, { backgroundColor: colors.panel }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Instrucciones
            </Text>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              1. Encuentra un lugar tranquilo y cómodo{'\n'}
              2. Cierra los ojos o mira un punto fijo{'\n'}
              3. Sigue las instrucciones de la actividad{'\n'}
              4. No te apresures, disfruta el proceso
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: color },
            isPlaying && styles.buttonDisabled,
          ]}
          onPress={handleStartGame}
          disabled={isPlaying}
        >
          <Ionicons name="play-circle" size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>
            {isPlaying ? 'Jugando...' : 'Comenzar actividad'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    padding: 8,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  infoSection: {
    marginBottom: 30,
  },
  gameName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  gameDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  metaCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  instructionsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GameDetailScreen;
