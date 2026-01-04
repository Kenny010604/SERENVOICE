// src/services/googleAuthWebService.js
// Servicio de autenticación con Google específico para WEB
// Usa el SDK de Google Identity Services (GSI) en lugar de expo-auth-session

/**
 * Cargar el SDK de Google Identity Services
 * @returns {Promise<void>}
 */
export const loadGoogleSDK = () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.google) {
      resolve();
      return;
    }

    // Crear script para cargar Google GSI
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('[GoogleWebAuth] SDK cargado correctamente');
      resolve();
    };
    script.onerror = (error) => {
      console.error('[GoogleWebAuth] Error cargando SDK:', error);
      reject(error);
    };
    document.head.appendChild(script);
  });
};

/**
 * Inicializar Google Sign-In para Web
 * @param {Object} config - Configuración
 * @param {Function} config.onSuccess - Callback cuando el login es exitoso
 * @param {Function} config.onError - Callback cuando hay error
 */
export const initGoogleSignIn = async ({ onSuccess, onError }) => {
  try {
    await loadGoogleSDK();

    const clientId = '11587771642-015ng6us09ecc6d38lgsc4qhq8d4bjub.apps.googleusercontent.com';

    console.log('[GoogleWebAuth] Inicializando Google Sign-In...');

    // Inicializar Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        console.log('[GoogleWebAuth] Respuesta de Google recibida');
        try {
          // El response.credential contiene el JWT de Google
          // Decodificar el JWT para obtener la información del usuario
          const userInfo = parseJwt(response.credential);
          
          console.log('[GoogleWebAuth] Usuario autenticado:', {
            email: userInfo.email,
            name: userInfo.name,
          });

          // Llamar al callback de éxito con el credential token
          onSuccess({
            credential: response.credential,
            user: {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name,
              given_name: userInfo.given_name,
              family_name: userInfo.family_name,
              picture: userInfo.picture,
              verified_email: userInfo.email_verified,
            },
          });
        } catch (error) {
          console.error('[GoogleWebAuth] Error procesando respuesta:', error);
          onError(error);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    console.log('[GoogleWebAuth] Google Sign-In inicializado correctamente');
  } catch (error) {
    console.error('[GoogleWebAuth] Error inicializando:', error);
    onError(error);
  }
};

/**
 * Mostrar el botón de Google Sign-In
 * @param {string} elementId - ID del elemento donde se renderizará el botón
 */
export const renderGoogleButton = (elementId) => {
  if (!window.google || !window.google.accounts) {
    console.error('[GoogleWebAuth] SDK no cargado o no disponible');
    return false;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error('[GoogleWebAuth] Elemento no encontrado:', elementId);
    return false;
  }

  console.log('[GoogleWebAuth] Renderizando botón de Google en:', elementId);

  try {
    // Limpiar el contenido previo
    element.innerHTML = '';
    
    window.google.accounts.id.renderButton(
      element,
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: element.offsetWidth || 300,
      }
    );
    
    console.log('[GoogleWebAuth] Botón renderizado exitosamente');
    return true;
  } catch (error) {
    console.error('[GoogleWebAuth] Error renderizando botón:', error);
    return false;
  }
};

/**
 * Mostrar el prompt de One Tap
 */
export const showOneTap = () => {
  if (!window.google) {
    console.error('[GoogleWebAuth] SDK no cargado');
    return;
  }

  window.google.accounts.id.prompt();
};

/**
 * Decodificar JWT de Google
 * @param {string} token - JWT token
 * @returns {Object} Payload decodificado
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[GoogleWebAuth] Error decodificando JWT:', error);
    throw error;
  }
};

export default {
  loadGoogleSDK,
  initGoogleSignIn,
  renderGoogleButton,
  showOneTap,
};
