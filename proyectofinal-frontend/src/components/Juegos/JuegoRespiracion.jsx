// src/components/Juegos/JuegoRespiracion.jsx
import React, { useState, useEffect } from "react";

const JuegoRespiracion = ({ juego, onFinish, onExit }) => {
  const [fase, setFase] = useState("preparacion"); // preparacion, inhalar, mantener, exhalar, completado
  const [ciclo, setCiclo] = useState(0);
  const [segundos, setSegundos] = useState(4);
  const [iniciado, setIniciado] = useState(false);

  const CICLOS_TOTALES = 5;
  const TIEMPO_INHALAR = 4;
  const TIEMPO_MANTENER = 4;
  const TIEMPO_EXHALAR = 6;

  useEffect(() => {
    if (!iniciado || fase === "preparacion" || fase === "completado") return;

    if (segundos > 0) {
      const timer = setTimeout(() => setSegundos(segundos - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Cambiar de fase cuando termina el contador
    if (segundos === 0) {
      if (fase === "inhalar") {
        setFase("mantener");
        setSegundos(TIEMPO_MANTENER);
      } else if (fase === "mantener") {
        setFase("exhalar");
        setSegundos(TIEMPO_EXHALAR);
      } else if (fase === "exhalar") {
        if (ciclo + 1 >= CICLOS_TOTALES) {
          setFase("completado");
        } else {
          setCiclo(ciclo + 1);
          setFase("inhalar");
          setSegundos(TIEMPO_INHALAR);
        }
      }
    }
  }, [segundos, iniciado, fase, ciclo]);

  const iniciarEjercicio = () => {
    setIniciado(true);
    setFase("inhalar");
    setCiclo(0);
    setSegundos(TIEMPO_INHALAR);
  };

  const getFaseTexto = () => {
    switch (fase) {
      case "inhalar":
        return "Inhala profundamente";
      case "mantener":
        return "Mantén el aire";
      case "exhalar":
        return "Exhala lentamente";
      default:
        return "";
    }
  };

  const getFaseColor = () => {
    switch (fase) {
      case "inhalar":
        return "#4CAF50";
      case "mantener":
        return "#2196F3";
      case "exhalar":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  const getCirculoSize = () => {
    if (fase === "inhalar") {
      return 100 + (TIEMPO_INHALAR - segundos) * 30;
    } else if (fase === "exhalar") {
      return 220 - (TIEMPO_EXHALAR - segundos) * 20;
    }
    return 220;
  };

  if (fase === "completado") {
    return (
      <div className="card" style={{ maxWidth: 600, margin: "50px auto", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: "5rem", marginBottom: 20 }}>✅</div>
        <h1>¡Ejercicio Completado!</h1>
        <p style={{ fontSize: "1.2rem", color: "#666", marginTop: 20 }}>
          Has completado {CICLOS_TOTALES} ciclos de respiración consciente.
        </p>
        <p style={{ marginTop: 20 }}>
          ¿Cómo te sientes ahora?
        </p>
        <div style={{ display: "flex", gap: 15, justifyContent: "center", marginTop: 30 }}>
          <button
            className="auth-button"
            style={{ background: "#4CAF50" }}
            onClick={() => onFinish(100, true)}
          >
            😊 Mejor
          </button>
          <button
            className="auth-button"
            style={{ background: "#2196F3" }}
            onClick={() => onFinish(50, true)}
          >
            😐 Igual
          </button>
          <button
            className="auth-button"
            style={{ background: "#FF9800" }}
            onClick={() => onFinish(0, true)}
          >
            😔 No ayudó
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 700, margin: "20px auto", padding: 40 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: "3rem", marginBottom: 10 }}>🫁</div>
        <h1>{juego.nombre}</h1>
        <p style={{ color: "#666" }}>{juego.descripcion}</p>
      </div>

      {!iniciado ? (
        // Pantalla de preparación
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            background: "#f0f9ff", 
            padding: 30, 
            borderRadius: 12, 
            marginBottom: 30 
          }}>
            <h2>📋 Instrucciones</h2>
            <ul style={{ 
              textAlign: "left", 
              maxWidth: 400, 
              margin: "20px auto",
              lineHeight: "2"
            }}>
              <li>🟢 Inhala profundamente por {TIEMPO_INHALAR} segundos</li>
              <li>🔵 Mantén el aire por {TIEMPO_MANTENER} segundos</li>
              <li>🟠 Exhala lentamente por {TIEMPO_EXHALAR} segundos</li>
              <li>🔄 Repite {CICLOS_TOTALES} ciclos completos</li>
            </ul>
          </div>
          <button
            className="auth-button"
            style={{ 
              fontSize: "1.2rem", 
              padding: "15px 40px",
              background: "#4CAF50"
            }}
            onClick={iniciarEjercicio}
          >
            ▶️ Comenzar Ejercicio
          </button>
        </div>
      ) : (
        // Ejercicio activo
        <div style={{ textAlign: "center" }}>
          {/* Indicador de progreso */}
          <div style={{ marginBottom: 30 }}>
            <p style={{ fontSize: "1.1rem", color: "#666" }}>
              Ciclo {ciclo + 1} de {CICLOS_TOTALES}
            </p>
            <div style={{ 
              width: "100%", 
              height: 8, 
              background: "#e0e0e0", 
              borderRadius: 10,
              overflow: "hidden",
              marginTop: 10
            }}>
              <div style={{
                width: `${((ciclo + 1) / CICLOS_TOTALES) * 100}%`,
                height: "100%",
                background: "#4CAF50",
                transition: "width 0.3s"
              }} />
            </div>
          </div>

          {/* Círculo de respiración */}
          <div style={{
            width: 300,
            height: 300,
            margin: "30px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}>
            <div
              style={{
                width: getCirculoSize(),
                height: getCirculoSize(),
                borderRadius: "50%",
                background: `radial-gradient(circle, ${getFaseColor()}40, ${getFaseColor()}80)`,
                transition: "all 1s ease-in-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 40px ${getFaseColor()}60`
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  fontSize: "4rem", 
                  fontWeight: "bold",
                  color: getFaseColor()
                }}>
                  {segundos}
                </div>
                <div style={{ 
                  fontSize: "1.3rem", 
                  fontWeight: "600",
                  color: getFaseColor(),
                  marginTop: 10
                }}>
                  {getFaseTexto()}
                </div>
              </div>
            </div>
          </div>

          {/* Botón de salir */}
          <button
            className="auth-button"
            style={{ background: "#9e9e9e", marginTop: 20 }}
            onClick={onExit}
          >
            ⏸️ Salir
          </button>
        </div>
      )}
    </div>
  );
};

export default JuegoRespiracion;