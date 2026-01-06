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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import groupsApi from "../../../api/groups";

interface Grupo {
  id_grupo: number;
  nombre_grupo: string;
  nombre?: string;
  descripcion: string;
  tipo_grupo: string;
  privacidad: string;
  max_participantes: number;
  codigo_acceso: string;
  id_facilitador: number;
  rol_grupo?: string;
  total_miembros?: number;
}

export default function Grupos() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMisGrupos, setShowMisGrupos] = useState(true);
  
  // Modal crear grupo
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    nombre: "",
    descripcion: "",
    tipo_grupo: "apoyo",
    privacidad: "privado",
    max_participantes: 20,
  });
  
  // Modal unirse por código
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const cargarGrupos = useCallback(async () => {
    try {
      console.log("📡 Cargando grupos...");
      const data = await groupsApi.listar();
      console.log("📦 Grupos recibidos:", data?.length || 0);
      setGrupos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("❌ Error cargando grupos:", error);
      Alert.alert("Error", "No se pudieron cargar los grupos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarGrupos();
  }, [cargarGrupos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarGrupos();
  }, [cargarGrupos]);

  // Filtrar grupos
  const filteredGrupos = grupos.filter((g) => {
    const nombre = (g.nombre_grupo || g.nombre || "").toLowerCase();
    const desc = (g.descripcion || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = nombre.includes(query) || desc.includes(query);
    
    if (showMisGrupos) {
      return matchesSearch;
    } else {
      return matchesSearch && g.privacidad === "publico";
    }
  });

  // Crear grupo
  const handleCreateGroup = async () => {
    if (!newGroup.nombre.trim()) {
      Alert.alert("Error", "El nombre del grupo es requerido");
      return;
    }

    setCreating(true);
    try {
      const result = await groupsApi.crear(newGroup);
      console.log("✅ Grupo creado:", result);
      
      Alert.alert(
        "¡Grupo Creado!",
        `Tu código de acceso es: ${result.codigo_acceso}\n\nCompártelo con quienes quieras invitar.`,
        [{ text: "OK" }]
      );
      
      setShowCreateModal(false);
      setNewGroup({
        nombre: "",
        descripcion: "",
        tipo_grupo: "apoyo",
        privacidad: "privado",
        max_participantes: 20,
      });
      cargarGrupos();
    } catch (error: any) {
      console.error("❌ Error creando grupo:", error);
      Alert.alert("Error", error.response?.data?.error || "No se pudo crear el grupo");
    } finally {
      setCreating(false);
    }
  };

  // Unirse por código
  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Error", "Ingresa un código de acceso");
      return;
    }

    setJoining(true);
    try {
      const result = await groupsApi.unirPorCodigo(joinCode.trim().toUpperCase());
      console.log("✅ Unido al grupo:", result);
      
      Alert.alert("¡Éxito!", result.message || "Te has unido al grupo");
      setShowJoinModal(false);
      setJoinCode("");
      cargarGrupos();
    } catch (error: any) {
      console.error("❌ Error uniéndose al grupo:", error);
      Alert.alert("Error", error.response?.data?.error || "No se pudo unir al grupo");
    } finally {
      setJoining(false);
    }
  };

  // Eliminar grupo
  const handleDeleteGroup = (grupo: Grupo) => {
    Alert.alert(
      "Eliminar Grupo",
      `¿Estás seguro de eliminar "${grupo.nombre_grupo || grupo.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await groupsApi.eliminar(grupo.id_grupo);
              Alert.alert("Éxito", "Grupo eliminado");
              cargarGrupos();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  // Obtener icono según tipo
  const getTipoIcon = (tipo: string): keyof typeof Ionicons.glyphMap => {
    switch (tipo) {
      case "apoyo": return "heart";
      case "terapia": return "medkit";
      case "taller": return "construct";
      case "familiar": return "home";
      case "empresa": return "business";
      case "educativo": return "school";
      case "otro": return "ellipsis-horizontal";
      default: return "people";
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
          <Text style={styles.loadingText}>Cargando grupos...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {showMisGrupos ? "Mis Grupos" : "Explorar Grupos"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {filteredGrupos.length} grupo{filteredGrupos.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowMisGrupos(!showMisGrupos)}
              style={styles.toggleButton}
            >
              <Ionicons
                name={showMisGrupos ? "globe-outline" : "person-outline"}
                size={24}
                color="#0f172a"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCreateModal(true)}
          >
            <LinearGradient
              colors={["#5ad0d2", "#8be8ea"]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="#0f172a" />
              <Text style={styles.actionButtonText}>Crear Grupo</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowJoinModal(true)}
          >
            <LinearGradient
              colors={["#334155", "#475569"]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="enter-outline" size={24} color="#5ad0d2" />
              <Text style={[styles.actionButtonText, { color: "#5ad0d2" }]}>
                Unirse por Código
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar grupos..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Groups List */}
        <View style={styles.groupsList}>
          {filteredGrupos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={["rgba(90,208,210,0.1)", "rgba(139,232,234,0.1)"]}
                style={styles.emptyGradient}
              >
                <Ionicons name="people-outline" size={64} color="#5ad0d2" />
                <Text style={styles.emptyTitle}>
                  {showMisGrupos
                    ? "No tienes grupos todavía"
                    : "No hay grupos públicos"}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {showMisGrupos
                    ? "¡Crea uno nuevo o únete con un código!"
                    : "Los grupos públicos aparecerán aquí"}
                </Text>
              </LinearGradient>
            </View>
          ) : (
            filteredGrupos.map((grupo) => {
              const nombre = grupo.nombre_grupo || grupo.nombre || "Sin nombre";
              const esFacilitador = grupo.id_facilitador === user?.id_usuario;
              
              return (
                <TouchableOpacity
                  key={grupo.id_grupo}
                  style={styles.groupCard}
                  onPress={() => router.push(`/PaginaUsuario/GrupoDetalle?id=${grupo.id_grupo}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.groupHeader}>
                    <View style={styles.groupIconContainer}>
                      <LinearGradient
                        colors={["#5ad0d2", "#8be8ea"]}
                        style={styles.groupIcon}
                      >
                        <Ionicons
                          name={getTipoIcon(grupo.tipo_grupo)}
                          size={24}
                          color="#0f172a"
                        />
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.groupInfo}>
                      <View style={styles.groupTitleRow}>
                        <Text style={styles.groupName} numberOfLines={1}>
                          {nombre}
                        </Text>
                        {esFacilitador && (
                          <View style={styles.facilitadorBadge}>
                            <Text style={styles.facilitadorText}>Facilitador</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.groupDescription} numberOfLines={2}>
                        {grupo.descripcion || "Sin descripción"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.groupMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={16} color="#94a3b8" />
                      <Text style={styles.metaText}>
                        {grupo.total_miembros || 1}/{grupo.max_participantes || "∞"}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name={grupo.privacidad === "privado" ? "lock-closed" : "globe"}
                        size={16}
                        color="#94a3b8"
                      />
                      <Text style={styles.metaText}>{grupo.privacidad}</Text>
                    </View>
                    <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(grupo.tipo_grupo) }]}>
                      <Text style={styles.tipoText}>{grupo.tipo_grupo}</Text>
                    </View>
                  </View>

                  <View style={styles.groupActions}>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => router.push(`/PaginaUsuario/GrupoDetalle?id=${grupo.id_grupo}` as any)}
                    >
                      <Text style={styles.detailButtonText}>Ver Detalles</Text>
                      <Ionicons name="chevron-forward" size={18} color="#5ad0d2" />
                    </TouchableOpacity>
                    
                    {esFacilitador && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteGroup(grupo)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal Crear Grupo */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Nuevo Grupo</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nombre del grupo *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Grupo de Apoyo Emocional"
                placeholderTextColor="#64748b"
                value={newGroup.nombre}
                onChangeText={(text) => setNewGroup({ ...newGroup, nombre: text })}
              />

              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe el propósito del grupo..."
                placeholderTextColor="#64748b"
                value={newGroup.descripcion}
                onChangeText={(text) => setNewGroup({ ...newGroup, descripcion: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Tipo de grupo</Text>
              <View style={styles.optionsRow}>
                {["apoyo", "terapia", "taller", "familiar"].map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.optionButton,
                      newGroup.tipo_grupo === tipo && styles.optionButtonActive,
                    ]}
                    onPress={() => setNewGroup({ ...newGroup, tipo_grupo: tipo })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        newGroup.tipo_grupo === tipo && styles.optionTextActive,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Privacidad</Text>
              <View style={styles.optionsRow}>
                {["privado", "publico"].map((priv) => (
                  <TouchableOpacity
                    key={priv}
                    style={[
                      styles.optionButton,
                      newGroup.privacidad === priv && styles.optionButtonActive,
                    ]}
                    onPress={() => setNewGroup({ ...newGroup, privacidad: priv })}
                  >
                    <Ionicons
                      name={priv === "privado" ? "lock-closed" : "globe"}
                      size={16}
                      color={newGroup.privacidad === priv ? "#0f172a" : "#94a3b8"}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        newGroup.privacidad === priv && styles.optionTextActive,
                      ]}
                    >
                      {priv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Máximo de participantes</Text>
              <TextInput
                style={styles.textInput}
                placeholder="20"
                placeholderTextColor="#64748b"
                value={String(newGroup.max_participantes)}
                onChangeText={(text) =>
                  setNewGroup({ ...newGroup, max_participantes: parseInt(text) || 20 })
                }
                keyboardType="number-pad"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateGroup}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={20} color="#0f172a" />
                    <Text style={styles.createButtonText}>Crear</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Unirse por Código */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unirse a un Grupo</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Código de acceso</Text>
              <TextInput
                style={[styles.textInput, styles.codeInput]}
                placeholder="Ej: ABC123"
                placeholderTextColor="#64748b"
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
              />
              <Text style={styles.helperText}>
                Solicita el código al facilitador del grupo
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleJoinGroup}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <>
                    <Ionicons name="enter" size={20} color="#0f172a" />
                    <Text style={styles.createButtonText}>Unirse</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper para color según tipo
const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case "apoyo": return "rgba(239,68,68,0.2)";
    case "terapia": return "rgba(59,130,246,0.2)";
    case "taller": return "rgba(234,179,8,0.2)";
    case "familiar": return "rgba(34,197,94,0.2)";
    case "empresa": return "rgba(168,85,247,0.2)";
    case "educativo": return "rgba(249,115,22,0.2)";
    case "otro": return "rgba(107,114,128,0.2)";
    default: return "rgba(90,208,210,0.2)";
  }
};

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

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#0f172a",
    opacity: 0.7,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51,65,85,0.5)",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.2)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#e2e8f0",
  },

  // Groups List
  groupsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    marginTop: 40,
  },
  emptyGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.2)",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },

  // Group Card
  groupCard: {
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.15)",
  },
  groupHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  groupIconContainer: {
    marginRight: 12,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  groupInfo: {
    flex: 1,
  },
  groupTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e2e8f0",
    flex: 1,
  },
  facilitadorBadge: {
    backgroundColor: "#5ad0d2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  facilitadorText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  groupDescription: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
  },

  // Group Meta
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  tipoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipoText: {
    fontSize: 12,
    color: "#e2e8f0",
    fontWeight: "500",
    textTransform: "capitalize",
  },

  // Group Actions
  groupActions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(90,208,210,0.1)",
    paddingTop: 12,
  },
  detailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5ad0d2",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
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
    maxHeight: "85%",
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

  // Inputs
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
    marginTop: 16,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  codeInput: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },

  // Options
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(51,65,85,0.5)",
    borderWidth: 1,
    borderColor: "rgba(90,208,210,0.2)",
  },
  optionButtonActive: {
    backgroundColor: "#5ad0d2",
    borderColor: "#5ad0d2",
  },
  optionText: {
    fontSize: 14,
    color: "#94a3b8",
    textTransform: "capitalize",
  },
  optionTextActive: {
    color: "#0f172a",
    fontWeight: "600",
  },

  // Buttons
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
  createButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#5ad0d2",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
});
