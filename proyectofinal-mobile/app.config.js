// app.config.js
// Configuración dinámica de Expo que lee variables del .env de la raíz del proyecto
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar .env desde la raíz del proyecto (un nivel arriba)
config({ path: resolve(__dirname, '..', '.env') });

export default ({ config: expoConfig }) => {
  return {
    ...expoConfig,
    // Exponer variables de entorno a la app
    extra: {
      ...expoConfig.extra,
      // API Configuration
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
      
      // Google OAuth
      googleClientId: process.env.VITE_GOOGLE_CLIENT_ID || '',
      
      // Environment
      environment: process.env.FLASK_ENV || 'development',
    },
  };
};
