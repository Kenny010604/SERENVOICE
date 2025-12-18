import apiClient from './apiClient';

// Use backend blueprint prefix (apiClient already includes '/api')
const base = '/grupos';

const groupsService = {
  listar: async () => {
    const res = await apiClient.get(base);
    return res.data;
  },

  obtener: async (id) => {
    const res = await apiClient.get(`${base}/${id}`);
    return res.data;
  },

  crear: async (payload) => {
    const res = await apiClient.post(base, payload);
    return res.data;
  },

  actualizar: async (id, payload) => {
    const res = await apiClient.put(`${base}/${id}`, payload);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await apiClient.delete(`${base}/${id}`);
    return res.data;
  },

  // Miembros
  listarMiembros: async (grupoId) => {
    const res = await apiClient.get(`${base}/${grupoId}/miembros`);
    return res.data;
  },

  agregarMiembro: async (grupoId, payload) => {
    const res = await apiClient.post(`${base}/${grupoId}/miembros`, payload);
    return res.data;
  },

  actualizarMiembro: async (grupoId, miembroId, payload) => {
    const res = await apiClient.put(`${base}/${grupoId}/miembros/${miembroId}`, payload);
    return res.data;
  },

  eliminarMiembro: async (grupoId, miembroId) => {
    const res = await apiClient.delete(`${base}/${grupoId}/miembros/${miembroId}`);
    return res.data;
  },

  // Actividades
  listarActividades: async (grupoId) => {
    const res = await apiClient.get(`${base}/${grupoId}/actividades`);
    return res.data;
  },

  crearActividad: async (grupoId, payload) => {
    const res = await apiClient.post(`${base}/${grupoId}/actividades`, payload);
    return res.data;
  },

  actualizarActividad: async (grupoId, actividadId, payload) => {
    const res = await apiClient.put(`${base}/${grupoId}/actividades/${actividadId}`, payload);
    return res.data;
  },

  eliminarActividad: async (grupoId, actividadId) => {
    const res = await apiClient.delete(`${base}/${grupoId}/actividades/${actividadId}`);
    return res.data;
  },
};

export default groupsService;
