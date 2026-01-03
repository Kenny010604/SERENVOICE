import React, { useEffect, useState, useCallback, useRef } from "react";
import AuthContext from "./authContextDef";
import authService from "../services/authService";
import secureStorage from "../utils/secureStorage";
import secureLogger from "../utils/secureLogger";
import useSessionTimeout from "../hooks/useSessionTimeout";
import { useNavigate } from "react-router-dom";

// Constantes de configuración
const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_WARNING_MINUTES = 5;

export const AuthProvider = ({ children }) => {
  // Token en memoria segura, no en localStorage
  const [token, setToken] = useState(() => secureStorage.getAccessToken());
  const [roles, setRoles] = useState(() => {
    try {
      const r = localStorage.getItem("roles");
      return r ? JSON.parse(r) : [];
    } catch {
      return [];
    }
  });
  const [userRole, setUserRoleState] = useState(() => localStorage.getItem("userRole") || null);
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  // Referencia para navegación (se configura desde componentes que tienen acceso al router)
  const navigateRef = useRef(null);

  // Configurar navegación (llamar desde App.jsx)
  const setNavigate = useCallback((navFn) => {
    navigateRef.current = navFn;
  }, []);

  // Sincronizar token con secureStorage
  useEffect(() => {
    const unsubscribe = secureStorage.subscribe((newToken) => {
      setToken(newToken);
    });
    return unsubscribe;
  }, []);

  // Sincronizar token con secureStorage cuando cambia
  useEffect(() => {
    if (token) {
      secureStorage.setAccessToken(token);
      // También guardar en localStorage para compatibilidad durante migración
      // TODO: Remover esta línea cuando la migración esté completa
      localStorage.setItem("token", token);
    } else {
      secureStorage.clearTokens();
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (roles && roles.length) localStorage.setItem("roles", JSON.stringify(roles));
    else localStorage.removeItem("roles");
  }, [roles]);

  useEffect(() => {
    if (userRole) localStorage.setItem("userRole", userRole);
    else localStorage.removeItem("userRole");
  }, [userRole]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Función de logout centralizada
  const performLogout = useCallback(async (reason = 'manual') => {
    secureLogger.info('Logout iniciado', { reason });
    
    // Attempt remote logout (will also clear session on server)
    try {
      await authService.logout();
    } catch (e) {
      secureLogger.warn("AuthProvider.logout: authService.logout failed");
    }

    // Clear secure storage
    secureStorage.clearTokens();

    // Clear local state and storage
    setToken(null);
    setRoles([]);
    setUser(null);
    setUserRoleState(null);
    setShowTimeoutWarning(false);
    
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("session_id");

    // Navegar a login si es timeout
    if (reason === 'timeout' && navigateRef.current) {
      navigateRef.current('/login', { 
        state: { message: 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.' }
      });
    }
  }, []);

  // Handlers para timeout de sesión
  const handleSessionTimeout = useCallback(() => {
    setShowTimeoutWarning(false);
    performLogout('timeout');
  }, [performLogout]);

  const handleSessionWarning = useCallback((minutesLeft) => {
    secureLogger.debug('Advertencia de sesión', { minutesLeft });
    setShowTimeoutWarning(true);
  }, []);

  // Hook de timeout de sesión
  const { resetTimer } = useSessionTimeout({
    timeoutMinutes: SESSION_TIMEOUT_MINUTES,
    warningMinutes: SESSION_WARNING_MINUTES,
    onTimeout: handleSessionTimeout,
    onWarning: handleSessionWarning,
    enabled: !!token // Solo activo si hay sesión
  });

  // Extender sesión (llamar cuando el usuario interactúa o confirma la advertencia)
  const extendSession = useCallback(() => {
    setShowTimeoutWarning(false);
    resetTimer();
    secureLogger.debug('Sesión extendida por actividad del usuario');
  }, [resetTimer]);

  const login = useCallback(({ token: newToken, refreshToken, roles: newRoles = [], user: newUser = null }) => {
    // Guardar token en memoria segura
    secureStorage.setAccessToken(newToken);
    if (refreshToken) {
      secureStorage.setRefreshToken(refreshToken);
    }
    
    setToken(newToken);
    setRoles(newRoles);
    setUser(newUser);
    setShowTimeoutWarning(false);
    
    // Resetear timer de sesión
    resetTimer();
    
    secureLogger.info('Login exitoso');
  }, [resetTimer]);

  const logout = useCallback(async () => {
    await performLogout('manual');
  }, [performLogout]);

  const setUserRole = useCallback((role) => {
    setUserRoleState(role);
  }, []);

  // Verificar si la sesión es válida
  const isSessionValid = useCallback(() => {
    return secureStorage.hasValidToken();
  }, []);

  // Verificar si el token está por expirar
  const isTokenExpiringSoon = useCallback(() => {
    return secureStorage.isTokenExpiringSoon();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      token, 
      roles, 
      userRole, 
      user, 
      login, 
      logout, 
      setUserRole,
      setNavigate,
      // Nuevas propiedades de seguridad
      showTimeoutWarning,
      extendSession,
      isSessionValid,
      isTokenExpiringSoon
    }}>
      {children}
      
      {/* Modal de advertencia de timeout */}
      {showTimeoutWarning && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div 
            style={{
              backgroundColor: 'var(--color-panel, #fff)',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-main, #333)' }}>
              ⚠️ Sesión por expirar
            </h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary, #666)' }}>
              Tu sesión expirará en {SESSION_WARNING_MINUTES} minutos por inactividad.
              ¿Deseas continuar conectado?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={extendSession}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--color-primary, #4CAF50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Continuar
              </button>
              <button
                onClick={() => performLogout('manual')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-main, #333)',
                  border: '1px solid var(--color-border, #ddd)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

