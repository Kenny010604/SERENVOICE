import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaMicrophone,
} from "react-icons/fa";
import logo from "../assets/Logo.svg";
import "../global.css";
import NavbarPublic from "../components/NavbarPublic";
import heroImg from "../assets/ImagenFondoClaro.png";
import ModalSeleccionRol from "../components/ModalSeleccionRol";
import { useAuth } from "../context/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const auth = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implementar la lógica de inicio de sesión
    console.log("Login attempt with:", { email, password });

    // SIMULACIÓN: Respuesta del backend con token y roles
    const simulatedResponse = {
      token: "fake-jwt-token",
      roles: ["USUARIO", "ADMINISTRADOR"],
      user: { nombres: "Juan", correo: email },
    };

    // Guardar token/roles en el contexto (persistencia)
    if (auth && auth.login) {
      auth.login({
        token: simulatedResponse.token,
        roles: simulatedResponse.roles,
        user: simulatedResponse.user,
      });
    } else {
      localStorage.setItem("token", simulatedResponse.token);
      localStorage.setItem("roles", JSON.stringify(simulatedResponse.roles));
      localStorage.setItem("user", JSON.stringify(simulatedResponse.user));
    }

    const roles = simulatedResponse.roles;
    if (roles.length > 1) {
      // Mostrar modal para seleccionar rol
      setShowRoleModal(true);
    } else if (roles.length === 1) {
      const onlyRole = roles[0];
      if (auth && auth.setUserRole) auth.setUserRole(onlyRole);
      else localStorage.setItem("userRole", onlyRole);
      if (onlyRole === "ADMINISTRADOR") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } else {
      console.error("Usuario sin roles asignados");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "URL_DE_TU_BACKEND/oauth2/authorization/google";
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
  };

  return (
    <>
      {/* ---------- Navbar ---------- */}
      <NavbarPublic />

      {/* ---------- Contenido principal ---------- */}
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "2rem",
            alignItems: "stretch",
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          {/* Left hero column */}
          <div
            className="auth-card login-hero centered"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "3rem",
            }}
          >
            <div>
              <img
                src={logo}
                alt="SerenVoice Logo"
                style={{ width: 90, height: 90 }}
              />
              <h3
                style={{
                  color: "var(--color-text-main)",
                  margin: "1rem 0 0 0",
                  fontSize: "1.5rem",
                }}
              >
                Prueba la captura de voz
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  margin: "0.75rem 0 0 0",
                  fontSize: "1.05rem",
                  lineHeight: "1.5",
                }}
              >
                Graba unos segundos de tu voz para ver cómo funciona nuestro
                análisis emocional. Puedes probar sin crear una cuenta.
              </p>
              <div style={{ marginTop: "2rem" }}>
                <button
                  type="button"
                  className="auth-button"
                  onClick={() => navigate("/probar")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.95rem 2.5rem",
                    fontSize: "1.05rem",
                  }}
                >
                  <FaMicrophone /> Probar ahora
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1.2rem",
                marginTop: "2.5rem",
              }}
            >
              <div style={{ gridColumn: "1 / -1", marginBottom: "0.5rem" }}>
                <h4
                  style={{
                    color: "var(--color-text-main)",
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  ¿Cómo funciona?
                </h4>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.95rem",
                    textAlign: "center",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  Descubre paso a paso cómo nuestro análisis emocional
                  transforma tu bienestar
                </p>
              </div>
              <div
                style={{
                  background: "rgba(90, 208, 210, 0.1)",
                  padding: "1.3rem",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <h4
                  style={{
                    color: "var(--color-primary)",
                    marginBottom: "0.75rem",
                    fontSize: "1.05rem",
                    fontWeight: "600",
                  }}
                >
                  1. Graba tu voz
                </h4>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.95rem",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  Presiona el botón de micrófono y graba algunos segundos de
                  audio
                </p>
              </div>
              <div
                style={{
                  background: "rgba(90, 208, 210, 0.1)",
                  padding: "1.3rem",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <h4
                  style={{
                    color: "var(--color-primary)",
                    marginBottom: "0.75rem",
                    fontSize: "1.05rem",
                    fontWeight: "600",
                  }}
                >
                  2. Análisis IA
                </h4>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.95rem",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  Nuestro sistema analiza tono, velocidad y emociones en tu voz
                </p>
              </div>
              <div
                style={{
                  background: "rgba(90, 208, 210, 0.1)",
                  padding: "1.3rem",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <h4
                  style={{
                    color: "var(--color-primary)",
                    marginBottom: "0.75rem",
                    fontSize: "1.05rem",
                    fontWeight: "600",
                  }}
                >
                  3. Obtén resultados
                </h4>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.95rem",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  Visualiza tu análisis emocional de forma clara e instantánea
                </p>
              </div>
            </div>
          </div>

          <div
            className="auth-card"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="auth-header">
              <h2>Iniciar Sesión</h2>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button">
                Iniciar Sesión
              </button>

              <div className="divider">o</div>

              <button
                type="button"
                className="google-button"
                onClick={handleGoogleLogin}
              >
                <FaGoogle className="google-icon" />
                Iniciar sesión con Google
              </button>
            </form>

            <p className="auth-link">
              ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
            </p>
          </div>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>

      {/* ---------- Modal de Selección de Rol ---------- */}
      <ModalSeleccionRol
        isOpen={showRoleModal}
        onClose={handleCloseRoleModal}
      />
    </>
  );
};

export default Login;
