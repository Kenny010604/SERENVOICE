-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-01-2026 a las 16:30:09
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `serenvoice`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_grupo`
--

CREATE TABLE `actividades_grupo` (
  `id_actividad` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `id_creador` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo_actividad` enum('juego_grupal','ejercicio_respiracion','meditacion_guiada','reflexion','tarea','otro') DEFAULT 'tarea',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `completada` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `actividades_grupo`
--
DELIMITER $$
CREATE TRIGGER `trg_notificar_actividad_grupo` AFTER INSERT ON `actividades_grupo` FOR EACH ROW BEGIN
  
  INSERT INTO notificaciones (
    id_usuario, tipo_notificacion, titulo, mensaje, icono,
    url_accion, id_referencia, tipo_referencia, prioridad
  )
  SELECT 
    gm.id_usuario,
    'actividad_grupo',
    CONCAT('Nueva actividad: ', NEW.titulo),
    NEW.descripcion,
    '?',
    CONCAT('/grupos/', NEW.id_grupo, '/actividades/', NEW.id_actividad),
    NEW.id_actividad,
    'actividad',
    'media'
  FROM grupo_miembros gm
  WHERE gm.id_grupo = NEW.id_grupo 
    AND gm.estado = 'activo'
    AND gm.id_usuario != NEW.id_creador; 
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alerta_analisis`
--

CREATE TABLE `alerta_analisis` (
  `id_alerta` int(11) NOT NULL,
  `id_resultado` int(11) NOT NULL,
  `tipo_alerta` enum('baja','media','alta','critica') DEFAULT 'media',
  `tipo_recomendacion` enum('advertencia','critica','informativa') DEFAULT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `contexto` text DEFAULT NULL,
  `fecha` date NOT NULL DEFAULT curdate(),
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_revision` datetime DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `estado_alerta` enum('pendiente','en_proceso','resuelta','escalada') DEFAULT 'pendiente',
  `fecha_resolucion` datetime DEFAULT NULL,
  `id_usuario_asignado` int(11) DEFAULT NULL,
  `tiempo_respuesta` int(11) DEFAULT NULL,
  `notas_resolucion` text DEFAULT NULL,
  `escalada_desde` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `alerta_analisis`
--
DELIMITER $$
CREATE TRIGGER `trg_notificar_alerta_mejorado` AFTER INSERT ON `alerta_analisis` FOR EACH ROW BEGIN
  DECLARE v_id_usuario INT;
  DECLARE v_nombre_usuario VARCHAR(100);
  DECLARE v_apellido_usuario VARCHAR(100);
  DECLARE v_id_facilitador INT;
  DECLARE v_variables JSON;
  DECLARE v_recursos_emergencia TEXT;
  DECLARE v_recomendacion TEXT;
  DECLARE v_nivel_estres FLOAT;
  DECLARE v_nivel_ansiedad FLOAT;
  
  
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
  
  
  IF NEW.tipo_alerta = 'critica' THEN
    SET v_recursos_emergencia = 'L├¡nea Nacional: 911 | Salud Mental 24/7: 171';
    SET v_recomendacion = 'Por favor, contacta inmediatamente con un profesional.';
  ELSEIF NEW.tipo_alerta = 'alta' THEN
    SET v_recursos_emergencia = 'Contacta con tu facilitador o l├¡nea de apoyo: 171';
    SET v_recomendacion = 'Te sugerimos ejercicios de respiraci├│n y contacto con tu grupo.';
  ELSE
    SET v_recursos_emergencia = '';
    SET v_recomendacion = 'Intenta: Meditaci├│n guiada o Jard├¡n Zen virtual.';
  END IF;
  
  
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
  
  
  
  
  
  IF NEW.tipo_alerta = 'critica' THEN
    
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
  
  
  INSERT INTO historial_alerta (
    id_alerta, accion, detalles
  ) VALUES (
    NEW.id_alerta, 
    'creada',
    CONCAT('Alerta ', NEW.tipo_alerta, ' creada: ', NEW.titulo)
  );
  
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `analisis`
--

CREATE TABLE `analisis` (
  `id_analisis` int(11) NOT NULL,
  `id_audio` int(11) NOT NULL,
  `modelo_usado` varchar(100) DEFAULT NULL,
  `fecha_analisis` date NOT NULL DEFAULT curdate(),
  `estado_analisis` enum('procesando','completado','error') DEFAULT 'procesando',
  `duracion_procesamiento` float DEFAULT NULL COMMENT 'En segundos',
  `eliminado` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audio`
--

CREATE TABLE `audio` (
  `id_audio` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `duracion` float DEFAULT NULL,
  `tamano_archivo` float DEFAULT NULL COMMENT 'En MB',
  `fecha_grabacion` datetime NOT NULL DEFAULT current_timestamp(),
  `nivel_estres` float DEFAULT NULL,
  `nivel_ansiedad` float DEFAULT NULL,
  `nivel_felicidad` float DEFAULT NULL,
  `nivel_tristeza` float DEFAULT NULL,
  `nivel_miedo` float DEFAULT NULL,
  `nivel_neutral` float DEFAULT NULL,
  `nivel_enojo` float DEFAULT NULL,
  `nivel_sorpresa` float DEFAULT NULL,
  `procesado_por_ia` tinyint(1) DEFAULT 0,
  `eliminado` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL,
  `nombre_grupo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `codigo_acceso` varchar(20) NOT NULL,
  `id_facilitador` int(11) NOT NULL,
  `tipo_grupo` enum('terapia','apoyo','taller','empresa','educativo','familiar','otro') DEFAULT 'apoyo',
  `privacidad` enum('publico','privado','por_invitacion') DEFAULT 'privado',
  `max_participantes` int(11) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo_miembros`
--

CREATE TABLE `grupo_miembros` (
  `id_grupo_miembro` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `rol_grupo` enum('facilitador','co_facilitador','participante','observador') DEFAULT 'participante',
  `fecha_ingreso` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_salida` datetime DEFAULT NULL,
  `estado` enum('activo','inactivo','suspendido') DEFAULT 'activo',
  `permisos_especiales` text DEFAULT NULL COMMENT 'JSON con permisos adicionales',
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `grupo_miembros`
--
DELIMITER $$
CREATE TRIGGER `trg_notificar_invitacion_grupo` AFTER INSERT ON `grupo_miembros` FOR EACH ROW BEGIN
  IF NEW.rol_grupo = 'participante' THEN
    INSERT INTO notificaciones (
      id_usuario, tipo_notificacion, titulo, mensaje, icono,
      url_accion, id_referencia, tipo_referencia, prioridad
    )
    SELECT 
      NEW.id_usuario,
      'invitacion_grupo',
      CONCAT('InvitaciÃ³n a ', g.nombre_grupo),
      CONCAT('Has sido invitado a unirte al grupo "', g.nombre_grupo, '"'),
      '?',
      CONCAT('/grupos/', NEW.id_grupo),
      NEW.id_grupo,
      'grupo',
      'alta'
    FROM grupos g
    WHERE g.id_grupo = NEW.id_grupo;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_alerta`
--

CREATE TABLE `historial_alerta` (
  `id_historial` int(11) NOT NULL,
  `id_alerta` int(11) NOT NULL,
  `accion` enum('creada','asignada','contacto_exitoso','escalada','resuelta','archivada') DEFAULT NULL,
  `usuario_responsable` int(11) DEFAULT NULL,
  `detalles` text DEFAULT NULL,
  `fecha_accion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juegos_terapeuticos`
--

CREATE TABLE `juegos_terapeuticos` (
  `id_juego` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_juego` varchar(20) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `objetivo_emocional` varchar(20) DEFAULT NULL,
  `duracion_recomendada` int(11) DEFAULT NULL COMMENT 'DuraciÃ³n en minutos',
  `icono` varchar(10) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificacion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL COMMENT 'Destinatario',
  `tipo_notificacion` enum('invitacion_grupo','actividad_grupo','recordatorio_actividad','recomendacion','alerta_critica','mensaje_facilitador','logro_desbloqueado','recordatorio_analisis','actualizacion_grupo','sistema') NOT NULL DEFAULT 'sistema',
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `icono` varchar(50) DEFAULT NULL COMMENT 'Emoji o clase CSS',
  `url_accion` varchar(500) DEFAULT NULL COMMENT 'URL a donde redirigir',
  `id_referencia` int(11) DEFAULT NULL COMMENT 'ID del objeto relacionado',
  `tipo_referencia` varchar(50) DEFAULT NULL COMMENT 'grupo, actividad, recomendacion, etc',
  `metadata` text DEFAULT NULL COMMENT 'JSON con datos adicionales',
  `leida` tinyint(1) DEFAULT 0,
  `fecha_leida` datetime DEFAULT NULL,
  `archivada` tinyint(1) DEFAULT 0,
  `fecha_archivado` datetime DEFAULT NULL,
  `prioridad` enum('baja','media','alta','urgente') DEFAULT 'media',
  `fecha_expiracion` datetime DEFAULT NULL COMMENT 'Para notificaciones temporales',
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `enviada_push` tinyint(1) DEFAULT 0 COMMENT 'Si se enviÃ³ push notification',
  `enviada_email` tinyint(1) DEFAULT 0 COMMENT 'Si se enviÃ³ por correo',
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participacion_actividad`
--

CREATE TABLE `participacion_actividad` (
  `id_participacion` int(11) NOT NULL,
  `id_actividad` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_completada` datetime DEFAULT NULL,
  `notas_participante` text DEFAULT NULL,
  `estado_emocional_antes` varchar(50) DEFAULT NULL,
  `estado_emocional_despues` varchar(50) DEFAULT NULL,
  `completada` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantillas_notificacion`
--

CREATE TABLE `plantillas_notificacion` (
  `id_plantilla` int(11) NOT NULL,
  `codigo` varchar(100) NOT NULL COMMENT 'invitacion_grupo, nueva_recomendacion',
  `tipo_notificacion` enum('invitacion_grupo','actividad_grupo','recordatorio_actividad','recomendacion','alerta_critica','mensaje_facilitador','logro_desbloqueado','recordatorio_analisis','actualizacion_grupo','sistema') NOT NULL,
  `titulo_template` varchar(200) NOT NULL,
  `mensaje_template` text NOT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `url_template` varchar(500) DEFAULT NULL,
  `prioridad_default` enum('baja','media','alta','urgente') DEFAULT 'media',
  `duracion_dias` int(11) DEFAULT NULL COMMENT 'DÃ­as antes de expirar',
  `enviar_email` tinyint(1) DEFAULT 0,
  `enviar_push` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preferencias_notificacion`
--

CREATE TABLE `preferencias_notificacion` (
  `id_preferencia` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `invitacion_grupo_app` tinyint(1) DEFAULT 1,
  `invitacion_grupo_email` tinyint(1) DEFAULT 1,
  `invitacion_grupo_push` tinyint(1) DEFAULT 1,
  `actividad_grupo_app` tinyint(1) DEFAULT 1,
  `actividad_grupo_email` tinyint(1) DEFAULT 0,
  `actividad_grupo_push` tinyint(1) DEFAULT 1,
  `recomendacion_app` tinyint(1) DEFAULT 1,
  `recomendacion_email` tinyint(1) DEFAULT 1,
  `recomendacion_push` tinyint(1) DEFAULT 0,
  `alerta_critica_app` tinyint(1) DEFAULT 1,
  `alerta_critica_email` tinyint(1) DEFAULT 1,
  `alerta_critica_push` tinyint(1) DEFAULT 1,
  `recordatorio_app` tinyint(1) DEFAULT 1,
  `recordatorio_email` tinyint(1) DEFAULT 0,
  `recordatorio_push` tinyint(1) DEFAULT 1,
  `horario_inicio` time DEFAULT '08:00:00' COMMENT 'No molestar antes de',
  `horario_fin` time DEFAULT '22:00:00' COMMENT 'No molestar despuÃ©s de',
  `pausar_notificaciones` tinyint(1) DEFAULT 0,
  `fecha_pausa_hasta` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recomendaciones`
--

CREATE TABLE `recomendaciones` (
  `id_recomendacion` int(11) NOT NULL,
  `id_resultado` int(11) NOT NULL,
  `tipo_recomendacion` enum('respiracion','ejercicio','meditacion','profesional','pausa_activa','otros') DEFAULT NULL,
  `contenido` text NOT NULL,
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `fecha_generacion` date NOT NULL DEFAULT curdate(),
  `aplica` tinyint(1) DEFAULT 0,
  `fecha_aplica` date DEFAULT NULL,
  `util` tinyint(1) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `recomendaciones`
--
DELIMITER $$
CREATE TRIGGER `trg_notificar_recomendacion` AFTER INSERT ON `recomendaciones` FOR EACH ROW BEGIN
  INSERT INTO notificaciones (
    id_usuario, tipo_notificacion, titulo, mensaje, icono,
    url_accion, id_referencia, tipo_referencia, prioridad
  )
  SELECT 
    au.id_usuario,
    'recomendacion',
    'Nueva recomendaciÃ³n personalizada',
    NEW.contenido,
    '?',
    CONCAT('/recomendaciones/', NEW.id_recomendacion),
    NEW.id_recomendacion,
    'recomendacion',
    NEW.prioridad
  FROM resultado_analisis ra
  JOIN analisis an ON ra.id_analisis = an.id_analisis
  JOIN audio au ON an.id_audio = au.id_audio
  WHERE ra.id_resultado = NEW.id_resultado;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refresh_token`
--

CREATE TABLE `refresh_token` (
  `id_refresh_token` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `dispositivo` varchar(100) DEFAULT NULL,
  `navegador` varchar(150) DEFAULT NULL,
  `sistema_operativo` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_expiracion` datetime NOT NULL,
  `es_recordarme` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `revocado` tinyint(1) DEFAULT 0,
  `fecha_revocacion` datetime DEFAULT NULL,
  `ultimo_uso` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Almacena refresh tokens para autenticación persistente';

--
-- Disparadores `refresh_token`
--
DELIMITER $$
CREATE TRIGGER `before_refresh_token_update` BEFORE UPDATE ON `refresh_token` FOR EACH ROW BEGIN
    -- Actualizar último uso automáticamente
    IF NEW.activo = TRUE AND OLD.activo = TRUE THEN
        SET NEW.ultimo_uso = CURRENT_TIMESTAMP;
    END IF;
    
    -- Si se revoca, establecer fecha de revocación
    IF NEW.revocado = TRUE AND OLD.revocado = FALSE THEN
        SET NEW.fecha_revocacion = CURRENT_TIMESTAMP;
        SET NEW.activo = FALSE;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte`
--

CREATE TABLE `reporte` (
  `id_reporte` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo_reporte` varchar(100) DEFAULT NULL,
  `fecha_creacion` date NOT NULL DEFAULT curdate(),
  `formato` enum('pdf','excel') DEFAULT 'pdf'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte_resultado`
--

CREATE TABLE `reporte_resultado` (
  `id_reporte_resultado` int(11) NOT NULL,
  `id_reporte` int(11) NOT NULL,
  `id_resultado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultado_analisis`
--

CREATE TABLE `resultado_analisis` (
  `id_resultado` int(11) NOT NULL,
  `id_analisis` int(11) NOT NULL,
  `nivel_estres` float NOT NULL,
  `nivel_ansiedad` float NOT NULL,
  `clasificacion` enum('normal','leve','moderado','alto','muy_alto') DEFAULT NULL,
  `confianza_modelo` float DEFAULT NULL,
  `emocion_dominante` varchar(50) DEFAULT NULL,
  `nivel_felicidad` float DEFAULT NULL,
  `nivel_tristeza` float DEFAULT NULL,
  `nivel_miedo` float DEFAULT NULL,
  `nivel_neutral` float DEFAULT NULL,
  `nivel_enojo` float DEFAULT NULL,
  `nivel_sorpresa` float DEFAULT NULL,
  `fecha_resultado` datetime NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `id_rol_usuario` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `ultima_actualizacion` datetime DEFAULT NULL,
  `id_admin_asigna` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion`
--

CREATE TABLE `sesion` (
  `id_sesion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_fin` datetime DEFAULT NULL,
  `duracion` time DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `dispositivo` varchar(100) DEFAULT NULL,
  `navegador` varchar(100) DEFAULT NULL,
  `sistema_operativo` varchar(100) DEFAULT NULL,
  `ultimo_acceso` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `estado` enum('activa','cerrada') DEFAULT 'activa',
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_juego`
--

CREATE TABLE `sesiones_juego` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_juego` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_fin` datetime DEFAULT NULL,
  `duracion_segundos` int(11) DEFAULT NULL,
  `puntuacion` int(11) DEFAULT 0,
  `nivel_alcanzado` int(11) DEFAULT 1,
  `completado` tinyint(1) DEFAULT 0,
  `estado_antes` varchar(20) DEFAULT NULL COMMENT 'critico, alerta, precaucion, estable, positivo',
  `estado_despues` varchar(20) DEFAULT NULL,
  `mejora_percibida` varchar(20) DEFAULT NULL COMMENT 'mucho_peor, peor, igual, mejor, mucho_mejor',
  `notas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `foto_perfil` varchar(500) DEFAULT NULL,
  `google_uid` varchar(255) DEFAULT NULL,
  `auth_provider` varchar(50) DEFAULT 'local',
  `fecha_registro` date NOT NULL DEFAULT curdate(),
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `edad` int(11) DEFAULT NULL,
  `usa_medicamentos` tinyint(1) DEFAULT 0,
  `genero` varchar(15) DEFAULT NULL,
  `notificaciones` tinyint(1) DEFAULT 1,
  `activo` tinyint(1) DEFAULT 1,
  `email_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `token_verificacion` varchar(255) DEFAULT NULL,
  `token_verificacion_expira` datetime DEFAULT NULL,
  `token_reset_password` varchar(255) DEFAULT NULL,
  `token_reset_expira` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_alertas_activas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_alertas_activas` (
`id_alerta` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`correo` varchar(150)
,`tipo_alerta` enum('baja','media','alta','critica')
,`tipo_recomendacion` enum('advertencia','critica','informativa')
,`titulo` varchar(200)
,`descripcion` text
,`fecha` date
,`nivel_estres` float
,`nivel_ansiedad` float
,`clasificacion` enum('normal','leve','moderado','alto','muy_alto')
,`emocion_dominante` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_analisis_completos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_analisis_completos` (
`id_analisis` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`correo` varchar(150)
,`nombre_archivo` varchar(255)
,`duracion_audio` float
,`fecha_grabacion` datetime
,`modelo_usado` varchar(100)
,`fecha_analisis` date
,`estado_analisis` enum('procesando','completado','error')
,`duracion_procesamiento` float
,`nivel_estres` float
,`nivel_ansiedad` float
,`clasificacion` enum('normal','leve','moderado','alto','muy_alto')
,`confianza_modelo` float
,`emocion_dominante` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_grupos_estadisticas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_grupos_estadisticas` (
`id_grupo` int(11)
,`nombre_grupo` varchar(200)
,`tipo_grupo` enum('terapia','apoyo','taller','empresa','educativo','familiar','otro')
,`privacidad` enum('publico','privado','por_invitacion')
,`codigo_acceso` varchar(20)
,`facilitador_nombre` varchar(100)
,`facilitador_apellido` varchar(100)
,`facilitador_correo` varchar(150)
,`fecha_creacion` datetime
,`activo` tinyint(1)
,`total_miembros` bigint(21)
,`max_participantes` int(11)
,`miembros_activos` bigint(21)
,`total_actividades` bigint(21)
,`actividades_completadas` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_notificaciones_pendientes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_notificaciones_pendientes` (
`id_notificacion` int(11)
,`id_usuario` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`correo` varchar(150)
,`tipo_notificacion` enum('invitacion_grupo','actividad_grupo','recordatorio_actividad','recomendacion','alerta_critica','mensaje_facilitador','logro_desbloqueado','recordatorio_analisis','actualizacion_grupo','sistema')
,`titulo` varchar(200)
,`mensaje` text
,`icono` varchar(50)
,`url_accion` varchar(500)
,`prioridad` enum('baja','media','alta','urgente')
,`fecha_creacion` datetime
,`horas_sin_leer` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_participacion_grupos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_participacion_grupos` (
`id_grupo_miembro` int(11)
,`id_grupo` int(11)
,`nombre_grupo` varchar(200)
,`tipo_grupo` enum('terapia','apoyo','taller','empresa','educativo','familiar','otro')
,`id_usuario` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`correo` varchar(150)
,`rol_grupo` enum('facilitador','co_facilitador','participante','observador')
,`fecha_ingreso` datetime
,`estado` enum('activo','inactivo','suspendido')
,`actividades_totales` bigint(21)
,`actividades_completadas` bigint(21)
,`porcentaje_completado` decimal(26,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_sesiones_completas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_sesiones_completas` (
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_stats_notificaciones`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_stats_notificaciones` (
`id_usuario` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`total_notificaciones` bigint(21)
,`no_leidas` decimal(22,0)
,`leidas` decimal(22,0)
,`archivadas` decimal(22,0)
,`urgentes_pendientes` decimal(22,0)
,`ultima_notificacion` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_usuarios_estadisticas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_usuarios_estadisticas` (
`id_usuario` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`correo` varchar(150)
,`fecha_registro` date
,`edad` int(11)
,`total_audios` bigint(21)
,`total_analisis` bigint(21)
,`promedio_estres` double
,`promedio_ansiedad` double
,`ultimo_analisis` date
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_alertas_activas`
--
DROP TABLE IF EXISTS `vista_alertas_activas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_alertas_activas`  AS SELECT `al`.`id_alerta` AS `id_alerta`, `u`.`nombre` AS `nombre`, `u`.`apellido` AS `apellido`, `u`.`correo` AS `correo`, `al`.`tipo_alerta` AS `tipo_alerta`, `al`.`tipo_recomendacion` AS `tipo_recomendacion`, `al`.`titulo` AS `titulo`, `al`.`descripcion` AS `descripcion`, `al`.`fecha` AS `fecha`, `ra`.`nivel_estres` AS `nivel_estres`, `ra`.`nivel_ansiedad` AS `nivel_ansiedad`, `ra`.`clasificacion` AS `clasificacion`, `ra`.`emocion_dominante` AS `emocion_dominante` FROM ((((`alerta_analisis` `al` join `resultado_analisis` `ra` on(`al`.`id_resultado` = `ra`.`id_resultado`)) join `analisis` `an` on(`ra`.`id_analisis` = `an`.`id_analisis`)) join `audio` `au` on(`an`.`id_audio` = `au`.`id_audio`)) join `usuario` `u` on(`au`.`id_usuario` = `u`.`id_usuario`)) WHERE `al`.`activo` = 1 AND `al`.`tipo_alerta` in ('alta','critica') ORDER BY `al`.`fecha_creacion` DESC, `al`.`tipo_alerta` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_analisis_completos`
--
DROP TABLE IF EXISTS `vista_analisis_completos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_analisis_completos`  AS SELECT `an`.`id_analisis` AS `id_analisis`, `u`.`nombre` AS `nombre`, `u`.`apellido` AS `apellido`, `u`.`correo` AS `correo`, `au`.`nombre_archivo` AS `nombre_archivo`, `au`.`duracion` AS `duracion_audio`, `au`.`fecha_grabacion` AS `fecha_grabacion`, `an`.`modelo_usado` AS `modelo_usado`, `an`.`fecha_analisis` AS `fecha_analisis`, `an`.`estado_analisis` AS `estado_analisis`, `an`.`duracion_procesamiento` AS `duracion_procesamiento`, `ra`.`nivel_estres` AS `nivel_estres`, `ra`.`nivel_ansiedad` AS `nivel_ansiedad`, `ra`.`clasificacion` AS `clasificacion`, `ra`.`confianza_modelo` AS `confianza_modelo`, `ra`.`emocion_dominante` AS `emocion_dominante` FROM (((`analisis` `an` join `audio` `au` on(`an`.`id_audio` = `au`.`id_audio`)) join `usuario` `u` on(`au`.`id_usuario` = `u`.`id_usuario`)) left join `resultado_analisis` `ra` on(`an`.`id_analisis` = `ra`.`id_analisis`)) WHERE `an`.`activo` = 1 AND `au`.`activo` = 1 ORDER BY `an`.`fecha_analisis` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_grupos_estadisticas`
--
DROP TABLE IF EXISTS `vista_grupos_estadisticas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_grupos_estadisticas`  AS SELECT `g`.`id_grupo` AS `id_grupo`, `g`.`nombre_grupo` AS `nombre_grupo`, `g`.`tipo_grupo` AS `tipo_grupo`, `g`.`privacidad` AS `privacidad`, `g`.`codigo_acceso` AS `codigo_acceso`, `u`.`nombre` AS `facilitador_nombre`, `u`.`apellido` AS `facilitador_apellido`, `u`.`correo` AS `facilitador_correo`, `g`.`fecha_creacion` AS `fecha_creacion`, `g`.`activo` AS `activo`, count(distinct `gm`.`id_usuario`) AS `total_miembros`, `g`.`max_participantes` AS `max_participantes`, count(distinct case when `gm`.`estado` = 'activo' then `gm`.`id_usuario` end) AS `miembros_activos`, count(distinct `ag`.`id_actividad`) AS `total_actividades`, count(distinct case when `ag`.`completada` = 1 then `ag`.`id_actividad` end) AS `actividades_completadas` FROM (((`grupos` `g` join `usuario` `u` on(`g`.`id_facilitador` = `u`.`id_usuario`)) left join `grupo_miembros` `gm` on(`g`.`id_grupo` = `gm`.`id_grupo`)) left join `actividades_grupo` `ag` on(`g`.`id_grupo` = `ag`.`id_grupo`)) WHERE `g`.`activo` = 1 GROUP BY `g`.`id_grupo` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_notificaciones_pendientes`
--
DROP TABLE IF EXISTS `vista_notificaciones_pendientes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_notificaciones_pendientes`  AS SELECT `n`.`id_notificacion` AS `id_notificacion`, `n`.`id_usuario` AS `id_usuario`, `u`.`nombre` AS `nombre`, `u`.`apellido` AS `apellido`, `u`.`correo` AS `correo`, `n`.`tipo_notificacion` AS `tipo_notificacion`, `n`.`titulo` AS `titulo`, `n`.`mensaje` AS `mensaje`, `n`.`icono` AS `icono`, `n`.`url_accion` AS `url_accion`, `n`.`prioridad` AS `prioridad`, `n`.`fecha_creacion` AS `fecha_creacion`, timestampdiff(HOUR,`n`.`fecha_creacion`,current_timestamp()) AS `horas_sin_leer` FROM (`notificaciones` `n` join `usuario` `u` on(`n`.`id_usuario` = `u`.`id_usuario`)) WHERE `n`.`activo` = 1 AND `n`.`leida` = 0 AND `n`.`archivada` = 0 AND (`n`.`fecha_expiracion` is null OR `n`.`fecha_expiracion` > current_timestamp()) ORDER BY `n`.`prioridad` DESC, `n`.`fecha_creacion` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_participacion_grupos`
--
DROP TABLE IF EXISTS `vista_participacion_grupos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_participacion_grupos`  AS SELECT `gm`.`id_grupo_miembro` AS `id_grupo_miembro`, `g`.`id_grupo` AS `id_grupo`, `g`.`nombre_grupo` AS `nombre_grupo`, `g`.`tipo_grupo` AS `tipo_grupo`, `u`.`id_usuario` AS `id_usuario`, `u`.`nombre` AS `nombre`, `u`.`apellido` AS `apellido`, `u`.`correo` AS `correo`, `gm`.`rol_grupo` AS `rol_grupo`, `gm`.`fecha_ingreso` AS `fecha_ingreso`, `gm`.`estado` AS `estado`, count(distinct `pa`.`id_participacion`) AS `actividades_totales`, count(distinct case when `pa`.`completada` = 1 then `pa`.`id_participacion` end) AS `actividades_completadas`, CASE WHEN count(distinct `pa`.`id_participacion`) > 0 THEN round(count(distinct case when `pa`.`completada` = 1 then `pa`.`id_participacion` end) * 100.0 / count(distinct `pa`.`id_participacion`),2) ELSE 0 END AS `porcentaje_completado` FROM ((((`grupo_miembros` `gm` join `grupos` `g` on(`gm`.`id_grupo` = `g`.`id_grupo`)) join `usuario` `u` on(`gm`.`id_usuario` = `u`.`id_usuario`)) left join `participacion_actividad` `pa` on(`gm`.`id_usuario` = `pa`.`id_usuario`)) left join `actividades_grupo` `ag` on(`pa`.`id_actividad` = `ag`.`id_actividad` and `ag`.`id_grupo` = `g`.`id_grupo`)) WHERE `gm`.`activo` = 1 AND `g`.`activo` = 1 GROUP BY `gm`.`id_grupo_miembro` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_sesiones_completas`
--
DROP TABLE IF EXISTS `vista_sesiones_completas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_sesiones_completas`  AS SELECT `sj`.`id` AS `sesion_id`, `sj`.`id_usuario` AS `id_usuario`, `u`.`nombre` AS `usuario_nombre`, `u`.`correo` AS `usuario_correo`, `sj`.`id_juego` AS `id_juego`, `jt`.`nombre` AS `juego_nombre`, `jt`.`tipo_juego` AS `tipo_juego`, `jt`.`objetivo_emocional` AS `objetivo_emocional`, `jt`.`icono` AS `juego_icono`, `sj`.`fecha_inicio` AS `fecha_inicio`, `sj`.`fecha_fin` AS `fecha_fin`, `sj`.`duracion_segundos` AS `duracion_segundos`, concat(floor(`sj`.`duracion_segundos` / 60),'m ',`sj`.`duracion_segundos` MOD 60,'s') AS `duracion_formato`, `sj`.`puntuacion` AS `puntuacion`, `sj`.`nivel_alcanzado` AS `nivel_alcanzado`, `sj`.`completado` AS `completado`, `sj`.`estado_antes` AS `estado_antes`, `sj`.`estado_despues` AS `estado_despues`, `sj`.`mejora_percibida` AS `mejora_percibida`, CASE `sj`.`mejora_percibida` WHEN 'mucho_mejor' THEN 'ðŸ˜Š' WHEN 'mejor' THEN 'ðŸ™‚' WHEN 'igual' THEN 'ðŸ˜' WHEN 'peor' THEN 'ðŸ˜Ÿ' WHEN 'mucho_peor' THEN 'ðŸ˜¢' ELSE 'â“' END AS `emoji_mejora`, `sj`.`notas` AS `notas` FROM ((`sesiones_juego` `sj` join `usuario` `u` on(`sj`.`id_usuario` = `u`.`id_usuario`)) join `juegos_terapeuticos` `jt` on(`sj`.`id_juego` = `jt`.`id`)) ORDER BY `sj`.`fecha_inicio` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_stats_notificaciones`
--
DROP TABLE IF EXISTS `vista_stats_notificaciones`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_stats_notificaciones`  AS SELECT `u`.`id_usuario` AS `id_usuario`, `u`.`nombre` AS `nombre`, `u`.`apellido` AS `apellido`, count(0) AS `total_notificaciones`, sum(case when `n`.`leida` = 0 then 1 else 0 end) AS `no_leidas`, sum(case when `n`.`leida` = 1 then 1 else 0 end) AS `leidas`, sum(case when `n`.`archivada` = 1 then 1 else 0 end) AS `archivadas`, sum(case when `n`.`prioridad` = 'urgente' and `n`.`leida` = 0 then 1 else 0 end) AS `urgentes_pendientes`, max(`n`.`fecha_creacion`) AS `ultima_notificacion` FROM (`usuario` `u` left join `notificaciones` `n` on(`u`.`id_usuario` = `n`.`id_usuario` and `n`.`activo` = 1)) WHERE `u`.`activo` = 1 GROUP BY `u`.`id_usuario` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_usuarios_estadisticas`
--
DROP TABLE IF EXISTS `vista_usuarios_estadisticas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_usuarios_estadisticas`  AS SELECT `u`.`id_usuario` AS `id_usuario`, `u`.`nombre` AS `nombre`, `u`.`apellido` AS `apellido`, `u`.`correo` AS `correo`, `u`.`fecha_registro` AS `fecha_registro`, `u`.`edad` AS `edad`, count(distinct `au`.`id_audio`) AS `total_audios`, count(distinct `an`.`id_analisis`) AS `total_analisis`, avg(`ra`.`nivel_estres`) AS `promedio_estres`, avg(`ra`.`nivel_ansiedad`) AS `promedio_ansiedad`, max(`an`.`fecha_analisis`) AS `ultimo_analisis` FROM (((`usuario` `u` left join `audio` `au` on(`u`.`id_usuario` = `au`.`id_usuario` and `au`.`activo` = 1)) left join `analisis` `an` on(`au`.`id_audio` = `an`.`id_audio` and `an`.`activo` = 1)) left join `resultado_analisis` `ra` on(`an`.`id_analisis` = `ra`.`id_analisis` and `ra`.`activo` = 1)) WHERE `u`.`activo` = 1 GROUP BY `u`.`id_usuario` ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades_grupo`
--
ALTER TABLE `actividades_grupo`
  ADD PRIMARY KEY (`id_actividad`),
  ADD KEY `id_grupo` (`id_grupo`),
  ADD KEY `id_creador` (`id_creador`),
  ADD KEY `idx_tipo_actividad` (`tipo_actividad`),
  ADD KEY `idx_fecha` (`fecha_inicio`);

--
-- Indices de la tabla `alerta_analisis`
--
ALTER TABLE `alerta_analisis`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `id_resultado` (`id_resultado`),
  ADD KEY `idx_alerta_tipo` (`tipo_alerta`,`activo`,`fecha_creacion`),
  ADD KEY `idx_estado_fecha` (`estado_alerta`,`fecha_creacion`);

--
-- Indices de la tabla `analisis`
--
ALTER TABLE `analisis`
  ADD PRIMARY KEY (`id_analisis`),
  ADD KEY `id_audio` (`id_audio`),
  ADD KEY `idx_analisis_estado` (`estado_analisis`,`activo`);

--
-- Indices de la tabla `audio`
--
ALTER TABLE `audio`
  ADD PRIMARY KEY (`id_audio`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_audio_usuario_activo` (`id_usuario`,`activo`,`fecha_grabacion`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id_grupo`),
  ADD UNIQUE KEY `codigo_acceso` (`codigo_acceso`),
  ADD KEY `id_facilitador` (`id_facilitador`),
  ADD KEY `idx_tipo_grupo` (`tipo_grupo`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_grupos_facilitador` (`id_facilitador`,`activo`);

--
-- Indices de la tabla `grupo_miembros`
--
ALTER TABLE `grupo_miembros`
  ADD PRIMARY KEY (`id_grupo_miembro`),
  ADD UNIQUE KEY `unique_grupo_usuario` (`id_grupo`,`id_usuario`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_rol_grupo` (`rol_grupo`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_grupo_miembros_estado` (`id_grupo`,`estado`,`activo`);

--
-- Indices de la tabla `historial_alerta`
--
ALTER TABLE `historial_alerta`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_alerta_fecha` (`id_alerta`,`fecha_accion`);

--
-- Indices de la tabla `juegos_terapeuticos`
--
ALTER TABLE `juegos_terapeuticos`
  ADD PRIMARY KEY (`id_juego`),
  ADD KEY `idx_tipo` (`tipo_juego`),
  ADD KEY `idx_objetivo` (`objetivo_emocional`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `idx_usuario_activo` (`id_usuario`,`activo`,`leida`),
  ADD KEY `idx_tipo` (`tipo_notificacion`),
  ADD KEY `idx_fecha` (`fecha_creacion`),
  ADD KEY `idx_referencia` (`tipo_referencia`,`id_referencia`),
  ADD KEY `idx_prioridad` (`prioridad`,`leida`),
  ADD KEY `idx_notif_usuario_fecha` (`id_usuario`,`fecha_creacion`),
  ADD KEY `idx_notif_tipo_fecha` (`tipo_notificacion`,`fecha_creacion`),
  ADD KEY `idx_notif_leida_activo` (`leida`,`activo`,`fecha_creacion`);

--
-- Indices de la tabla `participacion_actividad`
--
ALTER TABLE `participacion_actividad`
  ADD PRIMARY KEY (`id_participacion`),
  ADD UNIQUE KEY `unique_actividad_usuario` (`id_actividad`,`id_usuario`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_completada` (`completada`);

--
-- Indices de la tabla `plantillas_notificacion`
--
ALTER TABLE `plantillas_notificacion`
  ADD PRIMARY KEY (`id_plantilla`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_tipo` (`tipo_notificacion`);

--
-- Indices de la tabla `preferencias_notificacion`
--
ALTER TABLE `preferencias_notificacion`
  ADD PRIMARY KEY (`id_preferencia`),
  ADD UNIQUE KEY `unique_usuario` (`id_usuario`);

--
-- Indices de la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  ADD PRIMARY KEY (`id_recomendacion`),
  ADD KEY `id_resultado` (`id_resultado`);

--
-- Indices de la tabla `refresh_token`
--
ALTER TABLE `refresh_token`
  ADD PRIMARY KEY (`id_refresh_token`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_expiracion` (`fecha_expiracion`),
  ADD KEY `idx_activo` (`activo`,`revocado`),
  ADD KEY `idx_usuario_activo` (`id_usuario`,`activo`,`revocado`,`fecha_expiracion`);

--
-- Indices de la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `reporte_resultado`
--
ALTER TABLE `reporte_resultado`
  ADD PRIMARY KEY (`id_reporte_resultado`),
  ADD UNIQUE KEY `unique_report_result` (`id_reporte`,`id_resultado`),
  ADD KEY `id_resultado` (`id_resultado`);

--
-- Indices de la tabla `resultado_analisis`
--
ALTER TABLE `resultado_analisis`
  ADD PRIMARY KEY (`id_resultado`),
  ADD KEY `id_analisis` (`id_analisis`),
  ADD KEY `idx_resultado_clasificacion` (`clasificacion`,`activo`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD PRIMARY KEY (`id_rol_usuario`),
  ADD UNIQUE KEY `unique_user_role` (`id_usuario`,`id_rol`),
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `id_admin_asigna` (`id_admin_asigna`);

--
-- Indices de la tabla `sesion`
--
ALTER TABLE `sesion`
  ADD PRIMARY KEY (`id_sesion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_sesion_usuario_activa` (`id_usuario`,`estado`,`activo`);

--
-- Indices de la tabla `sesiones_juego`
--
ALTER TABLE `sesiones_juego`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_juego` (`id_juego`),
  ADD KEY `idx_fecha` (`fecha_inicio`),
  ADD KEY `idx_completado` (`completado`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `google_uid` (`google_uid`),
  ADD KEY `idx_usuario_auth` (`auth_provider`,`google_uid`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades_grupo`
--
ALTER TABLE `actividades_grupo`
  MODIFY `id_actividad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alerta_analisis`
--
ALTER TABLE `alerta_analisis`
  MODIFY `id_alerta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `analisis`
--
ALTER TABLE `analisis`
  MODIFY `id_analisis` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `audio`
--
ALTER TABLE `audio`
  MODIFY `id_audio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id_grupo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grupo_miembros`
--
ALTER TABLE `grupo_miembros`
  MODIFY `id_grupo_miembro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_alerta`
--
ALTER TABLE `historial_alerta`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `juegos_terapeuticos`
--
ALTER TABLE `juegos_terapeuticos`
  MODIFY `id_juego` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `participacion_actividad`
--
ALTER TABLE `participacion_actividad`
  MODIFY `id_participacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plantillas_notificacion`
--
ALTER TABLE `plantillas_notificacion`
  MODIFY `id_plantilla` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preferencias_notificacion`
--
ALTER TABLE `preferencias_notificacion`
  MODIFY `id_preferencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  MODIFY `id_recomendacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `refresh_token`
--
ALTER TABLE `refresh_token`
  MODIFY `id_refresh_token` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reporte`
--
ALTER TABLE `reporte`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reporte_resultado`
--
ALTER TABLE `reporte_resultado`
  MODIFY `id_reporte_resultado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resultado_analisis`
--
ALTER TABLE `resultado_analisis`
  MODIFY `id_resultado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  MODIFY `id_rol_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesion`
--
ALTER TABLE `sesion`
  MODIFY `id_sesion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones_juego`
--
ALTER TABLE `sesiones_juego`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividades_grupo`
--
ALTER TABLE `actividades_grupo`
  ADD CONSTRAINT `actividades_grupo_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE,
  ADD CONSTRAINT `actividades_grupo_ibfk_2` FOREIGN KEY (`id_creador`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `alerta_analisis`
--
ALTER TABLE `alerta_analisis`
  ADD CONSTRAINT `alerta_analisis_ibfk_1` FOREIGN KEY (`id_resultado`) REFERENCES `resultado_analisis` (`id_resultado`) ON DELETE CASCADE;

--
-- Filtros para la tabla `analisis`
--
ALTER TABLE `analisis`
  ADD CONSTRAINT `analisis_ibfk_1` FOREIGN KEY (`id_audio`) REFERENCES `audio` (`id_audio`) ON DELETE CASCADE;

--
-- Filtros para la tabla `audio`
--
ALTER TABLE `audio`
  ADD CONSTRAINT `audio_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `grupos_ibfk_1` FOREIGN KEY (`id_facilitador`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `grupo_miembros`
--
ALTER TABLE `grupo_miembros`
  ADD CONSTRAINT `grupo_miembros_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE,
  ADD CONSTRAINT `grupo_miembros_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `historial_alerta`
--
ALTER TABLE `historial_alerta`
  ADD CONSTRAINT `historial_alerta_ibfk_1` FOREIGN KEY (`id_alerta`) REFERENCES `alerta_analisis` (`id_alerta`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `participacion_actividad`
--
ALTER TABLE `participacion_actividad`
  ADD CONSTRAINT `participacion_actividad_ibfk_1` FOREIGN KEY (`id_actividad`) REFERENCES `actividades_grupo` (`id_actividad`) ON DELETE CASCADE,
  ADD CONSTRAINT `participacion_actividad_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `preferencias_notificacion`
--
ALTER TABLE `preferencias_notificacion`
  ADD CONSTRAINT `preferencias_notificacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  ADD CONSTRAINT `recomendaciones_ibfk_1` FOREIGN KEY (`id_resultado`) REFERENCES `resultado_analisis` (`id_resultado`) ON DELETE CASCADE;

--
-- Filtros para la tabla `refresh_token`
--
ALTER TABLE `refresh_token`
  ADD CONSTRAINT `refresh_token_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reporte_resultado`
--
ALTER TABLE `reporte_resultado`
  ADD CONSTRAINT `reporte_resultado_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reporte` (`id_reporte`) ON DELETE CASCADE,
  ADD CONSTRAINT `reporte_resultado_ibfk_2` FOREIGN KEY (`id_resultado`) REFERENCES `resultado_analisis` (`id_resultado`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resultado_analisis`
--
ALTER TABLE `resultado_analisis`
  ADD CONSTRAINT `resultado_analisis_ibfk_1` FOREIGN KEY (`id_analisis`) REFERENCES `analisis` (`id_analisis`) ON DELETE CASCADE;

--
-- Filtros para la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD CONSTRAINT `rol_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `rol_usuario_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE,
  ADD CONSTRAINT `rol_usuario_ibfk_3` FOREIGN KEY (`id_admin_asigna`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `sesion`
--
ALTER TABLE `sesion`
  ADD CONSTRAINT `sesion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sesiones_juego`
--
ALTER TABLE `sesiones_juego`
  ADD CONSTRAINT `sesiones_juego_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `sesiones_juego_ibfk_2` FOREIGN KEY (`id_juego`) REFERENCES `juegos_terapeuticos` (`id_juego`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
