import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/config";
import ApiEndpoints from "../../../constants/ApiEndpoints";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface Recomendacion {
  id_recomendacion: number;
  tipo_recomendacion: string;
  contenido: string;
  aplica: number | boolean;
  aplicada?: boolean;
  fecha_generacion?: string;
  fecha_creacion?: string;
  prioridad?: string;
  emocion_dominante?: string;
  clasificacion?: string;
  util?: number | null;
}

const Recomendaciones: React.FC = () => {
  const [recs, setRecs] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'aplicadas'>('todas');
  const { user } = useAuth();
  const router = useRouter();

  // Cargar automáticamente cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id_usuario) {
      cargarRecomendaciones();
    }
  }, [user?.id_usuario]);

  const cargarRecomendaciones = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("❌ No hay token disponible");
        setLoading(false);
        return;
      }

      console.log("📡 Llamando a:", ApiEndpoints.RECOMMENDATIONS.LIST);
      
      const response = await api.get(
        ApiEndpoints.RECOMMENDATIONS.LIST,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📦 Respuesta:", response.data);

      if (response.data?.success) {
        const recomendacionesData = response.data.data?.recomendaciones || [];
        console.log("✅ Recomendaciones cargadas:", recomendacionesData.length);
        setRecs(recomendacionesData);
      } else {
        console.log("⚠️ Respuesta sin success:", response.data);
      }
    } catch (error: any) {
      console.error("❌ Error cargar recomendaciones:", error?.message || error);
      console.error("❌ Error detalle:", error?.response?.data || error);
      if (!isRefresh) {
        Alert.alert("Error", "No se pudieron cargar las recomendaciones");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    cargarRecomendaciones(true);
  }, []);

  const markApplied = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Optimistic update
      setRecs((prev) =>
        prev.map((r) =>
          r.id_recomendacion === id ? { ...r, aplica: 1, aplicada: true } : r
        )
      );

      await api.put(
        ApiEndpoints.RECOMMENDATIONS.APPLY.replace(":id", id.toString()),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("❌ Error marcar recomendación:", error);
      cargarRecomendaciones();
    }
  };

  const markUtil = async (id: number, util: boolean) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      setRecs((prev) =>
        prev.map((r) =>
          r.id_recomendacion === id ? { ...r, util: util ? 1 : 0 } : r
        )
      );

      // Endpoint para marcar útil
      await api.put(
        `/api/recomendaciones/${id}/util`,
        { util },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("❌ Error marcar útil:", error);
    }
  };

  const getTipoConfig = (tipo: string) => {
    const t = (tipo || '').toLowerCase();
    const configs: { [key: string]: { icon: keyof typeof Ionicons.glyphMap; colors: [string, string]; label: string } } = {
      'respiracion': { icon: 'pulse', colors: ['#5ad0d2', '#8be8ea'], label: 'Respiración' },
      'pausa_activa': { icon: 'pause-circle', colors: ['#fbbf24', '#fcd34d'], label: 'Pausa Activa' },
      'meditacion': { icon: 'flower', colors: ['#a78bfa', '#c4b5fd'], label: 'Meditación' },
      'ejercicio': { icon: 'fitness', colors: ['#34d399', '#6ee7b7'], label: 'Ejercicio' },
      'profesional': { icon: 'medical', colors: ['#f472b6', '#f9a8d4'], label: 'Profesional' },
      'habito': { icon: 'cafe', colors: ['#fb923c', '#fdba74'], label: 'Hábito' },
    };
    return configs[t] || { icon: 'leaf', colors: ['#5ad0d2', '#8be8ea'], label: tipo || 'General' };
  };

  const getPrioridadConfig = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', label: '🔥 Alta' };
      case 'media': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)', label: '⭐ Media' };
      case 'baja': return { color: '#5ad0d2', bg: 'rgba(90, 208, 210, 0.2)', label: '🌱 Baja' };
      default: return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.2)', label: 'Normal' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const isAplicada = (r: Recomendacion) => r.aplica === 1 || r.aplica === true || r.aplicada === true;

  // Filtrar recomendaciones
  const filteredRecs = recs.filter(r => {
    if (filter === 'pendientes') return !isAplicada(r);
    if (filter === 'aplicadas') return isAplicada(r);
    return true;
  });

  // Estadísticas
  const stats = {
    total: recs.length,
    aplicadas: recs.filter(r => isAplicada(r)).length,
    pendientes: recs.filter(r => !isAplicada(r)).length,
    utiles: recs.filter(r => r.util === 1).length
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#5ad0d2', '#8be8ea']}
          style={styles.loadingIcon}
        >
          <Ionicons name="heart" size={40} color="#0f172a" />
        </LinearGradient>
        <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
        <ActivityIndicator size="large" color="#5ad0d2" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#5ad0d2']}
          tintColor="#5ad0d2"
        />
      }
    >
      {/* Header con gradiente */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#5ad0d2', '#8be8ea']}
          style={styles.headerIcon}
        >
          <Ionicons name="heart" size={28} color="#0f172a" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mis Recomendaciones</Text>
          <Text style={styles.subtitle}>
            Consejos personalizados para ti
          </Text>
        </View>
      </View>

      {/* Tarjetas de estadísticas */}
      {recs.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
        >
          <LinearGradient colors={['#1e3a5f', '#2d5a87']} style={styles.statCard}>
            <Ionicons name="bulb" size={24} color="#5ad0d2" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </LinearGradient>
          
          <LinearGradient colors={['#1e3a5f', '#2d5a87']} style={styles.statCard}>
            <Ionicons name="time" size={24} color="#fbbf24" />
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </LinearGradient>
          
          <LinearGradient colors={['#1e3a5f', '#2d5a87']} style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#5ad0d2" />
            <Text style={styles.statNumber}>{stats.aplicadas}</Text>
            <Text style={styles.statLabel}>Aplicadas</Text>
          </LinearGradient>
          
          <LinearGradient colors={['#1e3a5f', '#2d5a87']} style={styles.statCard}>
            <Ionicons name="star" size={24} color="#fbbf24" />
            <Text style={styles.statNumber}>{stats.utiles}</Text>
            <Text style={styles.statLabel}>Útiles</Text>
          </LinearGradient>
        </ScrollView>
      )}

      {/* Filtros */}
      {recs.length > 0 && (
        <View style={styles.filterContainer}>
          {(['todas', 'pendientes', 'aplicadas'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterText,
                filter === f && styles.filterTextActive
              ]}>
                {f === 'todas' ? '📋 Todas' : f === 'pendientes' ? '⏳ Pendientes' : '✅ Aplicadas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Estado vacío mejorado */}
      {recs.length === 0 && (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#5ad0d2', '#8be8ea']}
            style={styles.emptyIcon}
          >
            <Ionicons name="heart" size={48} color="#0f172a" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>¡Aún no tienes recomendaciones!</Text>
          <Text style={styles.emptyText}>
            Las recomendaciones se generan automáticamente cuando analizas tu voz.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/PaginaUsuario/analizar-voz' as any)}
          >
            <LinearGradient
              colors={['#5ad0d2', '#8be8ea']}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="mic" size={20} color="#0f172a" />
              <Text style={styles.emptyButtonText}>Analizar mi voz</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Sin resultados del filtro */}
      {recs.length > 0 && filteredRecs.length === 0 && (
        <View style={styles.noResults}>
          <Ionicons name="search" size={48} color="#CBD5E1" />
          <Text style={styles.noResultsText}>
            No hay recomendaciones {filter === 'pendientes' ? 'pendientes' : 'aplicadas'}
          </Text>
        </View>
      )}

      {/* Lista de recomendaciones */}
      {filteredRecs.map((r, index) => {
        const tipoConfig = getTipoConfig(r.tipo_recomendacion);
        const prioridadConfig = getPrioridadConfig(r.prioridad || '');
        const aplicada = isAplicada(r);
        const fecha = formatDate(r.fecha_generacion || r.fecha_creacion);

        return (
          <View 
            key={r.id_recomendacion} 
            style={[styles.card, aplicada && styles.cardApplied]}
          >
            {/* Barra de color superior */}
            <LinearGradient
              colors={tipoConfig.colors}
              style={styles.cardColorBar}
            />
            
            <View style={styles.cardContent}>
              {/* Header de la tarjeta */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <LinearGradient
                    colors={tipoConfig.colors}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name={tipoConfig.icon} size={20} color="#FFF" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.cardType}>{tipoConfig.label}</Text>
                    {r.emocion_dominante && (
                      <Text style={styles.cardEmotion}>
                        Emoción: {r.emocion_dominante}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.cardBadges}>
                  {aplicada && (
                    <View style={styles.appliedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                      <Text style={styles.appliedBadgeText}>Aplicada</Text>
                    </View>
                  )}
                  {r.prioridad && (
                    <View style={[styles.priorityBadge, { backgroundColor: prioridadConfig.bg }]}>
                      <Text style={[styles.priorityText, { color: prioridadConfig.color }]}>
                        {prioridadConfig.label}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Contenido */}
              <View style={styles.cardBody}>
                <Text style={styles.cardText}>{r.contenido}</Text>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                {fecha ? (
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.dateText}>{fecha}</Text>
                  </View>
                ) : <View />}

                {!aplicada ? (
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => markApplied(r.id_recomendacion)}
                  >
                    <LinearGradient
                      colors={['#5ad0d2', '#8be8ea']}
                      style={styles.applyButtonGradient}
                    >
                      <Ionicons name="checkmark" size={16} color="#0f172a" />
                      <Text style={styles.applyButtonText}>Marcar aplicada</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.utilButtons}>
                    <TouchableOpacity
                      style={[
                        styles.utilButton,
                        r.util === 1 && styles.utilButtonActive
                      ]}
                      onPress={() => markUtil(r.id_recomendacion, true)}
                    >
                      <Ionicons 
                        name="thumbs-up" 
                        size={16} 
                        color={r.util === 1 ? '#0f172a' : '#5ad0d2'} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.utilButton,
                        r.util === 0 && r.util !== null && styles.utilButtonNegative
                      ]}
                      onPress={() => markUtil(r.id_recomendacion, false)}
                    >
                      <Ionicons 
                        name="thumbs-down" 
                        size={16} 
                        color={r.util === 0 && r.util !== null ? '#FFF' : '#ef4444'} 
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default Recomendaciones;


const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#0f172a",
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 2,
  },
  
  // Stats
  statsContainer: {
    marginBottom: 16,
  },
  statCard: {
    width: 100,
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  
  // Filters
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  filterButtonActive: {
    backgroundColor: '#5ad0d2',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterTextActive: {
    color: '#0f172a',
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // No results
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
  },
  
  // Cards
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(90, 208, 210, 0.2)',
  },
  cardApplied: {
    opacity: 0.85,
  },
  cardColorBar: {
    height: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardEmotion: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5ad0d2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  appliedBadgeText: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  
  cardBody: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#5ad0d2',
  },
  cardText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  applyButtonText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  
  utilButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  utilButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(90, 208, 210, 0.3)',
  },
  utilButtonActive: {
    backgroundColor: '#5ad0d2',
  },
  utilButtonNegative: {
    backgroundColor: '#ef4444',
  },
});
