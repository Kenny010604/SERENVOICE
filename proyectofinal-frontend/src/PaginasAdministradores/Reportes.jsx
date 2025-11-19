import React, { useState, useEffect, useRef } from "react";
import NavbarAdministrador from "../components/NavbarAdministrador";
import "../global.css";
import { FaFilePdf, FaFilter } from "react-icons/fa";

const Reportes = () => {
  const [filters, setFilters] = useState({ tipo: "individual", desde: "", hasta: "" });
  const [msg, setMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll('.reveal');
    els.forEach((el) => el.classList.add('reveal-visible'));
    if (cardRef.current.classList.contains('reveal')) cardRef.current.classList.add('reveal-visible');
  }, []);

  const generate = () => {
    // Generar reporte inmediatamente (simulado)
    setMsg("Reporte generado (simulado): report.csv");
  };

  return (
    <>
      <NavbarAdministrador />
      <main className="container" style={{ paddingBottom: "100px" }}>
        <div ref={cardRef} className="card reveal" data-revealdelay="60" style={{ maxWidth: "1000px" }}>
          <h2><FaFilePdf /> Reportes y Análisis</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>Filtra y genera reportes del sistema.</p>

          <div style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label>Tipo</label>
              <select value={filters.tipo} onChange={(e) => setFilters({...filters, tipo: e.target.value})}>
                <option value="individual">Individual</option>
                <option value="comparativo">Comparativo</option>
                <option value="historico">Histórico</option>
                <option value="global">Global</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
              <div className="form-group">
                <label>Desde</label>
                <input type="date" value={filters.desde} onChange={(e) => setFilters({...filters, desde: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Hasta</label>
                <input type="date" value={filters.hasta} onChange={(e) => setFilters({...filters, hasta: e.target.value})} />
              </div>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
              <button onClick={generate}><FaFilter /> Generar</button>
            </div>

            {msg && <div style={{ marginTop: "1rem" }} className="success-message">{msg}</div>}
          </div>
        </div>
      </main>
    </>
  );
};

export default Reportes;
