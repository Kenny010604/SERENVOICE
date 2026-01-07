# Integración de Juegos Terapéuticos - Mobile

## 📱 Descripción

Se han integrado 5 juegos terapéuticos del frontend web a la aplicación móvil React Native, adaptándolos completamente para funcionar de manera nativa.

## 🎮 Juegos Integrados

### 1. **BreathingGame** (Respiración Guiada)
- **Archivo**: `src/components/games/BreathingGame.js`
- **Características**:
  - 5 ciclos de respiración con fases: inhalar (4s), mantener (4s), exhalar (4s), descanso (2s)
  - Animaciones fluidas con círculo que crece/decrece
  - Colores dinámicos según fase
  - Contador de ciclos y tiempo restante
  - Controles: iniciar, pausar, reanudar, reiniciar
  
### 2. **MemoryGame** (Juego de Memoria)
- **Archivo**: `src/components/games/MemoryGame.js`
- **Características**:
  - Tablero 4x4 con 8 pares de emojis
  - Sistema de volteo de cartas con animaciones
  - Contador de movimientos y tiempo
  - Detección automática de victorias
  - Mezcla aleatoria de cartas
  - Modal de felicitación al completar

### 3. **MandalaGame** (Mandala Creativo)
- **Archivo**: `src/components/games/MandalaGame.js`
- **Características**:
  - Dibujo con SVG (react-native-svg)
  - 3 patrones predefinidos: Flor Simple, Estrella, Círculos
  - Paleta de 10 colores
  - Sistema de coloreo por secciones
  - Detección de mandala completado
  - Diseño creativo y relajante

### 4. **PuzzleGame** (Puzzle Numérico)
- **Archivo**: `src/components/games/PuzzleGame.js`
- **Características**:
  - Puzzle deslizante 3x3 (números 1-8)
  - Mezcla aleatoria válida
  - Movimientos solo a casillas adyacentes
  - Contador de movimientos y tiempo
  - Colores diferenciados por número
  - Validación automática de victoria

### 5. **MindfulnessGame** (Mindfulness)
- **Archivo**: `src/components/games/MindfulnessGame.js`
- **Características**:
  - 4 actividades: Escaneo Corporal, Atención Plena, Gratitud, Visualización
  - Sistema de pasos guiados
  - Temporizador por actividad
  - Navegación entre pasos
  - Animaciones suaves con fade y scale
  - Instrucciones detalladas

## 📂 Estructura de Archivos

```
proyectofinal-mobile/
├── src/
│   ├── components/
│   │   └── games/
│   │       ├── BreathingGame.js      # Respiración guiada
│   │       ├── MemoryGame.js         # Juego de memoria
│   │       ├── MandalaGame.js        # Mandala creativo
│   │       ├── PuzzleGame.js         # Puzzle numérico
│   │       ├── MindfulnessGame.js    # Mindfulness
│   │       └── index.js              # Exportaciones centralizadas
│   │
│   ├── screens/
│   │   └── main/
│   │       └── GameDetailScreen.js   # Pantalla de detalle (actualizada)
│   │
│   └── navigation/
│       └── MainNavigator.js          # Navigator (actualizado)
```

## 🔧 Cambios Realizados

### 1. Creación de Componentes de Juegos
- Se crearon 5 componentes completamente funcionales en React Native
- Adaptación de JSX web a componentes nativos (View, TouchableOpacity, etc.)
- Uso de Animated API de React Native para animaciones
- Estilos con StyleSheet en lugar de CSS

### 2. Actualización de GameDetailScreen
**Archivo**: `src/screens/main/GameDetailScreen.js`

**Antes**:
```javascript
const handleStartGame = () => {
  Alert.alert('Juego iniciado', 'Esta funcionalidad estará disponible próximamente.');
};
```

**Después**:
```javascript
const handleStartGame = () => {
  const gameComponentMap = {
    'Respiración Guiada': 'BreathingGame',
    'Juego de Memoria': 'MemoryGame', 
    'Mandala Creativo': 'MandalaGame',
    'Puzzle Numérico': 'PuzzleGame',
    'Mindfulness': 'MindfulnessGame',
  };

  const gameScreen = gameComponentMap[game.nombre] || gameComponentMap[game.tipo];

  if (gameScreen) {
    navigation.navigate(gameScreen, { game });
  }
};
```

### 3. Actualización del MainNavigator
**Archivo**: `src/navigation/MainNavigator.js`

