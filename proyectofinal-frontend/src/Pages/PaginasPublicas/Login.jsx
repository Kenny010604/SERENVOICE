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
import logo from "../../assets/Logo.svg";
import "../../global.css";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import heroImg from "../../assets/ImagenCalma.jpg";
import ModalSeleccionRol from "../../components/ModalSeleccionRol";
import  authService  from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 handleSubmit completamente actualizado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // authService ya maneja la estructura correcta
      const data = await authService.login(email, password);

      // Extraer rol del backend
      const userRoles = [data.user.rol]; // Si tu backend envía solo un rol

      // Si hay más de un rol → mostrar modal
      if (userRoles.length > 1) {
        setAvailableRoles(userRoles);
        setShowRoleModal(true);
      } else {
        const role = data.user.rol.toLowerCase();

if (role === "admin") {
  navigate("/admin/dashboard");
} else {
  navigate("/dashboard");
}

      }
    } catch (err) {
      console.error("Error en login:", err);
      setError(
        err.message || "Error al iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/oauth2/authorization/google";
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
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
              <img src={logo} alt="SerenVoice Logo" style={{ width: 90, height: 90 }} />
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
                Graba unos segundos de tu voz para ver cómo funciona nuestro análisis emocional.
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
          </div>

          {/* Right login form */}
          <div
            className="auth-card"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="auth-header">
              <h2>Iniciar Sesión</h2>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: "1rem" }}>
                {error}
              </div>
            )}

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
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contrasena"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={loading}
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

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>

              <div className="divider">o</div>

              <button
                type="button"
                className="google-button"
                onClick={handleGoogleLogin}
                disabled={loading}
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

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>

      <ModalSeleccionRol
        isOpen={showRoleModal}
        onClose={handleCloseRoleModal}
        roles={availableRoles}
      />
    </>
  );
};

export default Login;
