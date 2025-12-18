# backend/services/notificaciones_service.py
from models.notificacion import Notificacion
from models.preferencia_notificacion import PreferenciaNotificacion
from datetime import datetime, timedelta
import json

class NotificacionesService:
    """Servicio para gestionar notificaciones"""
    
    @staticmethod
    def crear_notificacion(id_usuario, tipo_notificacion, titulo, mensaje, **kwargs):
        """
        Crear una notificación nueva
        kwargs puede incluir: icono, url_accion, id_referencia, tipo_referencia, 
        metadata, prioridad, fecha_expiracion
        """
        try:
            # Verificar preferencias del usuario
            can_send = PreferenciaNotificacion.can_send_notification(
                id_usuario, tipo_notificacion, 'app'
            )
            
            if not can_send and kwargs.get('prioridad') != 'urgente':
                return None  # No enviar si el usuario no lo permite (excepto urgentes)
            
            # Crear la notificación
            result = Notificacion.create(
                id_usuario=id_usuario,
                tipo_notificacion=tipo_notificacion,
                titulo=titulo,
                mensaje=mensaje,
                **kwargs
            )
            
            return result
        except Exception as e:
            print(f"Error al crear notificación: {str(e)}")
            return None
    
    @staticmethod
    def obtener_notificaciones_usuario(id_usuario, limit=50, only_unread=False):
        """Obtener notificaciones de un usuario"""
        try:
            notificaciones = Notificacion.get_user_notifications(
                id_usuario, limit=limit, only_unread=only_unread
            )
            
            # Formatear las notificaciones
            formatted = []
            for notif in notificaciones:
                notif_dict = dict(notif)
                
                # Parsear metadata si existe
                if notif_dict.get('metadata'):
                    try:
                        notif_dict['metadata'] = json.loads(notif_dict['metadata'])
                    except:
                        pass
                
                # Calcular tiempo transcurrido
                if notif_dict.get('fecha_creacion'):
                    notif_dict['tiempo_transcurrido'] = NotificacionesService._calcular_tiempo(
                        notif_dict['fecha_creacion']
                    )
                
                formatted.append(notif_dict)
            
            return formatted
        except Exception as e:
            print(f"Error al obtener notificaciones: {str(e)}")
            return []
    
    @staticmethod
    def obtener_contador_no_leidas(id_usuario):
        """Obtener el número de notificaciones no leídas"""
        try:
            return Notificacion.get_unread_count(id_usuario)
        except Exception as e:
            print(f"Error al contar notificaciones no leídas: {str(e)}")
            return 0
    
    @staticmethod
    def marcar_como_leida(id_notificacion, id_usuario):
        """Marcar una notificación como leída"""
        try:
            return Notificacion.mark_as_read(id_notificacion, id_usuario)
        except Exception as e:
            print(f"Error al marcar como leída: {str(e)}")
            return False
    
    @staticmethod
    def marcar_todas_como_leidas(id_usuario):
        """Marcar todas las notificaciones como leídas"""
        try:
            return Notificacion.mark_all_as_read(id_usuario)
        except Exception as e:
            print(f"Error al marcar todas como leídas: {str(e)}")
            return False
    
    @staticmethod
    def archivar_notificacion(id_notificacion, id_usuario):
        """Archivar una notificación"""
        try:
            return Notificacion.archive(id_notificacion, id_usuario)
        except Exception as e:
            print(f"Error al archivar notificación: {str(e)}")
            return False
    
    @staticmethod
    def eliminar_notificacion(id_notificacion, id_usuario):
        """Eliminar una notificación"""
        try:
            return Notificacion.delete(id_notificacion, id_usuario)
        except Exception as e:
            print(f"Error al eliminar notificación: {str(e)}")
            return False
    
    @staticmethod
    def obtener_notificaciones_urgentes(id_usuario):
        """Obtener notificaciones urgentes"""
        try:
            return Notificacion.get_urgent_notifications(id_usuario)
        except Exception as e:
            print(f"Error al obtener notificaciones urgentes: {str(e)}")
            return []
    
    @staticmethod
    def obtener_preferencias(id_usuario):
        """Obtener preferencias de notificación del usuario"""
        try:
            print(f"[DEBUG] Obteniendo preferencias para usuario: {id_usuario}")
            preferences = PreferenciaNotificacion.get_by_user(id_usuario)
            print(f"[DEBUG] Preferencias obtenidas: {preferences}")
            
            if not preferences:
                # Crear preferencias por defecto
                print(f"[DEBUG] Creando preferencias por defecto para usuario: {id_usuario}")
                PreferenciaNotificacion.create_default(id_usuario)
                preferences = PreferenciaNotificacion.get_by_user(id_usuario)
                print(f"[DEBUG] Preferencias creadas: {preferences}")
            
            if preferences:
                # Convertir timedelta a string para JSON serialization
                pref_dict = dict(preferences)
                from datetime import timedelta
                if isinstance(pref_dict.get('horario_inicio'), timedelta):
                    total_seconds = int(pref_dict['horario_inicio'].total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    pref_dict['horario_inicio'] = f"{hours:02d}:{minutes:02d}:00"
                
                if isinstance(pref_dict.get('horario_fin'), timedelta):
                    total_seconds = int(pref_dict['horario_fin'].total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    pref_dict['horario_fin'] = f"{hours:02d}:{minutes:02d}:00"
                
                return pref_dict
            
            return None
        except Exception as e:
            print(f"Error al obtener preferencias: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def actualizar_preferencias(id_usuario, preferences):
        """Actualizar preferencias de notificación"""
        try:
            # Verificar si existen preferencias
            existing = PreferenciaNotificacion.get_by_user(id_usuario)
            
            if not existing:
                # Crear preferencias por defecto primero
                PreferenciaNotificacion.create_default(id_usuario)
            
            # Actualizar
            return PreferenciaNotificacion.update(id_usuario, preferences)
        except Exception as e:
            print(f"Error al actualizar preferencias: {str(e)}")
            return False
    
    @staticmethod
    def pausar_notificaciones(id_usuario, horas=None):
        """Pausar notificaciones temporalmente"""
        try:
            pause_until = None
            if horas:
                pause_until = datetime.now() + timedelta(hours=horas)
            
            return PreferenciaNotificacion.pause_notifications(id_usuario, pause_until)
        except Exception as e:
            print(f"Error al pausar notificaciones: {str(e)}")
            return False
    
    @staticmethod
    def reanudar_notificaciones(id_usuario):
        """Reanudar notificaciones"""
        try:
            return PreferenciaNotificacion.resume_notifications(id_usuario)
        except Exception as e:
            print(f"Error al reanudar notificaciones: {str(e)}")
            return False
    
    @staticmethod
    def _calcular_tiempo(fecha_creacion):
        """Calcular el tiempo transcurrido desde la creación"""
        now = datetime.now()
        diff = now - fecha_creacion
        
        seconds = diff.total_seconds()
        
        if seconds < 60:
            return "Ahora"
        elif seconds < 3600:
            mins = int(seconds / 60)
            return f"Hace {mins} min" if mins == 1 else f"Hace {mins} mins"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"Hace {hours} hora" if hours == 1 else f"Hace {hours} horas"
        elif seconds < 604800:
            days = int(seconds / 86400)
            return f"Hace {days} día" if days == 1 else f"Hace {days} días"
        else:
            return fecha_creacion.strftime("%d/%m/%Y")
    
    # ============================================
    # Métodos de ayuda para crear notificaciones específicas
    # ============================================
    
    @staticmethod
    def notificar_invitacion_grupo(id_usuario, id_grupo, nombre_grupo, nombre_facilitador):
        """Crear notificación de invitación a grupo"""
        return NotificacionesService.crear_notificacion(
            id_usuario=id_usuario,
            tipo_notificacion='invitacion_grupo',
            titulo=f'Invitación a {nombre_grupo}',
            mensaje=f'{nombre_facilitador} te ha invitado a unirte al grupo "{nombre_grupo}". ¡Únete para participar en actividades terapéuticas!',
            icono='👥',
            url_accion=f'/grupos/invitacion/{id_grupo}',
            id_referencia=id_grupo,
            tipo_referencia='grupo',
            prioridad='alta'
        )
    
    @staticmethod
    def notificar_nueva_actividad(id_usuario, id_grupo, id_actividad, titulo_actividad, nombre_grupo):
        """Crear notificación de nueva actividad"""
        return NotificacionesService.crear_notificacion(
            id_usuario=id_usuario,
            tipo_notificacion='actividad_grupo',
            titulo=f'Nueva actividad: {titulo_actividad}',
            mensaje=f'Se ha creado una nueva actividad en {nombre_grupo}.',
            icono='📋',
            url_accion=f'/grupos/{id_grupo}/actividades/{id_actividad}',
            id_referencia=id_actividad,
            tipo_referencia='actividad',
            prioridad='media'
        )
    
    @staticmethod
    def notificar_recomendacion(id_usuario, id_recomendacion, tipo_recomendacion):
        """Crear notificación de nueva recomendación"""
        return NotificacionesService.crear_notificacion(
            id_usuario=id_usuario,
            tipo_notificacion='recomendacion',
            titulo='Nueva recomendación personalizada',
            mensaje=f'Basado en tu último análisis, tenemos una recomendación de tipo {tipo_recomendacion} para ti.',
            icono='💡',
            url_accion=f'/recomendaciones/{id_recomendacion}',
            id_referencia=id_recomendacion,
            tipo_referencia='recomendacion',
            prioridad='media'
        )
    
    @staticmethod
    def notificar_alerta_critica(id_usuario, id_alerta, titulo_alerta, mensaje_alerta):
        """Crear notificación de alerta crítica"""
        return NotificacionesService.crear_notificacion(
            id_usuario=id_usuario,
            tipo_notificacion='alerta_critica',
            titulo=f'⚠️ {titulo_alerta}',
            mensaje=f'{mensaje_alerta}. Te recomendamos considerar apoyo profesional.',
            icono='🚨',
            url_accion=f'/alertas/{id_alerta}',
            id_referencia=id_alerta,
            tipo_referencia='alerta',
            prioridad='urgente'
        )
