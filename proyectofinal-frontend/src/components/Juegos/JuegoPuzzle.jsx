// src/components/Juegos/JuegoPuzzle.jsx
import React, { useState, useEffect, useCallback } from "react";

const JuegoPuzzle = ({ juego, onFinish, onExit }) => {
  const [piezas, setPiezas] = useState([]);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [segundos, setSegundos] = useState(0);

  const TAMANO = 3; // Puzzle 3x3
  const TOTAL_PIEZAS = TAMANO * TAMANO;

  useEffect(() => {
    if (juegoIniciado && !juegoCompletado) {
      const timer = setInterval(() => {
        setSegundos(Math.floor((Date.now() - tiempoInicio) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [juegoIniciado, juegoCompletado, tiempoInicio]);

  const estaResuelto = useCallback(() => {
    if (piezas.length === 0) return false;
    for (let i = 0; i < piezas.length - 1; i++) {
      if (piezas[i] !== i + 1) return false;
    }
    return piezas[piezas.length - 1] === 0;
  }, [piezas]);

  useEffect(() => {
    if (juegoIniciado && estaResuelto()) {
      setJuegoCompletado(true);
    }
  }, [juegoIniciado, estaResuelto]);

  const iniciarJuego = () => {
    // Crear array de números del 1 al 8, y un 0 para el espacio vacío
    let numeros = Array.from({ length: TOTAL_PIEZAS - 1 }, (_, i) => i + 1);
    numeros.push(0); // 0 representa el espacio vacío

    // Mezclar
    for (let i = 0; i < 100; i++) {
      numeros = moverAleatorio(numeros);
    }

    setPiezas(numeros);
    setMovimientos(0);
    setJuegoIniciado(true);
    setJuegoCompletado(false);
    setTiempoInicio(Date.now());
    setSegundos(0);
  };

  const moverAleatorio = (arr) => {
    const posVacio = arr.indexOf(0);
    const vecinos = obtenerVecinos(posVacio);
    const posAleatorio = vecinos[Math.floor(Math.random() * vecinos.length)];
    return moverPieza(arr, posAleatorio);
  };

  const obtenerVecinos = (pos) => {
    const vecinos = [];
    const fila = Math.floor(pos / TAMANO);
    const col = pos % TAMANO;

    if (fila > 0) vecinos.push(pos - TAMANO); // Arriba
    if (fila < TAMANO - 1) vecinos.push(pos + TAMANO); // Abajo
    if (col > 0) vecinos.push(pos - 1); // Izquierda
    if (col < TAMANO - 1) vecinos.push(pos + 1); // Derecha

    return vecinos;
  };

  const moverPieza = (arr, pos) => {
    const nuevoArr = [...arr];
    const posVacio = arr.indexOf(0);
    [nuevoArr[pos], nuevoArr[posVacio]] = [nuevoArr[posVacio], nuevoArr[pos]];
    return nuevoArr;
  };

  const handleClick = (pos) => {
    const posVacio = piezas.indexOf(0);
    const vecinos = obtenerVecinos(posVacio);

    if (vecinos.includes(pos)) {
      setPiezas(moverPieza(piezas, pos));
      setMovimientos(movimientos + 1);
    }
  };



  const calcularPuntuacion = () => {
    const movimientosOptimos = 20;
    const tiempoOptimo = 60; // segundos
    
    let puntos = 100;
    puntos -= Math.max(0, (movimientos - movimientosOptimos) * 2);
    puntos -= Math.max(0, (segundos - tiempoOptimo) * 0.5);
    
    return Math.max(0, Math.round(puntos));
  };

  const formatearTiempo = (segs) => {
    const mins = Math.floor(segs / 60);
    const secs = segs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (juegoCompletado) {
    const puntuacion = calcularPuntuacion();

    return (
      <div className="card" style={{ maxWidth: 600, margin: "50px auto", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: "5rem", marginBottom: 20 }}>🎉</div>
        <h1>¡Puzzle Resuelto!</h1>
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>
            Tiempo: {formatearTiempo(segundos)}
          </p>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>
            Movimientos: {movimientos}
          </p>
        </div>
        <div style={{ 
          fontSize: "3rem", 
          color: "#4CAF50", 
          fontWeight: "bold",
          marginTop: 20 
        }}>
          {puntuacion} puntos
        </div>
        <div style={{ display: "flex", gap: 15, justifyContent: "center", marginTop: 30 }}>
          <button
            className="auth-button"
            style={{ background: "#4CAF50" }}
            onClick={iniciarJuego}
          >
            🔄 Jugar de nuevo
          </button>
          <button
            className="auth-button"
            style={{ background: "#2196F3" }}
            onClick={() => onFinish(puntuacion, true)}
          >
            ✅ Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 700, margin: "20px auto", padding: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: "3rem", marginBottom: 10 }}>🧩</div>
        <h1>{juego.nombre}</h1>
        <p style={{ color: "#666" }}>{juego.descripcion}</p>
      </div>

      {!juegoIniciado ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            background: "#f0f9ff", 
            padding: 30, 
            borderRadius: 12, 
            marginBottom: 30 
          }}>
            <h2>📋 Cómo jugar</h2>
            <ul style={{ 
              textAlign: "left", 
              maxWidth: 400, 
              margin: "20px auto",
              lineHeight: "2"
            }}>
              <li>🔢 Ordena los números del 1 al 8</li>
              <li>🖱️ Haz clic en las piezas junto al espacio vacío</li>
              <li>🎯 El objetivo es ordenarlos en secuencia</li>
              <li>⏱️ Hazlo en el menor tiempo posible</li>
            </ul>
          </div>
          <button
            className="auth-button"
            style={{ 
              fontSize: "1.2rem", 
              padding: "15px 40px",
              background: "#4CAF50"
            }}
            onClick={iniciarJuego}
          >
            ▶️ Comenzar Juego
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-around", 
            marginBottom: 30,
            padding: 20,
            background: "#f5f5f5",
            borderRadius: 12
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>⏱️</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{formatearTiempo(segundos)}</div>
              <div style={{ color: "#666", fontSize: "0.9rem" }}>Tiempo</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>🎯</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{movimientos}</div>
              <div style={{ color: "#666", fontSize: "0.9rem" }}>Movimientos</div>
            </div>
          </div>

          {/* Grid del puzzle */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${TAMANO}, 1fr)`,
            gap: 10,
            maxWidth: 400,
            margin: "0 auto",
            aspectRatio: "1"
          }}>
            {piezas.map((numero, index) => {
              const esVacio = numero === 0;
              const vecinos = obtenerVecinos(piezas.indexOf(0));
              const estaEnPosicionCorrecta = numero === index + 1 || (numero === 0 && index === TOTAL_PIEZAS - 1);
              const esMovible = vecinos.includes(index);

              return (
                <div
                  key={index}
                  onClick={() => !esVacio && handleClick(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    fontWeight: "bold",
                    background: esVacio 
                      ? "#f5f5f5" 
                      : estaEnPosicionCorrecta 
                        ? "linear-gradient(135deg, #4CAF50, #45a049)"
                        : "linear-gradient(135deg, #2196F3, #1976D2)",
                    color: "white",
                    borderRadius: 12,
                    cursor: esVacio ? "default" : esMovible ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: esVacio ? "none" : "0 4px 8px rgba(0,0,0,0.2)",
                    userSelect: "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!esVacio && esMovible) {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!esVacio) {
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  {esVacio ? "" : numero}
                </div>
              );
            })}
          </div>

          {/* Botones */}
          <div style={{ 
            display: "flex", 
            gap: 15, 
            justifyContent: "center", 
            marginTop: 30 
          }}>
            <button
              className="auth-button"
              style={{ background: "#FF9800" }}
              onClick={iniciarJuego}
            >
              🔄 Reiniciar
            </button>
            <button
              className="auth-button"
              style={{ background: "#9e9e9e" }}
              onClick={onExit}
            >
              ⏸️ Salir
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JuegoPuzzle;