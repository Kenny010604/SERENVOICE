// src/screens/main/GamesScreen.js
// Pantalla de juegos terapéuticos

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import juegosService from '../../services/juegosService';

// Iconos para cada tipo de juego
const gameIcons = {
  respiracion: 'leaf-outline',
  mindfulness: 'flower-outline',
  mandala: 'color-palette-outline',
  puzzle: 'grid-outline',
  memoria: 'albums-outline',
  meditacion: 'flower-outline',
  relajacion: 'water-outline',
  ejercicio: 'fitness-outline',
  default: 'game-controller-outline',
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

const GamesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setError(null);
      const response = await juegosService.getAll();
      if (response?.success) {
        setGames(response.juegos || response.data || []);
      } else {
        // Si no hay juegos, mostrar algunos predeterminados
        setGames(getDefaultGames());
      }
    } catch (err) {
      setGames(getDefaultGames());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultGames = () => [
    {
      id_juego: 1,
      nombre: 'Respiración Guiada',
      descripcion: 'Ejercicio guiado de respiración 4-4-6 para reducir la ansiedad y el estrés',
      tipo: 'respiracion',
      tipo_juego: 'respiracion',
      duracion_minutos: 5,
    },
    {
      id_juego: 2,
      nombre: 'Jardín Zen',
      descripcion: 'Crea tu jardín zen virtual mientras practicas la atención plena',
      tipo: 'mindfulness',
      tipo_juego: 'mindfulness',
      duracion_minutos: 10,
    },
    {
      id_juego: 3,
      nombre: 'Mandala Creativo',
      descripcion: 'Colorea mandalas terapéuticos para relajarte y fomentar la creatividad',
      tipo: 'mandala',
      tipo_juego: 'mandala',
      duracion_minutos: 7,
    },
    {
      id_juego: 4,
      nombre: 'Puzzle Numérico',
      descripcion: 'Resuelve el puzzle deslizante 3x3 ordenando los números del 1 al 8',
      tipo: 'puzzle',
      tipo_juego: 'puzzle',
      duracion_minutos: 8,
    },
    {
      id_juego: 5,
      nombre: 'Juego de Memoria',
      descripcion: 'Encuentra los pares de emojis iguales ejercitando tu memoria',
      tipo: 'memoria',
      tipo_juego: 'memoria',
      duracion_minutos: 15,
    },
  ];

  // Obtener tipo del juego (soporta tanto 'tipo' como 'tipo_juego' de la BD)
  const getGameType = (item) => item.tipo || item.tipo_juego || 'default';
  const getGameIcon = (tipo) => gameIcons[tipo] || gameIcons.default;
  const getGameColor = (tipo) => gameColors[tipo] || gameColors.default;

  const renderGameItem = ({ item }) => {
    const gameType = getGameType(item);
    const color = getGameColor(gameType);
    const icon = getGameIcon(gameType);

    return (
      <TouchableOpacity
        style={[styles.gameCard, { backgroundColor: colors.panel }]}
        onPress={() => navigation.navigate('GameDetail', { game: item })}
      >
        <View style={[styles.gameIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={32} color={color} />
        </View>
        <View style={styles.gameInfo}>
          <Text style={[styles.gameName, { color: colors.text }]}>
            {item.nombre}
          </Text>
          <Text
            style={[styles.gameDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.descripcion}
          </Text>
          <View style={styles.gameMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {item.duracion_minutos} min
              </Text>
            </View>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Juegos terapéuticos</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Actividades diseñadas para mejorar tu bienestar emocional
      </Text>
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando juegos...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <FlatList
        data={games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id_juego?.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  gameIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  gameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default GamesScreen;




