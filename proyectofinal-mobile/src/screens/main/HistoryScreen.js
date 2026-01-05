// src/screens/main/HistoryScreen.js
// Pantalla de historial de análisis

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import analisisService from '../../services/analisisService';
import { formatDate, getEmotionColor } from '../../utils/helpers';

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

const HistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    try {
      setError(null);
      const response = await analisisService.getHistory(50);
      if (response?.success) {
        setAnalyses(response.data || []);
      } else {
        setError('No se pudo cargar el historial');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, []);

  const renderAnalysisItem = ({ item }) => {
    const emotion = item.emocion_dominante || item.resultado?.emocion_principal || 'Neutral';
    const confidence = item.confianza_modelo || item.resultado?.confianza || 0;
    const emotionColor = getEmotionColor(emotion);

    return (
      <TouchableOpacity
        style={[styles.analysisCard, { backgroundColor: colors.panel }]}
        onPress={() => navigation.navigate('AnalysisDetail', { id: item.id_analisis })}
      >
        <View
          style={[styles.emotionBadge, { backgroundColor: emotionColor + '20' }]}
        >
          <EmotionIcon
            emotion={emotion}
            size={24}
            color={emotionColor}
          />
        </View>
        <View style={styles.analysisInfo}>
          <Text style={[styles.analysisEmotion, { color: colors.text }]}>
            {emotion}
          </Text>
          <Text style={[styles.analysisDate, { color: colors.textSecondary }]}>
            {formatDate(item.fecha_analisis, 'long')}
          </Text>
        </View>
        <View style={styles.analysisRight}>
          <Text style={[styles.confidenceText, { color: emotionColor }]}>
            {(confidence).toFixed(1)}%
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.border }]}>
        <Ionicons name="analytics" size={48} color={colors.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Sin análisis aún
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Realiza tu primer análisis de voz para comenzar a ver tu historial
      </Text>
      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Analyze')}
      >
        <Ionicons name="mic" size={20} color="#FFFFFF" />
        <Text style={styles.ctaButtonText}>Iniciar análisis</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.title, { color: colors.text }]}>Historial</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {analyses.length} {analyses.length === 1 ? 'análisis' : 'análisis'} realizados
      </Text>
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando historial...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setLoading(true);
              loadHistory();
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <FlatList
        data={analyses}
        renderItem={renderAnalysisItem}
        keyExtractor={(item) => item.id_analisis?.toString()}
        contentContainerStyle={[
          styles.listContent,
          analyses.length === 0 && styles.emptyList,
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  emptyList: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  emotionBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisInfo: {
    flex: 1,
    marginLeft: 16,
  },
  analysisEmotion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  analysisDate: {
    fontSize: 13,
  },
  analysisRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HistoryScreen;




