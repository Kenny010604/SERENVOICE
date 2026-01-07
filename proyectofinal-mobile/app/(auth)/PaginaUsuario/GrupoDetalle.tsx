import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Share,
  Clipboard,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import groupsApi from "../../../api/groups";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Miembro {
  id_miembro: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol_grupo: string;
  fecha_union: string;
}

interface Actividad {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  tipo_actividad: string;
  fecha_programada: string;
  duracion_estimada: number | null;
  estado?: string;
}

interface UsuarioBuscado {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  foto_perfil?: string;
}

interface GrupoDetail {
  id_grupo: number;
  nombre_grupo: string;
  nombre?: string;
  descripcion: string;
  tipo_grupo: string;
  privacidad: string;
  max_participantes: number;
  codigo_acceso: string;
  id_facilitador: number;
  fecha_creacion: string;
  total_miembros?: number;
}

// Labels para tipos de actividad
const activityTypeLabels: Record<string, string> = {
  tarea: "📝 Tarea",
  sesion: "🎯 Sesión",
  ejercicio: "💪 Ejercicio",
  meditacion: "🧘 Meditación",
  respiracion: "🌬️ Respiración",
  reflexion: "💭 Reflexión",
  reto: "🏆 Reto",
  otro: "📌 Otro",
};

