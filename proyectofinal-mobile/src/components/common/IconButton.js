// src/components/common/IconButton.js
// Botón de icono con estilos del diseño web

import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../../config/theme';

/**
 * IconButton - Botón con icono circular
 * @param {Object} props
 * @param {string} props.name - Nombre del icono (Ionicons)
 * @param {Function} props.onPress - Handler de tap
 * @param {'primary'|'secondary'|'surface'|'transparent'} props.variant
 * @param {'small'|'medium'|'large'} props.size
 * @param {boolean} props.loading
 * @param {boolean} props.disabled
 * @param {Object} props.style
 */
const IconButton = ({ 
  name, 
  onPress, 
  variant = 'surface',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.textMuted;
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'surface':
        return colors.surface;
      case 'transparent':
        return 'transparent';
      default:
        return colors.surface;
    }
  };

  const getIconColor = () => {
    if (disabled) return '#ffffff';
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#ffffff';
      case 'surface':
        return colors.primary;
      case 'transparent':
        return colors.text;
      default:
        return colors.primary;
    }
  };

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return { button: 36, icon: 18 };
      case 'large':
        return { button: 56, icon: 28 };
      default:
        return { button: 44, icon: 22 };
    }
  };

  const sizeValue = getSizeValue();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        shadows.sm,
        {
          backgroundColor: getBackgroundColor(),
          width: sizeValue.button,
          height: sizeValue.button,
          borderRadius: sizeValue.button / 2,
        },
        variant === 'transparent' && styles.noShadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={getIconColor()} 
          size="small" 
        />
      ) : (
        <Ionicons 
          name={name} 
          size={sizeValue.icon} 
          color={getIconColor()} 
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default IconButton;
