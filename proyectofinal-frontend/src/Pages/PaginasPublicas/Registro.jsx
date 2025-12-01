import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../global.css";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import heroImg from "../../assets/ImagenFondoClaro.png";

import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaUser,
  FaEnvelope,
  FaLock,
  FaCalendarAlt,
  FaVenusMars,
  FaMars,
  FaVenus,
  FaTransgender,
} from "react-icons/fa";
import  authService  from "../../services/authService";

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    genero: "",
    fechaNacimiento: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const calcularEdad = (fechaNacimiento) => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 🔥 handleSubmit completo integrado correctamente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!formData.genero) {
      setError("Por favor selecciona un género");
      return;
    }

    const edad = calcularEdad(formData.fechaNacimiento);
    if (edad < 13) {
      setError("Debes tener al menos 13 años para registrarte");
      return;
    }
    if (edad > 120) {
      setError("Por favor ingrese una fecha de nacimiento válida");
      return;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Preparar datos según tu backend
      const userData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        contrasena: formData.contrasena, // ⚠️ tu backend usa Ñ
        genero: formData.genero,
        edad: edad,
        fechaNacimiento: formData.fechaNacimiento,
      };

      // Enviar datos al backend → tu servicio ya hace login automático
      await authService.register(userData);

      // Redirigir después del registro exitoso
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || "Error al registrar usuario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/oauth2/authorization/google";
  };

  return (
    <>
      <NavbarPublic />

      <main
        className="auth-container"
        style={{
          backgroundImage: `url(${heroImg}), linear-gradient(rgba(255,255,255,0.28), rgba(255,255,255,0.36))`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div className="auth-card">
          <div className="auth-header">
            <FaUser size={40} className="auth-icon" />
            <h2>Crear Cuenta</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Datos personales */}
            <div className="auth-form-section">
              <div className="input-labels">
                <label>
                  <FaUser /> Datos personales
                </label>
              </div>
              <div className="auth-form-grid">
                <div className="form-group">
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="Nombres"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Datos de contacto */}
            <div className="auth-form-section">
              <div className="input-labels">
                <label>
                  <FaEnvelope /> Datos de contacto
                </label>
              </div>
              <div className="auth-form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
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
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="auth-form-section">
              <div className="input-labels">
                <label>
                  <FaLock /> Seguridad
                </label>
              </div>
              <div className="auth-form-grid">
                <div className="form-group">
                  <div
                    className="input-group"
                    style={{
                      borderColor:
                        formData.contrasena &&
                        formData.confirmarContrasena &&
                        formData.contrasena !== formData.confirmarContrasena
                          ? "#ff6b6b"
                          : "transparent",
                      borderWidth: "2px",
                      borderStyle: "solid",
                    }}
                  >
                    <FaLock
                      className="input-icon"
                      style={{
                        color:
                          formData.contrasena &&
                          formData.confirmarContrasena &&
                          formData.contrasena !== formData.confirmarContrasena
                            ? "#ff6b6b"
                            : "inherit",
                      }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      placeholder="Contraseña (mínimo 6 caracteres)"
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className="input-group"
                    style={{
                      borderColor:
                        formData.contrasena &&
                        formData.confirmarContrasena &&
                        formData.contrasena !== formData.confirmarContrasena
                          ? "#ff6b6b"
                          : "transparent",
                      borderWidth: "2px",
                      borderStyle: "solid",
                    }}
                  >
                    <FaLock
                      className="input-icon"
                      style={{
                        color:
                          formData.contrasena &&
                          formData.confirmarContrasena &&
                          formData.contrasena !== formData.confirmarContrasena
                            ? "#ff6b6b"
                            : "inherit",
                      }}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmarContrasena"
                      value={formData.confirmarContrasena}
                      onChange={handleChange}
                      placeholder="Confirmar contraseña"
                      required
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="auth-form-section">
              <div className="input-labels">
                <label>
                  <FaVenusMars /> Información adicional
                </label>
              </div>
              <div className="auth-form-grid">
                {/* genero */}
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: "600",
                      color: "var(--color-text-main)",
                    }}
                  >
                    <FaVenusMars style={{ marginRight: "0.5rem" }} /> Género
                  </label>

                  <div className="gender-options">
                    <div
                      className={`gender-option ${
                        formData.genero === "M" ? "selected" : ""
                      }`}
                      onClick={() =>
                        !loading &&
                        handleChange({
                          target: { name: "genero", value: "M" },
                        })
                      }
                    >
                      <FaMars />
                      <span>Masculino</span>
                    </div>

                    <div
                      className={`gender-option ${
                        formData.genero === "F" ? "selected" : ""
                      }`}
                      onClick={() =>
                        !loading &&
                        handleChange({
                          target: { name: "genero", value: "F" },
                        })
                      }
                    >
                      <FaVenus />
                      <span>Femenino</span>
                    </div>

                    <div
                      className={`gender-option ${
                        formData.genero === "O" ? "selected" : ""
                      }`}
                      onClick={() =>
                        !loading &&
                        handleChange({
                          target: { name: "genero", value: "O" },
                        })
                      }
                    >
                      <FaTransgender />
                      <span>Otro</span>
                    </div>
                  </div>
                </div>

                {/* fecha nacimiento */}
                <div className="form-group">
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: "600",
                      color: "var(--color-text-main)",
                    }}
                  >
                    <FaCalendarAlt style={{ marginRight: "0.5rem" }} /> Fecha de
                    nacimiento
                  </label>

                  <div className="input-group">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split("T")[0]}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </button>

            <div className="divider">o</div>

            <button
              type="button"
              className="google-button"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FaGoogle className="google-icon" />
              Registrarse con Google
            </button>

            <p className="auth-link">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default Registro;
