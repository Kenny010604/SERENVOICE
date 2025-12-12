import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaHome,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaMicrophone,
  FaHistory,
  FaLightbulb,
} from "react-icons/fa";

const NavbarUsuario = ({ userData = {} }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Usar contexto de autenticación si está disponible para limpiar sesión y persistencia
    if (auth && auth.logout) auth.logout();
    else {
      localStorage.removeItem("token");
      localStorage.removeItem("roles");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
    }
    navigate("/login");
  };

  const handleNavigateToProfile = () => {
    navigate("/actualizar-perfil");
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNavigateToSettings = () => {
    navigate("/configuracion");
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar user-navbar">
      {/* Logo y nombre */}
      <div className="nav-brand">
        <h1 className="nav-title">SerenVoice</h1>
        <span className="user-badge">Usuario</span>
      </div>

      {/* Botón hamburguesa para móvil */}
      <button
        className={`nav-toggle ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Enlaces y menú */}
      <div className={`nav-links user-nav-links ${mobileMenuOpen ? "open" : ""}`}>
        <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
          <FaHome /> <span>Inicio</span>
        </Link>

        <Link to="/analizar-voz" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
          <FaMicrophone /> <span>Analizar Voz</span>
        </Link>

        <Link to="/historial" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
          <FaHistory /> <span>Historial</span>
        </Link>

        <Link to="/recomendaciones" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
          <FaLightbulb /> <span>Recomendaciones</span>
        </Link>

        <Link to="/alertas" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
          <FaBell /> <span>Alertas</span>
        </Link>

        {/* Menú de usuario */}
        <div className="user-menu-wrapper">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="user-menu-button"
          >
            <FaUser /> <span>{userData.nombres || "Usuario"}</span>
            <FaChevronDown
              style={{
                fontSize: "0.75rem",
                transition: "transform 0.3s",
                transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {userMenuOpen && (
            <div className="user-dropdown">
              {/* Perfil */}
              <button onClick={handleNavigateToProfile} className="user-menu-item">
                <FaUser /> <span>Mi Perfil</span>
              </button>

              {/* Configuración */}
              <button onClick={handleNavigateToSettings} className="user-menu-item">
                <FaCog /> <span>Configuración</span>
              </button>

              {/* Cerrar sesión */}
              <button onClick={handleLogout} className="user-menu-item user-logout">
                <FaSignOutAlt /> <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarUsuario;
