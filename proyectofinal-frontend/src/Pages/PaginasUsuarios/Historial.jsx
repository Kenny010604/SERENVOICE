import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Publico/Spinner";
import analisisService from "../../services/analisisService";
import "../../global.css";
import PageCard from "../../components/Shared/PageCard";
import Pagination from "../../components/Shared/Pagination";
import { FaHistory, FaPlay, FaDownload, FaEye } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const Historial = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const cardRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, [history]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await analisisService.getHistory(50);
      if (response.success) {
        setHistory(response.data || []);
      } else {
        setError(response.message || "Error al cargar historial");
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setError(err.message || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      completado: { color: "#4caf50", text: "Completado" },
      pendiente: { color: "#ff9800", text: "Pendiente" },
      error: { color: "#f44336", text: "Error" }
    };
    const info = estados[estado?.toLowerCase()] || { color: "#9e9e9e", text: estado || "Desconocido" };
    return (
      <span style={{
        background: `${info.color}22`,
        color: info.color,
        padding: "0.25rem 0.75rem",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600"
      }}>
        {info.text}
      </span>
    );
  };

  const getClasificacionColor = (clasificacion) => {
    const colores = {
      "muy alto": "#d32f2f",
      "alto": "#f57c00",
      "moderado": "#fbc02d",
      "bajo": "#7cb342",
      "muy bajo": "#388e3c",
      "neutral": "#5c6bc0"
    };
    return colores[clasificacion?.toLowerCase()] || "#9e9e9e";
  };

  const handleViewDetail = (idAnalisis) => {
    navigate(`/resultado-detallado/${idAnalisis}`);
  };

  // Calcular datos paginados
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return history.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [history, currentPage]);

  // Reset a página 1 cuando cambian los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [history.length]);

  return (
    <div className="historial-content page-content">
      {loading && <Spinner message="Cargando historial..." />}
        
        <PageCard
          ref={cardRef}
          size="xl"
          className="reveal"
          data-revealdelay="60"
        >
          <h2>
            <FaHistory /> Historial de Análisis
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            Revisa tus análisis previos y accede a los resultados detallados.
          </p>

          {error && (
            <div style={{
              background: "rgba(244, 67, 54, 0.1)",
              color: "#f44336",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            {!loading && history.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--color-text-secondary)"
              }}>
                <FaHistory size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                <p>No hay análisis registrados todavía.</p>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Realiza tu primer análisis de voz para ver los resultados aquí.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 0.5rem"
                }}>
                  <thead>
                    <tr style={{
                      color: "var(--color-text-main)",
                      fontWeight: "600",
                      fontSize: "0.9rem"
                    }}>
                      <th style={{ textAlign: "left", padding: "0.75rem" }}>Fecha</th>
                      <th style={{ textAlign: "left", padding: "0.75rem" }}>Audio</th>
                      <th style={{ textAlign: "center", padding: "0.75rem" }}>Duración</th>
                      <th style={{ textAlign: "center", padding: "0.75rem" }}>Estado</th>
                      <th style={{ textAlign: "center", padding: "0.75rem" }}>Clasificación</th>
                      <th style={{ textAlign: "center", padding: "0.75rem" }}>Nivel</th>
                      <th style={{ textAlign: "center", padding: "0.75rem" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((item) => (
                      <tr
                        key={item.id_analisis}
                        style={{
                          background: "var(--color-panel)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px var(--color-shadow)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td style={{ padding: "1rem", borderRadius: "8px 0 0 8px" }}>
                          <div style={{ fontSize: "0.9rem" }}>
                            {formatDate(item.fecha_analisis)}
                          </div>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                            {item.nombre_archivo || "Audio sin nombre"}
                          </div>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          <div style={{ fontSize: "0.9rem" }}>
                            {formatDuration(item.duracion)}
                          </div>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          {getEstadoBadge(item.estado_analisis)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          {item.clasificacion ? (
                            <span style={{
                              color: getClasificacionColor(item.clasificacion),
                              fontWeight: "600",
                              fontSize: "0.9rem"
                            }}>
                              {item.clasificacion}
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                              N/A
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          {item.nivel_estres !== null && item.nivel_estres !== undefined ? (
                            <div style={{ fontSize: "0.9rem" }}>
                              <div>Estrés: <strong>{item.nivel_estres}%</strong></div>
                              {item.nivel_ansiedad !== null && (
                                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                                  Ansiedad: {item.nivel_ansiedad}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                              N/A
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center", borderRadius: "0 8px 8px 0" }}>
                          <button
                            onClick={() => handleViewDetail(item.id_analisis)}
                            style={{
                              background: "var(--color-primary)",
                              color: "#fff",
                              border: "none",
                              padding: "0.5rem 1rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              fontSize: "0.9rem",
                              transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "var(--color-primary-hover)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "var(--color-primary)";
                            }}
                          >
                            <FaEye /> Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Componente de paginación */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={history.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </div>
        </PageCard>
    </div>
  );
};

export default Historial;
