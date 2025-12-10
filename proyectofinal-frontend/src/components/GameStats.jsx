import React, { useState, useEffect } from 'react';
import { juegosAPI } from '../services/apiClient';
import { Award, TrendingUp, Target, Clock } from 'lucide-react';

const GameStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const data = await juegosAPI.estadisticas();
      if (data.success) {
        setStats(data.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<Target className="text-blue-500" size={32} />}
        title="Sesiones Totales"
        value={stats.total_sesiones}
        color="bg-blue-50"
      />
      
      <StatCard
        icon={<Award className="text-yellow-500" size={32} />}
        title="Puntos Totales"
        value={stats.puntuacion_total.toLocaleString()}
        color="bg-yellow-50"
      />
      
      <StatCard
        icon={<TrendingUp className="text-green-500" size={32} />}
        title="Tasa de Mejora"
        value={`${stats.tasa_mejora}%`}
        color="bg-green-50"
      />
      
      <StatCard
        icon={<Clock className="text-purple-500" size={32} />}
        title="Completadas"
        value={`${stats.sesiones_completadas}/${stats.total_sesiones}`}
        color="bg-purple-50"
      />
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className={`${color} rounded-lg p-6 flex items-center gap-4`}>
    <div>{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default GameStats;
