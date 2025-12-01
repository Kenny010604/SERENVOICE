# backend/models/resultado_analisis.py
from database.connection import DatabaseConnection

class ResultadoAnalisis:
    """Modelo para la tabla Resultado_analisis"""
    
    @staticmethod
    def create(id_analisis, nivel_estres, nivel_ansiedad, clasificacion, confianza_modelo):
        """Crear resultado de análisis"""
        query = """
            INSERT INTO Resultado_analisis 
            (id_analisis, nivel_estres, nivel_ansiedad, clasificacion, confianza_modelo)
            VALUES (%s, %s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query,
            (id_analisis, nivel_estres, nivel_ansiedad, clasificacion, confianza_modelo),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_resultado):
        """Obtener resultado por ID"""
        query = "SELECT * FROM Resultado_analisis WHERE id_resultado = %s"
        results = DatabaseConnection.execute_query(query, (id_resultado,))
        return results[0] if results else None
    
    @staticmethod
    def get_by_analysis(id_analisis):
        """Obtener resultado de un análisis"""
        query = "SELECT * FROM Resultado_analisis WHERE id_analisis = %s"
        results = DatabaseConnection.execute_query(query, (id_analisis,))
        return results[0] if results else None