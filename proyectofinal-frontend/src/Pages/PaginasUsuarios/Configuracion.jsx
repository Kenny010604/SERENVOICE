import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBell, FaDesktop, FaHistory } from "react-icons/fa";
import "../../global.css";
import PageCard from "../../components/Shared/PageCard";
import sesionesService from "../../services/sesionesService";


const Configuracion = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [sessionsCount, setSessionsCount] = useState({ active: 0, total: 0 });
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Cargar resumen de sesiones del usuario
  const loadSessionsSummary = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const result = await sesionesService.getMySessions(10);
      const sessions = result.data || result || [];
      const activeCount = sessions.filter(s => s.estado === "activa").length;
      setSessionsCount({ active: activeCount, total: sessions.length });
    } catch (err) {
      console.error("Error cargando sesiones:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessionsSummary();
  }, [loadSessionsSummary]);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);

  const configOptions = [
    {
      title: "Mi Perfil",
      description: "Ver y editar tu información personal",
      icon: <FaUser />,
      path: "/perfil"
    },
    {
      title: "Notificaciones",
      description: "Configurar preferencias de notificaciones",
      icon: <FaBell />,
      path: "/notificaciones/configuracion"
    },
    {
      title: "Sesiones",
      description: loadingSessions 
        ? "Cargando..." 
        : `${sessionsCount.active} activa${sessionsCount.active !== 1 ? 's' : ''} de ${sessionsCount.total} registrada${sessionsCount.total !== 1 ? 's' : ''}`,
      icon: <FaDesktop />,
      path: "/sesiones"
    }
  ];

  return (
    <div className="configuracion-content page-content">
      <PageCard size="xl">
          <h2>Configuración</h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Administra tu perfil y preferencias
          </p>
        </PageCard>

        <div className="dashboard-grid">
          {configOptions.map((option) => (
            <div
              key={option.path}
              className="card"
              style={{
                cursor: "pointer"
              }}
              onClick={() => navigate(option.path)}
            >
              {React.cloneElement(option.icon, {
                size: 40,
                style: { color: "var(--color-primary)", marginBottom: "1rem" }
              })}
              <h3 style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem"
              }}>
                {option.title}
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                {option.description}
              </p>
              <button
                className="auth-button"
                style={{
                  width: "100%",
                  marginTop: "auto"
                }}
              >
                Ir a {option.title}
              </button>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Configuracion;
