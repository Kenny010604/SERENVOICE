import React, { useRef, useState, useEffect, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { FaBell, FaCheck, FaExclamationTriangle, FaUser, FaFilter, FaDownload, FaCheckCircle } from "react-icons/fa";
import "../../global.css";
import { useAlertas } from "../../context/AlertasContext";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import apiClient from "../../services/apiClient";
import api from "../../config/api";
import alertasService from "../../services/alertasService";

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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [historial, setHistorial] = useState([]);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
  }, []);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        // backend expone /api/alertas/active para alertas activas (admin)
        const res = await apiClient.get(api.endpoints.alertas.active);
        setAlerts(res.data?.data || []);
        setFilteredAlerts(res.data?.data || []);
      } catch (error) {
        console.error("Error al cargar alertas:", error);
        // fallback al contexto local si la API falla
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
      // la severidad viene como "tipo_recomendacion" desde el backend
      filtered = filtered.filter(a => (a.tipo_recomendacion || a.severidad || a.tipo_alerta) === filter.severidad);
    }

    if (filter.estado === "activas") {
      filtered = filtered.filter(a => a.activo && !a.fecha_revision);
    } else if (filter.estado === "resueltas") {
      filtered = filtered.filter(a => a.fecha_revision);
    }

    setFilteredAlerts(filtered);
  }, [filter, alerts]);

  const handleAssign = async (id) => {
    // open assign modal and load admins
    try {
      setSelectedAlert(alerts.find(a => (a.id_alerta || a.id) === id) || null);
      setShowAssignModal(true);
      // fetch admins (use admin users endpoint that returns only admins)
      const res = await apiClient.get(api.endpoints.admin.usuarios.list);
      // backend may return { success: true, usuarios: [...] } or { success: true, data: [...] }
      const adminsList = res.data?.usuarios || res.data?.data || res.data || [];
      setAdmins(adminsList);
      setSelectedAdmin(null);
    } catch (error) {
      console.error('Error cargando administradores:', error);
      setMsg('Error cargando administradores');
    }
  };

  const handleResolve = async (id) => {
    // open resolve modal
    setSelectedAlert(alerts.find(a => (a.id_alerta || a.id) === id) || null);
    setResolveNotes("");
    setShowResolveModal(true);
  };

  const viewAlertDetail = async (alerta) => {
    setSelectedAlert(alerta);
    setShowModal(true);
    try {
      const id = alerta.id_alerta || alerta.id;
      const res = await apiClient.get(api.endpoints.alertas.historial(id));
      setHistorial(res.data?.data || []);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setHistorial([]);
    }
  };

  const confirmAssign = async () => {
    if (!selectedAlert) return;
    if (!selectedAdmin) {
      setMsg('Selecciona un administrador antes de confirmar');
      return;
    }
    const id = selectedAlert.id_alerta || selectedAlert.id;
    try {
      const payload = { id_usuario_asignado: Number(selectedAdmin) };
      await alertasService.asignarAlert(id, payload);
      assignToMe(id);
      setAlerts(prev => prev.map(a => (a.id_alerta === id || a.id === id) ? { ...a, id_usuario_asignado: selectedAdmin } : a));
      setMsg('Alerta asignada correctamente');
      setShowAssignModal(false);
    } catch (err) {
      console.error('Error asignando alerta:', err);
      setMsg('Error al asignar alerta');
    }
  };

  const confirmResolve = async () => {
    if (!selectedAlert) return;
    const id = selectedAlert.id_alerta || selectedAlert.id;
    try {
      const payload = { notas: resolveNotes };
      await alertasService.resolverAlert(id, payload);
      resolveAlerta(id);
      setAlerts(prev => prev.map(a => (a.id_alerta === id || a.id === id) ? { ...a, fecha_revision: new Date().toISOString(), fecha_resolucion: new Date().toISOString() } : a));
      setMsg('Alerta resuelta correctamente');
      setShowResolveModal(false);
    } catch (err) {
      console.error('Error resolviendo alerta:', err);
      setMsg('Error al resolver alerta');
    }
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
            <div className="form-group" style={{ minWidth: "180px" }}>
              <div className="input-labels">
                <label><FaFilter /> Tipo de Alerta</label>
              </div>
              <div className="input-group flush">
                <span className="input-icon" />
                <select value={filter.tipo} onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}>
                  <option value="todas">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ minWidth: "180px" }}>
              <div className="input-labels">
                <label><FaFilter /> Severidad</label>
              </div>
              <div className="input-group flush">
                <span className="input-icon" />
                <select value={filter.severidad} onChange={(e) => setFilter({ ...filter, severidad: e.target.value })}>
                  <option value="todas">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ minWidth: "180px" }}>
              <div className="input-labels">
                <label><FaCheckCircle /> Estado</label>
              </div>
              <div className="input-group flush">
                <span className="input-icon" />
                <select value={filter.estado} onChange={(e) => setFilter({ ...filter, estado: e.target.value })}>
                  <option value="activas">Activas</option>
                  <option value="resueltas">Resueltas</option>
                  <option value="todas">Todas</option>
                </select>
              </div>
            </div>

            <button onClick={exportAlertas} className="auth-button" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "auto" }}>
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
        {/* Modal Asignar administrador */}
        {showAssignModal && selectedAlert && (
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
            onClick={() => setShowAssignModal(false)}
          >
            <div
              className="card"
              style={{
                maxWidth: "600px",
                width: "90%",
                padding: "1.5rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Asignar Alerta</h3>
              <p>Alerta: <strong>{selectedAlert.titulo}</strong></p>
              <div style={{ marginTop: "1rem" }}>
                <label>Seleccionar administrador</label>
                <div className="input-group no-icon" style={{ marginTop: "0.5rem", width: "100%" }}>
                  <select value={selectedAdmin || ""} onChange={(e) => setSelectedAdmin(e.target.value)}>
                    <option value="">-- Seleccionar --</option>
                    {admins.map(u => (
                      <option key={u.id_usuario || u.id} value={u.id_usuario || u.id}>{u.nombre} {u.apellido} {u.correo ? `(${u.correo})` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={confirmAssign} className="auth-button" disabled={!selectedAdmin} style={{ opacity: !selectedAdmin ? 0.6 : 1, cursor: !selectedAdmin ? 'not-allowed' : 'pointer' }}>Confirmar</button>
                <button onClick={() => setShowAssignModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Resolver alerta con notas */}
        {showResolveModal && selectedAlert && (
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
            onClick={() => setShowResolveModal(false)}
          >
            <div
              className="card"
              style={{
                maxWidth: "600px",
                width: "90%",
                padding: "1.5rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Resolver Alerta</h3>
              <p>Alerta: <strong>{selectedAlert.titulo}</strong></p>
              <div style={{ marginTop: "1rem" }}>
                <label>Notas de resolución (opcional)</label>
                <div className="input-group no-icon" style={{ marginTop: "0.5rem" }}>
                  <textarea
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    rows={6}
                    className="input-textarea"
                    placeholder="Notas de resolución (opcional)"
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={confirmResolve} className="auth-button" style={{ background: "#4caf50", color: "#fff" }}>Resolver</button>
                <button onClick={() => setShowResolveModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
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

                  {historial && historial.length > 0 && (
                    <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                      <strong>Historial de acciones:</strong>
                      <ul style={{ marginTop: '0.5rem', maxHeight: '200px', overflow: 'auto' }}>
                        {historial.map((h) => (
                          <li key={h.id_historial || h.id} style={{ marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.9rem' }}>
                              <strong>{h.accion}</strong> — {h.detalles || ''}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {h.usuario_responsable ? `Por: ${h.usuario_responsable}` : ''} {h.fecha_accion ? `• ${new Date(h.fecha_accion).toLocaleString()}` : ''}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
