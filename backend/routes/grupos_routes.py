# backend/routes/grupos_routes.py
from flask import Blueprint, request, jsonify
import traceback
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.grupo import Grupo
from models.grupo_miembro import GrupoMiembro
from models.actividad_grupo import ActividadGrupo, ParticipacionActividad
from models.usuario import Usuario
from datetime import datetime

bp = Blueprint('grupos', __name__, url_prefix='/api/grupos')

# ============================================================
# GRUPOS - CRUD
# ============================================================

@bp.route('/', methods=['GET'])
@jwt_required()
def get_all_groups():
    """Obtener todos los grupos disponibles (públicos o donde el usuario es miembro)"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            # Si por alguna razón el identity es un dict
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity

        # Obtener los grupos del usuario
        grupos_usuario = GrupoMiembro.get_user_groups(current_user_id)
        
        return jsonify(grupos_usuario), 200
        
    except Exception as e:
        tb = traceback.format_exc()
        print("[GRUPOS] Error en get_all_groups:\n", tb)
        return jsonify({'error': str(e), 'trace': tb}), 500


@bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    """Crear un nuevo grupo"""
    try:
        data = request.get_json() or {}
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity

        # Aceptar tanto 'nombre_grupo' como 'nombre' desde el frontend
        nombre = data.get('nombre_grupo') or data.get('nombre')
        descripcion = data.get('descripcion') or data.get('description')

        # Validaciones
        if not nombre:
            return jsonify({'error': 'El nombre del grupo es requerido'}), 400

        # Crear grupo
        id_grupo = Grupo.create(
            nombre_grupo=nombre,
            id_facilitador=current_user_id,
            descripcion=descripcion,
            tipo_grupo=data.get('tipo_grupo', 'apoyo'),
            privacidad=data.get('privacidad', 'privado'),
            max_participantes=data.get('max_participantes'),
            fecha_inicio=data.get('fecha_inicio'),
            fecha_fin=data.get('fecha_fin')
        )
        
        # Si el método devolvió un dict con metadata, extraer el id
        created_id = None
        if isinstance(id_grupo, dict):
            created_id = id_grupo.get('last_id') or id_grupo.get('lastrowid') or id_grupo.get('lastInsertId')
        else:
            try:
                created_id = int(id_grupo)
            except Exception:
                created_id = id_grupo

        # Agregar al facilitador como miembro
        grupo = Grupo.get_by_id(created_id)
        GrupoMiembro.add_member(created_id, current_user_id, 'facilitador')

        return jsonify({
            'message': 'Grupo creado exitosamente',
            'id_grupo': created_id,
            'codigo_acceso': grupo.get('codigo_acceso') if grupo else None
        }), 201
        
    except Exception as e:
        tb = traceback.format_exc()
        print("[GRUPOS] Error en create_group:\n", tb)
        return jsonify({'error': str(e), 'trace': tb}), 500


@bp.route('/<int:id_grupo>', methods=['GET'])
@jwt_required()
def get_group(id_grupo):
    """Obtener información de un grupo"""
    try:
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        # Verificar si el usuario es miembro
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity

        miembro = GrupoMiembro.is_member(id_grupo, current_user_id)
        
        if not miembro and grupo['privacidad'] == 'privado':
            return jsonify({'error': 'No tienes acceso a este grupo'}), 403
        
        return jsonify(grupo), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>', methods=['PUT'])
@jwt_required()
def update_group(id_grupo):
    """Actualizar información del grupo"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        data = request.get_json()
        
        # Verificar que sea facilitador
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        if grupo['id_facilitador'] != current_user_id:
            return jsonify({'error': 'Solo el facilitador puede actualizar el grupo'}), 403
        
        # Actualizar
        Grupo.update(id_grupo, **data)
        
        return jsonify({'message': 'Grupo actualizado exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>', methods=['DELETE'])
@jwt_required()
def delete_group(id_grupo):
    """Eliminar un grupo (soft delete)"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        
        # Verificar que sea facilitador
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        if grupo['id_facilitador'] != current_user_id:
            return jsonify({'error': 'Solo el facilitador puede eliminar el grupo'}), 403
        
        Grupo.delete(id_grupo)
        return jsonify({'message': 'Grupo eliminado exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================
# MIEMBROS - GESTIÓN
# ============================================================

@bp.route('/codigo/<codigo>', methods=['POST'])
@jwt_required()
def join_group(codigo):
    """Unirse a un grupo por código de acceso"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        grupo = Grupo.get_by_codigo(codigo)
        
        if not grupo:
            return jsonify({'error': 'Código inválido'}), 404
        
        # Verificar si ya es miembro
        miembro = GrupoMiembro.is_member(grupo['id_grupo'], current_user_id)
        if miembro:
            return jsonify({'error': 'Ya eres miembro de este grupo'}), 400
        
        # Verificar límite de participantes
        if not Grupo.verify_max_participantes(grupo['id_grupo']):
            return jsonify({'error': 'El grupo ha alcanzado su límite de participantes'}), 400
        
        # Agregar miembro
        GrupoMiembro.add_member(grupo['id_grupo'], current_user_id)
        
        return jsonify({
            'message': 'Te has unido al grupo exitosamente',
            'grupo': grupo
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/mis-grupos', methods=['GET'])
@jwt_required()
def get_my_groups():
    """Obtener grupos del usuario actual"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        grupos = GrupoMiembro.get_user_groups(current_user_id)
        
        return jsonify(grupos), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>/miembros', methods=['GET'])
@jwt_required()
def get_group_members(id_grupo):
    """Obtener miembros de un grupo"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity

        # Verificar acceso
        miembro = GrupoMiembro.is_member(id_grupo, current_user_id)
        if not miembro:
            return jsonify({'error': 'No tienes acceso a este grupo'}), 403
        
        miembros = GrupoMiembro.get_group_members(id_grupo)
        return jsonify(miembros), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>/miembros', methods=['POST'])
@jwt_required()
def add_group_member(id_grupo):
    """Agregar un miembro al grupo (por usuario existente). Acepta payload con 'usuario_id' o 'correo'."""
    try:
        data = request.get_json() or {}
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity

        # Verificar que el grupo existe
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404

        # Verificar permisos: solo facilitador o co_facilitador pueden agregar
        miembro_actual = GrupoMiembro.is_member(id_grupo, current_user_id)
        if not miembro_actual or miembro_actual.get('rol_grupo') not in ['facilitador', 'co_facilitador']:
            return jsonify({'error': 'No tienes permiso para agregar miembros'}), 403

        usuario_id = data.get('usuario_id') or data.get('id')
        if not usuario_id and data.get('correo'):
            usuario = Usuario.get_by_email(data.get('correo'))
            if usuario:
                usuario_id = usuario.get('id_usuario') or usuario.get('id')

        if not usuario_id:
            return jsonify({'error': 'Se requiere usuario_id o correo del usuario existente'}), 400

        # Evitar duplicados
        if GrupoMiembro.is_member(id_grupo, usuario_id):
            return jsonify({'error': 'El usuario ya es miembro del grupo'}), 400

        GrupoMiembro.add_member(id_grupo, usuario_id)
        return jsonify({'message': 'Miembro agregado exitosamente'}), 201

    except Exception as e:
        tb = traceback.format_exc()
        print('[GRUPOS] Error en add_group_member:\n', tb)
        return jsonify({'error': str(e), 'trace': tb}), 500


@bp.route('/<int:id_grupo>/miembros/<int:id_usuario>', methods=['DELETE'])
@jwt_required()
def remove_member(id_grupo, id_usuario):
    """Remover un miembro del grupo"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        
        # Verificar que sea facilitador o el mismo usuario
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        is_facilitator = grupo['id_facilitador'] == current_user_id
        is_self = current_user_id == id_usuario
        
        if not (is_facilitator or is_self):
            return jsonify({'error': 'No tienes permiso para esta acción'}), 403
        
        GrupoMiembro.remove_member(id_grupo, id_usuario)
        return jsonify({'message': 'Miembro removido exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>/estadisticas', methods=['GET'])
@jwt_required()
def get_group_stats(id_grupo):
    """Obtener estadísticas del grupo usando vista optimizada"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity

        # Verificar acceso
        miembro = GrupoMiembro.is_member(id_grupo, current_user_id)
        if not miembro:
            return jsonify({'error': 'No tienes acceso a este grupo'}), 403
        
        stats = Grupo.get_estadisticas(id_grupo)
        if not stats:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/estadisticas', methods=['GET'])
@jwt_required()
def get_global_group_stats():
    """Endpoint de compatibilidad: estadísticas globales de grupos"""
    try:
        # Usar la vista o consultas directas para agregar métricas simples
        from database.connection import DatabaseConnection

        result = DatabaseConnection.execute_query(
            "SELECT COUNT(*) AS activos FROM grupos WHERE activo = 1"
        )
        activos = result[0]['activos'] if result else 0

        return jsonify({'activos': activos}), 200
    except Exception as e:
        tb = traceback.format_exc()
        print('[GRUPOS] Error en get_global_group_stats:\n', tb)
        return jsonify({'error': str(e), 'trace': tb}), 500


# ============================================================
# ACTIVIDADES - CRUD
# ============================================================

@bp.route('/<int:id_grupo>/actividades', methods=['POST'])
@jwt_required()
def create_activity(id_grupo):
    """Crear una nueva actividad para el grupo"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        data = request.get_json()
        
        # Verificar que sea miembro (facilitador o co-facilitador)
        miembro = GrupoMiembro.is_member(id_grupo, current_user_id)
        if not miembro or miembro['rol_grupo'] not in ['facilitador', 'co_facilitador']:
            return jsonify({'error': 'No tienes permiso para crear actividades'}), 403
        
        # Validaciones
        if not data.get('titulo'):
            return jsonify({'error': 'El título es requerido'}), 400
        
        # Parsear fechas (el frontend envía YYYY-MM-DD)
        def parse_date_field(key):
            v = data.get(key)
            if not v:
                return None
            try:
                # aceptar 'YYYY-MM-DD' y también ISO datetimes
                return datetime.strptime(v, '%Y-%m-%d').date()
            except Exception:
                try:
                    return datetime.fromisoformat(v).date()
                except Exception:
                    return v

        fecha_inicio = parse_date_field('fecha_inicio')
        fecha_fin = parse_date_field('fecha_fin')

        # Crear actividad
        id_actividad = ActividadGrupo.create(
            id_grupo=id_grupo,
            id_creador=current_user_id,
            titulo=data['titulo'],
            descripcion=data.get('descripcion'),
            tipo_actividad=data.get('tipo_actividad', 'tarea'),
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )
        
        return jsonify({
            'message': 'Actividad creada exitosamente',
            'id_actividad': id_actividad
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>/actividades', methods=['GET'])
@jwt_required()
def get_group_activities(id_grupo):
    """Obtener actividades de un grupo"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity

        # Verificar acceso
        miembro = GrupoMiembro.is_member(id_grupo, current_user_id)
        if not miembro:
            return jsonify({'error': 'No tienes acceso a este grupo'}), 403
        
        completada = request.args.get('completada')
        if completada is not None:
            completada = completada.lower() == 'true'
        
        actividades = ActividadGrupo.get_by_grupo(id_grupo, completada)
        return jsonify(actividades), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/actividades/<int:id_actividad>', methods=['GET'])
@jwt_required()
def get_activity(id_actividad):
    """Obtener detalles de una actividad"""
    try:
        actividad = ActividadGrupo.get_by_id(id_actividad)
        if not actividad:
            return jsonify({'error': 'Actividad no encontrada'}), 404
        
        return jsonify(actividad), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/actividades/<int:id_actividad>/participar', methods=['POST'])
@jwt_required()
def participate_activity(id_actividad):
    """Registrar participación en una actividad"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        data = request.get_json()
        
        # Verificar que la actividad existe
        actividad = ActividadGrupo.get_by_id(id_actividad)
        if not actividad:
            return jsonify({'error': 'Actividad no encontrada'}), 404
        
        # Verificar que sea miembro del grupo
        miembro = GrupoMiembro.is_member(actividad['id_grupo'], current_user_id)
        if not miembro:
            return jsonify({'error': 'No eres miembro de este grupo'}), 403
        
        # Verificar si ya participó
        participacion = ParticipacionActividad.get_user_participation(
            id_actividad, current_user_id
        )
        if participacion:
            return jsonify({'error': 'Ya estás registrado en esta actividad'}), 400
        
        # Registrar participación
        id_participacion = ParticipacionActividad.create(
            id_actividad=id_actividad,
            id_usuario=current_user_id,
            estado_emocional_antes=data.get('estado_emocional_antes'),
            notas_participante=data.get('notas')
        )
        
        return jsonify({
            'message': 'Participación registrada exitosamente',
            'id_participacion': id_participacion
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/participacion/<int:id_participacion>/completar', methods=['PUT'])
@jwt_required()
def complete_participation(id_participacion):
    """Marcar participación como completada"""
    try:
        identity = get_jwt_identity()
        try:
            current_user_id = int(identity)
        except Exception:
            current_user_id = identity.get('id_usuario') if isinstance(identity, dict) else identity
        data = request.get_json()
        
        # Verificar que sea su participación
        participacion = ParticipacionActividad.get_by_id(id_participacion)
        if not participacion:
            return jsonify({'error': 'Participación no encontrada'}), 404
        
        if participacion['id_usuario'] != current_user_id:
            return jsonify({'error': 'No puedes modificar esta participación'}), 403
        
        # Marcar como completada
        ParticipacionActividad.mark_completed(
            id_participacion=id_participacion,
            estado_emocional_despues=data.get('estado_emocional_despues'),
            notas_participante=data.get('notas')
        )
        
        return jsonify({'message': 'Participación completada exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
