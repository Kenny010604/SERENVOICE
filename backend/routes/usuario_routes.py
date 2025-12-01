# backend/routes/usuario_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.usuario_service import UsuarioService
from utils.helpers import Helpers
from utils.seguridad import role_required

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
    
    return Helpers.format_response(
        success=True,
        data=usuario,
        status=200
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