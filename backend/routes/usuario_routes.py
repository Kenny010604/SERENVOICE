from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.usuario_service import UsuarioService
from services.resultados_service import ResultadosService
from utils.helpers import Helpers
from utils.seguridad import role_required
from database.connection import DatabaseConnection, get_db_connection

bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')


# ============================================
# Obtener usuario autenticado
# ============================================
@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    usuario = UsuarioService.get_usuario_with_stats(user_id)

    if not usuario:
        return Helpers.format_response(False, "Usuario no encontrado", status=404)

    usuario.pop('contrasena', None)
    usuario.pop('contrasena', None)

    return Helpers.format_response(True, data=usuario)


# ============================================
# Estadísticas (admin)
# ============================================
@bp.route('/statistics', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_statistics():
    try:
        with DatabaseConnection.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            cursor.execute("SELECT COUNT(*) AS total FROM usuario")
            total_usuarios = cursor.fetchone()["total"]

            cursor.execute("""
                SELECT COUNT(*) AS total
                FROM usuario
                WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            """)
            usuarios_activos = cursor.fetchone()["total"]

            cursor.execute("""
                SELECT COUNT(*) AS total
                FROM usuario
                WHERE usa_medicamentos = 1
            """)
            total_medicamentos = cursor.fetchone()["total"]

            cursor.close()

        tasa_actividad = 0
        if total_usuarios > 0:
            tasa_actividad = round((usuarios_activos / total_usuarios) * 100, 1)

        return Helpers.format_response(True, data={
            "totalUsuarios": total_usuarios,
            "usuariosActivos": usuarios_activos,
            "usuariosUsan_medicamentos": total_medicamentos,
            "tasaActividad": tasa_actividad
        })

    except Exception as e:
        print(f"[ERROR] statistics: {str(e)}")
        return Helpers.format_response(False, str(e), status=500)


# ============================================
# Lista simple (admin) - CON LOGS Y PRUEBA DIRECTA
# ============================================
@bp.route('/lista', methods=['GET'])
@jwt_required()
def get_usuarios_simple():
    print("\n" + "="*60)
    print("[INFO] ENDPOINT /api/usuarios/lista LLAMADO")
    print("="*60)
    
    current_user_id = get_jwt_identity()
    print(f"[INFO] Usuario autenticado ID: {current_user_id}")
    
    current_user = UsuarioService.get_usuario_by_id(current_user_id)
    print(f"[INFO] Usuario rol: {current_user.get('rol') if current_user else 'NO ENCONTRADO'}")

    if not current_user or current_user.get('rol') != 'admin':
        print("[ERROR] ACCESO DENEGADO - No es admin")
        return Helpers.format_response(False, "Sin permisos", 403)

    print("[OK] Usuario es admin - Procediendo...")
    
    # ============================================
    # PRUEBA DIRECTA A LA BASE DE DATOS
    # ============================================
    try:
        print("\n[TEST] INICIANDO PRUEBA DIRECTA A LA BD...")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Contar usuarios
        cursor.execute("SELECT COUNT(*) as total FROM usuario")
        count_result = cursor.fetchone()
        print(f"[TEST] Total usuarios en BD: {count_result['total']}")
        
        # Obtener primeros 5
        cursor.execute("SELECT * FROM usuario LIMIT 5")
        usuarios_directos = cursor.fetchall()
        
        print(f"[TEST] Usuarios obtenidos directamente: {len(usuarios_directos)}")
        if usuarios_directos:
            print(f"[TEST] Primer usuario directo: {usuarios_directos[0]}")
        
        cursor.close()
        conn.close()
        print("[TEST] Prueba directa completada\n")
        
    except Exception as e:
        print(f"[ERROR] Error en prueba directa: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # ============================================
    # LLAMAR AL SERVICE NORMAL
    # ============================================
    usuarios = UsuarioService.get_all_usuarios_simple()
    
    print(f"\n[RESPONSE] RESPUESTA FINAL:")
    print(f"[RESPONSE] Usuarios a enviar: {len(usuarios)}")
    if usuarios:
        print(f"[RESPONSE] Primer usuario: {usuarios[0]}")
    else:
        print("[WARNING] LISTA VACIA")
    print("="*60 + "\n")
    
    return Helpers.format_response(True, data=usuarios)


# ============================================
# Listar usuarios (admin)
# ============================================
@bp.route('', methods=['GET'])
@bp.route('/', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_usuarios():
    # Devolver todos los usuarios (el frontend hace paginación client-side)
    usuarios = UsuarioService.get_all_usuarios()

    return Helpers.format_response(True, data=usuarios)


# ============================================
# Obtener usuario por ID
# ============================================
@bp.route('/<int:id_usuario>', methods=['GET'])
@jwt_required()
def get_usuario(id_usuario):
    current_user_id = get_jwt_identity()
    current_user = UsuarioService.get_usuario_by_id(current_user_id)

    if current_user_id != id_usuario and (not current_user or current_user.get('rol') != 'admin'):
        return Helpers.format_response(False, "No tienes permisos", 403)

    usuario = UsuarioService.get_usuario_with_stats(id_usuario)

    if not usuario:
        return Helpers.format_response(False, "Usuario no encontrado", 404)

    usuario.pop('contrasena', None)

    return Helpers.format_response(True, data=usuario)


# ============================================
# Obtener estadísticas de un usuario
# ============================================
@bp.route('/<int:id_usuario>/estadisticas', methods=['GET'])
@jwt_required()
def get_usuario_estadisticas(id_usuario):
    current_user_id = get_jwt_identity()
    current_user = UsuarioService.get_usuario_by_id(current_user_id)

    # Permitir que el propio usuario vea sus estadísticas o que un admin las vea
    if current_user_id != id_usuario and (not current_user or current_user.get('rol') != 'admin'):
        return Helpers.format_response(False, "No tienes permisos", 403)

    try:
        # Conteo de audios del usuario
        with DatabaseConnection.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            try:
                cursor.execute("SELECT COUNT(*) AS total FROM Audio WHERE id_usuario = %s", (id_usuario,))
                total_audios = cursor.fetchone().get('total', 0)
            except Exception:
                total_audios = 0
            cursor.close()

        # Estadísticas de resultados (stress/anxiety, total, etc.)
        resultados_stats = ResultadosService.get_estadisticas_usuario(id_usuario) or {}
        ultimos = ResultadosService.get_ultimos_resultados(id_usuario, 1) or []
        ultimo_fecha = None
        if ultimos and isinstance(ultimos, list) and len(ultimos) > 0:
            ultimo_fecha = ultimos[0].get('fecha_analisis')

        estadisticas_usuario = {
            'totalAudios': int(total_audios or 0),
            'totalAnalisis': int(resultados_stats.get('total', 0)),
            'promedioEstres': float(resultados_stats.get('promedio_estres', 0)),
            'promedioAnsiedad': float(resultados_stats.get('promedio_ansiedad', 0)),
            'ultimoAnalisis': str(ultimo_fecha) if ultimo_fecha else None,
            'totalGrupos': 0,
            'alertasActivas': 0,
        }

        return Helpers.format_response(True, data=estadisticas_usuario)
    except Exception as e:
        print(f"[ERROR] estadisticas usuario: {str(e)}")
        import traceback
        traceback.print_exc()
        return Helpers.format_response(False, str(e), status=500)


# ============================================
# Buscar usuarios (por nombre / correo) - disponible para usuarios autenticados
# ============================================
@bp.route('/search', methods=['GET'])
@jwt_required()
def search_usuarios():
    q = request.args.get('query', '', type=str)
    if not q or len(q.strip()) < 1:
        return Helpers.format_response(True, data=[])
    try:
        results = UsuarioService.search_users(q.strip(), limit=20)
        return Helpers.format_response(True, data=results)
    except Exception as e:
        print(f"[ERROR] search_usuarios: {e}")
        return Helpers.format_response(False, str(e), status=500)


# ============================================
# Actualizar usuario
# ============================================
@bp.route('/<int:id_usuario>', methods=['PUT'])
@jwt_required()
def update_usuario(id_usuario):
    current_user_id = get_jwt_identity()
    current_user = UsuarioService.get_usuario_by_id(current_user_id)

    if current_user_id != id_usuario and (not current_user or current_user.get('rol') != 'admin'):
        return Helpers.format_response(False, "Sin permisos", 403)

    data = request.json
    result = UsuarioService.update_usuario(id_usuario, data)

    if result.get('success'):
        return Helpers.format_response(True, message=result['message'])

    return Helpers.format_response(False, result.get('error', "Error"), 400)


# ============================================
# Cambiar estado (activar/desactivar) usuario
# ============================================
@bp.route('/<int:id_usuario>/estado', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def set_usuario_estado(id_usuario):
    current_user_id = get_jwt_identity()

    # No permitir que un admin se desactive a sí mismo
    if current_user_id == id_usuario:
        return Helpers.format_response(False, "No puedes desactivar tu propia cuenta", 403)

    data = request.json or {}
    if 'activo' not in data:
        return Helpers.format_response(False, "Falta el campo 'activo'", 400)

    activo = bool(data.get('activo'))
    result = UsuarioService.set_estado_usuario(id_usuario, activo)

    if result.get('success'):
        return Helpers.format_response(True, message=result.get('message', 'Estado actualizado'))

    return Helpers.format_response(False, result.get('error', 'Error actualizando estado'), 400)


# ============================================
# Eliminar usuario
# ============================================
@bp.route('/<int:id_usuario>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_usuario(id_usuario):
    result = UsuarioService.delete_usuario(id_usuario)

    if result.get('success'):
        return Helpers.format_response(True, message=result['message'])

    return Helpers.format_response(False, result.get('error', "Error"), 400)