// src/components/common/Button.js
// Componente Button con estilos del diseño web

import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  View 
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, typography } from '../../config/theme';

/**
 * Button - Botón con estilos consistentes con el web
 * @param {Object} props
 * @param {string} props.title - Texto del botón
 * @param {Function} props.onPress - Handler de tap
 * @param {'primary'|'secondary'|'outline'|'danger'|'success'|'ghost'} props.variant
 * @param {'small'|'medium'|'large'} props.size
 * @param {boolean} props.loading - Mostrar spinner
 * @param {boolean} props.disabled - Deshabilitado
 * @param {React.ReactNode} props.icon - Icono opcional
 * @param {boolean} props.fullWidth - Ancho completo
 * @param {Object} props.style - Estilos adicionales
 */
const Button = ({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.textMuted;
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'danger':
        return colors.error;
      case 'success':
        return colors.success;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#ffffff';
    
    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text;
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
        return '#ffffff';
      default:
        return '#ffffff';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return colors.primary;
    }
    return 'transparent';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingVertical: spacing.md + 4,
          paddingHorizontal: spacing.xl,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={getTextColor()} 
          size="small" 
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: sizeStyles.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    minHeight: 48,
  },
  outline: {
    borderWidth: 2,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;
