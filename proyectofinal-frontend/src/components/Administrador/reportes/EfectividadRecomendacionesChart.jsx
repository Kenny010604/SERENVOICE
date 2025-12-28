import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThemeContext } from '../../../context/themeContextDef';

/**
 * Componente de gráfica de barras para efectividad de recomendaciones
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Array de objetos con tipo de recomendación, total y seguidas
 */
const EfectividadRecomendacionesChart = ({ data = [] }) => {
  const { isDark } = useContext(ThemeContext);

  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          {payload[0] && payload[1] && (
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-2">
              Efectividad: {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Efectividad de Recomendaciones
        </h3>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos de recomendaciones disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Efectividad de Recomendaciones
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Comparación entre recomendaciones generadas y aquellas reportadas como útiles por usuarios
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="tipo" 
            stroke={axisColor}
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="rect"
          />
          <Bar 
            dataKey="generadas" 
            name="Generadas"
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
          <Bar 
            dataKey="utiles" 
            name="Reportadas como útiles"
            fill="#10b981" 
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

EfectividadRecomendacionesChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      tipo: PropTypes.string.isRequired,
      generadas: PropTypes.number.isRequired,
      utiles: PropTypes.number.isRequired,
    })
  ),
};

export default EfectividadRecomendacionesChart;
