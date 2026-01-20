# backend/models/grupo.py
from database.connection import DatabaseConnection
from datetime import datetime
import random
import string

class Grupo:
    """Modelo para la tabla grupos"""
    
    @staticmethod
    def create(nombre_grupo, id_facilitador, descripcion=None, tipo_grupo='apoyo', 
               privacidad='privado', max_participantes=None):
        """Crear un nuevo grupo terapéutico"""
        # Generar código de acceso único
        codigo_acceso = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        query = """
            INSERT INTO grupos 
            (nombre_grupo, descripcion, codigo_acceso, id_facilitador, tipo_grupo, 
             privacidad, max_participantes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query, 
            (nombre_grupo, descripcion, codigo_acceso, id_facilitador, tipo_grupo, 
             privacidad, max_participantes),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_grupo):
        """Obtener grupo por ID"""
        query = "SELECT * FROM grupos WHERE id_grupo = %s AND activo = 1"
        results = DatabaseConnection.execute_query(query, (id_grupo,))
        return results[0] if results else None
    
    @staticmethod
    def get_by_codigo(codigo_acceso):
        """Obtener grupo por código de acceso"""
        query = "SELECT * FROM grupos WHERE codigo_acceso = %s AND activo = 1"
        results = DatabaseConnection.execute_query(query, (codigo_acceso,))
        return results[0] if results else None
    
    @staticmethod
    def get_by_facilitador(id_facilitador):
        """Obtener todos los grupos de un facilitador"""
        query = """
            SELECT * FROM grupos 
            WHERE id_facilitador = %s AND activo = 1 
            ORDER BY fecha_creacion DESC
        """
        return DatabaseConnection.execute_query(query, (id_facilitador,))
    
    @staticmethod
    def get_all(tipo_grupo=None, privacidad=None):
        """Obtener todos los grupos con filtros opcionales"""
        query = "SELECT * FROM grupos WHERE activo = 1"
        params = []
        
        if tipo_grupo:
            query += " AND tipo_grupo = %s"
            params.append(tipo_grupo)
        
        if privacidad:
            query += " AND privacidad = %s"
            params.append(privacidad)
        
        query += " ORDER BY fecha_creacion DESC"
        
        if params:
            return DatabaseConnection.execute_query(query, tuple(params))
        return DatabaseConnection.execute_query(query)
    
    @staticmethod
    def get_public_groups(user_id):
        """Obtener grupos públicos con info adicional para el usuario"""
        query = """
            SELECT 
                g.*,
                u.nombre as nombre_facilitador,
                (SELECT COUNT(*) FROM grupo_miembros gm WHERE gm.id_grupo = g.id_grupo AND gm.activo = 1 AND gm.estado = 'activo') as total_miembros,
                CASE WHEN EXISTS(
                    SELECT 1 FROM grupo_miembros gm 
                    WHERE gm.id_grupo = g.id_grupo AND gm.id_usuario = %s AND gm.activo = 1
                ) THEN 1 ELSE 0 END as es_miembro
            FROM grupos g
            LEFT JOIN usuario u ON g.id_facilitador = u.id_usuario
            WHERE g.activo = 1 AND g.privacidad = 'publico'
            ORDER BY g.fecha_creacion DESC
        """
        return DatabaseConnection.execute_query(query, (user_id,))
    
    @staticmethod
    def get_estadisticas(id_grupo=None):
        """Obtener estadísticas usando la vista optimizada"""
        if id_grupo:
            query = "SELECT * FROM vista_grupos_estadisticas WHERE id_grupo = %s"
            results = DatabaseConnection.execute_query(query, (id_grupo,))
            return results[0] if results else None
        else:
            query = "SELECT * FROM vista_grupos_estadisticas ORDER BY fecha_creacion DESC"
            return DatabaseConnection.execute_query(query)
    
    @staticmethod
    def update(id_grupo, **kwargs):
        """Actualizar grupo"""
        allowed_fields = ['nombre_grupo', 'descripcion', 'tipo_grupo', 'privacidad', 
                 'max_participantes']
        
        updates = []
        values = []
        
        for field, value in kwargs.items():
            if field in allowed_fields:
                updates.append(f"{field} = %s")
                values.append(value)
        
        if not updates:
            return False
        
        values.append(id_grupo)
        query = f"UPDATE grupos SET {', '.join(updates)} WHERE id_grupo = %s"
        DatabaseConnection.execute_query(query, tuple(values), fetch=False)
        return True
    
    @staticmethod
    def delete(id_grupo):
        """Eliminar grupo (soft delete)"""
        query = "UPDATE grupos SET activo = 0 WHERE id_grupo = %s"
        DatabaseConnection.execute_query(query, (id_grupo,), fetch=False)
        return True
    
    @staticmethod
    def verify_max_participantes(id_grupo):
        """Verificar si el grupo ha alcanzado su límite de participantes"""
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo or not grupo.get('max_participantes'):
            return True  # Sin límite
        
        query = """
            SELECT COUNT(*) as total 
            FROM grupo_miembros 
            WHERE id_grupo = %s AND activo = 1 AND estado = 'activo'
        """
        result = DatabaseConnection.execute_query(query, (id_grupo,))
        total = result[0]['total'] if result else 0
        
        return total < grupo['max_participantes']
