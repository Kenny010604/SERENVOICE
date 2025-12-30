import React, { useState, useEffect, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import apiClient from "../../services/apiClient";
import { FaGamepad, FaFilter, FaChartBar, FaDownload, FaEye } from "react-icons/fa";
import "../../global.css";

const SesionesJuego = () => {
  const { isDark } = useContext(ThemeContext);
  const [sesiones, setSesiones] = useState([]);
  const [filteredSesiones, setFilteredSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState({ juego: "todos", mejoraPercibida: "todas", completado: "todos" });
  const [stats, setStats] = useState({});
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarSesiones();
  }, []);

  const cargarSesiones = async () => {
    try {
      const [sesionesRes, statsRes] = await Promise.all([
        apiClient.get("/sesiones-juego/todas"),
        apiClient.get("/sesiones-juego/estadisticas")
      ]);
      setSesiones(sesionesRes.data?.data || []);
      setFilteredSesiones(sesionesRes.data?.data || []);
      setStats(statsRes.data?.data || {});
    } catch (error) {
      console.error("Error al cargar sesiones de juego:", error);
      setMsg("Error al cargar sesiones de juego");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...sesiones];

    if (filter.juego !== "todos") {
      filtered = filtered.filter(s => s.id_juego == filter.juego);
    }

    if (filter.mejoraPercibida !== "todas") {
      filtered = filtered.filter(s => s.mejora_percibida === filter.mejoraPercibida);
    }

    if (filter.completado === "si") {
      filtered = filtered.filter(s => s.completado);
    } else if (filter.completado === "no") {
      filtered = filtered.filter(s => !s.completado);
    }

    setFilteredSesiones(filtered);
  }, [filter, sesiones]);

  const exportSesiones = () => {
    const csv = [
      ["ID", "Usuario", "Juego", "Inicio", "Fin", "Duración (min)", "Estado Antes", "Estado Después", "Mejora", "Completado", "Puntuación"].join(","),
      ...filteredSesiones.map(s =>
        [
          s.id_sesion,
          s.usuario || "N/A",
          s.nombre_juego || "N/A",
          new Date(s.fecha_inicio).toLocaleString(),
          s.fecha_fin ? new Date(s.fecha_fin).toLocaleString() : "En curso",
          s.duracion_minutos || "N/A",
          s.estado_antes || "N/A",
          s.estado_despues || "N/A",
          s.mejora_percibida || "N/A",
          s.completado ? "Sí" : "No",
          s.puntuacion_final || "N/A"
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sesiones_juego_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setMsg("Sesiones exportadas correctamente");
  };

  const verDetalles = (sesion) => {
    setSelectedSesion(sesion);
    setShowModal(true);
  };

  const getMejoraColor = (mejora) => {
    switch (mejora) {
      case 'alta': return '#4caf50';
      case 'media': return '#ff9800';
      case 'baja': return '#ffc107';
      case 'ninguna': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const calcularEfectividad = (estadoAntes, estadoDespues) => {
    if (!estadoAntes || !estadoDespues) return null;
    
    const niveles = { 'muy_bajo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy_alto': 5 };
    const antes = niveles[estadoAntes] || 0;
    const despues = niveles[estadoDespues] || 0;
    const cambio = despues - antes;

    if (cambio > 0) return { texto: "Mejoró", color: "#4caf50", cambio: `+${cambio}` };
    if (cambio < 0) return { texto: "Empeoró", color: "#f44336", cambio };
    return { texto: "Sin cambio", color: "#9e9e9e", cambio: "0" };
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
          <h2><FaGamepad /> Sesiones de Juego Terapéutico</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Analiza efectividad de sesiones de juegos terapéuticos.
          </p>

          {/* Estadísticas */}
          <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎮</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.total || 0}</div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Total Sesiones</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.completadas || 0}</div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Completadas</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {stats.total > 0 ? ((stats.completadas / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Tasa Completado</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏱️</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {stats.duracion_promedio || 0} min
              </div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Duración Promedio</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {stats.puntuacion_promedio || 0}
              </div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Puntuación Media</div>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
            <div className="form-group" style={{ minWidth: "200px" }}>
              <label>Juego</label>
              <select value={filter.juego} onChange={(e) => setFilter({ ...filter, juego: e.target.value })}>
                <option value="todos">Todos</option>
                {stats.juegos?.map(j => (
                  <option key={j.id} value={j.id}>{j.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Mejora Percibida</label>
              <select value={filter.mejoraPercibida} onChange={(e) => setFilter({ ...filter, mejoraPercibida: e.target.value })}>
                <option value="todas">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
                <option value="ninguna">Ninguna</option>
              </select>
            </div>

            <div className="form-group" style={{ minWidth: "150px" }}>
              <label>Completado</label>
              <select value={filter.completado} onChange={(e) => setFilter({ ...filter, completado: e.target.value })}>
                <option value="todos">Todos</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>

            <button onClick={exportSesiones} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaDownload /> Exportar
            </button>
          </div>

          <div style={{ marginTop: "0.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
            Mostrando {filteredSesiones.length} de {sesiones.length} sesiones
          </div>

          {msg && <div className="success-message" style={{ marginTop: "1rem" }}>{msg}</div>}

          {loading ? (
            <p>Cargando sesiones...</p>
          ) : filteredSesiones.length === 0 ? (
            <p>No hay sesiones que coincidan con los filtros.</p>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {filteredSesiones.map((sesion) => {
                const efectividad = calcularEfectividad(sesion.estado_antes, sesion.estado_despues);
                return (
                  <div
                    key={sesion.id_sesion}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      marginBottom: "0.75rem",
                      borderLeft: `4px solid ${getMejoraColor(sesion.mejora_percibida)}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "1.5rem" }}>🎮</span>
                          <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{sesion.nombre_juego}</span>
                          {sesion.completado && (
                            <span style={{ color: "#4caf50" }}>✅ Completado</span>
                          )}
                        </div>

                        <div style={{ fontSize: "0.9rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
                          <div><strong>Usuario:</strong> {sesion.usuario}</div>
                          <div><strong>Inicio:</strong> {new Date(sesion.fecha_inicio).toLocaleString()}</div>
                          {sesion.duracion_minutos && <div><strong>Duración:</strong> {sesion.duracion_minutos} min</div>}
                          {sesion.puntuacion_final && <div><strong>Puntuación:</strong> ⭐ {sesion.puntuacion_final}</div>}
                        </div>

                        {/* Análisis de estado */}
                        {efectividad && (
                          <div style={{ marginTop: "0.75rem", padding: "0.75rem", backgroundColor: "var(--color-card-secondary)", borderRadius: "8px" }}>
                            <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
                              <div>
                                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>Estado Antes</div>
                                <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>{sesion.estado_antes?.replace('_', ' ')}</div>
                              </div>
                              <div style={{ fontSize: "1.5rem" }}>→</div>
                              <div>
                                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>Estado Después</div>
                                <div style={{ fontWeight: "bold", textTransform: "capitalize" }}>{sesion.estado_despues?.replace('_', ' ')}</div>
                              </div>
                              <div style={{ marginLeft: "auto" }}>
                                <span
                                  style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "8px",
                                    backgroundColor: `${efectividad.color}20`,
                                    color: efectividad.color,
                                    fontWeight: "bold"
                                  }}
                                >
                                  {efectividad.texto} ({efectividad.cambio})
                                </span>
                              </div>
                            </div>

                            {sesion.mejora_percibida && (
                              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <strong>Mejora Percibida:</strong>
                                <span
                                  style={{
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    backgroundColor: `${getMejoraColor(sesion.mejora_percibida)}20`,
                                    color: getMejoraColor(sesion.mejora_percibida),
                                    textTransform: "uppercase",
                                    fontSize: "0.85rem"
                                  }}
                                >
                                  {sesion.mejora_percibida}
                                </span>
                              </div>
                            )}

                            {sesion.observaciones && (
                              <div style={{ marginTop: "0.75rem" }}>
                                <strong>Observaciones:</strong> {sesion.observaciones}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <button onClick={() => verDetalles(sesion)} style={{ padding: "0.5rem" }}>
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de detalles */}
        {showModal && selectedSesion && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Detalles de Sesión</h3>
                <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div><strong>ID Sesión:</strong> {selectedSesion.id_sesion}</div>
                <div><strong>Usuario:</strong> {selectedSesion.usuario}</div>
                <div><strong>Juego:</strong> {selectedSesion.nombre_juego}</div>
                <div><strong>Descripción:</strong> {selectedSesion.descripcion_juego}</div>
                <div><strong>Inicio:</strong> {new Date(selectedSesion.fecha_inicio).toLocaleString()}</div>
                {selectedSesion.fecha_fin && <div><strong>Fin:</strong> {new Date(selectedSesion.fecha_fin).toLocaleString()}</div>}
                {selectedSesion.duracion_minutos && <div><strong>Duración:</strong> {selectedSesion.duracion_minutos} minutos</div>}
                <div><strong>Estado Antes:</strong> {selectedSesion.estado_antes?.replace('_', ' ')}</div>
                <div><strong>Estado Después:</strong> {selectedSesion.estado_despues?.replace('_', ' ')}</div>
                <div><strong>Mejora Percibida:</strong> <span style={{ color: getMejoraColor(selectedSesion.mejora_percibida) }}>{selectedSesion.mejora_percibida}</span></div>
                <div><strong>Completado:</strong> {selectedSesion.completado ? "Sí ✅" : "No ❌"}</div>
                {selectedSesion.puntuacion_final && <div><strong>Puntuación Final:</strong> ⭐ {selectedSesion.puntuacion_final}</div>}
                {selectedSesion.observaciones && (
                  <div>
                    <strong>Observaciones:</strong>
                    <div style={{ marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "var(--color-card-secondary)", borderRadius: "8px" }}>
                      {selectedSesion.observaciones}
                    </div>
                  </div>
                )}
                {selectedSesion.metricas_juego && (
                  <div>
                    <strong>Métricas del Juego:</strong>
                    <pre style={{ marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "var(--color-card-secondary)", borderRadius: "8px", overflow: "auto" }}>
                      {JSON.stringify(selectedSesion.metricas_juego, null, 2)}
                    </pre>
                  </div>
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

export default SesionesJuego;
