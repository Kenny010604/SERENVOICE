# backend/services/usuario_service.py
from database.connection import DatabaseConnection

class UsuarioService:
    
    @staticmethod
    def get_usuario_with_stats(id_usuario):
        """Obtener usuario con estadísticas"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = """
                    SELECT 
                        id_usuario,
                        nombre,
                        apellido,
                        correo,
                        genero,
                        fecha_nacimiento,
                        rol,
                        usa_medicamentos,
                        fecha_registro as fecha_creacion
                    FROM usuario 
                    WHERE id_usuario = %s
                """
                
                cursor.execute(query, (id_usuario,))
                usuario = cursor.fetchone()
                cursor.close()
                
                if not usuario:
                    return None
                
                # Convertir fechas a string
                if usuario.get('fecha_nacimiento'):
                    usuario['fecha_nacimiento'] = str(usuario['fecha_nacimiento'])
                
                if usuario.get('fecha_creacion'):
                    usuario['fecha_creacion'] = str(usuario['fecha_creacion'])
                
                return usuario
                
        except Exception as e:
            print(f"Error en get_usuario_with_stats: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def get_usuario_by_id(id_usuario):
        """Obtener usuario por ID"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s", (id_usuario,))
                usuario = cursor.fetchone()
                cursor.close()
                return usuario
                
        except Exception as e:
            print(f"Error en get_usuario_by_id: {str(e)}")
            return None
    
    @staticmethod
    def get_all_usuarios(page=1, per_page=20):
        """Obtener todos los usuarios con paginación"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                offset = (page - 1) * per_page
                
                query = """
                    SELECT 
                        id_usuario,
                        nombre,
                        apellido,
                        correo,
                        rol,
                        fecha_registro as fecha_creacion
                    FROM usuario 
                    ORDER BY fecha_registro DESC
                    LIMIT %s OFFSET %s
                """
                
                cursor.execute(query, (per_page, offset))
                usuarios = cursor.fetchall()
                cursor.close()
                return usuarios
                
        except Exception as e:
            print(f"Error en get_all_usuarios: {str(e)}")
            return []
    
    @staticmethod
    def update_usuario(id_usuario, data):
        """Actualizar usuario"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor()
                
                campos_actualizables = ['nombre', 'apellido', 'correo', 'genero', 'fecha_nacimiento', 'usa_medicamentos']
                updates = []
                valores = []
                
                for campo in campos_actualizables:
                    if campo in data:
                        updates.append(f"{campo} = %s")
                        valores.append(data[campo])
                
                if not updates:
                    return {'success': False, 'error': 'No hay campos para actualizar'}
                
                valores.append(id_usuario)
                query = f"UPDATE usuario SET {', '.join(updates)} WHERE id_usuario = %s"
                
                cursor.execute(query, valores)
                conn.commit()
                cursor.close()
                
                return {'success': True, 'message': 'Usuario actualizado correctamente'}
                
        except Exception as e:
            print(f"Error en update_usuario: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def delete_usuario(id_usuario):
        """Eliminar usuario"""
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))
                affected_rows = cursor.rowcount
                conn.commit()
                cursor.close()
                
                if affected_rows > 0:
                    return {'success': True, 'message': 'Usuario eliminado correctamente'}
                else:
                    return {'success': False, 'error': 'Usuario no encontrado'}
                
        except Exception as e:
            print(f"Error en delete_usuario: {str(e)}")
            return {'success': False, 'error': str(e)}