// src/screens/SplashScreen.js
// Pantalla de carga inicial

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GradientBackground } from '../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SplashScreen = () => {
  const { colors, isDark } = useTheme();

  return (
    <GradientBackground>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="mic" size={60} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>SerenVoice</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tu bienestar emocional
        </Text>
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.loader}
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;



