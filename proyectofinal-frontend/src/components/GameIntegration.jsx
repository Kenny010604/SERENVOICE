import React, { useState, useEffect } from 'react';
import { juegosAPI } from '../services/apiClient';
import { toast } from 'react-hot-toast'; // Instalar: npm install react-hot-toast

const GameIntegration = ({ estadoEmocionalUsuario = 'estable', onGameComplete }) => {
  const [sesionActual, setSesionActual] = useState(null);
  const [juegosRecomendados, setJuegosRecomendados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarJuegosRecomendados();
  }, [estadoEmocionalUsuario]);

  const cargarJuegosRecomendados = async () => {
    try {
      const data = await juegosAPI.recomendados(estadoEmocionalUsuario);
      if (data.success) {
        setJuegosRecomendados(data.juegos_recomendados);
      }
    } catch (error) {
      console.error('Error al cargar juegos recomendados:', error);
      toast.error('Error al cargar juegos recomendados');
    }
  };

  const handleIniciarJuego = async (juegoId) => {
    setLoading(true);
    try {
      const data = await juegosAPI.iniciar(juegoId, estadoEmocionalUsuario);
      
      if (data.success) {
        setSesionActual(data.sesion_id);
        toast.success('¡Juego iniciado! Diviértete 🎮');
        return data.sesion_id;
      }
    } catch (error) {
      console.error('Error al iniciar juego:', error);
      toast.error('Error al iniciar el juego');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarJuego = async (resultado) => {
    if (!sesionActual) {
      console.warn('No hay sesión activa');
      return;
    }

    try {
      const data = await juegosAPI.finalizar(sesionActual, {
        puntuacion: resultado.puntuacion || 0,
        completado: resultado.completado || false,
        estadoDespues: resultado.estadoDespues || null,
        mejora: resultado.mejora || null,
        notas: resultado.notas || '',
      });

      if (data.success) {
        toast.success(`¡Bien hecho! Obtuviste ${resultado.puntuacion} puntos 🎉`);
        
        // Llamar callback si existe
        if (onGameComplete) {
          onGameComplete(data.sesion);
        }
        
        setSesionActual(null);
      }
    } catch (error) {
      console.error('Error al finalizar juego:', error);
      toast.error('Error al guardar los resultados');
    }
  };

  return (
    <div className="game-integration-container">
      <TherapeuticGames
        estadoInicial={estadoEmocionalUsuario}
        juegosRecomendados={juegosRecomendados}
        onIniciarJuego={handleIniciarJuego}
        onFinalizarJuego={handleFinalizarJuego}
        loading={loading}
      />
    </div>
  );
};

export default GameIntegration;

