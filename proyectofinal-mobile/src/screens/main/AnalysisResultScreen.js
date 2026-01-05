// src/screens/main/AnalysisResultScreen.js
// Pantalla de resultados del análisis

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { GradientBackground } from '../../components/common';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getEmotionColor, formatDate, getDisplayedConfidence } from '../../utils/helpers';

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

const AnalysisResultScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { result } = route.params || {};

  console.log('[AnalysisResultScreen] Datos recibidos:', {
    hasResult: !!result,
    resultKeys: result ? Object.keys(result) : [],
    hasEmotions: !!result?.emotions,
    hasRecomendaciones: !!result?.recomendaciones,
  });

  if (!result) {
    console.log('[AnalysisResultScreen] No hay result en route.params');
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            No hay resultados para mostrar
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

  // Normalizar estructura de datos (el backend puede enviar 2 formatos diferentes)
  const emotionsArray = result.emotions || result.emociones || [];
  const resultado = result.resultado || null;

  // Determine displayed confidence using helper
  const rawConfidence = result.confidence || result.resultado?.confianza || result.confianza;
  const displayedConfidence = getDisplayedConfidence(rawConfidence);

  // Build full list of 8 emotions. Prefer `resultado` (niveles por emoción). Otherwise, build from emotionsArray and fill missing.
  const buildFromResultado = (r) => [
    { nombre: 'Felicidad', valor: r.nivel_felicidad || 0 },
    { nombre: 'Tristeza', valor: r.nivel_tristeza || 0 },
    { nombre: 'Enojo', valor: r.nivel_enojo || 0 },
    { nombre: 'Miedo', valor: r.nivel_miedo || 0 },
    { nombre: 'Sorpresa', valor: r.nivel_sorpresa || 0 },
    { nombre: 'Neutral', valor: r.nivel_neutral || 0 },
    { nombre: 'Ansiedad', valor: r.nivel_ansiedad || 0 },
    { nombre: 'Estrés', valor: r.nivel_estres || 0 },
  ];

  const buildFromEmotionsArray = (arr) => {
    const map = {};
    arr.forEach((e) => {
      const name = e.name || e.nombre;
      const value = e.value || e.valor || e.porcentaje || 0;
      map[name] = Number(value) || 0;
    });
    const names = ['Felicidad','Tristeza','Enojo','Miedo','Sorpresa','Neutral','Ansiedad','Estrés'];
    return names.map(n => ({ nombre: n, valor: map[n] ?? 0 }));
  };

  let allEmotions = [];
  if (resultado) {
    allEmotions = buildFromResultado(resultado);
  } else if (emotionsArray && emotionsArray.length > 0) {
    allEmotions = buildFromEmotionsArray(emotionsArray);
  }

  // Sort descending by value so dominant emotion appears first
  allEmotions.sort((a, b) => (b.valor || 0) - (a.valor || 0));

  const mainEmotion = resultado?.emocion_dominante || allEmotions[0]?.nombre || 'Neutral';

  console.log('[AnalysisResultScreen] Datos normalizados:', {
    emotionsCount: allEmotions.length,
    mainEmotion,
    rawConfidence,
    displayedConfidence,
  });

  console.log('[AnalysisResultScreen] Emociones normalizadas:',
    allEmotions.map(e => ({ nombre: e.nombre, valor: e.valor, displayPercent: (Number(e.valor) || 0).toFixed(1) + '%' }))
  );
  
  const recommendations = (result.recomendaciones || []).map(rec => ({
    tipo: rec.tipo_recomendacion || rec.tipo || 'actividad',
    titulo: rec.titulo || getTitleFromType(rec.tipo_recomendacion || rec.tipo),
    descripcion: rec.contenido || rec.descripcion || '',
    nombre: rec.titulo || getTitleFromType(rec.tipo_recomendacion || rec.tipo)
  }));

  console.log('[AnalysisResultScreen] Recomendaciones procesadas:', {
    count: recommendations.length,
    recommendations: recommendations.map(r => ({ tipo: r.tipo, titulo: r.titulo })),
  });

  function getTitleFromType(tipo) {
    const titles = {
      respiracion: 'Ejercicio de respiración',
      meditacion: 'Práctica de meditación',
      pausa_activa: 'Pausa activa',
      ejercicio: 'Actividad física',
      profesional: 'Ayuda profesional'
    };
    return titles[tipo] || 'Recomendación';
  }

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
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Resultado del análisis
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatDate(result.fecha_analisis || new Date(), 'long')}
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
            <EmotionIcon
              emotion={mainEmotion}
              size={60}
              color={getEmotionColor(mainEmotion)}
            />
          </View>
          <Text style={[styles.mainEmotionLabel, { color: colors.textSecondary }]}>
            Emoción dominante
          </Text>
          <Text style={[styles.mainEmotionText, { color: colors.text }]}>
            {mainEmotion}
          </Text>
          <View style={styles.confidenceRow}>
            <Text style={[styles.confidenceLabel, { color: colors.textMuted }]}>
              Confianza:
            </Text>
            <Text
              style={[
                styles.confidenceValue,
                { color: getEmotionColor(mainEmotion) },
              ]}
            >
              {displayedConfidence ?? '—'}
            </Text>
          </View>
        </View>

        {/* All Emotions */}
        {allEmotions.length > 0 && (
          <View style={[styles.emotionsCard, { backgroundColor: colors.panel }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Detalle de emociones
            </Text>
            {allEmotions.map((emotion, index) => (
              <View key={index} style={styles.emotionItem}>
                <View style={styles.emotionLeft}>
                  <EmotionIcon
                    emotion={emotion.nombre}
                    size={20}
                    color={getEmotionColor(emotion.nombre)}
                  />
                  <Text style={[styles.emotionName, { color: colors.text }]}>
                    {emotion.nombre}
                  </Text>
                </View>
                <View style={styles.emotionRight}>
                  <View style={[styles.barContainer, { backgroundColor: colors.border }]}>
                    <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: getEmotionColor(emotion.nombre),
                            width: `${(emotion.valor || emotion.porcentaje)}%`,
                          },
                        ]}
                      />
                  </View>
                    <Text style={[styles.emotionValue, { color: colors.textSecondary }]}>
                    {(Number(emotion.valor ?? emotion.porcentaje ?? 0)).toFixed(1)}%
                    </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={[styles.recommendationsCard, { backgroundColor: colors.panel }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recomendaciones
            </Text>
            {recommendations.map((rec, index) => {
              const tipo = rec.tipo || 'actividad';
              const getRecIcon = (tipo) => {
                const icons = {
                  respiracion: 'fitness',
                  meditacion: 'leaf',
                  pausa_activa: 'walk',
                  ejercicio: 'barbell',
                  profesional: 'medical',
                  actividad: 'bulb'
                };
                return icons[tipo] || 'bulb';
              };
              
              return (
                <View key={index} style={styles.recItem}>
                  <View style={[styles.recIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons
                      name={getRecIcon(tipo)}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.recContent}>
                    <Text style={[styles.recTitle, { color: colors.text }]}>
                      {rec.titulo || rec.nombre}
                    </Text>
                    <Text style={[styles.recDescription, { color: colors.textSecondary }]}>
                      {rec.descripcion}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              // Volver al inicio del stack de Analyze para permitir nueva grabación
              navigation.popToTop();
            }}
          >
            <Ionicons name="mic" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Nuevo análisis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('History')}
          >
            <Ionicons name="time" size={20} color={colors.textSecondary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Ver historial
            </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  mainEmotionCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainEmotionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  mainEmotionText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 14,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  emotionsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emotionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 100,
  },
  emotionName: {
    fontSize: 14,
    fontWeight: '500',
  },
  emotionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  emotionValue: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  recommendationsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  recItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  recIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  recDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: 12,
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
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

export default AnalysisResultScreen;




