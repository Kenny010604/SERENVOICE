-- ============================================================
-- FIX: Eliminar SELECT de procedimientos llamados desde triggers
-- Ejecutar en MySQL/phpMyAdmin
-- ============================================================

DELIMITER $$

-- ============================================================
-- sp_crear_notificacion (sin SELECT al final)
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_crear_notificacion`$$
CREATE PROCEDURE `sp_crear_notificacion` (
  IN `p_id_usuario` INT, 
  IN `p_codigo_plantilla` VARCHAR(100), 
  IN `p_variables` JSON, 
  IN `p_id_referencia` INT, 
  IN `p_tipo_referencia` VARCHAR(50)
)
BEGIN
  DECLARE v_titulo VARCHAR(200);
  DECLARE v_mensaje TEXT;
  DECLARE v_icono VARCHAR(50);
  DECLARE v_url VARCHAR(500);
  DECLARE v_prioridad VARCHAR(20);
  DECLARE v_tipo VARCHAR(50);
  DECLARE v_enviar_email TINYINT;
  DECLARE v_enviar_push TINYINT;
  DECLARE v_fecha_expiracion DATETIME;
  DECLARE v_duracion_dias INT;
  
  -- Obtener plantilla
  SELECT 
    titulo_template, mensaje_template, icono, url_template, 
    prioridad_default, tipo_notificacion, enviar_email, 
    enviar_push, duracion_dias
  INTO 
    v_titulo, v_mensaje, v_icono, v_url, 
    v_prioridad, v_tipo, v_enviar_email, 
    v_enviar_push, v_duracion_dias
  FROM plantillas_notificacion
  WHERE codigo = p_codigo_plantilla AND activo = 1
  LIMIT 1;
  
  -- Calcular fecha de expiración
  IF v_duracion_dias IS NOT NULL THEN
    SET v_fecha_expiracion = DATE_ADD(NOW(), INTERVAL v_duracion_dias DAY);
  END IF;
  
  -- Insertar notificación (sin SELECT al final)
  INSERT INTO notificaciones (
    id_usuario, tipo_notificacion, titulo, mensaje, icono,
    url_accion, id_referencia, tipo_referencia, metadata,
    prioridad, fecha_expiracion, enviada_email, enviada_push
  ) VALUES (
    p_id_usuario, v_tipo, v_titulo, v_mensaje, v_icono,
    v_url, p_id_referencia, p_tipo_referencia, p_variables,
    v_prioridad, v_fecha_expiracion, v_enviar_email, v_enviar_push
  );
  
  -- REMOVIDO: SELECT LAST_INSERT_ID() AS id_notificacion;
END$$

-- ============================================================
-- sp_crear_notificacion_alerta (sin SELECT al final)
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_crear_notificacion_alerta`$$
CREATE PROCEDURE `sp_crear_notificacion_alerta` (
  IN `p_id_usuario` INT, 
  IN `p_codigo_plantilla` VARCHAR(100), 
  IN `p_variables` JSON, 
  IN `p_id_referencia` INT, 
  IN `p_tipo_referencia` VARCHAR(50)
)
BEGIN
  DECLARE v_titulo VARCHAR(200);
  DECLARE v_mensaje TEXT;
  DECLARE v_icono VARCHAR(50);
  DECLARE v_url VARCHAR(500);
  DECLARE v_prioridad VARCHAR(20);
  DECLARE v_tipo VARCHAR(50);
  DECLARE v_enviar_email TINYINT;
  DECLARE v_enviar_push TINYINT;
  DECLARE v_fecha_expiracion DATETIME;
  DECLARE v_duracion_dias INT;
  DECLARE v_id_notificacion INT;
  
  -- Obtener plantilla
  SELECT 
    titulo_template, mensaje_template, icono, url_template, 
    prioridad_default, tipo_notificacion, enviar_email, 
    enviar_push, duracion_dias
  INTO 
    v_titulo, v_mensaje, v_icono, v_url, 
    v_prioridad, v_tipo, v_enviar_email, 
    v_enviar_push, v_duracion_dias
  FROM plantillas_notificacion
  WHERE codigo = p_codigo_plantilla AND activo = 1
  LIMIT 1;
  
  -- Si no se encuentra plantilla, salir silenciosamente
  -- (cambiado de SIGNAL a simplemente retornar para evitar errores en triggers)
  IF v_titulo IS NULL THEN
    -- No hacer nada si no hay plantilla (evita error en trigger)
    SET v_id_notificacion = NULL;
  ELSE
    -- Reemplazar variables personalizadas
    IF p_variables IS NOT NULL THEN
      SET v_titulo = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_variables, '$.titulo_custom')), v_titulo);
      SET v_mensaje = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_variables, '$.mensaje_custom')), v_mensaje);
    END IF;
    
    -- Calcular fecha de expiración
    IF v_duracion_dias IS NOT NULL THEN
      SET v_fecha_expiracion = DATE_ADD(NOW(), INTERVAL v_duracion_dias DAY);
    END IF;
    
    -- Insertar notificación
    INSERT INTO notificaciones (
      id_usuario, tipo_notificacion, titulo, mensaje, icono,
      url_accion, id_referencia, tipo_referencia, metadata,
      prioridad, fecha_expiracion, enviada_email, enviada_push
    ) VALUES (
      p_id_usuario, v_tipo, v_titulo, v_mensaje, v_icono,
      v_url, p_id_referencia, p_tipo_referencia, p_variables,
      v_prioridad, v_fecha_expiracion, v_enviar_email, v_enviar_push
    );
    
    SET v_id_notificacion = LAST_INSERT_ID();
    
    -- Registrar en historial de alerta si aplica (sin columnas que no existen)
    IF p_tipo_referencia = 'alerta' AND p_id_referencia IS NOT NULL THEN
      INSERT INTO historial_alerta (
        id_alerta, accion, detalles
      ) VALUES (
        p_id_referencia, 'creada',
        CONCAT('Notificación enviada: ', v_titulo)
      );
    END IF;
  END IF;
  
  -- REMOVIDO: SELECT v_id_notificacion AS id_notificacion;
END$$

DELIMITER ;

-- ============================================================
-- Verificar que los procedimientos fueron actualizados
-- ============================================================
SELECT 'Procedimientos actualizados correctamente' AS resultado;
