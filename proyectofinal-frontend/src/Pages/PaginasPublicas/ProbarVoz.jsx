// src/Pages/PaginasPublicas/ProbarVoz.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import AudioPlayer from "../../components/Publico/AudioPlayer";
import "../../global.css";
import Spinner from "../../components/Publico/Spinner";
import { ThemeContext } from "../../context/themeContextDef";
import PaisajeClaro from "../../assets/PaisajeClaro.svg";
import PaisajeOscuro from "../../assets/PaisajeOscuro.svg";
import {
  FaMicrophone,
  FaStop,
  FaPlay,
  FaDownload,
  FaWaveSquare,
  FaExclamationTriangle,
  FaHeartbeat,
  FaSmile,
  FaAngry,
  FaSadCry,
  FaSadTear,
  FaBrain,
  FaMeh,
  FaFrownOpen,
  FaSurprise,
  FaChartLine,
  FaUserPlus,
  FaLock,
  FaUser,
  FaArrowRight,
  FaGamepad,
  FaUsers,
  FaLightbulb,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProbarVoz = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(true);
  const [audioURL, setAudioURL] = useState(null);
  const mediaChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const [recTime, setRecTime] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // Pasajes para LECTURA EN VOZ ALTA (el usuario solo los lee)
  const phrases = [
    "En un día soleado caminé por un sendero lleno de hojas crujientes, respiré profundamente y observé cómo la luz jugaba entre las ramas, sintiendo la calma recorrer mi cuerpo mientras avanzaba paso a paso.",
    "Había una pequeña cafetería en la esquina donde el aroma del café recién hecho llenaba el aire y la gente conversaba en voz baja, una escena cotidiana que invitaba a quedarse y escuchar el murmullo de la ciudad.",
    "El río corría pausado junto al puente, reflejando el cielo y las nubes que pasaban lentamente, mientras una brisa suave traía recuerdos de otras tardes similares que ahora parecían memorias cálidas.",
    "Una mañana comencé a ordenar mi escritorio, encontré notas antiguas y pequeñas fotos, recordé sonrisas y conversaciones y me detuve un momento para sonreír sin razón antes de seguir con el día.",
    "Caminé por la playa sintiendo la arena fría bajo los pies, vi las olas romper en la orilla y dejé que el sonido rítmico del mar me llevara siguiendo la respiración hasta relajar mi cuerpo por completo.",
    "En un jardín florecido observé los colores y los insectos trabajando, pensé en las pequeñas cosas que pasan desapercibidas y en cómo cada detalle forma parte de una escena tranquila y agradable."
  ];
  const [suggestedPhrase, setSuggestedPhrase] = useState("");

  useEffect(() => {
    setSuggestedPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Verificar soporte de micrófono
  useEffect(() => {
    const checkMediaSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMediaSupported(false);
        setError("Tu navegador no soporta la grabación de audio. Usa Chrome, Firefox o Edge.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMediaSupported(true);
        setError(null);
      } catch (err) {
        console.error("Error de permisos:", err);
        setMediaSupported(false);
        setError(
          err.name === "NotAllowedError"
            ? "Debes permitir el acceso al micrófono."
            : "Error al acceder al micrófono: " + err.message
        );
      }
    };
    checkMediaSupport();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Temporizador
  const startTimer = () => {
    setRecTime(0);
    timerRef.current = setInterval(() => setRecTime((t) => t + 1), 1000);
  };
  const stopTimer = () => timerRef.current && clearInterval(timerRef.current);

  // Grabación
  const handleStart = async () => {
    if (!mediaSupported) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
      });

      // Seleccionar un mimeType soportado
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      mediaChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) mediaChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const recordedMimeType = mr.mimeType;
        const blob = new Blob(mediaChunksRef.current, { type: recordedMimeType });
        if (audioURL) URL.revokeObjectURL(audioURL);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMediaSupported(false);
      setError("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopTimer();

    // Auto-analizar poco después de detener
    setTimeout(() => {
      if (audioURL) handleAnalyze();
    }, 500);
  };

  const handlePlay = () => audioRef.current?.play();
  const handleDownload = () => {
    if (!audioURL) return;
    const a = document.createElement("a");
    a.href = audioURL;
    a.download = `grabacion_serenvoice_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Analizar audio
  const handleAnalyze = async () => {
    if (!audioURL) {
      setError("No hay audio para analizar.");
      return;
    }
    try {
      setIsAnalyzing(true);
      setError(null);

      if (!audioURL) {
        setError("No hay audio para analizar.");
        return;
      }

      const blob = new Blob(mediaChunksRef.current, { type: "audio/webm;codecs=opus" });
      const formData = new FormData();
      formData.append("audio", blob, "grabacion.webm");

      const res = await fetch(`${API_URL}/api/audio/analyze`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error del servidor: " + res.status);
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Error analyzing audio:", err);
      setError(err.message || "Error al analizar el audio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ------------------------------------------------------------
  // 🔥 CALCULAR NIVELES DE ESTRÉS Y ANSIEDAD
  // ------------------------------------------------------------
  const calcularIndicadores = () => {
    if (!analysis) return null;

    let nivelEstres = 0;
    let nivelAnsiedad = 0;

    analysis.emotions.forEach((emo) => {
      if (["Enojo", "Miedo", "Asustado"].includes(emo.name)) nivelEstres += emo.value;
      if (["Miedo", "Asustado"].includes(emo.name)) nivelAnsiedad += emo.value;
    });

    const calcNivel = (valor) => {
      if (valor >= 70) return "ALTO";
      if (valor >= 40) return "MEDIO";
      return "BAJO";
    };

    return {
      estres: { porcentaje: nivelEstres, nivel: calcNivel(nivelEstres) },
      ansiedad: { porcentaje: nivelAnsiedad, nivel: calcNivel(nivelAnsiedad) },
    };
  };

  const indicadores = calcularIndicadores();

  // Navegación del carrusel
  const benefitCards = [
    { icon: FaLock, title: "Privacidad Garantizada", description: "Tus grabaciones se guardan de forma segura en tu cuenta personal." },
    { icon: FaChartLine, title: "Análisis Avanzado", description: "Acceso a análisis detallado y patrones emocionales en el tiempo." },
    { icon: FaUser, title: "Perfil Personal", description: "Mantén tu historial y seguimiento personalizado de bienestar." },
    { icon: FaGamepad, title: "Juegos Terapéuticos", description: "Accede a juegos diseñados para mejorar tu bienestar emocional." },
    { icon: FaUsers, title: "Grupos de Apoyo", description: "Únete a comunidades de apoyo y comparte experiencias." },
    { icon: FaLightbulb, title: "Recomendaciones IA", description: "Recibe sugerencias personalizadas basadas en tus análisis." },
  ];

  const handlePrevCard = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextCard = () => {
    setCarouselIndex((prev) => (prev < benefitCards.length - 3 ? prev + 1 : prev));
  };

  // Iconos y colores para emociones
  const getEmotionIcon = (emotion) => {
    const iconMap = {
      Felicidad: FaSmile,
      Tristeza: FaSadTear,
      Enojo: FaAngry,
      Estrés: FaFrownOpen,
      Ansiedad: FaMeh,
      Neutral: FaMeh,
      Miedo: FaFrownOpen,
      Sorpresa: FaSurprise,
    };
    return iconMap[emotion] || FaMeh;
  };

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

  return (
    <>
      <NavbarPublic />
      <main
        className="container"
        style={{
          paddingTop: "2rem",
          paddingBottom: "3rem",
          backgroundImage: `url(${isDark ? PaisajeOscuro : PaisajeClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div className="card" style={{ maxWidth: 900 }}>
          <h2>Análisis Emocional por Voz</h2>
          <p>Graba al menos 5 segundos de tu voz hablando naturalmente. La IA analizará tus emociones.</p>

          {/* Instrucción para lectura en voz alta */}
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <div style={{ padding: '12px 16px', background: 'var(--color-panel)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Lee en voz alta:</div>
              <div style={{ fontStyle: 'italic', fontSize: '0.98rem' }}>{suggestedPhrase}</div>
            </div>
          </div>

          {error && <div style={{ color: "#d32f2f", padding: 12, background: "#ffebee", borderRadius: 8 }}><FaExclamationTriangle /> {error}</div>}

          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            {!isRecording ? (
              <button className="auth-button" onClick={handleStart} disabled={!mediaSupported}>
                <FaMicrophone style={{ marginRight: 8 }} /> Empezar a grabar
              </button>
            ) : (
              <button className="auth-button" onClick={handleStop} style={{ background: "#ff6b6b" }}>
                <FaStop style={{ marginRight: 8 }} /> Detener
              </button>
            )}

            <div style={{
              minWidth: 120,
              padding: "8px 16px",
              background: isRecording ? "#ffebee" : "var(--color-panel)",
              borderRadius: 8,
              fontWeight: "bold",
              color: isRecording ? "#d32f2f" : "var(--color-text-main)",
            }}>
              {Math.floor(recTime / 60)}:{String(recTime % 60).padStart(2, "0")}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="auth-button" onClick={handlePlay} disabled={!audioURL} style={{ opacity: audioURL ? 1 : 0.5 }}>
                <FaPlay /> Reproducir
              </button>
              <button className="auth-button" onClick={handleDownload} disabled={!audioURL} style={{ opacity: audioURL ? 1 : 0.5 }}>
                <FaDownload /> Descargar
              </button>
              <button className="auth-button analyze-button" onClick={handleAnalyze} disabled={!audioURL || isAnalyzing} style={{ opacity: audioURL && !isAnalyzing ? 1 : 0.5, background: "var(--color-primary)" }}>
                <FaWaveSquare /> {isAnalyzing ? "Analizando..." : "Analizar"}
              </button>
            </div>
          </div>

          {audioURL && <AudioPlayer src={audioURL} />}
          {isAnalyzing && <Spinner overlay={true} message="Analizando emociones con IA..." />}
        </div>

        {/* Card de Resultados del Análisis */}
        {analysis && analysis.emotions && (
          <div className="card" style={{ maxWidth: 900, width: "100%", marginTop: 24 }}>
            <h3 style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <FaChartLine style={{ color: "var(--color-primary)" }} /> Resultados del Análisis
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginTop: 16,
            }}>
              {analysis.emotions.slice(0, 8).map((emotion, idx) => {
                const Icon = getEmotionIcon(emotion.name);
                const color = getEmotionColor(emotion.name);
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
                    <p style={{ margin: 0, fontWeight: 800, color, fontSize: "1.05rem", textAlign: "center" }}>{emotion.name}</p>
                    <span style={{ fontWeight: 800 }}>{emotion.value}%</span>
                    <div style={{ width: "100%", height: 8, background: "#e0e0e0", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, emotion.value))}%`, height: "100%", background: color }}></div>
                    </div>
                  </div>
                );
              })}
              
              {/* Estrés */}
              {indicadores && (
                <div style={{ 
                  padding: 12, 
                  borderRadius: 14, 
                  background: "var(--color-panel)", 
                  border: `3px solid #e76f51`,
                  aspectRatio: "1 / 1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10
                }}>
                  <FaFrownOpen size={56} style={{ color: "#e76f51" }} />
                  <p style={{ margin: 0, fontWeight: 800, color: "#e76f51", fontSize: "1.05rem", textAlign: "center" }}>Estrés</p>
                  <span style={{ fontWeight: 800 }}>{Math.round(indicadores.estres.porcentaje)}%</span>
                  <div style={{ width: "100%", height: 8, background: "#e0e0e0", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, indicadores.estres.porcentaje))}%`, height: "100%", background: "#e76f51" }}></div>
                  </div>
                </div>
              )}

              {/* Ansiedad */}
              {indicadores && (
                <div style={{ 
                  padding: 12, 
                  borderRadius: 14, 
                  background: "var(--color-panel)", 
                  border: `3px solid #9b5de5`,
                  aspectRatio: "1 / 1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10
                }}>
                  <FaMeh size={56} style={{ color: "#9b5de5" }} />
                  <p style={{ margin: 0, fontWeight: 800, color: "#9b5de5", fontSize: "1.05rem", textAlign: "center" }}>Ansiedad</p>
                  <span style={{ fontWeight: 800 }}>{Math.round(indicadores.ansiedad.porcentaje)}%</span>
                  <div style={{ width: "100%", height: 8, background: "#e0e0e0", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, indicadores.ansiedad.porcentaje))}%`, height: "100%", background: "#9b5de5" }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card de mensaje de registro */}
        {analysis && (
          <div className="card" style={{ maxWidth: 900, width: "100%", marginTop: 24 }}>
            <h2 style={{ color: "var(--color-text-main)", marginBottom: 16 }}>
              Desbloquea el Potencial Completo
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", marginBottom: 24 }}>
              Regístrate ahora para acceder a análisis avanzados, historial de
              grabaciones y reportes personalizados.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <button
                onClick={handlePrevCard}
                disabled={carouselIndex === 0}
                aria-label="Anterior"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  cursor: carouselIndex === 0 ? "not-allowed" : "pointer",
                  opacity: carouselIndex === 0 ? 0.3 : 1,
                  padding: 8,
                }}
              >
                {'<'}
              </button>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1.5rem",
                flex: 1,
              }}>
                {benefitCards.slice(carouselIndex, carouselIndex + 3).map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} style={{
                      padding: "1.5rem",
                      borderRadius: "12px",
                      background: "var(--color-panel)",
                      boxShadow: "0 2px 8px var(--color-shadow)",
                      transition: "all 0.3s ease",
                    }}>
                      <Icon size={32} style={{ color: "var(--color-primary)", marginBottom: 8 }} />
                      <h4 style={{ color: "var(--color-text-main)" }}>
                        {card.title}
                      </h4>
                      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleNextCard}
                disabled={carouselIndex >= benefitCards.length - 3}
                aria-label="Siguiente"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  cursor: carouselIndex >= benefitCards.length - 3 ? "not-allowed" : "pointer",
                  opacity: carouselIndex >= benefitCards.length - 3 ? 0.3 : 1,
                  padding: 8,
                }}
              >
                {'>'}
              </button>
            </div>

            <button
              onClick={() => navigate("/registro")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 2rem",
                background: "var(--color-primary)",
                color: "white",
                borderRadius: "50px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 10px var(--color-shadow)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 15px var(--color-shadow)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 10px var(--color-shadow)";
              }}
            >
              Crear Cuenta <FaArrowRight />
            </button>
          </div>
        )}
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default ProbarVoz;
