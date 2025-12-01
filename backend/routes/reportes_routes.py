# backend/routes/reportes_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.reportes_service import ReportesService
from utils.helpers import Helpers
from datetime import datetime

bp = Blueprint('reportes', __name__, url_prefix='/api/reportes')

@bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_report():
    """Generar nuevo reporte"""
    user_id = get_jwt_identity()
    data = request.json
    
    if not data or 'fecha_inicio' not in data or 'fecha_fin' not in data:
        return Helpers.format_response(
            success=False,
            message='Fechas de inicio y fin son requeridas',
            status=400
        )
    
    try:
        fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d').date()
        fecha_fin = datetime.strptime(data['fecha_fin'], '%Y-%m-%d').date()
    except ValueError:
        return Helpers.format_response(
            success=False,
            message='Formato de fecha inválido. Use YYYY-MM-DD',
            status=400
        )
    
    if fecha_inicio > fecha_fin:
        return Helpers.format_response(
            success=False,
            message='La fecha de inicio debe ser anterior a la fecha de fin',
            status=400
        )
    
    formato = data.get('formato', 'pdf')
    
    result = ReportesService.generate_report(user_id, fecha_inicio, fecha_fin, formato)
    
    if result['success']:
        return Helpers.format_response(
            success=True,
            data=result,
            message='Reporte generado exitosamente',
            status=201
        )
    
    return Helpers.format_response(
        success=False,
        message=result['error'],
        status=400
    )

@bp.route('/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    """Obtener reportes del usuario actual"""
    user_id = get_jwt_identity()
    reportes = ReportesService.get_user_reports(user_id)
    
    return Helpers.format_response(
        success=True,
        data=reportes,
        status=200
    )

@bp.route('/<int:id_reporte>', methods=['GET'])
@jwt_required()
def get_report(id_reporte):
    """Obtener detalles de un reporte"""
    user_id = get_jwt_identity()
    
    reporte_data = ReportesService.get_report_with_results(id_reporte)
    
    if not reporte_data:
        return Helpers.format_response(
            success=False,
            message='Reporte no encontrado',
            status=404
        )
    
    # Verificar permisos
    if reporte_data['reporte']['id_usuario'] != user_id:
        return Helpers.format_response(
            success=False,
            message='No tienes permisos para ver este reporte',
            status=403
        )
    
    return Helpers.format_response(
        success=True,
        data=reporte_data,
        status=200
    )