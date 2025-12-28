import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaFlag,
  FaUserCheck,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBell,
  FaClipboardList,
  FaGamepad,
  FaUserFriends,
  FaLightbulb,
  FaCog,
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
  const [alertasCriticas, setAlertasCriticas] = useState([]);
  const [alertasCriticasCount, setAlertasCriticasCount] = useState(0);
  const [gruposActivos, setGruposActivos] = useState(0);
  const [analisisHoy, setAnalisisHoy] = useState(0);

  // -----------------------------
  // FETCH DE DATOS DEL BACKEND
  // -----------------------------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Usar las rutas de /api/usuarios
        const [statsRes, profileRes, alertasRes, gruposRes, analisisRes] = await Promise.all([
          apiClient.get("/usuarios/statistics"),
          apiClient.get("/usuarios/me"),
          apiClient.get("/alertas/criticas").catch(() => ({ data: { data: [] } })),
          apiClient.get("/grupos/estadisticas").catch(() => ({ data: { data: { activos: 0 } } })),
          apiClient.get("/analisis/hoy").catch(() => ({ data: { data: { total: 0 } } })),
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

        // Datos adicionales: tolerar varias formas de respuesta del backend
        // Alertas críticas: puede venir como array, objeto con propiedad numérica, o wrapped
        let alertasArray = [];
        let alertasCount = 0;
        try {
          if (alertasRes?.data) {
            // Forma: { success: true, data: [...] }
            if (Array.isArray(alertasRes.data.data)) {
              alertasArray = alertasRes.data.data;
              alertasCount = alertasArray.length;
            } else if (Array.isArray(alertasRes.data)) {
              alertasArray = alertasRes.data;
              alertasCount = alertasArray.length;
            } else if (typeof alertasRes.data.data === 'object' && alertasRes.data.data !== null) {
              // Forma: { data: { alertas_criticas: N } }
              alertasCount = alertasRes.data.data.alertas_criticas || alertasRes.data.data.total || 0;
            } else if (typeof alertasRes.data.alertas_criticas !== 'undefined') {
              alertasCount = alertasRes.data.alertas_criticas;
            } else if (typeof alertasRes.data.total !== 'undefined') {
              alertasCount = alertasRes.data.total;
            }
          }
        } catch {
          alertasArray = [];
          alertasCount = 0;
        }

        setAlertasCriticas(alertasArray);
        setAlertasCriticasCount(alertasCount || 0);

        // Grupos activos: admitir { data: { activos } } o { activos } o número directo
        let activos = 0;
        try {
          if (gruposRes?.data) {
            if (gruposRes.data.data && typeof gruposRes.data.data.activos !== 'undefined') {
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

        // Analisis hoy: API usa formato { data: { total } }
        // Analisis hoy: admitir { data: { total } } o { total } o número directo
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
      title: "Grupos Activos",
      value: gruposActivos,
      icon: FaUserFriends,
      color: "#9c27b0",
      gradient:
        "linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(156, 39, 176, 0.05))",
    },
    {
      variant: "stat",
      title: "Alertas Críticas",
      value: alertasCriticasCount || alertasCriticas.length || 0,
      icon: FaExclamationTriangle,
      color: "#ff9800",
      gradient:
        "linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05))",
    },
    {
      variant: "stat",
      title: "Análisis Hoy",
      value: analisisHoy,
      icon: FaChartLine,
      color: "#2196f3",
      gradient:
        "linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))",
    },
    {
      variant: "stat",
      title: "Reportes Pendientes",
      value: statistics?.reportesRespuesta ?? statistics?.reportes_respuesta ?? statistics?.reportes ?? 0,
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
      description: "Administra roles, visualiza estadísticas y controla usuarios del sistema.",
      buttonText: "Ir a Usuarios",
      onClick: () => navigate("/admin/usuarios"),
    },
    {
      variant: "action",
      icon: FaExclamationTriangle,
      title: "Alertas Críticas",
      description: "Monitorea y gestiona alertas de alto riesgo y casos urgentes.",
      buttonText: "Ver Alertas",
      onClick: () => navigate("/admin/alertas"),
    },
    {
      variant: "action",
      icon: FaUserFriends,
      title: "Grupos Terapéuticos",
      description: "Supervisa grupos, facilitadores y participación en actividades.",
      buttonText: "Ver Grupos",
      onClick: () => navigate("/admin/grupos"),
    },
    {
      variant: "action",
      icon: FaBell,
      title: "Notificaciones",
      description: "Gestiona plantillas y configuración de notificaciones del sistema.",
      buttonText: "Configurar",
      onClick: () => navigate("/admin/notificaciones"),
    },
    {
      variant: "action",
      icon: FaLightbulb,
      title: "Recomendaciones",
      description: "Analiza efectividad de recomendaciones generadas por IA.",
      buttonText: "Ver Recomendaciones",
      onClick: () => navigate("/admin/recomendaciones"),
    },
    {
      variant: "action",
      icon: FaChartLine,
      title: "Reportes y Estadísticas",
      description: "Genera reportes completos y análisis de tendencias.",
      buttonText: "Ver Reportes",
      onClick: () => navigate("/admin/reportes"),
    },
    {
      variant: "action",
      icon: FaGamepad,
      title: "Sesiones de Juego",
      description: "Analiza efectividad de juegos terapéuticos y mejora percibida.",
      buttonText: "Ver Sesiones",
      onClick: () => navigate("/admin/sesiones-juego"),
    },
    {
      variant: "action",
      icon: FaCog,
      title: "Auditoría y Seguridad",
      description: "Revisa historial de cambios, sesiones y accesos al sistema.",
      buttonText: "Ver Auditoría",
      onClick: () => navigate("/admin/auditoria"),
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

        {/* Alertas Urgentes */}
        {alertasCriticas.length > 0 && (
          <div className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaExclamationTriangle style={{ color: "#ff9800" }} />
              Alertas Urgentes Pendientes
            </h3>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {alertasCriticas.slice(0, 5).map((alerta, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: "1rem",
                    marginBottom: "0.75rem",
                    borderLeft: `4px solid ${alerta.tipo_alerta === 'critica' ? '#f44336' : '#ff9800'}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <strong>{alerta.titulo}</strong>
                      <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                        {alerta.descripcion}
                      </div>
                      <div style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        Usuario: {alerta.nombre} {alerta.apellido} | Nivel: {alerta.clasificacion}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/admin/alertas")}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Revisar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {alertasCriticas.length > 5 && (
              <button
                onClick={() => navigate("/admin/alertas")}
                style={{ marginTop: "1rem", width: "100%" }}
              >
                Ver todas las alertas ({alertasCriticas.length})
              </button>
            )}
          </div>
        )}

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