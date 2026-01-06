import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBell } from "react-icons/fa";
import { IconType } from "react-icons";

// Tipo de cada opción
interface ConfigOption {
  title: string;
  description: string;
  icon: IconType;
  path: string;
}

const Configuracion: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const els = containerRef.current.querySelectorAll(".reveal");
    els.forEach(el => el.classList.add("reveal-visible"));
  }, []);

  const configOptions: ConfigOption[] = [
    {
      title: "Mi Perfil",
      description: "Ver y editar tu información personal",
      icon: FaUser,
      path: "/perfil",
    },
    {
      title: "Notificaciones",
      description: "Configurar preferencias de notificaciones",
      icon: FaBell,
      path: "/notificaciones/configuracion",
    },
  ];

  return (
    <main
      ref={containerRef}
      style={{
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Configuración</h2>
      <p style={{ marginBottom: "1.5rem", color: "#555" }}>
        Administra tu perfil y preferencias
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {configOptions.map(option => {
          const Icon = option.icon;

          return (
            <div
              key={option.path}
              className="reveal"
              style={{
                backgroundColor: "#ffffff",
                padding: "1.5rem",
                borderRadius: 14,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              onClick={() => navigate(option.path)}
            >
              <Icon size={36} style={{ marginBottom: "1rem", color: "#4f46e5" }} />

              <div>
                <h3 style={{ marginBottom: "0.4rem" }}>
                  {option.title}
                </h3>
                <p style={{ color: "#666" }}>
                  {option.description}
                </p>
              </div>

              <button
                style={{
                  marginTop: "1.2rem",
                  padding: "0.6rem",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Ir a {option.title}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Configuracion;
