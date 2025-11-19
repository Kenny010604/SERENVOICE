import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../global.css";
import {
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaHome,
  FaHistory,
  FaHeartbeat,
  FaMicrophone,
} from "react-icons/fa";
import NavbarUsuario from "../components/NavbarUsuario";

const Dashboard = () => {
  const navigate = useNavigate();

  // TODO: Obtener estos datos del backend
  const userData = {
    nombres: "Juan",
    apellidos: "García",
    correo: "juan.garcia@email.com",
    genero: "M",
    edad: 28,
    avatar: null,
  };

  return (
    <>
      {/* ---------- Navbar ---------- */}
      <NavbarUsuario userData={userData} />

      {/* ---------- Contenido Principal ---------- */}
      <main className="container" style={{ paddingBottom: "100px" }}>
        {/* Bienvenida */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h2>¡Bienvenido, {userData.nombres}! 👋</h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Aquí puedes gestionar tu cuenta y acceder a todas las funciones de
            SerenVoice.
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
              Consulta tus métricas de salud y bienestar.
            </p>
            <button
              onClick={() => navigate("/recomendaciones")}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Ver Recomendaciones
            </button>
          </div>

          {/* Tarjeta: Micrófono */}
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
              Inicia una nueva sesión de grabación de audio.
            </p>
            <button
              onClick={() => navigate("/probar")}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Grabar Ahora
            </button>
          </div>
        </div>

        {/* Información del perfil */}
        <div
          className="card"
          style={{ width: "100%", maxWidth: "1000px", marginTop: "2rem" }}
        >
          <h3 style={{ color: "var(--color-text-main)", marginBottom: "1rem" }}>
            Información de Perfil
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Nombre Completo
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {userData.nombres} {userData.apellidos}
              </p>
            </div>
            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Correo Electrónico
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
                }}
              >
                Edad
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {userData.edad} años
              </p>
            </div>
            <div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Género
              </p>
              <p style={{ color: "var(--color-text-main)", fontWeight: "600" }}>
                {userData.genero === "M"
                  ? "Masculino"
                  : userData.genero === "F"
                  ? "Femenino"
                  : "Otro"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/actualizar-perfil")}
            style={{
              marginTop: "1.5rem",
              width: "100%",
            }}
          >
            Editar Perfil
          </button>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default Dashboard;
