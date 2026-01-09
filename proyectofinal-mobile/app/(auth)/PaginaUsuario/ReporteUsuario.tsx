import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import reportesApi, { ReporteCompleto, EmotionData } from "../../../api/reportes";

const { width } = Dimensions.get("window");

// Colores para emociones
const emotionColors: Record<string, string> = {
  // Nombres cortos
  feliz: "#4CAF50",
  triste: "#2196F3",
  enojado: "#F44336",
  asustado: "#9C27B0",
  sorprendido: "#FF9800",
  neutral: "#607D8B",
  ansiedad: "#E91E63",
  estres: "#FF5722",
  // Nombres completos del backend
  felicidad: "#4CAF50",
  tristeza: "#2196F3",
  enojo: "#F44336",
  miedo: "#9C27B0",
  sorpresa: "#FF9800",
  asco: "#795548",
  disgusto: "#795548",
};

// Iconos para emociones
const emotionIcons: Record<string, string> = {
  feliz: "happy",
  triste: "sad",
  enojado: "flame",
  asustado: "skull",
  sorprendido: "flash",
  neutral: "remove-circle",
  ansiedad: "pulse",
  estres: "thunderstorm",
  // Nombres completos del backend
  felicidad: "happy",
  tristeza: "sad",
  enojo: "flame",
  miedo: "skull",
  sorpresa: "flash",
  asco: "close-circle",
  disgusto: "close-circle",
};

// Emojis para emociones
const emotionEmojis: Record<string, string> = {
  // Nombres cortos
  feliz: "😊",
  triste: "😢",
  enojado: "😠",
  asustado: "😨",
  sorprendido: "😲",
  neutral: "😐",
  ansiedad: "😰",
  estres: "😫",
  // Nombres completos del backend
  felicidad: "😊",
  tristeza: "😢",
  enojo: "😠",
  miedo: "😨",
  sorpresa: "😲",
  asco: "🤢",
  disgusto: "🤢",
};

// Colores para clasificaciones
const classificationColors: Record<string, string> = {
  normal: "#4CAF50",
  leve: "#8BC34A",
  moderado: "#FFC107",
  alto: "#FF9800",
  muy_alto: "#F44336",
};

