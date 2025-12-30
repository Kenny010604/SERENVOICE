import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Users, ExternalLink, ArrowUpDown } from 'lucide-react';

/**
 * Componente de tabla para mostrar usuarios con mayores niveles de ansiedad/estrés
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Array de objetos con datos de usuarios
 * @param {string} props.metric - Métrica a mostrar ('ansiedad' o 'estres')
 */
const TopUsuariosTable = ({ data = [], metric = 'ansiedad' }) => {
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedData = [...data].sort((a, b) => {
    const aValue = metric === 'ansiedad' ? a.promedio_ansiedad : a.promedio_estres;
    const bValue = metric === 'ansiedad' ? b.promedio_ansiedad : b.promedio_estres;
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const topData = sortedData.slice(0, 10);

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const getNivelColor = (nivel) => {
    if (nivel >= 80) return 'text-red-600 dark:text-red-400 font-bold';
    if (nivel >= 60) return 'text-orange-600 dark:text-orange-400 font-semibold';
    if (nivel >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getNivelBadge = (nivel) => {
    if (nivel >= 80) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (nivel >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    if (nivel >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  const getClasificacion = (nivel) => {
    if (nivel >= 80) return 'Muy Alto';
    if (nivel >= 60) return 'Alto';
    if (nivel >= 40) return 'Moderado';
    if (nivel >= 20) return 'Leve';
    return 'Normal';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top 10 Usuarios - Mayor {metric === 'ansiedad' ? 'Ansiedad' : 'Estrés'}
          </h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos de usuarios disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top 10 Usuarios - Mayor {metric === 'ansiedad' ? 'Ansiedad' : 'Estrés'}
            </h3>
          </div>
          <button
            onClick={toggleSort}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Cambiar orden"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'desc' ? 'Mayor a menor' : 'Menor a mayor'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Promedio {metric === 'ansiedad' ? 'Ansiedad' : 'Estrés'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Clasificación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Análisis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Último Análisis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {topData.map((usuario, index) => {
              const valor = metric === 'ansiedad' ? usuario.promedio_ansiedad : usuario.promedio_estres;
              return (
                <tr 
                  key={usuario.id_usuario}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {usuario.nombre} {usuario.apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {usuario.correo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getNivelColor(valor)}`}>
                      {valor ? valor.toFixed(1) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelBadge(valor)}`}>
                      {getClasificacion(valor)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {usuario.total_analisis || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFecha(usuario.ultimo_analisis)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`/admin/usuarios/${usuario.id_usuario}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      aria-label={`Ver perfil de ${usuario.nombre} ${usuario.apellido}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver perfil
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TopUsuariosTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id_usuario: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      apellido: PropTypes.string.isRequired,
      correo: PropTypes.string.isRequired,
      promedio_ansiedad: PropTypes.number,
      promedio_estres: PropTypes.number,
      total_analisis: PropTypes.number,
      ultimo_analisis: PropTypes.string,
    })
  ),
  metric: PropTypes.oneOf(['ansiedad', 'estres']),
};

export default TopUsuariosTable;
