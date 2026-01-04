import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../common/GradientBackground';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const ACTIVITIES = [
  {
    id: 1,
    titulo: 'Escaneo Corporal',
    duracion: 300, // 5 minutos
    pasos: [
      'Cierra los ojos y respira profundamente',
      'Enfoca tu atención en tus pies',
      'Siente cualquier tensión o relajación',
      'Sube lentamente por tus piernas',
      'Continúa por tu torso y brazos',
      'Termina en tu cabeza y rostro',
      'Observa tu cuerpo completo'
    ],
    icon: 'body'
  },
  {
    id: 2,
    titulo: 'Atención Plena',
    duracion: 240, // 4 minutos
    pasos: [
      'Siéntate cómodamente',
      'Respira naturalmente',
      'Observa tus pensamientos sin juzgar',
      'Deja que pasen como nubes',
      'Vuelve a tu respiración',
      'Mantén tu atención en el presente'
    ],
    icon: 'leaf'
  },
  {
    id: 3,
    titulo: 'Gratitud',
    duracion: 180, // 3 minutos
    pasos: [
      'Piensa en algo por lo que estés agradecido',
      'Puede ser grande o pequeño',
      'Siente la emoción de gratitud',
      'Reflexiona sobre por qué es importante',
      'Extiende ese sentimiento a otras áreas',
      'Termina con una sonrisa'
    ],
    icon: 'heart'
  },
  {
    id: 4,
    titulo: 'Visualización Positiva',
    duracion: 360, // 6 minutos
    pasos: [
      'Encuentra un lugar tranquilo',
      'Imagina un lugar seguro y pacífico',
      'Observa los detalles: colores, sonidos',
      'Siente la paz de ese lugar',
      'Respira profundamente ahí',
      'Lleva esa calma contigo al volver'
    ],
    icon: 'eye'
  }
];

const MindfulnessGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            completeActivity();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (selectedActivity) {
      animateStep();
    }
  }, [currentStep, selectedActivity]);

  const animateStep = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };

  const startActivity = (activity) => {
    setSelectedActivity(activity);
    setCurrentStep(0);
    setTimeLeft(activity.duracion);
    setIsActive(true);
    setIsCompleted(false);
  };

  const nextStep = () => {
    if (currentStep < selectedActivity.pasos.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const pauseActivity = () => {
    setIsActive(false);
  };

  const resumeActivity = () => {
    setIsActive(true);
  };

  const completeActivity = () => {
    setIsActive(false);
    setIsCompleted(true);
  };

  const exitActivity = () => {
    setSelectedActivity(null);
    setCurrentStep(0);
    setTimeLeft(0);
    setIsActive(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIconName = (icon) => {
    const iconMap = {
      'body': 'body',
      'leaf': 'leaf',
      'heart': 'heart',
      'eye': 'eye'
    };
    return iconMap[icon] || 'flower';
  };

  if (isCompleted) {
    return (
      <GradientBackground>
        <View style={styles.container}>
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Mindfulness</Text>
          </View>

          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={100} color={colors.success} />
            <Text style={[styles.completedTitle, { color: colors.text }]}>¡Excelente!</Text>
            <Text style={[styles.completedText, { color: colors.textSecondary }]}>
              Has completado la actividad de {selectedActivity.titulo}
            </Text>
            <Text style={[styles.completedSubtext, { color: colors.textMuted }]}>
              Continúa practicando mindfulness regularmente para mejorar tu bienestar
            </Text>

            <View style={styles.completedButtons}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.info }]}
                onPress={exitActivity}
              >
                <Ionicons name="list" size={20} color="#fff" />
                <Text style={styles.buttonText}>Otras actividades</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.textMuted }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="home" size={20} color="#fff" />
                <Text style={styles.buttonText}>Volver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GradientBackground>
    );
  }

  if (selectedActivity) {
    return (
      <GradientBackground>
        <View style={styles.container}>
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={exitActivity}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>{selectedActivity.titulo}</Text>
          </View>

          {/* Timer */}
          <View style={[styles.timerContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(timeLeft)}</Text>
          </View>

          {/* Progress */}
          <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              Paso {currentStep + 1} de {selectedActivity.pasos.length}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((currentStep + 1) / selectedActivity.pasos.length) * 100}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
          </View>

          {/* Current Step */}
          <View style={styles.stepContainer}>
            <Animated.View 
              style={[
                styles.stepCard,
                { backgroundColor: colors.surface },
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={[styles.stepText, { color: colors.text }]}>
                {selectedActivity.pasos[currentStep]}
              </Text>
            </Animated.View>
          </View>

          {/* Navigation */}
          <View style={[styles.navigationContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity 
              style={[
                styles.navButton,
                currentStep === 0 && styles.navButtonDisabled
              ]}
              onPress={previousStep}
              disabled={currentStep === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={32} 
                color={currentStep === 0 ? colors.border : colors.primary} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: isActive ? colors.warning : colors.success }]}
              onPress={isActive ? pauseActivity : resumeActivity}
            >
              <Ionicons name={isActive ? 'pause' : 'play'} size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {isActive ? 'Pausar' : 'Reanudar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.navButton,
                currentStep === selectedActivity.pasos.length - 1 && styles.navButtonDisabled
              ]}
              onPress={nextStep}
              disabled={currentStep === selectedActivity.pasos.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={32} 
                color={currentStep === selectedActivity.pasos.length - 1 ? colors.border : colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {/* Controls */}
          <View style={[styles.controls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={completeActivity}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.buttonText}>Terminar ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GradientBackground>
    );
  }

  // Activity Selection Screen
  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Mindfulness</Text>
        </View>

        <ScrollView style={styles.listContainer}>
          <Text style={[styles.subtitle, { color: colors.text }]}>Elige una actividad de atención plena:</Text>
          
          {ACTIVITIES.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[styles.activityCard, { backgroundColor: colors.surface }]}
              onPress={() => startActivity(activity)}
              activeOpacity={0.7}
            >
              <View style={[styles.activityIcon, { backgroundColor: colors.primaryLight || 'rgba(90, 208, 210, 0.15)' }]}>
                <Ionicons name={getIconName(activity.icon)} size={40} color={colors.primary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.titulo}</Text>
                <View style={styles.activityMeta}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={[styles.activityDuration, { color: colors.textSecondary }]}>
                    {Math.floor(activity.duracion / 60)} min
                  </Text>
                  <Text style={[styles.activitySteps, { color: colors.textSecondary }]}>
                    • {activity.pasos.length} pasos
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.border} />
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 20,
    paddingBottom: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDuration: {
    fontSize: 14,
    marginLeft: 4,
  },
  activitySteps: {
    fontSize: 14,
    marginLeft: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 8,
    gap: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  progressContainer: {
    padding: 20,
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
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
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stepCard: {
    padding: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  stepText: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 36,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  navButton: {
    padding: 12,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  controls: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  completedText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  completedSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  completedButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default MindfulnessGame;
