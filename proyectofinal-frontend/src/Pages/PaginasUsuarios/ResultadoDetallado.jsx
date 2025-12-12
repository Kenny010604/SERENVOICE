import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavbarUsuario from "../../components/NavbarUsuario";
import Spinner from "../../components/Spinner";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import { FaChartLine, FaLightbulb, FaExclamationTriangle } from "react-icons/fa";

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
        <div className="card" style={{ maxWidth: 900, width: "100%" }}>
          <h2 style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <FaChartLine /> Resultado del Análisis
          </h2>

          {loading && <Spinner overlay={true} message="Cargando detalle..." />}

          {error && (
            <div style={{
              color: "#d32f2f",
              padding: 16,
              background: "#ffebee",
              borderRadius: 8,
              marginTop: 16,
              border: "2px solid #ef5350"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FaExclamationTriangle size={20} />
                <strong>Error: {error}</strong>
              </div>
            </div>
          )}

          {data && (
            <>
              {data.resultado && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 16,
                  }}>
                    <div className="panel" style={{ padding: 16 }}>
                      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Estrés</p>
                      <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700 }}>{data.resultado.nivel_estres}%</p>
                    </div>
                    <div className="panel" style={{ padding: 16 }}>
                      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Ansiedad</p>
                      <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700 }}>{data.resultado.nivel_ansiedad}%</p>
                    </div>
                    <div className="panel" style={{ padding: 16 }}>
                      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Clasificación</p>
                      <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>{data.resultado.clasificacion}</p>
                    </div>
                    <div className="panel" style={{ padding: 16 }}>
                      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Confianza del Modelo</p>
                      <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>{data.resultado.confianza_modelo}%</p>
                    </div>
                    {data.resultado.fecha_resultado && (
                      <div className="panel" style={{ padding: 16 }}>
                        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Fecha del resultado</p>
                          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                            {new Date(data.resultado.fecha_resultado).toLocaleString()}
                          </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.analisis && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaChartLine /> Datos del Análisis
                  </h3>
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
                      {data.analisis.ruta_archivo && (
                        <div>
                          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Ruta</p>
                          <p style={{ margin: 0, fontWeight: 600 }}>
                            <code>{data.analisis.ruta_archivo}</code>
                          </p>
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
                      {data.analisis.ruta_archivo && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Audio</p>
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
                      {data.analisis.duracion !== undefined && (
                        <div>
                          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Duración</p>
                          <p style={{ margin: 0, fontWeight: 600 }}>{data.analisis.duracion}s</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaLightbulb /> Recomendaciones Personalizadas
                </h3>
                {data.recomendaciones && data.recomendaciones.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    {data.recomendaciones.map((rec, idx) => {
                      const titulo = rec.titulo || rec.tipo || rec.tipo_recomendacion || `Recomendación ${idx + 1}`;
                      const descripcion = rec.descripcion || rec.contenido || rec.texto || "";
                      const enlace = rec.enlace || rec.link || rec.url || null;
                      return (
                        <div key={idx} className="panel" style={{ padding: 16 }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{titulo}</p>
                          {descripcion && (
                            <p style={{ margin: "6px 0 0 0", color: "var(--color-text-secondary)" }}>{descripcion}</p>
                          )}
                          {enlace && (
                            <p style={{ margin: "8px 0 0 0" }}>
                              <a href={enlace} target="_blank" rel="noreferrer">Más información</a>
                            </p>
                          )}
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
            <div className="panel" style={{ padding: 16 }}>
              <p style={{ margin: 0 }}>No se encontraron datos para este análisis.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default ResultadoDetallado;
