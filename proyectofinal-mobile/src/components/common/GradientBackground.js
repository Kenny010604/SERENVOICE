// src/components/common/GradientBackground.js
// Componente de fondo con imagen consistente con el diseño

import React from 'react';
import { StyleSheet, ImageBackground, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Importar imágenes de fondo
const fondoClaro = require('../../../assets/FondoMovilClaro.png');
const fondoOscuro = require('../../../assets/FondoMovilOscuro.png');

/**
 * GradientBackground - Fondo con imagen que coincide con el diseño web
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido
 * @param {Object} props.style - Estilos adicionales
 */
const GradientBackground = ({ children, style }) => {
  const { isDark } = useTheme();

  return (
    <ImageBackground
      source={isDark ? fondoOscuro : fondoClaro}
      style={[styles.background, style]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default GradientBackground;
