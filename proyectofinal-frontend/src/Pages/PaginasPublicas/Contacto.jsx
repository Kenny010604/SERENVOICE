import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../global.css";
import heroImg from "../../assets/ImagenFondoClaro.png";
import {
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaUser,
} from "react-icons/fa";
import NavbarPublic from "../../components/Publico/NavbarPublic";

// ⭐ IMPORTANTE: AGREGADO
import { contactService } from "../../services/contactService";

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    asunto: "",
    mensaje: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // ⭐ VERSION CORREGIDA DEL handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.nombre ||
      !formData.correo ||
      !formData.asunto ||
      !formData.mensaje
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      await contactService.sendMessage(formData);

      setSuccess(
        "¡Mensaje enviado correctamente! Nos pondremos en contacto pronto."
      );

      setFormData({ nombre: "", correo: "", asunto: "", mensaje: "" });
    } catch (error) {
      console.error("Error al enviar contacto:", error);
      setError(error.message || "Error al enviar el mensaje. Intenta de nuevo.");
    }
  };

  return (
    <>
      <NavbarPublic />

      {/* ---------- Contenido Principal ---------- */}
      <main
        className="container"
        style={{
          paddingBottom: "100px",
          backgroundImage: `url(${heroImg}), linear-gradient(rgba(255,255,255,0.28), rgba(255,255,255,0.36))`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        {/* Encabezado */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h2>Contacto</h2>
          <p style={{ fontSize: "1.1rem" }}>
            ¿Tienes preguntas o sugerencias? Nos encantaría escucharte. Ponte en
            contacto con nuestro equipo.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
            width: "100%",
            maxWidth: "1000px",
            marginBottom: "2rem",
          }}
        >
          {/* Email */}
          <div className="card">
            <FaEnvelope
              size={30}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h4
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Email
            </h4>
            <p style={{ marginBottom: "1rem" }}>
              <a
                href="mailto:contacto@serenvoice.com"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                contacto@serenvoice.com
              </a>
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Responderemos dentro de 24 horas
            </p>
          </div>

          {/* Teléfono */}
          <div className="card">
            <FaPhone
              size={30}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h4
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Teléfono
            </h4>
            <p style={{ marginBottom: "1rem" }}>
              <a
                href="tel:+1234567890"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                +1 (234) 567-890
              </a>
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Lunes a Viernes, 9 AM - 6 PM
            </p>
          </div>

          {/* Horario */}
          <div className="card">
            <FaClock
              size={30}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h4
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Horario de Atención
            </h4>
            <p style={{ fontSize: "0.9rem" }}>
              Lunes - Viernes: 9:00 AM - 6:00 PM
              <br />
              Sábado: 10:00 AM - 2:00 PM
              <br />
              Domingo: Cerrado
            </p>
          </div>
        </div>

        {/* Formulario - Debajo */}
        <div
          className="auth-card"
          style={{ width: "100%", maxWidth: "1000px" }}
        >
          <h3
            style={{ color: "var(--color-text-main)", marginBottom: "1.5rem" }}
          >
            Envíanos un Mensaje
          </h3>

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
            <div className="form-group">
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="Tu correo electrónico"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <FaPaperPlane className="input-icon" />
                <input
                  type="text"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  placeholder="Asunto"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                {/* no icon for textarea */}
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Tu mensaje"
                  required
                  rows={5}
                  className="input-textarea"
                />
              </div>
            </div>
            <button type="submit" className="auth-button">
              <FaPaperPlane style={{ marginRight: "0.5rem" }} />
              Enviar Mensaje
            </button>
          </form>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h3 style={{ color: "var(--color-primary)", marginBottom: "1.5rem" }}>
            Preguntas Frecuentes
          </h3>
          <div style={{ textAlign: "left" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h4
                style={{
                  color: "var(--color-text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                ¿Cómo funciona el análisis de voz?
              </h4>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Nuestro sistema analiza múltiples características de tu voz como
                tono, velocidad y variabilidad para detectar patrones
                emocionales.
              </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h4
                style={{
                  color: "var(--color-text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                ¿Mis datos están seguros?
              </h4>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Sí, utilizamos encriptación de nivel bancario y cumplimos con
                todas las regulaciones de privacidad internacionales.
              </p>
            </div>

            <div>
              <h4
                style={{
                  color: "var(--color-text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                ¿Necesito una suscripción?
              </h4>
              <p style={{ color: "var(--color-text-secondary)" }}>
                No, ofrecemos un plan gratuito con todas las funciones y
                características avanzadas.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default Contacto;
