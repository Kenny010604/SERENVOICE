// src/Pages/VerificarEmail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import api from "../../config/api";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import NavbarPublic from "../../components/Publico/NavbarPublic";
import { ThemeContext } from "../../context/themeContextDef";
import PaisajeClaro from "../../assets/PaisajeClaro.svg";
import PaisajeOscuro from "../../assets/PaisajeOscuro.svg";
import "../../global.css";

const VerificarEmail = () => {
  const { isDark } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true; // Evitar actualizaciones si el componente se desmonta
    let verificacionEnProceso = false; // Prevenir llamadas duplicadas

    const verificarEmail = async () => {
      // Prevenir ejecuciones duplicadas (React StrictMode)
      if (verificacionEnProceso) return;
      verificacionEnProceso = true;

      const token = searchParams.get("token");

      if (!token) {
        if (isMounted) {
          setStatus("error");
          setMessage("Token de verificación no encontrado");
        }
        return;
      }

      try {
        const response = await apiClient.get(`${api.endpoints.auth.verifyEmail}/${token}`);
        
        if (!isMounted) return; // No actualizar si el componente se desmontó
        
        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message || "Email verificado exitosamente");
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            if (isMounted) {
              navigate("/login");
            }
          }, 3000);
        } else {
          setStatus("error");
          setMessage(response.data.error || "Error al verificar email");
        }
      } catch (error) {
        if (!isMounted) return; // No actualizar si el componente se desmontó
        
        // Si el error es "Email ya verificado", mostrarlo como éxito
        const errorMsg = error.response?.data?.error || "Error al verificar email";
        if (errorMsg.includes("ya verificado")) {
          setStatus("success");
          setMessage("Tu email ya ha sido verificado");
          setTimeout(() => {
            if (isMounted) {
              navigate("/login");
            }
          }, 3000);
        } else {
          setStatus("error");
          setMessage(errorMsg);
        }
      }
    };

    verificarEmail();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate]);

  return (
    <>
      <NavbarPublic />
      <main
        className="auth-container"
        style={{
          paddingTop: "2rem",
          paddingBottom: "4rem",
          backgroundImage: `url(${isDark ? PaisajeOscuro : PaisajeClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "auto",
        }}
      >
      <div className="auth-card verification-card">
        <div className="verification-content">
          {status === "loading" && (
            <>
              <FaSpinner className="verification-icon spinning" />
              <h2>Verificando tu email...</h2>
              <p>Por favor espera un momento</p>
            </>
          )}

          {status === "success" && (
            <>
              <FaCheckCircle className="verification-icon success" />
              <h2>¡Email Verificado!</h2>
              <p>{message}</p>
              <p className="redirect-message">
                Redirigiendo al inicio de sesión...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <FaTimesCircle className="verification-icon error" />
              <h2>Error en la verificación</h2>
              <p>{message}</p>
              <button
                className="auth-button"
                onClick={() => navigate("/login")}
              >
                Ir al inicio de sesión
              </button>
            </>
          )}
        </div>
      </div>
    </main>
    <footer className="footer">
      © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
    </footer>
    </>
  );
};

export default VerificarEmail;
