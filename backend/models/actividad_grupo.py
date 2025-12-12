# backend/models/actividad_grupo.py
from database.connection import DatabaseConnection
from datetime import datetime

class ActividadGrupo:
    """Modelo para la tabla actividades_grupo"""
    
    @staticmethod
    def create(id_grupo, id_creador, titulo, descripcion=None, tipo_actividad='tarea',
               fecha_programada=None, duracion_estimada=None):
        """Crear una nueva actividad para un grupo"""
        query = """
            INSERT INTO actividades_grupo 
            (id_grupo, id_creador, titulo, descripcion, tipo_actividad, 
             fecha_programada, duracion_estimada)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query, 
            (id_grupo, id_creador, titulo, descripcion, tipo_actividad, 
             fecha_programada, duracion_estimada),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_actividad):
        """Obtener actividad por ID"""
        query = """
            SELECT ag.*, u.nombre as creador_nombre, u.apellido as creador_apellido
            FROM actividades_grupo ag
            JOIN usuario u ON ag.id_creador = u.id_usuario
            WHERE ag.id_actividad = %s AND ag.activo = 1
        """
        results = DatabaseConnection.execute_query(query, (id_actividad,))
        return results[0] if results else None
    
    @staticmethod
    def get_by_grupo(id_grupo, completada=None):
        """Obtener actividades de un grupo"""
        query = """
            SELECT ag.*, u.nombre as creador_nombre, u.apellido as creador_apellido,
                   COUNT(DISTINCT pa.id_usuario) as participantes_totales,
                   COUNT(DISTINCT CASE WHEN pa.completada = 1 THEN pa.id_usuario END) as participantes_completados
            FROM actividades_grupo ag
            JOIN usuario u ON ag.id_creador = u.id_usuario
            LEFT JOIN participacion_actividad pa ON ag.id_actividad = pa.id_actividad
            WHERE ag.id_grupo = %s AND ag.activo = 1
        """
        params = [id_grupo]
        
        if completada is not None:
            query += " AND ag.completada = %s"
            params.append(completada)
        
        query += """
            GROUP BY ag.id_actividad
            ORDER BY ag.fecha_programada DESC, ag.id_actividad DESC
        """
        return DatabaseConnection.execute_query(query, tuple(params))
    
    @staticmethod
    def get_upcoming(id_grupo, limit=10):
        """Obtener próximas actividades programadas"""
        query = """
            SELECT ag.*, u.nombre as creador_nombre, u.apellido as creador_apellido
            FROM actividades_grupo ag
            JOIN usuario u ON ag.id_creador = u.id_usuario
            WHERE ag.id_grupo = %s 
              AND ag.activo = 1 
              AND ag.completada = 0
              AND ag.fecha_programada >= NOW()
            ORDER BY ag.fecha_programada ASC
            LIMIT %s
        """
        return DatabaseConnection.execute_query(query, (id_grupo, limit))
    
    @staticmethod
    def update(id_actividad, **kwargs):
        """Actualizar actividad"""
        allowed_fields = ['titulo', 'descripcion', 'tipo_actividad', 
                         'fecha_programada', 'duracion_estimada', 'completada']
        
        updates = []
        values = []
        
        for field, value in kwargs.items():
            if field in allowed_fields:
                updates.append(f"{field} = %s")
                values.append(value)
        
        if not updates:
            return False
        
        values.append(id_actividad)
        query = f"UPDATE actividades_grupo SET {', '.join(updates)} WHERE id_actividad = %s"
        DatabaseConnection.execute_query(query, tuple(values), fetch=False)
        return True
    
    @staticmethod
    def mark_completed(id_actividad):
        """Marcar actividad como completada"""
        query = "UPDATE actividades_grupo SET completada = 1 WHERE id_actividad = %s"
        DatabaseConnection.execute_query(query, (id_actividad,), fetch=False)
        return True
    
    @staticmethod
    def delete(id_actividad):
        """Eliminar actividad (soft delete)"""
        query = "UPDATE actividades_grupo SET activo = 0 WHERE id_actividad = %s"
        DatabaseConnection.execute_query(query, (id_actividad,), fetch=False)
        return True


class ParticipacionActividad:
    """Modelo para la tabla participacion_actividad"""
    
    @staticmethod
    def create(id_actividad, id_usuario, estado_emocional_antes=None, notas_participante=None):
        """Registrar participación en una actividad"""
        query = """
            INSERT INTO participacion_actividad 
            (id_actividad, id_usuario, estado_emocional_antes, notas_participante)
            VALUES (%s, %s, %s, %s)
        """
        return DatabaseConnection.execute_query(
            query, 
            (id_actividad, id_usuario, estado_emocional_antes, notas_participante),
            fetch=False
        )
    
    @staticmethod
    def get_by_id(id_participacion):
        """Obtener participación por ID"""
        query = "SELECT * FROM participacion_actividad WHERE id_participacion = %s"
        results = DatabaseConnection.execute_query(query, (id_participacion,))
        return results[0] if results else None
    
    @staticmethod
    def get_user_participation(id_actividad, id_usuario):
        """Obtener participación de un usuario en una actividad"""
        query = """
            SELECT * FROM participacion_actividad 
            WHERE id_actividad = %s AND id_usuario = %s
        """
        results = DatabaseConnection.execute_query(query, (id_actividad, id_usuario))
        return results[0] if results else None
    
    @staticmethod
    def get_activity_participants(id_actividad):
        """Obtener todos los participantes de una actividad"""
        query = """
            SELECT pa.*, u.nombre, u.apellido, u.correo
            FROM participacion_actividad pa
            JOIN usuario u ON pa.id_usuario = u.id_usuario
            WHERE pa.id_actividad = %s
            ORDER BY pa.fecha_completada DESC, pa.id_participacion DESC
        """
        return DatabaseConnection.execute_query(query, (id_actividad,))
    
    @staticmethod
    def mark_completed(id_participacion, estado_emocional_despues=None, notas_participante=None):
        """Marcar participación como completada"""
        query = """
            UPDATE participacion_actividad 
            SET completada = 1, 
                fecha_completada = NOW(),
                estado_emocional_despues = %s,
                notas_participante = COALESCE(%s, notas_participante)
            WHERE id_participacion = %s
        """
        DatabaseConnection.execute_query(
            query, 
            (estado_emocional_despues, notas_participante, id_participacion),
            fetch=False
        )
        return True
    
    @staticmethod
    def update_notes(id_participacion, notas):
        """Actualizar notas del participante"""
        query = "UPDATE participacion_actividad SET notas_participante = %s WHERE id_participacion = %s"
        DatabaseConnection.execute_query(query, (notas, id_participacion), fetch=False)
        return True
