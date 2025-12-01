# backend/routes/audio_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.audio_service import AudioService
from utils.helpers import Helpers

bp = Blueprint('audios', __name__, url_prefix='/api/audios')

@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_audio():
    """Subir y procesar audio"""
    user_id = get_jwt_identity()
    
    if 'audio' not in request.files:
        return Helpers.format_response(
            success=False,
            message='No se encontró archivo de audio',
            status=400
        )
    
    file = request.files['audio']
    
    if file.filename == '':
        return Helpers.format_response(
            success=False,
            message='Nombre de archivo vacío',
            status=400
        )
    
    result = AudioService.upload_and_process(file, user_id)
    
    if result['success']:
        return Helpers.format_response(
            success=True,
            data=result,
            message='Audio procesado exitosamente',
            status=200
        )
    
    return Helpers.format_response(
        success=False,
        message=result['error'],
        status=400
    )

@bp.route('/my-audios', methods=['GET'])
@jwt_required()
def get_my_audios():
    """Obtener audios del usuario actual"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    audios = AudioService.get_user_audios(user_id, page, per_page)
    
    return Helpers.format_response(
        success=True,
        data=Helpers.paginate_results(audios, page, per_page),
        status=200
    )

@bp.route('/<int:id_audio>', methods=['DELETE'])
@jwt_required()
def delete_audio(id_audio):
    """Eliminar audio"""
    from models.audio import Audio
    
    user_id = get_jwt_identity()
    audio = Audio.get_by_id(id_audio)
    
    if not audio:
        return Helpers.format_response(
            success=False,
            message='Audio no encontrado',
            status=404
        )
    
    # Verificar que el audio pertenece al usuario
    if audio['id_usuario'] != user_id:
        return Helpers.format_response(
            success=False,
            message='No tienes permisos para eliminar este audio',
            status=403
        )
    
    result = AudioService.delete_audio(id_audio)
    
    if result['success']:
        return Helpers.format_response(
            success=True,
            message=result['message'],
            status=200
        )
    
    return Helpers.format_response(
        success=False,
        message=result['error'],
        status=400
    )