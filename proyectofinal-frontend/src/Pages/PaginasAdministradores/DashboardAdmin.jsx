import React, { useEffect, useState, useContext } from "react";
import {
  FaUsers,
  FaChartLine,
  FaUserCheck,
  FaShieldAlt,
  FaGamepad,
  FaUserFriends,
  FaSync,
  FaHistory,
  FaCheckCircle,
  FaServer,
  FaArrowUp,
  FaArrowDown,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import apiClient from "../../services/apiClient";
import api from "../../config/api";
import PageCard from "../../components/Shared/PageCard";
import AdminCard from "../../components/Administrador/AdminCard";
import Spinner from "../../components/Publico/Spinner";
import { ThemeContext } from "../../context/themeContextDef";
import "../../global.css";

const DashboardAdmin = () => {
  const { isDark } = useContext(ThemeContext);
  const [statistics, setStatistics] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gruposActivos, setGruposActivos] = useState(0);
  const [analisisHoy, setAnalisisHoy] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch de datos
  const fetchDashboard = async () => {
    try {
      const [statsRes, profileRes, gruposRes, analisisRes] = await Promise.all([
        apiClient.get(api.endpoints.usuarios.statistics),
        apiClient.get(api.endpoints.users.me),
        apiClient.get(api.endpoints.grupos.estadisticas).catch(() => ({ data: { data: { activos: 0 } } })),
        apiClient.get(api.endpoints.analisis.today).catch(() => ({ data: { data: { total: 0 } } })),
      ]);

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

      // Grupos activos
      let activos = 0;
      try {
        if (gruposRes?.data) {
          // Si es un array de grupos, contar los activos
          if (Array.isArray(gruposRes.data.data)) {
            activos = gruposRes.data.data.filter(g => g.activo).length;
          } else if (Array.isArray(gruposRes.data)) {
            activos = gruposRes.data.filter(g => g.activo).length;
          } else if (gruposRes.data.data && typeof gruposRes.data.data.activos !== 'undefined') {
            activos = gruposRes.data.data.activos;
          } else if (typeof gruposRes.data.activos !== 'undefined') {
            activos = gruposRes.data.activos;
          } else if (typeof gruposRes.data === 'number') {
            activos = gruposRes.data;
          }
        }
      } catch {
        activos = 0;
      }
      setGruposActivos(activos || 0);

      // Análisis hoy
      let analisisTotal = 0;
      try {
        if (analisisRes?.data) {
          if (typeof analisisRes.data === 'number') {
            analisisTotal = analisisRes.data;
          } else if (typeof analisisRes.data.total !== 'undefined') {
            analisisTotal = analisisRes.data.total;
          } else if (analisisRes.data.data && typeof analisisRes.data.data.total !== 'undefined') {
            analisisTotal = analisisRes.data.data.total;
          }
        }
      } catch {
        analisisTotal = 0;
      }
      setAnalisisHoy(analisisTotal || 0);

      setRecentActivity([
        { type: "user", text: "Nuevo usuario registrado", time: "Hace 5 min", icon: FaUsers, color: "#5ad0d2" },
        { type: "analysis", text: "12 análisis de voz completados", time: "Hace 15 min", icon: FaChartLine, color: "#2196f3" },
        { type: "alert", text: "Alerta crítica resuelta", time: "Hace 30 min", icon: FaCheckCircle, color: "#4caf50" },
        { type: "game", text: "Sesión de juego finalizada", time: "Hace 1 hora", icon: FaGamepad, color: "#9c27b0" },
      ]);

    } catch (err) {
      console.error("Error cargando datos del dashboard:", err);
      setError(err.response?.data?.message || err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-content">
        <Spinner message="Cargando panel de administración..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <PageCard size="md">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <FaExclamationTriangle style={{ fontSize: "3rem", color: "#f44336", marginBottom: "1rem" }} />
            <h3>Error al cargar el dashboard</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>{error}</p>
            <button className="auth-button" onClick={() => window.location.reload()} style={{ marginTop: "1rem" }}>
              <FaSync style={{ marginRight: "0.5rem" }} /> Reintentar
            </button>
          </div>
        </PageCard>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="page-content">
        <PageCard size="md">
          <p style={{ textAlign: "center" }}>No se pudieron cargar las estadísticas.</p>
        </PageCard>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Usuarios",
      value: statistics.totalUsuarios || 0,
      icon: FaUsers,
      color: "#5ad0d2",
      bgColor: "rgba(90, 208, 210, 0.15)",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Usuarios Activos",
      value: statistics.usuariosActivos || 0,
      icon: FaUserCheck,
      color: "#4caf50",
      bgColor: "rgba(76, 175, 80, 0.15)",
      subtitle: `${statistics.tasaActividad || 0}% tasa`,
    },
    {
      title: "Grupos Activos",
      value: gruposActivos,
      icon: FaUserFriends,
      color: "#9c27b0",
      bgColor: "rgba(156, 39, 176, 0.15)",
    },
    {
      title: "Análisis Hoy",
      value: analisisHoy,
      icon: FaChartLine,
      color: "#2196f3",
      bgColor: "rgba(33, 150, 243, 0.15)",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Reportes Pendientes",
      value: statistics?.reportesRespuesta ?? statistics?.reportes_respuesta ?? statistics?.reportes ?? 0,
      icon: FaClipboardList,
      color: "#f44336",
      bgColor: "rgba(244, 67, 54, 0.15)",
    },
  ];

  const systemStatus = [
    { name: "API Backend", status: "online", detail: "Operativo" },
    { name: "Base de Datos", status: "online", detail: "Conexión estable" },
    { name: "Análisis de Voz", status: "online", detail: "Procesando" },
    { name: "Servicio de IA", status: "online", detail: "Activo" },
  ];

  return (
    <div className="page-content">
      {/* Welcome Card */}
      <PageCard size="xl">
        <div style={{ textAlign: "center" }}>
          <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <FaShieldAlt style={{ color: "#ff6b6b" }} />
            Panel de Administración
          </h2>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
            Bienvenido, {adminData?.nombre || "Administrador"}. Última conexión: {new Date().toLocaleDateString()}
          </p>
        </div>
      </PageCard>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1200px',
          alignItems: 'stretch'
        }}
      >
        {statsCards.map((stat, index) => (
          <AdminCard
            key={index}
            variant="stat"
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            gradient={isDark ? 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(31,41,55,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.98))'}
            subtitle={stat.change ? `${stat.change} este mes` : stat.subtitle}
          />
        ))}
      </div>

      {/* Activity Section */}
      <PageCard size="xl">
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <FaHistory style={{ color: "#2196f3" }} />
          Actividad Reciente
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {recentActivity.map((activity, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem",
                background: "var(--color-panel)",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  backgroundColor: `${activity.color}20`,
                  color: activity.color,
                  padding: "0.5rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <activity.icon />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{activity.text}</p>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <FaClock />
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </PageCard>

      {/* System Status */}
      <PageCard size="xl">
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <FaServer style={{ color: "#4caf50" }} />
          Estado del Sistema
        </h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {systemStatus.map((item, idx) => (
            <div
              key={idx}
              className="card inner-card"
              style={{ flex: "1 1 200px", textAlign: "left", display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: item.status === "online" ? "#4caf50" : "#f44336",
                  flexShrink: 0,
                }}
              ></span>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{item.name}</h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
};

export default DashboardAdmin;