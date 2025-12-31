import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ThemeContext } from '../../../context/themeContextDef';

/**
 * Componente de gráfica de líneas para mostrar tendencias emocionales
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Array de objetos con fecha y valores de métricas
 * @param {string} props.periodo - Periodo de tiempo mostrado
 */
const TendenciasChart = ({ data = [], periodo = '30d', emocionesSeleccionadas = null }) => {
  const { isDark } = useContext(ThemeContext);

  const chartColors = {
    estres: '#f97316',
    ansiedad: '#ef4444',
    felicidad: '#10b981',
    tristeza: '#6366f1',
    miedo: '#8b5cf6',
    enojo: '#dc2626',
    neutral: '#6b7280',
    sorpresa: '#f59e0b',
  };

  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tendencias Emocionales
        </h3>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos disponibles para el periodo seleccionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tendencias Emocionales - Últimos {periodo === '7d' ? '7 días' : periodo === '30d' ? '30 días' : '90 días'}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="fecha" 
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={axisColor}
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          {Object.keys(chartColors)
            .filter((key) => !emocionesSeleccionadas || emocionesSeleccionadas.length === 0 ? true : emocionesSeleccionadas.includes(key))
            .map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                stroke={chartColors[key]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

TendenciasChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      fecha: PropTypes.string.isRequired,
      estres: PropTypes.number,
      ansiedad: PropTypes.number,
      felicidad: PropTypes.number,
      tristeza: PropTypes.number,
      miedo: PropTypes.number,
      enojo: PropTypes.number,
      neutral: PropTypes.number,
      sorpresa: PropTypes.number,
    })
  ),
  periodo: PropTypes.oneOf(['7d', '30d', '90d']),
  emocionesSeleccionadas: PropTypes.arrayOf(PropTypes.string),
};

export default TendenciasChart;