**Añadido**:
```javascript
// Imports
import BreathingGame from '../components/games/BreathingGame';
import MemoryGame from '../components/games/MemoryGame';
import MandalaGame from '../components/games/MandalaGame';
import PuzzleGame from '../components/games/PuzzleGame';
import MindfulnessGame from '../components/games/MindfulnessGame';

// GamesStack
const GamesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GamesHome" component={GamesScreen} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} />
      <Stack.Screen name="BreathingGame" component={BreathingGame} />
      <Stack.Screen name="MemoryGame" component={MemoryGame} />
      <Stack.Screen name="MandalaGame" component={MandalaGame} />
      <Stack.Screen name="PuzzleGame" component={PuzzleGame} />
      <Stack.Screen name="MindfulnessGame" component={MindfulnessGame} />
    </Stack.Navigator>
  );
};
```

## 🎨 Adaptaciones de Web a Mobile

### Conversiones Principales

| Web (React) | Mobile (React Native) |
|-------------|----------------------|
| `<div>` | `<View>` |
| `<button>` | `<TouchableOpacity>` |
| `<span>`, `<p>` | `<Text>` |
| CSS classes | `StyleSheet.create()` |
| CSS animations | `Animated` API |
| `onClick` | `onPress` |
| `className` | `style` prop |
| Flexbox CSS | Flexbox nativo |

### Características Conservadas
✅ Toda la lógica de estado (useState, useEffect)  
✅ Temporizadores y contadores  
✅ Validaciones y detección de victoria  
✅ Animaciones (adaptadas con Animated API)  
✅ Navegación (con React Navigation)  

### Características Mejoradas
✨ Mejor rendimiento con componentes nativos  
✨ Gestos táctiles nativos  
✨ Animaciones más fluidas  
✨ Mejor experiencia en dispositivos móviles  

## 🚀 Cómo Usar

### Para usuarios finales:
1. Ir a la pestaña **Juegos** (icono de joystick)
2. Seleccionar un juego de la lista
3. Ver detalles y beneficios
4. Presionar **"Comenzar actividad"**
5. ¡Disfrutar del juego!

### Para desarrolladores:
```javascript
// Importar un juego específico
import { BreathingGame } from './src/components/games';

// O importar individualmente
import BreathingGame from './src/components/games/BreathingGame';

// Navegar al juego
navigation.navigate('BreathingGame', { game: gameData });
```

## 📋 Requisitos

### Dependencias Necesarias
Ya están instaladas en `package.json`:
- ✅ `react-native-svg` - Para renderizado de SVG (MandalaGame)
- ✅ `@expo/vector-icons` - Para iconos
- ✅ `@react-navigation/native` - Para navegación

### Permisos
No se requieren permisos especiales del sistema para estos juegos.

## 🎯 Flujo de Navegación

```
Tab Navigator (Juegos)
    └── GamesStack
        ├── GamesHome (Lista de juegos)
        ├── GameDetail (Detalle del juego)
        └── Juegos específicos:
            ├── BreathingGame
            ├── MemoryGame
            ├── MandalaGame
            ├── PuzzleGame
            └── MindfulnessGame
```

## 🧪 Testing

### Casos de Prueba Recomendados

1. **BreathingGame**:
   - ✓ Iniciar ejercicio
   - ✓ Pausar/Reanudar
   - ✓ Completar 5 ciclos
   - ✓ Reiniciar

2. **MemoryGame**:
   - ✓ Voltear cartas
   - ✓ Encontrar parejas
   - ✓ Completar puzzle
   - ✓ Contador de movimientos

3. **MandalaGame**:
   - ✓ Seleccionar colores
   - ✓ Colorear secciones
   - ✓ Cambiar patrones
   - ✓ Completar diseño

4. **PuzzleGame**:
   - ✓ Mover fichas
   - ✓ Resolver puzzle
   - ✓ Validar movimientos
   - ✓ Reiniciar

5. **MindfulnessGame**:
   - ✓ Seleccionar actividad
   - ✓ Navegar pasos
   - ✓ Temporizador
   - ✓ Completar actividad

## 🐛 Troubleshooting

### Problema: "SVG no renderiza"
**Solución**: Verificar que `react-native-svg` esté instalado:
```bash
npm install react-native-svg
```

### Problema: "Navegación no funciona"
**Solución**: Asegurar que las pantallas estén registradas en `MainNavigator.js`

### Problema: "Animaciones laggy"
**Solución**: Usar `useNativeDriver: true` en todas las animaciones (ya implementado)

## 📈 Próximas Mejoras

- [ ] Integrar con backend para guardar sesiones de juego
- [ ] Añadir estadísticas de progreso
- [ ] Implementar logros y recompensas
- [ ] Agregar más niveles de dificultad
- [ ] Sonidos y música de fondo
- [ ] Modo multijugador en memoria
- [ ] Más patrones en mandala
- [ ] Exportar mandalas como imagen

## 👥 Créditos

- **Frontend original**: Versión web React con MUI
- **Adaptación mobile**: React Native + Expo SDK 52
- **Diseño**: Siguiendo guías de Material Design y iOS Human Interface

---

**Versión**: 1.0.0  
**Fecha**: Enero 2026  
**Estado**: ✅ Completado y funcional
