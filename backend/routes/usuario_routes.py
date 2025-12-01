# backend/routes/usuario_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.usuario_service import UsuarioService
from utils.helpers import Helpers
from utils.seguridad import role_required
from database.connection import DatabaseConnection

bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtener información del usuario actual"""
    user_id = get_jwt_identity()
    usuario = UsuarioService.get_usuario_with_stats(user_id)
    
    if not usuario:
        return Helpers.format_response(
            success=False,
            message='Usuario no encontrado',
            status=404
        )
    
    # Ocultar contraseña
    usuario.pop('contraseña', None)
    usuario.pop('contrasena', None)
    
    return Helpers.format_response(
        success=True,
        data=usuario,
        status=200
    )

@bp.route('/statistics', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_statistics():
    """Obtener estadísticas del sistema (solo admin)"""
    try:
        # Usar context manager correctamente
        with DatabaseConnection.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Total usuarios
            cursor.execute("SELECT COUNT(*) AS total FROM usuario")
            total_usuarios = cursor.fetchone()["total"]

            # Usuarios activos
            try:
                cursor.execute("""
                    SELECT COUNT(*) AS total 
                    FROM usuario 
                    WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                """)
                usuarios_activos = cursor.fetchone()["total"]
            except:
                usuarios_activos = total_usuarios

            # Total usuarios que usan medicamentos
            try:
                cursor.execute("SELECT COUNT(*) AS total FROM usuario WHERE usa_medicamentos = TRUE")
                total_medicamentos = cursor.fetchone()["total"]
            except:
                total_medicamentos = 0

            # Alertas activas
            try:
                cursor.execute("SELECT COUNT(*) AS total FROM alertas WHERE estado = 'activa'")
                alertas_activas = cursor.fetchone()["total"]
            except:
                alertas_activas = 0

            # Reportes pendientes
            try:
                cursor.execute("SELECT COUNT(*) AS total FROM reportes WHERE estado = 'pendiente'")
                reportes_respuesta = cursor.fetchone()["total"]
            except:
                reportes_respuesta = 0

            cursor.close()

        # Calcular tasa de actividad
        tasa_actividad = 0
        if total_usuarios > 0:
            tasa_actividad = round((usuarios_activos / total_usuarios) * 100, 1)

        return Helpers.format_response(
            success=True,
            data={
                'totalUsuarios': total_usuarios,
                'usuariosActivos': usuarios_activos,
                'usuariosUsan_medicamentos': total_medicamentos,
                'alertasActivas': alertas_activas,
                'reportesRespuesta': reportes_respuesta,
                'tasaActividad': tasa_actividad
            },
            status=200
        )

    except Exception as e:
        print(f"❌ Error en statistics: {str(e)}")
        import traceback
        traceback.print_exc()
        return Helpers.format_response(
            success=False,
            message=str(e),
            status=500
        )

@bp.route('/<int:id_usuario>', methods=['GET'])
@jwt_required()
def get_usuario(id_usuario):
    """Obtener usuario por ID"""
    current_user_id = get_jwt_identity()
    
    # Solo el mismo usuario o admin puede ver la info
    current_user = UsuarioService.get_usuario_by_id(current_user_id)
    
    if current_user_id != id_usuario and current_user['rol'] != 'admin':
        return Helpers.format_response(
            success=False,
            message='No tienes permisos para ver este usuario',
            status=403
        )
    
    usuario = UsuarioService.get_usuario_with_stats(id_usuario)
    
    if not usuario:
        return Helpers.format_response(
            success=False,
            message='Usuario no encontrado',
            status=404
        )
    
    usuario.pop('contraseña', None)
    usuario.pop('contrasena', None)
    
    return Helpers.format_response(
        success=True,
        data=usuario,
        status=200
    )

@bp.route('/', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_usuarios():
    """Obtener todos los usuarios (solo admin)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    usuarios = UsuarioService.get_all_usuarios(page, per_page)
    
    return Helpers.format_response(
        success=True,
        data=Helpers.paginate_results(usuarios, page, per_page),
        status=200
    )

@bp.route('/<int:id_usuario>', methods=['PUT'])
@jwt_required()
def update_usuario(id_usuario):
    """Actualizar usuario"""
    current_user_id = get_jwt_identity()
    current_user = UsuarioService.get_usuario_by_id(current_user_id)
    
    # Solo el mismo usuario o admin puede actualizar
    if current_user_id != id_usuario and current_user['rol'] != 'admin':
        return Helpers.format_response(
            success=False,
            message='No tienes permisos para actualizar este usuario',
            status=403
        )
    
    data = request.json
    result = UsuarioService.update_usuario(id_usuario, data)
    
    if result['success']:
        return Helpers.format_response(
            success=True,
            message=result['message'],
            status=200
        )
    
    return Helpers.format_response(
        success=False,
        message=result['error'],
        status=400
    )

@bp.route('/<int:id_usuario>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_usuario(id_usuario):
    """Eliminar usuario (solo admin)"""
    result = UsuarioService.delete_usuario(id_usuario)
    
    if result['success']:
        return Helpers.format_response(
            success=True,
            message=result['message'],
            status=200
        )
    
    return Helpers.format_response(
        success=False,
        message=result['error'],
        status=400
        )