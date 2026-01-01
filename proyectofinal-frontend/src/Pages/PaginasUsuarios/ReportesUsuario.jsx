import React, { useState, useEffect, useRef } from "react";
import "../../global.css";
import PageCard from "../../components/Shared/PageCard";
import { FaFileDownload, FaCalendarAlt } from "react-icons/fa";

const ReportesUsuario = () => {
  const [range, setRange] = useState({ desde: "", hasta: "" });
  const [msg, setMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);

  const generate = () => {
    // Generate report immediately (simulado)
    setMsg("Reporte listo: reporte_usuario.csv (simulado)");
  };

  return (
    <div className="reportes-usuario-content page-content">
        <PageCard
          ref={cardRef}
          size="xl"
          className="reveal"
          data-revealdelay="60"
        >
          <h2>
            <FaFileDownload /> Mis Reportes
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Genera y descarga reportes personales de tus análisis.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <div className="form-group">
              <label>Desde</label>
              <input
                type="date"
                value={range.desde}
                onChange={(e) => setRange({ ...range, desde: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Hasta</label>
              <input
                type="date"
                value={range.hasta}
                onChange={(e) => setRange({ ...range, hasta: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={generate}>
              <FaCalendarAlt /> Generar Reporte
            </button>
            {msg && (
              <div style={{ marginTop: "0.75rem" }} className="success-message">
                {msg}
              </div>
            )}
          </div>
        </PageCard>
    </div>
  );
};

export default ReportesUsuario;
