import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaHome,
  FaUsers,
  FaChartBar,
  FaChevronDown,
  FaShieldAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import logo from "../../assets/Logo.svg";

const NavbarAdministrador = ({ adminData = {} }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
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
    navigate("/admin/perfil");
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNavigateToSettings = () => {
    navigate("/admin/configuracion");
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar admin-navbar">
      {/* Logo y nombre */}
      <div className="nav-brand">
        <img
          src={logo}
          alt="SerenVoice Logo"
          className="nav-logo"
        />
        <h1 className="nav-title">SerenVoice</h1>
        <span className="admin-badge">
          <FaShieldAlt /> Admin
        </span>
      </div>

      {/* Botón hamburguesa para móvil */}
      <button
        className={`nav-toggle ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Enlaces y menú */}
      <div className={`nav-links admin-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/admin/dashboard" className="admin-link" onClick={() => setMobileMenuOpen(false)}>
          <FaHome /> <span>Dashboard</span>
        </Link>

        <Link to="/admin/usuarios" className="admin-link" onClick={() => setMobileMenuOpen(false)}>
          <FaUsers /> <span>Usuarios</span>
        </Link>

        <Link to="/admin/reportes" className="admin-link" onClick={() => setMobileMenuOpen(false)}>
          <FaChartBar /> <span>Reportes</span>
        </Link>

        <Link to="/admin/alertas" className="admin-link" onClick={() => setMobileMenuOpen(false)}>
          <FaBell /> <span>Alertas</span>
        </Link>

        {/* Menú de administrador */}
        <div className="user-menu-wrapper">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="admin-user-button"
          >
            <FaUser /> <span>{adminData.nombres || "Admin"}</span>
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
              <button
                onClick={handleNavigateToProfile}
                className="admin-menu-item"
              >
                <FaUser /> <span>Mi Perfil</span>
              </button>

              {/* Configuración */}
              <button
                onClick={handleNavigateToSettings}
                className="admin-menu-item"
              >
                <FaCog /> <span>Configuración</span>
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="admin-menu-item admin-logout"
              >
                <FaSignOutAlt /> <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdministrador;
