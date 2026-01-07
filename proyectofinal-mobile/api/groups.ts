import api from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "/api/grupos";

// Helper para obtener token
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const groupsApi = {
  // =====================
  // GRUPOS - CRUD
  // =====================

  /**
   * Listar todos los grupos del usuario
   */
  listar: async () => {
    const headers = await getAuthHeader();
    const res = await api.get(BASE, { headers });
    return res.data;
  },

  /**
   * Obtener mis grupos
   */
  misGrupos: async () => {
    const headers = await getAuthHeader();
    const res = await api.get(`${BASE}/mis-grupos`, { headers });
    return res.data;
  },

  /**
   * Obtener detalle de un grupo
   */
  obtener: async (idGrupo: number) => {
    const headers = await getAuthHeader();
    const res = await api.get(`${BASE}/${idGrupo}`, { headers });
    return res.data;
  },

  /**
   * Crear un nuevo grupo
   */
  crear: async (data: {
    nombre: string;
    descripcion?: string;
    tipo_grupo?: string;
    privacidad?: string;
    max_participantes?: number;
  }) => {
    const headers = await getAuthHeader();
    const res = await api.post(BASE, data, { headers });
    return res.data;
  },

  /**
   * Actualizar un grupo
   */
  actualizar: async (idGrupo: number, data: any) => {
    const headers = await getAuthHeader();
    const res = await api.put(`${BASE}/${idGrupo}`, data, { headers });
    return res.data;
  },

  /**
   * Eliminar un grupo
   */
  eliminar: async (idGrupo: number) => {
    const headers = await getAuthHeader();
    const res = await api.delete(`${BASE}/${idGrupo}`, { headers });
    return res.data;
  },

  // =====================
  // UNIRSE A GRUPO
  // =====================

  /**
   * Unirse a un grupo por código
   */
  unirPorCodigo: async (codigo: string) => {
    const headers = await getAuthHeader();
    const res = await api.post(`${BASE}/codigo/${codigo}`, {}, { headers });
    return res.data;
  },

  // =====================
  // MIEMBROS
  // =====================

  /**
   * Listar miembros de un grupo
   */
  listarMiembros: async (idGrupo: number) => {
    const headers = await getAuthHeader();
    const res = await api.get(`${BASE}/${idGrupo}/miembros`, { headers });
    return res.data;
  },

  /**
   * Agregar miembro a un grupo
   */
  agregarMiembro: async (idGrupo: number, data: { correo?: string; usuario_id?: number; rol_grupo?: string }) => {
    const headers = await getAuthHeader();
    const res = await api.post(`${BASE}/${idGrupo}/miembros`, data, { headers });
    return res.data;
  },

  /**
   * Actualizar rol de miembro
   */
  actualizarRolMiembro: async (idGrupo: number, idUsuario: number, rol: string) => {
    const headers = await getAuthHeader();
    const res = await api.put(`${BASE}/${idGrupo}/miembros/${idUsuario}`, { rol_grupo: rol }, { headers });
    return res.data;
  },

  /**
   * Eliminar miembro de un grupo
   */
  eliminarMiembro: async (idGrupo: number, idUsuario: number) => {
    const headers = await getAuthHeader();
    const res = await api.delete(`${BASE}/${idGrupo}/miembros/${idUsuario}`, { headers });
    return res.data;
  },

  // =====================
  // ACTIVIDADES
  // =====================

  /**
   * Listar actividades de un grupo
   */
  listarActividades: async (idGrupo: number) => {
    const headers = await getAuthHeader();
    const res = await api.get(`${BASE}/${idGrupo}/actividades`, { headers });
    return res.data;
  },

  /**
   * Crear actividad en un grupo
   */
  crearActividad: async (idGrupo: number, data: {
    titulo: string;
    descripcion?: string;
    tipo_actividad?: string;
    fecha_programada?: string;
    duracion_estimada?: number;
  }) => {
    const headers = await getAuthHeader();
    const res = await api.post(`${BASE}/${idGrupo}/actividades`, data, { headers });
    return res.data;
  },

  /**
   * Actualizar actividad
   * NOTA: Actualmente no implementada en backend
   */
  actualizarActividad: async (idGrupo: number, idActividad: number, data: any) => {
    const headers = await getAuthHeader();
    // Ruta hipotética - backend no tiene esta funcionalidad aún
    const res = await api.put(`${BASE}/actividades/${idActividad}`, data, { headers });
    return res.data;
  },

  /**
   * Eliminar actividad
   */
  eliminarActividad: async (idGrupo: number, idActividad: number) => {
    const headers = await getAuthHeader();
    // La ruta del backend es /api/grupos/actividades/:id_actividad (sin idGrupo)
    const res = await api.delete(`${BASE}/actividades/${idActividad}`, { headers });
    return res.data;
  },

  // =====================
  // BÚSQUEDA DE USUARIOS
  // =====================

  /**
   * Buscar usuarios para agregar al grupo
   */
  buscarUsuarios: async (query: string) => {
    const headers = await getAuthHeader();
    const res = await api.get(`/api/usuarios/search`, { 
      headers,
      params: { query: query, limit: 10 }
    });
    return res.data;
  },

  // =====================
  // ESTADÍSTICAS
  // =====================

  /**
   * Obtener estadísticas de un grupo
   */
  estadisticasGrupo: async (idGrupo: number) => {
    const headers = await getAuthHeader();
    const res = await api.get(`${BASE}/${idGrupo}/estadisticas`, { headers });
    return res.data;
  },
};

export default groupsApi;
