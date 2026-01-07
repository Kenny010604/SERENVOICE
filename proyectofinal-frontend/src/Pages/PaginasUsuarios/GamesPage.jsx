import React, { useState } from 'react';
import logger from '../../utils/logger';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import "../../global.css";
import GameIntegration from "../../components/Usuario/GameIntegration.jsx";
import GameStats from "../../components/Usuario/GameStats.jsx";
import GameHistory from "../../components/Usuario/GameHistory.jsx";


const GamesPage = () => {
  const location = useLocation();

  // Si llega desde el análisis, úsalo. Si no, usa "estable".
  const estadoInicial = location.state?.estadoEmocional || "estable";

  const [, setShowHistory] = useState(false);
  const [estadoEmocional] = useState(estadoInicial);

  const handleGameComplete = (sesion) => {
    logger.debug('Juego completado:', sesion);
  };

  return (
    <div className="page-content">
      {/* Estadísticas y estado */}
      <div className="card card-xl mb-6">
        <h1 className="page-title">🎮 Juegos Terapéuticos</h1>
        <p className="muted-paragraph">Mejora tu bienestar emocional jugando</p>

        <div className="mb-4">
          <p className="muted-label">Estado emocional detectado:</p>
          <div className="estado-box">{estadoEmocional}</div>
        </div>

        <div className="mb-4">
          <GameStats />
        </div>

        <div className="controls-row">
          <button
            onClick={() => setShowHistory(false)}
            className="auth-button"
          >
            Jugar
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="auth-button"
          >
            Historial
          </button>
        </div>
      </div>

      {/* Juegos recomendados */}
      <div className="card card-xl mt-4">
        <GameIntegration estadoEmocionalUsuario={estadoEmocional} onGameComplete={handleGameComplete} />
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default GamesPage;
