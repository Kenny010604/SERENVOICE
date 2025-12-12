import { useState, useContext } from "react";
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
import ModalSeleccionRol from "../../components/Publico/ModalSeleccionRol";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import authService from "../../services/authService";
import { ThemeContext } from "../../context/themeContextDef";
import PaisajeClaro from "../../assets/PaisajeClaro.svg";
import PaisajeOscuro from "../../assets/PaisajeOscuro.svg";

const Login = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
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

      // Extraer roles del backend (ahora es array)
      const userRoles = data.user.roles || ['usuario'];

      // Si hay más de un rol → mostrar modal
      if (userRoles.length > 1) {
        setAvailableRoles(userRoles);
        setShowRoleModal(true);
      } else {
        // Usar el primer rol
        const role = userRoles[0].toLowerCase();

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Error en login:", err);
      
      // Verificar si el error es por email no verificado
      if (err.message && err.message.includes("verifica tu correo")) {
        setError(
          "Tu cuenta no está verificada. Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación."
        );
      } else {
        setError(
          err.message || "Error al iniciar sesión. Verifica tus credenciales."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
  };

  return (
    <>
      <NavbarPublic />
      <main
        className="auth-container login-bg"
        style={{
          paddingTop: "2rem",
          paddingBottom: "4rem",
          backgroundImage: `url(${isDark ? PaisajeOscuro : PaisajeClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div className="login-grid">
          {/* Left hero column */}
          <div className="auth-card login-hero centered">
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
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.95rem 2.5rem",
                    fontSize: "1.05rem",
                  }}
                >
                  <FaMicrophone /> Probar ahora
                </button>
              </div>
            </div>

            <div className="how-grid">
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

          <div className="auth-card auth-form-card">
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
                    placeholder="Contraseña"
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

              <div style={{ textAlign: "center", margin: "0.75rem 0" }}>
                <Link 
                  to="/olvide-mi-contrasena" 
                  style={{
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    transition: "color 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "var(--color-primary-hover)"}
                  onMouseLeave={(e) => e.target.style.color = "var(--color-primary)"}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="divider">o</div>

              <GoogleLoginButton />
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
