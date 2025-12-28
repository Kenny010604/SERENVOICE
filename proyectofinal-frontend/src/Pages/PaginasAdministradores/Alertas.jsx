import React, { useRef, useState, useEffect, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { FaBell, FaCheck, FaExclamationTriangle, FaUser, FaFilter, FaDownload } from "react-icons/fa";
import { useAlertas } from "../../context/AlertasContext";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import apiClient from "../../services/apiClient";

const Alertas = () => {
  const { isDark } = useContext(ThemeContext);
  const { alerts: contextAlerts, assignToMe, resolveAlerta } = useAlertas();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tipo: "todas", severidad: "todas", estado: "activas" });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
  }, []);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const res = await apiClient.get("/alertas");
        setAlerts(res.data?.data || []);
        setFilteredAlerts(res.data?.data || []);
      } catch (error) {
        console.error("Error al cargar alertas:", error);
        setAlerts(contextAlerts);
        setFilteredAlerts(contextAlerts);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertas();
  }, [contextAlerts]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...alerts];

    if (filter.tipo !== "todas") {
      filtered = filtered.filter(a => a.tipo_alerta === filter.tipo);
    }

    if (filter.severidad !== "todas") {
      filtered = filtered.filter(a => a.tipo_alerta === filter.severidad);
    }

    if (filter.estado === "activas") {
      filtered = filtered.filter(a => a.activo && !a.fecha_revision);
    } else if (filter.estado === "resueltas") {
      filtered = filtered.filter(a => a.fecha_revision);
    }

    setFilteredAlerts(filtered);
  }, [filter, alerts]);

  const handleAssign = async (id) => {
    try {
      await apiClient.patch(`/alertas/${id}/asignar`);
      assignToMe(id);
      setMsg("Alerta asignada correctamente");
    } catch (error) {
      console.error("Error al asignar alerta:", error);
      setMsg("Error al asignar alerta");
    }
  };

  const handleResolve = async (id) => {
    try {
      await apiClient.patch(`/alertas/${id}/resolver`);
      resolveAlerta(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, fecha_revision: new Date().toISOString() } : a));
      setMsg("Alerta resuelta correctamente");
    } catch (error) {
      console.error("Error al resolver alerta:", error);
      setMsg("Error al resolver alerta");
    }
  };

  const viewAlertDetail = (alerta) => {
    setSelectedAlert(alerta);
    setShowModal(true);
  };

  const getSeverityColor = (tipo) => {
    switch (tipo) {
      case 'critica': return '#f44336';
      case 'alta': return '#ff9800';
      case 'media': return '#ffc107';
      case 'baja': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const exportAlertas = () => {
    const csv = [
      ["ID", "Usuario", "Tipo", "Severidad", "Título", "Descripción", "Fecha", "Estado"].join(","),
      ...filteredAlerts.map(a =>
        [
          a.id_alerta || a.id,
          `${a.nombre} ${a.apellido}`,
          a.tipo_alerta,
          a.tipo_recomendacion || "N/A",
          a.titulo,
          a.descripcion?.replace(/,/g, ";") || "",
          a.fecha || a.fecha_creacion,
          a.fecha_revision ? "Resuelta" : "Activa"
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alertas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setMsg("Alertas exportadas correctamente");
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
        <div ref={cardRef} className="card reveal" style={{ maxWidth: "1200px" }}>
          <h2>
            <FaBell /> Gestión de Alertas Críticas
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Monitorea y gestiona alertas de alto riesgo del sistema.
          </p>

          {/* Filtros */}
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Tipo de Alerta</label>
              <select value={filter.tipo} onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}>
                <option value="todas">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Estado</label>
              <select value={filter.estado} onChange={(e) => setFilter({ ...filter, estado: e.target.value })}>
                <option value="activas">Activas</option>
                <option value="resueltas">Resueltas</option>
                <option value="todas">Todas</option>
              </select>
            </div>

            <button onClick={exportAlertas} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaDownload /> Exportar
            </button>
          </div>

          <div style={{ marginTop: "0.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
            Mostrando {filteredAlerts.length} de {alerts.length} alertas
          </div>


          {msg && <div className="success-message">{msg}</div>}

          {loading ? (
            <p>Cargando alertas...</p>
          ) : filteredAlerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
              <FaCheck style={{ fontSize: "3rem", marginBottom: "1rem" }} />
              <p>No hay alertas pendientes.</p>
            </div>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {filteredAlerts.map((a) => (
                <div
                  key={a.id_alerta || a.id}
                  className="card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "0.75rem",
                    padding: "1.25rem",
                    borderLeft: `4px solid ${getSeverityColor(a.tipo_alerta)}`,
                    opacity: a.fecha_revision ? 0.6 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <FaExclamationTriangle style={{ color: getSeverityColor(a.tipo_alerta) }} />
                      <strong style={{ fontSize: "1.1rem" }}>{a.titulo}</strong>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          backgroundColor: `${getSeverityColor(a.tipo_alerta)}20`,
                          color: getSeverityColor(a.tipo_alerta),
                          textTransform: "uppercase",
                          fontWeight: "bold",
                        }}
                      >
                        {a.tipo_alerta}
                      </span>
                    </div>

                    <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                      {a.descripcion}
                    </div>

                    <div style={{ fontSize: "0.9rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                      <div>
                        <FaUser style={{ marginRight: "0.25rem" }} />
                        <strong>Usuario:</strong> {a.nombre} {a.apellido}
                      </div>
                      <div>
                        <strong>Clasificación:</strong> {a.clasificacion}
                      </div>
                      <div>
                        <strong>Fecha:</strong> {new Date(a.fecha || a.fecha_creacion).toLocaleDateString()}
                      </div>
                      {a.nivel_estres && (
                        <div>
                          <strong>Estrés:</strong> {a.nivel_estres.toFixed(1)}%
                        </div>
                      )}
                      {a.nivel_ansiedad && (
                        <div>
                          <strong>Ansiedad:</strong> {a.nivel_ansiedad.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    {a.contexto && (
                      <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", fontStyle: "italic", color: "var(--color-text-secondary)" }}>
                        Contexto: {a.contexto}
                      </div>
                    )}

                    {a.fecha_revision && (
                      <div style={{ marginTop: "0.5rem", color: "#4caf50", fontSize: "0.9rem" }}>
                        ✓ Resuelta el {new Date(a.fecha_revision).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column", minWidth: "120px" }}>
                    <button
                      onClick={() => viewAlertDetail(a)}
                      style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                    >
                      Ver Detalles
                    </button>
                    
                    {!a.fecha_revision && (
                      <>
                        <button
                          onClick={() => handleAssign(a.id_alerta || a.id)}
                          style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                        >
                          Asignar
                        </button>
                        <button
                          onClick={() => handleResolve(a.id_alerta || a.id)}
                          style={{ background: "#4caf50", color: "#fff", fontSize: "0.85rem", padding: "0.5rem" }}
                        >
                          <FaCheck /> Resolver
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de detalles de alerta */}
        {showModal && selectedAlert && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="card"
              style={{
                maxWidth: "700px",
                width: "90%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: "2rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Detalles de la Alerta</h3>
              
              <div style={{ marginTop: "1.5rem" }}>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Tipo de Alerta:</strong>
                  <span style={{ marginLeft: "0.5rem", color: getSeverityColor(selectedAlert.tipo_alerta) }}>
                    {selectedAlert.tipo_alerta?.toUpperCase()}
                  </span>
                </div>

                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Título:</strong> {selectedAlert.titulo}
                </div>

                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Descripción:</strong>
                  <p style={{ marginTop: "0.5rem" }}>{selectedAlert.descripcion}</p>
                </div>

                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Usuario Afectado:</strong> {selectedAlert.nombre} {selectedAlert.apellido}
                  <br />
                  <strong>Correo:</strong> {selectedAlert.correo}
                </div>

                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Clasificación:</strong> {selectedAlert.clasificacion}
                </div>

                {selectedAlert.contexto && (
                  <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                    <strong>Contexto:</strong>
                    <p style={{ marginTop: "0.5rem" }}>{selectedAlert.contexto}</p>
                  </div>
                )}

                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Niveles Emocionales:</strong>
                  {selectedAlert.nivel_estres && <div>Estrés: {selectedAlert.nivel_estres.toFixed(2)}%</div>}
                  {selectedAlert.nivel_ansiedad && <div>Ansiedad: {selectedAlert.nivel_ansiedad.toFixed(2)}%</div>}
                  {selectedAlert.emocion_dominante && <div>Emoción Dominante: {selectedAlert.emocion_dominante}</div>}
                </div>

                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Fecha de Creación:</strong> {new Date(selectedAlert.fecha || selectedAlert.fecha_creacion).toLocaleString()}
                </div>

                {selectedAlert.fecha_revision && (
                  <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem", backgroundColor: "#4caf5010" }}>
                    <strong>Estado:</strong> Resuelta el {new Date(selectedAlert.fecha_revision).toLocaleString()}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{ marginTop: "1rem", width: "100%" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Alertas;