// Nombres de días
const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function ReporteUsuario() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reporte, setReporte] = useState<ReporteCompleto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("resumen");

  const cargarReporte = useCallback(async () => {
    try {
      setError(null);
      const data = await reportesApi.obtenerReporteCompleto();
      setReporte(data);
    } catch (err: any) {
      console.error("Error cargando reporte:", err);
      setError(err.message || "Error al cargar el reporte");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarReporte();
  }, [cargarReporte]);

  // Componente para tarjeta de estadística
  const StatCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    color = "#4dd4ac" 
  }: { 
    icon: string; 
    title: string; 
    value: string | number; 
    subtitle?: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  // Componente para barra de progreso
  const ProgressBar = ({ 
    value, 
    maxValue = 100, 
    color = "#4dd4ac",
    label,
    showPercentage = true 
  }: { 
    value: number; 
    maxValue?: number; 
    color?: string;
    label?: string;
    showPercentage?: boolean;
  }) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
      <View style={styles.progressContainer}>
        {label && <Text style={styles.progressLabel}>{label}</Text>}
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        {showPercentage && (
          <Text style={styles.progressValue}>{value.toFixed(1)}%</Text>
        )}
      </View>
    );
  };

  // Componente para gráfico de barras simple
  const SimpleBarChart = ({ 
    data, 
    labelKey, 
    valueKey,
    colorKey,
    title 
  }: { 
    data: any[]; 
    labelKey: string; 
    valueKey: string;
    colorKey?: string;
    title: string;
  }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.noDataText}>Sin datos disponibles</Text>
        </View>
      );
    }

    const maxValue = Math.max(...data.map(d => d[valueKey] || 0), 1);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.barChartContainer}>
          {data.slice(0, 7).map((item, index) => {
            const value = item[valueKey] || 0;
            const height = (value / maxValue) * 100;
            const color = colorKey 
              ? (emotionColors[item[labelKey]] || classificationColors[item[labelKey]] || "#4dd4ac")
              : "#4dd4ac";
            
            return (
              <View key={index} style={styles.barItem}>
                <Text style={styles.barValue}>{value}</Text>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { height: `${Math.max(height, 5)}%`, backgroundColor: color }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item[labelKey]?.substring(0, 6) || "-"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Componente para gráfico de línea simple
  const SimpleLineChart = ({ 
    data, 
    title,
    line1Key = "estres",
    line2Key = "ansiedad",
    line1Label = "Estrés",
    line2Label = "Ansiedad"
  }: { 
    data: any[];
    title: string;
    line1Key?: string;
    line2Key?: string;
    line1Label?: string;
    line2Label?: string;
  }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.noDataText}>Sin datos disponibles</Text>
        </View>
      );
    }

    const maxValue = Math.max(
      ...data.map(d => Math.max(d[line1Key] || 0, d[line2Key] || 0)),
      1
    );

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.lineChartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
            <Text style={styles.legendText}>{line1Label}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#4ECDC4" }]} />
            <Text style={styles.legendText}>{line2Label}</Text>
          </View>
        </View>
        <View style={styles.lineChartContainer}>
          {data.slice(-10).map((item, index) => {
            const value1 = item[line1Key] || 0;
            const value2 = item[line2Key] || 0;
            const height1 = (value1 / maxValue) * 100;
            const height2 = (value2 / maxValue) * 100;
            
            return (
              <View key={index} style={styles.lineChartItem}>
                <View style={styles.lineChartBars}>
                  <View 
                    style={[
                      styles.lineChartBar, 
                      { height: `${Math.max(height1, 3)}%`, backgroundColor: "#FF6B6B" }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.lineChartBar, 
                      { height: `${Math.max(height2, 3)}%`, backgroundColor: "#4ECDC4" }
                    ]} 
                  />
                </View>
                <Text style={styles.lineChartLabel}>
                  {item.fecha?.substring(5) || item.mes?.substring(5) || index + 1}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Componente para gráfico circular simple (pie chart)
  const SimplePieChart = ({ 
    data, 
    title 
  }: { 
    data: EmotionData[];
    title: string;
  }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.noDataText}>Sin datos disponibles</Text>
        </View>
      );
    }

    const total = data.reduce((sum, item) => sum + item.cantidad, 0);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.pieChartContainer}>
          {data.slice(0, 6).map((item, index) => {
            const percentage = ((item.cantidad / total) * 100).toFixed(1);
            const color = emotionColors[item.emocion_principal] || "#607D8B";
            
            return (
              <View key={index} style={styles.pieItem}>
                <View style={[styles.pieColor, { backgroundColor: color }]} />
                <View style={styles.pieInfo}>
                  <Text style={styles.pieLabel}>{item.emocion_principal}</Text>
                  <Text style={styles.pieValue}>{item.cantidad} ({percentage}%)</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Sección de navegación
  const SectionButton = ({ 
    id, 
    icon, 
    label 
  }: { 
    id: string; 
    icon: string; 
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        activeSection === id && styles.sectionButtonActive,
      ]}
      onPress={() => setActiveSection(id)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeSection === id ? "#fff" : "#b8c5d0"} 
      />
      <Text style={[
        styles.sectionButtonText,
        activeSection === id && styles.sectionButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#1a2a3a", "#0d1b2a"]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#4dd4ac" />
          <Text style={styles.loadingText}>Cargando tu reporte...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#1a2a3a", "#0d1b2a"]} style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarReporte}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#1a2a3a", "#0d1b2a"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Reportes</Text>
          <TouchableOpacity onPress={cargarReporte} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={24} color="#4dd4ac" />
          </TouchableOpacity>
        </View>

        {/* Navegación de secciones */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sectionsNav}
          contentContainerStyle={styles.sectionsNavContent}
        >
          <SectionButton id="resumen" icon="stats-chart" label="Resumen" />
          <SectionButton id="emociones" icon="happy" label="Emociones" />
          <SectionButton id="tendencias" icon="trending-up" label="Tendencias" />
          <SectionButton id="actividad" icon="time" label="Actividad" />
          <SectionButton id="historial" icon="list" label="Historial" />
        </ScrollView>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* SECCIÓN RESUMEN */}
          {activeSection === "resumen" && reporte && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Resumen General</Text>
              
              {/* Tarjetas de estadísticas principales */}
              <View style={styles.statsGrid}>
                <StatCard
                  icon="analytics"
                  title="Análisis"
                  value={reporte.resumen.total_analisis}
                  subtitle="Total realizados"
                  color="#4dd4ac"
                />
                <StatCard
                  icon="flame"
                  title="Estrés Prom."
                  value={`${reporte.resumen.promedio_estres.toFixed(1)}%`}
                  color="#FF6B6B"
                />
                <StatCard
                  icon="pulse"
                  title="Ansiedad Prom."
                  value={`${reporte.resumen.promedio_ansiedad.toFixed(1)}%`}
                  color="#4ECDC4"
                />
                <StatCard
                  icon="game-controller"
                  title="Juegos"
                  value={reporte.juegos.total}
                  subtitle={`${reporte.juegos.completados} completados`}
                  color="#FFD93D"
                />
              </View>

              {/* Más estadísticas */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Ionicons name="people" size={28} color="#9C27B0" />
                  <Text style={styles.statBoxValue}>{reporte.grupos}</Text>
                  <Text style={styles.statBoxLabel}>Grupos</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="bulb" size={28} color="#FF9800" />
                  <Text style={styles.statBoxValue}>{reporte.recomendaciones.total}</Text>
                  <Text style={styles.statBoxLabel}>Recomendaciones</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="warning" size={28} color="#F44336" />
                  <Text style={styles.statBoxValue}>{reporte.alertas.total}</Text>
                  <Text style={styles.statBoxLabel}>Alertas</Text>
                </View>
              </View>

              {/* Barras de niveles */}
              <View style={styles.levelBars}>
                <Text style={styles.levelBarsTitle}>Niveles Máximos Registrados</Text>
                <ProgressBar 
                  value={reporte.resumen.max_estres} 
                  color="#FF6B6B" 
                  label="Estrés máximo" 
                />
                <ProgressBar 
                  value={reporte.resumen.max_ansiedad} 
                  color="#4ECDC4" 
                  label="Ansiedad máxima" 
                />
              </View>

              {/* Tasa de aplicación de recomendaciones */}
              {reporte.recomendaciones.total > 0 && (
                <View style={styles.rateCard}>
                  <Text style={styles.rateTitle}>Efectividad</Text>
                  <Text style={styles.rateValue}>
                    {((reporte.recomendaciones.aplicadas / reporte.recomendaciones.total) * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.rateSubtitle}>
                    de recomendaciones aplicadas
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* SECCIÓN EMOCIONES */}
          {activeSection === "emociones" && reporte && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>😊 Análisis de Emociones</Text>
              
              {reporte.emociones && reporte.emociones.length > 0 ? (
                <>
                  {/* Resumen de datos */}
                  <View style={styles.emotionStatsRow}>
                    <View style={styles.emotionStatCard}>
                      <Ionicons name="analytics" size={28} color="#4dd4ac" />
                      <Text style={styles.emotionStatValue}>
                        {reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0)}
                      </Text>
                      <Text style={styles.emotionStatLabel}>Total Detecciones</Text>
                    </View>
                    <View style={styles.emotionStatCard}>
                      <Ionicons name="layers" size={28} color="#ffd700" />
                      <Text style={styles.emotionStatValue}>{reporte.emociones.length}</Text>
                      <Text style={styles.emotionStatLabel}>Emociones Únicas</Text>
                    </View>
                    <View style={styles.emotionStatCard}>
                      <Ionicons name="trophy" size={28} color="#ff6b6b" />
                      <Text style={styles.emotionStatValue}>
                        {reporte.emociones[0]?.emocion_principal?.substring(0, 6) || '-'}
                      </Text>
                      <Text style={styles.emotionStatLabel}>Predominante</Text>
                    </View>
                  </View>

                  {/* GRÁFICO DE BARRAS HORIZONTAL */}
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>📊 Gráfico de Barras - Frecuencia</Text>
                    <View style={styles.horizontalBarChart}>
                      {reporte.emociones.map((emotion, index) => {
                        const total = reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0);
                        const percentage = total > 0 ? ((emotion.cantidad / total) * 100) : 0;
                        const maxCantidad = Math.max(...reporte.emociones.map(e => e.cantidad));
                        const barWidth = (emotion.cantidad / maxCantidad) * 100;
                        const emocionKey = emotion.emocion_principal?.toLowerCase() || 'neutral';
                        const color = emotionColors[emocionKey] || "#607D8B";
                        const emoji = emotionEmojis[emocionKey] || "😐";
                        
                        return (
                          <View key={index} style={styles.horizontalBarItem}>
                            <View style={styles.horizontalBarLabel}>
                              <Text style={styles.horizontalBarEmoji}>{emoji}</Text>
                              <Text style={styles.horizontalBarName}>
                                {emotion.emocion_principal?.charAt(0).toUpperCase() + 
                                 emotion.emocion_principal?.slice(1) || 'Desconocida'}
                              </Text>
                            </View>
                            <View style={styles.horizontalBarContainer}>
                              <LinearGradient
                                colors={[color, color + "80"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.horizontalBar, { width: `${barWidth}%` }]}
                              />
                              <Text style={styles.horizontalBarValue}>{emotion.cantidad}</Text>
                            </View>
                            <Text style={[styles.horizontalBarPercentage, { color }]}>
                              {percentage.toFixed(1)}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* GRÁFICO CIRCULAR / PIE CHART */}
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>🥧 Gráfico Circular - Distribución</Text>
                    <View style={styles.pieChartWrapper}>
                      {/* Círculo visual */}
                      <View style={styles.pieVisual}>
                        {(() => {
                          const total = reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0);
                          let cumulativePercentage = 0;
                          
                          return reporte.emociones.map((emotion, index) => {
                            const percentage = (emotion.cantidad / total) * 100;
                            const emocionKey = emotion.emocion_principal?.toLowerCase() || 'neutral';
                            const color = emotionColors[emocionKey] || "#607D8B";
                            const rotation = (cumulativePercentage / 100) * 360;
                            cumulativePercentage += percentage;
                            
                            return (
                              <View
                                key={index}
                                style={[
                                  styles.pieSlice,
                                  {
                                    backgroundColor: color,
                                    transform: [{ rotate: `${rotation}deg` }],
                                    opacity: 0.9 - (index * 0.1),
                                  }
                                ]}
                              />
                            );
                          });
                        })()}
                        <View style={styles.pieCenter}>
                          <Text style={styles.pieCenterValue}>
                            {reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0)}
                          </Text>
                          <Text style={styles.pieCenterLabel}>Total</Text>
                        </View>
                      </View>
                      
                      {/* Leyenda */}
                      <View style={styles.pieLegend}>
                        {reporte.emociones.map((emotion, index) => {
                          const total = reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0);
                          const percentage = ((emotion.cantidad / total) * 100).toFixed(1);
                          const emocionKey = emotion.emocion_principal?.toLowerCase() || 'neutral';
                          const color = emotionColors[emocionKey] || "#607D8B";
                          const emoji = emotionEmojis[emocionKey] || "😐";
                          
                          return (
                            <View key={index} style={styles.pieLegendItem}>
                              <View style={[styles.pieLegendColor, { backgroundColor: color }]} />
                              <Text style={styles.pieLegendEmoji}>{emoji}</Text>
                              <Text style={styles.pieLegendName}>
                                {emotion.emocion_principal?.charAt(0).toUpperCase() + 
                                 emotion.emocion_principal?.slice(1) || '?'}
                              </Text>
                              <Text style={[styles.pieLegendValue, { color }]}>{percentage}%</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {/* GRÁFICO DE BARRAS VERTICAL */}
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>📈 Gráfico de Barras Vertical</Text>
                    <View style={styles.verticalBarChart}>
                      {reporte.emociones.map((emotion, index) => {
                        const maxCantidad = Math.max(...reporte.emociones.map(e => e.cantidad));
                        const barHeight = (emotion.cantidad / maxCantidad) * 100;
                        const emocionKey = emotion.emocion_principal?.toLowerCase() || 'neutral';
                        const color = emotionColors[emocionKey] || "#607D8B";
                        const emoji = emotionEmojis[emocionKey] || "😐";
                        
                        return (
                          <View key={index} style={styles.verticalBarItem}>
                            <Text style={styles.verticalBarValue}>{emotion.cantidad}</Text>
                            <LinearGradient
                              colors={[color, color + "60"]}
                              style={[styles.verticalBar, { height: `${Math.max(barHeight, 10)}%` }]}
                            >
                              <Text style={styles.verticalBarEmoji}>{emoji}</Text>
                            </LinearGradient>
                            <Text style={styles.verticalBarLabel} numberOfLines={1}>
                              {emotion.emocion_principal?.substring(0, 5) || '?'}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* TABLA DE DATOS DETALLADOS */}
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>📋 Tabla de Datos Detallados</Text>
                    <View style={styles.dataTable}>
                      {/* Header de tabla */}
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>#</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Emoción</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>Cantidad</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>%</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>📊</Text>
                      </View>
                      
                      {/* Filas de datos */}
                      {reporte.emociones.map((emotion, index) => {
                        const total = reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0);
                        const percentage = ((emotion.cantidad / total) * 100);
                        const emocionKey = emotion.emocion_principal?.toLowerCase() || 'neutral';
                        const color = emotionColors[emocionKey] || "#607D8B";
                        const emoji = emotionEmojis[emocionKey] || "😐";
                        
                        return (
                          <View 
                            key={index} 
                            style={[
                              styles.tableRow,
                              index % 2 === 0 && styles.tableRowEven
                            ]}
                          >
                            <Text style={[styles.tableCell, { flex: 0.5, color: "#6b7280" }]}>
                              {index + 1}
                            </Text>
                            <View style={[styles.tableCellEmotion, { flex: 1 }]}>
                              <Text style={styles.tableEmoji}>{emoji}</Text>
                              <Text style={[styles.tableCell, { color }]}>
                                {emotion.emocion_principal?.charAt(0).toUpperCase() + 
                                 emotion.emocion_principal?.slice(1) || 'Desc.'}
                              </Text>
                            </View>
                            <Text style={[styles.tableCell, { flex: 0.7, fontWeight: "bold" }]}>
                              {emotion.cantidad}
                            </Text>
                            <Text style={[styles.tableCell, { flex: 0.7, color }]}>
                              {percentage.toFixed(1)}%
                            </Text>
                            <View style={[styles.tableMiniBar, { flex: 0.5 }]}>
                              <View 
                                style={[
                                  styles.tableMiniBarFill, 
                                  { width: `${percentage}%`, backgroundColor: color }
                                ]} 
                              />
                            </View>
                          </View>
                        );
                      })}
                      
                      {/* Fila de totales */}
                      <View style={styles.tableFooter}>
                        <Text style={[styles.tableFooterCell, { flex: 0.5 }]}>Σ</Text>
                        <Text style={[styles.tableFooterCell, { flex: 1 }]}>TOTAL</Text>
                        <Text style={[styles.tableFooterCell, { flex: 0.7 }]}>
                          {reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0)}
                        </Text>
                        <Text style={[styles.tableFooterCell, { flex: 0.7 }]}>100%</Text>
                        <Text style={[styles.tableFooterCell, { flex: 0.5 }]}>✓</Text>
                      </View>
                    </View>
                  </View>

                  {/* Emoción predominante destacada */}
                  <View style={styles.predominantEmotionCard}>
                    <Text style={styles.predominantTitle}>🏆 Emoción Predominante</Text>
                    <View style={styles.predominantContent}>
                      <Text style={styles.predominantEmoji}>
                        {emotionEmojis[reporte.emociones[0].emocion_principal?.toLowerCase() || 'neutral'] || "😐"}
                      </Text>
                      <View style={styles.predominantInfo}>
                        <Text style={[
                          styles.predominantName,
                          { color: emotionColors[reporte.emociones[0].emocion_principal?.toLowerCase() || 'neutral'] || "#607D8B" }
                        ]}>
                          {reporte.emociones[0].emocion_principal ? 
                            reporte.emociones[0].emocion_principal.charAt(0).toUpperCase() + reporte.emociones[0].emocion_principal.slice(1) :
                            'Desconocida'}
                        </Text>
                        <Text style={styles.predominantStats}>
                          {reporte.emociones[0].cantidad} detecciones • {
                            ((reporte.emociones[0].cantidad / reporte.emociones.reduce((sum, e) => sum + e.cantidad, 0)) * 100).toFixed(1)
                          }% del total
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noEmotionsContainer}>
                  <Ionicons name="analytics-outline" size={64} color="#4a5568" />
                  <Text style={styles.noEmotionsText}>
                    Aún no hay emociones detectadas
                  </Text>
                  <Text style={styles.noEmotionsSubtext}>
                    Realiza análisis de voz para ver tu perfil emocional
                  </Text>
                </View>
              )}

              {/* Clasificaciones */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>📋 Clasificaciones de Análisis</Text>
                {Object.entries(reporte.clasificaciones).length > 0 ? (
                  <View style={styles.classificationsContainer}>
                    {Object.entries(reporte.clasificaciones).map(([key, value]) => (
                      <View key={key} style={styles.classificationItem}>
                        <View style={[
                          styles.classificationBadge,
                          { backgroundColor: classificationColors[key] || "#607D8B" }
                        ]}>
                          <Text style={styles.classificationText}>
                            {key.replace("_", " ")}
                          </Text>
                        </View>
                        <Text style={styles.classificationValue}>{value}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>Sin clasificaciones</Text>
                )}
              </View>
            </View>
          )}

          {/* SECCIÓN TENDENCIAS */}
          {activeSection === "tendencias" && reporte && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Tendencias</Text>
              
              <SimpleLineChart
                data={reporte.tendencia_diaria}
                title="Últimos 30 Días"
                line1Key="estres"
                line2Key="ansiedad"
              />

              <SimpleLineChart
                data={reporte.tendencia_mensual}
                title="Tendencia Mensual (6 meses)"
                line1Key="promedio_estres"
                line2Key="promedio_ansiedad"
              />
            </View>
          )}

          {/* SECCIÓN ACTIVIDAD */}
          {activeSection === "actividad" && reporte && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏰ Patrones de Actividad</Text>
              
              {/* Actividad por hora */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Análisis por Hora del Día</Text>
                {reporte.actividad_horaria.length > 0 ? (
                  <View style={styles.hourlyChart}>
                    {reporte.actividad_horaria.map((item, index) => {
                      const maxHora = Math.max(...reporte.actividad_horaria.map(h => h.cantidad), 1);
                      const height = (item.cantidad / maxHora) * 60;
                      return (
                        <View key={index} style={styles.hourlyItem}>
                          <View 
                            style={[
                              styles.hourlyBar, 
                              { height: Math.max(height, 4) }
                            ]} 
                          />
                          <Text style={styles.hourlyLabel}>{item.hora}h</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>Sin datos de actividad horaria</Text>
                )}
              </View>

              {/* Actividad por día de la semana */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Análisis por Día de la Semana</Text>
                {reporte.actividad_semanal.length > 0 ? (
                  <View style={styles.weeklyChart}>
                    {reporte.actividad_semanal.map((item, index) => {
                      const maxDia = Math.max(...reporte.actividad_semanal.map(d => d.cantidad), 1);
                      const widthPercent = (item.cantidad / maxDia) * 100;
                      return (
                        <View key={index} style={styles.weeklyItem}>
                          <Text style={styles.weeklyLabel}>
                            {diasSemana[item.dia - 1] || item.dia}
                          </Text>
                          <View style={styles.weeklyBarBg}>
                            <View 
                              style={[
                                styles.weeklyBar, 
                                { width: `${Math.max(widthPercent, 5)}%` }
                              ]} 
                            />
                          </View>
                          <Text style={styles.weeklyValue}>{item.cantidad}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>Sin datos de actividad semanal</Text>
                )}
              </View>

              {/* Estadísticas de juegos */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>🎮 Estadísticas de Juegos</Text>
                <View style={styles.gamesStats}>
                  <View style={styles.gameStat}>
                    <Ionicons name="game-controller" size={32} color="#FFD93D" />
                    <Text style={styles.gameStatValue}>{reporte.juegos.total}</Text>
                    <Text style={styles.gameStatLabel}>Sesiones</Text>
                  </View>
                  <View style={styles.gameStat}>
                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                    <Text style={styles.gameStatValue}>{reporte.juegos.completados}</Text>
                    <Text style={styles.gameStatLabel}>Completados</Text>
                  </View>
                  <View style={styles.gameStat}>
                    <Ionicons name="star" size={32} color="#FF9800" />
                    <Text style={styles.gameStatValue}>
                      {reporte.juegos.promedio_puntuacion.toFixed(0)}
                    </Text>
                    <Text style={styles.gameStatLabel}>Puntuación Prom.</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* SECCIÓN HISTORIAL */}
          {activeSection === "historial" && reporte && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Últimos Análisis</Text>
              
              {reporte.ultimos_analisis.length > 0 ? (
                reporte.ultimos_analisis.map((item, index) => (
                  <View key={index} style={styles.historialItem}>
                    <View style={styles.historialHeader}>
                      <View style={[
                        styles.emotionBadge,
                        { backgroundColor: emotionColors[item.emocion_principal] || "#607D8B" }
                      ]}>
                        <Text style={styles.emotionBadgeText}>
                          {item.emocion_principal || "Sin emoción"}
                        </Text>
                      </View>
                      <Text style={styles.historialDate}>
                        {new Date(item.fecha_analisis).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </Text>
                    </View>
                    <View style={styles.historialBody}>
                      <View style={styles.historialStat}>
                        <Text style={styles.historialStatLabel}>Estrés</Text>
                        <Text style={[
                          styles.historialStatValue,
                          { color: item.nivel_estres > 50 ? "#FF6B6B" : "#4CAF50" }
                        ]}>
                          {item.nivel_estres?.toFixed(1)}%
                        </Text>
                      </View>
                      <View style={styles.historialStat}>
                        <Text style={styles.historialStatLabel}>Ansiedad</Text>
                        <Text style={[
                          styles.historialStatValue,
                          { color: item.nivel_ansiedad > 50 ? "#4ECDC4" : "#4CAF50" }
                        ]}>
                          {item.nivel_ansiedad?.toFixed(1)}%
                        </Text>
                      </View>
                      <View style={styles.historialStat}>
                        <Text style={styles.historialStatLabel}>Clasificación</Text>
                        <View style={[
                          styles.classificationSmall,
                          { backgroundColor: classificationColors[item.clasificacion] || "#607D8B" }
                        ]}>
                          <Text style={styles.classificationSmallText}>
                            {item.clasificacion || "N/A"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={64} color="#4a5568" />
                  <Text style={styles.emptyText}>No hay análisis registrados</Text>
                  <Text style={styles.emptySubtext}>
                    Realiza tu primer análisis de voz para ver tus estadísticas
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Espacio inferior */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1b2a",
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4dd4ac",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#0d1b2a",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#b8c5d0",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  refreshBtn: {
    padding: 8,
  },
  sectionsNav: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  sectionsNavContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  sectionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: 8,
  },
  sectionButtonActive: {
    backgroundColor: "#4dd4ac",
  },
  sectionButtonText: {
    color: "#b8c5d0",
    fontSize: 14,
    marginLeft: 6,
  },
  sectionButtonTextActive: {
    color: "#0d1b2a",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  statTitle: {
    color: "#b8c5d0",
    fontSize: 12,
    marginTop: 4,
  },
  statSubtitle: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statBox: {
    alignItems: "center",
  },
  statBoxValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  statBoxLabel: {
    color: "#b8c5d0",
    fontSize: 12,
    marginTop: 4,
  },
  levelBars: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  levelBarsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    color: "#b8c5d0",
    fontSize: 12,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressValue: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  rateCard: {
    backgroundColor: "rgba(77, 212, 172, 0.1)",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(77, 212, 172, 0.3)",
  },
  rateTitle: {
    color: "#4dd4ac",
    fontSize: 14,
  },
  rateValue: {
    color: "#4dd4ac",
    fontSize: 48,
    fontWeight: "bold",
  },
  rateSubtitle: {
    color: "#b8c5d0",
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  noDataText: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
  },
  barItem: {
    alignItems: "center",
    flex: 1,
  },
  barValue: {
    color: "#b8c5d0",
    fontSize: 10,
    marginBottom: 4,
  },
  barWrapper: {
    width: 24,
    height: 100,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    color: "#b8c5d0",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  lineChartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: "#b8c5d0",
    fontSize: 12,
  },
  lineChartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
  },
  lineChartItem: {
    alignItems: "center",
    flex: 1,
  },
  lineChartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    gap: 2,
  },
  lineChartBar: {
    width: 8,
    borderRadius: 2,
    minHeight: 2,
  },
  lineChartLabel: {
    color: "#6b7280",
    fontSize: 8,
    marginTop: 4,
  },
  pieChartContainer: {
    paddingVertical: 8,
  },
  pieItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  pieInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pieLabel: {
    color: "#fff",
    fontSize: 14,
    textTransform: "capitalize",
  },
  pieValue: {
    color: "#b8c5d0",
    fontSize: 14,
  },
  classificationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  classificationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  classificationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  classificationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  classificationValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  hourlyChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 100,
    paddingTop: 20,
  },
  hourlyItem: {
    alignItems: "center",
  },
  hourlyBar: {
    width: 12,
    backgroundColor: "#4dd4ac",
    borderRadius: 2,
  },
  hourlyLabel: {
    color: "#6b7280",
    fontSize: 8,
    marginTop: 4,
  },
  weeklyChart: {
    gap: 8,
  },
  weeklyItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  weeklyLabel: {
    color: "#b8c5d0",
    fontSize: 12,
    width: 40,
  },
  weeklyBarBg: {
    flex: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  weeklyBar: {
    height: "100%",
    backgroundColor: "#4dd4ac",
    borderRadius: 4,
  },
  weeklyValue: {
    color: "#fff",
    fontSize: 12,
    width: 30,
    textAlign: "right",
  },
  gamesStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  gameStat: {
    alignItems: "center",
  },
  gameStatValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  gameStatLabel: {
    color: "#b8c5d0",
    fontSize: 12,
    marginTop: 4,
  },
  historialItem: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  emotionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emotionBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  historialDate: {
    color: "#6b7280",
    fontSize: 12,
  },
  historialBody: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historialStat: {
    alignItems: "center",
  },
  historialStatLabel: {
    color: "#6b7280",
    fontSize: 10,
    marginBottom: 4,
  },
  historialStatValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  classificationSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  classificationSmallText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  // Nuevos estilos para emociones mejoradas
  emotionsMainContainer: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  emotionsSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  emotionsTotalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(77, 212, 172, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(77, 212, 172, 0.2)",
  },
  emotionsTotalInfo: {
    marginLeft: 16,
  },
  emotionsTotalValue: {
    color: "#4dd4ac",
    fontSize: 32,
    fontWeight: "bold",
  },
  emotionsTotalLabel: {
    color: "#b8c5d0",
    fontSize: 14,
  },
  emotionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  emotionCard: {
    width: (width - 80) / 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  emotionCardGradient: {
    padding: 16,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emotionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emotionName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  emotionCount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  emotionCountLabel: {
    color: "#b8c5d0",
    fontSize: 12,
    marginBottom: 12,
  },
  emotionProgressBg: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  emotionProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  emotionPercentage: {
    fontSize: 14,
    fontWeight: "600",
  },
  predominantEmotionCard: {
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  predominantTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  predominantContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  predominantEmoji: {
    fontSize: 56,
    marginRight: 20,
  },
  predominantInfo: {
    flex: 1,
  },
  predominantName: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  predominantStats: {
    color: "#b8c5d0",
    fontSize: 14,
  },
  noEmotionsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noEmotionsText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  noEmotionsSubtext: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  // ============ ESTILOS PARA GRÁFICAS DE EMOCIONES ============
  emotionStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  emotionStatCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emotionStatValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  emotionStatLabel: {
    color: "#b8c5d0",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  // Gráfico de barras horizontal
  horizontalBarChart: {
    paddingVertical: 10,
  },
  horizontalBarItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  horizontalBarLabel: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalBarEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  horizontalBarName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  horizontalBarContainer: {
    flex: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    overflow: "hidden",
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalBar: {
    height: "100%",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 8,
    minWidth: 30,
  },
  horizontalBarValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    position: "absolute",
    right: 10,
  },
  horizontalBarPercentage: {
    width: 50,
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
  },
  // Gráfico circular / Pie Chart
  pieChartWrapper: {
    flexDirection: "column",
    alignItems: "center",
  },
  pieVisual: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    marginBottom: 20,
  },
  pieSlice: {
    position: "absolute",
    width: "50%",
    height: "50%",
    top: 0,
    right: 0,
    transformOrigin: "bottom left",
  },
  pieCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1a2a3a",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  pieCenterValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  pieCenterLabel: {
    color: "#b8c5d0",
    fontSize: 12,
  },
  pieLegend: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 12,
  },
  pieLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  pieLegendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  pieLegendEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  pieLegendName: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    textTransform: "capitalize",
  },
  pieLegendValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // Gráfico de barras vertical
  verticalBarChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 200,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
  },
  verticalBarItem: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    maxWidth: 60,
  },
  verticalBarValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  verticalBar: {
    width: 35,
    borderRadius: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
    minHeight: 20,
  },
  verticalBarEmoji: {
    fontSize: 16,
  },
  verticalBarLabel: {
    color: "#b8c5d0",
    fontSize: 10,
    marginTop: 8,
    textTransform: "capitalize",
  },
  // Tabla de datos
  dataTable: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(77, 212, 172, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    color: "#4dd4ac",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  tableCell: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  tableCellEmotion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  tableEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  tableMiniBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableMiniBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "rgba(255,215,0,0.1)",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderTopColor: "rgba(255,215,0,0.3)",
  },
  tableFooterCell: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
});
