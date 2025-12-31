import React, { useState, useEffect, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import apiClient from "../../services/apiClient";
import api from "../../config/api";
import { FaShieldAlt, FaFilter, FaExclamationTriangle, FaDownload, FaEye } from "react-icons/fa";
import "../../global.css";

const Auditoria = () => {
  const { isDark } = useContext(ThemeContext);
  const [sesiones, setSesiones] = useState([]);
  const [cambiosRoles, setCambiosRoles] = useState([]);
  const [actividadSospechosa, setActividadSospechosa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sesiones"); // sesiones, roles, sospechosa
  const [filter, setFilter] = useState({ usuario: "", desde: "", hasta: "" });
  const [filteredData, setFilteredData] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [sesionesRes, rolesRes, sospechosaRes] = await Promise.all([
        apiClient.get(api.endpoints.auditoria.sesiones),
        apiClient.get(`${api.endpoints.auditoria.sesiones}/cambios-roles`),
        apiClient.get(`${api.endpoints.auditoria.sesiones}/actividad-sospechosa`),
      ]);

      setSesiones(sesionesRes.data?.data || []);
      setCambiosRoles(rolesRes.data?.data || []);
      setActividadSospechosa(sospechosaRes.data?.data || []);
    } catch (error) {
      console.error("Error al cargar datos de auditoría:", error);
      setMsg("Error al cargar datos de auditoría");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let data = [];
    switch (activeTab) {
      case "sesiones":
        data = sesiones;
        break;
      case "roles":
        data = cambiosRoles;
        break;
      case "sospechosa":
        data = actividadSospechosa;
        break;
    }

    let filtered = [...data];

    if (filter.usuario) {
      filtered = filtered.filter(item =>
        item.usuario?.toLowerCase().includes(filter.usuario.toLowerCase()) ||
        item.email?.toLowerCase().includes(filter.usuario.toLowerCase())
      );
    }

    if (filter.desde) {
      filtered = filtered.filter(item => {
        const fecha = new Date(item.fecha_inicio || item.fecha_cambio || item.fecha_deteccion);
        return fecha >= new Date(filter.desde);
      });
    }

    if (filter.hasta) {
      filtered = filtered.filter(item => {
        const fecha = new Date(item.fecha_inicio || item.fecha_cambio || item.fecha_deteccion);
        return fecha <= new Date(filter.hasta);
      });
    }

    setFilteredData(filtered);
  }, [filter, activeTab, sesiones, cambiosRoles, actividadSospechosa]);

  const exportarDatos = () => {
    let headers = [];
    let rows = [];

    switch (activeTab) {
      case "sesiones":
        headers = ["ID", "Usuario", "Email", "IP", "Dispositivo", "Inicio", "Fin", "Duración (min)"];
        rows = filteredData.map(s => [
          s.id_sesion,
          s.usuario,
          s.email,
          s.ip_address,
          s.dispositivo,
          new Date(s.fecha_inicio).toLocaleString(),
          s.fecha_fin ? new Date(s.fecha_fin).toLocaleString() : "Activa",
          s.duracion_minutos || "N/A"
        ]);
        break;
      case "roles":
        headers = ["ID", "Usuario", "Email", "Rol Anterior", "Rol Nuevo", "Admin", "Fecha"];
        rows = filteredData.map(r => [
          r.id_cambio,
          r.usuario,
          r.email,
          r.rol_anterior,
          r.rol_nuevo,
          r.admin_asigna || "Sistema",
          new Date(r.fecha_cambio).toLocaleString()
        ]);
        break;
      case "sospechosa":
        headers = ["ID", "Usuario", "Email", "Tipo", "Descripción", "Gravedad", "Fecha"];
        rows = filteredData.map(a => [
          a.id_actividad,
          a.usuario,
          a.email,
          a.tipo_actividad,
          a.descripcion,
          a.nivel_gravedad,
          new Date(a.fecha_deteccion).toLocaleString()
        ]);
        break;
    }

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setMsg(`Datos exportados correctamente`);
  };

  const verDetalles = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getGravedadColor = (gravedad) => {
    switch (gravedad) {
      case 'critica': return '#f44336';
      case 'alta': return '#ff9800';
      case 'media': return '#ffc107';
      case 'baja': return '#4caf50';
      default: return '#9e9e9e';
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
          <h2><FaShieldAlt /> Auditoría y Seguridad</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Monitorea sesiones, cambios de roles y actividad sospechosa.
          </p>

          {/* Tabs */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", borderBottom: "2px solid var(--color-border)" }}>
            <button
              onClick={() => setActiveTab("sesiones")}
              style={{
                padding: "0.75rem 1.5rem",
                background: activeTab === "sesiones" ? "var(--color-primary)" : "transparent",
                color: activeTab === "sesiones" ? "#fff" : "var(--color-text)",
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontWeight: activeTab === "sesiones" ? "bold" : "normal"
              }}
            >
              Sesiones ({sesiones.length})
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              style={{
                padding: "0.75rem 1.5rem",
                background: activeTab === "roles" ? "var(--color-primary)" : "transparent",
                color: activeTab === "roles" ? "#fff" : "var(--color-text)",
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontWeight: activeTab === "roles" ? "bold" : "normal"
              }}
            >
              Cambios de Roles ({cambiosRoles.length})
            </button>
            <button
              onClick={() => setActiveTab("sospechosa")}
              style={{
                padding: "0.75rem 1.5rem",
                background: activeTab === "sospechosa" ? "var(--color-primary)" : "transparent",
                color: activeTab === "sospechosa" ? "#fff" : "var(--color-text)",
                border: "none",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontWeight: activeTab === "sospechosa" ? "bold" : "normal"
              }}
            >
              <FaExclamationTriangle /> Sospechosa ({actividadSospechosa.length})
            </button>
          </div>

          {/* Filtros */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
            <div className="form-group" style={{ minWidth: "200px" }}>
              <label>Buscar usuario/email</label>
              <input
                type="text"
                placeholder="Nombre o email..."
                value={filter.usuario}
                onChange={(e) => setFilter({ ...filter, usuario: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Desde</label>
              <input
                type="date"
                value={filter.desde}
                onChange={(e) => setFilter({ ...filter, desde: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Hasta</label>
              <input
                type="date"
                value={filter.hasta}
                onChange={(e) => setFilter({ ...filter, hasta: e.target.value })}
              />
            </div>

            <button onClick={exportarDatos} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaDownload /> Exportar
            </button>
          </div>

          <div style={{ marginTop: "0.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
            Mostrando {filteredData.length} registros
          </div>

          {msg && <div className="success-message" style={{ marginTop: "1rem" }}>{msg}</div>}

          {loading ? (
            <p>Cargando datos de auditoría...</p>
          ) : filteredData.length === 0 ? (
            <p>No hay registros que coincidan con los filtros.</p>
          ) : (
            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                    {activeTab === "sesiones" && (
                      <>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Usuario</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>IP</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Dispositivo</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Inicio</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Duración</th>
                        <th style={{ padding: "1rem", textAlign: "center" }}>Acciones</th>
                      </>
                    )}
                    {activeTab === "roles" && (
                      <>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Usuario</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Rol Anterior</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Rol Nuevo</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Admin</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Fecha</th>
                        <th style={{ padding: "1rem", textAlign: "center" }}>Acciones</th>
                      </>
                    )}
                    {activeTab === "sospechosa" && (
                      <>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Usuario</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Tipo</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Descripción</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Gravedad</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Fecha</th>
                        <th style={{ padding: "1rem", textAlign: "center" }}>Acciones</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      {activeTab === "sesiones" && (
                        <>
                          <td style={{ padding: "1rem" }}>
                            <div><strong>{item.usuario}</strong></div>
                            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{item.email}</div>
                          </td>
                          <td style={{ padding: "1rem" }}>{item.ip_address}</td>
                          <td style={{ padding: "1rem" }}>{item.dispositivo}</td>
                          <td style={{ padding: "1rem" }}>{new Date(item.fecha_inicio).toLocaleString()}</td>
                          <td style={{ padding: "1rem" }}>
                            {item.duracion_minutos ? `${item.duracion_minutos} min` : (
                              <span style={{ color: "#4caf50" }}>🟢 Activa</span>
                            )}
                          </td>
                          <td style={{ padding: "1rem", textAlign: "center" }}>
                            <button onClick={() => verDetalles(item)} style={{ padding: "0.5rem" }}>
                              <FaEye />
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab === "roles" && (
                        <>
                          <td style={{ padding: "1rem" }}>
                            <div><strong>{item.usuario}</strong></div>
                            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{item.email}</div>
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", backgroundColor: "var(--color-secondary)", fontSize: "0.85rem" }}>
                              {item.rol_anterior}
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", backgroundColor: "var(--color-primary)", color: "#fff", fontSize: "0.85rem" }}>
                              {item.rol_nuevo}
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>{item.admin_asigna || "Sistema"}</td>
                          <td style={{ padding: "1rem" }}>{new Date(item.fecha_cambio).toLocaleString()}</td>
                          <td style={{ padding: "1rem", textAlign: "center" }}>
                            <button onClick={() => verDetalles(item)} style={{ padding: "0.5rem" }}>
                              <FaEye />
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab === "sospechosa" && (
                        <>
                          <td style={{ padding: "1rem" }}>
                            <div><strong>{item.usuario}</strong></div>
                            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{item.email}</div>
                          </td>
                          <td style={{ padding: "1rem" }}>{item.tipo_actividad}</td>
                          <td style={{ padding: "1rem" }}>{item.descripcion}</td>
                          <td style={{ padding: "1rem" }}>
                            <span
                              style={{
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                backgroundColor: `${getGravedadColor(item.nivel_gravedad)}20`,
                                color: getGravedadColor(item.nivel_gravedad),
                                fontSize: "0.85rem",
                                textTransform: "uppercase"
                              }}
                            >
                              {item.nivel_gravedad}
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>{new Date(item.fecha_deteccion).toLocaleString()}</td>
                          <td style={{ padding: "1rem", textAlign: "center" }}>
                            <button onClick={() => verDetalles(item)} style={{ padding: "0.5rem" }}>
                              <FaEye />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de detalles */}
        {showModal && selectedItem && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Detalles de {activeTab === "sesiones" ? "Sesión" : activeTab === "roles" ? "Cambio de Rol" : "Actividad Sospechosa"}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {activeTab === "sesiones" && (
                  <>
                    <div><strong>Usuario:</strong> {selectedItem.usuario}</div>
                    <div><strong>Email:</strong> {selectedItem.email}</div>
                    <div><strong>IP:</strong> {selectedItem.ip_address}</div>
                    <div><strong>Dispositivo:</strong> {selectedItem.dispositivo}</div>
                    <div><strong>Inicio:</strong> {new Date(selectedItem.fecha_inicio).toLocaleString()}</div>
                    {selectedItem.fecha_fin && <div><strong>Fin:</strong> {new Date(selectedItem.fecha_fin).toLocaleString()}</div>}
                    {selectedItem.duracion_minutos && <div><strong>Duración:</strong> {selectedItem.duracion_minutos} minutos</div>}
                  </>
                )}
                {activeTab === "roles" && (
                  <>
                    <div><strong>Usuario:</strong> {selectedItem.usuario}</div>
                    <div><strong>Email:</strong> {selectedItem.email}</div>
                    <div><strong>Rol Anterior:</strong> {selectedItem.rol_anterior}</div>
                    <div><strong>Rol Nuevo:</strong> {selectedItem.rol_nuevo}</div>
                    <div><strong>Asignado por:</strong> {selectedItem.admin_asigna || "Sistema automático"}</div>
                    <div><strong>Fecha:</strong> {new Date(selectedItem.fecha_cambio).toLocaleString()}</div>
                    {selectedItem.razon && <div><strong>Razón:</strong> {selectedItem.razon}</div>}
                  </>
                )}
                {activeTab === "sospechosa" && (
                  <>
                    <div><strong>Usuario:</strong> {selectedItem.usuario}</div>
                    <div><strong>Email:</strong> {selectedItem.email}</div>
                    <div><strong>Tipo:</strong> {selectedItem.tipo_actividad}</div>
                    <div><strong>Descripción:</strong> {selectedItem.descripcion}</div>
                    <div><strong>Gravedad:</strong> <span style={{ color: getGravedadColor(selectedItem.nivel_gravedad) }}>{selectedItem.nivel_gravedad}</span></div>
                    <div><strong>Fecha:</strong> {new Date(selectedItem.fecha_deteccion).toLocaleString()}</div>
                    {selectedItem.ip_address && <div><strong>IP:</strong> {selectedItem.ip_address}</div>}
                    {selectedItem.acciones_tomadas && <div><strong>Acciones:</strong> {selectedItem.acciones_tomadas}</div>}
                  </>
                )}
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Auditoria;
