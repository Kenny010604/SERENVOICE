// Dashboard.jsx — COMPLETO CORREGIDO

import React, { useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "../../global.css";
import {
  FaHistory,
  FaHeartbeat,
  FaMicrophone,
  FaGamepad
} from "react-icons/fa";
import NavbarUsuario from "../../components/NavbarUsuario";
import authService from "../../services/authService";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";

const Dashboard = () => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const userData = authService.getUser();

  if (!userData) return <Navigate to="/login" replace />;

  const calcularEdad = (fecha) => {
    if (!fecha) return "—";
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const edadCalculada = calcularEdad(userData.fecha_nacimiento);

  return (
    <>
      <NavbarUsuario userData={userData} />

      {/* ---------- Contenido Principal ---------- */}
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
        {/* Bienvenida */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h2>¡Bienvenido, {userData.nombre} {userData.apellido}! 👋</h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Aquí puedes gestionar tu cuenta y acceder a todas las funciones de SerenVoice.
          </p>
        </div>

        {/* Tarjetas de acceso rápido */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "1000px",
          }}
        >
          {/* Tarjeta: Historico */}
          <div className="card">
            <FaHistory
              size={40}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h3
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Historial
            </h3>
            <p style={{ marginBottom: "1rem" }}>
              Revisa tu historial de sesiones y actividades.
            </p>
            <button
              className="auth-button"
              onClick={() => navigate("/historial")}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Ver Historial
            </button>
          </div>

          {/* Tarjeta: Salud */}
          <div className="card">
            <FaHeartbeat
              size={40}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h3
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Métricas de Salud
            </h3>
            <p style={{ marginBottom: "1rem" }}>
              Accede a recomendaciones personalizadas.
            </p>
            <button
              className="auth-button"
              onClick={() => navigate("/recomendaciones")}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Ver Recomendaciones
            </button>
          </div>

          {/* Tarjeta: Grabar */}
          <div className="card">
            <FaMicrophone
              size={40}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h3
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Registrar Sesión
            </h3>
            <p style={{ marginBottom: "1rem" }}>
              Graba y analiza tu voz ahora mismo.
            </p>
            <button
              className="auth-button"
              onClick={() => navigate("/analizar-voz")}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Grabar Ahora
            </button>
          </div>

          {/* Tarjeta: Juegos Terapéuticos */}
          <div className="card">
            <FaGamepad
              size={40}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h3
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Juegos Terapéuticos
            </h3>
            <p style={{ marginBottom: "1rem" }}>
              Relájate y mejora tu bienestar jugando.
            </p>
            <button
              className="auth-button"
              onClick={() => navigate("/juegos", { state: { estadoEmocional: edadCalculada ? (edadCalculada > 0 ? 'estable' : 'estable') : 'estable' } })}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Jugar Ahora
            </button>
          </div>
        </div>

        {/* Información de Perfil */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px", marginTop: "2rem" }}>
          <h3 style={{ color: "var(--color-text-main)", marginBottom: "1.5rem" }}>
            Información de Perfil
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                Nombre Completo
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {userData.nombre} {userData.apellido}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                Correo
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {userData.correo}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                Edad
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {edadCalculada} años
              </p>
            </div>

            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                Género
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {userData.genero === "M" ? "Masculino"
                : userData.genero === "F" ? "Femenino"
                : "Otro"}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                  marginBottom: "0.5rem",
                }}
              >
                Usa medicamentos
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {userData.usa_medicamentos ? "Sí" : "No"}
              </p>
            </div>
          </div>

          <button
            className="auth-button"
            onClick={() => navigate("/actualizar-perfil")}
          >
            Editar Perfil
          </button>
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default Dashboard;
