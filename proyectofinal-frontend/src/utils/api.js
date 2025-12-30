/**
 * Utilidades para llamadas a la API del backend
 * Módulo de funciones de fetch para reportes y estadísticas
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Obtiene los headers de autenticación
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Maneja errores de respuesta HTTP
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ==================== FUNCIONES DE REPORTES ====================

/**
 * Obtiene el resumen general de estadísticas
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Object>} Datos del resumen general
 */
export const fetchReporteGeneral = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/resumen-general?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Obtiene las tendencias emocionales en el tiempo
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Array>} Array de datos de tendencias
 */
export const fetchTendencias = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/tendencias-emocionales?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Obtiene la distribución de emociones dominantes
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Array>} Array de distribución de emociones
 */
export const fetchDistribucionEmociones = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/distribucion-emociones?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Obtiene la distribución por clasificación de nivel
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Array>} Array de clasificaciones
 */
export const fetchClasificaciones = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/clasificaciones?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Obtiene estadísticas de actividad de grupos
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Array>} Array de datos de grupos
 */
export const fetchGruposActividad = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/grupos-actividad?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Obtiene la efectividad de las recomendaciones
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Array>} Array de datos de efectividad
 */
export const fetchEfectividadRecomendaciones = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/efectividad-recomendaciones?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Obtiene las alertas críticas activas
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Array>} Array de alertas críticas
 */
export const fetchAlertasCriticas = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/alertas-criticas?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Obtiene estadísticas de usuarios
 * @param {Object} filtros - Filtros de fecha y periodo
 * @returns {Promise<Array>} Array de datos de usuarios
 */
export const fetchUsuariosEstadisticas = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
  if (filtros.periodo) params.append('periodo', filtros.periodo);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/usuarios-estadisticas?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response);
};

/**
 * Exporta un reporte en el formato especificado
 * @param {Object} params - Parámetros de exportación
 * @param {string} params.tipo - Tipo de reporte (completo, resumen, alertas, grupos)
 * @param {string} params.formato - Formato (pdf, excel)
 * @param {Object} params.filtros - Filtros aplicados
 * @returns {Promise<Blob>} Blob del archivo generado
 */
export const exportarReporte = async ({ tipo, formato, filtros }) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/reportes/exportar`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tipo, formato, filtros }),
    }
  );

  if (!response.ok) {
    throw new Error('Error al exportar el reporte');
  }

  return response.blob();
};

// ==================== FUNCIONES GENERALES DE API ====================

/**
 * Realiza una petición GET genérica
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} params - Parámetros de query string
 * @returns {Promise<Object>} Respuesta de la API
 */
export const apiGet = async (endpoint, params = {}) => {
  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  return handleResponse(response);
};

/**
 * Realiza una petición POST genérica
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @returns {Promise<Object>} Respuesta de la API
 */
export const apiPost = async (endpoint, data = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

/**
 * Realiza una petición PUT genérica
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Respuesta de la API
 */
export const apiPut = async (endpoint, data = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

/**
 * Realiza una petición DELETE genérica
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<Object>} Respuesta de la API
 */
export const apiDelete = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  return handleResponse(response);
};

export default {
  fetchReporteGeneral,
  fetchTendencias,
  fetchDistribucionEmociones,
  fetchClasificaciones,
  fetchGruposActividad,
  fetchEfectividadRecomendaciones,
  fetchAlertasCriticas,
  fetchUsuariosEstadisticas,
  exportarReporte,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};
