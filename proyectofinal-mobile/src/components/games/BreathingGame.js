import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../common';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const BreathingGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('preparacion');
  const [cicloActual, setCicloActual] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const CICLOS_TOTALES = 5;
  // Colores usando la paleta de SerenVoice
  const FASES = {
    preparacion: { duracion: 3, texto: 'Prepárate...', color: colors.info || '#2196f3' },
    inhalar: { duracion: 4, texto: 'Inhala...', color: colors.success || '#4caf50' },
    mantener: { duracion: 4, texto: 'Mantén...', color: colors.warning || '#ff9800' },
    exhalar: { duracion: 4, texto: 'Exhala...', color: colors.primary || '#5ad0d2' },
    descanso: { duracion: 2, texto: 'Descansa...', color: colors.secondary || '#9c27b0' }
  };

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      avanzarFase();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    animarFase();
  }, [phase]);

  const animarFase = () => {
    if (phase === 'inhalar') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 4000,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true
        })
      ]).start();
    } else if (phase === 'exhalar') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 4000,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 4000,
          useNativeDriver: true
        })
      ]).start();
    } else if (phase === 'mantener') {
      scaleAnim.setValue(1.5);
      opacityAnim.setValue(1);
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(0.7);
    }
  };

  const avanzarFase = () => {
    const fasesOrden = ['preparacion', 'inhalar', 'mantener', 'exhalar', 'descanso'];
    const indiceActual = fasesOrden.indexOf(phase);
    
    if (phase === 'descanso') {
      if (cicloActual < CICLOS_TOTALES - 1) {
        setCicloActual(cicloActual + 1);
        setPhase('inhalar');
        setTimeLeft(FASES.inhalar.duracion);
      } else {
        finalizarEjercicio();
      }
    } else if (phase === 'preparacion') {
      setPhase('inhalar');
      setTimeLeft(FASES.inhalar.duracion);
    } else {
      const siguienteFase = fasesOrden[indiceActual + 1];
      setPhase(siguienteFase);
      setTimeLeft(FASES[siguienteFase].duracion);
    }
  };

  const iniciar = () => {
    setIsActive(true);
    setPhase('preparacion');
    setCicloActual(0);
    setTimeLeft(FASES.preparacion.duracion);
  };

  const pausar = () => {
    setIsActive(false);
  };

  const reanudar = () => {
    setIsActive(true);
  };

  const reiniciar = () => {
    setIsActive(false);
    setPhase('preparacion');
    setCicloActual(0);
    setTimeLeft(0);
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
  };

  const finalizarEjercicio = () => {
    setIsActive(false);
    setPhase('completado');
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
  };

  const faseInfo = FASES[phase] || FASES.preparacion;

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Ejercicio de Respiración</Text>
        </View>

        {/* Progreso */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Ciclo {cicloActual + 1} de {CICLOS_TOTALES}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((cicloActual + 1) / CICLOS_TOTALES) * 100}%`,
                  backgroundColor: colors.primary 
                }
              ]} 
            />
          </View>
        </View>

      {/* Círculo de respiración */}
      <View style={styles.breathingContainer}>
        {phase !== 'completado' ? (
          <>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  backgroundColor: faseInfo.color,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim
                }
              ]}
            >
              <Text style={styles.phaseText}>{faseInfo.texto}</Text>
              {timeLeft > 0 && (
                <Text style={styles.timerText}>{timeLeft}</Text>
              )}
            </Animated.View>
          </>
        ) : (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={100} color={colors.success} />
            <Text style={[styles.completedTitle, { color: colors.text }]}>¡Excelente trabajo!</Text>
            <Text style={[styles.completedText, { color: colors.textSecondary }]}>
              Has completado {CICLOS_TOTALES} ciclos de respiración
            </Text>
            <Text style={[styles.completedSubtext, { color: colors.textMuted }]}>
              Continúa practicando para mejorar tu bienestar
            </Text>
          </View>
        )}
      </View>

      {/* Instrucciones */}
      {!isActive && phase !== 'completado' && (
        <View style={[styles.instructions, { backgroundColor: colors.surface }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>Cómo funciona:</Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>• Inhala durante 4 segundos</Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>• Mantén el aire durante 4 segundos</Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>• Exhala durante 4 segundos</Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>• Descansa 2 segundos</Text>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>• Repite 5 ciclos</Text>
        </View>
      )}

      {/* Controles */}
      <View style={[styles.controls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {!isActive && phase !== 'completado' && timeLeft === 0 && (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.success }]}
            onPress={iniciar}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        )}

        {isActive && (
          <>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.warning }]}
              onPress={pausar}
            >
              <Ionicons name="pause" size={24} color="#fff" />
              <Text style={styles.buttonText}>Pausar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={reiniciar}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.buttonText}>Reiniciar</Text>
            </TouchableOpacity>
          </>
        )}

        {!isActive && timeLeft > 0 && phase !== 'completado' && (
          <>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.success }]}
              onPress={reanudar}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Reanudar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={reiniciar}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.buttonText}>Reiniciar</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'completado' && (
          <>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.success }]}
              onPress={iniciar}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.buttonText}>Volver a jugar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.textMuted }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="home" size={24} color="#fff" />
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    padding: 20,
    marginTop: 8,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  breathingCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  phaseText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  completedContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  completedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  completedSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  instructions: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    marginVertical: 4,
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BreathingGame;
