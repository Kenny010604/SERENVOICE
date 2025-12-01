import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./global.css";

// Páginas públicas
import Inicio from "./Pages/PaginasPublicas/Inicio.jsx";
import Login from "./Pages/PaginasPublicas/Login.jsx";
import Registro from "./Pages/PaginasPublicas/Registro.jsx";
import Sobre from "./Pages/PaginasPublicas/Sobre.jsx";
import Contacto from "./Pages/PaginasPublicas/Contacto.jsx";
import ProbarVoz from "./Pages/PaginasPublicas/ProbarVoz.jsx";

// Páginas de usuarios
import Dashboard from "./Pages/PaginasUsuarios/Dashboard.jsx";
import ActualizarPerfil from "./Pages/PaginasUsuarios/ActualizarPerfil.jsx";
import Configuracion from "./Pages/PaginasUsuarios/Configuracion.jsx";
import Historial from "./Pages/PaginasUsuarios/Historial.jsx";
import Recomendaciones from "./Pages/PaginasUsuarios/Recomendaciones.jsx";
import ReportesUsuario from "./Pages/PaginasUsuarios/ReportesUsuario.jsx";
import Perfil from "./Pages/PaginasUsuarios/Perfil.jsx";

// Páginas de administradores
import DashboardAdmin from "./Pages/PaginasAdministradores/DashboardAdmin.jsx";
import ConfiguracionAdmin from "./Pages/PaginasAdministradores/ConfiguracionAdmin.jsx";
import Usuarios from "./Pages/PaginasAdministradores/Usuarios.jsx";
import Alertas from "./Pages/PaginasAdministradores/Alertas.jsx";
import Reportes from "./Pages/PaginasAdministradores/Reportes.jsx";

// Contextos y utilidades
import PageWithTitle from "./utils/PageWithTitle.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Páginas públicas */}
            <Route path="/Inicio" element={<PageWithTitle title="Inicio"><Inicio /></PageWithTitle>} />
            <Route path="/login" element={<PageWithTitle title="Iniciar Sesión"><Login /></PageWithTitle>} />
            <Route path="/registro" element={<PageWithTitle title="Registro"><Registro /></PageWithTitle>} />
            <Route path="/sobre" element={<PageWithTitle title="Sobre"><Sobre /></PageWithTitle>} />
            <Route path="/contacto" element={<PageWithTitle title="Contacto"><Contacto /></PageWithTitle>} />
            <Route path="/probar" element={<PageWithTitle title="Probar Voz"><ProbarVoz /></PageWithTitle>} />

            {/* Páginas de usuarios */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="usuario">
                  <PageWithTitle title="Dashboard"><Dashboard /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/actualizar-perfil"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Actualizar Perfil"><ActualizarPerfil /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Perfil"><Perfil /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/historial"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Historial"><Historial /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/recomendaciones"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Recomendaciones"><Recomendaciones /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reportes-personales"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Reportes"><ReportesUsuario /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracion"
              element={
                <ProtectedRoute requiredRole="usuario">
                  <PageWithTitle title="Configuración"><Configuracion /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            {/* Páginas de administradores */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageWithTitle title="Panel de Administración"><DashboardAdmin /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageWithTitle title="Gestión de Usuarios"><Usuarios /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reportes"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageWithTitle title="Reportes"><Reportes /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/alertas"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageWithTitle title="Alertas"><Alertas /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/configuracion"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageWithTitle title="Configuración Admin"><ConfiguracionAdmin /></PageWithTitle>
                </ProtectedRoute>
              }
            />

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/Inicio" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
