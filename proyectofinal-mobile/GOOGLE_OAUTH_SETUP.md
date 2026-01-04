# 🔐 Configuración de Google OAuth para SerenVoice Mobile

## 📋 Pasos para configurar Client IDs de Google

### 1️⃣ Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs y servicios** → **Credenciales**

---

### 2️⃣ Configurar Web Client ID (Ya lo tienes)

✅ **Ya configurado**: `11587771642-015ng6us09ecc6d38lgsc4qhq8d4bjub.apps.googleusercontent.com`

Este se usa para la web y también sirve de respaldo en móvil.

---

### 3️⃣ Crear Android Client ID

1. En Credenciales, haz clic en **Crear credenciales** → **ID de cliente de OAuth 2.0**
2. Tipo de aplicación: **Android**
3. Completa:
   - **Nombre**: SerenVoice Android
   - **Package name**: `com.serenvoice.app`
   - **SHA-1 certificate fingerprint**: Ver abajo cómo obtenerlo

#### 📱 Obtener SHA-1 para Android

✅ **YA OBTENIDO CON EAS:**

```
SHA-1: 14:FB:19:26:7E:D1:FD:34:51:30:A2:64:01:B7:88:C0:38:73:02:82
```

**Usa este SHA-1 para crear el Android Client ID en Google Cloud Console.**

Si necesitas regenerarlo en el futuro:
```bash
npx eas credentials
# Selecciona: Android → Keystore → View
```

4. Copia el **Client ID** generado
5. Pégalo en `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=TU-ANDROID-CLIENT-ID.apps.googleusercontent.com
   ```

---

### 4️⃣ Crear iOS Client ID

1. En Credenciales, **Crear credenciales** → **ID de cliente de OAuth 2.0**
2. Tipo de aplicación: **iOS**
3. Completa:
   - **Nombre**: SerenVoice iOS
   - **Bundle ID**: `com.serenvoice.app`

4. Copia el **Client ID** generado
5. Pégalo en `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=TU-IOS-CLIENT-ID.apps.googleusercontent.com
   ```

---

### 5️⃣ Configurar URIs de redirección

En cada Client ID creado, agrega estos **URIs de redirección autorizados**:

**Para Web:**
- `http://localhost:5173`
- `http://localhost:19006` (Expo web)

**Para Android/iOS (Expo):**
- `com.serenvoice.app:/redirect`
- `com.serenvoice.app://`

---

## 🧪 Probar la configuración

### Sin Client IDs nativos (solo Web Client ID):
1. Funcionará en Web y en móvil usando WebView
2. Experiencia similar a abrir un navegador dentro de la app

### Con Client IDs nativos (Android + iOS):
1. Funcionará con autenticación nativa del sistema operativo
2. Mejor experiencia de usuario
3. Autocompletado si ya iniciaste sesión en Google en el dispositivo

---

## ✅ Verificación

Tu archivo `.env` debe verse así:

```env
# Web Client ID (ya lo tienes)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=11587771642-015ng6us09ecc6d38lgsc4qhq8d4bjub.apps.googleusercontent.com

# Android Client ID (configúralo)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=XXXXX-XXXXX.apps.googleusercontent.com

# iOS Client ID (configúralo)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=XXXXX-XXXXX.apps.googleusercontent.com
```

---

## 🚀 Cómo funciona

1. **Usuario presiona "Continuar con Google"**
2. Se abre el navegador/diálogo nativo de Google
3. Usuario autoriza la app
4. Google devuelve un token de acceso
5. La app envía el token al backend (`/api/auth/google`)
6. Backend valida el token y crea/autentica al usuario
7. ✅ Login completado

---

## 📝 Notas importantes

- **Web Client ID**: Funciona en todas las plataformas como fallback
- **Android/iOS Client IDs**: Mejoran la experiencia pero son opcionales
- **Para desarrollo**: El Web Client ID es suficiente
- **Para producción**: Configura los tres Client IDs

---

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que `com.serenvoice.app:/redirect` esté en los URIs autorizados

### Error: "invalid_client"
- Verifica que los Client IDs estén correctos en `.env`
- Reinicia Expo: `npx expo start -c`

### No se abre el navegador
- Verifica que `expo-web-browser` esté instalado
- En Android emulator, verifica que Google Play Services esté actualizado
