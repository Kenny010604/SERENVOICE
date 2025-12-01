# backend/models/rol_usuario.py
from database.connection import DatabaseConnection

class RolUsuario:
    """Modelo para la tabla Rol_Usuario"""
    
    @staticmethod
    def assign_role(id_usuario, id_rol):
        """Asignar rol a usuario"""
        query = "INSERT INTO Rol_Usuario (id_usuario, id_rol) VALUES (%s, %s)"
        return DatabaseConnection.execute_query(query, (id_usuario, id_rol), fetch=False)
    
    @staticmethod
    def remove_role(id_usuario, id_rol):
        """Remover rol de usuario"""
        query = "DELETE FROM Rol_Usuario WHERE id_usuario = %s AND id_rol = %s"
        DatabaseConnection.execute_query(query, (id_usuario, id_rol), fetch=False)
        return True
    
    @staticmethod
    def get_user_roles(id_usuario):
        """Obtener roles de un usuario"""
        query = """
            SELECT r.* FROM Rol r
            JOIN Rol_Usuario ru ON r.id_rol = ru.id_rol
            WHERE ru.id_usuario = %s
        """
        return DatabaseConnection.execute_query(query, (id_usuario,))
    
    @staticmethod
    def get_users_by_role(id_rol):
        """Obtener usuarios con un rol específico"""
        query = """
            SELECT u.* FROM Usuario u
            JOIN Rol_Usuario ru ON u.id_usuario = ru.id_usuario
            WHERE ru.id_rol = %s
        """
        return DatabaseConnection.execute_query(query, (id_rol,))