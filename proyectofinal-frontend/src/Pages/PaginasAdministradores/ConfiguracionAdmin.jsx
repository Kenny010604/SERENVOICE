import React, { useState, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";
import "../../global.css";

const ConfiguracionAdmin = () => {
  const { isDark } = useContext(ThemeContext);
  const [msg, setMsg] = useState("");

  const handleSave = () => {
    setMsg("Guardado (simulado)");
  };

  return (
    <>
      <NavbarAdministrador />
      <main 
        className="container" 
        style={{ 
          paddingBottom: "100px",
          backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="card" style={{ maxWidth: "1000px", width: "100%" }}>
          <h2>Configuración del Administrador</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Opciones globales del sistema (simulado).
          </p>

          <div style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label>Notificaciones globales</label>
              <select>
                <option>Activadas</option>
                <option>Desactivadas</option>
              </select>
            </div>

            <button onClick={handleSave} style={{ marginTop: "1rem" }}>
              Guardar
            </button>
            {msg && <p style={{ marginTop: "0.5rem" }}>{msg}</p>}
          </div>
        </div>
      </main>
    </>
  );
};

export default ConfiguracionAdmin;