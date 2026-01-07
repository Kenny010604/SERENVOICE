// src/screens/main/AnalyzeVoiceScreen.js
// Pantalla de análisis de voz - Sincronizado con diseño web

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { GradientBackground, Card, Button } from '../../components/common';
import analisisService from '../../services/analisisService';
import { formatDuration } from '../../utils/helpers';
import { shadows, borderRadius, spacing } from '../../config/theme';

const PHRASES = [
  "Hoy me siento con mucha energía para afrontar el día",
  "A veces necesito un momento de calma para ordenar mis pensamientos",
  "Estoy agradecido por las pequeñas cosas que me hacen feliz",
  "Me preocupan algunas cosas, pero sé que puedo superarlas",
  "Hoy es un nuevo día lleno de posibilidades",
];

const AnalyzeVoiceScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestedPhrase, setSuggestedPhrase] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef(null);

  useEffect(() => {
    // Obtener permisos de audio
    requestPermissions();
    // Seleccionar frase sugerida aleatoria
    setSuggestedPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Resetear estado cuando la pantalla recibe foco (vuelve a ser visible)
  useFocusEffect(
    useCallback(() => {
      console.log('[AnalyzeVoiceScreen] useFocusEffect - Reseteando estados para nueva grabación');
      // Resetear todos los estados para permitir una nueva grabación
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      setAudioUri(null);
      setAnalyzing(false);
      // Nueva frase sugerida
      setSuggestedPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
      
      return () => {
        // Cleanup al salir de la pantalla
        console.log('[AnalyzeVoiceScreen] useFocusEffect cleanup - Saliendo de pantalla');
        if (durationInterval.current) {
          clearInterval(durationInterval.current);
        }
      };
    }, [])
  );

  useEffect(() => {
    if (isRecording) {
      // Animación de pulso mientras graba
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);
      if (!granted) {
        Alert.alert(
          'Permisos requeridos',
          'Se necesita acceso al micrófono para analizar tu voz',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (!permissionGranted) {
        await requestPermissions();
        return;
      }

      // Configurar audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioUri(null);

      // Iniciar contador de duración
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.log('Error starting recording:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);

      // Resetear modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.log('Error stopping recording:', error);
    }
  };

  const cancelRecording = async () => {
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      if (recording) {
        await recording.stopAndUnloadAsync();
      }

      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      setAudioUri(null);
    } catch (error) {
      console.log('Error canceling recording:', error);
    }
  };

  const analyzeRecording = async () => {
    if (!audioUri) {
      Alert.alert('Error', 'No hay grabación para analizar');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await analisisService.uploadAudio(audioUri, recordingDuration);
      
      console.log('[AnalyzeVoiceScreen] Respuesta del análisis:', {
        success: response?.success,
        hasEmotions: !!response?.emotions,
        emotionsCount: response?.emotions?.length,
        hasRecomendaciones: !!response?.recomendaciones,
        recomendacionesCount: response?.recomendaciones?.length,
      });
      
      // El response ya viene con la estructura completa del backend
      // { success, emotions, confidence, recomendaciones, etc. }
      if (response?.success) {
        // Limpiar estados antes de navegar para que al volver esté limpio
        setRecording(null);
        setAudioUri(null);
        setRecordingDuration(0);
        
        navigation.navigate('AnalysisResult', {
          result: response, // Pasar response directamente, no response.data
        });
      } else {
        Alert.alert('Error', response?.message || response?.error || 'No se pudo analizar el audio');
      }
    } catch (error) {
      console.error('[AnalyzeVoiceScreen] Error en análisis:', error);
      Alert.alert(
        'Error',
        error.message || 'Ocurrió un error al analizar el audio'
      );
    } finally {
      setAnalyzing(false);
      // Asegurar limpieza en cualquier caso
      setAudioUri(null);
      setRecordingDuration(0);
    }
  };

  const refreshPhrase = () => {
    setSuggestedPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analizar voz</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Graba tu voz y descubre tus emociones
          </Text>
        </View>

        {/* Suggested Phrase */}
        <View style={[styles.phraseCard, { backgroundColor: colors.panel }]}>
          <View style={styles.phraseHeader}>
            <View style={styles.phraseTitleContainer}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
              <Text style={[styles.phraseLabel, { color: colors.text }]}>
                Frase sugerida
              </Text>
            </View>
            <TouchableOpacity onPress={refreshPhrase}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.phraseText, { color: colors.textSecondary }]}>
            "{suggestedPhrase}"
          </Text>
          <Text style={[styles.phraseHint, { color: colors.textMuted }]}>
            Lee esta frase en voz alta o habla libremente
          </Text>
        </View>

        {/* Recording Area */}
        <View style={styles.recordingArea}>
          {/* Duration */}
          <Text style={[styles.duration, { color: colors.text }]}>
            {formatDuration(recordingDuration)}
          </Text>

          {/* Mic Button */}
          <Animated.View
            style={[
              styles.micButtonContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.micButton,
                {
                  backgroundColor: isRecording ? colors.error : colors.primary,
                },
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={analyzing}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={40}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Recording Status */}
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {isRecording
              ? 'Grabando... Toca para detener'
              : audioUri
              ? 'Grabación lista'
              : 'Toca para grabar'}
          </Text>

          {/* Waveform Indicator */}
          {isRecording && (
            <View style={styles.waveContainer}>
              {[...Array(7)].map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: colors.primary,
                      height: 20 + Math.random() * 30,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        {audioUri && !isRecording && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                { backgroundColor: colors.primary },
                analyzing && styles.buttonDisabled,
              ]}
              onPress={analyzeRecording}
              disabled={analyzing}
            >
              {analyzing ? (
                <Text style={styles.buttonText}>Analizando...</Text>
              ) : (
                <>
                  <Ionicons name="analytics" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Analizar grabación</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={cancelRecording}
              disabled={analyzing}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                Descartar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.panel }]}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            Consejos para una mejor grabación
          </Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="volume-medium" size={18} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Habla con claridad y a un volumen normal
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="sunny" size={18} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Busca un lugar tranquilo sin ruido de fondo
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Graba al menos 10 segundos para mejores resultados
              </Text>
            </View>
          </View>
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
    fontSize: 16,
  },
  phraseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  phraseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phraseTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phraseLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  phraseText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  phraseHint: {
    fontSize: 12,
  },
  recordingArea: {
    alignItems: 'center',
    marginVertical: 40,
  },
  duration: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 30,
  },
  micButtonContainer: {
    marginBottom: 20,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 16,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    marginTop: 20,
    gap: 4,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  actions: {
    gap: 12,
    marginTop: 20,
  },
  analyzeButton: {
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tipsCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});

export default AnalyzeVoiceScreen;



