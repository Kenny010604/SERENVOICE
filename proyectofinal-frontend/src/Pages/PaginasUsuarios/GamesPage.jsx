import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import GameIntegration from "../../components/GameIntegration.jsx";
import GameStats from "../../components/GameStats.jsx";
import GameHistory from "../../components/GameHistory.jsx";


const GamesPage = () => {
  const location = useLocation();

  // Si llega desde el análisis, úsalo. Si no, usa "estable".
  const estadoInicial = location.state?.estadoEmocional || "estable";

  const [showHistory, setShowHistory] = useState(false);
  const [estadoEmocional, setEstadoEmocional] = useState(estadoInicial);

  const handleEstadoChange = (nuevoEstado) => {
    setEstadoEmocional(nuevoEstado);
  };

  const handleGameComplete = (sesion) => {
    console.log('Juego completado:', sesion);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎮 Juegos Terapéuticos
          </h1>
          <p className="text-gray-600">
            Mejora tu bienestar emocional jugando
          </p>
        </div>

        {/* Mostrar estado emocional REAL (no editable si viene del análisis) */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Estado emocional detectado:
          </p>

          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold">
            {estadoEmocional}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-8">
          <GameStats />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowHistory(false)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !showHistory
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎮 Jugar
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              showHistory
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📜 Historial
          </button>
        </div>

        {/* Contenido */}
        {!showHistory ? (
          <GameIntegration
            estadoEmocionalUsuario={estadoEmocional}
            onGameComplete={handleGameComplete}
          />
        ) : (
          <GameHistory />
        )}
      </div>
    </div>
  );
};

export default GamesPage;
