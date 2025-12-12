# backend/models/resultado_analisis.py
from database.connection import DatabaseConnection

class ResultadoAnalisis:
    """Modelo para la tabla Resultado_analisis"""
    
    @staticmethod
    def create(id_analisis, nivel_estres, nivel_ansiedad, clasificacion, confianza_modelo):
        """Crear resultado de análisis y devolver su ID.
        También guarda la fecha/hora actual en la columna fecha_resultado si existe en la BD.
        """
        query = """
            INSERT INTO resultado_analisis 
            (id_analisis, nivel_estres, nivel_ansiedad, clasificacion, confianza_modelo, fecha_resultado)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        res = DatabaseConnection.execute_update(
            query,
            (id_analisis, nivel_estres, nivel_ansiedad, clasificacion, confianza_modelo)
        )
        return res.get('last_id')
    
    @staticmethod
    def get_by_id(id_resultado):
        """Obtener resultado por ID"""
        query = "SELECT * FROM resultado_analisis WHERE id_resultado = %s"
        results = DatabaseConnection.execute_query(query, (id_resultado,))
        return results[0] if results else None
    
    @staticmethod
    def get_by_analysis(id_analisis):
        """Obtener resultado de un análisis"""
        query = "SELECT * FROM resultado_analisis WHERE id_analisis = %s"
        results = DatabaseConnection.execute_query(query, (id_analisis,))
        return results[0] if results else None