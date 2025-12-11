# backend/models/alerta_analisis.py
#PRUEBA
from database.connection import DatabaseConnection
from datetime import date

class AlertaAnalisis:
    """Modelo para la tabla Alerta_Analisis"""
    
    @staticmethod
    def create(id_resultado, tipo, descripcion):
        """Crear alerta"""
        query = """
            INSERT INTO Alerta_Analisis (id_resultado, tipo_recomendacion, descripcion, fecha)
            VALUES (%s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query,
            (id_resultado, tipo, descripcion, date.today()),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_alerta):
        """Obtener alerta por ID"""
        query = "SELECT * FROM Alerta_Analisis WHERE id_alerta = %s"
        results = DatabaseConnection.execute_query(query, (id_alerta,))
        return results[0] if results else None
    
    @staticmethod
    def get_active_alerts():
        """Obtener alertas activas"""
        query = "SELECT * FROM vista_alertas_activas"
        return DatabaseConnection.execute_query(query)
    
    @staticmethod
    def get_user_alerts(id_usuario):
        """Obtener alertas de un usuario"""
        query = """
            SELECT al.* FROM Alerta_Analisis al
            JOIN Resultado_analisis ra ON al.id_resultado = ra.id_resultado
            JOIN Analisis an ON ra.id_analisis = an.id_analisis
            JOIN Audio au ON an.id_audio = au.id_audio
            WHERE au.id_usuario = %s
            ORDER BY al.fecha DESC
        """
        return DatabaseConnection.execute_query(query, (id_usuario,))