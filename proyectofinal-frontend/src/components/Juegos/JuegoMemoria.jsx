// src/components/Juegos/JuegoMemoria.jsx
import React, { useState, useEffect } from "react";

const JuegoMemoria = ({ juego, onFinish, onExit }) => {
  const [cartas, setCartas] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [cartasEmparejadas, setCartasEmparejadas] = useState([]);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [juegoCompletado, setJuegoCompletado] = useState(false);

  const emojis = ["😊", "❤️", "🌟", "🌈", "🦋", "🌸", "🎵", "☀️"];

  useEffect(() => {
    if (juegoIniciado && cartasEmparejadas.length === cartas.length && cartas.length > 0) {
      setJuegoCompletado(true);
    }
  }, [juegoIniciado, cartasEmparejadas, cartas]);

  const iniciarJuego = () => {
    // Crear pares de cartas
    const paresCartas = emojis.flatMap((emoji, index) => [
      { id: index * 2, emoji, emparejada: false },
      { id: index * 2 + 1, emoji, emparejada: false }
    ]);

    // Mezclar cartas
    const cartasMezcladas = paresCartas.sort(() => Math.random() - 0.5);
    setCartas(cartasMezcladas);
    setCartasVolteadas([]);
    setCartasEmparejadas([]);
    setMovimientos(0);
    setJuegoIniciado(true);
    setJuegoCompletado(false);
  };

  const voltearCarta = (id) => {
    // No permitir voltear más de 2 cartas o cartas ya emparejadas
    if (cartasVolteadas.length === 2 || cartasEmparejadas.includes(id)) return;
    if (cartasVolteadas.includes(id)) return;

    const nuevasVolteadas = [...cartasVolteadas, id];
    setCartasVolteadas(nuevasVolteadas);

    if (nuevasVolteadas.length === 2) {
      setMovimientos(movimientos + 1);

      const [id1, id2] = nuevasVolteadas;
      const carta1 = cartas.find(c => c.id === id1);
      const carta2 = cartas.find(c => c.id === id2);

      if (carta1.emoji === carta2.emoji) {
        // Emparejadas!
        setTimeout(() => {
          setCartasEmparejadas([...cartasEmparejadas, id1, id2]);
          setCartasVolteadas([]);
        }, 500);
      } else {
        // No coinciden
        setTimeout(() => {
          setCartasVolteadas([]);
        }, 1000);
      }
    }
  };

  const calcularPuntuacion = () => {
    const movimientosOptimos = cartas.length / 2;
    const puntuacion = Math.max(0, 100 - (movimientos - movimientosOptimos) * 5);
    return Math.round(puntuacion);
  };

  if (juegoCompletado) {
    const puntuacion = calcularPuntuacion();

    return (
      <div className="card" style={{ maxWidth: 600, margin: "50px auto", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: "5rem", marginBottom: 20 }}>🎉</div>
        <h1>¡Felicitaciones!</h1>
        <p style={{ fontSize: "1.2rem", color: "#666", marginTop: 20 }}>
          Completaste el juego en {movimientos} movimientos
        </p>
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
    <div className="card" style={{ maxWidth: 900, margin: "20px auto", padding: 40 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: "3rem", marginBottom: 10 }}>🧠</div>
        <h1>{juego.nombre}</h1>
        <p style={{ color: "#666" }}>{juego.descripcion}</p>
      </div>

      {!juegoIniciado ? (
        // Pantalla inicial
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
              <li>🃏 Voltea dos cartas en cada turno</li>
              <li>🎯 Encuentra todos los pares de emojis</li>
              <li>🧠 Usa tu memoria para recordar las posiciones</li>
              <li>⭐ Menos movimientos = Más puntos</li>
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
          {/* Panel de información */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-around", 
            marginBottom: 30,
            padding: 20,
            background: "#f5f5f5",
            borderRadius: 12
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>🎯</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{movimientos}</div>
              <div style={{ color: "#666", fontSize: "0.9rem" }}>Movimientos</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>✅</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {cartasEmparejadas.length / 2}/{cartas.length / 2}
              </div>
              <div style={{ color: "#666", fontSize: "0.9rem" }}>Pares encontrados</div>
            </div>
          </div>

          {/* Grid de cartas */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 15,
            maxWidth: 600,
            margin: "0 auto"
          }}>
            {cartas.map((carta) => {
              const volteada = cartasVolteadas.includes(carta.id) || cartasEmparejadas.includes(carta.id);
              const emparejada = cartasEmparejadas.includes(carta.id);

              return (
                <div
                  key={carta.id}
                  onClick={() => !volteada && voltearCarta(carta.id)}
                  style={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    background: volteada 
                      ? (emparejada ? "#4CAF50" : "#2196F3")
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 12,
                    cursor: volteada ? "default" : "pointer",
                    transition: "all 0.3s",
                    transform: volteada ? "rotateY(0)" : "rotateY(180deg)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    opacity: emparejada ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!volteada) {
                      e.currentTarget.style.transform = "rotateY(180deg) scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!volteada) {
                      e.currentTarget.style.transform = "rotateY(180deg) scale(1)";
                    }
                  }}
                >
                  {volteada ? carta.emoji : "?"}
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

export default JuegoMemoria;