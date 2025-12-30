# backend/routes/recomendaciones_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.recomendacion import Recomendacion
from models.resultado_analisis import ResultadoAnalisis
from models.analisis import Analisis
from models.audio import Audio
from database.connection import DatabaseConnection
from utils.helpers import Helpers

bp = Blueprint('recomendaciones', __name__, url_prefix='/api/recomendaciones')

@bp.route('', methods=['GET'])
@jwt_required()
def get_recomendaciones_usuario():
    """Obtener todas las recomendaciones del usuario actual"""
    user_id = get_jwt_identity()
    
    try:
        print(f"[DEBUG] Buscando recomendaciones para user_id: {user_id}")
        
        # Query simple sin joins complejos
        query = """
            SELECT r.* FROM recomendaciones r
            WHERE r.activo = 1
            LIMIT 100
        """
        
        result = DatabaseConnection.execute_query(query, fetch=True)
        print(f"[DEBUG] Resultado de query: {result}")
        
        return Helpers.format_response(
            success=True,
            data={'recomendaciones': result or []},
            status=200
        )
    except Exception as e:
        print(f"[ERROR] get_recomendaciones_usuario: {str(e)}")
        import traceback
        traceback.print_exc()
        return Helpers.format_response(
            success=False,
            message=f'Error al obtener recomendaciones: {str(e)}',
            status=500
        )

@bp.route('/resultado/<int:id_resultado>', methods=['GET'])
@jwt_required()
def get_recomendaciones_by_resultado(id_resultado):
    """Obtener recomendaciones de un resultado"""
    user_id = get_jwt_identity()
    
    # Verificar permisos
    resultado = ResultadoAnalisis.get_by_id(id_resultado)
    if not resultado:
        return Helpers.format_response(
            success=False,
            message='Resultado no encontrado',
            status=404
        )
    
    analisis = Analisis.get_by_id(resultado['id_analisis'])
    audio = Audio.get_by_id(analisis['id_audio'])
    
    if audio['id_usuario'] != user_id:
        return Helpers.format_response(
            success=False,
            message='No tienes permisos para ver estas recomendaciones',
            status=403
        )
    
    recomendaciones = Recomendacion.get_by_result(id_resultado)
    
    return Helpers.format_response(
        success=True,
        data=recomendaciones,
        status=200
    )

@bp.route('/<int:id_recomendacion>', methods=['GET'])
@jwt_required()
def get_recomendacion(id_recomendacion):
    """Obtener una recomendación específica"""
    user_id = get_jwt_identity()
    
    recomendacion = Recomendacion.get_by_id(id_recomendacion)
    
    if not recomendacion:
        return Helpers.format_response(
            success=False,
            message='Recomendación no encontrada',
            status=404
        )
    
    # Verificar permisos
    resultado = ResultadoAnalisis.get_by_id(recomendacion['id_resultado'])
    analisis = Analisis.get_by_id(resultado['id_analisis'])
    audio = Audio.get_by_id(analisis['id_audio'])
    
    if audio['id_usuario'] != user_id:
        return Helpers.format_response(
            success=False,
            message='No tienes permisos',
            status=403
        )
    
    return Helpers.format_response(
        success=True,
        data=recomendacion,
        status=200
    )