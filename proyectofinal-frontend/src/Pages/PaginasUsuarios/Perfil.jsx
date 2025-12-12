import React, { useEffect, useRef, useContext } from "react";
import NavbarUsuario from "../../components/NavbarUsuario";
import "../../global.css";
import { FaUser, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { ThemeContext } from "../../context/themeContextDef";
import FondoClaro from "../../assets/FondoClaro.svg";
import FondoOscuro from "../../assets/FondoOscuro.svg";

const Perfil = ({ user = {} }) => {
  const { isDark } = useContext(ThemeContext);
  const u = user.nombres
    ? user
    : {
        nombres: "Juan",
        apellidos: "García",
        correo: "juan.garcia@email.com",
        fechaRegistro: "2025-01-10",
      };
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);

  return (
    <>
      <NavbarUsuario userData={u} />
      <main className="container" style={{
        paddingTop: "2rem",
        paddingBottom: "4rem",
        backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed"
      }}>
        <div
          ref={cardRef}
          className="card reveal"
          data-revealdelay="60"
          style={{ maxWidth: "900px" }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <FaUser size={48} />
            <div>
              <h2>
                {u.nombres} {u.apellidos}
              </h2>
              <div style={{ color: "var(--color-text-secondary)" }}>
                {u.correo}
              </div>
              <div
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "0.25rem",
                }}
              >
                Miembro desde {u.fechaRegistro}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <h3>Información</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              <div>
                <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
                  Correo
                </p>
                <p style={{ margin: 0 }}>{u.correo}</p>
              </div>
              <div>
                <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
                  Registrado
                </p>
                <p style={{ margin: 0 }}>{u.fechaRegistro}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Perfil;
