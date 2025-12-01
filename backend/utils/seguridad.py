# utils/seguridad.py
import re
import bcrypt
import html
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

class Seguridad:

    # ----------------------------
    # VALIDAR EMAIL
    # ----------------------------
    @staticmethod
    def validate_email(email: str) -> bool:
        """Valida que el correo tenga un formato correcto."""
        if not email:
            return False
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, email) is not None

    # ----------------------------
    # VALIDAR FUERZA DE CONTRASEÑA
    # ----------------------------
    @staticmethod
    def validate_password_strength(password: str):
        """
        Reglas:
        - Min 8 caracteres
        - Una mayúscula
        - Una minúscula
        - Un número
        """
        if len(password) < 8:
            return False, "La contraseña debe tener mínimo 8 caracteres"

        if not re.search(r"[A-Z]", password):
            return False, "La contraseña debe tener al menos una letra mayúscula"

        if not re.search(r"[a-z]", password):
            return False, "La contraseña debe tener al menos una letra minúscula"

        if not re.search(r"[0-9]", password):
            return False, "La contraseña debe tener al menos un número"

        return True, "Contraseña válida"

    # ----------------------------
    # HASH DE CONTRASEÑA
    # ----------------------------
    @staticmethod
    def hash_password(password: str) -> str:
        """Genera un hash seguro para almacenar contraseñas."""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # ----------------------------
    # VERIFICAR CONTRASEÑA
    # ----------------------------
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verifica si la contraseña ingresada coincide con el hash."""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except:
            return False

    # ----------------------------
    # LIMPIAR INPUT
    # ----------------------------
    @staticmethod
    def sanitize_input(value: str) -> str:
        """Evita XSS limpiando caracteres peligrosos."""
        if not value:
            return value
        return html.escape(value.strip())


# ----------------------------
# DECORADOR PARA ROLES
# ----------------------------
def role_required(required_role):
    """
    Decorador para verificar que el usuario tenga el rol requerido
    Uso: @role_required('admin')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                # Importación local para evitar dependencias circulares
                from services.usuario_service import UsuarioService
                
                # Obtener el ID del usuario del token JWT
                current_user_id = get_jwt_identity()
                
                if not current_user_id:
                    return jsonify({
                        'success': False,
                        'message': 'Token inválido o no proporcionado'
                    }), 401
                
                # Obtener información del usuario
                user = UsuarioService.get_usuario_by_id(current_user_id)
                
                print(f"[DEBUG] Usuario obtenido: {user}")  # ← Log para debug
                
                if not user:
                    return jsonify({
                        'success': False,
                        'message': 'Usuario no encontrado'
                    }), 404
                
                # Verificar que el usuario tenga el campo 'rol'
                user_role = user.get('rol') if isinstance(user, dict) else getattr(user, 'rol', None)
                
                if not user_role:
                    return jsonify({
                        'success': False,
                        'message': 'El usuario no tiene un rol asignado'
                    }), 403
                
                # Verificar el rol
                if user_role != required_role:
                    return jsonify({
                        'success': False,
                        'message': f'Se requiere rol de {required_role}. Tu rol es: {user_role}'
                    }), 403
                
                return fn(*args, **kwargs)
                
            except Exception as e:
                print(f"[ERROR] Error en role_required: {str(e)}")  # ← Log para debug
                return jsonify({
                    'success': False,
                    'message': f'Error al verificar permisos: {str(e)}'
                }), 500
        
        return wrapper
    return decorator