import React from "react";
import { useNavigate } from "react-router-dom";
import "../global.css";
import {
  FaUsers,
  FaChartLine,
  FaFlag,
  FaUserCheck,
  FaExclamationTriangle,
  FaDatabase,
  FaShieldAlt,
} from "react-icons/fa";
import NavbarAdministrador from "../components/NavbarAdministrador";

const DashboardAdmin = () => {
  const navigate = useNavigate();

  // TODO: Obtener estos datos del backend
  const adminData = {
    nombres: "Carlos",
    apellidos: "López",
    correo: "carlos.lopez@admin.com",
  };

  // TODO: Obtener estadísticas del backend
  const statistics = {
    totalUsuarios: 1523,
    usuariosActivos: 1245,
    alertasActivas: 47,
    reportesRespuesta: 12,
    tasaActividad: 81.8,
  };

  return (
    <>
      {/* ---------- Navbar ---------- */}
      <NavbarAdministrador adminData={adminData} />

      {/* ---------- Contenido Principal ---------- */}
      <main
        className="container admin-dashboard"
        style={{ paddingBottom: "100px" }}
      >
        {/* Encabezado */}
        <div className="card" style={{ width: "100%", maxWidth: "1200px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 28,
                background: "rgba(255,107,107,0.08)",
              }}
            >
              <FaShieldAlt
                style={{ color: "#ff6b6b", width: "1.4em", height: "1.4em" }}
              />
            </div>
            <h2 style={{ margin: 0 }}>Panel de Administración</h2>
            <p
              style={{
                marginBottom: "0",
                color: "var(--color-text-secondary)",
              }}
            >
              Gestiona usuarios, visualiza reportes y monitorea la actividad del
              sistema
            </p>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "1200px",
            marginBottom: "2rem",
          }}
        >
          {/* Total de usuarios */}
          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, rgba(90, 208, 210, 0.1), rgba(90, 208, 210, 0.05))",
              borderLeft: "4px solid #5ad0d2",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Total de Usuarios
                </p>
                <h3
                  style={{
                    margin: "0",
                    fontSize: "2rem",
                    color: "#5ad0d2",
                    fontWeight: "700",
                  }}
                >
                  {statistics.totalUsuarios}
                </h3>
              </div>
              <FaUsers size={40} style={{ color: "#5ad0d2", opacity: 0.9 }} />
            </div>
          </div>

          {/* Usuarios activos */}
          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))",
              borderLeft: "4px solid #4caf50",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Usuarios Activos
                </p>
                <h3
                  style={{
                    margin: "0",
                    fontSize: "2rem",
                    color: "#4caf50",
                    fontWeight: "700",
                  }}
                >
                  {statistics.usuariosActivos}
                </h3>
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  {statistics.tasaActividad}% actividad
                </p>
              </div>
              <FaUserCheck
                size={40}
                style={{ color: "#4caf50", opacity: 0.9 }}
              />
            </div>
          </div>

          {/* Alertas activas */}
          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05))",
              borderLeft: "4px solid #ff9800",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Alertas Activas
                </p>
                <h3
                  style={{
                    margin: "0",
                    fontSize: "2rem",
                    color: "#ff9800",
                    fontWeight: "700",
                  }}
                >
                  {statistics.alertasActivas}
                </h3>
              </div>
              <FaExclamationTriangle
                size={40}
                style={{ color: "#ff9800", opacity: 0.9 }}
              />
            </div>
          </div>

          {/* Reportes en espera */}
          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))",
              borderLeft: "4px solid #f44336",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Reportes a Responder
                </p>
                <h3
                  style={{
                    margin: "0",
                    fontSize: "2rem",
                    color: "#f44336",
                    fontWeight: "700",
                  }}
                >
                  {statistics.reportesRespuesta}
                </h3>
              </div>
              <FaFlag size={40} style={{ color: "#f44336", opacity: 0.9 }} />
            </div>
          </div>
        </div>

        {/* Sección de acciones rápidas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          {/* Tarjeta: Gestión de Usuarios */}
          <div className="card">
            <FaUsers
              size={40}
              style={{ color: "#ff6b6b", marginBottom: "1rem" }}
            />
            <h3
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Gestión de Usuarios
            </h3>
            <p style={{ marginBottom: "1rem" }}>
              Administra, visualiza y controla todos los usuarios del sistema.
            </p>
            <button
              onClick={() => navigate("/admin/usuarios")}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Ir a Usuarios
            </button>
          </div>

          {/* Tarjeta: Reportes */}
          <div className="card">
            <FaChartLine
              size={40}
              style={{ color: "#ff6b6b", marginBottom: "1rem" }}
            />
            <h3
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Reportes y Análisis
            </h3>
            <p style={{ marginBottom: "1rem" }}>
              Visualiza estadísticas, gráficos y análisis de la plataforma.
            </p>
            <button
              onClick={() => navigate("/admin/reportes")}
              style={{
                width: "100%",
                marginTop: "auto",
              }}
            >
              Ver Reportes
            </button>
          </div>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Panel de Administración
      </footer>
    </>
  );
};

export default DashboardAdmin;
