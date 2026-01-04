-- ============================================================
-- FIX: Corregir trigger trg_notificar_alerta_mejorado
-- El trigger usa columnas que no existen en historial_alerta
-- ============================================================

DELIMITER $$

DROP TRIGGER IF EXISTS `trg_notificar_alerta_mejorado`$$

CREATE TRIGGER `trg_notificar_alerta_mejorado` AFTER INSERT ON `alerta_analisis` 
FOR EACH ROW 
BEGIN
  DECLARE v_id_usuario INT;
  DECLARE v_nombre_usuario VARCHAR(100);
  DECLARE v_apellido_usuario VARCHAR(100);
  DECLARE v_id_facilitador INT;
  DECLARE v_variables JSON;
  DECLARE v_recursos_emergencia TEXT;
  DECLARE v_recomendacion TEXT;
  DECLARE v_nivel_estres FLOAT;
  DECLARE v_nivel_ansiedad FLOAT;
  
  -- Obtener información del usuario
  SELECT 
    u.id_usuario, u.nombre, u.apellido,
    ra.nivel_estres, ra.nivel_ansiedad
  INTO 
    v_id_usuario, v_nombre_usuario, v_apellido_usuario,
    v_nivel_estres, v_nivel_ansiedad
  FROM resultado_analisis ra
  JOIN analisis an ON ra.id_analisis = an.id_analisis
  JOIN audio au ON an.id_audio = au.id_audio
  JOIN usuario u ON au.id_usuario = u.id_usuario
  WHERE ra.id_resultado = NEW.id_resultado;
  
  -- Obtener facilitador del primer grupo activo
  SELECT u.id_usuario
  INTO v_id_facilitador
  FROM grupo_miembros gm
  JOIN grupos g ON gm.id_grupo = g.id_grupo
  JOIN usuario u ON g.id_facilitador = u.id_usuario
  WHERE gm.id_usuario = v_id_usuario
    AND gm.estado = 'activo'
    AND g.activo = 1
  ORDER BY gm.fecha_ingreso DESC
  LIMIT 1;
  
  -- Preparar recursos según nivel
  IF NEW.tipo_alerta = 'critica' THEN
    SET v_recursos_emergencia = 'Línea Nacional: 911 | Salud Mental 24/7: 171';
    SET v_recomendacion = 'Por favor, contacta inmediatamente con un profesional.';
  ELSEIF NEW.tipo_alerta = 'alta' THEN
    SET v_recursos_emergencia = 'Contacta con tu facilitador o línea de apoyo: 171';
    SET v_recomendacion = 'Te sugerimos ejercicios de respiración y contacto con tu grupo.';
  ELSE
    SET v_recursos_emergencia = '';
    SET v_recomendacion = 'Intenta: Meditación guiada o Jardín Zen virtual.';
  END IF;
  
  -- Preparar variables
  SET v_variables = JSON_OBJECT(
    'nombre_usuario', v_nombre_usuario,
    'apellido_usuario', v_apellido_usuario,
    'nivel_estres', ROUND(v_nivel_estres, 1),
    'nivel_ansiedad', ROUND(v_nivel_ansiedad, 1),
    'recursos_emergencia', v_recursos_emergencia,
    'recomendacion', v_recomendacion,
    'fecha_alerta', DATE_FORMAT(NEW.fecha_creacion, '%d/%m/%Y %H:%i'),
    'id_alerta', NEW.id_alerta
  );
  
  -- ================================================================
  -- NOTIFICACIONES SEGÚN NIVEL
  -- ================================================================
  
  IF NEW.tipo_alerta = 'critica' THEN
    -- Notificar al usuario
    CALL sp_crear_notificacion_alerta(
      v_id_usuario, 
      'alerta_critica_usuario',
      JSON_SET(v_variables, 
        '$.titulo_custom', NEW.titulo,
        '$.mensaje_custom', CONCAT(NEW.descripcion, ' ', v_recursos_emergencia)
      ),
      NEW.id_alerta, 
      'alerta'
    );
    
    -- Notificar al facilitador si existe
    IF v_id_facilitador IS NOT NULL THEN
      CALL sp_crear_notificacion_alerta(
        v_id_facilitador,
        'alerta_critica_facilitador',
        v_variables,
        NEW.id_alerta,
        'alerta'
      );
    END IF;
    
  ELSEIF NEW.tipo_alerta = 'alta' THEN
    CALL sp_crear_notificacion_alerta(
      v_id_usuario,
      'alerta_alta',
      JSON_SET(v_variables, 
        '$.titulo_custom', NEW.titulo,
        '$.mensaje_custom', CONCAT(NEW.descripcion, ' ', v_recursos_emergencia)
      ),
      NEW.id_alerta,
      'alerta'
    );
    
    -- Notificar al facilitador
    IF v_id_facilitador IS NOT NULL THEN
      CALL sp_crear_notificacion_alerta(
        v_id_facilitador,
        'alerta_alta_facilitador',
        v_variables,
        NEW.id_alerta,
        'alerta'
      );
    END IF;
    
  ELSEIF NEW.tipo_alerta = 'media' THEN
    CALL sp_crear_notificacion_alerta(
      v_id_usuario,
      'alerta_media',
      JSON_SET(v_variables, '$.mensaje_personalizado', v_recomendacion),
      NEW.id_alerta,
      'alerta'
    );
  END IF;
  
  -- Registrar en historial (SIN columna metadata que no existe)
  INSERT INTO historial_alerta (
    id_alerta, accion, detalles
  ) VALUES (
    NEW.id_alerta, 
    'creada',
    CONCAT('Alerta ', NEW.tipo_alerta, ' creada: ', NEW.titulo)
  );
  
END$$

DELIMITER ;

SELECT 'Trigger trg_notificar_alerta_mejorado actualizado correctamente' AS resultado;
