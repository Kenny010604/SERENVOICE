# backend/models/usuario.py
from database.connection import DatabaseConnection
from datetime import date, datetime

class Usuario:
    """Modelo para la tabla Usuario"""

    # ---------------------------------------------------
    # 🟢 Crear usuario
    # ---------------------------------------------------
    @staticmethod
    def create(
        nombre,
        apellido,
        correo,
        contrasena,
        genero=None,
        fecha_nacimiento=None,
        edad=None,
        usa_medicamentos=False,
        rol='usuario'
    ):

        # Si no envían edad → calcular automáticamente
        if fecha_nacimiento and not edad:
            edad = Usuario.calcular_edad(fecha_nacimiento)

        query = """
            INSERT INTO usuario 
            (nombre, apellido, correo, contrasena, genero, fecha_nacimiento, edad, usa_medicamentos, rol)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                edad,
                usa_medicamentos,
                rol
            ),
            fetch=False
        )

    # ---------------------------------------------------
    # 🟢 Obtener por ID
    # ---------------------------------------------------
    @staticmethod
    def get_by_id(id_usuario):
        query = "SELECT * FROM usuario WHERE id_usuario = %s"
        results = DatabaseConnection.execute_query(query, (id_usuario,))
        return results[0] if results else None

    # ---------------------------------------------------
    # 🟢 Obtener por correo
    # ---------------------------------------------------
    @staticmethod
    def get_by_email(correo):
        query = "SELECT * FROM usuario WHERE correo = %s"
        results = DatabaseConnection.execute_query(query, (correo.lower(),))
        return results[0] if results else None

    # ---------------------------------------------------
    # 🟢 Obtener todos
    # ---------------------------------------------------
    @staticmethod
    def get_all(limit=None, offset=0):
        query = "SELECT * FROM usuario ORDER BY id_usuario DESC"
        if limit:
            query += f" LIMIT {limit} OFFSET {offset}"
        return DatabaseConnection.execute_query(query)

    # ---------------------------------------------------
    # 🟢 Actualizar usuario
    # ---------------------------------------------------
    @staticmethod
    def update(id_usuario, **kwargs):
        allowed_fields = [
            'nombre', 'apellido', 'correo', 'contrasena',
            'genero', 'fecha_nacimiento', 'edad',
            'usa_medicamentos', 'rol'
        ]

        updates = []
        params = []

        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:

                # Si cambió la fecha de nacimiento → recalcular edad
                if field == "fecha_nacimiento":
                    try:
                        nueva_edad = Usuario.calcular_edad(value)
                        updates.append("edad = %s")
                        params.append(nueva_edad)
                    except:
                        pass

                updates.append(f"{field} = %s")
                params.append(value)

        if not updates:
            return False  # Nada para actualizar

        params.append(id_usuario)
        query = f"UPDATE usuario SET {', '.join(updates)} WHERE id_usuario = %s"

        DatabaseConnection.execute_query(query, tuple(params), fetch=False)
        return True

    # ---------------------------------------------------
    # 🟢 Eliminar usuario
    # ---------------------------------------------------
    @staticmethod
    def delete(id_usuario):
        query = "DELETE FROM usuario WHERE id_usuario = %s"
        DatabaseConnection.execute_query(query, (id_usuario,), fetch=False)
        return True

    # ---------------------------------------------------
    # 🟢 Verificar si correo existe
    # ---------------------------------------------------
    @staticmethod
    def exists_email(correo):
        query = "SELECT COUNT(*) AS count FROM usuario WHERE correo = %s"
        result = DatabaseConnection.execute_query(query, (correo.lower(),))
        return result[0]['count'] > 0 if result else False

    # ---------------------------------------------------
    # 🟢 Calcular edad automática
    # ---------------------------------------------------
    @staticmethod
    def calcular_edad(fecha_nacimiento):
        if not fecha_nacimiento:
            return None

        # Si viene como string → convertir
        if isinstance(fecha_nacimiento, str):
            fecha_nacimiento = datetime.strptime(fecha_nacimiento, "%Y-%m-%d").date()

        hoy = date.today()
        edad = hoy.year - fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day)
        )
        return edad
