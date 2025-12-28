import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * Componente de gráfica de pastel para distribución de emociones dominantes
 * @param {Object} props - Props del componente
 * @param {Array} props.data - Array de objetos con emoción y cantidad
 */
const DistribucionEmocionalChart = ({ data = [] }) => {
  const EMOTION_COLORS = {
    ansiedad: '#ef4444',
    estres: '#f97316',
    tristeza: '#6366f1',
    miedo: '#8b5cf6',
    enojo: '#dc2626',
    felicidad: '#10b981',
    neutral: '#6b7280',
    sorpresa: '#f59e0b',
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Cantidad: {data.value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Porcentaje: {data.payload.porcentaje}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Distribución de Emociones Dominantes
        </h3>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-500 dark:text-gray-400">
            No hay datos de emociones disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Distribución de Emociones Dominantes
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="cantidad"
            nameKey="emocion"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={EMOTION_COLORS[entry.emocion.toLowerCase()] || EMOTION_COLORS.neutral} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

DistribucionEmocionalChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      emocion: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired,
      porcentaje: PropTypes.number,
    })
  ),
};

export default DistribucionEmocionalChart;
