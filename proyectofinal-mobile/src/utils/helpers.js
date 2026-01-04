// src/utils/helpers.js
// Funciones de ayuda generales

// Formatear fecha
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return date.toLocaleDateString('es-ES', defaultOptions);
};

// Formatear fecha relativa (hace X minutos/horas/días)
export const formatRelativeDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return formatDate(dateString);
};

// Formatear duración en segundos a mm:ss
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Obtener iniciales de un nombre
export const getInitials = (name, lastName = '') => {
  const first = name ? name.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};

// Capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Calcular edad desde fecha de nacimiento
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Obtener color para emoción
export const getEmotionColor = (emotion, isDark = false) => {
  const lightColors = {
    felicidad: '#4CAF50',
    tristeza: '#2196F3',
    enojo: '#f44336',
    neutral: '#9e9e9e',
    estres: '#ff9800',
    ansiedad: '#9c27b0',
  };

  const darkColors = {
    felicidad: '#66bb6a',
    tristeza: '#42a5f5',
    enojo: '#ef5350',
    neutral: '#bdbdbd',
    estres: '#ffa726',
    ansiedad: '#ab47bc',
  };

  const colors = isDark ? darkColors : lightColors;
  return colors[emotion?.toLowerCase()] || colors.neutral;
};

// Obtener emoji para emoción
export const getEmotionEmoji = (emotion) => {
  const emojis = {
    felicidad: '😊',
    tristeza: '😢',
    enojo: '😠',
    neutral: '😐',
    estres: '😰',
    ansiedad: '😟',
    sorpresa: '😲',
    miedo: '😨',
  };
  
  return emojis[emotion?.toLowerCase()] || '😐';
};

export default {
  formatDate,
  formatRelativeDate,
  formatDuration,
  getInitials,
  capitalize,
  truncateText,
  calculateAge,
  getEmotionColor,
  getEmotionEmoji,
};
