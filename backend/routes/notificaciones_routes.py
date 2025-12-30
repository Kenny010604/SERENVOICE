# backend/routes/notificaciones_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.notificaciones_service import NotificacionesService
from utils.helpers import Helpers

bp = Blueprint('notificaciones', __name__, url_prefix='/api/notificaciones')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Obtener notificaciones del usuario actual"""
    try:
        user_id = get_jwt_identity()
        
        # Parámetros opcionales
        limit = request.args.get('limit', 50, type=int)
        only_unread = request.args.get('only_unread', 'false').lower() == 'true'
        
        notificaciones = NotificacionesService.obtener_notificaciones_usuario(
            user_id, limit=limit, only_unread=only_unread
        )
        
        return Helpers.format_response(
            success=True,
            data=notificaciones,
            message='Notificaciones obtenidas correctamente',
            status=200
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al obtener notificaciones: {str(e)}',
            status=500
        )

@bp.route('/count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Obtener contador de notificaciones no leídas"""
    try:
        user_id = get_jwt_identity()
        count = NotificacionesService.obtener_contador_no_leidas(user_id)
        
        return Helpers.format_response(
            success=True,
            data={'count': count},
            status=200
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al contar notificaciones: {str(e)}',
            status=500
        )

@bp.route('/<int:id_notificacion>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(id_notificacion):
    """Marcar notificación como leída"""
    try:
        user_id = get_jwt_identity()
        result = NotificacionesService.marcar_como_leida(id_notificacion, user_id)
        
        if result:
            return Helpers.format_response(
                success=True,
                message='Notificación marcada como leída',
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se pudo marcar la notificación como leída',
                status=400
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

@bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    """Marcar todas las notificaciones como leídas"""
    try:
        user_id = get_jwt_identity()
        result = NotificacionesService.marcar_todas_como_leidas(user_id)
        
        if result:
            return Helpers.format_response(
                success=True,
                message='Todas las notificaciones marcadas como leídas',
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se pudieron marcar las notificaciones',
                status=400
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

@bp.route('/<int:id_notificacion>/archive', methods=['PUT'])
@jwt_required()
def archive_notification(id_notificacion):
    """Archivar una notificación"""
    try:
        user_id = get_jwt_identity()
        result = NotificacionesService.archivar_notificacion(id_notificacion, user_id)
        
        if result:
            return Helpers.format_response(
                success=True,
                message='Notificación archivada',
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se pudo archivar la notificación',
                status=400
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

@bp.route('/<int:id_notificacion>', methods=['DELETE'])
@jwt_required()
def delete_notification(id_notificacion):
    """Eliminar una notificación"""
    try:
        user_id = get_jwt_identity()
        result = NotificacionesService.eliminar_notificacion(id_notificacion, user_id)
        
        if result:
            return Helpers.format_response(
                success=True,
                message='Notificación eliminada',
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se pudo eliminar la notificación',
                status=400
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

@bp.route('/urgent', methods=['GET'])
@jwt_required()
def get_urgent_notifications():
    """Obtener notificaciones urgentes"""
    try:
        user_id = get_jwt_identity()
        notificaciones = NotificacionesService.obtener_notificaciones_urgentes(user_id)
        
        return Helpers.format_response(
            success=True,
            data=notificaciones,
            status=200
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

# ============================================
# ENDPOINTS DE PREFERENCIAS
# ============================================

@bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Obtener preferencias de notificación del usuario"""
    try:
        user_id = get_jwt_identity()
        preferences = NotificacionesService.obtener_preferencias(user_id)
        
        if preferences:
            return Helpers.format_response(
                success=True,
                data=preferences,
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se encontraron preferencias',
                status=404
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

@bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Actualizar preferencias de notificación"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return Helpers.format_response(
                success=False,
                message='No se enviaron datos',
                status=400
            )
        
        result = NotificacionesService.actualizar_preferencias(user_id, data)
        
        if result:
            return Helpers.format_response(
                success=True,
                message='Preferencias actualizadas correctamente',
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se pudieron actualizar las preferencias',
                status=400
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

@bp.route('/pause', methods=['POST'])
@jwt_required()
def pause_notifications():
    """Pausar notificaciones temporalmente"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        horas = data.get('horas')  # None = pausar indefinidamente
        
        result = NotificacionesService.pausar_notificaciones(user_id, horas)
        
        if result:
            message = f'Notificaciones pausadas por {horas} horas' if horas else 'Notificaciones pausadas'
            return Helpers.format_response(
                success=True,
                message=message,
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se pudieron pausar las notificaciones',
                status=400
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )

@bp.route('/resume', methods=['POST'])
@jwt_required()
def resume_notifications():
    """Reanudar notificaciones"""
    try:
        user_id = get_jwt_identity()
        result = NotificacionesService.reanudar_notificaciones(user_id)
        
        if result:
            return Helpers.format_response(
                success=True,
                message='Notificaciones reanudadas',
                status=200
            )
        else:
            return Helpers.format_response(
                success=False,
                message='No se pudieron reanudar las notificaciones',
                status=400
            )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error: {str(e)}',
            status=500
        )


# ============================================
# GESTIÓN DE PLANTILLAS (ADMIN)
# ============================================
from utils.seguridad import role_required
from database.connection import DatabaseConnection

@bp.route('/plantillas', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_plantillas():
    """Obtener todas las plantillas de notificaciones"""
    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM plantillas_notificacion 
            ORDER BY prioridad_defecto DESC, fecha_creacion DESC
        """)
        
        plantillas = cursor.fetchall()
        
        cursor.close()
        DatabaseConnection.return_connection(conn)
        
        return Helpers.format_response(
            success=True,
            data=plantillas,
            status=200
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al obtener plantillas: {str(e)}',
            status=500
        )

@bp.route('/plantillas', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def create_plantilla():
    """Crear nueva plantilla de notificación"""
    try:
        data = request.json
        
        if not data or 'nombre' not in data or 'contenido' not in data:
            return Helpers.format_response(
                success=False,
                message='Nombre y contenido son requeridos',
                status=400
            )
        
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO plantillas_notificacion 
            (tipo_notificacion, titulo_plantilla, mensaje_plantilla, prioridad_defecto, activa)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data.get('tipo_notificacion', 'sistema'),
            data.get('titulo_plantilla', ''),
            data.get('mensaje_plantilla', ''),
            data.get('prioridad_defecto', 'media'),
            data.get('activa', True)
        ))
        
        conn.commit()
        id_plantilla = cursor.lastrowid
        
        cursor.close()
        DatabaseConnection.return_connection(conn)
        
        return Helpers.format_response(
            success=True,
            data={'id_plantilla': id_plantilla},
            message='Plantilla creada correctamente',
            status=201
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al crear plantilla: {str(e)}',
            status=500
        )

@bp.route('/plantillas/<int:id_plantilla>', methods=['PUT'])
@jwt_required()
@role_required(['admin'])
def update_plantilla(id_plantilla):
    """Actualizar plantilla de notificación"""
    try:
        data = request.json
        
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE plantillas_notificacion
            SET tipo_notificacion = %s, titulo_plantilla = %s, mensaje_plantilla = %s, prioridad_defecto = %s, activa = %s
            WHERE id_plantilla = %s
        """, (
            data.get('tipo_notificacion'),
            data.get('titulo_plantilla'),
            data.get('mensaje_plantilla'),
            data.get('prioridad_defecto'),
            data.get('activa'),
            id_plantilla
        ))
        
        conn.commit()
        
        cursor.close()
        DatabaseConnection.return_connection(conn)
        
        return Helpers.format_response(
            success=True,
            message='Plantilla actualizada correctamente',
            status=200
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al actualizar plantilla: {str(e)}',
            status=500
        )

@bp.route('/plantillas/<int:id_plantilla>', methods=['DELETE'])
@jwt_required()
@role_required(['admin'])
def delete_plantilla(id_plantilla):
    """Eliminar plantilla de notificación"""
    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM plantillas_notificacion WHERE id_plantilla = %s", (id_plantilla,))
        
        conn.commit()
        
        cursor.close()
        DatabaseConnection.return_connection(conn)
        
        return Helpers.format_response(
            success=True,
            message='Plantilla eliminada correctamente',
            status=200
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al eliminar plantilla: {str(e)}',
            status=500
        )

@bp.route('/plantillas/<int:id_plantilla>/toggle', methods=['PATCH'])
@jwt_required()
@role_required(['admin'])
def toggle_plantilla(id_plantilla):
    """Activar/desactivar plantilla de notificación"""
    try:
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE plantillas_notificacion
            SET activa = NOT activa
            WHERE id_plantilla = %s
        """, (id_plantilla,))
        
        conn.commit()
        
        cursor.close()
        DatabaseConnection.return_connection(conn)
        
        return Helpers.format_response(
            success=True,
            message='Estado de plantilla actualizado',
            status=200
        )
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al cambiar estado: {str(e)}',
            status=500
        )
