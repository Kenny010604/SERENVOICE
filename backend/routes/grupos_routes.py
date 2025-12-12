# backend/routes/grupos_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.grupo import Grupo
from models.grupo_miembro import GrupoMiembro
from models.actividad_grupo import ActividadGrupo, ParticipacionActividad

bp = Blueprint('grupos', __name__, url_prefix='/api/grupos')

# ============================================================
# GRUPOS - CRUD
# ============================================================

@bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    """Crear un nuevo grupo"""
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        
        # Validaciones
        if not data.get('nombre_grupo'):
            return jsonify({'error': 'El nombre del grupo es requerido'}), 400
        
        # Crear grupo
        id_grupo = Grupo.create(
            nombre_grupo=data['nombre_grupo'],
            id_facilitador=current_user['id_usuario'],
            descripcion=data.get('descripcion'),
            tipo_grupo=data.get('tipo_grupo', 'apoyo'),
            privacidad=data.get('privacidad', 'privado'),
            max_participantes=data.get('max_participantes'),
            fecha_inicio=data.get('fecha_inicio'),
            fecha_fin=data.get('fecha_fin')
        )
        
        # Agregar al facilitador como miembro
        grupo = Grupo.get_by_id(id_grupo)
        GrupoMiembro.add_member(id_grupo, current_user['id_usuario'], 'facilitador')
        
        return jsonify({
            'message': 'Grupo creado exitosamente',
            'id_grupo': id_grupo,
            'codigo_acceso': grupo['codigo_acceso']
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>', methods=['GET'])
@jwt_required()
def get_group(id_grupo):
    """Obtener información de un grupo"""
    try:
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        # Verificar si el usuario es miembro
        current_user = get_jwt_identity()
        miembro = GrupoMiembro.is_member(id_grupo, current_user['id_usuario'])
        
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
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Verificar que sea facilitador
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        if grupo['id_facilitador'] != current_user['id_usuario']:
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
        current_user = get_jwt_identity()
        
        # Verificar que sea facilitador
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        if grupo['id_facilitador'] != current_user['id_usuario']:
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
        current_user = get_jwt_identity()
        grupo = Grupo.get_by_codigo(codigo)
        
        if not grupo:
            return jsonify({'error': 'Código inválido'}), 404
        
        # Verificar si ya es miembro
        miembro = GrupoMiembro.is_member(grupo['id_grupo'], current_user['id_usuario'])
        if miembro:
            return jsonify({'error': 'Ya eres miembro de este grupo'}), 400
        
        # Verificar límite de participantes
        if not Grupo.verify_max_participantes(grupo['id_grupo']):
            return jsonify({'error': 'El grupo ha alcanzado su límite de participantes'}), 400
        
        # Agregar miembro
        GrupoMiembro.add_member(grupo['id_grupo'], current_user['id_usuario'])
        
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
        current_user = get_jwt_identity()
        grupos = GrupoMiembro.get_user_groups(current_user['id_usuario'])
        
        return jsonify(grupos), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>/miembros', methods=['GET'])
@jwt_required()
def get_group_members(id_grupo):
    """Obtener miembros de un grupo"""
    try:
        current_user = get_jwt_identity()
        
        # Verificar acceso
        miembro = GrupoMiembro.is_member(id_grupo, current_user['id_usuario'])
        if not miembro:
            return jsonify({'error': 'No tienes acceso a este grupo'}), 403
        
        miembros = GrupoMiembro.get_group_members(id_grupo)
        return jsonify(miembros), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id_grupo>/miembros/<int:id_usuario>', methods=['DELETE'])
@jwt_required()
def remove_member(id_grupo, id_usuario):
    """Remover un miembro del grupo"""
    try:
        current_user = get_jwt_identity()
        
        # Verificar que sea facilitador o el mismo usuario
        grupo = Grupo.get_by_id(id_grupo)
        if not grupo:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        is_facilitator = grupo['id_facilitador'] == current_user['id_usuario']
        is_self = current_user['id_usuario'] == id_usuario
        
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
        current_user = get_jwt_identity()
        
        # Verificar acceso
        miembro = GrupoMiembro.is_member(id_grupo, current_user['id_usuario'])
        if not miembro:
            return jsonify({'error': 'No tienes acceso a este grupo'}), 403
        
        stats = Grupo.get_estadisticas(id_grupo)
        if not stats:
            return jsonify({'error': 'Grupo no encontrado'}), 404
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================
# ACTIVIDADES - CRUD
# ============================================================

@bp.route('/<int:id_grupo>/actividades', methods=['POST'])
@jwt_required()
def create_activity(id_grupo):
    """Crear una nueva actividad para el grupo"""
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Verificar que sea miembro (facilitador o co-facilitador)
        miembro = GrupoMiembro.is_member(id_grupo, current_user['id_usuario'])
        if not miembro or miembro['rol_grupo'] not in ['facilitador', 'co_facilitador']:
            return jsonify({'error': 'No tienes permiso para crear actividades'}), 403
        
        # Validaciones
        if not data.get('titulo'):
            return jsonify({'error': 'El título es requerido'}), 400
        
        # Crear actividad
        id_actividad = ActividadGrupo.create(
            id_grupo=id_grupo,
            id_creador=current_user['id_usuario'],
            titulo=data['titulo'],
            descripcion=data.get('descripcion'),
            tipo_actividad=data.get('tipo_actividad', 'tarea'),
            fecha_programada=data.get('fecha_programada'),
            duracion_estimada=data.get('duracion_estimada')
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
        current_user = get_jwt_identity()
        
        # Verificar acceso
        miembro = GrupoMiembro.is_member(id_grupo, current_user['id_usuario'])
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
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Verificar que la actividad existe
        actividad = ActividadGrupo.get_by_id(id_actividad)
        if not actividad:
            return jsonify({'error': 'Actividad no encontrada'}), 404
        
        # Verificar que sea miembro del grupo
        miembro = GrupoMiembro.is_member(actividad['id_grupo'], current_user['id_usuario'])
        if not miembro:
            return jsonify({'error': 'No eres miembro de este grupo'}), 403
        
        # Verificar si ya participó
        participacion = ParticipacionActividad.get_user_participation(
            id_actividad, current_user['id_usuario']
        )
        if participacion:
            return jsonify({'error': 'Ya estás registrado en esta actividad'}), 400
        
        # Registrar participación
        id_participacion = ParticipacionActividad.create(
            id_actividad=id_actividad,
            id_usuario=current_user['id_usuario'],
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
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Verificar que sea su participación
        participacion = ParticipacionActividad.get_by_id(id_participacion)
        if not participacion:
            return jsonify({'error': 'Participación no encontrada'}), 404
        
        if participacion['id_usuario'] != current_user['id_usuario']:
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
