import React, { useState, useEffect, useRef } from "react";
import NavbarAdministrador from "../../components/Administrador/NavbarAdministrador";
import apiClient from "../../services/apiClient";
import "../../global.css";
import { FaUserEdit, FaUserShield } from "react-icons/fa";

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  // =========================================
  // Cargar usuarios desde el backend
  // =========================================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/api/usuarios/lista");
        console.log("Respuesta completa:", res.data); // Para debug
        
        // La respuesta viene en res.data.data.usuarios
const usuariosData = res.data?.data || [];
console.log("Usuarios procesados:", usuariosData);
        
        setUsers(usuariosData);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setMsg("Error al cargar usuarios.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // =========================================
  // Animación reveal
  // =========================================
  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll(".reveal");
    els.forEach((el) => el.classList.add("reveal-visible"));

    if (cardRef.current.classList.contains("reveal")) {
      cardRef.current.classList.add("reveal-visible");
    }
  }, []);

  // =========================================
  // Simular asignación de rol
  // =========================================
  const assignRole = (id, role) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, roles: Array.from(new Set([...(u.roles || []), role])) }
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
            Lista de usuarios y acciones administrativas.
          </p>

          {msg && (
            <div className="success-message" style={{ marginTop: "0.75rem" }}>
              {msg}
            </div>
          )}

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p>No hay usuarios disponibles.</p>
          ) : (
            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <th style={{ padding: "0.75rem" }}>ID</th>
                    <th style={{ padding: "0.75rem" }}>Nombre</th>
                    <th style={{ padding: "0.75rem" }}>Correo</th>
                    <th style={{ padding: "0.75rem" }}>Género</th>
                    <th style={{ padding: "0.75rem" }}>Roles</th>
                    <th style={{ padding: "0.75rem" }}>Último acceso</th>
                    <th style={{ padding: "0.75rem" }}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <td style={{ padding: "0.75rem" }}>{u.id}</td>
                      <td style={{ padding: "0.75rem" }}>
                        {u.nombre} {u.apellido}
                      </td>
                      <td style={{ padding: "0.75rem" }}>{u.email}</td>
                      <td style={{ padding: "0.75rem" }}>{u.genero || "N/A"}</td>
                      <td style={{ padding: "0.75rem" }}>
                        {u.roles?.join(", ") || "Sin rol"}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {u.ultimoAcceso || "N/A"}
                      </td>

                      <td style={{ padding: "0.75rem" }}>
                        <button
                          onClick={() => assignRole(u.id, "SUPERVISOR")}
                          style={{ 
                            marginRight: "0.5rem",
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem"
                          }}
                        >
                          <FaUserShield /> Supervisor
                        </button>

                        <button
                          onClick={() => setMsg("Abrir perfil (simulado)")}
                          style={{ 
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem"
                          }}
                        >
                          <FaUserEdit /> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Usuarios;