# backend/models/analisis.py
from database.connection import DatabaseConnection
from datetime import date

class Analisis:
    """Modelo para la tabla Analisis"""
    
    @staticmethod
    def create(id_audio, modelo_usado='modelo_v1.0', estado='procesando'):
        """Crear nuevo análisis"""
        query = """
            INSERT INTO Analisis (id_audio, modelo_usado, fecha_analisis, estado_analisis)
            VALUES (%s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query,
            (id_audio, modelo_usado, date.today(), estado),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_analisis):
        """Obtener análisis por ID"""
        query = "SELECT * FROM Analisis WHERE id_analisis = %s"
        results = DatabaseConnection.execute_query(query, (id_analisis,))
        return results[0] if results else None
    
    @staticmethod
    def get_by_audio(id_audio):
        """Obtener análisis de un audio"""
        query = "SELECT * FROM Analisis WHERE id_audio = %s"
        results = DatabaseConnection.execute_query(query, (id_audio,))
        return results[0] if results else None
    
    @staticmethod
    def get_complete_analysis(id_analisis):
        """Obtener análisis completo con todos los detalles"""
        query = "SELECT * FROM vista_analisis_completos WHERE id_analisis = %s"
        results = DatabaseConnection.execute_query(query, (id_analisis,))
        return results[0] if results else None
    
    @staticmethod
    def update_status(id_analisis, estado):
        """Actualizar estado del análisis"""
        query = "UPDATE Analisis SET estado_analisis = %s WHERE id_analisis = %s"
        DatabaseConnection.execute_query(query, (estado, id_analisis), fetch=False)
        return True