import React, { useState, useEffect, useRef } from "react";
import NavbarUsuario from "../../components/NavbarUsuario";
import "../../global.css";
import { FaHeart, FaCheck } from "react-icons/fa";

const sampleRecs = [
  {
    id: 1,
    titulo: "Ejercicio de respiración",
    tipo: "respiracion",
    texto: "Respira 4 segundos, retén 4, exhala 6. Repetir 5 veces.",
    aplicado: false,
  },
  {
    id: 2,
    titulo: "Pausa activa 5 min",
    tipo: "pausa",
    texto: "Levántate, estira hombros y cuello durante 5 minutos.",
    aplicado: true,
  },
];

const Recomendaciones = () => {
  const [recs, setRecs] = useState(sampleRecs);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);

  const markApplied = (id) => {
    setRecs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, aplicado: true } : r))
    );
  };

  return (
    <>
      <NavbarUsuario />
      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div
          ref={cardRef}
          className="card reveal"
          data-revealdelay="60"
          style={{ maxWidth: "1000px" }}
        >
          <h2>
            <FaHeart /> Recomendaciones
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Sigue las recomendaciones personalizadas generadas por el sistema.
          </p>

          <div style={{ marginTop: "1rem" }}>
            {recs.map((r) => (
              <div
                key={r.id}
                className="card"
                style={{ marginBottom: "0.75rem" }}
              >
                <h4 style={{ margin: 0 }}>{r.titulo}</h4>
                <p
                  style={{
                    marginTop: "0.25rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {r.texto}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    disabled={r.aplicado}
                    onClick={() => markApplied(r.id)}
                  >
                    {r.aplicado ? "Aplicada" : "Marcar como aplicada"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Recomendaciones;
