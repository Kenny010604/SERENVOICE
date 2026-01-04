# SerenVoice Mobile

Aplicación móvil de SerenVoice desarrollada con React Native y Expo. Permite a los usuarios analizar su voz para detectar emociones, ver su historial de análisis, acceder a juegos terapéuticos y gestionar su perfil.

## 📱 Características

- **Análisis de Voz**: Graba tu voz y obtén un análisis emocional detallado
- **Historial**: Revisa todos tus análisis anteriores
- **Juegos Terapéuticos**: Accede a juegos diseñados para el bienestar emocional
- **Recomendaciones**: Obtén recomendaciones personalizadas basadas en tus análisis
- **Perfil**: Gestiona tu información personal y preferencias
- **Tema Claro/Oscuro**: Cambia entre temas según tu preferencia

## 🛠️ Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (para pruebas en dispositivo físico)
- Android Studio / Xcode (para emuladores)

## 📦 Instalación

1. **Navega al directorio del proyecto móvil:**
   ```bash
   cd proyectofinal-mobile
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura la URL del API:**
   
   Edita `src/config/api.js` y cambia `DEV_API_URL` con la IP de tu máquina:
   ```javascript
   const DEV_API_URL = 'http://TU_IP_LOCAL:5000';
   ```
   
   > **Nota**: Para emulador Android usa `10.0.2.2`, para iOS usa `localhost`, para dispositivo físico usa la IP de tu computadora en la red local.

## 🚀 Ejecución

### Desarrollo
```bash
# Iniciar el servidor de desarrollo
npm start

# Iniciar con Android
npm run android

# Iniciar con iOS (solo macOS)
npm run ios

# Limpiar caché y reiniciar
npm run reset
```

### Con Expo Go
1. Ejecuta `npm start`
2. Escanea el código QR con la app Expo Go (Android) o la cámara (iOS)

## 📁 Estructura del Proyecto

```
proyectofinal-mobile/
├── App.js                      # Punto de entrada
├── app.json                    # Configuración de Expo
├── package.json                # Dependencias
├── babel.config.js             # Configuración de Babel
│
└── src/
    ├── config/
    │   └── api.js              # Endpoints del API
    │
    ├── context/
    │   ├── AuthContext.js      # Estado de autenticación
    │   └── ThemeContext.js     # Estado del tema
    │
    ├── navigation/
    │   ├── RootNavigator.js    # Navegador principal
    │   ├── AuthNavigator.js    # Navegador de autenticación
    │   └── MainNavigator.js    # Navegador con tabs
    │
    ├── screens/
    │   ├── SplashScreen.js     # Pantalla de carga
    │   ├── auth/               # Pantallas de autenticación
    │   │   ├── WelcomeScreen.js
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   └── ForgotPasswordScreen.js
    │   │
    │   └── main/               # Pantallas principales
    │       ├── DashboardScreen.js
    │       ├── AnalyzeVoiceScreen.js
    │       ├── AnalysisResultScreen.js
    │       ├── AnalysisDetailScreen.js
    │       ├── HistoryScreen.js
    │       ├── ProfileScreen.js
    │       ├── EditProfileScreen.js
    │       ├── GamesScreen.js
    │       ├── RecommendationsScreen.js
    │       └── SettingsScreen.js
    │
    ├── services/
    │   ├── apiClient.js        # Cliente Axios configurado
    │   ├── authService.js      # Autenticación
    │   ├── analisisService.js  # Análisis de voz
    │   ├── userService.js      # Usuarios
    │   ├── juegosService.js    # Juegos terapéuticos
    │   └── recomendacionesService.js
    │
    └── utils/
        ├── helpers.js          # Funciones auxiliares
        ├── secureStorage.js    # Almacenamiento seguro
        └── validators.js       # Validadores
```

## 🔐 Seguridad

- Los tokens JWT se almacenan de forma segura usando `expo-secure-store`
- Las contraseñas nunca se almacenan en el dispositivo
- Las llamadas al API usan HTTPS en producción
- Los tokens se refrescan automáticamente cuando expiran

## 📱 Pantallas

### Autenticación
- **Welcome**: Pantalla de bienvenida con opciones de login/registro
- **Login**: Inicio de sesión con email y contraseña
- **Register**: Registro de nuevo usuario en 2 pasos
- **ForgotPassword**: Recuperación de contraseña

### Principal
- **Dashboard**: Panel principal con resumen y acciones rápidas
- **AnalyzeVoice**: Grabación y análisis de voz
- **AnalysisResult**: Resultados del análisis
- **AnalysisDetail**: Detalle de un análisis específico
- **History**: Historial de análisis
- **Profile**: Perfil del usuario
- **EditProfile**: Edición de perfil
- **Games**: Lista de juegos terapéuticos
- **Recommendations**: Recomendaciones personalizadas
- **Settings**: Configuración de la app

## 🎨 Temas

La aplicación soporta tema claro y oscuro. El tema se puede cambiar desde:
- Pantalla de Perfil (toggle)
- Pantalla de Configuración

La preferencia se guarda en AsyncStorage y se mantiene entre sesiones.

## 📡 API Backend

La aplicación se conecta al backend de SerenVoice. Asegúrate de que:
1. El backend esté ejecutándose en `http://localhost:5000`
2. CORS esté configurado para permitir peticiones desde el dispositivo móvil
3. Los endpoints del API coincidan con los definidos en `src/config/api.js`

## 🐛 Solución de Problemas

### Error de conexión al API
- Verifica que el backend esté ejecutándose
- Comprueba la IP configurada en `api.js`
- Asegúrate de estar en la misma red WiFi (dispositivo físico)

### Error de permisos de micrófono
- En Android: Revisa los permisos en Configuración > Apps
- En iOS: Acepta el permiso cuando se solicite

### La app no carga
```bash
# Limpia la caché y reinicia
npm run reset
```

### Problemas con dependencias
```bash
# Reinstala node_modules
rm -rf node_modules
npm install
```

## 📄 Licencia

Este proyecto es parte de SerenVoice © 2025
