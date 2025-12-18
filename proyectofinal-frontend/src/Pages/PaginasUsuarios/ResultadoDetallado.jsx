import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavbarUsuario from "../../components/Usuario/NavbarUsuario";
import Spinner from "../../components/Publico/Spinner";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import { 
  FaChartLine, 
  FaLightbulb, 
  FaExclamationTriangle,
  FaSmile,
  FaAngry,
  FaHeartbeat,
  FaBrain,
  FaMeh,
  FaSadTear,
  FaSurprise,
  FaFrownOpen,
  FaUserMd,
  FaDumbbell,
  FaPray,
  FaPause,
  FaCoffee,
  FaLeaf
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ResultadoDetallado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await fetch(`${API_URL}/api/analisis/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        console.debug('[ResultadoDetallado] payload', json);
        if (!res.ok || json.success === false) {
          throw new Error(json.message || `Error ${res.status}`);
        }
        const payload = json.data || { analisis: null, resultado: null, recomendaciones: [] };
        setData(payload);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    const fetchAudio = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_URL}/api/analisis/${id}/audio`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.debug('[ResultadoDetallado] audio fetch failed', res.status);
          return;
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setAudioUrl(objectUrl);
      } catch (e) {
        console.debug('[ResultadoDetallado] audio fetch error', e);
      }
    };

    if (data && data.analisis && data.analisis.ruta_archivo) {
      fetchAudio();
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, data]);

  const getEmotionColor = (emotion) => {
    return (
      {
        Felicidad: "#ffb703",
        Tristeza: "#4361ee",
        Enojo: "#e63946",
        Estrés: "#e76f51",
        Ansiedad: "#9b5de5",
        Neutral: "#6c757d",
        Miedo: "#7e22ce",
        Sorpresa: "#2a9d8f",
      }[emotion]
    ) || "#6c757d";
  };

  const getEmotionIcon = (emotion) => {
    const iconMap = {
      Felicidad: FaSmile,
      Tristeza: FaSadTear,
      Enojo: FaAngry,
      Estrés: FaHeartbeat,
      Ansiedad: FaBrain,
      Neutral: FaMeh,
      Miedo: FaFrownOpen,
      Sorpresa: FaSurprise,
    };
    return iconMap[emotion] || FaMeh;
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return '#d32f2f';
      case 'media': return '#ff9800';
      case 'baja': return '#4caf50';
      default: return 'var(--color-text-secondary)';
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

  return (
    <>
      <NavbarUsuario />
      <main
        className="container"
        style={{
          paddingTop: "2rem",
          paddingBottom: "4rem",
          backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        {loading && <Spinner overlay={true} message="Cargando detalle..." />}

        {error && (
          <div className="card" style={{ maxWidth: 900, width: "100%" }}>
            <div style={{
              color: "#d32f2f",
              padding: 16,
              background: "#ffebee",
              borderRadius: 8,
              border: "2px solid #ef5350"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FaExclamationTriangle size={20} />
                <strong>Error: {error}</strong>
              </div>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Card de Detalles del Análisis */}
            {data.analisis && (
              <div className="card" style={{ maxWidth: 900, width: "100%", marginBottom: 24 }}>
                <h2 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaChartLine /> Detalles del Análisis
                </h2>
                <div className="panel" style={{ padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    {data.analisis.fecha_analisis && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Fecha del análisis</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {new Date(data.analisis.fecha_analisis).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {data.analisis.estado_analisis && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Estado</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.analisis.estado_analisis}</p>
                      </div>
                    )}
                    {data.analisis.modelo_usado && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Modelo</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.analisis.modelo_usado}</p>
                      </div>
                    )}
                    {data.analisis.nombre_archivo && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Archivo</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.analisis.nombre_archivo}</p>
                      </div>
                    )}
                    {data.resultado && data.resultado.clasificacion && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Clasificación</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.resultado.clasificacion}</p>
                      </div>
                    )}
                    {data.resultado && data.resultado.confianza_modelo && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Confianza del Modelo</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.resultado.confianza_modelo}%</p>
                      </div>
                    )}
                    {data.analisis.fecha_grabacion && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Fecha de grabación</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {new Date(data.analisis.fecha_grabacion).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {data.analisis.duracion !== undefined && (
                      <div>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Duración</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.analisis.duracion}s</p>
                      </div>
                    )}
                    {data.analisis.ruta_archivo && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)", marginBottom: 8 }}>Audio</p>
                        {audioUrl ? (
                          <>
                            <audio controls style={{ width: "100%" }}>
                              <source src={audioUrl} type="audio/wav" />
                              Tu navegador no soporta el elemento audio.
                            </audio>
                            <div style={{ marginTop: 8 }}>
                              <a href={audioUrl} download>Descargar archivo</a>
                              <span style={{ marginLeft: 12 }}>
                                <a href={audioUrl} target="_blank" rel="noreferrer">Abrir en pestaña nueva</a>
                              </span>
                            </div>
                          </>
                        ) : (
                          <p style={{ margin: 0 }}>Cargando audio...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Card de Niveles Emocionales */}
            {data.resultado && (
              <div className="card" style={{ maxWidth: 900, width: "100%", marginBottom: 24 }}>
                <h2 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaChartLine style={{ color: "var(--color-primary)" }} /> Niveles Emocionales Detectados
                </h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                }}>
                  {(() => {
                    // Definir el orden de las emociones
                    const preferred = [
                      'Felicidad', 'Tristeza', 'Enojo', 'Estrés',
                      'Ansiedad', 'Neutral', 'Miedo', 'Sorpresa'
                    ];
                    
                    // Mapear valores del resultado
                    const niveles = {
                      'Felicidad': data.resultado.nivel_felicidad || 0,
                      'Tristeza': data.resultado.nivel_tristeza || 0,
                      'Enojo': data.resultado.nivel_enojo || 0,
                      'Estrés': data.resultado.nivel_estres || 0,
                      'Ansiedad': data.resultado.nivel_ansiedad || 0,
                      'Neutral': data.resultado.nivel_neutral || 0,
                      'Miedo': data.resultado.nivel_miedo || 0,
                      'Sorpresa': data.resultado.nivel_sorpresa || 0,
                    };

                    return preferred.map((name, idx) => {
                      const value = niveles[name] || 0;
                      const Icon = getEmotionIcon(name);
                      const color = getEmotionColor(name);
                      return (
                        <div key={idx} style={{ 
                          padding: 12, 
                          borderRadius: 14, 
                          background: "var(--color-panel)", 
                          border: `3px solid ${color}`,
                          aspectRatio: "1 / 1",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10
                        }}>
                          <Icon size={56} style={{ color }} />
                          <p style={{ margin: 0, fontWeight: 800, color, fontSize: "1.05rem", textAlign: "center" }}>{name}</p>
                          <span style={{ fontWeight: 800 }}>{value}%</span>
                          <div style={{ width: "100%", height: 8, background: "#e0e0e0", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", background: color }}></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Card de Recomendaciones */}
            <div className="card" style={{ maxWidth: 900, width: "100%", marginBottom: 24 }}>
              <h2 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <FaLightbulb style={{ color: "var(--color-primary)" }} /> Recomendaciones Personalizadas
              </h2>
              {data.recomendaciones && data.recomendaciones.length > 0 ? (
                <div>
                  {data.recomendaciones.map((rec, idx) => {
                    const titulo = rec.titulo || (rec.tipo_recomendacion ? rec.tipo_recomendacion.charAt(0).toUpperCase() + rec.tipo_recomendacion.slice(1) : `Recomendación ${idx + 1}`);
                    const texto = rec.descripcion || rec.contenido || rec.texto || "";
                    const tipo = (rec.tipo_recomendacion || rec.tipo || '').toString().toLowerCase();
                    const prioridad = tipo === 'profesional' ? 'alta' : (tipo === 'respiracion' ? 'media' : 'media');
                    const Icon = getTipoIcon(tipo);
                    
                    return (
                      <div key={idx} className="panel" style={{
                        marginBottom: '1rem',
                        padding: 16,
                        borderLeft: `4px solid ${getPrioridadColor(prioridad)}`,
                        background: 'var(--color-panel)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Icon style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }} />
                              <h4 style={{ margin: 0 }}>{titulo}</h4>
                              {rec.origen === 'ia' && (
                                <span style={{
                                  marginLeft: 8,
                                  fontSize: '0.75rem',
                                  background: '#e3f2fd',
                                  color: '#1565c0',
                                  border: '1px solid #64b5f6',
                                  borderRadius: 6,
                                  padding: '2px 6px'
                                }}>IA</span>
                              )}
                            </div>
                            <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)', margin: 0 }}>{texto}</p>
                          </div>
                          <div style={{
                            background: getPrioridadColor(prioridad),
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                          }}>{prioridad.toUpperCase()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="panel" style={{ padding: 16 }}>
                  <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
                    No hay recomendaciones registradas para este análisis.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {!loading && !error && !data && (
          <div className="card" style={{ maxWidth: 900, width: "100%" }}>
            <div className="panel" style={{ padding: 16 }}>
              <p style={{ margin: 0 }}>No se encontraron datos para este análisis.</p>
            </div>
          </div>
        )}
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default ResultadoDetallado;
