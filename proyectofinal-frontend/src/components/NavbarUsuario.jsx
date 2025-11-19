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
} from "react-icons/fa";

const NavbarUsuario = ({ userData = {} }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    // Use auth context if available to clear session and persistence
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
  };

  const handleNavigateToSettings = () => {
    navigate("/configuracion");
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
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Logo y nombre */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>SerenVoice</h1>
        <span
          style={{
            background: "#5ad0d2",
            color: "#fff",
            padding: "0.25rem 0.75rem",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          Usuario
        </span>
      </div>

      {/* Enlaces y menú */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "var(--color-text-main)",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--color-text-main)")}
        >
          <FaHome /> Inicio
        </Link>

        <Link
          to="/alertas"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "var(--color-text-main)",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--color-text-main)")}
        >
          <FaBell /> Alertas
        </Link>

        {/* Menú de usuario */}
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
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(90, 208, 210, 0.1)";
              e.target.style.color = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              if (!userMenuOpen) {
                e.target.style.background = "none";
                e.target.style.color = "var(--color-text-main)";
              }
            }}
          >
            <FaUser /> {userData.nombres || "Usuario"}
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
                border: "1px solid rgba(255, 255, 255, 0.1)",
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
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(90, 208, 210, 0.1)";
                  e.target.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                  e.target.style.color = "var(--color-text-main)";
                }}
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
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(90, 208, 210, 0.1)";
                  e.target.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                  e.target.style.color = "var(--color-text-main)";
                }}
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
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 107, 107, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                }}
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

export default NavbarUsuario;