export default function GrupoDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [grupo, setGrupo] = useState<GrupoDetail | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'miembros' | 'actividades'>('info');
  
  // Modal agregar miembro
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [usuariosBuscados, setUsuariosBuscados] = useState<UsuarioBuscado[]>([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioBuscado | null>(null);
  
  // Modal crear actividad
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [creatingActivity, setCreatingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    titulo: "",
    descripcion: "",
    tipo_actividad: "tarea",
    fecha_programada: "",
    duracion_estimada: "",
  });
  
  // DateTimePicker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const groupId = typeof id === "string" ? parseInt(id) : Array.isArray(id) ? parseInt(id[0]) : 0;
  const esFacilitador = grupo?.id_facilitador === user?.id_usuario;

  const cargarDatos = useCallback(async () => {
    if (!groupId) return;
    
    try {
      console.log("📡 Cargando grupo:", groupId);
      
      const [grupoData, miembrosData, actividadesData] = await Promise.all([
        groupsApi.obtener(groupId),
        groupsApi.listarMiembros(groupId),
        groupsApi.listarActividades(groupId).catch(() => []),
      ]);
      
      console.log("📦 Grupo:", grupoData);
      console.log("👥 Miembros:", miembrosData?.length || 0);
      console.log("📋 Actividades:", actividadesData?.length || 0);
      
      setGrupo(grupoData);
      setMiembros(Array.isArray(miembrosData) ? miembrosData : []);
      setActividades(Array.isArray(actividadesData) ? actividadesData : []);
    } catch (error: any) {
      console.error("❌ Error cargando grupo:", error);
      Alert.alert("Error", "No se pudo cargar el grupo");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Búsqueda de usuarios con debounce
  useEffect(() => {
    const buscarUsuarios = async () => {
      if (searchEmail.trim().length < 2) {
        setUsuariosBuscados([]);
        return;
      }
      
      setBuscandoUsuarios(true);
      try {
        const response = await groupsApi.buscarUsuarios(searchEmail.trim());
        if (response?.data) {
          // Filtrar usuarios que ya son miembros
          const miembrosIds = miembros.map(m => m.id_usuario);
          const usuariosFiltrados = response.data.filter(
            (u: UsuarioBuscado) => !miembrosIds.includes(u.id)
          );
          setUsuariosBuscados(usuariosFiltrados);
        } else {
          setUsuariosBuscados([]);
        }
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        setUsuariosBuscados([]);
      } finally {
        setBuscandoUsuarios(false);
      }
    };

    const timeoutId = setTimeout(buscarUsuarios, 300);
    return () => clearTimeout(timeoutId);
  }, [searchEmail, miembros]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarDatos();
  }, [cargarDatos]);

  // Copiar código
  const handleCopyCode = async () => {
    if (grupo?.codigo_acceso) {
      await Clipboard.setString(grupo.codigo_acceso);
      Alert.alert("¡Copiado!", "Código de acceso copiado al portapapeles");
    }
  };

  // Compartir grupo
  const handleShare = async () => {
    if (!grupo) return;
    
    try {
      await Share.share({
        message: `¡Únete a mi grupo "${grupo.nombre_grupo || grupo.nombre}" en SerenVoice!\n\nCódigo de acceso: ${grupo.codigo_acceso}`,
        title: "Invitar al grupo",
      });
    } catch (error) {
      console.error("Error compartiendo:", error);
    }
  };

  // Agregar miembro por correo o usuario seleccionado
  const handleAddMember = async () => {
    // Si hay usuario seleccionado, usar su ID
    if (usuarioSeleccionado) {
      setAddingMember(true);
      try {
        const result = await groupsApi.agregarMiembro(groupId, {
          usuario_id: usuarioSeleccionado.id,
          rol_grupo: "participante",
        });
        
        Alert.alert("¡Éxito!", result.message || "Miembro agregado");
        setShowAddModal(false);
        setSearchEmail("");
        setUsuarioSeleccionado(null);
        setUsuariosBuscados([]);
        cargarDatos();
      } catch (error: any) {
        console.error("❌ Error agregando miembro:", error);
        Alert.alert("Error", error.response?.data?.error || "No se pudo agregar el miembro");
      } finally {
        setAddingMember(false);
      }
      return;
    }

    // Si no hay usuario seleccionado pero hay email, buscar por correo
    if (!searchEmail.trim()) {
      Alert.alert("Error", "Selecciona un usuario o ingresa un correo electrónico");
      return;
    }

    setAddingMember(true);
    try {
      const result = await groupsApi.agregarMiembro(groupId, {
        correo: searchEmail.trim().toLowerCase(),
        rol_grupo: "participante",
      });
      
      Alert.alert("¡Éxito!", result.message || "Miembro agregado");
      setShowAddModal(false);
      setSearchEmail("");
      setUsuarioSeleccionado(null);
      setUsuariosBuscados([]);
      cargarDatos();
    } catch (error: any) {
      console.error("❌ Error agregando miembro:", error);
      Alert.alert("Error", error.response?.data?.error || "No se pudo agregar el miembro");
    } finally {
      setAddingMember(false);
    }
  };

  // Cambiar rol de miembro
  const handleChangeRole = (miembro: Miembro) => {
    if (!esFacilitador) return;
    
    const nuevoRol = miembro.rol_grupo === "miembro" ? "moderador" : "miembro";
    
    Alert.alert(
      "Cambiar Rol",
      `¿Cambiar a ${miembro.nombre} a rol "${nuevoRol}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cambiar",
          onPress: async () => {
            try {
              await groupsApi.actualizarRolMiembro(groupId, miembro.id_usuario, nuevoRol);
              Alert.alert("Éxito", "Rol actualizado");
              cargarDatos();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "No se pudo cambiar el rol");
            }
          },
        },
      ]
    );
  };

  // Eliminar miembro
  const handleRemoveMember = (miembro: Miembro) => {
    if (!esFacilitador) return;
    
    Alert.alert(
      "Eliminar Miembro",
      `¿Eliminar a ${miembro.nombre} ${miembro.apellido} del grupo?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await groupsApi.eliminarMiembro(groupId, miembro.id_usuario);
              Alert.alert("Éxito", "Miembro eliminado");
              cargarDatos();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  // Salir del grupo
  const handleLeaveGroup = () => {
    if (esFacilitador) {
      Alert.alert("Error", "Como facilitador, no puedes abandonar el grupo. Debes eliminarlo.");
      return;
    }
    
    Alert.alert(
      "Abandonar Grupo",
      "¿Estás seguro de que quieres salir de este grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              await groupsApi.eliminarMiembro(groupId, user?.id_usuario || 0);
              Alert.alert("Éxito", "Has salido del grupo");
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "No se pudo salir del grupo");
            }
          },
        },
      ]
    );
  };

  // Crear actividad
  const handleCreateActivity = async () => {
    if (!newActivity.titulo.trim()) {
      Alert.alert("Error", "El título es requerido");
      return;
    }

    setCreatingActivity(true);
    try {
      // Construir objeto solo con campos que tienen valor
      const activityData: any = {
        titulo: newActivity.titulo.trim(),
        descripcion: newActivity.descripcion.trim() || null,
        tipo_actividad: newActivity.tipo_actividad,
      };
      
      // Solo agregar fecha si tiene valor
      if (newActivity.fecha_programada && newActivity.fecha_programada.trim()) {
        activityData.fecha_programada = newActivity.fecha_programada.trim();
      }
      
      // Solo agregar duración si tiene valor
      if (newActivity.duracion_estimada && newActivity.duracion_estimada.trim()) {
        activityData.duracion_estimada = parseInt(newActivity.duracion_estimada);
      }
      
      console.log("📤 Enviando actividad:", activityData);
      
      await groupsApi.crearActividad(groupId, activityData);
      
      Alert.alert("¡Éxito!", "Actividad creada");
      setShowActivityModal(false);
      setNewActivity({
        titulo: "",
        descripcion: "",
        tipo_actividad: "tarea",
        fecha_programada: "",
        duracion_estimada: "",
      });
      setSelectedDate(null);
      cargarDatos();
    } catch (error: any) {
      console.error("❌ Error creando actividad:", error);
      Alert.alert("Error", error.response?.data?.error || "No se pudo crear la actividad");
    } finally {
      setCreatingActivity(false);
    }
  };

  // Handlers para DateTimePicker
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // En iOS se mantiene abierto
    if (event.type === 'dismissed') {
      return;
    }
    if (date) {
      // Si ya hay una fecha seleccionada, mantener la hora
      const newDate = selectedDate ? new Date(selectedDate) : new Date();
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newDate);
      
      // Formatear la fecha para el backend
      const formattedDate = formatDateForBackend(newDate);
      setNewActivity({ ...newActivity, fecha_programada: formattedDate });
      
      // Si estamos en Android, mostrar el selector de hora después
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed') {
      return;
    }
    if (time && selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours(), time.getMinutes());
      setSelectedDate(newDate);
      
      // Formatear para el backend
      const formattedDate = formatDateForBackend(newDate);
      setNewActivity({ ...newActivity, fecha_programada: formattedDate });
    }
  };

  // Formatear fecha para el backend (YYYY-MM-DD HH:MM)
  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Formatear fecha para mostrar al usuario
  const formatDateForDisplay = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // Limpiar fecha seleccionada
  const clearSelectedDate = () => {
    setSelectedDate(null);
    setNewActivity({ ...newActivity, fecha_programada: "" });
  };

  // Eliminar actividad
  const handleDeleteActivity = (actividad: Actividad) => {
    if (!esFacilitador) return;
    
    Alert.alert(
      "Eliminar Actividad",
      `¿Eliminar "${actividad.titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await groupsApi.eliminarActividad(groupId, actividad.id_actividad);
              Alert.alert("Éxito", "Actividad eliminada");
              cargarDatos();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  // Obtener icono según rol
  const getRolIcon = (rol: string): keyof typeof Ionicons.glyphMap => {
    switch (rol) {
      case "facilitador": return "star";
      case "moderador": return "shield";
      default: return "person";
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "facilitador": return "#f59e0b";
      case "moderador": return "#8b5cf6";
      default: return "#94a3b8";
    }
  };

  // Helper para actividades
  const getActivityIcon = (tipo: string): keyof typeof Ionicons.glyphMap => {
    switch (tipo) {
      case "tarea": return "checkbox";
      case "actividad": return "fitness";
      case "evaluacion": return "clipboard";
      default: return "document-text";
    }
  };

  const getActivityColor = (tipo: string) => {
    switch (tipo) {
      case "tarea": return "#3b82f6";
      case "actividad": return "#22c55e";
      case "evaluacion": return "#f59e0b";
      default: return "#8b5cf6";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#0f172a", "#1e293b"]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#5ad0d2" />
          <Text style={styles.loadingText}>Cargando grupo...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!grupo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.loadingText}>Grupo no encontrado</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nombreGrupo = grupo.nombre_grupo || grupo.nombre || "Sin nombre";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5ad0d2"
            colors={["#5ad0d2"]}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={["#5ad0d2", "#8be8ea"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {nombreGrupo}
            </Text>
            <View style={styles.headerBadges}>
              {esFacilitador && (
                <View style={styles.facilitadorBadgeHeader}>
                  <Ionicons name="star" size={12} color="#0f172a" />
                  <Text style={styles.facilitadorBadgeText}>Facilitador</Text>
                </View>
              )}
              <View style={[styles.tipoBadgeHeader, { backgroundColor: "rgba(15,23,42,0.2)" }]}>
                <Text style={styles.tipoBadgeHeaderText}>{grupo.tipo_grupo}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-social" size={22} color="#0f172a" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.description}>
            {grupo.descripcion || "Sin descripción"}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color="#5ad0d2" />
              <Text style={styles.statValue}>
                {grupo.total_miembros || miembros.length}/{grupo.max_participantes}
              </Text>
              <Text style={styles.statLabel}>Miembros</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name={grupo.privacidad === "privado" ? "lock-closed" : "globe"}
                size={20}
                color="#5ad0d2"
              />
              <Text style={styles.statValue}>{grupo.privacidad}</Text>
              <Text style={styles.statLabel}>Privacidad</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={20} color="#5ad0d2" />
              <Text style={styles.statValue}>
                {new Date(grupo.fecha_creacion).toLocaleDateString("es", { day: "numeric", month: "short" })}
              </Text>
              <Text style={styles.statLabel}>Creado</Text>
            </View>
          </View>
        </View>

        {/* Código de Acceso (solo facilitador) */}
        {esFacilitador && (
          <TouchableOpacity style={styles.codeCard} onPress={handleCopyCode}>
            <View style={styles.codeHeader}>
              <Ionicons name="key" size={20} color="#5ad0d2" />
              <Text style={styles.codeLabel}>Código de Acceso</Text>
            </View>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{grupo.codigo_acceso}</Text>
              <Ionicons name="copy-outline" size={20} color="#94a3b8" />
            </View>
            <Text style={styles.codeHint}>Toca para copiar • Comparte para invitar</Text>
          </TouchableOpacity>
        )}

        {/* Tabs de Navegación */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "miembros" && styles.tabActive]}
            onPress={() => setActiveTab("miembros")}
          >
            <Ionicons
              name="people"
              size={20}
              color={activeTab === "miembros" ? "#5ad0d2" : "#64748b"}
            />
            <Text style={[styles.tabText, activeTab === "miembros" && styles.tabTextActive]}>
              Miembros
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "actividades" && styles.tabActive]}
            onPress={() => setActiveTab("actividades")}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={activeTab === "actividades" ? "#5ad0d2" : "#64748b"}
            />
            <Text style={[styles.tabText, activeTab === "actividades" && styles.tabTextActive]}>
              Actividades
            </Text>
          </TouchableOpacity>
        </View>

        {/* Miembros Section */}
        {activeTab === "miembros" && (
        <View style={styles.membersSection}>
          <View style={styles.membersSectionHeader}>
            <Text style={styles.sectionTitle}>
              Miembros ({miembros.length})
            </Text>
            {esFacilitador && (
              <TouchableOpacity
                style={styles.addMemberBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="person-add" size={18} color="#0f172a" />
                <Text style={styles.addMemberText}>Agregar</Text>
              </TouchableOpacity>
            )}
          </View>

          {miembros.length === 0 ? (
            <View style={styles.emptyMembers}>
              <Ionicons name="people-outline" size={48} color="#475569" />
              <Text style={styles.emptyMembersText}>No hay miembros aún</Text>
            </View>
          ) : (
            miembros.map((miembro) => {
              const esYo = miembro.id_usuario === user?.id_usuario;
              const esFacilitadorMiembro = miembro.rol_grupo === "facilitador";
              
              return (
                <View key={miembro.id_miembro || miembro.id_usuario} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <LinearGradient
                      colors={
                        esFacilitadorMiembro
                          ? ["#f59e0b", "#fbbf24"]
                          : ["#5ad0d2", "#8be8ea"]
                      }
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarText}>
                        {miembro.nombre?.charAt(0).toUpperCase() || "?"}
                      </Text>
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>
                        {miembro.nombre} {miembro.apellido}
                        {esYo && " (Tú)"}
                      </Text>
                    </View>
                    <View style={styles.memberMeta}>
                      <Ionicons
                        name={getRolIcon(miembro.rol_grupo)}
                        size={14}
                        color={getRolColor(miembro.rol_grupo)}
                      />
                      <Text style={[styles.memberRole, { color: getRolColor(miembro.rol_grupo) }]}>
                        {miembro.rol_grupo}
                      </Text>
                    </View>
                  </View>
                  
                  {esFacilitador && !esYo && !esFacilitadorMiembro && (
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={styles.memberActionBtn}
                        onPress={() => handleChangeRole(miembro)}
                      >
                        <Ionicons name="swap-horizontal" size={18} color="#8b5cf6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.memberActionBtn}
                        onPress={() => handleRemoveMember(miembro)}
                      >
                        <Ionicons name="remove-circle-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
        )}

        {/* Actividades Section */}
        {activeTab === "actividades" && (
        <View style={styles.activitiesSection}>
          <View style={styles.membersSectionHeader}>
            <Text style={styles.sectionTitle}>
              Actividades ({actividades.length})
            </Text>
            {esFacilitador && (
              <TouchableOpacity
                style={styles.addMemberBtn}
                onPress={() => setShowActivityModal(true)}
              >
                <Ionicons name="add-circle" size={18} color="#0f172a" />
                <Text style={styles.addMemberText}>Nueva</Text>
              </TouchableOpacity>
            )}
          </View>

          {actividades.length === 0 ? (
            <View style={styles.emptyMembers}>
              <Ionicons name="calendar-outline" size={48} color="#475569" />
              <Text style={styles.emptyMembersText}>No hay actividades aún</Text>
              {esFacilitador && (
                <Text style={styles.emptyHint}>Toca "Nueva" para crear una actividad</Text>
              )}
            </View>
          ) : (
            actividades.map((actividad) => (
              <View key={actividad.id_actividad} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: `${getActivityColor(actividad.tipo_actividad)}20` }]}>
                  <Ionicons
                    name={getActivityIcon(actividad.tipo_actividad)}
                    size={24}
                    color={getActivityColor(actividad.tipo_actividad)}
                  />
                </View>
                
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{actividad.titulo}</Text>
                  {actividad.descripcion && (
                    <Text style={styles.activityDesc} numberOfLines={2}>
                      {actividad.descripcion}
                    </Text>
                  )}
                  <View style={styles.activityMeta}>
                    <View style={[styles.activityType, { backgroundColor: `${getActivityColor(actividad.tipo_actividad)}30` }]}>
                      <Text style={[styles.activityTypeText, { color: getActivityColor(actividad.tipo_actividad) }]}>
                        {activityTypeLabels[actividad.tipo_actividad] || actividad.tipo_actividad}
                      </Text>
                    </View>
                    <View style={styles.activityDates}>
                      <Ionicons name="time-outline" size={12} color="#64748b" />
                      <Text style={styles.activityDateText}>
                        {actividad.fecha_programada ? formatDate(actividad.fecha_programada) : 'Sin fecha'}
                        {actividad.duracion_estimada ? ` (${actividad.duracion_estimada} min)` : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {esFacilitador && (
                  <TouchableOpacity
                    style={styles.activityDeleteBtn}
                    onPress={() => handleDeleteActivity(actividad)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
        )}

        {/* Botón Salir (solo si no es facilitador) */}
        {!esFacilitador && (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
            <Ionicons name="exit-outline" size={20} color="#ef4444" />
            <Text style={styles.leaveButtonText}>Abandonar Grupo</Text>
          </TouchableOpacity>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Agregar Miembro */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setSearchEmail("");
          setUsuarioSeleccionado(null);
          setUsuariosBuscados([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Miembro</Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                setSearchEmail("");
                setUsuarioSeleccionado(null);
                setUsuariosBuscados([]);
              }}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Buscar usuario</Text>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nombre, apellido o correo..."
                  placeholderTextColor="#64748b"
                  value={searchEmail}
                  onChangeText={(text) => {
                    setSearchEmail(text);
                    setUsuarioSeleccionado(null);
                  }}
                  autoCapitalize="none"
                />
                {buscandoUsuarios && (
                  <ActivityIndicator size="small" color="#5ad0d2" style={styles.searchSpinner} />
                )}
              </View>
              
              {/* Usuario seleccionado */}
              {usuarioSeleccionado && (
                <View style={styles.usuarioSeleccionadoContainer}>
                  <View style={styles.usuarioSeleccionadoInfo}>
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={20} color="#5ad0d2" />
                    </View>
                    <View style={styles.usuarioTextos}>
                      <Text style={styles.usuarioNombre}>
                        {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                      </Text>
                      <Text style={styles.usuarioCorreo}>{usuarioSeleccionado.correo}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setUsuarioSeleccionado(null)}
                    style={styles.quitarSeleccion}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Lista de resultados */}
              {!usuarioSeleccionado && usuariosBuscados.length > 0 && (
                <ScrollView style={styles.resultadosBusqueda} nestedScrollEnabled>
                  {usuariosBuscados.map((usuario) => (
                    <TouchableOpacity
                      key={usuario.id}
                      style={styles.usuarioResultado}
                      onPress={() => {
                        setUsuarioSeleccionado(usuario);
                        setSearchEmail(`${usuario.nombre} ${usuario.apellido}`);
                        setUsuariosBuscados([]);
                      }}
                    >
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={18} color="#5ad0d2" />
                      </View>
                      <View style={styles.usuarioTextos}>
                        <Text style={styles.usuarioNombre}>
                          {usuario.nombre} {usuario.apellido}
                        </Text>
                        <Text style={styles.usuarioCorreo}>{usuario.correo}</Text>
                      </View>
                      <Ionicons name="add-circle-outline" size={24} color="#5ad0d2" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              
              {/* Mensaje cuando no hay resultados */}
              {!usuarioSeleccionado && searchEmail.length >= 2 && usuariosBuscados.length === 0 && !buscandoUsuarios && (
                <View style={styles.noResultados}>
                  <Ionicons name="person-outline" size={32} color="#64748b" />
                  <Text style={styles.noResultadosText}>No se encontraron usuarios</Text>
                  <Text style={styles.noResultadosHint}>Intenta con otro nombre o correo</Text>
                </View>
              )}
              
              <Text style={styles.helperText}>
                Escribe al menos 2 caracteres para buscar
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setSearchEmail("");
                  setUsuarioSeleccionado(null);
                  setUsuariosBuscados([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, !usuarioSeleccionado && styles.confirmButtonDisabled]}
                onPress={handleAddMember}
                disabled={addingMember || !usuarioSeleccionado}
              >
                {addingMember ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={18} color={usuarioSeleccionado ? "#0f172a" : "#64748b"} />
                    <Text style={[styles.confirmButtonText, !usuarioSeleccionado && { color: '#64748b' }]}>Agregar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Crear Actividad */}
      <Modal
        visible={showActivityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.activityModalScroll}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Actividad</Text>
                <TouchableOpacity onPress={() => setShowActivityModal(false)}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {/* Título */}
                <Text style={styles.inputLabel}>Título *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nombre de la actividad"
                  placeholderTextColor="#64748b"
                  value={newActivity.titulo}
                  onChangeText={(text) => setNewActivity({ ...newActivity, titulo: text })}
                />

                {/* Descripción */}
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Descripción de la actividad (opcional)"
                  placeholderTextColor="#64748b"
                  value={newActivity.descripcion}
                  onChangeText={(text) => setNewActivity({ ...newActivity, descripcion: text })}
                  multiline
                  numberOfLines={3}
                />

                {/* Tipo de Actividad */}
                <Text style={styles.inputLabel}>Tipo de Actividad</Text>
                <View style={styles.typeSelector}>
                  {["tarea", "juego_grupal", "ejercicio_respiracion", "meditacion_guiada", "reflexion", "otro"].map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      style={[
                        styles.typeOption,
                        newActivity.tipo_actividad === tipo && styles.typeOptionActive,
                        { borderColor: getActivityColor(tipo) }
                      ]}
                      onPress={() => setNewActivity({ ...newActivity, tipo_actividad: tipo })}
                    >
                      <Ionicons
                        name={getActivityIcon(tipo)}
                        size={18}
                        color={newActivity.tipo_actividad === tipo ? getActivityColor(tipo) : "#64748b"}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          newActivity.tipo_actividad === tipo && { color: getActivityColor(tipo) }
                        ]}
                      >
                        {activityTypeLabels[tipo] || tipo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Fecha Programada con DatePicker */}
                <Text style={styles.inputLabel}>Fecha Programada (opcional)</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#5ad0d2" />
                  <Text style={styles.datePickerText}>
                    {selectedDate 
                      ? formatDateForDisplay(selectedDate) 
                      : "Seleccionar fecha y hora"}
                  </Text>
                  {selectedDate && (
                    <TouchableOpacity 
                      onPress={clearSelectedDate}
                      style={styles.clearDateButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* DatePicker para Android/iOS */}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    is24Hour={true}
                  />
                )}

                {/* Duración Estimada */}
                <Text style={styles.inputLabel}>Duración (minutos, opcional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: 60"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={newActivity.duracion_estimada}
                  onChangeText={(text) => setNewActivity({ ...newActivity, duracion_estimada: text })}
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowActivityModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCreateActivity}
                  disabled={creatingActivity || !newActivity.titulo.trim()}
                >
                  {creatingActivity ? (
                    <ActivityIndicator color="#0f172a" />
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={18} color="#0f172a" />
                      <Text style={styles.confirmButtonText}>Crear</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 12,
    fontSize: 16,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: "#5ad0d2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: {
    color: "#0f172a",
    fontWeight: "600",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  facilitadorBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15,23,42,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  facilitadorBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  tipoBadgeHeader: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipoBadgeHeaderText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#0f172a",
    textTransform: "capitalize",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Info Card
  infoCard: {
    margin: 16,
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.15)",
  },
  description: {
    fontSize: 15,
    color: "#cbd5e1",
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(90,208,210,0.1)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e2e8f0",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  // Code Card
  codeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(90,208,210,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.3)",
  },
  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5ad0d2",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e2e8f0",
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },

  // Members Section
  membersSection: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  membersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#5ad0d2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addMemberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  emptyMembers: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(30,41,59,0.5)",
    borderRadius: 16,
  },
  emptyMembersText: {
    color: "#64748b",
    marginTop: 12,
    fontSize: 14,
  },

  // Member Card
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.1)",
  },
  memberAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  memberMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  memberActions: {
    flexDirection: "row",
    gap: 8,
  },
  memberActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(51,65,85,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Leave Button
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(90,208,210,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(90,208,210,0.1)",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "rgba(51,65,85,0.5)",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#e2e8f0",
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.2)",
  },
  helperText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51,65,85,0.5)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.2)",
    gap: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: "#e2e8f0",
  },
  clearDateButton: {
    padding: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(51,65,85,0.5)",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#5ad0d2",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "rgba(90,208,210,0.15)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#5ad0d2",
  },

  // Activities Section
  activitiesSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.1)",
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 8,
    lineHeight: 18,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  activityType: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activityTypeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  activityDates: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityDateText: {
    fontSize: 11,
    color: "#64748b",
  },
  activityDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: "#5ad0d2",
    marginTop: 8,
  },

  // Activity Modal
  activityModalScroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(51,65,85,0.5)",
    borderWidth: 1.5,
    borderColor: "rgba(100,116,139,0.3)",
  },
  typeOptionActive: {
    backgroundColor: "rgba(90,208,210,0.1)",
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
  },
  
  // Estilos para búsqueda de usuarios
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(100,116,139,0.3)",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#e2e8f0",
    fontSize: 15,
  },
  searchSpinner: {
    marginLeft: 8,
  },
  resultadosBusqueda: {
    maxHeight: 200,
    backgroundColor: "rgba(30,41,59,0.5)",
    borderRadius: 12,
    marginBottom: 12,
  },
  usuarioResultado: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(100,116,139,0.2)",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(90,208,210,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  usuarioTextos: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 2,
  },
  usuarioCorreo: {
    fontSize: 13,
    color: "#64748b",
  },
  usuarioSeleccionadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(90,208,210,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.3)",
  },
  usuarioSeleccionadoInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  quitarSeleccion: {
    padding: 4,
  },
  noResultados: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  noResultadosText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#94a3b8",
    marginTop: 12,
  },
  noResultadosHint: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "rgba(90,208,210,0.3)",
  },
});
