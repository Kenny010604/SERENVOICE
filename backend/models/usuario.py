from database.connection import DatabaseConnection, get_db_connection
from datetime import date, datetime

class Usuario:
    """Modelo para la tabla usuario"""

    # ---------------------------------------------------
    # Crear usuario
    # ---------------------------------------------------
    @staticmethod
    def create(
        nombre,
        apellido,
        correo,
        contrasena,
        fecha_nacimiento=None,
        usa_medicamentos=False,
        rol='usuario',
        genero=None
    ):
        query = """
            INSERT INTO usuario 
            (nombre, apellido, correo, contrasena, genero, fecha_nacimiento, usa_medicamentos, rol)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        return DatabaseConnection.execute_query(
            query,
            (
                nombre,
                apellido,
                correo.lower(),
                contrasena,
                genero,
                fecha_nacimiento,
                usa_medicamentos,
                rol
            ),
            fetch=False
        )

    # ---------------------------------------------------
    # Obtener usuario por ID
    # ---------------------------------------------------
    @staticmethod
    def get_by_id(id_usuario):
        query = "SELECT * FROM usuario WHERE id_usuario = %s"
        results = DatabaseConnection.execute_query(query, (id_usuario,))
        return results[0] if results else None

    # ---------------------------------------------------
    # Obtener usuario por correo
    # ---------------------------------------------------
    @staticmethod
    def get_by_email(correo):
        query = """
            SELECT id_usuario, nombre, apellido, correo, contrasena,
                   fecha_nacimiento, usa_medicamentos, rol
            FROM usuario
            WHERE correo = %s
            LIMIT 1
        """
        results = DatabaseConnection.execute_query(query, (correo.lower(),))
        return results[0] if results else None

    # ---------------------------------------------------
    # Obtener todos los usuarios
    # ---------------------------------------------------
    @staticmethod
    def get_all(limit=None, offset=0):
        query = "SELECT * FROM usuario ORDER BY id_usuario DESC"
        if limit:
            query += f" LIMIT {limit} OFFSET {offset}"
        return DatabaseConnection.execute_query(query)

    # ---------------------------------------------------
    # Actualizar usuario
    # ---------------------------------------------------
    @staticmethod
    def update(
        id_usuario, nombre, apellido, correo, genero,
        fecha_nacimiento, usa_medicamentos, contrasena_actual=None,
        contrasena_nueva=None
    ):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener contraseña actual para validar si desea cambiarla
        cursor.execute("SELECT contrasena FROM usuarios WHERE id_usuario = %s", (id_usuario,))
        row = cursor.fetchone()

        if not row:
            raise Exception("Usuario no encontrado")

        # Si quiere cambiar contraseña
        if contrasena_nueva:
            if not contrasena_actual or not check_password_hash(row["contrasena"], contrasena_actual):
                raise Exception("La contraseña actual es incorrecta")
            nueva_contra = generate_password_hash(contrasena_nueva)
        else:
            nueva_contra = row["contrasena"]

        # Calcular edad automáticamente
        edad = Usuario.calcular_edad(fecha_nacimiento) if fecha_nacimiento else None

        cursor.execute("""
            UPDATE usuarios
            SET nombre=%s,
                apellido=%s,
                correo=%s,
                genero=%s,
                fecha_nacimiento=%s,
                edad=%s,
                usa_medicamentos=%s,
                contrasena=%s
            WHERE id_usuario=%s
        """, (
            nombre, apellido, correo, genero,
            fecha_nacimiento, edad, usa_medicamentos,
            nueva_contra, id_usuario
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return edad

    # ---------------------------------------------------
    # Eliminar usuario
    # ---------------------------------------------------
    @staticmethod
    def delete(id_usuario):
        query = "DELETE FROM usuario WHERE id_usuario = %s"
        DatabaseConnection.execute_query(query, (id_usuario,), fetch=False)
        return True

    # ---------------------------------------------------
    # Verificar si correo existe
    # ---------------------------------------------------
    @staticmethod
    def exists_email(correo):
        query = "SELECT COUNT(*) AS count FROM usuario WHERE correo = %s"
        result = DatabaseConnection.execute_query(query, (correo.lower(),))
        return result[0]['count'] > 0 if result else False

    # ---------------------------------------------------
    # Calcular edad
    # ---------------------------------------------------
    @staticmethod
    def calcular_edad(fecha_nacimiento):
        if not fecha_nacimiento:
            return None

        if isinstance(fecha_nacimiento, str):
            fecha_nacimiento = datetime.strptime(fecha_nacimiento, "%Y-%m-%d").date()

        hoy = date.today()
        edad = hoy.year - fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day)
        )
        return edad
