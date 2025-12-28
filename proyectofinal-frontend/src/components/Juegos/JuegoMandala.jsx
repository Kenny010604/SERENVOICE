// src/components/Juegos/JuegoMandala.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";

const JuegoMandala = ({ juego, onFinish, onExit }) => {
  const canvasRef = useRef(null);
  const [colorActual, setColorActual] = useState("#FF6B9D");
  const [dibujando, setDibujando] = useState(false);
  const [grosorLinea, setGrosorLinea] = useState(3);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [mandalaSeleccionado, setMandalaSeleccionado] = useState(null);
  const [porcentajeCompletado, setPorcentajeCompletado] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const paleta = [
    "#FF6B9D", "#C44569", "#F8B500", "#FFA801",
    "#4ECDC4", "#44A08D", "#6C5CE7", "#A29BFE",
    "#00B894", "#00D2D3", "#FD79A8", "#FDCB6E",
    "#74B9FF", "#A29BFE", "#FF7675", "#FFFFFF"
  ];

  const mandalas = [
    {
      id: 1,
      nombre: "Flor de Loto",
      svg: `M250,250 m-150,0 a150,150 0 1,0 300,0 a150,150 0 1,0 -300,0
            M250,250 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0
            M250,250 m-50,0 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0
            M250,100 Q250,150 200,200 Q150,250 100,250 Q150,250 200,300 Q250,350 250,400 Q250,350 300,300 Q350,250 400,250 Q350,250 300,200 Q250,150 250,100`
    },
    {
      id: 2,
      nombre: "Estrella Sagrada",
      svg: `M250,250 L250,100 L280,180 L360,180 L300,230 L320,310 L250,260 L180,310 L200,230 L140,180 L220,180 Z
            M250,250 m-120,0 a120,120 0 1,0 240,0 a120,120 0 1,0 -240,0
            M250,250 m-80,0 a80,80 0 1,0 160,0 a80,80 0 1,0 -160,0`
    },
    {
      id: 3,
      nombre: "Círculos Zen",
      svg: `M250,250 m-180,0 a180,180 0 1,0 360,0 a180,180 0 1,0 -360,0
            M250,250 m-140,0 a140,140 0 1,0 280,0 a140,140 0 1,0 -280,0
            M250,250 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0
            M250,250 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0
            M250,250 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0`
    }
  ];

  useEffect(() => {
    if (juegoIniciado && tiempoInicio) {
      const timer = setInterval(() => {
        setSegundos(Math.floor((Date.now() - tiempoInicio) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [juegoIniciado, tiempoInicio]);

  useEffect(() => {
    if (canvasRef.current) {
      dibujarMandala();
    }
  }, [dibujarMandala]);

  const iniciarJuego = (mandala) => {
    setMandalaSeleccionado(mandala);
    setJuegoIniciado(true);
    setTiempoInicio(Date.now());
    setPorcentajeCompletado(0);
  };

  const dibujarMandala = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mandalaSeleccionado) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo blanco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar el mandala con líneas grises suaves
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const path = new Path2D(mandalaSeleccionado.svg);
    ctx.stroke(path);
  }, [mandalaSeleccionado]);

  const obtenerPosicionMouse = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const obtenerPosicionTouch = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  const iniciarDibujo = (e) => {
    e.preventDefault();
    setDibujando(true);
    const pos = e.touches ? obtenerPosicionTouch(e) : obtenerPosicionMouse(e);
    
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const dibujar = (e) => {
    if (!dibujando) return;
    e.preventDefault();

    const pos = e.touches ? obtenerPosicionTouch(e) : obtenerPosicionMouse(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.strokeStyle = colorActual;
    ctx.lineWidth = grosorLinea;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Calcular porcentaje aproximado
    calcularProgreso();
  };

  const terminarDibujo = () => {
    setDibujando(false);
  };

  const calcularProgreso = () => {
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const data = imageData.data;

    let pixelesColoreados = 0;
    let totalPixeles = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Contar solo píxeles que no son blancos
      if (a > 0 && !(r > 250 && g > 250 && b > 250)) {
        pixelesColoreados++;
      }
      totalPixeles++;
    }

    const porcentaje = Math.min(100, (pixelesColoreados / totalPixeles) * 100 * 20);
    setPorcentajeCompletado(Math.round(porcentaje));
  };

  const limpiarCanvas = () => {
    if (window.confirm("¿Quieres borrar todo y empezar de nuevo?")) {
      dibujarMandala();
      setPorcentajeCompletado(0);
    }
  };

  const finalizarJuego = () => {
    const puntuacion = Math.min(100, porcentajeCompletado + (segundos < 300 ? 20 : 0));
    onFinish(puntuacion, porcentajeCompletado > 50);
  };

  const formatearTiempo = (segs) => {
    const mins = Math.floor(segs / 60);
    const secs = segs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!juegoIniciado) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: "20px auto", padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: "4rem", marginBottom: 10 }}>🎨</div>
          <h1>{juego.nombre}</h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>{juego.descripcion}</p>
        </div>

        <div style={{ 
          background: "#f0f9ff", 
          padding: 30, 
          borderRadius: 12, 
          marginBottom: 30 
        }}>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>📋 Beneficios del Mandala</h2>
          <ul style={{ 
            textAlign: "left", 
            maxWidth: 500, 
            margin: "0 auto",
            lineHeight: "2"
          }}>
            <li>🧘 Reduce el estrés y la ansiedad</li>
            <li>🎨 Estimula la creatividad</li>
            <li>💭 Mejora la concentración</li>
            <li>😌 Promueve la relajación profunda</li>
          </ul>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Elige tu Mandala</h2>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 20,
          marginBottom: 30
        }}>
          {mandalas.map((mandala) => (
            <div
              key={mandala.id}
              onClick={() => iniciarJuego(mandala)}
              style={{
                border: "3px solid #E0E0E0",
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                background: "white"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = "#4ECDC4";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(78, 205, 196, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#E0E0E0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg width="150" height="150" viewBox="0 0 500 500">
                <path d={mandala.svg} fill="none" stroke="#E0E0E0" strokeWidth="3" />
              </svg>
              <h3 style={{ marginTop: 15, color: "#333" }}>{mandala.nombre}</h3>
              <button
                className="auth-button"
                style={{ 
                  width: "100%", 
                  marginTop: 10,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  iniciarJuego(mandala);
                }}
              >
                Colorear
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="auth-button" style={{ background: "#9e9e9e" }} onClick={onExit}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 1200, margin: "20px auto", padding: 30 }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 350px", 
        gap: 30,
        alignItems: "start"
      }}>
        {/* Canvas de dibujo */}
        <div>
          <div style={{ 
            border: "4px solid #E0E0E0", 
            borderRadius: 16, 
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            background: "white"
          }}>
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              onMouseDown={iniciarDibujo}
              onMouseMove={dibujar}
              onMouseUp={terminarDibujo}
              onMouseLeave={terminarDibujo}
              onTouchStart={iniciarDibujo}
              onTouchMove={dibujar}
              onTouchEnd={terminarDibujo}
              style={{ 
                display: "block",
                width: "100%",
                height: "auto",
                cursor: "crosshair",
                touchAction: "none"
              }}
            />
          </div>
        </div>

        {/* Panel de controles */}
        <div>
          <div style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20
          }}>
            <h2 style={{ margin: 0, marginBottom: 10 }}>{mandalaSeleccionado.nombre}</h2>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span>⏱️ {formatearTiempo(segundos)}</span>
              <span>🎨 {porcentajeCompletado}% completado</span>
            </div>
            <div style={{ 
              width: "100%", 
              height: 8, 
              background: "rgba(255,255,255,0.3)", 
              borderRadius: 10,
              overflow: "hidden",
              marginTop: 10
            }}>
              <div style={{
                width: `${porcentajeCompletado}%`,
                height: "100%",
                background: "white",
                transition: "width 0.3s"
              }} />
            </div>
          </div>

          {/* Paleta de colores */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 15 }}>🎨 Colores</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(4, 1fr)", 
              gap: 10 
            }}>
              {paleta.map((color) => (
                <div
                  key={color}
                  onClick={() => setColorActual(color)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: color,
                    border: colorActual === color ? "4px solid #333" : "2px solid #ddd",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: colorActual === color ? "0 4px 12px rgba(0,0,0,0.3)" : "none"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Grosor del pincel */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 15 }}>✏️ Grosor del Pincel</h3>
            <input
              type="range"
              min="1"
              max="10"
              value={grosorLinea}
              onChange={(e) => setGrosorLinea(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ textAlign: "center", marginTop: 5, color: "#666" }}>
              {grosorLinea}px
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="auth-button"
              style={{ 
                background: "#4CAF50",
                width: "100%"
              }}
              onClick={finalizarJuego}
            >
              ✅ Guardar y Finalizar
            </button>
            <button
              className="auth-button"
              style={{ 
                background: "#FF9800",
                width: "100%"
              }}
              onClick={limpiarCanvas}
            >
              🔄 Limpiar
            </button>
            <button
              className="auth-button"
              style={{ 
                background: "#9e9e9e",
                width: "100%"
              }}
              onClick={onExit}
            >
              ⏸️ Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuegoMandala;