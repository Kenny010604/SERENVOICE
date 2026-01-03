// src/utils/secureStorage.js
// Almacenamiento seguro de tokens en memoria (no localStorage)
// Esto previene ataques XSS que podrían robar tokens de localStorage

/**
 * SecureStorage - Almacena tokens sensibles en memoria en lugar de localStorage
 * 
 * Ventajas:
 * - Los tokens no persisten en el navegador después de cerrar la pestaña
 * - No son accesibles via XSS attacks que lean localStorage
 * - Se combinan con httpOnly cookies para refresh tokens (manejado por backend)
 * 
 * Limitaciones:
 * - El usuario debe re-autenticarse al cerrar el navegador
 * - Se pierde el token al refrescar la página (usar refresh token endpoint)
 */

// Closure para mantener tokens en memoria privada
const createSecureStorage = () => {
  // Almacenamiento privado en closure (no accesible desde window/global)
  let _accessToken = null;
  let _refreshToken = null;
  let _tokenExpiry = null;
  
  // Listeners para cambios de token
  const _listeners = new Set();

  // Notificar a todos los listeners cuando cambia el token
  const notifyListeners = () => {
    _listeners.forEach(listener => {
      try {
        listener(_accessToken);
      } catch (e) {
        console.warn('SecureStorage listener error:', e);
      }
    });
  };

  return {
    /**
     * Almacena el access token de forma segura
     * @param {string|null} token - JWT access token
     * @param {number} [expiresIn] - Tiempo en segundos hasta expiración
     */
    setAccessToken(token, expiresIn = null) {
      _accessToken = token;
      if (token && expiresIn) {
        _tokenExpiry = Date.now() + (expiresIn * 1000);
      } else if (!token) {
        _tokenExpiry = null;
      }
      notifyListeners();
    },

    /**
     * Obtiene el access token actual
     * @returns {string|null}
     */
    getAccessToken() {
      // Verificar si el token ha expirado
      if (_tokenExpiry && Date.now() > _tokenExpiry) {
        this.clearTokens();
        return null;
      }
      return _accessToken;
    },

    /**
     * Almacena el refresh token (si no se usa httpOnly cookie)
     * @param {string|null} token
     */
    setRefreshToken(token) {
      _refreshToken = token;
    },

    /**
     * Obtiene el refresh token
     * @returns {string|null}
     */
    getRefreshToken() {
      return _refreshToken;
    },

    /**
     * Verifica si hay un token válido
     * @returns {boolean}
     */
    hasValidToken() {
      const token = this.getAccessToken();
      return token !== null && token !== undefined && token !== '';
    },

    /**
     * Verifica si el token está próximo a expirar (dentro de 5 minutos)
     * @returns {boolean}
     */
    isTokenExpiringSoon() {
      if (!_tokenExpiry) return false;
      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() > (_tokenExpiry - fiveMinutes);
    },

    /**
     * Limpia todos los tokens
     */
    clearTokens() {
      _accessToken = null;
      _refreshToken = null;
      _tokenExpiry = null;
      notifyListeners();
    },

    /**
     * Registra un listener para cambios de token
     * @param {Function} listener
     * @returns {Function} Función para cancelar la suscripción
     */
    subscribe(listener) {
      _listeners.add(listener);
      return () => _listeners.delete(listener);
    },

    /**
     * Obtiene información del token (sin datos sensibles)
     * @returns {Object}
     */
    getTokenInfo() {
      return {
        hasToken: !!_accessToken,
        hasRefreshToken: !!_refreshToken,
        expiresAt: _tokenExpiry ? new Date(_tokenExpiry).toISOString() : null,
        isExpiringSoon: this.isTokenExpiringSoon()
      };
    }
  };
};

// Singleton instance
const secureStorage = createSecureStorage();

// Prevenir modificaciones al objeto exportado
Object.freeze(secureStorage);

export default secureStorage;

// También exportar para migración gradual desde localStorage
export const migrateFromLocalStorage = () => {
  try {
    const oldToken = localStorage.getItem('token');
    if (oldToken) {
      secureStorage.setAccessToken(oldToken);
      // Opcional: limpiar después de migrar
      // localStorage.removeItem('token');
    }
    return true;
  } catch (e) {
    console.warn('Error migrating token from localStorage:', e);
    return false;
  }
};
