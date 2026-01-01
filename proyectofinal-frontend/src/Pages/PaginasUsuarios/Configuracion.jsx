import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBell } from "react-icons/fa";
import "../../global.css";
import PageCard from "../../components/Shared/PageCard";


const Configuracion = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

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
