import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../global.css";
import Spinner from "../../components/Spinner";
import authService from "../../services/authService";

import {
  FaUser,
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaCalendarAlt,
  FaVenusMars,
  FaMars,
  FaVenus,
  FaTransgender,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

  const ActualizarPerfil = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Obtener usuario real desde localStorage
  const user = authService.getUser();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    correo: user?.correo || "",
    genero: user?.genero || "O",
    fechaNacimiento: user?.fechaNacimiento || "",
    edad: user?.edad || "",
    contraseñaActual: "",
    contraseñaNueva: "",
    confirmarContraseña: "",
    notificaciones: true,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Mostrar tarjeta inmediatamente
  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    cardRef.current.classList.add("reveal-visible");
  }, []);

  const handleChange = (e) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      formData.contraseñaNueva &&
      formData.contraseñaNueva !== formData.confirmarContraseña
    ) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (formData.contraseñaNueva) {
      if (!formData.contraseñaActual) {
        setError("Ingrese su contraseña actual para cambiarla");
        return;
      }
      if (formData.contraseñaNueva.length < 8) {
        setError("La nueva contraseña debe tener al menos 8 caracteres");
        return;
      }
    }

    try {
      setLoading(true);

      // Aquí conectarás el backend después
      // await apiClient.put("/api/user/update", formData);

      setSuccess("Perfil actualizado correctamente");

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-main)",
              fontSize: "1.5rem",
              padding: "0.5rem",
            }}
          >
            <FaArrowLeft />
          </button>
          <h1>SerenVoice</h1>
        </div>
        <div>
          <Link to="/dashboard">Volver al Dashboard</Link>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="auth-container">
        <div ref={cardRef} className="auth-card reveal" style={{ maxWidth: "900px" }}>
          {loading && <Spinner overlay message="Guardando cambios..." />}

          <div className="auth-header">
            <FaUser size={40} className="auth-icon" />
            <h2>Actualizar Perfil</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          {success && (
            <div
              style={{
                background: "rgba(76, 175, 80, 0.1)",
                color: "#4CAF50",
                padding: "0.8rem",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              ✓ {success}
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* ------------ DATOS PERSONALES ------------ */}
            <div className="auth-form-section">
              <label className="input-labels">
                <FaUser /> Datos Personales
              </label>

              <div className="auth-form-grid">
                <div className="form-group">
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Nombre"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Apellido"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ------------ CONTACTO ------------ */}
            <div className="auth-form-section">
              <label className="input-labels">
                <FaEnvelope /> Datos de Contacto
              </label>

              <div className="form-group">
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            {/* ------------ INFORMACIÓN ADICIONAL ------------ */}
<div className="auth-form-section">
  <label className="input-labels">
    <FaVenusMars /> Información Adicional
  </label>

  <div className="auth-form-grid">

    {/* GÉNERO */}
    <div className="form-group">
      <div className="gender-options">
        <div
          className={`gender-option ${formData.genero === "M" ? "selected" : ""}`}
          onClick={() =>
            handleChange({ target: { name: "genero", value: "M" } })
          }
        >
          <FaMars />
          <span>Masculino</span>
        </div>

        <div
          className={`gender-option ${formData.genero === "F" ? "selected" : ""}`}
          onClick={() =>
            handleChange({ target: { name: "genero", value: "F" } })
          }
        >
          <FaVenus />
          <span>Femenino</span>
        </div>

        <div
          className={`gender-option ${formData.genero === "O" ? "selected" : ""}`}
          onClick={() =>
            handleChange({ target: { name: "genero", value: "O" } })
          }
        >
          <FaTransgender />
          <span>Otro</span>
        </div>
      </div>
    </div>

    {/* FECHA DE NACIMIENTO */}
    <div className="form-group">
      <div className="input-group">
        <FaCalendarAlt className="input-icon" />
        <input
          type="date"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={(e) => {
            handleChange(e);

            // Calcular edad automáticamente
            const fecha = new Date(e.target.value);
            const hoy = new Date();
            let edad = hoy.getFullYear() - fecha.getFullYear();
            const m = hoy.getMonth() - fecha.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--;

            setFormData((prev) => ({ ...prev, edad }));
          }}
          required
          max={new Date().toISOString().split("T")[0]}
        />
      </div>
    </div>

    {/* 🔥 NUEVO CAMPO DE EDAD */}
    <div className="form-group">
      <div className="input-group">
        <FaUser className="input-icon" />
        <input
          type="number"
          name="edad"
          value={formData.edad}
          readOnly
          placeholder="Edad"
          style={{ background: "#2a2a2a80", cursor: "not-allowed" }}
        />
      </div>
    </div>

  </div>
</div>

            {/* ------------ CAMBIAR CONTRASEÑA ------------ */}
            <div className="auth-form-section">
              <label className="input-labels">
                <FaLock /> Cambiar Contraseña (Opcional)
              </label>

              <div className="auth-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                {/* Actual */}
                <div className="form-group">
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="contraseñaActual"
                      value={formData.contraseñaActual}
                      onChange={handleChange}
                      placeholder="Contraseña actual"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                      }
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Nueva */}
                <div className="form-group">
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="contraseñaNueva"
                      value={formData.contraseñaNueva}
                      onChange={handleChange}
                      placeholder="Nueva contraseña"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                      }
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirmar */}
                <div className="form-group">
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmarContraseña"
                      value={formData.confirmarContraseña}
                      onChange={handleChange}
                      placeholder="Confirmar nueva contraseña"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                      }
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------ PREFERENCIAS ------------ */}
            <div className="auth-form-section">
              <label className="input-labels">Preferencias</label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  name="notificaciones"
                  checked={formData.notificaciones}
                  onChange={handleChange}
                />
                Recibir notificaciones por correo
              </label>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default ActualizarPerfil;
