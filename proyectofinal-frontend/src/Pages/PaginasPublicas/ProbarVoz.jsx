// src/Pages/PaginasPublicas/ProbarVoz.jsx
import React, { useEffect, useRef, useState } from "react";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import "../../global.css";
import Spinner from "../../components/Spinner";
import heroImg from "../../assets/ImagenFondoClaro.png";
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
  FaBrain,
  FaMeh,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProbarVoz = () => {
  const navigate = useNavigate();
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

  // Verificar soporte de micrófono
  useEffect(() => {
    const checkMediaSupport = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaSupported(false);
        setError("Tu navegador no soporta grabación de audio.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        setMediaSupported(false);
        setError("Debes permitir el acceso al micrófono.");
      }
    };
    checkMediaSupport();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
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
        audio: { channelCount: 1, sampleRate: 16000 },
      });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      mediaChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, { type: mr.mimeType });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsRecording(true);
      startTimer();
    } catch {
      setError("No se pudo acceder al micrófono.");
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current.stop();
    setIsRecording(false);
    stopTimer();
  };

  const handlePlay = () => audioRef.current?.play();
  const handleDownload = () => {
    if (!audioURL) return;
    const a = document.createElement("a");
    a.href = audioURL;
    a.download = `grabacion_serenvoice_${Date.now()}.webm`;
    a.click();
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

      const blob = new Blob(mediaChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "grabacion.webm");

      const res = await fetch(`${API_URL}/api/audio/analyze`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error del servidor");
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError("Error al analizar el audio: " + err.message);
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

  const alerta = () => {
    if (!indicadores) return null;
    if (indicadores.estres.nivel === "ALTO" || indicadores.ansiedad.nivel === "ALTO")
      return { tipo: "crítico", mensaje: "⚠️ Tu estado es crítico, te recomendamos entrar al juego terapéutico.", color: "#ff3b30" };
    if (indicadores.estres.nivel === "MEDIO" || indicadores.ansiedad.nivel === "MEDIO")
      return { tipo: "alerta", mensaje: "🟠 Estás en estado de alerta, sería bueno relajarte jugando.", color: "#ff9500" };
    return { tipo: "estable", mensaje: "🟢 Tu estado emocional es estable.", color: "#34c759" };
  };

  const alertaActual = alerta();

  // Iconos y colores para emociones
  const getEmotionIcon = (emotion) => {
    const map = {
      Felicidad: FaSmile,
      Tristeza: FaSadCry,
      Enojo: FaAngry,
      Estrés: FaHeartbeat,
      Ansiedad: FaBrain,
      Neutral: FaMeh,
      Miedo: FaExclamationTriangle,
    };
    return map[emotion] || FaMeh;
  };

  const getEmotionColor = (emotion) => {
    const map = {
      Felicidad: "#FFD700",
      Tristeza: "#4169E1",
      Enojo: "#FF6347",
      Estrés: "#FF4500",
      Ansiedad: "#9370DB",
      Neutral: "#90A4AE",
      Miedo: "#FF6F00",
    };
    return map[emotion] || "#90A4AE";
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
          minHeight: "100vh",
        }}
      >
        <div className="card" style={{ maxWidth: 900 }}>
          <h2>Análisis Emocional por Voz</h2>
          <p>Graba al menos 5 segundos de tu voz hablando naturalmente. La IA analizará tus emociones.</p>

          {error && <div style={{ color: "#d32f2f", padding: 12, background: "#ffebee", borderRadius: 8 }}><FaExclamationTriangle /> {error}</div>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {!isRecording ? (
              <button className="auth-button" onClick={handleStart} disabled={!mediaSupported}><FaMicrophone /> Grabar</button>
            ) : (
              <button className="auth-button" onClick={handleStop} style={{ background: "#ff6b6b" }}><FaStop /> Detener</button>
            )}
            <div style={{ minWidth: 80, padding: "6px 12px", background: "#eee", borderRadius: 6 }}>
              {Math.floor(recTime / 60)}:{String(recTime % 60).padStart(2, "0")}
            </div>
            <button className="auth-button" onClick={handlePlay} disabled={!audioURL}><FaPlay /> Reproducir</button>
            <button className="auth-button" onClick={handleDownload} disabled={!audioURL}><FaDownload /> Descargar</button>
            <button className="auth-button" onClick={handleAnalyze} disabled={!audioURL || isAnalyzing} style={{ background: "#007bff" }}>
              <FaWaveSquare /> {isAnalyzing ? "Analizando..." : "Analizar"}
            </button>
          </div>

          {audioURL && <audio ref={audioRef} src={audioURL} controls style={{ width: "100%" }} />}
          {isAnalyzing && <Spinner overlay message="Analizando..." />}

          {/* Emociones individuales */}
          {analysis && (
            <div style={{ marginTop: 24 }}>
              <h3>Resultados por emoción</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 140px)", gap: 15 }}>
                {analysis.emotions.map((emo, idx) => {
                  const Icon = getEmotionIcon(emo.name);
                  const color = getEmotionColor(emo.name);
                  return (
                    <div key={idx} style={{ padding: 15, border: `2px solid ${color}`, borderRadius: 10, textAlign: "center" }}>
                      <Icon size={36} style={{ color, marginBottom: 4 }} />
                      <p><b>{emo.name}</b></p>
                      <p style={{ fontSize: 22 }}>{emo.value}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Indicadores de Estrés y Ansiedad + alerta */}
          {indicadores && (
            <>
              <h3 style={{ marginTop: 30 }}>Indicadores Clave</h3>
              <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                <div style={{
                  padding: 20, borderRadius: 12, background: "white",
                  width: 250, boxShadow: "0 3px 10px rgba(0,0,0,0.1)", textAlign: "center"
                }}>
                  <FaExclamationTriangle size={40} color="#ff3b30" />
                  <h4>Estrés</h4>
                  <p style={{ fontSize: 25, fontWeight: "bold" }}>{indicadores.estres.porcentaje}%</p>
                  <span style={{ background: "#ff3b30", padding: "5px 15px", color: "white", borderRadius: 12 }}>{indicadores.estres.nivel}</span>
                </div>
                <div style={{
                  padding: 20, borderRadius: 12, background: "white",
                  width: 250, boxShadow: "0 3px 10px rgba(0,0,0,0.1)", textAlign: "center"
                }}>
                  <FaHeartbeat size={40} color="#8e44ad" />
                  <h4>Ansiedad</h4>
                  <p style={{ fontSize: 25, fontWeight: "bold" }}>{indicadores.ansiedad.porcentaje}%</p>
                  <span style={{ background: "#8e44ad", padding: "5px 15px", color: "white", borderRadius: 12 }}>{indicadores.ansiedad.nivel}</span>
                </div>
              </div>

              <div style={{ marginTop: 30, padding: 20, borderRadius: 12, background: alertaActual.color, color: "white", fontSize: 18, textAlign: "center" }}>
                {alertaActual.mensaje}
              </div>

             <div style={{ marginTop: 20, textAlign: "center" }}>
  <button
    onClick={() => {
      // Determinar estado para enviar al juego recomendado
      let estadoJuego = "estable"; // valor por defecto
      if (alertaActual.tipo === "crítico") estadoJuego = "critico";
      else if (alertaActual.tipo === "alerta") estadoJuego = "alerta";
      else if (alertaActual.tipo === "estable") estadoJuego = "estable";

      navigate("/juego-recomendado", { state: { estado: estadoJuego } });
    }}
    className="auth-button"
    style={{ padding: "12px 25px", background: "black", fontSize: "1.1rem" }}
  >
    🎮 Ir a Juegos Terapéuticos
  </button>
</div>

            </>
          )}

        </div>
      </main>
    </>
  );
};

export default ProbarVoz;
