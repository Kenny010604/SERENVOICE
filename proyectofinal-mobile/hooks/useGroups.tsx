import { useState, useCallback } from 'react';
import groupsApi from '../api/groups';

// ============================================
// 📝 TIPOS
// ============================================
export interface Grupo {
  id_grupo: number;
  nombre_grupo: string;
  nombre?: string;
  descripcion: string;
  tipo_grupo: string;
  privacidad: string;
  max_participantes: number;
  codigo_acceso: string;
  id_facilitador: number;
  fecha_creacion?: string;
  rol_grupo?: string;
  total_miembros?: number;
}

export interface Miembro {
  id_miembro: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol_grupo: string;
  fecha_union: string;
}

export interface CrearGrupoData {
  nombre: string;
  descripcion?: string;
  tipo_grupo: string;
  privacidad: string;
  max_participantes?: number;
}

export interface AgregarMiembroData {
  correo?: string;
  id_usuario?: number;
  rol_grupo?: string;
}

// ============================================
// 🎣 HOOK useGroups
// ============================================
export function useGroups() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoActual, setGrupoActual] = useState<Grupo | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);

  // ============================================
  // 📋 LISTAR TODOS LOS GRUPOS
  // ============================================
  const listarGrupos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupsApi.listar();
      const gruposList = Array.isArray(data) ? data : [];
      setGrupos(gruposList);
      return gruposList;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al cargar grupos';
      setError(errorMsg);
      console.error('❌ Error listando grupos:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 📋 LISTAR MIS GRUPOS
  // ============================================
  const listarMisGrupos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupsApi.misGrupos();
      const gruposList = Array.isArray(data) ? data : [];
      setGrupos(gruposList);
      return gruposList;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al cargar mis grupos';
      setError(errorMsg);
      console.error('❌ Error listando mis grupos:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 🔍 OBTENER GRUPO POR ID
  // ============================================
  const obtenerGrupo = useCallback(async (idGrupo: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupsApi.obtener(idGrupo);
      setGrupoActual(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al obtener grupo';
      setError(errorMsg);
      console.error('❌ Error obteniendo grupo:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // ➕ CREAR GRUPO
  // ============================================
  const crearGrupo = useCallback(async (datos: CrearGrupoData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await groupsApi.crear(datos);
      // Actualizar lista después de crear
      await listarGrupos();
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al crear grupo';
      setError(errorMsg);
      console.error('❌ Error creando grupo:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [listarGrupos]);

  // ============================================
  // 🗑️ ELIMINAR GRUPO
  // ============================================
  const eliminarGrupo = useCallback(async (idGrupo: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await groupsApi.eliminar(idGrupo);
      // Remover de la lista local
      setGrupos(prev => prev.filter(g => g.id_grupo !== idGrupo));
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al eliminar grupo';
      setError(errorMsg);
      console.error('❌ Error eliminando grupo:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 🔑 UNIRSE POR CÓDIGO
  // ============================================
  const unirseGrupo = useCallback(async (codigo: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await groupsApi.unirPorCodigo(codigo);
      // Actualizar lista después de unirse
      await listarGrupos();
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al unirse al grupo';
      setError(errorMsg);
      console.error('❌ Error uniéndose al grupo:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [listarGrupos]);

  // ============================================
  // 👥 LISTAR MIEMBROS
  // ============================================
  const listarMiembros = useCallback(async (idGrupo: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupsApi.listarMiembros(idGrupo);
      const miembrosList = Array.isArray(data) ? data : [];
      setMiembros(miembrosList);
      return miembrosList;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al cargar miembros';
      setError(errorMsg);
      console.error('❌ Error listando miembros:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // ➕ AGREGAR MIEMBRO
  // ============================================
  const agregarMiembro = useCallback(async (idGrupo: number, datos: AgregarMiembroData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await groupsApi.agregarMiembro(idGrupo, datos);
      // Actualizar lista de miembros
      await listarMiembros(idGrupo);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al agregar miembro';
      setError(errorMsg);
      console.error('❌ Error agregando miembro:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [listarMiembros]);

  // ============================================
  // 📝 ACTUALIZAR ROL DE MIEMBRO
  // ============================================
  const actualizarRolMiembro = useCallback(async (
    idGrupo: number,
    idUsuario: number,
    nuevoRol: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await groupsApi.actualizarRolMiembro(idGrupo, idUsuario, nuevoRol);
      // Actualizar lista de miembros
      await listarMiembros(idGrupo);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al actualizar rol';
      setError(errorMsg);
      console.error('❌ Error actualizando rol:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [listarMiembros]);

  // ============================================
  // 🗑️ ELIMINAR MIEMBRO
  // ============================================
  const eliminarMiembro = useCallback(async (idGrupo: number, idUsuario: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await groupsApi.eliminarMiembro(idGrupo, idUsuario);
      // Actualizar lista de miembros
      setMiembros(prev => prev.filter(m => m.id_usuario !== idUsuario));
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al eliminar miembro';
      setError(errorMsg);
      console.error('❌ Error eliminando miembro:', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 🔄 LIMPIAR ERROR
  // ============================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // 🔄 RESET
  // ============================================
  const reset = useCallback(() => {
    setGrupos([]);
    setGrupoActual(null);
    setMiembros([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // Estado
    loading,
    error,
    grupos,
    grupoActual,
    miembros,

    // Acciones de grupos
    listarGrupos,
    listarMisGrupos,
    obtenerGrupo,
    crearGrupo,
    eliminarGrupo,
    unirseGrupo,

    // Acciones de miembros
    listarMiembros,
    agregarMiembro,
    actualizarRolMiembro,
    eliminarMiembro,

    // Utilidades
    clearError,
    reset,
  };
}

export default useGroups;
