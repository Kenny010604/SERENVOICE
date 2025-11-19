import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
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
} from "react-icons/fa";
import logo from "../assets/Logo.svg";

const NavbarAdministrador = ({ adminData = {} }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
  };

  const handleNavigateToSettings = () => {
    navigate("/admin/configuracion");
    setUserMenuOpen(false);
  };

  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "var(--color-panel)",
        backdropFilter: "blur(8px)",
        borderBottom: "2px solid #ff6b6b",
      }}
    >
      {/* Logo y nombre */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <img
          src={logo}
          alt="SerenVoice Logo"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
          }}
        />
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>SerenVoice</h1>
        <span
          style={{
            background: "#ff6b6b",
            color: "#fff",
            padding: "0.25rem 0.75rem",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "600",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaShieldAlt /> Admin
        </span>
      </div>

      {/* Enlaces y menú */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link to="/admin/dashboard" className="admin-link">
          <FaHome /> Dashboard
        </Link>

        <Link to="/admin/usuarios" className="admin-link">
          <FaUsers /> Usuarios
        </Link>

        <Link to="/admin/reportes" className="admin-link">
          <FaChartBar /> Reportes
        </Link>

        <Link to="/admin/alertas" className="admin-link">
          <FaBell /> Alertas
        </Link>

        {/* Menú de administrador */}
        <div style={{ position: "relative", display: "inline-block", zIndex: 1001 }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--color-text-main)",
              fontSize: "1rem",
              boxShadow: "none",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              transition: "all 0.3s",
            }}
            className="admin-user-button"
          >
            <FaUser /> {adminData.nombres || "Admin"}
            <FaChevronDown
              style={{
                fontSize: "0.75rem",
                transition: "transform 0.3s",
                transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {userMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "var(--color-panel)",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                boxShadow: "0 4px 12px var(--color-shadow)",
                minWidth: "220px",
                zIndex: 1100,
                marginTop: "0.5rem",
                border: "1px solid rgba(255, 107, 107, 0.2)",
                overflow: "hidden",
              }}
            >
              {/* Perfil */}
              <button
                onClick={handleNavigateToProfile}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--color-text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.95rem",
                  transition: "all 0.3s",
                }}
                className="admin-menu-item"
              >
                <FaUser /> Mi Perfil
              </button>

              {/* Configuración */}
              <button
                onClick={handleNavigateToSettings}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--color-text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.95rem",
                  transition: "all 0.3s",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                className="admin-menu-item"
              >
                <FaCog /> Configuración
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "#ff6b6b",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.95rem",
                  transition: "all 0.3s",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                className="admin-menu-item admin-logout"
              >
                <FaSignOutAlt /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdministrador;
