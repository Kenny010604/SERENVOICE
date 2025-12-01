# backend/routes/alertas_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.alertas_service import AlertasService
from utils.helpers import Helpers
from utils.seguridad import role_required

bp = Blueprint('alertas', __name__, url_prefix='/api/alertas')

@bp.route('/my-alerts', methods=['GET'])
@jwt_required()
def get_my_alerts():
    """Obtener alertas del usuario actual"""
    user_id = get_jwt_identity()
    alertas = AlertasService.get_user_alerts(user_id)
    
    return Helpers.format_response(
        success=True,
        data=alertas,
        status=200
    )

@bp.route('/active', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_active_alerts():
    """Obtener todas las alertas activas (solo admin)"""
    alertas = AlertasService.get_active_alerts()
    
    return Helpers.format_response(
        success=True,
        data=alertas,
        status=200
    )

@bp.route('/<int:id_alerta>', methods=['GET'])
@jwt_required()
def get_alert(id_alerta):
    """Obtener alerta específica"""
    alerta = AlertasService.get_alert_by_id(id_alerta)
    
    if not alerta:
        return Helpers.format_response(
            success=False,
            message='Alerta no encontrada',
            status=404
        )
    
    return Helpers.format_response(
        success=True,
        data=alerta,
        status=200
    )