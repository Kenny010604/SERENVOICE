import React, { useEffect, useState } from "react";
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
import "../../global.css";

const DashboardAdmin = () => {
  const navigate = useNavigate();

  // -----------------------------
  // ESTADOS NECESARIOS
  // -----------------------------
  const [statistics, setStatistics] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // FETCH DE DATOS DEL BACKEND
  // -----------------------------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsRes = await apiClient.get("/admin/statistics");
        const adminRes = await apiClient.get("/admin/profile");

        setStatistics(statsRes.data);
        setAdminData(adminRes.data);

      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // -----------------------------
  // PROTECCIÓN ANTES DE RENDERIZAR
  // -----------------------------
  if (loading) return <p style={{ padding: "40px" }}>Cargando panel...</p>;
  if (!statistics) return <p>No se pudieron cargar las estadísticas.</p>;

  // -----------------------------
  // TARJETAS DINÁMICAS
  // -----------------------------
  const statsCards = [
    {
      variant: "stat",
      title: "Total de Usuarios",
      value: statistics.totalUsuarios,
      icon: FaUsers,
      color: "#5ad0d2",
      gradient:
        "linear-gradient(135deg, rgba(90, 208, 210, 0.1), rgba(90, 208, 210, 0.05))",
    },
    {
      variant: "stat",
      title: "Usuarios Activos",
      value: statistics.usuariosActivos,
      icon: FaUserCheck,
      color: "#4caf50",
      gradient:
        "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))",
      subtitle: `${statistics.tasaActividad}% actividad`,
    },
    {
      variant: "stat",
      title: "Alertas Activas",
      value: statistics.alertasActivas,
      icon: FaExclamationTriangle,
      color: "#ff9800",
      gradient:
        "linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05))",
    },
    {
      variant: "stat",
      title: "Reportes a Responder",
      value: statistics.reportesRespuesta,
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

      <main className="container admin-dashboard" style={dashboardStyles.main}>
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
