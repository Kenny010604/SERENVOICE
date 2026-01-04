-- ============================================
-- SerenVoice - Corrección de nombres de juegos terapéuticos
-- Fecha: 2026-01-04
-- ============================================

-- Este script corrige los nombres y descripciones de los juegos
-- para que coincidan con los componentes del frontend web y móvil.

-- Resumen de correcciones:
-- ID 1: Respiración Profunda → Respiración Guiada (ya correcto el tipo)
-- ID 2: Jardín Zen → Jardín Zen (ya correcto)
-- ID 3: Diario de Gratitud → Mandala Creativo (tipo: mandala)
-- ID 4: Laberinto Mental → Puzzle Numérico (tipo: puzzle)
-- ID 5: Música Terapéutica → Juego de Memoria (tipo: memoria)

-- ============================================
-- BACKUP: Verificar datos actuales antes de actualizar
-- ============================================
SELECT id_juego, nombre, tipo_juego, descripcion, icono 
FROM juegos_terapeuticos 
ORDER BY id_juego;

-- ============================================
-- CORRECCIONES
-- ============================================

-- Juego 1: Respiración Profunda → Respiración Guiada
-- (El nombre debe coincidir con el mapeo del frontend móvil)
UPDATE juegos_terapeuticos 
SET 
    nombre = 'Respiración Guiada',
    descripcion = 'Ejercicio guiado de respiración 4-4-6 para reducir la ansiedad y el estrés. Inhala, mantén y exhala siguiendo el ritmo visual.',
    icono = '🌬️'
WHERE id_juego = 1;

-- Juego 2: Jardín Zen → Sin cambios (ya está correcto)
-- Solo actualizamos la descripción para que sea más precisa
UPDATE juegos_terapeuticos 
SET 
    descripcion = 'Crea tu jardín zen virtual mientras practicas la atención plena. Planta flores, árboles y cuida tu espacio de paz interior.',
    icono = '🌳'
WHERE id_juego = 2;

-- Juego 3: Diario de Gratitud → Mandala Creativo
UPDATE juegos_terapeuticos 
SET 
    nombre = 'Mandala Creativo',
    tipo_juego = 'mandala',
    descripcion = 'Colorea mandalas terapéuticos para relajarte y fomentar la creatividad. Elige colores y patrones para expresar tu estado emocional.',
    objetivo_emocional = 'estres',
    icono = '🎨'
WHERE id_juego = 3;

-- Juego 4: Laberinto Mental → Puzzle Numérico
UPDATE juegos_terapeuticos 
SET 
    nombre = 'Puzzle Numérico',
    tipo_juego = 'puzzle',
    descripcion = 'Resuelve el puzzle deslizante 3x3 ordenando los números del 1 al 8. Ejercita tu mente mientras te concentras en el presente.',
    objetivo_emocional = 'ansiedad',
    icono = '🧩'
WHERE id_juego = 4;

-- Juego 5: Música Terapéutica → Juego de Memoria
UPDATE juegos_terapeuticos 
SET 
    nombre = 'Juego de Memoria',
    tipo_juego = 'memoria',
    descripcion = 'Encuentra los pares de emojis iguales ejercitando tu memoria. Un juego relajante que mejora la concentración y reduce el estrés.',
    objetivo_emocional = 'estres',
    icono = '🃏'
WHERE id_juego = 5;

-- ============================================
-- VERIFICACIÓN: Mostrar datos actualizados
-- ============================================
SELECT 
    id_juego,
    nombre,
    tipo_juego,
    descripcion,
    objetivo_emocional,
    duracion_recomendada,
    icono,
    activo
FROM juegos_terapeuticos 
ORDER BY id_juego;

-- ============================================
-- RESUMEN DE MAPEO FINAL
-- ============================================
-- ID | Nombre              | Tipo       | Componente Frontend
-- ---|---------------------|------------|--------------------
-- 1  | Respiración Guiada  | respiracion| JuegoRespiracion.jsx / BreathingGame.js
-- 2  | Jardín Zen          | mindfulness| JuegoMindfulness.jsx / MindfulnessGame.js
-- 3  | Mandala Creativo    | mandala    | JuegoMandala.jsx / MandalaGame.js
-- 4  | Puzzle Numérico     | puzzle     | JuegoPuzzle.jsx / PuzzleGame.js
-- 5  | Juego de Memoria    | memoria    | JuegoMemoria.jsx / MemoryGame.js
