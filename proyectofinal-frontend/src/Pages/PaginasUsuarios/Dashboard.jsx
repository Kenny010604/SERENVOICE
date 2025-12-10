// Dashboard.jsx — COMPLETO CORREGIDO

import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import "../../global.css";
import {
  FaHistory,
  FaHeartbeat,
  FaMicrophone
} from "react-icons/fa";
import NavbarUsuario from "../../components/NavbarUsuario";
import authService from "../../services/authService";

const Dashboard = () => {
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

      <main className="container">
        <div className="card">
          <h2>¡Bienvenido, {userData.nombre }{ }{userData.apellido}! 👋</h2>
          <p>Aquí puedes gestionar tu cuenta y acceder a todas las funciones de SerenVoice.</p>
        </div>

        <div className="grid">
          <div className="card">
            <FaHistory size={40} />
            <h3>Historial</h3>
            <button onClick={() => navigate("/historial")}>Ver Historial</button>
          </div>

          <div className="card">
            <FaHeartbeat size={40} />
            <h3>Métricas de Salud</h3>
            <button onClick={() => navigate("/recomendaciones")}>Ver Recomendaciones</button>
          </div>

         <div className="card">
  <FaMicrophone size={40} />
  <h3>Registrar Sesión</h3>
  <button onClick={() => navigate("/probar-voz-usuario")}>
    Grabar Ahora
  </button>
</div>

        </div>

        <div className="card" style={{ marginTop: "2rem" }}>
          <h3>Información de Perfil</h3>

          <div className="info-grid">
            <div>
              <p className="label">Nombre Completo</p>
              <p>{userData.nombre} {userData.apellido}</p>
            </div>

            <div>
              <p className="label">Correo</p>
              <p>{userData.correo}</p>
            </div>

            <div>
              <p className="label">Edad</p>
              <p>{edadCalculada} años</p>
            </div>

            <div>
              <p className="label">Género</p>
              <p>
                {userData.genero === "M" ? "Masculino"
                : userData.genero === "F" ? "Femenino"
                : "Otro"}
              </p>
            </div>

            <div>
              <p className="label">Usa medicamentos</p>
              <p>{userData.usa_medicamentos ? "Sí" : "No"}</p>
            </div>
          </div>

          <button onClick={() => navigate("/actualizar-perfil")}>Editar Perfil</button>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
