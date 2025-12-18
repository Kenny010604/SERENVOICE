import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaFlag,
  FaUserCheck,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import AdminCard from "../../components/Administrador/AdminCard";
import { dashboardStyles } from "../../styles/StylesAdmin/DashboardAdmin.styles";
import apiClient from "../../services/apiClient";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import "../../global.css";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);

  // -----------------------------
  // ESTADOS NECESARIOS
  // -----------------------------
  const [statistics, setStatistics] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -----------------------------
  // FETCH DE DATOS DEL BACKEND
  // -----------------------------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Usar las rutas de /api/usuarios
        const [statsRes, profileRes] = await Promise.all([
          apiClient.get("/usuarios/statistics"),
          apiClient.get("/usuarios/me"),
        ]);

        // Verificar estructura de respuesta
        if (statsRes.data.success) {
          setStatistics(statsRes.data.data);
        } else {
          throw new Error(statsRes.data.message || "Error al cargar estadísticas");
        }

        if (profileRes.data.success) {
          setAdminData(profileRes.data.data);
        } else {
          throw new Error(profileRes.data.message || "Error al cargar perfil");
        }

      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
        setError(error.response?.data?.message || error.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // -----------------------------
  // PROTECCIÓN ANTES DE RENDERIZAR
  // -----------------------------
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>No se pudieron cargar las estadísticas.</p>
      </div>
    );
  }

  // -----------------------------
  // TARJETAS DINÁMICAS
  // -----------------------------
  const statsCards = [
    {
      variant: "stat",
      title: "Total de Usuarios",
      value: statistics.totalUsuarios || 0,
      icon: FaUsers,
      color: "#5ad0d2",
      gradient:
        "linear-gradient(135deg, rgba(90, 208, 210, 0.1), rgba(90, 208, 210, 0.05))",
    },
    {
      variant: "stat",
      title: "Usuarios Activos",
      value: statistics.usuariosActivos || 0,
      icon: FaUserCheck,
      color: "#4caf50",
      gradient:
        "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))",
      subtitle: `${statistics.tasaActividad || 0}% actividad`,
    },
    {
      variant: "stat",
      title: "Alertas Activas",
      value: statistics.alertasActivas || 0,
      icon: FaExclamationTriangle,
      color: "#ff9800",
      gradient:
        "linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05))",
    },
    {
      variant: "stat",
      title: "Reportes a Responder",
      value: statistics.reportesRespuesta || 0,
      icon: FaFlag,
      color: "#f44336",
      gradient:
        "linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))",
    },
  ];

  const actionCards = [
    {
      variant: "action",
      icon: FaUsers,
      title: "Gestión de Usuarios",
      description: "Administra, visualiza y controla todos los usuarios del sistema.",
      buttonText: "Ir a Usuarios",
      onClick: () => navigate("/admin/usuarios"),
    },
    {
      variant: "action",
      icon: FaChartLine,
      title: "Reportes y Análisis",
      description: "Visualiza estadísticas, gráficos y análisis de la plataforma.",
      buttonText: "Ver Reportes",
      onClick: () => navigate("/admin/reportes"),
    },
  ];

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <>
      <NavbarAdministrador adminData={adminData} />

      <main 
        className="container admin-dashboard" 
        style={{
          ...dashboardStyles.main,
          backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed"
        }}
      >
        {/* Encabezado */}
        <AdminCard
          variant="header"
          icon={FaShieldAlt}
          title="Panel de Administración"
          description="Gestiona usuarios, visualiza reportes y monitorea la actividad del sistema"
          color="#ff6b6b"
        />

        {/* Estadísticas */}
        <div style={dashboardStyles.statsGrid}>
          {statsCards.map((card, index) => (
            <AdminCard key={index} {...card} />
          ))}
        </div>

        {/* Acciones */}
        <div style={dashboardStyles.actionsGrid}>
          {actionCards.map((card, index) => (
            <AdminCard key={index} {...card} />
          ))}
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Panel de Administración
      </footer>
    </>
  );
};

export default DashboardAdmin;