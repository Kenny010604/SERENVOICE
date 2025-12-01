# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from database.connection import DatabaseConnection
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
        genero = data.get('genero', '')
        fecha_nacimiento = data.get('fechaNacimiento', None)
        usa_medicamentos = data.get('usa_medicamentos', False)

        # Validaciones básicas
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
        if not genero:
            return jsonify({'success': False, 'error': 'El género es requerido'}), 400

        # Si fecha viene vacía → None
        if fecha_nacimiento == '':
            fecha_nacimiento = None

        # Calcular edad solo para la respuesta (no se guarda en DB)
        edad = None
        if fecha_nacimiento:
            fecha_dt = datetime.strptime(fecha_nacimiento, "%Y-%m-%d").date()
            hoy = date.today()
            edad = hoy.year - fecha_dt.year - ((hoy.month, hoy.day) < (fecha_dt.month, fecha_dt.day))

        with DatabaseConnection.get_connection() as connection:
            cursor = connection.cursor()

            # Verificar si correo ya existe
            cursor.execute("SELECT id_usuario FROM usuario WHERE correo = %s", (correo,))
            if cursor.fetchone():
                return jsonify({'success': False, 'error': 'El correo ya está registrado'}), 400

            # Hash de contraseña
            password_hash = generate_password_hash(contrasena)

            # Insertar usuario **sin edad**
            cursor.execute("""
                INSERT INTO usuario 
                (nombre, apellido, correo, contrasena, genero, fecha_nacimiento, usa_medicamentos, rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'usuario')
            """, (
                nombres, apellidos, correo, password_hash, genero,
                fecha_nacimiento, usa_medicamentos
            ))

            connection.commit()
            user_id = cursor.lastrowid

        # Crear JWT
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
                'edad': edad,  # Calculada para el frontend
                'usa_medicamentos': usa_medicamentos
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


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

            # Traer usuario **sin edad**
            cursor.execute("""
                SELECT 
                    id_usuario, nombre, apellido, correo, contrasena,
                    rol, genero, fecha_nacimiento, usa_medicamentos
                FROM usuario
                WHERE correo = %s
                LIMIT 1
            """, (correo,))

            user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'error': 'Credenciales incorrectas'}), 401

        if not check_password_hash(user["contrasena"], contrasena):
            return jsonify({'success': False, 'error': 'Credenciales incorrectas'}), 401

        # Calcular edad para frontend
        edad = None
        if user["fecha_nacimiento"]:
            fecha_dt = user["fecha_nacimiento"]
            if isinstance(fecha_dt, str):
                fecha_dt = datetime.strptime(fecha_dt, "%Y-%m-%d").date()
            hoy = date.today()
            edad = hoy.year - fecha_dt.year - ((hoy.month, hoy.day) < (fecha_dt.month, fecha_dt.day))

        # JWT
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
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
