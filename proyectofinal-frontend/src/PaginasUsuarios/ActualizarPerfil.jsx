import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../global.css";
import Spinner from "../components/Spinner";

// Nota: API temporal removida — simulación de guardado en frontend.
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

  // Some pages use the global reveal-on-scroll which can delay showing
  // components. For this settings/profile page we want immediate visibility
  // so mark any `.reveal` elements inside this card as visible on mount.
  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => {
      // remove transition delay so elements appear immediately
      el.classList.add("reveal-visible");
    });
    // Also ensure the card itself (which has the `reveal` class) becomes visible
    if (cardRef.current.classList.contains("reveal")) {
      cardRef.current.classList.add("reveal-visible");
    }
  }, []);

  // TODO: Obtener estos datos del backend
  const [formData, setFormData] = useState({
    nombres: "Juan",
    apellidos: "García",
    correo: "juan.garcia@email.com",
    genero: "M",
    fechaNacimiento: "1996-05-15",
    contraseñaActual: "",
    contraseñaNueva: "",
    confirmarContraseña: "",
    notificaciones: true,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (
      formData.contraseñaNueva &&
      formData.contraseñaNueva !== formData.confirmarContraseña
    ) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    // Si desea cambiar contraseña, exigir contraseña actual y longitud mínima
    if (formData.contraseñaNueva) {
      if (!formData.contraseñaActual) {
        setError("Ingrese la contraseña actual para cambiar a una nueva");
        return;
      }
      if (formData.contraseñaNueva.length < 8) {
        setError("La nueva contraseña debe tener al menos 8 caracteres");
        return;
      }
    }

    try {
      setLoading(true);
      // Simulación removida: operación completada inmediatamente (reemplazar por fetch real cuando haya backend)
      setSuccess("Perfil actualizado correctamente (simulado)");
      // Navegar inmediatamente después del éxito para mejorar la sensación de respuesta.
      navigate("/dashboard");
    } catch (err) {
      console.error("Error simulando actualización:", err);
      setError("Error de conexión con el servidor (simulado)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ---------- Navbar ---------- */}
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
              boxShadow: "none",
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

      {/* ---------- Contenido Principal ---------- */}
      <div className="auth-container">
        <div
          ref={cardRef}
          className="auth-card reveal"
          data-revealdelay="60"
          style={{ maxWidth: "900px" }}
        >
          {loading && <Spinner overlay={true} message="Guardando cambios..." />}
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

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Datos Personales */}
            <div className="auth-form-section reveal" data-revealdelay="120">
              <div className="input-labels">
                <label>
                  <FaUser /> Datos Personales
                </label>
              </div>
              <div className="auth-form-grid">
                <div className="form-group">
                  <div
                    className="input-group"
                    style={{ background: "#FFFFFF" }}
                  >
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="Nombres"
                      required
                      style={{ background: "#FFFFFF" }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className="input-group"
                    style={{ background: "#FFFFFF" }}
                  >
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos"
                      required
                      style={{ background: "#FFFFFF" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Datos de Contacto */}
            <div className="auth-form-section reveal" data-revealdelay="160">
              <div className="input-labels">
                <label>
                  <FaEnvelope /> Datos de Contacto
                </label>
              </div>
              <div className="auth-form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <div
                    className="input-group"
                    style={{ background: "#FFFFFF" }}
                  >
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="Correo electrónico"
                      required
                      style={{ background: "#FFFFFF" }}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="auth-form-section reveal" data-revealdelay="200">
              <div className="input-labels">
                <label>
                  <FaVenusMars /> Información Adicional
                </label>
              </div>
              <div className="auth-form-grid">
                <div className="form-group">
                  <div className="gender-options">
                    <div
                      className={`gender-option ${
                        formData.genero === "M" ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleChange({ target: { name: "genero", value: "M" } })
                      }
                      style={{
                        background:
                          formData.genero === "M"
                            ? "rgba(90, 208, 210, 0.1)"
                            : "#FFFFFF",
                      }}
                    >
                      <FaMars />
                      <span>Masculino</span>
                    </div>
                    <div
                      className={`gender-option ${
                        formData.genero === "F" ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleChange({ target: { name: "genero", value: "F" } })
                      }
                      style={{
                        background:
                          formData.genero === "F"
                            ? "rgba(90, 208, 210, 0.1)"
                            : "#FFFFFF",
                      }}
                    >
                      <FaVenus />
                      <span>Femenino</span>
                    </div>
                    <div
                      className={`gender-option ${
                        formData.genero === "O" ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleChange({ target: { name: "genero", value: "O" } })
                      }
                      style={{
                        background:
                          formData.genero === "O"
                            ? "rgba(90, 208, 210, 0.1)"
                            : "#FFFFFF",
                      }}
                    >
                      <FaTransgender />
                      <span>Otro</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className="input-group"
                    style={{ background: "#FFFFFF" }}
                  >
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split("T")[0]}
                      style={{ background: "#FFFFFF" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cambiar Contraseña */}
            <div className="auth-form-section reveal" data-revealdelay="240">
              <div className="input-labels">
                <label>
                  <FaLock /> Cambiar Contraseña (Opcional)
                </label>
              </div>
              <div
                className="auth-form-grid"
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className="form-group">
                  <div
                    className="input-group"
                    style={{ background: "#FFFFFF" }}
                  >
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="contraseñaActual"
                      value={formData.contraseñaActual}
                      onChange={handleChange}
                      placeholder="Contraseña actual"
                      style={{ background: "#FFFFFF" }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className="input-group"
                    style={{ background: "#FFFFFF" }}
                  >
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="contraseñaNueva"
                      value={formData.contraseñaNueva}
                      onChange={handleChange}
                      placeholder="Contraseña nueva"
                      style={{ background: "#FFFFFF" }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className="input-group"
                    style={{ background: "#FFFFFF" }}
                  >
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmarContraseña"
                      value={formData.confirmarContraseña}
                      onChange={handleChange}
                      placeholder="Confirmar contraseña nueva"
                      style={{ background: "#FFFFFF" }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div className="auth-form-section reveal" data-revealdelay="280">
              <div className="input-labels">
                <label>Preferencias</label>
              </div>
              <div className="auth-form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="notificaciones"
                      checked={formData.notificaciones}
                      onChange={handleChange}
                    />
                    Recibir notificaciones por correo
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>
        </div>
      </div>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default ActualizarPerfil;
