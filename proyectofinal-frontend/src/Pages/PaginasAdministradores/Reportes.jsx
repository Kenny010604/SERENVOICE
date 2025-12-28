import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BarChart3, Users, Brain, AlertTriangle, Activity, RefreshCw, Info } from 'lucide-react';
import NavbarAdministrador from '../../components/Administrador/NavbarAdministrador';
import { ThemeContext } from '../../context/themeContextDef';
import FondoClaro from '../../assets/FondoClaro.svg';
import FondoOscuro from '../../assets/FondoOscuro.svg';
import ReporteCard from '../../components/Administrador/reportes/ReporteCard';
import AdminCard from '../../components/Administrador/AdminCard';
import TendenciasChart from '../../components/Administrador/reportes/TendenciasChart';
import DistribucionEmocionalChart from '../../components/Administrador/reportes/DistribucionEmocionalChart';
import ClasificacionChart from '../../components/Administrador/reportes/ClasificacionChart';
import GruposActividadChart from '../../components/Administrador/reportes/GruposActividadChart';
import EfectividadRecomendacionesChart from '../../components/Administrador/reportes/EfectividadRecomendacionesChart';
import AlertasTable from '../../components/Administrador/reportes/AlertasTable';
import TopUsuariosTable from '../../components/Administrador/reportes/TopUsuariosTable';
import FiltrosFechas from '../../components/Administrador/reportes/FiltrosFechas';
import ExportButton from '../../components/Administrador/reportes/ExportButton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  /**
   * Carga todos los datos del reporte
   */
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const params = new URLSearchParams();
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.periodo) params.append('periodo', filtros.periodo);

      const queryString = params.toString();

      // Helper para manejar respuestas con errores
      const handleResponse = async (response, defaultValue = []) => {
        if (!response.ok) {
          console.error(`Error ${response.status} en ${response.url}`);
          return defaultValue;
        }
        try {
          const data = await response.json();
          return data.data !== undefined ? data.data : data;
        } catch {
          return defaultValue;
        }
      };

      // Realizar las peticiones de forma secuencial para evitar agotar el pool de conexiones
      const resumenRes = await fetch(`${API_BASE_URL}/api/admin/reportes/resumen-general?${queryString}`, { headers });
      const resumenData = await handleResponse(resumenRes, {
        usuarios_activos: 0,
        total_analisis: 0,
        promedio_ansiedad: 0,
        alertas_criticas: 0
      });

      const tendenciasRes = await fetch(`${API_BASE_URL}/api/admin/reportes/tendencias-emocionales?${queryString}`, { headers });
      const tendenciasData = await handleResponse(tendenciasRes, []);

      const emocionesRes = await fetch(`${API_BASE_URL}/api/admin/reportes/distribucion-emociones?${queryString}`, { headers });
      const emocionesData = await handleResponse(emocionesRes, []);

      const clasificacionesRes = await fetch(`${API_BASE_URL}/api/admin/reportes/clasificaciones?${queryString}`, { headers });
      const clasificacionesData = await handleResponse(clasificacionesRes, []);

      const gruposRes = await fetch(`${API_BASE_URL}/api/admin/reportes/grupos-actividad?${queryString}`, { headers });
      const gruposData = await handleResponse(gruposRes, []);

      const recomendacionesRes = await fetch(`${API_BASE_URL}/api/admin/reportes/efectividad-recomendaciones?${queryString}`, { headers });
      const recomendacionesData = await handleResponse(recomendacionesRes, []);

      const alertasRes = await fetch(`${API_BASE_URL}/api/admin/reportes/alertas-criticas?${queryString}`, { headers });
      const alertasData = await handleResponse(alertasRes, []);

      const usuariosRes = await fetch(`${API_BASE_URL}/api/admin/reportes/usuarios-estadisticas?${queryString}`, { headers });
      const usuariosData = await handleResponse(usuariosRes, []);

      setResumen(resumenData);
      setTendencias(tendenciasData);
      setDistribucionEmociones(emocionesData);
      setClasificaciones(clasificacionesData);
      setGruposActividad(gruposData);
      setEfectividadRecomendaciones(recomendacionesData);
      setAlertasCriticas(alertasData);
      setTopUsuarios(usuariosData);

    } catch (err) {
      setError('Error al cargar los datos del reporte. Por favor, intente nuevamente.');
      console.error('Error cargando reportes:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/reportes/exportar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo,
          formato,
          filtros: filtrosExport,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al exportar el reporte');
      }

      const blob = await response.blob();
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
  );

  const skeletonChart = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  return (
    <>
      <NavbarAdministrador />
      <main
        className="container"
        style={{
          paddingTop: '2rem',
          paddingBottom: '6rem',
          minHeight: '100vh',
          backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="card mb-6">
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
          <div className="card mb-6">
            <FiltrosFechas
              onFiltroChange={handleFiltroChange}
              filtrosIniciales={filtros}
            />
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
                  title="Promedio Ansiedad"
                  value={resumen.promedio_ansiedad ? `${resumen.promedio_ansiedad.toFixed(1)}%` : 'N/A'}
                  icon={Activity}
                  color="#ff6b6b"
                  gradient={isDark ? 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(31,41,55,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.98))'}
                  subtitle="nivel promedio"
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
            <div className="card mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
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
                <TendenciasChart data={tendencias} periodo={filtros.periodo} />
                <DistribucionEmocionalChart data={distribucionEmociones} />
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
                <ClasificacionChart data={clasificaciones} />
                <GruposActividadChart data={gruposActividad} />
              </>
            )}
          </div>

          {/* Gráfica de Efectividad */}
          <div className="mb-6">
            {loading ? (
              skeletonChart
            ) : (
              <EfectividadRecomendacionesChart data={efectividadRecomendaciones} />
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
                <AlertasTable
                  data={alertasCriticas}
                  onViewDetails={handleVerDetallesAlerta}
                />
                <TopUsuariosTable
                  data={topUsuarios}
                  metric="ansiedad"
                />
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Panel de Administración
      </footer>
    </>
  );
};

export default Reportes;
