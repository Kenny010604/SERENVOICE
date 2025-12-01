import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import { FaHome, FaInfoCircle, FaEnvelope, FaMicrophone, FaUserPlus, FaSignInAlt } from "react-icons/fa";

const NavbarPublic = () => {
  return (
    <nav className="navbar">
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
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <FaHome /> <span>Inicio</span>
        </Link>

        <Link to="/sobre" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <FaInfoCircle /> <span>Sobre</span>
        </Link>

        <Link to="/contacto" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <FaEnvelope /> <span>Contacto</span>
        </Link>

        <Link to="/probar" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <FaMicrophone /> <span>Prueba de Análisis</span>
        </Link>

        <Link to="/registro" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginLeft: "1rem" }}>
          <FaUserPlus /> <span>Registrarse</span>
        </Link>

        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem" }}>
          <FaSignInAlt /> <span>Iniciar Sesión</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavbarPublic;
