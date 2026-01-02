import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { BarChart3, Users, Brain, AlertTriangle, Activity, RefreshCw, Info } from 'lucide-react';
import apiClient from '../../services/apiClient';
import api from '../../config/api';
import { ThemeContext } from '../../context/themeContextDef';
import ReporteCard from '../../components/Administrador/Reportes/ReporteCard';
import AdminCard from '../../components/Administrador/AdminCard';
import TendenciasChart from '../../components/Administrador/Reportes/TendenciasChart';
import DistribucionEmocionalChart from '../../components/Administrador/Reportes/DistribucionEmocionalChart';
import ClasificacionChart from '../../components/Administrador/Reportes/ClasificacionChart';
import GruposActividadChart from '../../components/Administrador/Reportes/GruposActividadChart';
import EfectividadRecomendacionesChart from '../../components/Administrador/Reportes/EfectividadRecomendacionesChart';
import AlertasTable from '../../components/Administrador/Reportes/AlertasTable';
import TopUsuariosTable from '../../components/Administrador/Reportes/TopUsuariosTable';
import FiltrosFechas from '../../components/Administrador/Reportes/FiltrosFechas';
import GraficasFiltros from '../../components/Administrador/Reportes/GraficasFiltros';
import ExportButton from '../../components/Administrador/Reportes/ExportButton';
import "../../styles/StylesAdmin/AdminPages.css";

// Use centralized api endpoints and client

/**
 * Página principal de reportes y estadísticas del panel de administración
 */
