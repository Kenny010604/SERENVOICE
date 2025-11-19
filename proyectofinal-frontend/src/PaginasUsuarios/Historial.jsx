import React, { useState, useEffect, useRef } from "react";
import NavbarUsuario from "../components/NavbarUsuario";
import "../global.css";
import { FaHistory, FaPlay, FaDownload } from "react-icons/fa";

const sampleHistory = [
  {
    id: 1,
    fecha: "2025-11-15",
    duracion: "00:45",
    resultado: "Calma",
    score: 8,
  },
  {
    id: 2,
    fecha: "2025-11-10",
    duracion: "01:10",
    resultado: "Estrés leve",
    score: 5,
  },
];

const Historial = () => {
  const [history] = useState(sampleHistory);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);

  return (
    <>
      <NavbarUsuario />
      <main className="container" style={{ paddingBottom: "100px" }}>
        <div
          ref={cardRef}
          className="card reveal"
          data-revealdelay="60"
          style={{ maxWidth: "1000px" }}
        >
          <h2>
            <FaHistory /> Historial de Análisis
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Revisa tus análisis previos y descarga resultados.
          </p>

          <div style={{ marginTop: "1rem" }}>
            {history.length === 0 ? (
              <p>No hay análisis registrados.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="card"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div>
                      <strong>{h.fecha}</strong>
                      <div style={{ color: "var(--color-text-secondary)" }}>
                        {h.duracion} — Resultado: {h.resultado} — Score:{" "}
                        {h.score}/10
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button>
                        <FaPlay /> Reproducir
                      </button>
                      <button>
                        <FaDownload /> Descargar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Historial;
