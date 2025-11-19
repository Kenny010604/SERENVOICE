import React from "react";
import { Link } from "react-router-dom";
import "../global.css";
import heroImg from "../assets/ImagenCalma.jpg";
import {
  FaHeart,
  FaShieldAlt,
  FaUsers,
  FaLightbulb,
  FaArrowLeft,
} from "react-icons/fa";
import NavbarPublic from "../components/NavbarPublic";

const Sobre = () => {
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
          <h2>Sobre SerenVoice</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
            SerenVoice es una plataforma innovadora dedicada a mejorar el
            bienestar emocional mediante el análisis inteligente de patrones
            vocales. Creemos que la voz es un reflejo profundo de nuestro estado
            emocional.
          </p>
        </div>

        {/* Nuestra Misión */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h3 style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>
            <FaHeart style={{ marginRight: "0.5rem" }} />
            Nuestra Misión
          </h3>
          <p style={{ lineHeight: "1.8" }}>
            Proporcionar a las personas una herramienta accesible y confiable
            para monitorear su salud emocional, detectar niveles de estrés y
            ansiedad, y promover un bienestar integral a través de la tecnología
            de análisis de voz de última generación.
          </p>
        </div>

        {/* Nuestra Visión */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h3 style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>
            <FaLightbulb style={{ marginRight: "0.5rem" }} />
            Nuestra Visión
          </h3>
          <p style={{ lineHeight: "1.8" }}>
            Ser la plataforma líder en análisis emocional basado en voz,
            ayudando a millones de personas a entender mejor su salud mental y
            tomar decisiones más informadas sobre su bienestar.
          </p>
        </div>

        {/* Nuestros Valores */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "1000px",
          }}
        >
          {/* Privacidad */}
          <div className="card">
            <FaShieldAlt
              size={40}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h4
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Privacidad
            </h4>
            <p>
              Tu privacidad es fundamental. Utilizamos encriptación de nivel
              bancario y protegemos tus datos con los más altos estándares de
              seguridad.
            </p>
          </div>

          {/* Precisión */}
          <div className="card">
            <FaLightbulb
              size={40}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h4
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Precisión
            </h4>
            <p>
              Nuestros algoritmos de IA analizan miles de variables vocales para
              proporcionar resultados precisos y confiables.
            </p>
          </div>

          {/* Accesibilidad */}
          <div className="card">
            <FaUsers
              size={40}
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h4
              style={{
                color: "var(--color-text-main)",
                marginBottom: "0.5rem",
              }}
            >
              Accesibilidad
            </h4>
            <p>
              Creemos que todos merecen acceso a herramientas de bienestar
              emocional. SerenVoice está diseñado para ser accesible para todos.
            </p>
          </div>
        </div>

        {/* Nuestra Historia */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h3 style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>
            Nuestra Historia
          </h3>
          <p style={{ lineHeight: "1.8", marginBottom: "1rem" }}>
            SerenVoice nació de una observación simple: la voz cambia cuando
            estamos estresados o ansiosos. Un equipo de psicólogos, ingenieros y
            especialistas en IA se unió para crear una solución que pudiera
            detectar estos cambios y ayudar a las personas a entender mejor su
            salud emocional.
          </p>
          <p style={{ lineHeight: "1.8" }}>
            Desde nuestro inicio, hemos trabajado incansablemente para mejorar
            nuestros algoritmos y expandir nuestro impacto. Hoy, miles de
            usuarios confían en SerenVoice para monitorear su bienestar.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h3 style={{ color: "var(--color-primary)", marginBottom: "1.5rem" }}>
            Nuestro Impacto
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "2rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "var(--color-primary)", fontSize: "2.5rem" }}>
                10,000+
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Usuarios Activos
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "var(--color-primary)", fontSize: "2.5rem" }}>
                95%
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Satisfacción
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "var(--color-primary)", fontSize: "2.5rem" }}>
                24/7
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Soporte Disponible
              </p>
            </div>
          </div>
        </div>

        {/* Llamada a la Acción */}
        <div className="card" style={{ width: "100%", maxWidth: "1000px" }}>
          <h3>¿Listo para unirte?</h3>
          <p>
            Comienza tu viaje hacia un bienestar emocional mejorado hoy mismo.
          </p>
          <Link to="/registro">
            <button>Registrarse Ahora</button>
          </Link>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
};

export default Sobre;
