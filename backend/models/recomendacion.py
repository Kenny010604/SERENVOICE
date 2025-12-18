# backend/models/recomendacion.py
from database.connection import DatabaseConnection
from datetime import date

class Recomendacion:
    """Modelo para la tabla Recomendaciones"""
    
    @staticmethod
    def create(id_resultado, tipo, contenido):
        """Crear recomendación"""
        query = """
            INSERT INTO recomendaciones (id_resultado, tipo_recomendacion, contenido, fecha_generacion)
            VALUES (%s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query,
            (id_resultado, tipo, contenido, date.today()),
            fetch=False
        )
    
    @staticmethod
    def create_multiple(recomendaciones):
        """Crear múltiples recomendaciones"""
        query = """
            INSERT INTO recomendaciones (id_resultado, tipo_recomendacion, contenido, fecha_generacion)
            VALUES (%s, %s, %s, %s)
        """
        params_list = [
            (r['id_resultado'], r['tipo_recomendacion'], r['contenido'], date.today())
            for r in recomendaciones
        ]
        
        with DatabaseConnection.get_cursor() as cursor:
            cursor.executemany(query, params_list)
            return cursor.rowcount
    
    @staticmethod
    def get_by_result(id_resultado):
        """Obtener recomendaciones de un resultado"""
        query = "SELECT * FROM recomendaciones WHERE id_resultado = %s AND activo = 1"
        return DatabaseConnection.execute_query(query, (id_resultado,))
    
    @staticmethod
    def get_by_id(id_recomendacion):
        """Obtener recomendación por ID"""
        query = "SELECT * FROM recomendaciones WHERE id_recomendacion = %s AND activo = 1"
        results = DatabaseConnection.execute_query(query, (id_recomendacion,))
        return results[0] if results else None