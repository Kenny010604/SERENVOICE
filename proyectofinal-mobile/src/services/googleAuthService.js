// src/services/googleAuthService.js
// Servicio de autenticación con Google usando OAuth nativo

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Necesario para que el navegador se cierre automáticamente después del login
WebBrowser.maybeCompleteAuthSession();

// Obtener las credenciales de OAuth desde las variables de entorno
const getGoogleClientIds = () => {
  // En Expo, las variables con prefijo EXPO_PUBLIC_ están en expoConfig.extra
  const webClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
                      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
                      '11587771642-015ng6us09ecc6d38lgsc4qhq8d4bjub.apps.googleusercontent.com';
                      
  const androidClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
                          process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
                          '11587771642-02imk19ovqt0dk1lobhbdvjlo3pc2mfv.apps.googleusercontent.com';
                          
  const iosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
                      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
                      '11587771642-02imk19ovqt0dk1lobhbdvjlo3pc2mfv.apps.googleusercontent.com';
  
  console.log('[GoogleAuth] Client IDs configurados:', {
    webClientId: webClientId ? 'Configurado ✓' : 'NO configurado ✗',
    androidClientId: androidClientId ? 'Configurado ✓' : 'NO configurado ✗',
    iosClientId: iosClientId ? 'Configurado ✓' : 'NO configurado ✗',
    platform: Platform.OS
  });
  
  return { webClientId, androidClientId, iosClientId };
};

/**
 * Hook personalizado para autenticación con Google
 * Soporta Android, iOS y Web
 */
export const useGoogleAuth = () => {
  const { webClientId, androidClientId, iosClientId } = getGoogleClientIds();
  
  // Configuración de OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Web Client ID (mismo que tu frontend web)
    webClientId,
    
    // Android Client ID
    androidClientId,
    
    // iOS Client ID
    iosClientId,
    
    // Scopes que necesitamos
    scopes: ['profile', 'email'],
    
    // Redirect URI
    redirectUri: makeRedirectUri({
      scheme: 'com.serenvoice.app',
      path: 'redirect',
    }),
  });

  /**
   * Iniciar flujo de autenticación con Google
   * @returns {Promise<void>} El resultado se obtiene del response en el useEffect
   */
  const signInWithGoogle = async () => {
    try {
      console.log('[GoogleAuth] Iniciando promptAsync...');
      await promptAsync();
      // El resultado se manejará automáticamente cuando Google redireccione
      // a través del objeto 'response' que observa el componente
    } catch (error) {
      console.error('[GoogleAuth] Error en promptAsync:', error);
      throw error;
    }
  };

  return {
    request,
    response,
    signInWithGoogle,
  };
};

export default { useGoogleAuth };
