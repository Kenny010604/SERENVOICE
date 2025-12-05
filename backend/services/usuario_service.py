from database.connection import DatabaseConnection
from models.usuario import Usuario


class UsuarioService:

    # ============================================
    # OBTENER TODOS LOS USUARIOS - FORMATO SIMPLE
    # ============================================
    @staticmethod
    def get_all_usuarios_simple():
        try:
            print("\n" + "="*50)
            print(" INICIANDO get_all_usuarios_simple()")
            print("="*50)
            
            usuarios = Usuario.get_all()  # este debe leer desde la tabla `usuario`
            
            # ✅ LOGS DE DEPURACIÓN
            print(f"\n Usuarios obtenidos de la BD: {len(usuarios)}")
            if usuarios:
                print(f" Primer usuario: {usuarios[0]}")
                print(f" Campos disponibles: {usuarios[0].keys() if usuarios else 'N/A'}")
            else:
                print("⚠️  NO SE OBTUVIERON USUARIOS DE LA BD")

            usuarios_formatted = []
            for u in usuarios:
                usuario_formateado = {
                    "id": u.get("id_usuario"),
                    "nombre": u.get("nombre"),
                    "apellido": u.get("apellido"),
                    "email": u.get("correo"),
                    "roles": [u.get("rol", "usuario")],
                    "ultimoAcceso": u.get("ultima_sesion", "N/A"),
                    "genero": u.get("genero"),
                    "fecha_nacimiento": str(u.get("fecha_nacimiento")) if u.get("fecha_nacimiento") else None,
                    "activo": u.get("activo", True),
                }
                usuarios_formatted.append(usuario_formateado)
                print(f" Usuario formateado: {usuario_formateado['id']} - {usuario_formateado['nombre']}")

            # ✅ LOG FINAL
            print(f"\n Total usuarios formateados: {len(usuarios_formatted)}")
            print("="*50 + "\n")
            
            return usuarios_formatted

        except Exception as e:
            print(f"\n ERROR en get_all_usuarios_simple: {str(e)}")
            import traceback
            traceback.print_exc()
            return []

    # ============================================
    # OBTENER USUARIO CON ESTADÍSTICAS
    # ============================================
    @staticmethod
    def get_usuario_with_stats(id_usuario):
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
                        fecha_registro AS fecha_creacion
                    FROM usuario
                    WHERE id_usuario = %s
                """

                cursor.execute(query, (id_usuario,))
                usuario = cursor.fetchone()
                cursor.close()

                if not usuario:
                    return None

                if usuario.get("fecha_nacimiento"):
                    usuario["fecha_nacimiento"] = str(usuario["fecha_nacimiento"])

                if usuario.get("fecha_creacion"):
                    usuario["fecha_creacion"] = str(usuario["fecha_creacion"])

                return usuario

        except Exception as e:
            print(f"\n Error en get_usuario_with_stats: {str(e)}")
            return None

    # ============================================
    # OBTENER USUARIO POR ID
    # ============================================
    @staticmethod
    def get_usuario_by_id(id_usuario):
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s", (id_usuario,))
                usuario = cursor.fetchone()

                cursor.close()
                return usuario

        except Exception as e:
            print(f"\n Error en get_usuario_by_id: {str(e)}")
            return None

    # ============================================
    # LISTAR USUARIOS CON PAGINACIÓN
    # ============================================
    @staticmethod
    def get_all_usuarios(page=1, per_page=20):
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
                        fecha_registro AS fecha_creacion
                    FROM usuario
                    ORDER BY fecha_registro DESC
                    LIMIT %s OFFSET %s
                """

                cursor.execute(query, (per_page, offset))
                usuarios = cursor.fetchall()

                cursor.close()
                return usuarios

        except Exception as e:
            print(f"\n Error en get_all_usuarios: {str(e)}")
            return []

    # ============================================
    # ACTUALIZAR USUARIO
    # ============================================
    @staticmethod
    def update_usuario(id_usuario, data):
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor()

                campos_permitidos = [
                    "nombre",
                    "apellido",
                    "correo",
                    "genero",
                    "fecha_nacimiento",
                    "usa_medicamentos"
                ]

                updates = []
                values = []

                for campo in campos_permitidos:
                    if campo in data:
                        updates.append(f"{campo} = %s")
                        values.append(data[campo])

                if not updates:
                    return {"success": False, "error": "No hay campos para actualizar"}

                values.append(id_usuario)

                query = f"""
                    UPDATE usuario
                    SET {', '.join(updates)}
                    WHERE id_usuario = %s
                """

                cursor.execute(query, values)
                conn.commit()
                cursor.close()

                return {"success": True, "message": "Usuario actualizado correctamente"}

        except Exception as e:
            print(f"\n Error en update_usuario: {str(e)}")
            return {"success": False, "error": str(e)}

    # ============================================
    # ELIMINAR USUARIO
    # ============================================
    @staticmethod
    def delete_usuario(id_usuario):
        try:
            with DatabaseConnection.get_connection() as conn:
                cursor = conn.cursor()

                cursor.execute("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))
                rows = cursor.rowcount

                conn.commit()
                cursor.close()

                if rows > 0:
                    return {"success": True, "message": "Usuario eliminado correctamente"}
                else:
                    return {"success": False, "error": "Usuario no encontrado"}

        except Exception as e:
            print(f"\n Error en delete_usuario: {str(e)}")
            return {"success": False, "error": str(e)}