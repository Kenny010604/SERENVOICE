import React, { useState, useEffect, useRef } from "react";
import NavbarAdministrador from "../components/NavbarAdministrador";
import "../global.css";
import { FaUser, FaCheck, FaBell } from "react-icons/fa";

const sampleAlerts = [
  {
    id: 101,
    usuario: "Juan García",
    tipo: "estres_critico",
    severidad: "Crítica",
    fecha: "2025-11-15",
    asignado: null,
  },
  {
    id: 102,
    usuario: "María Pérez",
    tipo: "ansiedad_critica",
    severidad: "Alta",
    fecha: "2025-11-14",
    asignado: 5,
  },
];

const Alertas = () => {
  const [alerts, setAlerts] = useState(sampleAlerts);
  const [msg, setMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);

  const assignToMe = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, asignado: "Yo" } : a))
    );
    setMsg("Alerta asignada a ti (simulado)");
  };

  const resolve = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setMsg("Alerta marcada como resuelta (simulado)");
  };

  return (
    <>
      <NavbarAdministrador />
      <main className="container" style={{ paddingBottom: "100px" }}>
        <div
          ref={cardRef}
          className="card reveal"
          data-revealdelay="60"
          style={{ maxWidth: "1200px" }}
        >
          <h2>
            <FaBell /> Gestión de Alertas
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Lista de alertas críticas y acciones rápidas.
          </p>

          {msg && (
            <div className="success-message" style={{ marginTop: "0.75rem" }}>
              {msg}
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            {alerts.length === 0 ? (
              <p>No hay alertas pendientes.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {alerts.map((a) => (
                  <li
                    key={a.id}
                    className="card"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div>
                      <strong>{a.usuario}</strong>
                      <div style={{ color: "var(--color-text-secondary)" }}>
                        {a.tipo} — {a.severidad} — {a.fecha}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => assignToMe(a.id)}>
                        Asignar a mí
                      </button>
                      <button
                        onClick={() => resolve(a.id)}
                        style={{ background: "#4caf50", color: "#fff" }}
                      >
                        <FaCheck /> Resolver
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

export default Alertas;
