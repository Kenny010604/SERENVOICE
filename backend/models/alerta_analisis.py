# backend/models/alerta_analisis.py
from database.connection import DatabaseConnection
from datetime import date

class AlertaAnalisis:
    """Modelo para la tabla alerta_analisis"""
    
    @staticmethod
    def create(id_resultado, tipo_alerta, tipo_recomendacion, titulo, descripcion, contexto=None):
        """Crear alerta"""
        query = """
            INSERT INTO alerta_analisis 
            (id_resultado, tipo_alerta, tipo_recomendacion, titulo, descripcion, contexto, fecha)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query,
            (id_resultado, tipo_alerta, tipo_recomendacion, titulo, descripcion, contexto, date.today()),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_alerta):
        """Obtener alerta por ID"""
        query = "SELECT * FROM alerta_analisis WHERE id_alerta = %s AND activo = 1"
        results = DatabaseConnection.execute_query(query, (id_alerta,))
        return results[0] if results else None
    
    @staticmethod
    def get_active_alerts(tipo_alerta=None):
        """Obtener alertas activas usando vista optimizada"""
        query = "SELECT * FROM vista_alertas_activas"
        params = []
        
        if tipo_alerta:
            query += " WHERE tipo_alerta = %s"
            params.append(tipo_alerta)
        
        query += " ORDER BY fecha_creacion DESC"
        
        if params:
            return DatabaseConnection.execute_query(query, tuple(params))
        return DatabaseConnection.execute_query(query)
    
    @staticmethod
    def get_critical_alerts():
        """Obtener solo alertas críticas"""
        query = "SELECT * FROM vista_alertas_activas WHERE tipo_alerta = 'critica'"
        return DatabaseConnection.execute_query(query)
    
    @staticmethod
    def get_user_alerts(id_usuario, tipo_alerta=None, limit=50):
        """Obtener alertas de un usuario"""
        query = """
            SELECT al.* FROM alerta_analisis al
            JOIN resultado_analisis ra ON al.id_resultado = ra.id_resultado
            JOIN analisis an ON ra.id_analisis = an.id_analisis
            JOIN audio au ON an.id_audio = au.id_audio
            WHERE au.id_usuario = %s AND al.activo = 1
        """
        params = [id_usuario]
        
        if tipo_alerta:
            query += " AND al.tipo_alerta = %s"
            params.append(tipo_alerta)
        
        query += " ORDER BY al.fecha_creacion DESC LIMIT %s"
        params.append(limit)
        
        return DatabaseConnection.execute_query(query, tuple(params))
    
    @staticmethod
    def mark_reviewed(id_alerta):
        """Marcar alerta como revisada"""
        query = "UPDATE alerta_analisis SET fecha_revision = NOW() WHERE id_alerta = %s"
        DatabaseConnection.execute_query(query, (id_alerta,), fetch=False)
        return True
    
    @staticmethod
    def delete(id_alerta):
        """Eliminar alerta (soft delete)"""
        query = "UPDATE alerta_analisis SET activo = 0 WHERE id_alerta = %s"
        DatabaseConnection.execute_query(query, (id_alerta,), fetch=False)
        return True
    
    @staticmethod
    def count_unreviewed(id_usuario=None):
        """Contar alertas no revisadas"""
        if id_usuario:
            query = """
                SELECT COUNT(*) as total FROM alerta_analisis al
                JOIN resultado_analisis ra ON al.id_resultado = ra.id_resultado
                JOIN analisis an ON ra.id_analisis = an.id_analisis
                JOIN audio au ON an.id_audio = au.id_audio
                WHERE au.id_usuario = %s 
                  AND al.activo = 1 
                  AND al.fecha_revision IS NULL
                  AND al.tipo_alerta IN ('alta', 'critica')
            """
            result = DatabaseConnection.execute_query(query, (id_usuario,))
        else:
            query = """
                SELECT COUNT(*) as total FROM alerta_analisis
                WHERE activo = 1 
                  AND fecha_revision IS NULL
                  AND tipo_alerta IN ('alta', 'critica')
            """
            result = DatabaseConnection.execute_query(query)
        
        return result[0]['total'] if result else 0