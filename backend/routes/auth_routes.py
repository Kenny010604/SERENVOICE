# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from database.connection import DatabaseConnection, get_db_connection
from datetime import datetime, date

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# ======================================================
# 🔵 REGISTRO DE USUARIO
# ======================================================
@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        nombres = data.get('nombre', '').strip()
        apellidos = data.get('apellido', '').strip()
        correo = data.get('correo', '').lower().strip()
        contrasena = data.get('contrasena', '')
        genero = data.get('genero')
        fecha_nacimiento = data.get('fechaNacimiento')
        usa_medicamentos = data.get('usa_medicamentos', False)

        # Validaciones
        if not nombres:
            return jsonify({'success': False, 'error': 'Los nombres son requeridos'}), 400
        if not apellidos:
            return jsonify({'success': False, 'error': 'Los apellidos son requeridos'}), 400
        if not correo:
            return jsonify({'success': False, 'error': 'El correo es requerido'}), 400
        if not contrasena:
            return jsonify({'success': False, 'error': 'La contraseña es requerida'}), 400
        if len(contrasena) < 6:
            return jsonify({'success': False, 'error': 'La contraseña debe tener mínimo 6 caracteres'}), 400

        # Normalizar fecha
        if fecha_nacimiento == "":
            fecha_nacimiento = None

        # Calcular edad para la respuesta
        edad = None
        if fecha_nacimiento:
            fecha_dt = datetime.strptime(fecha_nacimiento, "%Y-%m-%d").date()
            hoy = date.today()
            edad = hoy.year - fecha_dt.year - ((hoy.month, hoy.day) < (fecha_dt.month, fecha_dt.day))

        with DatabaseConnection.get_connection() as connection:
            cursor = connection.cursor()

            # Verificar si el correo ya existe
            cursor.execute("SELECT id_usuario FROM usuario WHERE correo = %s", (correo,))
            if cursor.fetchone():
                return jsonify({'success': False, 'error': 'El correo ya está registrado'}), 400

            password_hash = generate_password_hash(contrasena)

            cursor.execute("""
                INSERT INTO usuario (nombre, apellido, correo, contrasena, fecha_nacimiento, usa_medicamentos, rol, genero)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (nombres, apellidos, correo, password_hash, fecha_nacimiento, usa_medicamentos, 'usuario', genero))

            connection.commit()
            user_id = cursor.lastrowid

        # Token
        token = create_access_token(identity=str(user_id))

        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'token': token,
            'user': {
                'id_usuario': user_id,
                'nombre': nombres,
                'apellido': apellidos,
                'correo': correo,
                'rol': 'usuario',
                'genero': genero,
                'fecha_nacimiento': fecha_nacimiento,
                'edad': edad,
                'usa_medicamentos': usa_medicamentos
            }
        }), 201

    except Exception as e:
        print("Error en /register:", e)
        return jsonify({'success': False, 'error': str(e)}), 500



# ======================================================
# 🟠 ACTUALIZAR PERFIL + CAMBIO DE CONTRASEÑA
# ======================================================
@bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Datos personales
    nombre = data.get("nombre")
    apellido = data.get("apellido")
    correo = data.get("correo")
    genero = data.get("genero")
    fecha_nacimiento = data.get("fecha_nacimiento") or None
    usa_medicamentos = data.get("usa_medicamentos", 0)
    notificaciones = data.get("notificaciones", 1)

    # Contraseñas
    contrasena_actual = data.get("contrasenaActual")
    contrasena_nueva = data.get("contrasenaNueva")
    confirmar_contrasena = data.get("confirmarContrasena")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener contraseña actual
        cursor.execute("SELECT contrasena FROM usuario WHERE id_usuario=%s", (user_id,))
        user_row = cursor.fetchone()

        if not user_row:
            return jsonify({"error": "Usuario no encontrado"}), 404

        nueva_contra_hash = user_row["contrasena"]  # default

        # ============================================================
        # 🔵 CAMBIO DE CONTRASEÑA SOLO SI EL USUARIO LA ENVÍA
        # ============================================================
        if contrasena_nueva:
            if not contrasena_actual:
                return jsonify({"error": "Debe ingresar la contraseña actual"}), 400

            if not check_password_hash(user_row["contrasena"], contrasena_actual):
                return jsonify({"error": "La contraseña actual es incorrecta"}), 400

            if contrasena_nueva != confirmar_contrasena:
                return jsonify({"error": "Las contraseñas no coinciden"}), 400

            if len(contrasena_nueva) < 8:
                return jsonify({"error": "La nueva contraseña debe tener al menos 8 caracteres"}), 400

            nueva_contra_hash = generate_password_hash(contrasena_nueva)

        # ============================================================
        # 🔵 ACTUALIZAR PERFIL
        # ============================================================
        cursor.execute("""
            UPDATE usuario SET 
                nombre=%s,
                apellido=%s,
                correo=%s,
                genero=%s,
                fecha_nacimiento=%s,
                usa_medicamentos=%s,
                notificaciones=%s,
                contrasena=%s
            WHERE id_usuario=%s
        """, (nombre, apellido, correo, genero, fecha_nacimiento,
              usa_medicamentos, notificaciones, nueva_contra_hash, user_id))

        conn.commit()

        # Obtener usuario actualizado
        cursor.execute("SELECT * FROM usuario WHERE id_usuario=%s", (user_id,))
        user = cursor.fetchone()

        return jsonify({"success": True, "user": user}), 200

    except Exception as e:
        print("Error en /update:", e)
        return jsonify({"error": str(e)}), 500



# ======================================================
# 🟩 LOGIN
# ======================================================
@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        correo = data.get('correo', '').lower().strip()
        contrasena = data.get('contrasena', '')

        if not correo or not contrasena:
            return jsonify({'success': False, 'error': 'Correo y contraseña son requeridos'}), 400

        with DatabaseConnection.get_connection() as connection:
            cursor = connection.cursor(dictionary=True)

            cursor.execute("""
                SELECT id_usuario, nombre, apellido, correo, contrasena,
                       rol, fecha_nacimiento, usa_medicamentos, genero
                FROM usuario
                WHERE correo = %s LIMIT 1
            """, (correo,))

            user = cursor.fetchone()

        # Validar login
        if not user or not check_password_hash(user["contrasena"], contrasena):
            return jsonify({'success': False, 'error': 'Credenciales incorrectas'}), 401

        # Edad
        edad = None
        if user["fecha_nacimiento"]:
            fecha_dt = user["fecha_nacimiento"]
            if isinstance(fecha_dt, str):
                fecha_dt = datetime.strptime(fecha_dt, "%Y-%m-%d").date()

            hoy = date.today()
            edad = hoy.year - fecha_dt.year - ((hoy.month, hoy.day) < (fecha_dt.month, fecha_dt.day))

        token = create_access_token(identity=str(user["id_usuario"]))

        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id_usuario': user["id_usuario"],
                'nombre': user["nombre"],
                'apellido': user["apellido"],
                'correo': user["correo"],
                'rol': user["rol"],
                'genero': user["genero"],
                'fecha_nacimiento': user["fecha_nacimiento"],
                'edad': edad,
                'usa_medicamentos': user["usa_medicamentos"]
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
