# backend/routes/admin_routes.py

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.connection import DatabaseConnection

bp = Blueprint('admin', __name__, url_prefix='/admin')

# ======================================================
# 🛡️ VALIDAR SI EL USUARIO ES ADMIN
# ======================================================
def verificar_admin(user_id):
    try:
        connection = DatabaseConnection.get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id_usuario, correo, rol FROM usuario WHERE id_usuario = %s LIMIT 1", (user_id,))
        user = cursor.fetchone()
        cursor.close()
        DatabaseConnection.return_connection(connection)
        
        if not user:
            print(f"❌ Usuario {user_id} no encontrado en la BD")
            return False
        
        print(f"✅ Usuario: {user['correo']} (ID: {user['id_usuario']}) - Rol: {user['rol']}")
        
        es_admin = user["rol"] == "admin"
        if not es_admin:
            print(f"⚠️ Usuario {user['correo']} intentó acceder pero su rol es '{user['rol']}' (no 'admin')")
        
        return es_admin
        
    except Exception as e:
        print(f"Error en verificar_admin: {str(e)}")
        return False


# ======================================================
# 📊 ESTADÍSTICAS DEL SISTEMA (DASHBOARD ADMIN)
# ======================================================
@bp.route('/statistics', methods=['GET'])
@jwt_required()
def statistics():
    try:
        user_id = get_jwt_identity()
        print(f"📊 [STATISTICS] Solicitud de user_id: {user_id}")

        # Verificar rol admin
        if not verificar_admin(user_id):
            return jsonify({
                'success': False,
                'error': 'Acceso no autorizado. Se requiere rol administrador.'
            }), 403

        connection = DatabaseConnection.get_connection()
        cursor = connection.cursor(dictionary=True)

        # Total usuarios
        cursor.execute("SELECT COUNT(*) AS total FROM usuario")
        total_usuarios = cursor.fetchone()["total"]

        # Total usuarios que usan medicamentos
        cursor.execute("SELECT COUNT(*) AS total FROM usuario WHERE usa_medicamentos = TRUE")
        total_medicamentos = cursor.fetchone()["total"]

        # Total audios
        try:
            cursor.execute("SELECT COUNT(*) AS total FROM audio_registro")
            total_audios = cursor.fetchone()["total"]
        except:
            total_audios = 0

        # Total registros de estrés
        try:
            cursor.execute("SELECT COUNT(*) AS total FROM deteccion_estres")
            total_estres = cursor.fetchone()["total"]
        except:
            total_estres = 0

        cursor.close()
        DatabaseConnection.return_connection(connection)

        return jsonify({
            'success': True,
            'statistics': {
                'usuarios_total': total_usuarios,
                'usuarios_usan_medicamentos': total_medicamentos,
                'audios_total': total_audios,
                'detecciones_estres': total_estres
            }
        }), 200

    except Exception as e:
        print(f"Error en statistics: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ======================================================
# 👤 PERFIL DEL ADMIN
# ======================================================
@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener información del perfil del admin actual"""
    connection = None
    cursor = None
    
    try:
        user_id = get_jwt_identity()
        print(f"👤 [PROFILE] Solicitud de user_id: {user_id}")

        # Verificar rol admin
        if not verificar_admin(user_id):
            return jsonify({
                'success': False,
                'error': 'Acceso no autorizado. Se requiere rol administrador.'
            }), 403

        connection = DatabaseConnection.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                id_usuario,
                nombre,
                apellido,
                correo,
                genero,
                fecha_nacimiento,
                rol,
                fecha_creacion
            FROM usuario 
            WHERE id_usuario = %s
        """
        
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            DatabaseConnection.return_connection(connection)
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404

        # Construir respuesta
        profile_data = {
            'id': user['id_usuario'],
            'nombre': user['nombre'],
            'apellido': user['apellido'],
            'correo': user['correo'],
            'genero': user.get('genero'),
            'rol': user['rol']
        }
        
        # Agregar campos opcionales solo si existen
        if user.get('fecha_nacimiento'):
            profile_data['fecha_nacimiento'] = str(user['fecha_nacimiento'])
        
        if user.get('fecha_creacion'):
            profile_data['fecha_creacion'] = str(user['fecha_creacion'])

        cursor.close()
        DatabaseConnection.return_connection(connection)

        return jsonify({
            'success': True,
            'profile': profile_data
        }), 200

    except Exception as e:
        print(f"❌ Error en get_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        
        if cursor:
            cursor.close()
        if connection:
            DatabaseConnection.return_connection(connection)
        
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500
    # ======================================================
# 👥 LISTA DE USUARIOS (ADMIN)
# ======================================================
@bp.route('/usuarios', methods=['GET'])
@jwt_required()
def get_usuarios():
    """Obtener la lista de todos los usuarios (solo admin)"""
    connection = None
    cursor = None

    try:
        user_id = get_jwt_identity()
        print(f"👥 [USUARIOS] Solicitud de user_id: {user_id}")

        # Verificar rol admin
        if not verificar_admin(user_id):
            return jsonify({
                'success': False,
                'error': 'Acceso no autorizado. Se requiere rol administrador.'
            }), 403

        connection = DatabaseConnection.get_connection()
        cursor = connection.cursor(dictionary=True)

        # Obtener usuarios
        query = """
            SELECT 
                id_usuario,
                nombre,
                apellido,
                correo,
                rol,
                fecha_ultimo_acceso
            FROM usuario
        """
        cursor.execute(query)
        usuarios = cursor.fetchall()

        # Formatear respuesta
        usuarios_data = []
        for u in usuarios:
            usuarios_data.append({
                'id': u['id_usuario'],
                'nombre': u['nombre'],
                'apellido': u['apellido'],
                'email': u['correo'],
                'roles': [u['rol']],  # convertir rol a lista para compatibilidad frontend
                'ultimoAcceso': str(u.get('fecha_ultimo_acceso')) if u.get('fecha_ultimo_acceso') else None
            })

        cursor.close()
        DatabaseConnection.return_connection(connection)

        return jsonify({
            'success': True,
            'usuarios': usuarios_data
        }), 200

    except Exception as e:
        print(f"❌ Error en get_usuarios: {str(e)}")
        import traceback
        traceback.print_exc()

        if cursor:
            cursor.close()
        if connection:
            DatabaseConnection.return_connection(connection)

        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500
