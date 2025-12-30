import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThemeContext } from '../../../context/themeContextDef';

/**
 * Componente de gráfica de barras para actividad de grupos
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Array de objetos con nombre de grupo, actividades y miembros
 */
const GruposActividadChart = ({ data = [] }) => {
  const { isDark } = useContext(ThemeContext);

  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.nombre_grupo}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Actividades completadas: <span className="font-semibold">{data.actividades_completadas}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Total actividades: <span className="font-semibold">{data.total_actividades}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Miembros activos: <span className="font-semibold">{data.miembros_activos}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Grupos Más Activos
        </h3>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos de grupos disponibles
          </p>
        </div>
      </div>
    );
  }

  // Validar que data sea un array
  const validData = Array.isArray(data) ? data : [];
  const topGroups = validData.slice(0, 10);

  if (topGroups.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Grupos Más Activos (Top 10)
        </h3>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos de actividad de grupos disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Grupos Más Activos (Top 10)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={topGroups}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
          <XAxis 
            type="number"
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="nombre_grupo" 
            stroke={axisColor}
            style={{ fontSize: '11px' }}
            width={120}
            tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={() => 'Actividades completadas'}
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar 
            dataKey="actividades_completadas" 
            fill="#3b82f6"
            radius={[0, 8, 8, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

GruposActividadChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      nombre_grupo: PropTypes.string.isRequired,
      actividades_completadas: PropTypes.number.isRequired,
      total_actividades: PropTypes.number,
      miembros_activos: PropTypes.number,
    })
  ),
};

export default GruposActividadChart;
