import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ThemeContext } from '../../../context/themeContextDef';

/**
 * Componente de gráfica de barras para clasificaciones de ansiedad
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Array de objetos con nivel de ansiedad y cantidad
 */
const ClasificacionChart = ({ data = [] }) => {
  const { isDark } = useContext(ThemeContext);

  const CLASSIFICATION_COLORS = {
    normal: '#10b981',
    leve: '#84cc16',
    moderado: '#f59e0b',
    alto: '#f97316',
    muy_alto: '#ef4444',
  };

  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
            {data.payload.clasificacion.replace('_', ' ')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Casos: {data.value}
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
          Distribución por Clasificación
        </h3>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos de clasificación disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Distribución por Clasificación
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="clasificacion" 
            stroke={axisColor}
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => value.replace('_', ' ')}
          />
          <YAxis 
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={() => 'Número de casos'}
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar 
            dataKey="cantidad" 
            radius={[8, 8, 0, 0]}
            maxBarSize={80}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CLASSIFICATION_COLORS[entry.clasificacion] || '#6b7280'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {Object.entries(CLASSIFICATION_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {key.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

ClasificacionChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      clasificacion: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ),
};

export default ClasificacionChart;
