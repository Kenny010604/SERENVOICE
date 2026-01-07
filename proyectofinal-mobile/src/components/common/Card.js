// src/components/common/Card.js
// Componente Card con estilos del diseño web

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, shadows, spacing } from '../../config/theme';

/**
 * Card - Tarjeta con estilos consistentes con el web (panel con transparencia)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido
 * @param {Object} props.style - Estilos adicionales
 * @param {Function} props.onPress - Handler de tap (opcional)
 * @param {boolean} props.elevated - Si tiene sombra elevada
 * @param {boolean} props.solid - Si tiene fondo sólido (sin transparencia)
 */
const Card = ({ 
  children, 
  style, 
  onPress, 
  elevated = false,
  solid = false 
}) => {
  const { colors } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: solid ? colors.surfaceSolid : colors.panel,
      borderColor: colors.border,
    },
    elevated && shadows.md,
    style,
  ];

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default Card;
