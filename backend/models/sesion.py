# backend/models/sesion.py
from database.connection import DatabaseConnection
from datetime import datetime

class Sesion:
    """Modelo para la tabla Sesion"""
    
    @staticmethod
    def create(id_usuario, estado='activa'):
        """Crear nueva sesión"""
        query = """
            INSERT INTO Sesion (id_usuario, fecha_inicio, estado)
            VALUES (%s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query, 
            (id_usuario, datetime.now(), estado),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_sesion):
        """Obtener sesión por ID"""
        query = "SELECT * FROM Sesion WHERE id_sesion = %s"
        results = DatabaseConnection.execute_query(query, (id_sesion,))
        return results[0] if results else None
    
    @staticmethod
    def get_user_sessions(id_usuario, limit=10):
        """Obtener sesiones de un usuario"""
        query = """
            SELECT * FROM Sesion 
            WHERE id_usuario = %s 
            ORDER BY fecha_inicio DESC 
            LIMIT %s
        """
        return DatabaseConnection.execute_query(query, (id_usuario, limit))
    
    @staticmethod
    def get_active_sessions(id_usuario):
        """Obtener sesiones activas de un usuario"""
        query = """
            SELECT * FROM Sesion 
            WHERE id_usuario = %s AND estado = 'activa'
        """
        return DatabaseConnection.execute_query(query, (id_usuario,))
    
    @staticmethod
    def close_session(id_sesion):
        """Cerrar sesión"""
        fecha_fin = datetime.now()
        query = """
            UPDATE Sesion 
            SET fecha_fin = %s, 
                duracion = TIMESTAMPDIFF(MINUTE, fecha_inicio, %s),
                estado = 'cerrada'
            WHERE id_sesion = %s
        """
        DatabaseConnection.execute_query(query, (fecha_fin, fecha_fin, id_sesion), fetch=False)
        return True
    
    @staticmethod
    def close_all_user_sessions(id_usuario):
        """Cerrar todas las sesiones activas de un usuario"""
        query = """
            UPDATE Sesion 
            SET fecha_fin = %s, estado = 'cerrada'
            WHERE id_usuario = %s AND estado = 'activa'
        """
        DatabaseConnection.execute_query(query, (datetime.now(), id_usuario), fetch=False)
        return True