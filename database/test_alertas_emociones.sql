-- ============================================================
-- SCRIPT DE PRUEBA: Insertar audios con emociones negativas intensas
-- Este script creará 4 análisis que deberían activar alertas
-- ============================================================

-- Usuario de prueba (cambiar si es necesario)
SET @test_user_id = 77;

-- ============================================================
-- AUDIO 1: Nivel CRÍTICO - Estrés extremo (85%) + Ansiedad alta (75%)
-- Debería generar alerta CRÍTICA
-- ============================================================
INSERT INTO audio (id_usuario, nombre_archivo, duracion, tamano_archivo, ruta_archivo, fecha_grabacion)
VALUES (@test_user_id, 'test_critico_001.wav', 10, 512000, '/uploads/test_critico_001.wav', NOW());
SET @audio_id_1 = LAST_INSERT_ID();

INSERT INTO analisis (id_audio, fecha_analisis, estado_analisis, modelo_usado)
VALUES (@audio_id_1, CURDATE(), 'completado', 'emotion_cnn');
SET @analisis_id_1 = LAST_INSERT_ID();

INSERT INTO resultado_analisis (
    id_analisis, nivel_estres, nivel_ansiedad, clasificacion, 
    confianza_modelo, emocion_dominante, nivel_enojo, nivel_tristeza,
    nivel_miedo, nivel_felicidad, nivel_neutral, nivel_sorpresa,
    fecha_resultado, activo
) VALUES (
    @analisis_id_1, 85.0, 75.0, 'muy_alto',
    91.5, 'Enojo', 88.0, 5.0,
    3.0, 1.0, 2.0, 1.0,
    NOW(), 1
);

SELECT 'Audio 1 insertado - Nivel CRÍTICO (estrés 85%, ansiedad 75%)' AS status;

-- ============================================================
-- AUDIO 2: Nivel ALTO - Estrés alto (65%) + Ansiedad moderada (55%)
-- Debería generar alerta ALTA
-- ============================================================
INSERT INTO audio (id_usuario, nombre_archivo, duracion, tamano_archivo, ruta_archivo, fecha_grabacion)
VALUES (@test_user_id, 'test_alto_002.wav', 12, 614400, '/uploads/test_alto_002.wav', NOW());
SET @audio_id_2 = LAST_INSERT_ID();

INSERT INTO analisis (id_audio, fecha_analisis, estado_analisis, modelo_usado)
VALUES (@audio_id_2, CURDATE(), 'completado', 'emotion_cnn');
SET @analisis_id_2 = LAST_INSERT_ID();

INSERT INTO resultado_analisis (
    id_analisis, nivel_estres, nivel_ansiedad, clasificacion, 
    confianza_modelo, emocion_dominante, nivel_enojo, nivel_tristeza,
    nivel_miedo, nivel_felicidad, nivel_neutral, nivel_sorpresa,
    fecha_resultado, activo
) VALUES (
    @analisis_id_2, 65.0, 55.0, 'alto',
    87.3, 'Tristeza', 15.0, 72.0,
    8.0, 2.0, 2.0, 1.0,
    NOW(), 1
);

SELECT 'Audio 2 insertado - Nivel ALTO (estrés 65%, ansiedad 55%)' AS status;

-- ============================================================
-- AUDIO 3: Nivel ALTO - Ansiedad muy alta (68%) + Estrés moderado (45%)
-- Debería generar alerta ALTA (ansiedad > 50%)
-- ============================================================
INSERT INTO audio (id_usuario, nombre_archivo, duracion, tamano_archivo, ruta_archivo, fecha_grabacion)
VALUES (@test_user_id, 'test_alto_003.wav', 8, 409600, '/uploads/test_alto_003.wav', NOW());
SET @audio_id_3 = LAST_INSERT_ID();

INSERT INTO analisis (id_audio, fecha_analisis, estado_analisis, modelo_usado)
VALUES (@audio_id_3, CURDATE(), 'completado', 'emotion_cnn');
SET @analisis_id_3 = LAST_INSERT_ID();

INSERT INTO resultado_analisis (
    id_analisis, nivel_estres, nivel_ansiedad, clasificacion, 
    confianza_modelo, emocion_dominante, nivel_enojo, nivel_tristeza,
    nivel_miedo, nivel_felicidad, nivel_neutral, nivel_sorpresa,
    fecha_resultado, activo
) VALUES (
    @analisis_id_3, 45.0, 68.0, 'alto',
    82.1, 'Miedo', 10.0, 12.0,
    65.0, 3.0, 8.0, 2.0,
    NOW(), 1
);

SELECT 'Audio 3 insertado - Nivel ALTO (estrés 45%, ansiedad 68%)' AS status;

-- ============================================================
-- AUDIO 4: Nivel MEDIO - Estrés moderado (48%) + Ansiedad baja (35%)
-- Debería generar alerta MEDIA (estrés > 40%)
-- ============================================================
INSERT INTO audio (id_usuario, nombre_archivo, duracion, tamano_archivo, ruta_archivo, fecha_grabacion)
VALUES (@test_user_id, 'test_medio_004.wav', 15, 768000, '/uploads/test_medio_004.wav', NOW());
SET @audio_id_4 = LAST_INSERT_ID();

INSERT INTO analisis (id_audio, fecha_analisis, estado_analisis, modelo_usado)
VALUES (@audio_id_4, CURDATE(), 'completado', 'emotion_cnn');
SET @analisis_id_4 = LAST_INSERT_ID();

INSERT INTO resultado_analisis (
    id_analisis, nivel_estres, nivel_ansiedad, clasificacion, 
    confianza_modelo, emocion_dominante, nivel_enojo, nivel_tristeza,
    nivel_miedo, nivel_felicidad, nivel_neutral, nivel_sorpresa,
    fecha_resultado, activo
) VALUES (
    @analisis_id_4, 48.0, 35.0, 'moderado',
    78.9, 'Enojo', 55.0, 20.0,
    10.0, 5.0, 8.0, 2.0,
    NOW(), 1
);

SELECT 'Audio 4 insertado - Nivel MEDIO (estrés 48%, ansiedad 35%)' AS status;

-- ============================================================
-- VERIFICAR RESULTADOS
-- ============================================================
SELECT '========== RESULTADOS DE LA PRUEBA ==========' AS info;

SELECT 
    'ANÁLISIS INSERTADOS' AS tipo,
    COUNT(*) AS total
FROM resultado_analisis 
WHERE id_analisis IN (@analisis_id_1, @analisis_id_2, @analisis_id_3, @analisis_id_4);

SELECT 
    'ALERTAS GENERADAS' AS tipo,
    COUNT(*) AS total
FROM alerta_analisis 
WHERE id_resultado IN (
    SELECT id_resultado FROM resultado_analisis 
    WHERE id_analisis IN (@analisis_id_1, @analisis_id_2, @analisis_id_3, @analisis_id_4)
);

-- Detalle de alertas creadas
SELECT 
    aa.id_alerta,
    aa.tipo_alerta,
    aa.titulo,
    ra.nivel_estres,
    ra.nivel_ansiedad,
    ra.emocion_dominante,
    aa.estado_alerta,
    aa.fecha_creacion
FROM alerta_analisis aa
JOIN resultado_analisis ra ON aa.id_resultado = ra.id_resultado
WHERE ra.id_analisis IN (@analisis_id_1, @analisis_id_2, @analisis_id_3, @analisis_id_4)
ORDER BY aa.fecha_creacion DESC;

SELECT '========== PRUEBA COMPLETADA ==========' AS info;
