import React, { useEffect, useState, useContext } from 'react';
import groupsService from '../../services/groupsService';
import { Link, useNavigate } from 'react-router-dom';
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import { FaUserFriends, FaChartBar, FaUsers, FaClipboardList, FaFilter, FaPlus, FaDownload } from "react-icons/fa";
import apiClient from '../../services/apiClient';
import api from "../../config/api";
import "../../global.css";

export default function Grupos() {
  const { isDark } = useContext(ThemeContext);
  const [grupos, setGrupos] = useState([]);
  const [filteredGrupos, setFilteredGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ tipo: "todos", estado: "activos", busqueda: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(api.endpoints.grupos.estadisticas);
      const data = res.data?.data || [];
      setGrupos(data);
      setFilteredGrupos(data);
    } catch (e) {
      console.error(e);
      // Fallback al servicio anterior
      try {
        const data = await groupsService.listar();
        setGrupos(data || []);
        setFilteredGrupos(data || []);
      } catch (err) {
        console.error(err);
        setGrupos([]);
        setFilteredGrupos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleEstado = async (id, activo) => {
    try {
      await apiClient.patch(api.endpoints.grupos.estado(id), { activo: !activo });
      setMsg(`Grupo ${!activo ? 'activado' : 'desactivado'} correctamente`);
      cargar();
    } catch (e) {
      console.error(e);
      setMsg("Error al cambiar estado del grupo");
    }
  };

  const viewGrupoStats = async (grupo) => {
    try {
      await apiClient.get(api.endpoints.grupos.estadisticasDetalladas(grupo.id_grupo));
      setSelectedGrupo(grupo);
      setShowModal(true);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setSelectedGrupo(grupo);
      setShowModal(true);
    }
  };

  const exportGrupos = () => {
    const csv = [
      ["ID", "Nombre", "Tipo", "Privacidad", "Facilitador", "Miembros", "Activos", "Actividades", "Completadas", "Estado"].join(","),
      ...filteredGrupos.map(g =>
        [
          g.id_grupo,
          g.nombre_grupo,
          g.tipo_grupo,
          g.privacidad,
          `${g.facilitador_nombre} ${g.facilitador_apellido}`,
          g.total_miembros || 0,
          g.miembros_activos || 0,
          g.total_actividades || 0,
          g.actividades_completadas || 0,
          g.activo ? "Activo" : "Inactivo"
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grupos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setMsg("Grupos exportados correctamente");
  };

  useEffect(() => { cargar(); }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...grupos];

    if (filter.tipo !== "todos") {
      filtered = filtered.filter(g => g.tipo_grupo === filter.tipo);
    }

    if (filter.estado === "activos") {
      filtered = filtered.filter(g => g.activo);
    } else if (filter.estado === "inactivos") {
      filtered = filtered.filter(g => !g.activo);
    }

    if (filter.busqueda) {
      const search = filter.busqueda.toLowerCase();
      filtered = filtered.filter(g =>
        g.nombre_grupo?.toLowerCase().includes(search) ||
        g.descripcion?.toLowerCase().includes(search)
      );
    }

    setFilteredGrupos(filtered);
  }, [filter, grupos]);

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
        <div className="card reveal" style={{ maxWidth: "1400px" }}>
          <h2>
            <FaUserFriends /> Gestión de Grupos
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Administra grupos terapéuticos, actividades y participantes.
          </p>

          {/* Filtros y acciones */}
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
            <div className="form-group" style={{ flex: "1", minWidth: "200px" }}>
              <label>Buscar</label>
              <input
                type="text"
                placeholder="Nombre o descripción..."
                value={filter.busqueda}
                onChange={(e) => setFilter({ ...filter, busqueda: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Tipo</label>
              <select value={filter.tipo} onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}>
                <option value="todos">Todos</option>
                <option value="terapia">Terapia</option>
                <option value="apoyo">Apoyo</option>
                <option value="taller">Taller</option>
                <option value="empresa">Empresa</option>
                <option value="educativo">Educativo</option>
                <option value="familiar">Familiar</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Estado</label>
              <select value={filter.estado} onChange={(e) => setFilter({ ...filter, estado: e.target.value })}>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            <button onClick={() => navigate('/admin/grupos/nuevo')} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaPlus /> Crear Grupo
            </button>

            <button onClick={exportGrupos} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaDownload /> Exportar
            </button>
          </div>

          <div style={{ marginTop: "0.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
            Mostrando {filteredGrupos.length} de {grupos.length} grupos
          </div>

          {msg && <div className="success-message" style={{ marginTop: "1rem" }}>{msg}</div>}

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Cargando grupos...</div>
          ) : filteredGrupos.length === 0 ? (
            <p>No hay grupos que coincidan con los filtros.</p>
          ) : (
            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
              <table style={{ width: '100%', borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <th style={{ padding: "0.75rem" }}>Nombre</th>
                    <th style={{ padding: "0.75rem" }}>Tipo</th>
                    <th style={{ padding: "0.75rem" }}>Facilitador</th>
                    <th style={{ padding: "0.75rem" }}>Miembros</th>
                    <th style={{ padding: "0.75rem" }}>Actividades</th>
                    <th style={{ padding: "0.75rem" }}>Código</th>
                    <th style={{ padding: "0.75rem" }}>Estado</th>
                    <th style={{ padding: "0.75rem" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrupos.map(g => (
                    <tr key={g.id_grupo || g.id || g._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: g.activo ? 1 : 0.6 }}>
                      <td style={{ padding: "0.75rem" }}>
                        <strong>{g.nombre_grupo || g.nombre || g.name}</strong>
                        {g.descripcion && (
                          <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                            {g.descripcion.substring(0, 50)}{g.descripcion.length > 50 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          backgroundColor: "#5ad0d220",
                          color: "#5ad0d2"
                        }}>
                          {g.tipo_grupo || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {g.facilitador_nombre ? `${g.facilitador_nombre} ${g.facilitador_apellido}` : 'N/A'}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <FaUsers />
                          {g.miembros_activos || 0} / {g.total_miembros || 0}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <FaClipboardList />
                          {g.actividades_completadas || 0} / {g.total_actividades || 0}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem", fontFamily: "monospace" }}>
                        {g.codigo_acceso || 'N/A'}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          backgroundColor: g.activo ? "#4caf5020" : "#f4433620",
                          color: g.activo ? "#4caf50" : "#f44336",
                        }}>
                          {g.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <button
                            onClick={() => viewGrupoStats(g)}
                            title="Ver estadísticas"
                            style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                          >
                            <FaChartBar />
                          </button>
                          <Link
                            to={`/admin/grupos/${g.id_grupo || g.id || g._id}/miembros`}
                            style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", textDecoration: "none" }}
                          >
                            <button style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
                              Miembros
                            </button>
                          </Link>
                          <Link
                            to={`/admin/grupos/${g.id_grupo || g.id || g._id}/actividades`}
                            style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", textDecoration: "none" }}
                          >
                            <button style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
                              Actividades
                            </button>
                          </Link>
                          <button
                            onClick={() => toggleEstado(g.id_grupo || g.id || g._id, g.activo)}
                            style={{
                              fontSize: "0.85rem",
                              padding: "0.4rem 0.8rem",
                              backgroundColor: g.activo ? "#ff9800" : "#4caf50",
                              color: "#fff"
                            }}
                          >
                            {g.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de estadísticas del grupo */}
        {showModal && selectedGrupo && (
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
              <h3>Estadísticas de {selectedGrupo.nombre_grupo}</h3>
              
              <div style={{ marginTop: "1.5rem" }}>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Tipo de Grupo:</strong> {selectedGrupo.tipo_grupo}
                </div>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Privacidad:</strong> {selectedGrupo.privacidad}
                </div>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Facilitador:</strong> {selectedGrupo.facilitador_nombre} {selectedGrupo.facilitador_apellido}
                  <br />
                  <small>{selectedGrupo.facilitador_correo}</small>
                </div>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Total de Miembros:</strong> {selectedGrupo.total_miembros || 0}
                  <br />
                  <strong>Miembros Activos:</strong> {selectedGrupo.miembros_activos || 0}
                  {selectedGrupo.max_participantes && (
                    <><br /><strong>Máximo de Participantes:</strong> {selectedGrupo.max_participantes}</>
                  )}
                </div>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Total de Actividades:</strong> {selectedGrupo.total_actividades || 0}
                  <br />
                  <strong>Actividades Completadas:</strong> {selectedGrupo.actividades_completadas || 0}
                  {selectedGrupo.total_actividades > 0 && (
                    <><br /><strong>Tasa de Completitud:</strong> {((selectedGrupo.actividades_completadas / selectedGrupo.total_actividades) * 100).toFixed(1)}%</>
                  )}
                </div>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Código de Acceso:</strong> <span style={{ fontFamily: "monospace", fontSize: "1.1rem" }}>{selectedGrupo.codigo_acceso}</span>
                </div>
                <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
                  <strong>Fecha de Creación:</strong> {new Date(selectedGrupo.fecha_creacion).toLocaleDateString()}
                  {selectedGrupo.fecha_inicio && (
                    <><br /><strong>Fecha de Inicio:</strong> {new Date(selectedGrupo.fecha_inicio).toLocaleDateString()}</>
                  )}
                  {selectedGrupo.fecha_fin && (
                    <><br /><strong>Fecha de Fin:</strong> {new Date(selectedGrupo.fecha_fin).toLocaleDateString()}</>
                  )}
                </div>
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
}
