import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./global.css";
import Inicio from "./PaginasPublicas/Inicio.jsx";
import Login from "./PaginasPublicas/Login.jsx";
import Registro from "./PaginasPublicas/Registro.jsx";
import Sobre from "./PaginasPublicas/Sobre.jsx";
import Contacto from "./PaginasPublicas/Contacto.jsx";
import ProbarVoz from "./PaginasPublicas/ProbarVoz.jsx";
import Dashboard from "./PaginasUsuarios/Dashboard.jsx";
import ActualizarPerfil from "./PaginasUsuarios/ActualizarPerfil.jsx";
import DashboardAdmin from "./PaginasAdministradores/DashboardAdmin.jsx";
import Configuracion from "./PaginasUsuarios/Configuracion.jsx";
import ConfiguracionAdmin from "./PaginasAdministradores/ConfiguracionAdmin.jsx";
import Usuarios from "./PaginasAdministradores/Usuarios.jsx";
import Alertas from "./PaginasAdministradores/Alertas.jsx";
import Reportes from "./PaginasAdministradores/Reportes.jsx";
import BaseDatos from "./PaginasAdministradores/BaseDatos.jsx";
import Historial from "./PaginasUsuarios/Historial.jsx";
import Recomendaciones from "./PaginasUsuarios/Recomendaciones.jsx";
import ReportesUsuario from "./PaginasUsuarios/ReportesUsuario.jsx";
import Perfil from "./PaginasUsuarios/Perfil.jsx";
import PageWithTitle from "./utils/PageWithTitle";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/Inicio"
              element={
                <PageWithTitle title="Inicio">
                  <Inicio />
                </PageWithTitle>
              }
            />
            <Route
              path="/login"
              element={
                <PageWithTitle title="Iniciar Sesión">
                  <Login />
                </PageWithTitle>
              }
            />
            <Route
              path="/registro"
              element={
                <PageWithTitle title="Registro">
                  <Registro />
                </PageWithTitle>
              }
            />
            <Route
              path="/sobre"
              element={
                <PageWithTitle title="Sobre">
                  <Sobre />
                </PageWithTitle>
              }
            />
            <Route
              path="/contacto"
              element={
                <PageWithTitle title="Contacto">
                  <Contacto />
                </PageWithTitle>
              }
            />
            <Route
              path="/probar"
              element={
                <PageWithTitle title="Probar Voz">
                  <ProbarVoz />
                </PageWithTitle>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole={"USUARIO"}>
                  <PageWithTitle title="Dashboard">
                    <Dashboard />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/actualizar-perfil"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Actualizar Perfil">
                    <ActualizarPerfil />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Perfil">
                    <Perfil />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/historial"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Historial">
                    <Historial />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recomendaciones"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Recomendaciones">
                    <Recomendaciones />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes-personales"
              element={
                <ProtectedRoute>
                  <PageWithTitle title="Reportes">
                    <ReportesUsuario />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole={"ADMINISTRADOR"}>
                  <PageWithTitle title="Panel de Administración">
                    <DashboardAdmin />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute requiredRole={"ADMINISTRADOR"}>
                  <PageWithTitle title="Gestión de Usuarios">
                    <Usuarios />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reportes"
              element={
                <ProtectedRoute requiredRole={"ADMINISTRADOR"}>
                  <PageWithTitle title="Reportes">
                    <Reportes />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/alertas"
              element={
                <ProtectedRoute requiredRole={"ADMINISTRADOR"}>
                  <PageWithTitle title="Alertas">
                    <Alertas />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/base-datos"
              element={
                <ProtectedRoute requiredRole={"ADMINISTRADOR"}>
                  <PageWithTitle title="Base de Datos">
                    <BaseDatos />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute requiredRole={"USUARIO"}>
                  <PageWithTitle title="Configuración">
                    <Configuracion />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/configuracion"
              element={
                <ProtectedRoute requiredRole={"ADMINISTRADOR"}>
                  <PageWithTitle title="Configuración Admin">
                    <ConfiguracionAdmin />
                  </PageWithTitle>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/Inicio" />} />{" "}
            {/* Redirige rutas no encontradas al inicio */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
