import React, { useRef, useState, useEffect, useContext } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import { FaBell, FaCheck } from "react-icons/fa";
import { useAlertas } from "../../context/AlertasContext";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";

const Alertas = () => {
  const { isDark } = useContext(ThemeContext);
  const { alerts, assignToMe, resolveAlerta } = useAlertas();
  const [msg, setMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
  }, []);

  const handleAssign = (id) => {
    assignToMe(id);
    setMsg("Alerta asignada a ti");
  };

  const handleResolve = (id) => {
    resolveAlerta(id);
    setMsg("Alerta resuelta");
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
        <div ref={cardRef} className="card reveal" style={{ maxWidth: "1200px" }}>
          <h2>
            <FaBell /> Gestión de Alertas
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Lista de alertas críticas y acciones rápidas.
          </p>

          {msg && <div className="success-message">{msg}</div>}

          {alerts.length === 0 ? (
            <p>No hay alertas pendientes.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <strong>{a.usuario}</strong>
                    <div style={{ color: "var(--color-text-secondary)" }}>
                      {a.tipo} — {a.severidad} — {a.fecha}
                      <br />
                      {a.mensaje}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleAssign(a.id)}>Asignar a mí</button>
                    <button
                      onClick={() => handleResolve(a.id)}
                      style={{ background: "#4caf50", color: "#fff" }}
                    >
                      <FaCheck /> Resolver
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
};

export default Alertas;
