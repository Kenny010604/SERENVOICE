import React, { useState } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import "../../global.css";

const ConfiguracionAdmin = () => {
  const [msg, setMsg] = useState("");

  const handleSave = () => {
    // TODO: guardar configuraciones
    setMsg("Guardado (simulado)");
  };

  return (
    <>
      <NavbarAdministrador />
      <main className="container" style={{ paddingBottom: "100px" }}>
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
