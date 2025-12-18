import React, { useEffect, useRef, useState } from "react";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import "../../global.css";
import Spinner from "../../components/Publico/Spinner";
import {
  FaMicrophone,
  FaStop,
  FaPlay,
  FaDownload,
  FaWaveSquare,
  FaExclamationTriangle,
  FaHeartbeat
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProbarVozUsuario = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
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

  useEffect(() => {
    if (!userId || !token) navigate("/login");
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resp = await fetch(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) throw new Error("Error cargando usuario");

        const data = await resp.json();
        setUser(data);
      } catch (err) {
        navigate("/login");
      }
    };

    if (token) fetchUser();
  }, []);

  useEffect(() => {
    const checkMediaSupport = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaSupported(false);
        setError("Tu navegador no soporta grabación de audio.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        setMediaSupported(false);
        setError("Debes permitir acceso al micrófono.");
      }
    };

    checkMediaSupport();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, []);

  const startTimer = () => {
    setRecTime(0);
    timerRef.current = setInterval(() => setRecTime((t) => t + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStart = async () => {
    if (!mediaSupported) return;

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
        if (audioURL) URL.revokeObjectURL(audioURL);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setChunks([...mediaChunksRef.current]);
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
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopTimer();
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const blob = new Blob(mediaChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "grabacion.webm");
      formData.append("userId", userId);

      const response = await fetch(`${API_URL}/audio/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Error del servidor");

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
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
      if (["Enojo", "Miedo", "Asustado"].includes(emo.name)) {
        nivelEstres += emo.value;
      }
      if (["Miedo", "Asustado"].includes(emo.name)) {
        nivelAnsiedad += emo.value;
      }
    });

    const calcNivel = (valor) => {
      if (valor >= 70) return "ALTO";
      if (valor >= 40) return "MEDIO";
      return "BAJO";
    };

    return {
      estres: {
        porcentaje: nivelEstres,
        nivel: calcNivel(nivelEstres),
      },
      ansiedad: {
        porcentaje: nivelAnsiedad,
        nivel: calcNivel(nivelAnsiedad),
      },
    };
  };

  const indicadores = calcularIndicadores();

  const alerta = () => {
    if (!indicadores) return null;

    if (indicadores.estres.nivel === "ALTO" || indicadores.ansiedad.nivel === "ALTO") {
      return {
        tipo: "crítico",
        mensaje: "⚠️ Tu estado es crítico, te recomendamos entrar al juego terapéutico.",
        color: "#ff3b30",
      };
    }

    if (indicadores.estres.nivel === "MEDIO" || indicadores.ansiedad.nivel === "MEDIO") {
      return {
        tipo: "alerta",
        mensaje: "🟠 Estás en estado de alerta, sería bueno relajarte jugando.",
        color: "#ff9500",
      };
    }

    return {
      tipo: "estable",
      mensaje: "🟢 Tu estado emocional es estable.",
      color: "#34c759",
    };
  };

  const alertaActual = alerta();

  return (
    <>
      <NavbarPublic />

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="card" style={{ maxWidth: 900 }}>

          {user && (
            <p style={{ color: "gray" }}>
              Analizando como: <b>{user.nombre} {user.apellido}</b>
            </p>
          )}

          <h2>Análisis emocional por voz</h2>

          {/* --- CONTROLES --- */}
          <div style={{ display: "flex", gap: 10 }}>
            {!isRecording ? (
              <button className="auth-button" onClick={handleStart}>
                <FaMicrophone /> Grabar
              </button>
            ) : (
              <button className="auth-button" style={{ background: "red" }} onClick={handleStop}>
                <FaStop /> Detener
              </button>
            )}

            <button className="auth-button" disabled={!audioURL} onClick={() => audioRef.current?.play()}>
              <FaPlay /> Reproducir
            </button>

            <button className="auth-button" disabled={!audioURL} onClick={() => {
              const a = document.createElement("a");
              a.href = audioURL;
              a.download = "grabacion.webm";
              a.click();
            }}>
              <FaDownload /> Descargar
            </button>

            <button
              className="auth-button"
              disabled={!audioURL || isAnalyzing}
              onClick={handleAnalyze}
              style={{ background: "var(--color-primary)" }}
            >
              <FaWaveSquare /> {isAnalyzing ? "Analizando..." : "Analizar IA"}
            </button>
          </div>

          {audioURL && <audio ref={audioRef} src={audioURL} controls style={{ width: "100%" }} />}

          {isAnalyzing && <Spinner overlay message="Analizando..." />}

          {/* ============================================================
              🔥 RESULTADOS EMOCIONALES DEL BACKEND (YA ESTABAN)
          ============================================================ */}
          {analysis && (
            <div style={{ marginTop: 25 }}>
              <h3>Resultados por emoción</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,140px)", gap: 15 }}>
                {analysis.emotions.map((emo, i) => (
                  <div key={i} style={{ padding: 15, border: "2px solid #ccc", borderRadius: 10 }}>
                    <p><b>{emo.name}</b></p>
                    <p style={{ fontSize: 22 }}>{emo.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================
              🔥 NUEVO: ESTRÉS & ANSIEDAD + ALERTA + BOTÓN DE JUEGO
          ============================================================ */}
          {indicadores && (
            <>
              <h3 style={{ marginTop: 30 }}>Indicadores Clave</h3>

              <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>

                {/* Estrés */}
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: "white",
                  width: 250,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}>
                  <FaExclamationTriangle size={40} color="#ff3b30" />
                  <h4>Estrés</h4>
                  <p style={{ fontSize: 25, fontWeight: "bold" }}>
                    {indicadores.estres.porcentaje}%
                  </p>
                  <span style={{
                    background: "#ff3b30",
                    padding: "5px 15px",
                    color: "white",
                    borderRadius: 12,
                  }}>
                    {indicadores.estres.nivel}
                  </span>
                </div>

                {/* Ansiedad */}
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: "white",
                  width: 250,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}>
                  <FaHeartbeat size={40} color="#8e44ad" />
                  <h4>Ansiedad</h4>
                  <p style={{ fontSize: 25, fontWeight: "bold" }}>
                    {indicadores.ansiedad.porcentaje}%
                  </p>
                  <span style={{
                    background: "#8e44ad",
                    padding: "5px 15px",
                    color: "white",
                    borderRadius: 12,
                  }}>
                    {indicadores.ansiedad.nivel}
                  </span>
                </div>
              </div>

              {/* 🔥 ALERTA DINÁMICA */}
              <div style={{
                marginTop: 30,
                padding: 20,
                borderRadius: 12,
                background: alertaActual.color,
                color: "white",
                fontSize: 18,
                textAlign: "center",
              }}>
                {alertaActual.mensaje}
              </div>

              {/* 🔥 BOTÓN PARA IR A JUEGOS */}
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <button
                  onClick={() => navigate("/games")}
                  className="auth-button"
                  style={{
                    padding: "12px 25px",
                    background: "black",
                    fontSize: "1.1rem",
                  }}
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

export default ProbarVozUsuario;
;
