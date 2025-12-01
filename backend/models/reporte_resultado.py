# backend/models/reporte_resultado.py
from database.connection import DatabaseConnection

class ReporteResultado:
    """Modelo para la tabla Reporte_resultado"""
    
    @staticmethod
    def add_result_to_report(id_reporte, id_resultado):
        """Agregar resultado a reporte"""
        query = "INSERT INTO Reporte_resultado (id_reporte, id_resultado) VALUES (%s, %s)"
        return DatabaseConnection.execute_query(query, (id_reporte, id_resultado), fetch=False)
    
    @staticmethod
    def add_multiple_results(id_reporte, resultado_ids):
        """Agregar múltiples resultados a un reporte"""
        query = "INSERT INTO Reporte_resultado (id_reporte, id_resultado) VALUES (%s, %s)"
        params_list = [(id_reporte, id_resultado) for id_resultado in resultado_ids]
        
        with DatabaseConnection.get_cursor() as cursor:
            cursor.executemany(query, params_list)
            return cursor.rowcount
    
    @staticmethod
    def get_report_results(id_reporte):
        """Obtener resultados de un reporte"""
        query = """
            SELECT ra.* FROM Resultado_analisis ra
            JOIN Reporte_resultado rr ON ra.id_resultado = rr.id_resultado
            WHERE rr.id_reporte = %s
        """
        return DatabaseConnection.execute_query(query, (id_reporte,))
    
    @staticmethod
    def remove_result_from_report(id_reporte, id_resultado):
        """Remover resultado de un reporte"""
        query = "DELETE FROM Reporte_resultado WHERE id_reporte = %s AND id_resultado = %s"
        DatabaseConnection.execute_query(query, (id_reporte, id_resultado), fetch=False)
        return True