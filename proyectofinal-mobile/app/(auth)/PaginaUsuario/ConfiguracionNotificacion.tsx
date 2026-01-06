import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaEnvelope,
  FaMobileAlt,
  FaClock,
  FaPause,
  FaPlay,
  FaSave,
} from "react-icons/fa";

// 🔹 Simulación del service (ajusta luego a tu service real)
import notificacionesService from "../../../constants/notificacionesService";

// =====================
// TIPOS
// =====================

interface MessageState {
  type: "success" | "error" | "";
  text: string;
}

interface Preferences {
  invitacion_grupo_app: boolean;
  invitacion_grupo_email: boolean;
  invitacion_grupo_push: boolean;

  actividad_grupo_app: boolean;
  actividad_grupo_email: boolean;
  actividad_grupo_push: boolean;

  recomendacion_app: boolean;
  recomendacion_email: boolean;
  recomendacion_push: boolean;

  alerta_critica_app: boolean;
  alerta_critica_email: boolean;
  alerta_critica_push: boolean;

  recordatorio_app: boolean;
  recordatorio_email: boolean;
  recordatorio_push: boolean;

  horario_inicio: string;
  horario_fin: string;
  pausar_notificaciones: boolean;
  fecha_pausa_hasta: string | null;
}

// =====================
// COMPONENTE
// =====================

const ConfiguracionNotificaciones: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({
    type: "",
    text: "",
  });

  const [preferences, setPreferences] = useState<Preferences>({
    invitacion_grupo_app: true,
    invitacion_grupo_email: true,
    invitacion_grupo_push: true,

    actividad_grupo_app: true,
    actividad_grupo_email: false,
    actividad_grupo_push: true,

    recomendacion_app: true,
    recomendacion_email: true,
    recomendacion_push: false,

    alerta_critica_app: true,
    alerta_critica_email: true,
    alerta_critica_push: true,

    recordatorio_app: true,
    recordatorio_email: false,
    recordatorio_push: true,

    horario_inicio: "08:00:00",
    horario_fin: "22:00:00",
    pausar_notificaciones: false,
    fecha_pausa_hasta: null,
  });

  // =====================
  // LOAD
  // =====================

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificacionesService.getPreferences();

      if (response?.success && response.data) {
        setPreferences(prev => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error al cargar las preferencias",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // HANDLERS
  // =====================

  const handleToggle = (field: keyof Preferences) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTimeChange = (field: "horario_inicio" | "horario_fin", value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await notificacionesService.updatePreferences(preferences);

      if (response?.success) {
        setMessage({
          type: "success",
          text: "Preferencias guardadas correctamente",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        throw new Error();
      }
    } catch {
      setMessage({
        type: "error",
        text: "Error al guardar las preferencias",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePauseNotifications = async (hours: number) => {
    try {
      await notificacionesService.pauseNotifications(hours);
      setPreferences(prev => ({
        ...prev,
        pausar_notificaciones: true,
      }));
      setMessage({
        type: "success",
        text: `Notificaciones pausadas por ${hours} horas`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Error al pausar notificaciones",
      });
    }
  };

  const handleResumeNotifications = async () => {
    try {
      await notificacionesService.resumeNotifications();
      setPreferences(prev => ({
        ...prev,
        pausar_notificaciones: false,
        fecha_pausa_hasta: null,
      }));
      setMessage({
        type: "success",
        text: "Notificaciones reanudadas",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Error al reanudar notificaciones",
      });
    }
  };

  // =====================
  // UI HELPERS
  // =====================

  const renderRow = (label: string, base: string) => (
    <div key={base} style={{ marginBottom: "1rem" }}>
      <strong>{label}</strong>

      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <label>
          <input
            type="checkbox"
            checked={preferences[`${base}_app` as keyof Preferences] as boolean}
            onChange={() => handleToggle(`${base}_app` as keyof Preferences)}
          />{" "}
          <FaBell />
        </label>

        <label>
          <input
            type="checkbox"
            checked={preferences[`${base}_email` as keyof Preferences] as boolean}
            onChange={() => handleToggle(`${base}_email` as keyof Preferences)}
          />{" "}
          <FaEnvelope />
        </label>

        <label>
          <input
            type="checkbox"
            checked={preferences[`${base}_push` as keyof Preferences] as boolean}
            onChange={() => handleToggle(`${base}_push` as keyof Preferences)}
          />{" "}
          <FaMobileAlt />
        </label>
      </div>
    </div>
  );

  // =====================
  // RENDER
  // =====================

  if (loading) {
    return <p>Cargando preferencias...</p>;
  }

  return (
    <main style={{ padding: "2rem", minHeight: "100vh" }}>
      <h2>Configuración de Notificaciones</h2>
      <p>Personaliza cómo y cuándo recibes notificaciones</p>

      {message.text && (
        <p style={{ color: message.type === "error" ? "red" : "green" }}>
          {message.text}
        </p>
      )}

      <section>
        <h3>Control rápido</h3>

        {preferences.pausar_notificaciones ? (
          <button onClick={handleResumeNotifications}>
            <FaPlay /> Reanudar
          </button>
        ) : (
          <>
            <button onClick={() => handlePauseNotifications(1)}>
              <FaPause /> 1h
            </button>
            <button onClick={() => handlePauseNotifications(4)}>
              <FaPause /> 4h
            </button>
            <button onClick={() => handlePauseNotifications(24)}>
              <FaPause /> 24h
            </button>
          </>
        )}
      </section>

      <section>
        <h3>Tipos de notificaciones</h3>
        {renderRow("Invitaciones a Grupos", "invitacion_grupo")}
        {renderRow("Actividades de Grupo", "actividad_grupo")}
        {renderRow("Recomendaciones", "recomendacion")}
        {renderRow("Alertas Críticas", "alerta_critica")}
        {renderRow("Recordatorios", "recordatorio")}
      </section>

      <section>
        <h3>
          <FaClock /> Horario
        </h3>

        <input
          type="time"
          value={preferences.horario_inicio.substring(0, 5)}
          onChange={e => handleTimeChange("horario_inicio", `${e.target.value}:00`)}
        />

        <input
          type="time"
          value={preferences.horario_fin.substring(0, 5)}
          onChange={e => handleTimeChange("horario_fin", `${e.target.value}:00`)}
        />
      </section>

      <button onClick={handleSave} disabled={saving}>
        <FaSave /> {saving ? "Guardando..." : "Guardar Preferencias"}
      </button>
    </main>
  );
};

export default ConfiguracionNotificaciones;
