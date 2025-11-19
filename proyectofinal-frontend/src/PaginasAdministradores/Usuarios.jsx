import React, { useState, useEffect, useRef } from "react";
import NavbarAdministrador from "../components/NavbarAdministrador";
import "../global.css";
import { FaUserEdit, FaUserShield } from "react-icons/fa";

const sampleUsers = [
  {
    id: 1,
    nombre: "Ana",
    apellido: "Gómez",
    email: "ana@example.com",
    roles: ["USUARIO"],
    ultimoAcceso: "2025-11-14",
  },
  {
    id: 2,
    nombre: "Luis",
    apellido: "Martínez",
    email: "luis@example.com",
    roles: ["USUARIO", "SUPERVISOR"],
    ultimoAcceso: "2025-11-15",
  },
  {
    id: 3,
    nombre: "María",
    apellido: "Pérez",
    email: "maria@example.com",
    roles: ["USUARIO"],
    ultimoAcceso: "2025-11-12",
  },
];

const Usuarios = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [msg, setMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));
    if (cardRef.current.classList.contains("reveal"))
      cardRef.current.classList.add("reveal-visible");
  }, []);

  const assignRole = (id, role) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, roles: Array.from(new Set([...u.roles, role])) }
          : u
      )
    );
    setMsg(`Rol ${role} asignado (simulado)`);
  };

  return (
    <>
      <NavbarAdministrador />
      <main className="container" style={{ paddingBottom: "100px" }}>
        <div
          ref={cardRef}
          className="card reveal"
          data-revealdelay="60"
          style={{ maxWidth: "1200px" }}
        >
          <h2>Gestión de Usuarios</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Lista de usuarios y acciones administrativas (simulado).
          </p>

          {msg && (
            <div className="success-message" style={{ marginTop: "0.75rem" }}>
              {msg}
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Roles</th>
                  <th>Último acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <td>
                      {u.nombre} {u.apellido}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.roles.join(", ")}</td>
                    <td>{u.ultimoAcceso}</td>
                    <td>
                      <button
                        onClick={() => assignRole(u.id, "SUPERVISOR")}
                        style={{ marginRight: "0.5rem" }}
                      >
                        <FaUserShield /> Asignar Supervisor
                      </button>
                      <button onClick={() => setMsg("Abrir perfil (simulado)")}>
                        <FaUserEdit /> Ver/Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default Usuarios;
