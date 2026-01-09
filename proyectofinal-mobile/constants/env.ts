import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ============================================
// VARIABLES DE ENTORNO DESDE .env (raíz del proyecto)
// ============================================

// Obtener configuración extra de Expo (desde app.config.js)
const expoExtra = Constants.expoConfig?.extra;

/**
 * Obtiene la URL de la API según el entorno:
 * - En web: usa localhost (mismo equipo)
 * - En dispositivo físico: usa la IP local de la red
 * 
 * La IP para dispositivos físicos se puede sobrescribir con EXPO_PUBLIC_API_URL en .env
 */
const getApiUrl = (): string => {
  // Si hay una o varias URLs configuradas en el .env, usarla(s)
  // Soportamos una lista separada por comas, por ejemplo:
  // EXPO_PUBLIC_API_URL=http://localhost:5000,http://192.168.1.33:5000,https://xxxx.ngrok.io
  const envUrlRaw = expoExtra?.apiUrl || '';
  const candidates: string[] = envUrlRaw
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean) as string[];

  // isDevice puede ser undefined en algunas versiones de Expo
  // Si es undefined o true, asumimos que es un dispositivo físico
  const isEmulator = Constants.isDevice === false;

  const pickCandidate = (): string => {
    // Web: prefer localhost, otherwise any candidate or fallback
    if (Platform.OS === 'web') {
      const localhost = candidates.find((c: string) => /localhost|127\.0\.0\.1/.test(c));
      if (localhost) return localhost;
      if (candidates.length) return candidates[0];
      return 'http://localhost:5000';
    }

    // Android emulator ONLY (isDevice === false explicitly)
    if (Platform.OS === 'android' && isEmulator) {
      // If a candidate explicitly contains 10.0.2.2, prefer it
      const emulatorAlias = candidates.find((c: string) => c.includes('10.0.2.2'));
      if (emulatorAlias) return emulatorAlias;

      // If candidate mentions localhost, replace it with emulator alias
      const localhostCandidate = candidates.find((c: string) => /localhost|127\.0\.0\.1/.test(c));
      if (localhostCandidate) return localhostCandidate.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');

      // Prefer local network IP like 192.168.x.x if present
      const localIp = candidates.find((c: string) => /192\.168\./.test(c));
      if (localIp) return localIp;

      // Fallback to first candidate or emulator alias
      if (candidates.length) return candidates[0];
      return 'http://10.0.2.2:5000';
    }

    // Android physical device (isDevice is true OR undefined)
    if (Platform.OS === 'android') {
      // Physical device: prefer LAN IP
      const localIp = candidates.find((c: string) => /192\.168\./.test(c));
      if (localIp) return localIp;
      // Fallback to first non-localhost candidate
      const nonLocalhost = candidates.find((c: string) => !/localhost|127\.0\.0\.1|10\.0\.2\.2/.test(c));
      if (nonLocalhost) return nonLocalhost;
      if (candidates.length) return candidates[0];
      return 'http://192.168.54.14:5000'; // Hardcoded fallback for your network
    }

    // iOS simulator maps localhost to host machine; if running on real device, prefer LAN IP
    if (Platform.OS === 'ios') {
      if (isEmulator) {
        // Simulator: localhost works
        const localhost = candidates.find((c: string) => /localhost|127\.0\.0\.1/.test(c));
        if (localhost) return localhost;
      }
      // Device or no localhost candidate: prefer LAN IP
      const localIp = candidates.find((c: string) => /192\.168\./.test(c));
      if (localIp) return localIp;
      if (candidates.length) return candidates[0];
      return 'http://localhost:5000';
    }

    // Other platforms / physical devices: prefer LAN IP, then first candidate
    const lan = candidates.find((c: string) => /192\.168\./.test(c));
    if (lan) return lan;
    if (candidates.length) return candidates[0];
    return 'http://localhost:5000';
  };

  return pickCandidate();
};

// API URL - detecta automáticamente según plataforma
export const API_URL = getApiUrl();

// Google Client ID desde .env
export const GOOGLE_CLIENT_ID = expoExtra?.googleClientId || '';

// Environment (development/production)
export const ENVIRONMENT = expoExtra?.environment || 'development';

// Debug: mostrar configuración en desarrollo
if (__DEV__) {
  console.log('🔧 Environment Config:', {
    API_URL,
    ENVIRONMENT,
    Platform: Platform.OS,
    isDevice: Constants.isDevice,
    isEmulator: Constants.isDevice === false,
  });
}

