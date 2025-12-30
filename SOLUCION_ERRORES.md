# Guía de Solución - Problemas de la Aplicación Móvil

## ✅ Problemas Solucionados

### 1. **Rutas sin Exportación por Defecto** ✅ ARREGLADO
Se han creado componentes por defecto en todos los archivos vacíos:
- `GrupoForm.tsx`
- `Grupos.tsx`
- `JuegoRecomendado.tsx`
- `Miembros.tsx`
- `Notificaciones.tsx`
- `ReporteUsuario.tsx`
- `ResultadoDetallado.tsx`
- `Inicio.tsx`
- `OlvideMiContrasena.tsx`
- `RegistroExitoso.tsx`
- `ResetearContrasena.tsx`
- `Sobre.tsx`
- `VerificarEmail.tsx`

---

## ❌ Problema Principal: Sin Conexión al Backend

### El Problema
```
🔗 API_URL: http://192.168.1.38:5000
```

Tu app móvil intenta conectarse a `192.168.1.38:5000`, pero **el backend no está corriendo en ese puerto**.

### ¿Por Qué?
1. **Backend no está inicializado** - No hay proceso Python ejecutándose en el puerto 5000
2. **IP incorrecta** - Si ejecutas desde diferente máquina, la IP podría ser otra
3. **Firewall bloqueando** - El puerto 5000 podría estar bloqueado

---

## 🔧 Solución: Iniciar el Backend

### Paso 1: Abre una terminal en la carpeta backend
```bash
cd C:\Users\kenny\Documents\PROYECTOFINAL\backend
```

### Paso 2: Instala dependencias (si no las tienes)
```bash
pip install -r requirements.txt
```

### Paso 3: Ejecuta el servidor Flask
```bash
python app.py
```

**Resultado esperado:**
```
WARNING in flask_cors.extension - Flask-CORS: 'resources' key is missing...
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### Paso 4: Verifica que funciona
Abre en tu navegador: `http://192.168.1.38:5000/` 

Si ves algo (probablemente un error de ruta), ¡**el backend está corriendo!**

---

## 📱 Verificar la Conexión desde tu Móvil

Una vez que el backend esté corriendo:

### 1. **En tu móvil, verifica que esté en la MISMA RED WiFi**
   - Asegúrate que tu PC y móvil estén conectados al mismo WiFi

### 2. **Verifica tu IP correcta**
   ```bash
   # En Windows, abre Command Prompt y ejecuta:
   ipconfig
   
   # Busca "IPv4 Address" bajo tu conexión WiFi actual
   # Ej: 192.168.1.38
   ```

### 3. **Si la IP es diferente, actualiza el archivo:**
   📄 `proyectofinal-mobile/constants/index.ts`
   ```typescript
   // Reemplaza la IP con tu IP actual
   export const API_URL = "http://192.168.1.X:5000";  // ← Cambiar X por tu IP
   ```

### 4. **Guarda los cambios y recarga la app móvil**
   - La aplicación debería conectarse correctamente

---

## ⚠️ Advertencias Pendientes (Opcionales)

### 1. **expo-av deprecado**
Tu código usa `expo-av` que está deprecado. Para actualizar:
```bash
npm install expo-audio expo-video
```
Luego reemplaza imports en `AnalizarVoz.tsx`

### 2. **Estilos deprecated**
En `Dashboard.tsx` línea 324, reemplaza:
```typescript
// ❌ Viejo
shadowColor: "#000",
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.25,
shadowRadius: 3.84,

// ✅ Nuevo
boxShadow: "0 2px 3.84px rgba(0, 0, 0, 0.25)",
```

---

## 📝 Resumen Rápido

| Problema | Solución |
|----------|----------|
| ❌ Rutas sin exportación | ✅ Archivos creados con componentes |
| ❌ Sin conexión al backend | ✅ Ejecutar: `python app.py` |
| ❌ expo-av deprecado | ⚠️ Opcional: instalar expo-audio |
| ❌ Estilos desactualizados | ⚠️ Opcional: actualizar CSS |

---

**Próximos pasos:**
1. Ejecuta el backend: `python app.py`
2. Recarga tu app móvil
3. Verifica la conexión en los logs de tu móvil

¡Déjame saber si necesitas más ayuda! 🚀
