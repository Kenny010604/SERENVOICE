import React, { useState, useEffect, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import apiClient from "../../services/apiClient";
import { FaLightbulb, FaFilter, FaChartPie, FaDownload, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../../global.css";

const Recomendaciones = () => {
  const { isDark } = useContext(ThemeContext);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [filteredRecs, setFilteredRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState({ tipo: "todos", prioridad: "todas", aplicada: "todas" });
  const [stats, setStats] = useState({});

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    try {
      const [recsRes, statsRes] = await Promise.all([
        apiClient.get("/recomendaciones/todas"),
        apiClient.get("/recomendaciones/estadisticas")
      ]);
      setRecomendaciones(recsRes.data?.data || []);
      setFilteredRecs(recsRes.data?.data || []);
      setStats(statsRes.data?.data || {});
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error);
      setMsg("Error al cargar recomendaciones");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...recomendaciones];

    if (filter.tipo !== "todos") {
      filtered = filtered.filter(r => r.tipo_recomendacion === filter.tipo);
    }

    if (filter.prioridad !== "todas") {
      filtered = filtered.filter(r => r.prioridad === filter.prioridad);
    }

    if (filter.aplicada === "si") {
      filtered = filtered.filter(r => r.aplica);
    } else if (filter.aplicada === "no") {
      filtered = filtered.filter(r => !r.aplica);
    }

    setFilteredRecs(filtered);
  }, [filter, recomendaciones]);

  const exportRecomendaciones = () => {
    const csv = [
      ["ID", "Usuario", "Tipo", "Prioridad", "Contenido", "Aplicada", "Útil", "Fecha"].join(","),
      ...filteredRecs.map(r =>
        [
          r.id_recomendacion,
          r.usuario || "N/A",
          r.tipo_recomendacion,
          r.prioridad,
          r.contenido?.replace(/,/g, ";") || "",
          r.aplica ? "Sí" : "No",
          r.util !== null ? (r.util ? "Sí" : "No") : "N/A",
          r.fecha_generacion
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recomendaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setMsg("Recomendaciones exportadas correctamente");
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baja': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'respiracion': return '🫁';
      case 'ejercicio': return '🏃';
      case 'meditacion': return '🧘';
      case 'profesional': return '👨‍⚕️';
      default: return '💡';
    }
  };

  return (
    <>
      <NavbarAdministrador />
      <main
        className="container"
        style={{
          paddingTop: "2rem",
          paddingBottom: "100px",
          backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="card reveal" data-revealdelay="60" style={{ maxWidth: "1400px" }}>
          <h2><FaLightbulb /> Gestión de Recomendaciones</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Analiza efectividad de recomendaciones generadas por IA.
          </p>

          {/* Estadísticas */}
          <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.total || 0}</div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Total</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.aplicadas || 0}</div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Aplicadas</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👍</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {stats.total > 0 ? ((stats.utiles / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Utilidad</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {stats.total > 0 ? ((stats.aplicadas / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Tasa Aplicación</div>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Tipo</label>
              <select value={filter.tipo} onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}>
                <option value="todos">Todos</option>
                <option value="respiracion">Respiración</option>
                <option value="ejercicio">Ejercicio</option>
                <option value="meditacion">Meditación</option>
                <option value="profesional">Profesional</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Prioridad</label>
              <select value={filter.prioridad} onChange={(e) => setFilter({ ...filter, prioridad: e.target.value })}>
                <option value="todas">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Aplicada</label>
              <select value={filter.aplicada} onChange={(e) => setFilter({ ...filter, aplicada: e.target.value })}>
                <option value="todas">Todas</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>

            <button onClick={exportRecomendaciones} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaDownload /> Exportar
            </button>
          </div>

          <div style={{ marginTop: "0.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
            Mostrando {filteredRecs.length} de {recomendaciones.length} recomendaciones
          </div>

          {msg && <div className="success-message" style={{ marginTop: "1rem" }}>{msg}</div>}

          {loading ? (
            <p>Cargando recomendaciones...</p>
          ) : filteredRecs.length === 0 ? (
            <p>No hay recomendaciones que coincidan con los filtros.</p>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {filteredRecs.map((rec) => (
                <div
                  key={rec.id_recomendacion}
                  className="card"
                  style={{
                    padding: "1.25rem",
                    marginBottom: "0.75rem",
                    borderLeft: `4px solid ${getPriorityColor(rec.prioridad)}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>{getTipoIcon(rec.tipo_recomendacion)}</span>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            backgroundColor: `${getPriorityColor(rec.prioridad)}20`,
                            color: getPriorityColor(rec.prioridad),
                            textTransform: "uppercase"
                          }}
                        >
                          {rec.tipo_recomendacion}
                        </span>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            backgroundColor: `${getPriorityColor(rec.prioridad)}20`,
                            color: getPriorityColor(rec.prioridad)
                          }}
                        >
                          {rec.prioridad}
                        </span>
                      </div>

                      <div style={{ marginBottom: "0.75rem" }}>
                        {rec.contenido}
                      </div>

                      <div style={{ fontSize: "0.9rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", color: "var(--color-text-secondary)" }}>
                        {rec.usuario && <div><strong>Usuario:</strong> {rec.usuario}</div>}
                        <div><strong>Fecha:</strong> {new Date(rec.fecha_generacion).toLocaleDateString()}</div>
                        {rec.aplica && rec.fecha_aplica && (
                          <div><strong>Aplicada:</strong> {new Date(rec.fecha_aplica).toLocaleDateString()}</div>
                        )}
                      </div>

                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem" }}>
                        {rec.aplica ? (
                          <span style={{ color: "#4caf50", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaCheckCircle /> Aplicada
                          </span>
                        ) : (
                          <span style={{ color: "#f44336", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaTimesCircle /> No aplicada
                          </span>
                        )}

                        {rec.util !== null && (
                          <span style={{ color: rec.util ? "#4caf50" : "#ff9800" }}>
                            {rec.util ? "👍 Útil" : "👎 No útil"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Recomendaciones;
