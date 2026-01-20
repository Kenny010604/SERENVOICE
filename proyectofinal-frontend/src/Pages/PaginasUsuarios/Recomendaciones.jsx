import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../global.css";
import PageCard from "../../components/Shared/PageCard";
import Pagination from "../../components/Shared/Pagination";
import Spinner from "../../components/Publico/Spinner";
import { 
  FaHeart, 
  FaCheck, 
  FaHeartbeat, 
  FaPause, 
  FaPray, 
  FaDumbbell, 
  FaUserMd, 
  FaCoffee, 
  FaLeaf,
  FaExclamationTriangle,
  FaThumbsUp,
  FaThumbsDown,
  FaCalendarAlt,
  FaSync,
  FaMicrophone
} from "react-icons/fa";
import apiClient from '../../services/apiClient';
import api from '../../config/api';

const ITEMS_PER_PAGE = 10;

const Recomendaciones = () => {
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const cardRef = useRef(null);

  useEffect(() => {
    fetchRecomendaciones();
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, [recs]);

  const fetchRecomendaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Recomendaciones] Cargando recomendaciones del usuario...');
      const response = await apiClient.get(api.endpoints.recomendaciones.list);
      console.log('[Recomendaciones] Respuesta:', response.data);
      const data = response.data;
      if (data?.success) {
        const recomendaciones = data.data?.recomendaciones || [];
        console.log('[Recomendaciones] Total recomendaciones:', recomendaciones.length);
        setRecs(recomendaciones);
      } else {
        throw new Error(data?.message || 'Error al cargar recomendaciones');
      }
    } catch (e) {
      console.error('[Recomendaciones] Error:', e);
      setError(e.response?.data?.message || e.message || 'Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const markApplied = async (id) => {
    setMarkingId(id);
    try {
      await apiClient.put(api.endpoints.recomendaciones.marcarAplicada(id));
      setRecs((prev) =>
        prev.map((r) => (r.id_recomendacion === id ? { ...r, aplica: 1, fecha_aplica: new Date().toISOString() } : r))
      );
    } catch (e) {
      console.error('[Recomendaciones] Error al marcar:', e);
    } finally {
      setMarkingId(null);
    }
  };

  const markUtil = async (id, util) => {
    try {
      await apiClient.put(api.endpoints.recomendaciones.marcarUtil(id), { util });
      setRecs((prev) =>
        prev.map((r) => (r.id_recomendacion === id ? { ...r, util: util ? 1 : 0 } : r))
      );
    } catch (e) {
      console.error('[Recomendaciones] Error al marcar útil:', e);
    }
  };

  const getTipoIcon = (tipo) => {
    const t = (tipo || '').toString().toLowerCase();
    switch (t) {
      case 'respiracion': return FaHeartbeat;
      case 'pausa_activa': return FaPause;
      case 'meditacion': return FaPray;
      case 'ejercicio': return FaDumbbell;
      case 'profesional': return FaUserMd;
      case 'habito': return FaCoffee;
      default: return FaLeaf;
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return '#d32f2f';
      case 'media': return '#ff9800';
      case 'baja': return '#4caf50';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getTipoLabel = (tipo) => {
    const t = (tipo || '').toString().toLowerCase();
    const labels = {
      'respiracion': 'Respiración',
      'pausa_activa': 'Pausa Activa',
      'meditacion': 'Meditación',
      'ejercicio': 'Ejercicio',
      'profesional': 'Profesional',
      'habito': 'Hábito',
    };
    return labels[t] || tipo || 'General';
  };

  // Calcular datos paginados
  const totalPages = Math.ceil(recs.length / ITEMS_PER_PAGE);
  const paginatedRecs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return recs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [recs, currentPage]);

  // Reset a página 1 cuando cambian los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [recs.length]);

  return (
    <div className="recomendaciones-content page-content">
      {loading && <Spinner overlay={true} message="Cargando recomendaciones..." />}

      <PageCard
        ref={cardRef}
        size="xl"
        className="reveal"
        data-revealdelay="60"
      >
        <h2>
          <FaHeart /> Recomendaciones
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Sigue las recomendaciones personalizadas generadas por el sistema basadas en tus análisis emocionales.
        </p>

        {error && (
          <div style={{
            color: "#d32f2f",
            padding: 16,
            background: "#ffebee",
            borderRadius: 8,
            border: "2px solid #ef5350",
            marginTop: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FaExclamationTriangle size={20} />
              <strong>Error: {error}</strong>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          {!loading && recs.length === 0 && !error && (
            <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
              <FaLeaf size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }} />
              <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
                No tienes recomendaciones todavía. Realiza un análisis de voz para recibir recomendaciones personalizadas.
              </p>
            </div>
          )}

          {paginatedRecs.map((r) => {
            const Icon = getTipoIcon(r.tipo_recomendacion);
            const prioridad = r.prioridad || 'media';
            const isAplicada = r.aplica === 1 || r.aplica === true;
            const isUtil = r.util === 1 || r.util === true;
            
            return (
              <div
                key={r.id_recomendacion}
                className="panel"
                style={{ 
                  marginBottom: "0.75rem",
                  padding: 16,
                  borderLeft: `4px solid ${getPrioridadColor(prioridad)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Icon style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }} />
                      <h4 style={{ margin: 0 }}>{getTipoLabel(r.tipo_recomendacion)}</h4>
                      <span style={{
                        marginLeft: 8,
                        fontSize: '0.7rem',
                        background: getPrioridadColor(prioridad),
                        color: 'white',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>{prioridad}</span>
                    </div>
                    <p style={{
                      marginTop: "0.5rem",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {r.contenido}
                    </p>
                    
                    {r.fecha_generacion && (
                      <div style={{ 
                        marginTop: '0.75rem', 
                        fontSize: '0.8rem', 
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <FaCalendarAlt size={12} />
                        {new Date(r.fecha_generacion).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        {r.clasificacion && (
                          <span style={{ marginLeft: 12 }}>
                            • Clasificación: <strong>{r.clasificacion}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem", marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button
                    disabled={isAplicada || markingId === r.id_recomendacion}
                    onClick={() => markApplied(r.id_recomendacion)}
                    style={{
                      opacity: isAplicada ? 0.7 : 1,
                      background: isAplicada ? '#4caf50' : undefined,
                      color: isAplicada ? 'white' : undefined
                    }}
                  >
                    <FaCheck style={{ marginRight: 6 }} />
                    {markingId === r.id_recomendacion ? 'Guardando...' : (isAplicada ? "Aplicada" : "Marcar como aplicada")}
                  </button>
                  
                  {isAplicada && (
                    <>
                      <button
                        onClick={() => markUtil(r.id_recomendacion, true)}
                        style={{
                          background: isUtil ? '#2196f3' : 'var(--color-panel)',
                          color: isUtil ? 'white' : 'var(--color-text)'
                        }}
                        title="Me fue útil"
                      >
                        <FaThumbsUp />
                      </button>
                      <button
                        onClick={() => markUtil(r.id_recomendacion, false)}
                        style={{
                          background: r.util === 0 && r.util !== null ? '#f44336' : 'var(--color-panel)',
                          color: r.util === 0 && r.util !== null ? 'white' : 'var(--color-text)'
                        }}
                        title="No me fue útil"
                      >
                        <FaThumbsDown />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Componente de paginación */}
          {recs.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={recs.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </PageCard>
    </div>
  );
};

export default Recomendaciones;
