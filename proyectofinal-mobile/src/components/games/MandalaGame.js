import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import GradientBackground from '../common/GradientBackground';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(width, height) - 120;

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84'
];

const MANDALA_PATTERNS = [
  {
    id: 1,
    name: 'Flor Simple',
    paths: [
      'M 200,100 Q 150,150 200,200 Q 250,150 200,100',
      'M 200,200 Q 150,250 200,300 Q 250,250 200,200',
      'M 100,200 Q 150,150 200,200 Q 150,250 100,200',
      'M 300,200 Q 250,150 200,200 Q 250,250 300,200',
    ]
  },
  {
    id: 2,
    name: 'Estrella',
    paths: [
      'M 200,80 L 220,160 L 300,180 L 220,200 L 200,280 L 180,200 L 100,180 L 180,160 Z',
    ]
  },
  {
    id: 3,
    name: 'Círculos',
    circles: [
      { cx: 200, cy: 200, r: 80 },
      { cx: 200, cy: 200, r: 120 },
      { cx: 200, cy: 200, r: 160 },
    ]
  }
];

const MandalaGame = ({ navigation }) => {
  const { colors } = useTheme();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedPattern, setSelectedPattern] = useState(MANDALA_PATTERNS[0]);
  const [coloredSections, setColoredSections] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSectionPress = (sectionId) => {
    const newColoredSections = {
      ...coloredSections,
      [sectionId]: selectedColor
    };
    setColoredSections(newColoredSections);

    // Check if all sections are colored
    const totalSections = selectedPattern.paths?.length || selectedPattern.circles?.length || 0;
    const coloredCount = Object.keys(newColoredSections).length;
    
    if (coloredCount === totalSections && totalSections > 0) {
      setTimeout(() => {
        setIsCompleted(true);
      }, 500);
    }
  };

  const resetMandala = () => {
    setColoredSections({});
    setIsCompleted(false);
  };

  const changePattern = (pattern) => {
    setSelectedPattern(pattern);
    resetMandala();
  };

  const renderMandala = () => {
    return (
      <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} viewBox="0 0 400 400">
        {/* Background circle */}
        <Circle
          cx="200"
          cy="200"
          r="190"
          fill="#f0f0f0"
          stroke="#ccc"
          strokeWidth="2"
        />

        {/* Render paths */}
        {selectedPattern.paths && selectedPattern.paths.map((path, index) => (
          <Path
            key={`path-${index}`}
            d={path}
            fill={coloredSections[`path-${index}`] || '#fff'}
            stroke="#333"
            strokeWidth="2"
            onPress={() => handleSectionPress(`path-${index}`)}
          />
        ))}

        {/* Render circles */}
        {selectedPattern.circles && selectedPattern.circles.map((circle, index) => (
          <Circle
            key={`circle-${index}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill={coloredSections[`circle-${index}`] || 'none'}
            stroke="#333"
            strokeWidth="2"
            onPress={() => handleSectionPress(`circle-${index}`)}
          />
        ))}

        {/* Center circle */}
        <Circle
          cx="200"
          cy="200"
          r="30"
          fill={coloredSections['center'] || '#fff'}
          stroke="#333"
          strokeWidth="2"
          onPress={() => handleSectionPress('center')}
        />
      </Svg>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Mandala Creativo</Text>
        </View>

        {/* Patterns */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={[styles.patternsContainer, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.patternsContent}
        >
          {MANDALA_PATTERNS.map((pattern) => (
            <TouchableOpacity
              key={pattern.id}
              style={[
                styles.patternButton,
                { backgroundColor: colors.border },
                selectedPattern.id === pattern.id && { backgroundColor: colors.secondary }
              ]}
              onPress={() => changePattern(pattern)}
            >
              <Text style={[styles.patternButtonText, { color: selectedPattern.id === pattern.id ? '#fff' : colors.text }]}>
                {pattern.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          {renderMandala()}
        </View>

        {/* Color Palette */}
        <View style={[styles.paletteContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Text style={[styles.paletteTitle, { color: colors.text }]}>Elige un color:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.palette}
          >
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Completed Modal */}
        {isCompleted && (
          <View style={styles.completedOverlay}>
            <View style={[styles.completedCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="color-palette" size={80} color={colors.secondary} />
              <Text style={[styles.completedTitle, { color: colors.text }]}>¡Obra maestra!</Text>
              <Text style={[styles.completedText, { color: colors.textSecondary }]}>
                Has completado tu mandala
              </Text>
              <Text style={[styles.completedSubtext, { color: colors.textMuted }]}>
                El arte es una forma de meditación y relajación
              </Text>

              <View style={styles.completedButtons}>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.success }]}
                  onPress={resetMandala}
                >
                  <Ionicons name="brush" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Nuevo diseño</Text>
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
        )}

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.error }]}
            onPress={resetMandala}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Borrar todo</Text>
          </TouchableOpacity>
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
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  patternsContainer: {
    marginTop: 8,
  },
  patternsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  patternButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  patternButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paletteContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  palette: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorButtonSelected: {
    borderColor: '#333',
    borderWidth: 4,
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  completedText: {
    fontSize: 16,
    marginBottom: 8,
  },
  completedSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  completedButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
});

export default MandalaGame;
