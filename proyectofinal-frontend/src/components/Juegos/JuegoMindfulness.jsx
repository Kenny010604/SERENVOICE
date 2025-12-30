// src/components/Juegos/JuegoMindfulness.jsx
import React, { useState, useEffect, useMemo } from "react";

const JuegoMindfulness = ({ juego, onFinish, onExit }) => {
  const [jardin, setJardin] = useState([]);
  const [plantaSeleccionada, setPlantaSeleccionada] = useState(null);
  const [agua, setAgua] = useState(100);
  const [sol, setSol] = useState(100);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [nivelJardin, setNivelJardin] = useState(1);

  const plantas = useMemo(() => [
    { id: "flor1", emoji: "🌸", nombre: "Flor de Cerezo", costo: { agua: 10, sol: 15 }, puntos: 10 },
    { id: "flor2", emoji: "🌺", nombre: "Hibisco", costo: { agua: 15, sol: 10 }, puntos: 15 },
    { id: "flor3", emoji: "🌻", nombre: "Girasol", costo: { agua: 20, sol: 25 }, puntos: 20 },
    { id: "flor4", emoji: "🌷", nombre: "Tulipán", costo: { agua: 12, sol: 12 }, puntos: 12 },
    { id: "arbol1", emoji: "🌳", nombre: "Árbol", costo: { agua: 30, sol: 30 }, puntos: 30 },
    { id: "arbol2", emoji: "🌲", nombre: "Pino", costo: { agua: 25, sol: 35 }, puntos: 25 },
    { id: "cactus", emoji: "🌵", nombre: "Cactus", costo: { agua: 5, sol: 40 }, puntos: 15 },
    { id: "hongo", emoji: "🍄", nombre: "Hongo Mágico", costo: { agua: 8, sol: 5 }, puntos: 8 }
  ], []);

  const _decoraciones = [
    { id: "mariposa", emoji: "🦋", nombre: "Mariposa" },
    { id: "abeja", emoji: "🐝", nombre: "Abeja" },
    { id: "piedra", emoji: "🪨", nombre: "Piedra" },
    { id: "fuente", emoji: "⛲", nombre: "Fuente" }
  ];

  useEffect(() => {
    if (juegoIniciado && tiempoInicio) {
      const timer = setInterval(() => {
        const secs = Math.floor((Date.now() - tiempoInicio) / 1000);
        setSegundos(secs);

        // Recuperar recursos cada 5 segundos
        if (secs % 5 === 0) {
          setAgua(prev => Math.min(100, prev + 5));
          setSol(prev => Math.min(100, prev + 5));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [juegoIniciado, tiempoInicio]);

  useEffect(() => {
    // Calcular nivel del jardín basado en puntos
    const puntosTotales = jardin.reduce((acc, item) => {
      const planta = plantas.find(p => p.id === item.tipo);
      return acc + (planta?.puntos || 0);
    }, 0);
    
    const nuevoNivel = Math.floor(puntosTotales / 50) + 1;
    if (nuevoNivel > nivelJardin) {
      setNivelJardin(nuevoNivel);
      mostrarMensaje(`¡Nivel ${nuevoNivel} alcanzado! 🎉`);
    }
  }, [jardin, nivelJardin, plantas]);

  const iniciarJuego = () => {
    setJuegoIniciado(true);
    setTiempoInicio(Date.now());
    setJardin([]);
    setAgua(100);
    setSol(100);
    mostrarMensaje("¡Bienvenido a tu jardín de mindfulness! 🌱");
  };

  const mostrarMensaje = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 3000);
  };

  const plantarPlanta = (planta) => {
    if (agua < planta.costo.agua || sol < planta.costo.sol) {
      mostrarMensaje("⚠️ No tienes suficientes recursos");
      return;
    }

    const nuevaPlanta = {
      id: Date.now(),
      tipo: planta.id,
      emoji: planta.emoji,
      nombre: planta.nombre,
      posX: Math.random() * 70 + 10, // 10-80%
      posY: Math.random() * 60 + 20, // 20-80%
      tamaño: 1,
      edad: 0
    };

    setJardin([...jardin, nuevaPlanta]);
    setAgua(agua - planta.costo.agua);
    setSol(sol - planta.costo.sol);
    mostrarMensaje(`${planta.emoji} ${planta.nombre} plantado!`);
  };

  const regarPlanta = (plantaId) => {
    if (agua < 5) {
      mostrarMensaje("⚠️ No tienes suficiente agua");
      return;
    }

    setJardin(jardin.map(p => 
      p.id === plantaId 
        ? { ...p, tamaño: Math.min(2, p.tamaño + 0.2), edad: p.edad + 1 }
        : p
    ));
    setAgua(agua - 5);
    mostrarMensaje("💧 Planta regada");
  };

  const eliminarPlanta = (plantaId) => {
    setJardin(jardin.filter(p => p.id !== plantaId));
    mostrarMensaje("🗑️ Planta eliminada");
  };

  const calcularPuntuacion = () => {
    const puntosPlantas = jardin.reduce((acc, item) => {
      const planta = plantas.find(p => p.id === item.tipo);
      return acc + (planta?.puntos || 0) * item.tamaño;
    }, 0);
    
    return Math.round(puntosPlantas + nivelJardin * 10);
  };

  const formatearTiempo = (segs) => {
    const mins = Math.floor(segs / 60);
    const secs = segs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!juegoIniciado) {
    return (
      <div className="card" style={{ maxWidth: 700, margin: "20px auto", padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: "4rem", marginBottom: 10 }}>🧘</div>
          <h1>{juego.nombre}</h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>{juego.descripcion}</p>
        </div>

        <div style={{ 
          background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
          padding: 40,
          borderRadius: 16,
          marginBottom: 30,
          color: "white"
        }}>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>🌱 Cultiva la Calma Interior</h2>
          <ul style={{ 
            textAlign: "left", 
            maxWidth: 500, 
            margin: "0 auto",
            lineHeight: "2",
            fontSize: "1.1rem"
          }}>
            <li>🌸 Planta flores y árboles en tu jardín virtual</li>
            <li>💧 Riega tus plantas con atención plena</li>
            <li>☀️ Observa cómo crecen con el tiempo</li>
            <li>🦋 Descubre decoraciones especiales</li>
            <li>😌 Relájate mientras cuidas tu jardín</li>
          </ul>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            className="auth-button"
            style={{ 
              fontSize: "1.2rem", 
              padding: "15px 50px",
              background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
              marginBottom: 15
            }}
            onClick={iniciarJuego}
          >
            🌱 Crear Mi Jardín
          </button>
          <br />
          <button className="auth-button" style={{ background: "#9e9e9e" }} onClick={onExit}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 1200, margin: "20px auto", padding: 30 }}>
      {/* Header con estadísticas */}
      <div style={{ 
        background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        color: "white"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>Mi Jardín Zen</h2>
            <p style={{ margin: "5px 0 0 0" }}>Nivel {nivelJardin} • ⏱️ {formatearTiempo(segundos)}</p>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>💧</div>
              <div style={{ fontWeight: "bold" }}>{agua}%</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>☀️</div>
              <div style={{ fontWeight: "bold" }}>{sol}%</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>🌱</div>
              <div style={{ fontWeight: "bold" }}>{jardin.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje flotante */}
      {mensaje && (
        <div style={{
          position: "fixed",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "15px 30px",
          borderRadius: 30,
          fontSize: "1.1rem",
          zIndex: 1000,
          animation: "fadeIn 0.3s"
        }}>
          {mensaje}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* Área del jardín */}
        <div>
          <div style={{
            background: "linear-gradient(to bottom, #87CEEB 0%, #98D8C8 100%)",
            borderRadius: 16,
            height: 500,
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 -20px 40px rgba(0,0,0,0.1)"
          }}>
            {/* Suelo */}
            <div style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "40%",
              background: "linear-gradient(to bottom, #8B7355 0%, #654321 100%)",
              borderRadius: "50% 50% 0 0"
            }} />

            {/* Césped */}
            <div style={{
              position: "absolute",
              bottom: "30%",
              width: "100%",
              height: "15%",
              background: "#7CB342",
              opacity: 0.8
            }} />

            {/* Plantas plantadas */}
            {jardin.map((planta) => (
              <div
                key={planta.id}
                onClick={() => setPlantaSeleccionada(planta)}
                style={{
                  position: "absolute",
                  left: `${planta.posX}%`,
                  top: `${planta.posY}%`,
                  fontSize: `${2 + planta.tamaño * 2}rem`,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  transform: plantaSeleccionada?.id === planta.id ? "scale(1.2)" : "scale(1)",
                  filter: plantaSeleccionada?.id === planta.id ? "drop-shadow(0 0 10px yellow)" : "none",
                  animation: "sway 3s infinite ease-in-out"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = plantaSeleccionada?.id === planta.id ? "scale(1.2)" : "scale(1)"}
              >
                {planta.emoji}
              </div>
            ))}

            {/* Decoraciones fijas */}
            <div style={{ position: "absolute", bottom: "35%", left: "10%", fontSize: "2rem" }}>☁️</div>
            <div style={{ position: "absolute", bottom: "40%", right: "15%", fontSize: "2rem" }}>☁️</div>
            <div style={{ position: "absolute", top: "10%", right: "10%", fontSize: "3rem" }}>☀️</div>
          </div>

          {/* Panel de planta seleccionada */}
          {plantaSeleccionada && (
            <div style={{
              marginTop: 15,
              padding: 15,
              background: "#f5f5f5",
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "2rem", marginRight: 10 }}>{plantaSeleccionada.emoji}</span>
                <strong>{plantaSeleccionada.nombre}</strong>
                <span style={{ marginLeft: 10, color: "#666" }}>
                  Tamaño: {plantaSeleccionada.tamaño.toFixed(1)}x
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="auth-button"
                  style={{ background: "#2196F3", padding: "8px 20px" }}
                  onClick={() => regarPlanta(plantaSeleccionada.id)}
                >
                  💧 Regar
                </button>
                <button
                  className="auth-button"
                  style={{ background: "#f44336", padding: "8px 20px" }}
                  onClick={() => {
                    eliminarPlanta(plantaSeleccionada.id);
                    setPlantaSeleccionada(null);
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral - Plantar */}
        <div>
          <h3 style={{ marginBottom: 15 }}>🌱 Plantas Disponibles</h3>
          <div style={{
            maxHeight: 400,
            overflowY: "auto",
            padding: 10,
            background: "#f9f9f9",
            borderRadius: 12
          }}>
            {plantas.map((planta) => {
              const puedeComprarse = agua >= planta.costo.agua && sol >= planta.costo.sol;
              
              return (
                <div
                  key={planta.id}
                  onClick={() => puedeComprarse && plantarPlanta(planta)}
                  style={{
                    padding: 12,
                    marginBottom: 10,
                    background: puedeComprarse ? "white" : "#e0e0e0",
                    borderRadius: 8,
                    cursor: puedeComprarse ? "pointer" : "not-allowed",
                    border: "2px solid " + (puedeComprarse ? "#4CAF50" : "#ccc"),
                    transition: "all 0.2s",
                    opacity: puedeComprarse ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (puedeComprarse) {
                      e.currentTarget.style.transform = "translateX(5px)";
                      e.currentTarget.style.borderColor = "#2196F3";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.borderColor = puedeComprarse ? "#4CAF50" : "#ccc";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "2rem" }}>{planta.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{planta.nombre}</div>
                      <div style={{ fontSize: "0.75rem", color: "#666" }}>
                        💧 {planta.costo.agua} • ☀️ {planta.costo.sol}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="auth-button"
              style={{ background: "#4CAF50", width: "100%" }}
              onClick={() => onFinish(calcularPuntuacion(), jardin.length > 5)}
            >
              ✅ Guardar Jardín ({calcularPuntuacion()} pts)
            </button>
            <button
              className="auth-button"
              style={{ background: "#9e9e9e", width: "100%" }}
              onClick={onExit}
            >
              ⏸️ Salir
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default JuegoMindfulness;