// src/screens/main/RecommendationsScreen.js
// Pantalla de recomendaciones personalizadas

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { recomendacionesService } from '../../services';

const RecommendationsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recomendacionesService.getRecomendaciones();
      if (response?.success && response?.data) {
        setRecommendations(response.data.recomendaciones || response.data || []);
      }
    } catch (error) {
      console.log('Error loading recommendations:', error);
      // Usar recomendaciones por defecto
      setRecommendations(defaultRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const defaultRecommendations = [
    {
      id: 1,
      tipo: 'ejercicio',
      titulo: 'Respiración profunda',
      descripcion: 'Practica 5 minutos de respiración profunda para reducir el estrés y calmar la mente.',
      icono: 'leaf-outline',
      color: '#4CAF50',
    },
    {
      id: 2,
      tipo: 'actividad',
      titulo: 'Camina al aire libre',
      descripcion: 'Un paseo de 15-20 minutos puede mejorar significativamente tu estado de ánimo.',
      icono: 'walk-outline',
      color: '#2196F3',
    },
    {
      id: 3,
      tipo: 'social',
      titulo: 'Conecta con alguien',
      descripcion: 'Llama a un amigo o familiar. Las conexiones sociales son importantes para el bienestar.',
      icono: 'people-outline',
      color: '#9C27B0',
    },
    {
      id: 4,
      tipo: 'mindfulness',
      titulo: 'Meditación guiada',
      descripcion: 'Dedica 10 minutos a una meditación guiada para centrar tu mente.',
      icono: 'flower-outline',
      color: '#FF9800',
    },
    {
      id: 5,
      tipo: 'creatividad',
      titulo: 'Expresa tu creatividad',
      descripcion: 'Dibuja, escribe o haz algo creativo. Expresarte ayuda a procesar emociones.',
      icono: 'brush-outline',
      color: '#E91E63',
    },
  ];

  const getCategoryIcon = (tipo) => {
    const icons = {
      ejercicio: 'fitness-outline',
      actividad: 'walk-outline',
      social: 'people-outline',
      mindfulness: 'leaf-outline',
      creatividad: 'brush-outline',
      descanso: 'bed-outline',
      nutricion: 'nutrition-outline',
    };
    return icons[tipo] || 'bulb-outline';
  };

  const getCategoryColor = (tipo) => {
    const colors = {
      ejercicio: '#4CAF50',
      actividad: '#2196F3',
      social: '#9C27B0',
      mindfulness: '#FF9800',
      creatividad: '#E91E63',
      descanso: '#00BCD4',
      nutricion: '#8BC34A',
    };
    return colors[tipo] || colors.primary;
  };

  const renderRecommendation = (item, index) => {
    const iconName = item.icono || getCategoryIcon(item.tipo);
    const color = item.color || getCategoryColor(item.tipo);

    return (
      <TouchableOpacity
        key={item.id || index}
        style={[styles.recommendationCard, { backgroundColor: colors.panel }]}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={iconName} size={28} color={color} />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.titulo || item.nombre}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: `${color}20` }]}>
              <Text style={[styles.categoryText, { color }]}>
                {item.tipo || 'General'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.descripcion || item.contenido}
          </Text>
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    backText: {
      marginLeft: 5,
      fontSize: 16,
      color: colors.primary,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    recommendationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    contentContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      flexWrap: 'wrap',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
      flex: 1,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    description: {
      fontSize: 13,
      lineHeight: 19,
    },
    tipCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: `${colors.primary}15`,
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
      marginBottom: 30,
    },
    tipIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    tipText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 19,
    },
  });

  const displayRecommendations = recommendations.length > 0 
    ? recommendations 
    : defaultRecommendations;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GradientBackground>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Recomendaciones</Text>
          <Text style={styles.headerSubtitle}>
            Sugerencias personalizadas basadas en tus análisis emocionales
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
            </View>
          ) : displayRecommendations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="bulb-outline" 
                size={60} 
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>Sin recomendaciones aún</Text>
              <Text style={styles.emptyText}>
                Realiza tu primer análisis de voz para recibir recomendaciones personalizadas
              </Text>
            </View>
          ) : (
            <>
              {displayRecommendations.map(renderRecommendation)}

              {/* Tip Card */}
              <View style={styles.tipCard}>
                <Ionicons 
                  name="information-circle" 
                  size={24} 
                  color={colors.primary}
                  style={styles.tipIcon}
                />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>💡 Consejo</Text>
                  <Text style={styles.tipText}>
                    Las recomendaciones se actualizan después de cada análisis de voz. 
                    Realiza análisis regularmente para obtener sugerencias más precisas.
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
};

export default RecommendationsScreen;




