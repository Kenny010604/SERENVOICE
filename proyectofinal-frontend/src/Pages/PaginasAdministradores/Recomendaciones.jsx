import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import api from "../../config/api";
import { FaLightbulb, FaFilter, FaChartPie, FaDownload, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import PageCard from "../../components/Shared/PageCard";
import "../../global.css";
import "../../styles/StylesAdmin/AdminPages.css";

const Recomendaciones = () => {
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
        apiClient.get(api.endpoints.recomendaciones.todas),
        apiClient.get(api.endpoints.recomendaciones.estadisticas),
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
    <div className="admin-recomendaciones-page">
      <div className="admin-page-content">
        {/* Card con título y filtros */}
        <PageCard size="xl">
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", margin: 0 }}>
              <FaLightbulb style={{ color: "#ff9800" }} /> Gestión de Recomendaciones
            </h2>
            <p style={{ color: "var(--color-text-secondary)", margin: "0.5rem 0 0 0" }}>
              Administra las recomendaciones del sistema
            </p>
          </div>

          {/* Filtros horizontales */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap', alignItems: 'flex-end', overflowX: 'auto' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div className="input-labels">
                <label>Tipo</label>
              </div>
              <div className="input-group no-icon">
                <select value={filter.tipo} onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}>
                  <option value="todos">Todos</option>
                  <option value="respiracion">Respiración</option>
                  <option value="ejercicio">Ejercicio</option>
                  <option value="meditacion">Meditación</option>
                  <option value="profesional">Profesional</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <div className="input-labels">
                <label>Prioridad</label>
              </div>
              <div className="input-group no-icon">
                <select value={filter.prioridad} onChange={(e) => setFilter({ ...filter, prioridad: e.target.value })}>
                  <option value="todas">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <div className="input-labels">
                <label>Aplicada</label>
              </div>
              <div className="input-group no-icon">
                <select value={filter.aplicada} onChange={(e) => setFilter({ ...filter, aplicada: e.target.value })}>
                  <option value="todas">Todas</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button onClick={exportRecomendaciones} className="admin-btn admin-btn-secondary">
              <FaDownload /> Exportar
            </button>
          </div>
        </PageCard>

        {/* Estadísticas */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">📊</div>
            <div className="admin-stat-value">{stats.total || 0}</div>
            <div className="admin-stat-label">Total</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">✅</div>
            <div className="admin-stat-value">{stats.aplicadas || 0}</div>
            <div className="admin-stat-label">Aplicadas</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">👍</div>
            <div className="admin-stat-value">
              {stats.total > 0 ? ((stats.utiles / stats.total) * 100).toFixed(1) : 0}%
            </div>
            <div className="admin-stat-label">Utilidad</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">📈</div>
            <div className="admin-stat-value">
              {stats.total > 0 ? ((stats.aplicadas / stats.total) * 100).toFixed(1) : 0}%
            </div>
            <div className="admin-stat-label">Tasa Aplicación</div>
          </div>
        </div>

        <p className="admin-text-muted admin-mb-2">
          Mostrando {filteredRecs.length} de {recomendaciones.length} recomendaciones
        </p>

        {msg && <div className="admin-message admin-message-success">{msg}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p>Cargando recomendaciones...</p>
          </div>
        ) : filteredRecs.length === 0 ? (
          <div className="admin-empty-state">
            <FaLightbulb />
            <h3>Sin recomendaciones</h3>
            <p>No hay recomendaciones que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="admin-cards-grid" style={{ gridTemplateColumns: "1fr" }}>
            {filteredRecs.map((rec) => (
              <div
                key={rec.id_recomendacion}
                className="admin-card"
                style={{ borderLeft: `4px solid ${getPriorityColor(rec.prioridad)}` }}
              >
                <div className="admin-card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "1.5rem" }}>{getTipoIcon(rec.tipo_recomendacion)}</span>
                        <span className={`admin-badge ${rec.prioridad === 'alta' ? 'admin-badge-danger' : rec.prioridad === 'media' ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                          {rec.tipo_recomendacion}
                        </span>
                        <span className={`admin-badge ${rec.prioridad === 'alta' ? 'admin-badge-danger' : rec.prioridad === 'media' ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                          {rec.prioridad}
                        </span>
                      </div>

                      <p style={{ marginBottom: "0.75rem" }}>{rec.contenido}</p>

                      <div style={{ fontSize: "0.9rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }} className="admin-text-muted">
                        {rec.usuario && <div><strong>Usuario:</strong> {rec.usuario}</div>}
                        <div><strong>Fecha:</strong> {new Date(rec.fecha_generacion).toLocaleDateString()}</div>
                        {rec.aplica && rec.fecha_aplica && (
                          <div><strong>Aplicada:</strong> {new Date(rec.fecha_aplica).toLocaleDateString()}</div>
                        )}
                      </div>

                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        {rec.aplica ? (
                          <span className="admin-badge admin-badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaCheckCircle /> Aplicada
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge-danger" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaTimesCircle /> No aplicada
                          </span>
                        )}

                        {rec.util !== null && (
                          <span className={`admin-badge ${rec.util ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                            {rec.util ? "👍 Útil" : "👎 No útil"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recomendaciones;
