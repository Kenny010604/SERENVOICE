# backend/services/usuario_service.py
from models.usuario import Usuario
from utils.seguridad import Seguridad

class UsuarioService:
    """Servicio de gestión de usuarios"""
    
    @staticmethod
    def get_usuario_by_id(id_usuario):
        """Obtener usuario por ID"""
        return Usuario.get_by_id(id_usuario)
    
    @staticmethod
    def get_usuario_with_stats(id_usuario):
        """Obtener usuario con estadísticas"""
        return Usuario.get_with_stats(id_usuario)
    
    @staticmethod
    def get_all_usuarios(page=1, per_page=20):
        """Obtener todos los usuarios paginados"""
        offset = (page - 1) * per_page
        usuarios = Usuario.get_all(limit=per_page, offset=offset)
        
        # Ocultar contraseñas
        for usuario in usuarios:
            usuario.pop('contraseña', None)
        
        return usuarios
    
    @staticmethod
    def update_usuario(id_usuario, data):
        """Actualizar usuario"""
        update_data = {}
        
        # Campos permitidos para actualizar
        allowed_fields = [
    'nombre', 
    'apellido', 
    'correo', 
    'genero', 
    'fecha_nacimiento',
    'usa_medicamentos'
]

        
        for field in allowed_fields:
            if field in data:
                if field in ['nombre', 'apellido']:
                    update_data[field] = Seguridad.sanitize_input(data[field])
                else:
                    update_data[field] = data[field]
        
        # Actualizar contraseña si se proporciona
        if 'contraseña' in data:
            is_valid, message = Seguridad.validate_password_strength(data['contraseña'])
            if not is_valid:
                return {'success': False, 'error': message}
            update_data['contraseña'] = Seguridad.hash_password(data['contraseña'])
        
        if Usuario.update(id_usuario, **update_data):
            return {'success': True, 'message': 'Usuario actualizado exitosamente'}
        
        return {'success': False, 'error': 'Error al actualizar usuario'}
    
    @staticmethod
    def delete_usuario(id_usuario):
        """Eliminar usuario"""
        if Usuario.delete(id_usuario):
            return {'success': True, 'message': 'Usuario eliminado exitosamente'}
        return {'success': False, 'error': 'Error al eliminar usuario'}