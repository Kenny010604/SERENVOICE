// src/screens/main/AnalysisDetailScreen.js
// Pantalla de detalle de un análisis

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import analisisService from '../../services/analisisService';
import { formatDate, getEmotionColor } from '../../utils/helpers';

const emotionIcons = {
  Felicidad: 'happy',
  Tristeza: 'sad',
  Enojo: 'flame',
  Miedo: 'alert',
  Sorpresa: 'eye',
  Disgusto: 'thumbs-down',
  Neutral: 'remove-circle',
  Ansiedad: 'pulse',
  Estrés: 'warning',
};

const AnalysisDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { id } = route.params || {};
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    if (!id) {
      setError('ID de análisis no proporcionado');
      setLoading(false);
      return;
    }

    try {
      const response = await analisisService.getById(id);
      console.log('[AnalysisDetailScreen] Respuesta completa:', JSON.stringify(response, null, 2));
      if (response?.success) {
        setAnalysis(response.data);
        console.log('[AnalysisDetailScreen] Análisis seteado:', {
          hasResultado: !!response.data?.resultado,
          emocionDominante: response.data?.resultado?.emocion_dominante,
          confianza: response.data?.resultado?.confianza_modelo
        });
      } else {
        setError('No se pudo cargar el análisis');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el análisis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando análisis...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  if (error || !analysis) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Análisis no encontrado'}
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

  const mainEmotion = analysis.resultado?.emocion_dominante || analysis.resultado?.emocion_principal || 'Neutral';
  const confidence = (analysis.resultado?.confianza_modelo || analysis.resultado?.confianza || 0);
  
  // Construir array de emociones desde niveles individuales (backend envía ya como %)
  const allEmotions = analysis.resultado ? [
    { nombre: 'Felicidad', valor: analysis.resultado.nivel_felicidad || 0 },
    { nombre: 'Tristeza', valor: analysis.resultado.nivel_tristeza || 0 },
    { nombre: 'Enojo', valor: analysis.resultado.nivel_enojo || 0 },
    { nombre: 'Miedo', valor: analysis.resultado.nivel_miedo || 0 },
    { nombre: 'Sorpresa', valor: analysis.resultado.nivel_sorpresa || 0 },
    { nombre: 'Neutral', valor: analysis.resultado.nivel_neutral || 0 }
  ].filter(e => e.valor > 0).sort((a, b) => b.valor - a.valor) : [];
  
  const recommendations = (analysis.recomendaciones || []).map(rec => ({
    titulo: rec.tipo_recomendacion || rec.tipo || 'Recomendación',
    nombre: rec.tipo_recomendacion || rec.tipo || 'Recomendación',
    descripcion: rec.contenido || rec.descripcion || '',
    tipo: rec.tipo_recomendacion || rec.tipo || 'actividad'
  }));

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
          <Text style={[styles.title, { color: colors.text }]}>
            Detalle del análisis
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatDate(analysis.analisis?.fecha_analisis || analysis.fecha_analisis, 'long')}
          </Text>
        </View>

        {/* Main Emotion */}
        <View style={[styles.mainEmotionCard, { backgroundColor: colors.panel }]}>
          <View
            style={[
              styles.emotionIconContainer,
              { backgroundColor: getEmotionColor(mainEmotion) + '20' },
            ]}
          >
            <Ionicons
              name={emotionIcons[mainEmotion] || 'pulse'}
              size={50}
              color={getEmotionColor(mainEmotion)}
            />
          </View>
          <View style={styles.emotionInfo}>
            <Text style={[styles.emotionLabel, { color: colors.textSecondary }]}>
              Emoción principal
            </Text>
            <Text style={[styles.emotionText, { color: colors.text }]}>
              {mainEmotion}
            </Text>
          </View>
          <View style={styles.confidenceSection}>
            <Text style={[styles.confidenceLabel, { color: colors.textMuted }]}>
              Confianza
            </Text>
            <Text
              style={[
                styles.confidenceValue,
                { color: getEmotionColor(mainEmotion) },
              ]}
            >
              {(confidence).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* All Emotions */}
        {allEmotions.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.panel }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Todas las emociones
            </Text>
            {allEmotions.map((emotion, index) => (
              <View key={index} style={styles.emotionItem}>
                <View style={styles.emotionLeft}>
                  <Ionicons
                    name={emotionIcons[emotion.nombre] || 'pulse'}
                    size={18}
                    color={getEmotionColor(emotion.nombre)}
                  />
                  <Text style={[styles.emotionName, { color: colors.text }]}>
                    {emotion.nombre}
                  </Text>
                </View>
                <View style={styles.emotionRight}>
                  <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: getEmotionColor(emotion.nombre),
                          width: `${emotion.valor || emotion.porcentaje || 0}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.emotionPercent, { color: colors.textSecondary }]}>
                    {(emotion.valor || emotion.porcentaje || 0).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Audio Info */}
        {analysis.audio && (
          <View style={[styles.card, { backgroundColor: colors.panel }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Información del audio
            </Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Duración:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {analysis.audio.duracion || 'N/A'} segundos
              </Text>
            </View>
          </View>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.panel }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recomendaciones
            </Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recItem}>
                <View style={[styles.recIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="bulb" size={18} color={colors.primary} />
                </View>
                <View style={styles.recContent}>
                  <Text style={[styles.recTitle, { color: colors.text }]}>
                    {rec.titulo || rec.nombre}
                  </Text>
                  {rec.descripcion && (
                    <Text style={[styles.recDescription, { color: colors.textSecondary }]}>
                      {rec.descripcion}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Analyze')}
          >
            <Ionicons name="mic" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Nuevo análisis</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  mainEmotionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  emotionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  emotionLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  emotionText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  confidenceSection: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  emotionName: {
    fontSize: 14,
  },
  emotionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  emotionPercent: {
    fontSize: 12,
    width: 36,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  recItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  recIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  recDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
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
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalysisDetailScreen;




