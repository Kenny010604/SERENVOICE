import React, { useState, useEffect, useRef } from "react";
import NavbarUsuario from "../../components/NavbarUsuario";
import "../../global.css";
import Spinner from "../../components/Spinner";

// Nota: API temporal removida mientras no hay backend configurado.

const Configuracion = () => {
  const [form, setForm] = useState({ nombres: "", correo: "" });
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    // Validación básica
    if (!form.nombres.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!form.correo.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Ingrese un correo válido");
      return;
    }

    setLoading(true);
    // Simulación removida: completar inmediatamente (reemplazar por llamada real al backend cuando esté disponible)
    setMsg("Guardado correctamente (simulado)");
    setLoading(false);
  };

  return (
    <>
      <NavbarUsuario />
      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div
          ref={cardRef}
          className="card reveal"
          data-revealdelay="50"
          style={{ maxWidth: "800px", width: "100%" }}
        >
          {loading && (
            <Spinner overlay={true} message="Guardando configuración..." />
          )}
          <h2>Configuración de la cuenta</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Actualiza tu nombre y correo. Más opciones vendrán pronto.
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <div className="form-group reveal" data-revealdelay="120">
              <label>Nombres</label>
              <input
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
              />
            </div>
            <div className="form-group reveal" data-revealdelay="160">
              <label>Correo</label>
              <input
                name="correo"
                value={form.correo}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              style={{ marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            {msg && (
              <p style={{ marginTop: "0.5rem", color: "var(--color-success)" }}>
                {msg}
              </p>
            )}
            {error && (
              <p style={{ marginTop: "0.5rem", color: "var(--color-danger)" }}>
                {error}
              </p>
            )}
          </form>
        </div>
      </main>
    </>
  );
};

export default Configuracion;
