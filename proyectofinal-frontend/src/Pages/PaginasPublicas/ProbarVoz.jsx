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
  FaSmile,
  FaAngry,
  FaFrownOpen,
  FaUser,
  FaLock,
  FaChartLine,
  FaArrowRight,
  FaHeartbeat,
  FaBrain,
  FaMeh,
  FaSadCry,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProbarVoz = () => {
  const userId = localStorage.getItem("userId"); // null si no está logueado
  const token = localStorage.getItem("token");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(true);
  const [audioURL, setAudioURL] = useState(null);
  const [chunks, setChunks] = useState([]);
  const mediaChunksRef = useRef([]);
  const [recTime, setRecTime] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Verificar soporte de navegador
  useEffect(() => {
    const checkMediaSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMediaSupported(false);
        setError(
          "Tu navegador no soporta la grabación de audio. Usa Chrome, Firefox o Edge."
        );
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
  }, []);

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

  const requestMicrophonePermission = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMediaSupported(true);
      alert("Permisos concedidos. Ahora puedes grabar.");
    } catch (err) {
      setMediaSupported(false);
      setError(err.name === "NotAllowedError" ? "Permisos denegados" : err.message);
    }
  };

  // Iniciar grabación
  const handleStart = async () => {
    if (!mediaSupported) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Usar un formato soportado
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      }

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      mediaChunksRef.current = [];
      setChunks([]);

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          mediaChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const recordedMimeType = mr.mimeType;
        const blob = new Blob(mediaChunksRef.current, { type: recordedMimeType });
        if (audioURL) URL.revokeObjectURL(audioURL);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setChunks(mediaChunksRef.current.slice());
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

  // Detener grabación
  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopTimer();

    setTimeout(() => {
      if (audioURL) handleAnalyze();
    }, 500);
  };

  const handlePlay = () => {
    if (audioRef.current) {
      try {
        audioRef.current.play();
      } catch (err) {
        audioRef.current.load();
        audioRef.current.play().catch((e) => console.error("Play failed:", e));
      }
    }
  };

  const handleDownload = () => {
    if (!audioURL) return;
    const a = document.createElement("a");
    a.href = audioURL;
    a.download = `grabacion_serenvoice_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Analizar audio en backend
  const handleAnalyze = async () => {
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

      const response = await fetch(`${API_URL}/api/audio/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing audio:", error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEmotionIcon = (emotion) => {
    const iconMap = {
      Felicidad: FaSmile,
      Tristeza: FaSadCry,
      Enojo: FaAngry,
      Estrés: FaHeartbeat,
      Ansiedad: FaBrain,
      Neutral: FaMeh,
      Miedo: FaExclamationTriangle,
    };
    return iconMap[emotion] || FaMeh;
  };

  const getEmotionColor = (emotion) => {
    const colorMap = {
      Felicidad: "#FFD700",
      Tristeza: "#4169E1",
      Enojo: "#FF6347",
      Estrés: "#FF4500",
      Ansiedad: "#9370DB",
      Neutral: "#90A4AE",
      Miedo: "#FF6F00",
    };
    return colorMap[emotion] || "#90A4AE";
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
          <h2 style={{ marginBottom: 8 }}>Análisis Emocional por Voz con IA</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Graba al menos 5 segundos de tu voz hablando naturalmente. Nuestra IA analizará
            tus emociones mediante características acústicas avanzadas.
          </p>

          {!mediaSupported && error && (
            <div style={{
              color: "#d32f2f",
              padding: 16,
              background: "#ffebee",
              borderRadius: 8,
              marginBottom: 16,
              border: "2px solid #ef5350"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaExclamationTriangle size={24} />
                <strong>Problema con el micrófono</strong>
              </div>
              <p style={{ margin: "8px 0", fontSize: "0.95rem" }}>{error}</p>
              <button
                onClick={requestMicrophonePermission}
                style={{
                  marginTop: 12,
                  padding: "8px 16px",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Solicitar permisos nuevamente
              </button>
            </div>
          )}

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
              <button className="auth-button" onClick={handleAnalyze} disabled={!audioURL || isAnalyzing} style={{ opacity: audioURL && !isAnalyzing ? 1 : 0.5, background: "var(--color-primary)" }}>
                <FaWaveSquare /> {isAnalyzing ? "Analizando..." : "Analizar con IA"}
              </button>
            </div>
          </div>

          {audioURL && <audio ref={audioRef} src={audioURL} controls style={{ width: "100%", marginTop: 12 }} />}

          {isAnalyzing && <Spinner overlay={true} message="Analizando emociones con IA..." />}

          {analysis && (
            <div style={{ marginTop: 24 }}>
              {/* Mostrar resultados */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 16,
              }}>
                {analysis.emotions.map((emotion, idx) => {
                  const Icon = getEmotionIcon(emotion.name);
                  const color = getEmotionColor(emotion.name);
                  return (
                    <div key={idx} style={{ padding: 16, borderRadius: 12, background: "var(--color-panel)", border: `3px solid ${color}`, textAlign: "center" }}>
                      <Icon size={36} style={{ color, marginBottom: 8 }} />
                      <p style={{ margin: "0 0 4px 0", fontWeight: "700", color, fontSize: "1.1rem" }}>{emotion.name}</p>
                      <p style={{ margin: "0 0 8px 0", color: "var(--color-text-main)", fontSize: "1.5rem", fontWeight: "bold" }}>{emotion.value}%</p>
                    </div>
                  );
                })}
              </div>
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

export default ProbarVoz;
