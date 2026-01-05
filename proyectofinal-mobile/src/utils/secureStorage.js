// src/utils/secureStorage.js
// Almacenamiento seguro para React Native usando expo-secure-store
// Con fallback a AsyncStorage para web

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'serenvoice_access_token',
  REFRESH_TOKEN: 'serenvoice_refresh_token',
  USER: 'serenvoice_user',
  SESSION_ID: 'serenvoice_session_id',
};

// Helper para detectar si estamos en web
const isWeb = Platform.OS === 'web';

const secureStorage = {
  // Access Token
  async setAccessToken(token) {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
      } else {
        await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
      }
    } catch (error) {
      console.error('Error saving access token:', error);
    }
  },

  async getAccessToken() {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
      } else {
        return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Refresh Token
  async setRefreshToken(token) {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
      } else {
        await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
      }
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  },

  async getRefreshToken() {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
      } else {
        return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // User Data
  async setUser(user) {
    try {
      const userData = JSON.stringify(user);
      if (isWeb) {
        await AsyncStorage.setItem(KEYS.USER, userData);
      } else {
        await SecureStore.setItemAsync(KEYS.USER, userData);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  async getUser() {
    try {
      let userData;
      if (isWeb) {
        userData = await AsyncStorage.getItem(KEYS.USER);
      } else {
        userData = await SecureStore.getItemAsync(KEYS.USER);
      }
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async removeUser() {
    try {
      console.log('[secureStorage] Eliminando usuario... Platform:', Platform.OS);
      if (isWeb) {
        await AsyncStorage.removeItem(KEYS.USER);
        console.log('[secureStorage] Usuario eliminado (web)');
      } else {
        await SecureStore.deleteItemAsync(KEYS.USER);
        console.log('[secureStorage] Usuario eliminado (native)');
      }
    } catch (error) {
      console.error('[secureStorage] Error removing user:', error);
      throw error;
    }
  },

  // Session ID
  async setSessionId(sessionId) {
    try {
      // Asegurar que sessionId es un string
      const sessionIdStr = sessionId !== null && sessionId !== undefined 
        ? String(sessionId) 
        : '';
      if (isWeb) {
        await AsyncStorage.setItem(KEYS.SESSION_ID, sessionIdStr);
      } else {
        await SecureStore.setItemAsync(KEYS.SESSION_ID, sessionIdStr);
      }
    } catch (error) {
      console.error('Error saving session ID:', error);
    }
  },

  async getSessionId() {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(KEYS.SESSION_ID);
      } else {
        return await SecureStore.getItemAsync(KEYS.SESSION_ID);
      }
    } catch (error) {
      console.error('Error getting session ID:', error);
      return null;
    }
  },

  // Clear all tokens
  async clearTokens() {
    try {
      console.log('[secureStorage] Limpiando tokens... Platform:', Platform.OS);
      if (isWeb) {
        await AsyncStorage.multiRemove([
          KEYS.ACCESS_TOKEN,
          KEYS.REFRESH_TOKEN,
          KEYS.SESSION_ID,
        ]);
        console.log('[secureStorage] Tokens limpiados (web)');
      } else {
        await Promise.all([
          SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
          SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
          SecureStore.deleteItemAsync(KEYS.SESSION_ID),
        ]);
        console.log('[secureStorage] Tokens limpiados (native)');
      }
    } catch (error) {
      console.error('[secureStorage] Error clearing tokens:', error);
      throw error;
    }
  },

  // Clear all data
  async clearAll() {
    try {
      if (isWeb) {
        await AsyncStorage.multiRemove([
          KEYS.ACCESS_TOKEN,
          KEYS.REFRESH_TOKEN,
          KEYS.USER,
          KEYS.SESSION_ID,
        ]);
      } else {
        await Promise.all([
          SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
          SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
          SecureStore.deleteItemAsync(KEYS.USER),
          SecureStore.deleteItemAsync(KEYS.SESSION_ID),
        ]);
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },

  // Check if user is logged in
  async hasValidToken() {
    const token = await this.getAccessToken();
    return !!token;
  },
};

export default secureStorage;
