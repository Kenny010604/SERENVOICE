import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../global.css";
import Spinner from "../../components/Spinner";
import authService from "../../services/authService";
import apiClient from "../../services/apiClient";

import {
  FaUser,
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaCalendarAlt,
  FaMars,
  FaVenus,
  FaTransgender,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const ActualizarPerfil = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const user = authService.getUser();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    correo: user?.correo || "",
    genero: user?.genero ?? "O",
    fechaNacimiento: user?.fecha_nacimiento
      ? new Date(user.fecha_nacimiento).toISOString().slice(0, 10)
      : "",
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

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    cardRef.current.classList.add("reveal-visible");
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
const payload = {
  nombre: formData.nombre,
  apellido: formData.apellido,
  correo: formData.correo,
  genero: formData.genero,
  fecha_nacimiento: formData.fechaNacimiento,
  usa_medicamentos: formData.usa_medicamentos,
  notificaciones: formData.notificaciones,

  contrasenaActual: formData.contraseñaActual,
  contrasenaNueva: formData.contraseñaNueva,
  confirmarContrasena: formData.confirmarContraseña,
};



const response = await apiClient.put("/api/auth/update", payload);

      if (response.data.success) {
        setSuccess("Perfil actualizado correctamente");

        authService.setUser({
          ...user,
          ...response.data.user,
        });

        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setError(response.data.error || "Error al actualizar perfil");
      }
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          <label className="checkbox-label">
  <input
    type="checkbox"
    name="usa_medicamentos"
    checked={formData.usa_medicamentos}
    onChange={handleChange}
  />
  Uso medicamentos actualmente
</label>


          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="correo"
                placeholder="Correo"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaCalendarAlt className="input-icon" />
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>

            <label>Género</label>
            <div className="gender-select">
              <label>
                <input
                  type="radio"
                  name="genero"
                  value="M"
                  checked={formData.genero === "M"}
                  onChange={handleChange}
                />
                <FaMars /> Masculino
              </label>

              

              <label>
                <input
                  type="radio"
                  name="genero"
                  value="F"
                  checked={formData.genero === "F"}
                  onChange={handleChange}
                />
                <FaVenus /> Femenino
              </label>

              <label>
                <input
                  type="radio"
                  name="genero"
                  value="O"
                  checked={formData.genero === "O"}
                  onChange={handleChange}
                />
                <FaTransgender /> Otro
              </label>

              <div className="input-group">
  <FaCalendarAlt className="input-icon" />
  <input
    type="number"
    name="edad"
    value={formData.edad}
    readOnly
    style={{ background: "#222", cursor: "not-allowed" }}
  />
</div>




            </div>

            <hr style={{ margin: "1rem 0" }} />

            <h3>Cambio de contraseña (opcional)</h3>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPasswords.current ? "text" : "password"}
                name="contraseñaActual"
                placeholder="Contraseña actual"
                value={formData.contraseñaActual}
                onChange={handleChange}
              />
              <span
                className="toggle-password"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
              >
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPasswords.new ? "text" : "password"}
                name="contraseñaNueva"
                placeholder="Nueva contraseña"
                value={formData.contraseñaNueva}
                onChange={handleChange}
              />
              <span
                className="toggle-password"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    new: !prev.new,
                  }))
                }
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmarContraseña"
                placeholder="Confirmar contraseña"
                value={formData.confirmarContraseña}
                onChange={handleChange}
              />
              <span
                className="toggle-password"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notificaciones"
                checked={formData.notificaciones}
                onChange={handleChange}
              />
              Recibir notificaciones y alertas
            </label>

            <button type="submit" className="btn-primary" disabled={loading}>
              Guardar cambios
            </button>
          </form>
        </div>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default ActualizarPerfil;
