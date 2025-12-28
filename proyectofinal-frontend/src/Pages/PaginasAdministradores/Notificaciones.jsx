import React, { useState, useEffect, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import apiClient from "../../services/apiClient";
import { FaBell, FaEdit, FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import "../../global.css";

const Notificaciones = () => {
  const { isDark } = useContext(ThemeContext);
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo_notificacion: "sistema",
    titulo_plantilla: "",
    mensaje_plantilla: "",
    icono_defecto: "🔔",
    prioridad_defecto: "media",
    activa: true
  });

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const res = await apiClient.get("/notificaciones/plantillas");
      setPlantillas(res.data?.data || []);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
      setMsg("Error al cargar plantillas de notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plantilla) => {
    setEditingTemplate(plantilla);
    setFormData({
      tipo_notificacion: plantilla.tipo_notificacion,
      titulo_plantilla: plantilla.titulo_plantilla,
      mensaje_plantilla: plantilla.mensaje_plantilla,
      icono_defecto: plantilla.icono_defecto || "🔔",
      prioridad_defecto: plantilla.prioridad_defecto,
      activa: plantilla.activa
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      tipo_notificacion: "sistema",
      titulo_plantilla: "",
      mensaje_plantilla: "",
      icono_defecto: "🔔",
      prioridad_defecto: "media",
      activa: true
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await apiClient.put(`/notificaciones/plantillas/${editingTemplate.id_plantilla}`, formData);
        setMsg("Plantilla actualizada correctamente");
      } else {
        await apiClient.post("/notificaciones/plantillas", formData);
        setMsg("Plantilla creada correctamente");
      }
      setShowModal(false);
      cargarPlantillas();
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      setMsg("Error al guardar plantilla");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    try {
      await apiClient.delete(`/notificaciones/plantillas/${id}`);
      setMsg("Plantilla eliminada correctamente");
      cargarPlantillas();
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
      setMsg("Error al eliminar plantilla");
    }
  };

  const toggleEstado = async (id, activa) => {
    try {
      await apiClient.patch(`/notificaciones/plantillas/${id}/estado`, { activa: !activa });
      setMsg(`Plantilla ${!activa ? 'activada' : 'desactivada'} correctamente`);
      cargarPlantillas();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      setMsg("Error al cambiar estado de la plantilla");
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente': return '#f44336';
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
          <h2><FaBell /> Gestión de Notificaciones</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Configura plantillas y tipos de notificaciones del sistema.
          </p>

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
              Total de plantillas: {plantillas.length}
            </div>
            <button onClick={handleCreate} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaPlus /> Nueva Plantilla
            </button>
          </div>

          {msg && <div className="success-message" style={{ marginTop: "1rem" }}>{msg}</div>}

          {loading ? (
            <p>Cargando plantillas...</p>
          ) : plantillas.length === 0 ? (
            <p>No hay plantillas de notificaciones.</p>
          ) : (
            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              {plantillas.map((plantilla) => (
                <div
                  key={plantilla.id_plantilla}
                  className="card"
                  style={{
                    padding: "1.25rem",
                    borderLeft: `4px solid ${getPriorityColor(plantilla.prioridad_defecto)}`,
                    opacity: plantilla.activa ? 1 : 0.6
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>{plantilla.icono_defecto}</span>
                        <strong style={{ fontSize: "1.1rem" }}>{plantilla.titulo_plantilla}</strong>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            backgroundColor: `${getPriorityColor(plantilla.prioridad_defecto)}20`,
                            color: getPriorityColor(plantilla.prioridad_defecto),
                            textTransform: "uppercase"
                          }}
                        >
                          {plantilla.prioridad_defecto}
                        </span>
                        {!plantilla.activa && (
                          <span style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", backgroundColor: "#f4433620", color: "#f44336" }}>
                            INACTIVA
                          </span>
                        )}
                      </div>

                      <div style={{ color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                        {plantilla.mensaje_plantilla}
                      </div>

                      <div style={{ fontSize: "0.9rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                        <div><strong>Tipo:</strong> {plantilla.tipo_notificacion}</div>
                        <div><strong>Idioma:</strong> {plantilla.idioma || 'es'}</div>
                        {plantilla.fecha_modificacion && (
                          <div><strong>Última modificación:</strong> {new Date(plantilla.fecha_modificacion).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column", minWidth: "100px" }}>
                      <button
                        onClick={() => handleEdit(plantilla)}
                        style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => toggleEstado(plantilla.id_plantilla, plantilla.activa)}
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.5rem",
                          backgroundColor: plantilla.activa ? "#ff9800" : "#4caf50",
                          color: "#fff"
                        }}
                      >
                        {plantilla.activa ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(plantilla.id_plantilla)}
                        style={{ fontSize: "0.85rem", padding: "0.5rem", backgroundColor: "#f44336", color: "#fff" }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de edición/creación */}
        {showModal && (
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
                maxWidth: "600px",
                width: "90%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: "2rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h3>

              <form onSubmit={handleSave} style={{ marginTop: "1.5rem" }}>
                <div className="form-group">
                  <label>Tipo de Notificación</label>
                  <select
                    value={formData.tipo_notificacion}
                    onChange={(e) => setFormData({ ...formData, tipo_notificacion: e.target.value })}
                    required
                  >
                    <option value="sistema">Sistema</option>
                    <option value="invitacion_grupo">Invitación a Grupo</option>
                    <option value="actividad_grupo">Actividad de Grupo</option>
                    <option value="recordatorio_actividad">Recordatorio de Actividad</option>
                    <option value="recomendacion">Recomendación</option>
                    <option value="alerta_critica">Alerta Crítica</option>
                    <option value="mensaje_facilitador">Mensaje del Facilitador</option>
                    <option value="logro_desbloqueado">Logro Desbloqueado</option>
                    <option value="recordatorio_analisis">Recordatorio de Análisis</option>
                    <option value="actualizacion_grupo">Actualización de Grupo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Título de la Plantilla</label>
                  <input
                    type="text"
                    value={formData.titulo_plantilla}
                    onChange={(e) => setFormData({ ...formData, titulo_plantilla: e.target.value })}
                    placeholder="Ej: Nueva invitación a grupo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mensaje de la Plantilla</label>
                  <textarea
                    value={formData.mensaje_plantilla}
                    onChange={(e) => setFormData({ ...formData, mensaje_plantilla: e.target.value })}
                    placeholder="Ej: Has sido invitado al grupo {nombre_grupo}"
                    rows="4"
                    required
                  />
                  <small style={{ color: "var(--color-text-secondary)" }}>
                    Usa variables entre llaves, ej: {'{nombre_grupo}, {nombre_usuario}'}
                  </small>
                </div>

                <div className="form-group">
                  <label>Icono por Defecto</label>
                  <input
                    type="text"
                    value={formData.icono_defecto}
                    onChange={(e) => setFormData({ ...formData, icono_defecto: e.target.value })}
                    placeholder="🔔"
                    maxLength="10"
                  />
                </div>

                <div className="form-group">
                  <label>Prioridad por Defecto</label>
                  <select
                    value={formData.prioridad_defecto}
                    onChange={(e) => setFormData({ ...formData, prioridad_defecto: e.target.value })}
                    required
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={formData.activa}
                      onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                    />
                    Plantilla Activa
                  </label>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button type="submit" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <FaSave /> Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, backgroundColor: "#f44336", color: "#fff" }}
                  >
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Notificaciones;
