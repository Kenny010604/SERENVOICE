// src/config/theme.js
// Tema y colores de la aplicación - Sincronizado con global.css web

export const colors = {
  light: {
    // Colores principales (de global.css :root)
    primary: '#5ad0d2',
    primaryHover: '#1e88e5',
    secondary: '#6c63ff',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#ff3333',
    info: '#2196f3',
    
    // Fondos (gradiente azul claro del web)
    background: '#c2e9fb',
    backgroundGradientStart: '#a1c4fd',
    backgroundGradientEnd: '#c2e9fb',
    
    // Superficies y paneles
    surface: 'rgba(255, 255, 255, 0.85)',
    surfaceSolid: '#ffffff',
    surfaceElevated: '#ffffff',
    panel: 'rgba(255, 255, 255, 0.7)',
    
    // Textos
    text: '#0c3c78',
    textSecondary: '#2e2e2e',
    textMuted: '#666666',
    
    // Bordes y sombras
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Hover
    navItemHover: 'rgba(90, 208, 210, 0.15)',
    
    // Emociones
    felicidad: '#4CAF50',
    tristeza: '#2196F3',
    enojo: '#f44336',
    neutral: '#9e9e9e',
    estres: '#ff9800',
    ansiedad: '#9c27b0',
  },
  dark: {
    // Colores principales (de global.css .dark-mode)
    primary: '#5ad0d2',
    primaryHover: '#8be8ea',
    secondary: '#6c63ff',
    success: '#4caf50',
    warning: '#ffa726',
    error: '#ff6b6b',
    info: '#42a5f5',
    
    // Fondos (gradiente oscuro del web)
    background: '#203a43',
    backgroundGradientStart: '#20556b',
    backgroundGradientEnd: '#203a43',
    
    // Superficies y paneles
    surface: 'rgba(30, 30, 30, 0.85)',
    surfaceSolid: '#0f1720',
    surfaceElevated: '#1a2530',
    panel: 'rgba(30, 30, 30, 0.8)',
    
    // Textos
    text: '#e0f7fa',
    textSecondary: '#d1d1d1',
    textMuted: '#808080',
    
    // Bordes y sombras
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    
    // Hover
    navItemHover: 'rgba(90, 208, 210, 0.2)',
    
    // Emociones
    felicidad: '#66bb6a',
    tristeza: '#42a5f5',
    enojo: '#ef5350',
    neutral: '#bdbdbd',
    estres: '#ffa726',
    ansiedad: '#ab47bc',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
