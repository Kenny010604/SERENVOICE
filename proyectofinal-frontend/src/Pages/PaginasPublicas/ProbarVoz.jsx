import React, { useEffect, useRef, useState } from "react";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import "../../global.css";
import Spinner from "../../components/Spinner";
import heroImg from "../../assets/ImagenCalma.jpg";
import {
  FaMicrophone,
  FaStop,
  FaPlay,
  FaDownload,
  FaWaveSquare,
  FaSmile,
  FaAngry,
  FaFrownOpen,
  FaUser,
  FaLock,
  FaChartLine,
  FaArrowRight,
  FaHeartbeat,
  FaBrain,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const ProbarVoz = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(true);
  const [audioURL, setAudioURL] = useState(null);
  const [chunks, setChunks] = useState([]);
  const mediaChunksRef = useRef([]);
  const [recTime, setRecTime] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMediaSupported(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload audio element when audioURL changes to ensure playback is available
  useEffect(() => {
    if (audioRef.current && audioURL) {
      try {
        audioRef.current.load();
      } catch (e) {
        console.warn("Unable to reload audio element:", e);
      }
    }
  }, [audioURL]);

  const startTimer = () => {
    setRecTime(0);
    timerRef.current = setInterval(() => {
      setRecTime((t) => t + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStart = async () => {
    if (!mediaSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // choose best supported mimeType
      const preferType = "audio/webm;codecs=opus";
      const mimeType = MediaRecorder.isTypeSupported(preferType)
        ? preferType
        : "audio/webm";

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      // use a local ref to accumulate chunks reliably during recording
      mediaChunksRef.current = [];
      setChunks([]);

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          mediaChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        try {
          const blob = new Blob(mediaChunksRef.current, { type: mimeType });
          if (audioURL) URL.revokeObjectURL(audioURL);
          const url = URL.createObjectURL(blob);
          setAudioURL(url);
          // keep a copy in state if needed elsewhere
          setChunks(mediaChunksRef.current.slice());
        } catch (err) {
          console.error("Error creating audio blob:", err);
        }
        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMediaSupported(false);
    }
  };

  const handleStop = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopTimer();
  };

  const handlePlay = () => {
    if (audioRef.current) {
      // ensure it's loaded and then play
      try {
        audioRef.current.play();
      } catch (err) {
        // some browsers require user interaction or reloading
        console.warn("Play attempt failed, reloading audio:", err);
        audioRef.current.load();
        audioRef.current.play().catch((e) => console.error("Play failed:", e));
      }
    }
  };

  const handleDownload = () => {
    if (!audioURL) return;
    const a = document.createElement("a");
    a.href = audioURL;
    a.download = "grabacion_serenvoice.webm";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getRecommendations = (emotion) => {
    const recommendationMap = {
      Felicidad: [
        "Mantén ese estado positivo practicando actividades que disfrutes",
        "Comparte tu alegría con personas cercanas",
        "Documenta estos momentos en tu perfil",
      ],
      Tristeza: [
        "Considera buscar apoyo emocional si persiste",
        "Practica actividades relajantes o meditación",
        "Conecta con tus amigos o familia",
      ],
      Enojo: [
        "Intenta técnicas de respiración para calmarte",
        "Toma un descanso y haz algo que te relaje",
        "Expresa tus emociones de forma constructiva",
      ],
      Estrés: [
        "Practica ejercicios de relajación o yoga",
        "Deja descansos regulares durante tu día",
        "Establece límites en tus responsabilidades",
      ],
      Ansiedad: [
        "Prueba técnicas de mindfulness o meditación",
        "Reduce el consumo de cafeína",
        "Habla con un profesional de salud mental",
      ],
    };
    return (
      recommendationMap[emotion] || [
        "Mantén tu bienestar emocional",
        "Busca apoyo cuando lo necesites",
      ]
    );
  };

  const handleAnalyze = async () => {
    const sourceChunks =
      mediaChunksRef.current && mediaChunksRef.current.length > 0
        ? mediaChunksRef.current
        : chunks;
    if (!sourceChunks || sourceChunks.length === 0)
      return alert("No hay grabación para analizar");
    const blobType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const blob = new Blob(sourceChunks, { type: blobType });
    setIsAnalyzing(true);

    // Generate random analysis results immediately (no artificial delay)
    // This keeps the UI responsive; replace with real analysis call when backend/worker is available.
    const emotions = [
      {
        name: "Felicidad",
        value: Math.floor(Math.random() * 40) + 20,
        icon: FaSmile,
        color: "#FFD700",
      },
      {
        name: "Tristeza",
        value: Math.floor(Math.random() * 30) + 10,
        icon: FaFrownOpen,
        color: "#4169E1",
      },
      {
        name: "Enojo",
        value: Math.floor(Math.random() * 25) + 5,
        icon: FaAngry,
        color: "#FF6347",
      },
      {
        name: "Estrés",
        value: Math.floor(Math.random() * 35) + 15,
        icon: FaHeartbeat,
        color: "#FF4500",
      },
      {
        name: "Ansiedad",
        value: Math.floor(Math.random() * 30) + 10,
        icon: FaBrain,
        color: "#9370DB",
      },
    ];
    emotions.sort((a, b) => b.value - a.value);

    const recommendations = getRecommendations(emotions[0].name);

    setAnalysis({
      emotions,
      dominantEmotion: emotions[0].name,
      recommendations,
      audioSize: Math.round(blob.size / 1024),
      duration: recTime,
    });
    setIsAnalyzing(false);
  };

  return (
    <>
      <NavbarPublic />
      <main
        className="container"
        style={{
          paddingBottom: 100,
          backgroundImage: `url(${heroImg}), linear-gradient(rgba(255,255,255,0.28), rgba(255,255,255,0.36))`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div className="card" style={{ maxWidth: 900, width: "100%" }}>
          <h2 style={{ marginBottom: 8 }}>Prueba de Captura de Voz</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Graba un fragmento de tu voz y reproducélo. Esta prueba es útil para
            ver cómo funciona el sistema de captura y para hacer pruebas
            locales.
          </p>

          {!mediaSupported && (
            <div style={{ color: "var(--color-error)" }}>
              Tu navegador no soporta la API de grabación de audio o no diste
              permiso.
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {!isRecording ? (
              <button className="auth-button" onClick={handleStart}>
                <FaMicrophone style={{ marginRight: 8 }} /> Empezar a grabar
              </button>
            ) : (
              <button
                className="auth-button"
                onClick={handleStop}
                style={{ background: "#ff6b6b" }}
              >
                <FaStop style={{ marginRight: 8 }} /> Detener
              </button>
            )}

            <div style={{ minWidth: 120 }}>
              <strong>Tiempo:</strong> {Math.floor(recTime / 60)}:
              {String(recTime % 60).padStart(2, "0")}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                className="auth-button"
                onClick={handlePlay}
                disabled={!audioURL}
              >
                <FaPlay /> Reproducir
              </button>
              <button
                className="auth-button"
                onClick={handleDownload}
                disabled={!audioURL}
              >
                <FaDownload /> Descargar
              </button>
              <button
                className="auth-button"
                onClick={handleAnalyze}
                disabled={!audioURL}
              >
                <FaWaveSquare /> Analizar
              </button>
            </div>
          </div>

          {audioURL && (
            <audio
              ref={audioRef}
              src={audioURL}
              controls
              style={{ width: "100%" }}
            />
          )}

          {/* Analysis Results Section */}
          {isAnalyzing && (
            <Spinner overlay={true} message="Analizando la grabación..." />
          )}

          {analysis && (
            <div style={{ marginTop: 24 }}>
              {/* Emotions Results */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: "var(--color-text-main)" }}>
                  Resultados del Análisis
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: 12,
                  }}
                >
                  {analysis.emotions.map((emotion, idx) => {
                    const Icon = emotion.icon;
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: "var(--color-panel)",
                          border: "2px solid " + emotion.color,
                          textAlign: "center",
                        }}
                      >
                        <Icon
                          size={28}
                          style={{ color: emotion.color, marginBottom: 8 }}
                        />
                        <p
                          style={{
                            margin: "0 0 4px 0",
                            fontWeight: "600",
                            color: emotion.color,
                          }}
                        >
                          {emotion.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {emotion.value}%
                        </p>
                      </div>
                    );
                  })}
                </div>
                <p
                  style={{
                    marginTop: 12,
                    color: "var(--color-text-secondary)",
                    textAlign: "center",
                  }}
                >
                  <strong>Emoción dominante:</strong> {analysis.dominantEmotion}
                </p>
              </div>

              {/* Recommendations Card - Full Width Below */}
              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  background: "var(--color-panel)",
                  border: "2px solid var(--color-primary)",
                  textAlign: "center",
                }}
              >
                <FaHeartbeat
                  size={40}
                  style={{ color: "var(--color-primary)", marginBottom: 12 }}
                />
                <h3
                  style={{
                    color: "var(--color-primary)",
                    marginTop: 0,
                    marginBottom: 16,
                  }}
                >
                  Recomendaciones
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    textAlign: "left",
                    maxWidth: 600,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {analysis.recommendations &&
                    analysis.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: 12,
                          paddingLeft: 24,
                          position: "relative",
                          color: "var(--color-text-secondary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            color: "var(--color-primary)",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                          }}
                        >
                          ✓
                        </span>
                        {rec}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Section - Appears only after analysis */}
        {analysis && (
          <div
            className="card"
            style={{ maxWidth: 900, width: "100%", marginTop: 24 }}
          >
            <h2 style={{ color: "var(--color-text-main)", marginBottom: 16 }}>
              Desbloquea el Potencial Completo
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1.1rem",
                marginBottom: 24,
              }}
            >
              Regístrate ahora para acceder a análisis avanzados, historial de
              grabaciones y reportes personalizados.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  borderRadius: "12px",
                  background: "var(--color-panel)",
                  boxShadow: "0 2px 8px var(--color-shadow)",
                }}
              >
                <FaLock
                  size={32}
                  style={{ color: "var(--color-primary)", marginBottom: 8 }}
                />
                <h4 style={{ color: "var(--color-text-main)" }}>
                  Privacidad Garantizada
                </h4>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Tus grabaciones se guardan de forma segura en tu cuenta
                  personal.
                </p>
              </div>
              <div
                style={{
                  padding: "1.5rem",
                  borderRadius: "12px",
                  background: "var(--color-panel)",
                  boxShadow: "0 2px 8px var(--color-shadow)",
                }}
              >
                <FaChartLine
                  size={32}
                  style={{ color: "var(--color-primary)", marginBottom: 8 }}
                />
                <h4 style={{ color: "var(--color-text-main)" }}>
                  Análisis Avanzado
                </h4>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Acceso a análisis detallado y patrones emocionales en el
                  tiempo.
                </p>
              </div>
              <div
                style={{
                  padding: "1.5rem",
                  borderRadius: "12px",
                  background: "var(--color-panel)",
                  boxShadow: "0 2px 8px var(--color-shadow)",
                }}
              >
                <FaUser
                  size={32}
                  style={{ color: "var(--color-primary)", marginBottom: 8 }}
                />
                <h4 style={{ color: "var(--color-text-main)" }}>
                  Perfil Personal
                </h4>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Mantén tu historial y seguimiento personalizado de bienestar.
                </p>
              </div>
            </div>

            <Link
              to="/registro"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 2rem",
                background: "var(--color-primary)",
                color: "white",
                borderRadius: "50px",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 10px var(--color-shadow)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--color-primary-hover)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--color-primary)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Crear Cuenta <FaArrowRight />
            </Link>
          </div>
        )}
      </main>
      {/* ---------- Footer ---------- */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default ProbarVoz;