const Reportes = () => {
  const { isDark } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    periodo: '30d',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const [resumen, setResumen] = useState({
    usuarios_activos: 0,
    total_analisis: 0,
    promedio_ansiedad: 0,
    alertas_criticas: 0,
  });

  const [tendencias, setTendencias] = useState([]);
  const [distribucionEmociones, setDistribucionEmociones] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [gruposActividad, setGruposActividad] = useState([]);
  const [efectividadRecomendaciones, setEfectividadRecomendaciones] = useState([]);
  const [alertasCriticas, setAlertasCriticas] = useState([]);
  const [topUsuarios, setTopUsuarios] = useState([]);
  const [graficaFiltros, setGraficaFiltros] = useState({
    emotions: ['ansiedad','estres','felicidad','tristeza','miedo','enojo','neutral','sorpresa'],
    metric: 'promedio_ansiedad',
    granularity: 'auto',
    topN: 10,
    threshold: 0,
    compare: false,
    normalize: false,
    smoothing: false,
  });

  // Usar un único conjunto de filtros `graficaFiltros` para todas las gráficas

  const controllerRef = useRef(null);

  // `graficaFiltros` es el único origen de verdad para los filtros de las gráficas

  /**
   * Carga todos los datos del reporte
   */
  const cargarDatos = useCallback(async (extraGraficaFiltros = null) => {
    try {
      setLoading(true);
      setError(null);

      // Build params object for axios
      const params = {};
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      if (filtros.periodo) params.periodo = filtros.periodo;
      // Attach grafica filters as JSON if provided (backend may accept this for server-side aggregation)
      if (extraGraficaFiltros) {
        try {
          params.graficaFiltros = JSON.stringify(extraGraficaFiltros);
        } catch {
          params.graficaFiltros = String(extraGraficaFiltros);
        }
      }

      // cancel previous request if any
      if (controllerRef.current) {
        try { controllerRef.current.abort(); } catch { /* ignore */ }
      }
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      const getData = (res, defaultValue = []) => (res?.data?.data !== undefined ? res.data.data : res?.data ?? defaultValue);

      const resumenRes = await apiClient.get(api.endpoints.admin.reportes.resumenGeneral, { params, skipAuthRedirect: true, signal });
      const resumenData = getData(resumenRes, { usuarios_activos: 0, total_analisis: 0, promedio_ansiedad: 0, alertas_criticas: 0 });

      const tendenciasRes = await apiClient.get(api.endpoints.admin.reportes.tendencias, { params, skipAuthRedirect: true, signal });
      const tendenciasData = getData(tendenciasRes, []);

      const emocionesRes = await apiClient.get(api.endpoints.admin.reportes.distribucionEmociones, { params, skipAuthRedirect: true, signal });
      const emocionesData = getData(emocionesRes, []);

      const clasificacionesRes = await apiClient.get(api.endpoints.admin.reportes.clasificaciones, { params, skipAuthRedirect: true, signal });
      const clasificacionesData = getData(clasificacionesRes, []);

      const gruposRes = await apiClient.get(api.endpoints.admin.reportes.gruposActividad, { params, skipAuthRedirect: true, signal });
      const gruposData = getData(gruposRes, []);

      const recomendacionesRes = await apiClient.get(api.endpoints.admin.reportes.efectividadRecomendaciones, { params, skipAuthRedirect: true, signal });
      const recomendacionesData = getData(recomendacionesRes, []);

      const alertasRes = await apiClient.get(api.endpoints.admin.reportes.alertasCriticas, { params, skipAuthRedirect: true, signal });
      const alertasData = getData(alertasRes, []);

      const usuariosRes = await apiClient.get(api.endpoints.admin.reportes.usuariosEstadisticas, { params, skipAuthRedirect: true, signal });
      const usuariosData = getData(usuariosRes, []);

      setResumen(resumenData);
      setTendencias(tendenciasData);
      setDistribucionEmociones(emocionesData);
      setClasificaciones(clasificacionesData);
      setGruposActividad(gruposData);
      setEfectividadRecomendaciones(recomendacionesData);
      setAlertasCriticas(alertasData);
      setTopUsuarios(usuariosData);

    } catch (err) {
      // If request was canceled (AbortController), do not treat as an error
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        // debug log only, avoid setting UI error state
        console.debug('Request canceled while loading reportes:', err?.message || err);
      } else {
        setError('Error al cargar los datos del reporte. Por favor, intente nuevamente.');
        console.error('Error cargando reportes:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Debounced server sync when global graficaFiltros change
  useEffect(() => {
    const t = setTimeout(() => {
      cargarDatos({ scope: 'global', graficaFiltros });
    }, 600);
    return () => clearTimeout(t);
  }, [graficaFiltros, cargarDatos]);

  // No hay efectos por tarjeta: la carga se dispara por `graficaFiltros` global (más abajo)

  useEffect(() => {
    const calcularFechasIniciales = () => {
      const hoy = new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(hoy.getDate() - 30);
      
      setFiltros({
        periodo: '30d',
        fecha_inicio: hace30Dias.toISOString().split('T')[0],
        fecha_fin: hoy.toISOString().split('T')[0],
      });
    };

    calcularFechasIniciales();
  }, []);

  useEffect(() => {
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      cargarDatos();
    }
  }, [filtros, cargarDatos]);

  /**
   * Maneja el cambio de filtros de fecha
   */
  const handleFiltroChange = useCallback((nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  }, []);

  /**
   * Maneja la exportación de reportes
   */
  const handleExportar = useCallback(async ({ formato, tipo, filtros: filtrosExport }) => {
    try {
      const response = await apiClient.post(api.endpoints.admin.reportes.exportar, { tipo, formato, filtros: filtrosExport }, { responseType: 'blob' });
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_serenvoice_${tipo}_${new Date().getTime()}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error exportando reporte:', err);
      alert('Error al exportar el reporte. Por favor, intente nuevamente.');
    }
  }, []);

  /**
   * Maneja la visualización de detalles de una alerta
   */
  const handleVerDetallesAlerta = useCallback((alerta) => {
    window.location.href = `/admin/alertas/${alerta.id_alerta}`;
  }, []);

  /**
   * Maneja la actualización manual de datos
   */
  const handleActualizar = useCallback(() => {
    cargarDatos();
  }, [cargarDatos]);

  const skeletonCard = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md py-8 sm:py-10 px-6 sm:px-8 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
  );

  const skeletonChart = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md py-8 sm:py-10 px-6 sm:px-8 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  return (
    <div className="admin-reportes-page">
      <main
        className="container"
        style={{
          paddingBottom: '2rem',
          minHeight: '100vh'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 reportes-page">
          {/* Header */}
          <div className="card mb-6 py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                  Reportes y Estadísticas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Panel de análisis y métricas del sistema SerenVoice
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleActualizar}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Actualizar datos"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                <ExportButton
                  onExport={handleExportar}
                  filtros={filtros}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="card mb-6 py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
            <FiltrosFechas
              onFiltroChange={handleFiltroChange}
              filtrosIniciales={filtros}
            />
            <div className="mt-4">
              <GraficasFiltros
                initial={graficaFiltros}
                onChange={(nuevo) => setGraficaFiltros((prev) => {
                  try {
                    const prevStr = JSON.stringify(prev);
                    const nuevoStr = JSON.stringify(nuevo);
                    if (prevStr === nuevoStr) return prev;
                  } catch {
                    // fallback: if stringify fails, still set
                  }
                  return nuevo;
                })}
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Cards de Resumen (estilo Dashboard: bloques pequeños 2x2) */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              width: '100%',
              alignItems: 'stretch'
            }}
          >
            {loading ? (
              <>
                {skeletonCard}
                {skeletonCard}
                {skeletonCard}
                {skeletonCard}
              </>
            ) : (
              <>
                <AdminCard
                  variant="stat"
                  title="Usuarios Activos"
                  value={resumen.usuarios_activos || 0}
                  icon={Users}
                  color="#4caf50"
                  gradient={isDark ? 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(31,41,55,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.98))'}
                  subtitle="en el periodo seleccionado"
                />

                <AdminCard
                  variant="stat"
                  title="Total Análisis"
                  value={resumen.total_analisis || 0}
                  icon={Brain}
                  color="#2196f3"
                  gradient={isDark ? 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(31,41,55,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.98))'}
                  subtitle="análisis realizados"
                />

                <AdminCard
                  variant="stat"
                  title="Promedio Emociones"
                  value={
                    distribucionEmociones && distribucionEmociones.length === 8
                      ? `${(
                          distribucionEmociones.reduce((s, e) => s + (e.porcentaje || 0), 0) / 8
                        ).toFixed(1)}%`
                      : resumen.promedio_ansiedad ? `${resumen.promedio_ansiedad.toFixed(1)}%` : 'N/A'
                  }
                  icon={Activity}
                  color="#ff6b6b"
                  gradient={isDark ? 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(31,41,55,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.98))'}
                  subtitle="promedio de 8 emociones"
                />

                <AdminCard
                  variant="stat"
                  title="Alertas Críticas"
                  value={resumen.alertas_criticas || 0}
                  icon={AlertTriangle}
                  color="#ff9800"
                  gradient={isDark ? 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(31,41,55,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.98))'}
                  subtitle="requieren atención"
                />
              </>
            )}
          </div>

          {/* Info Banner */}
          {!loading && (
            <div className="card mb-6 py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Datos del periodo: {filtros.periodo === '7d' ? 'Últimos 7 días' : filtros.periodo === '30d' ? 'Últimos 30 días' : filtros.periodo === '90d' ? 'Últimos 90 días' : 'Personalizado'}
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-400">
                    Los datos mostrados corresponden al rango seleccionado. Los cambios porcentuales comparan con el periodo anterior.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gráficas - Primera Fila */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {loading ? (
              <>
                {skeletonChart}
                {skeletonChart}
              </>
            ) : (
              <>
                <div className="card py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
                      <div className="mb-4">
                        <GraficasFiltros
                          initial={graficaFiltros}
                          onChange={(nuevo) => setGraficaFiltros((prev) => {
                            try {
                              const prevStr = JSON.stringify(prev);
                              const nuevoStr = JSON.stringify(nuevo);
                              if (prevStr === nuevoStr) return prev;
                            } catch {
                              // fallback
                            }
                            return nuevo;
                          })}
                        />
                      </div>
                      <TendenciasChart data={tendencias} periodo={filtros.periodo} emocionesSeleccionadas={graficaFiltros.emotions} metric={graficaFiltros.metric} granularidad={graficaFiltros.granularity} smoothing={graficaFiltros.smoothing} />
                </div>
                <div className="card py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
                  <div className="mb-4">
                    <GraficasFiltros
                      initial={graficaFiltros}
                      onChange={(nuevo) => setGraficaFiltros((prev) => {
                        try {
                          const prevStr = JSON.stringify(prev);
                          const nuevoStr = JSON.stringify(nuevo);
                          if (prevStr === nuevoStr) return prev;
                        } catch {
                          // fallback
                        }
                        return nuevo;
                      })}
                    />
                  </div>
                  <DistribucionEmocionalChart data={distribucionEmociones} emocionesSeleccionadas={graficaFiltros.emotions} normalize={graficaFiltros.normalize} />
                </div>
              </>
            )}
          </div>

          {/* Gráficas - Segunda Fila */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {loading ? (
              <>
                {skeletonChart}
                {skeletonChart}
              </>
            ) : (
              <>
                <div className="card py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
                  <div className="mb-4">
                    <GraficasFiltros
                      initial={graficaFiltros}
                      onChange={(nuevo) => setGraficaFiltros((prev) => {
                        try {
                          const prevStr = JSON.stringify(prev);
                          const nuevoStr = JSON.stringify(nuevo);
                          if (prevStr === nuevoStr) return prev;
                        } catch {
                          // fallback
                        }
                        return nuevo;
                      })}
                    />
                  </div>
                  <ClasificacionChart data={clasificaciones} emocionesSeleccionadas={graficaFiltros.emotions} />
                </div>
                <div className="card py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
                  <div className="mb-4">
                    <GraficasFiltros
                      initial={graficaFiltros}
                      onChange={(nuevo) => setGraficaFiltros((prev) => {
                        try {
                          const prevStr = JSON.stringify(prev);
                          const nuevoStr = JSON.stringify(nuevo);
                          if (prevStr === nuevoStr) return prev;
                        } catch {
                          // fallback
                        }
                        return nuevo;
                      })}
                    />
                  </div>
                  <GruposActividadChart data={gruposActividad} emocionesSeleccionadas={graficaFiltros.emotions} />
                </div>
              </>
            )}
          </div>

          {/* Gráfica de Efectividad */}
          <div className="mb-6">
            {loading ? (
              skeletonChart
            ) : (
                <div className="card py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
                  <div className="mb-4">
                    <GraficasFiltros
                      initial={graficaFiltros}
                      onChange={(nuevo) => setGraficaFiltros((prev) => {
                        try {
                          const prevStr = JSON.stringify(prev);
                          const nuevoStr = JSON.stringify(nuevo);
                          if (prevStr === nuevoStr) return prev;
                        } catch {
                          // fallback
                        }
                        return nuevo;
                      })}
                    />
                  </div>
                  <EfectividadRecomendacionesChart data={efectividadRecomendaciones} emocionesSeleccionadas={graficaFiltros.emotions} />
              </div>
            )}
          </div>

          {/* Tablas de Datos Detallados */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {loading ? (
              <>
                {skeletonChart}
                {skeletonChart}
              </>
            ) : (
              <>
                <div className="card py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
                  <AlertasTable
                    data={alertasCriticas}
                    onViewDetails={handleVerDetallesAlerta}
                  />
                </div>
                <div className="card py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
                  <div className="mb-4">
                    <GraficasFiltros
                      initial={graficaFiltros}
                      onChange={(nuevo) => setGraficaFiltros((prev) => {
                        try {
                          const prevStr = JSON.stringify(prev);
                          const nuevoStr = JSON.stringify(nuevo);
                          if (prevStr === nuevoStr) return prev;
                        } catch {
                          // fallback
                        }
                        return nuevo;
                      })}
                    />
                  </div>
                  <TopUsuariosTable
                    data={topUsuarios}
                    metric="ansiedad"
                    topN={graficaFiltros.topN}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reportes;
