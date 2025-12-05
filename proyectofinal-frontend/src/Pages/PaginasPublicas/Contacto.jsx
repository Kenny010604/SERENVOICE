import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPaperPlane, FaExclamationTriangle } from "react-icons/fa";
import "../../global.css";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import { contactService } from "../../services/contactService";
import { useAlertas } from "../../context/AlertasContext";
import heroImg from "../../assets/ImagenFondoClaro.png";

const Contacto = () => {
  const [formData, setFormData] = useState({ nombre: "", email: "", mensaje: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { addAlerta } = useAlertas();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      await contactService.sendMessage(formData);

      addAlerta({
        usuario: formData.nombre,
        tipo: "Mensaje Contacto",
        severidad: "Alta",
        mensaje: formData.mensaje,
      });

      setSuccess("Mensaje enviado. Gracias por contactarnos.");
      setFormData({ nombre: "", email: "", mensaje: "" });
    } catch (err) {
      console.error("Error al enviar contacto:", err);
      setError("Error al enviar el mensaje. Intenta de nuevo.");
    }
  };

  return (
    <>
      <NavbarPublic />
      <main
        className="container"
        style={{
          paddingBottom: 100,
          backgroundImage: `url(${heroImg}), linear-gradient(rgba(255,255,255,0.28), rgba(255,255,255,0.36))`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 900,
            width: "100%",
            margin: "2rem auto",
            padding: "2rem",
            textAlign: "center",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginBottom: 8 }}>Contáctanos</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
            ¿Tienes preguntas o sugerencias? Escríbenos, estamos para ayudarte.
          </p>
        </div>

        {(error || success) && (
          <div
            style={{
              maxWidth: 900,
              margin: "1rem auto",
              padding: "1rem",
              background: error ? "#ffebee" : "#e8f5e9",
              color: error ? "#d32f2f" : "#2e7d32",
              borderRadius: 10,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {error && <FaExclamationTriangle size={20} />}
            {error ? error : success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 900,
            margin: "2rem auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "2rem",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <div className="form-group" style={{ position: "relative" }}>
            <FaUser
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-primary)",
              }}
            />
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
              style={{
                width: "100%",
                padding: "0.8rem 0.8rem 0.8rem 2.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "1rem",
                transition: "border-color 0.3s",
              }}
            />
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <FaEnvelope
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-primary)",
              }}
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Tu correo electrónico"
              required
              style={{
                width: "100%",
                padding: "0.8rem 0.8rem 0.8rem 2.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "1rem",
                transition: "border-color 0.3s",
              }}
            />
          </div>

          <textarea
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Tu mensaje"
            required
            rows={5}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              outline: "none",
              resize: "vertical",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "0.8rem",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "background 0.3s, transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <FaPaperPlane /> Enviar Mensaje
          </button>
        </form>

        {/* Información adicional tipo tarjetas */}
        <div
          style={{
            maxWidth: 900,
            margin: "2rem auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <div
            className="card"
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <FaEnvelope size={28} style={{ color: "var(--color-primary)", marginBottom: 8 }} />
            <h4>Email</h4>
            <p>
              <a href="mailto:contacto@serenvoice.com">contacto@serenvoice.com</a>
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>Respuesta </p>
          </div>

          <div
            className="card"
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <FaUser size={28} style={{ color: "var(--color-primary)", marginBottom: 8 }} />
            <h4>Teléfono</h4>
            <p><a href="tel:+1234567890">+1 (234) 567-890</a></p>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>Lun-Vie 9AM-6PM</p>
          </div>

          <div
            className="card"
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <FaExclamationTriangle size={28} style={{ color: "var(--color-primary)", marginBottom: 8 }} />
            <h4>Horario</h4>
            <p>Lun-Vie: 9AM-6PM<br />Sáb: 10AM-2PM<br />Dom: Cerrado</p>
          </div>
        </div>
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default Contacto;
