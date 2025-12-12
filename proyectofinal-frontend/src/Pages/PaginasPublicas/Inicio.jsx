import {
  FaBullseye,
  FaChartLine,
  FaLock,
  FaStar,
  FaUsers,
  FaSmile,
  FaHeadset,
} from "react-icons/fa";
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../global.css";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import { ThemeContext } from "../../context/themeContextDef";
import PaisajeClaro from "../../assets/PaisajeClaro.svg";
import PaisajeOscuro from "../../assets/PaisajeOscuro.svg";


const Inicio = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  return (
    <>
      {/* ---------- Navbar ---------- */}
      <NavbarPublic />

      {/* ---------- Contenido principal ---------- */}
      <main
        className="container"
        style={{
          paddingTop: "2rem",
          paddingBottom: "3rem",
          backgroundImage: `url(${isDark ? PaisajeOscuro : PaisajeClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            className="card wide-card"
            style={{ marginBottom: "2rem", padding: "1.5rem" }}
          >
            <h2>Bienvenido a SerenVoice</h2>
            <p
              style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
            >
              Tu bienestar emocional comienza con tu voz. Analizamos patrones
              vocales para detectar niveles de estrés y ansiedad, ayudándote a
              mantener un equilibrio emocional.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={() => navigate("/probar")}>
                Comenzar Análisis
              </button>
            </div>
          </div>

          {/* Sección de Características */}
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
              <div
                className="feature-card"
                style={{
                  background: "rgba(90, 208, 210, 0.08)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  width: "380px",
                  minWidth: "240px",
                  maxWidth: "420px",
                  flex: "0 1 380px",
                }}
              >
                <FaBullseye
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--color-primary)",
                    marginBottom: "1rem",
                  }}
                />
                <h3 style={{ margin: "0 0 0.75rem 0" }}>Análisis Preciso</h3>
                <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                  Utilizamos tecnología de punta para analizar los patrones de
                  tu voz con alta precisión.
                </p>
              </div>

              <div
                className="feature-card"
                style={{
                  background: "rgba(90, 208, 210, 0.08)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  width: "380px",
                  minWidth: "240px",
                  maxWidth: "420px",
                  flex: "0 1 380px",
                }}
              >
                <FaChartLine
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--color-primary)",
                    marginBottom: "1rem",
                  }}
                />
                <h3 style={{ margin: "0 0 0.75rem 0" }}>
                  Seguimiento Continuo
                </h3>
                <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                  Monitorea tu progreso a lo largo del tiempo con gráficos
                  detallados y análisis comprensivos.
                </p>
              </div>

              <div
                className="feature-card"
                style={{
                  background: "rgba(90, 208, 210, 0.08)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  width: "380px",
                  minWidth: "240px",
                  maxWidth: "420px",
                  flex: "0 1 380px",
                }}
              >
                <FaLock
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--color-primary)",
                    marginBottom: "1rem",
                  }}
                />
                <h3 style={{ margin: "0 0 0.75rem 0" }}>
                  Privacidad Garantizada
                </h3>
                <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                  Tu información está segura con nosotros. Utilizamos
                  encriptación de nivel bancario.
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Testimonios */}
          <div className="card wide-card" style={{ marginBottom: "2rem" }}>
            <h2>Lo que dicen nuestros usuarios</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  background: "rgba(90, 208, 210, 0.1)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  borderLeft: "4px solid var(--color-primary)",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontStyle: "italic",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.5",
                    margin: "0 0 1rem 0",
                  }}
                >
                  "La precisión del análisis emocional es increíble. Pude
                  identificar patrones de estrés que no había notado antes."
                </p>
                <p
                  style={{
                    marginTop: 0,
                    fontWeight: "bold",
                    color: "var(--color-primary)",
                  }}
                >
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar style={{ marginRight: "0.5rem", color: "#FFD700" }} />
                  María García
                </p>
              </div>
              <div
                style={{
                  background: "rgba(90, 208, 210, 0.1)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  borderLeft: "4px solid var(--color-primary)",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontStyle: "italic",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.5",
                    margin: "0 0 1rem 0",
                  }}
                >
                  "Llevo 3 meses usándolo y ha sido un cambio radical en cómo
                  manejo mi ansiedad. ¡Altamente recomendado!"
                </p>
                <p
                  style={{
                    marginTop: 0,
                    fontWeight: "bold",
                    color: "var(--color-primary)",
                  }}
                >
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar style={{ marginRight: "0.5rem", color: "#FFD700" }} />
                  Carlos López
                </p>
              </div>
              <div
                style={{
                  background: "rgba(90, 208, 210, 0.1)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  borderLeft: "4px solid var(--color-primary)",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontStyle: "italic",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.5",
                    margin: "0 0 1rem 0",
                  }}
                >
                  "La interfaz es muy intuitiva y los reportes me ayudan a
                  entender mejor mi bienestar emocional diario."
                </p>
                <p
                  style={{
                    marginTop: 0,
                    fontWeight: "bold",
                    color: "var(--color-primary)",
                  }}
                >
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar
                    style={{ marginRight: "0.25rem", color: "#FFD700" }}
                  />
                  <FaStar style={{ marginRight: "0.5rem", color: "#FFD700" }} />
                  Ana Rodríguez
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Estadísticas */}
          <div className="card wide-card" style={{ marginBottom: "2rem" }}>
            <h2>Nuestro Impacto</h2>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              {[
                { number: "10,000+", label: "Usuarios Activos", icon: FaUsers },
                { number: "95%", label: "Satisfacción", icon: FaSmile },
                { number: "24/7", label: "Soporte", icon: FaHeadset },
              ].map((stat, i) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={i}
                    style={{
                      textAlign: "center",
                      flex: "1",
                      minWidth: "200px",
                    }}
                  >
                    <IconComponent
                      style={{
                        fontSize: "2.5rem",
                        color: "var(--color-primary)",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <h3
                      style={{ fontSize: "2rem", color: "var(--color-accent)" }}
                    >
                      {stat.number}
                    </h3>
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sección de Contacto */}
          <div
            className="card wide-card"
            style={{ marginBottom: "2rem", textAlign: "center" }}
          >
            <h2>¿Listo para comenzar?</h2>
            <p>
              Da el primer paso hacia un mayor bienestar emocional. ¡Analiza tu
              voz ahora!
            </p>
            <Link to="/probar">
              <button>Probar Análisis de Voz</button>
            </Link>
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
