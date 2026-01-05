// src/screens/main/DashboardScreen.js
// Pantalla principal del usuario - Sincronizado con diseño web

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GradientBackground, Card, Button } from '../../components/common';
import analisisService from '../../services/analisisService';
import { formatDate, getEmotionColor, getInitials, getDisplayedConfidence } from '../../utils/helpers';
import { shadows, borderRadius, spacing } from '../../config/theme';

const { width } = Dimensions.get('window');

// Iconos que coinciden con el frontend web (react-icons/fa)
const emotionIcons = {
  Felicidad: { name: 'smile', library: 'fa5' },      // FaSmile
  Tristeza: { name: 'sad-tear', library: 'fa5' },    // FaSadTear
  Enojo: { name: 'angry', library: 'fa5' },          // FaAngry
  Miedo: { name: 'frown-open', library: 'fa5' },     // FaFrownOpen
  Sorpresa: { name: 'surprise', library: 'fa5' },    // FaSurprise
  Neutral: { name: 'meh', library: 'fa5' },          // FaMeh
  Ansiedad: { name: 'brain', library: 'fa5' },       // FaBrain
  Estrés: { name: 'heartbeat', library: 'fa5' },     // FaHeartbeat
  Disgusto: { name: 'meh-rolling-eyes', library: 'fa5' },
};

// Componente de icono de emoción
const EmotionIcon = ({ emotion, size = 24, color }) => {
  const iconData = emotionIcons[emotion] || { name: 'meh', library: 'fa5' };
  return (
    <FontAwesome5
      name={iconData.name}
      size={size}
      color={color}
    />
  );
};

const DashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [stats, setStats] = useState({
    totalAnalisis: 0,
    diasConsecutivos: 0,
    emocionDominante: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      console.log('[Dashboard] Cargando datos...');
      const historyResponse = await analisisService.getHistory(5);
      
      console.log('[Dashboard] Respuesta:', historyResponse?.success, 'Análisis:', historyResponse?.data?.length);
      
      if (historyResponse?.success && historyResponse.data?.length > 0) {
        const firstAnalysis = historyResponse.data[0];
        console.log('[Dashboard] Primer análisis:', {
          id: firstAnalysis.id_analisis,
          emocion_dominante: firstAnalysis.emocion_dominante,
          fecha: firstAnalysis.fecha_analisis,
        });
        
        setLastAnalysis(firstAnalysis);
        
        // Calcular estadísticas básicas
        const totalAnalisis = historyResponse.data.length;
        const emotions = historyResponse.data
          .filter(a => a.emocion_dominante)
          .map(a => a.emocion_dominante);
        
        const emotionCounts = emotions.reduce((acc, emotion) => {
          acc[emotion] = (acc[emotion] || 0) + 1;
          return acc;
        }, {});
        
        const dominantEmotion = Object.keys(emotionCounts).reduce(
          (a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b),
          null
        );

        setStats({
          totalAnalisis,
          diasConsecutivos: 1, // Simplificado
          emocionDominante: dominantEmotion,
        });
      } else {
        console.log('[Dashboard] No hay análisis disponibles');
      }
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  // Use shared helper to format confidence (preserve decimals when present)

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const quickActions = [
    {
      id: 'analyze',
      title: 'Analizar voz',
      subtitle: 'Graba y analiza tus emociones',
      icon: 'mic',
      color: colors.primary,
      onPress: () => navigation.navigate('Analyze'),
    },
    {
      id: 'history',
      title: 'Historial',
      subtitle: 'Ver análisis anteriores',
      icon: 'time',
      color: colors.secondary,
      onPress: () => navigation.navigate('History'),
    },
    {
      id: 'games',
      title: 'Juegos',
      subtitle: 'Juegos terapéuticos',
      icon: 'game-controller',
      color: colors.error,
      onPress: () => navigation.navigate('Games'),
    },
    {
      id: 'profile',
      title: 'Mi perfil',
      subtitle: 'Ver y editar perfil',
      icon: 'person',
      color: colors.success,
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.nombre || 'Usuario'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>
              {getInitials(user?.nombre, user?.apellido)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.panel }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="analytics" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.totalAnalisis}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Análisis
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.panel }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="flame" size={24} color={colors.error} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.diasConsecutivos}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Días seguidos
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.panel }]}>
            <View style={[styles.statIcon, { backgroundColor: (stats.emocionDominante ? getEmotionColor(stats.emocionDominante) : colors.success) + '20' }]}>
              <EmotionIcon
                emotion={stats.emocionDominante || 'Neutral'}
                size={24}
                color={stats.emocionDominante ? getEmotionColor(stats.emocionDominante) : colors.success}
              />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
              {stats.emocionDominante || '—'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Dominante
            </Text>
          </View>
        </View>

        {/* Last Analysis */}
        {lastAnalysis && (
          <TouchableOpacity
            style={[styles.lastAnalysisCard, { backgroundColor: colors.panel }]}
            onPress={() => navigation.navigate('AnalysisDetail', { id: lastAnalysis.id_analisis })}
          >
            <View style={styles.lastAnalysisHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Último análisis
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.lastAnalysisContent}>
              <View
                style={[
                  styles.emotionBadge,
                  {
                    backgroundColor:
                      getEmotionColor(lastAnalysis.emocion_dominante) + '20',
                  },
                ]}
              >
                <EmotionIcon
                  emotion={lastAnalysis.emocion_dominante}
                  size={32}
                  color={getEmotionColor(lastAnalysis.emocion_dominante)}
                />
              </View>
              <View style={styles.lastAnalysisInfo}>
                <Text style={[styles.lastAnalysisEmotion, { color: colors.text }]}>
                  {lastAnalysis.emocion_dominante || 'Sin resultado'}
                </Text>
                <Text style={[styles.lastAnalysisDate, { color: colors.textSecondary }]}>
                  {formatDate(lastAnalysis.fecha_analisis, 'relative')}
                </Text>
              </View>
              {(() => {
                const confText = getDisplayedConfidence(lastAnalysis.confianza_modelo);
                if (confText === null) return null;
                return (
                  <View style={styles.confidenceContainer}>
                    <Text style={[styles.confidenceLabel, { color: colors.textMuted }]}>
                      Confianza
                    </Text>
                    <Text style={[styles.confidenceValue, { color: colors.text }]}>
                      {confText}
                    </Text>
                  </View>
                );
              })()}
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Acciones rápidas
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: colors.panel }]}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {action.title}
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                {action.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA - Analyze Voice */}
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Analyze')}
        >
          <Ionicons name="mic" size={24} color="#FFFFFF" />
          <Text style={styles.ctaText}>Iniciar análisis de voz</Text>
        </TouchableOpacity>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  lastAnalysisCard: {
    borderRadius: 16,
    padding: 16,
  },
  lastAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  lastAnalysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emotionBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastAnalysisInfo: {
    flex: 1,
  },
  lastAnalysisEmotion: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastAnalysisDate: {
    fontSize: 14,
    marginTop: 2,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 12,
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;



