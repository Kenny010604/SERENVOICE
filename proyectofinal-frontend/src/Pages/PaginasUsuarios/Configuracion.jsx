import React, { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import NavbarUsuario from "../../components/Usuario/NavbarUsuario";
import { FaUser, FaBell } from "react-icons/fa";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import "../../global.css";


const Configuracion = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
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
          minHeight: "100vh"
        }}
      >
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h2>Configuración</h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Administra tu perfil y preferencias
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          width: "100%",
          maxWidth: "1000px"
        }}>
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
      </main>
    </>
  );
};

export default Configuracion;
