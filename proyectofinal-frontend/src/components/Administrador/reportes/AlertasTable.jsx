import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, Eye } from 'lucide-react';

/**
 * Componente de tabla para mostrar alertas críticas recientes
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Array de objetos con datos de alertas
 * @param {Function} props.onViewDetails - Callback para ver detalles de alerta
 */
const AlertasTable = ({ data = [], onViewDetails }) => {
  const getTipoAlertaBadge = (tipo) => {
    const styles = {
      'riesgo_alto': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'patron_anormal': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'empeoramiento': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'inactividad': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[tipo] || styles.inactividad}`}>
        {tipo.replace('_', ' ')}
      </span>
    );
  };

  const getNivelColor = (nivel) => {
    if (nivel >= 80) return 'text-red-600 dark:text-red-400 font-bold';
    if (nivel >= 60) return 'text-orange-600 dark:text-orange-400 font-semibold';
    if (nivel >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!data || data.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alertas Críticas Recientes
          </h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500 dark:text-gray-400">
            No hay alertas críticas en este momento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alertas Críticas Recientes
          </h3>
          <span className="ml-auto bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
            {data.length} {data.length === 1 ? 'alerta' : 'alertas'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo de Alerta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nivel Ansiedad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((alerta) => (
              <tr 
                key={alerta.id_alerta}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {alerta.nombre} {alerta.apellido}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTipoAlertaBadge(alerta.tipo_alerta)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                    {alerta.descripcion || alerta.titulo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFecha(alerta.fecha)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getNivelColor(alerta.nivel_ansiedad)}`}>
                    {alerta.nivel_ansiedad ? `${alerta.nivel_ansiedad}%` : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    type="button"
                    onClick={() => onViewDetails && onViewDetails(alerta)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    aria-label={`Ver detalles de alerta de ${alerta.nombre} ${alerta.apellido}`}
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AlertasTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id_alerta: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      apellido: PropTypes.string.isRequired,
      tipo_alerta: PropTypes.string.isRequired,
      titulo: PropTypes.string,
      descripcion: PropTypes.string,
      fecha: PropTypes.string.isRequired,
      nivel_ansiedad: PropTypes.number,
    })
  ),
  onViewDetails: PropTypes.func,
};

export default AlertasTable;
