// src/Pages/PaginasPublicas/Inicio.jsx
import {
  FaBullseye,
  FaChartLine,
  FaLock,
  FaStar,
  FaUsers,
  FaSmile,
  FaHeadset,
} from "react-icons/fa";
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../global.css";
import heroImg from "../../assets/ImagenFondoClaro.png";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import authService from "../../services/authService";

const Inicio = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleComenzarAnalisis = () => {
    if (user) {
      // Usuario logueado → ruta protegida
      navigate("/probar-voz-usuario");
    } else {
      // Usuario no logueado → ruta pública
      navigate("/probar-voz");
    }
  };

  return (
    <>
      {/* ---------- Navbar ---------- */}
      <NavbarPublic />

      {/* ---------- Contenido principal ---------- */}
      <main
        style={{
          width: "100%",
          padding: "2rem",
          backgroundImage: `url(${heroImg}), linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.35))`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* ---------- Bienvenida ---------- */}
          <div className="card wide-card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
            <h2>Bienvenido a SerenVoice</h2>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              Tu bienestar emocional comienza con tu voz. Analizamos patrones
              vocales para detectar niveles de estrés y ansiedad, ayudándote a
              mantener un equilibrio emocional.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleComenzarAnalisis}>
                Comenzar Análisis
              </button>
            </div>
          </div>

          {/* ---------- Características ---------- */}
          <div className="card wide-card" style={{ marginBottom: "2rem" }}>
            <h2>Características Principales</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "32px",
                width: "100%",
                margin: "0 auto 32px auto",
              }}
            >
              {[
                { icon: FaBullseye, title: "Análisis Preciso", text: "Utilizamos tecnología de punta para analizar los patrones de tu voz con alta precisión." },
                { icon: FaChartLine, title: "Seguimiento Continuo", text: "Monitorea tu progreso a lo largo del tiempo con gráficos detallados y análisis comprensivos." },
                { icon: FaLock, title: "Privacidad Garantizada", text: "Tu información está segura con nosotros. Utilizamos encriptación de nivel bancario." },
              ].map((feat, i) => {
                const IconComponent = feat.icon;
                return (
                  <div key={i} className="feature-card" style={{
                    background: "rgba(90, 208, 210, 0.08)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    textAlign: "center",
                    width: "380px",
                    minWidth: "240px",
                    maxWidth: "420px",
                    flex: "0 1 380px",
                  }}>
                    <IconComponent style={{ fontSize: "2.5rem", color: "var(--color-primary)", marginBottom: "1rem" }} />
                    <h3 style={{ margin: "0 0 0.75rem 0" }}>{feat.title}</h3>
                    <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>{feat.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------- Testimonios ---------- */}
          <div className="card wide-card" style={{ marginBottom: "2rem" }}>
            <h2>Lo que dicen nuestros usuarios</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem" }}>
              {[
                { text: "La precisión del análisis emocional es increíble. Pude identificar patrones de estrés que no había notado antes.", name: "María García" },
                { text: "Llevo 3 meses usándolo y ha sido un cambio radical en cómo manejo mi ansiedad. ¡Altamente recomendado!", name: "Carlos López" },
                { text: "La interfaz es muy intuitiva y los reportes me ayudan a entender mejor mi bienestar emocional diario.", name: "Ana Rodríguez" },
              ].map((t, i) => (
                <div key={i} style={{
                  background: "rgba(90, 208, 210, 0.1)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  borderLeft: "4px solid var(--color-primary)",
                  textAlign: "left",
                }}>
                  <p style={{ fontStyle: "italic", color: "var(--color-text-secondary)", lineHeight: "1.5", margin: "0 0 1rem 0" }}>
                    "{t.text}"
                  </p>
                  <p style={{ marginTop: 0, fontWeight: "bold", color: "var(--color-primary)" }}>
                    {[...Array(5)].map((_, idx) => <FaStar key={idx} style={{ marginRight: "0.25rem", color: "#FFD700" }} />)}
                    {t.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Estadísticas ---------- */}
          <div className="card wide-card" style={{ marginBottom: "2rem" }}>
            <h2>Nuestro Impacto</h2>
            <div style={{ display: "flex", justifyContent: "space-around", padding: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              {[
                { number: "10,000+", label: "Usuarios Activos", icon: FaUsers },
                { number: "95%", label: "Satisfacción", icon: FaSmile },
                { number: "24/7", label: "Soporte", icon: FaHeadset },
              ].map((stat, i) => {
                const IconComponent = stat.icon;
                return (
                  <div key={i} style={{ textAlign: "center", flex: "1", minWidth: "200px" }}>
                    <IconComponent style={{ fontSize: "2.5rem", color: "var(--color-primary)", marginBottom: "0.75rem" }} />
                    <h3 style={{ fontSize: "2rem", color: "var(--color-accent)" }}>{stat.number}</h3>
                    <p style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------- Call to Action ---------- */}
          <div className="card wide-card" style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h2>¿Listo para comenzar?</h2>
            <p>Da el primer paso hacia un mayor bienestar emocional. ¡Analiza tu voz ahora!</p>
            <button onClick={handleComenzarAnalisis}>Probar Análisis de Voz</button>
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

export default Inicio;
