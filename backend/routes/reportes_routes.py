# backend/routes/reportes_routes.py
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.reportes_service import ReportesService
from utils.helpers import Helpers
from utils.seguridad import role_required
from database.connection import DatabaseConnection
from datetime import datetime
import traceback
import io
import csv

bp = Blueprint('reportes', __name__, url_prefix='/api/reportes')

@bp.route('/generar', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def generar_reporte():
    """Generar reporte según parámetros"""
    try:
        tipo = request.args.get('tipo', 'general')
        id_usuario = request.args.get('id_usuario', type=int)
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        def table_exists(cur, table_name):
            cur.execute(
                "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = %s",
                (table_name,)
            )
            return cur.fetchone()['cnt'] > 0
        
        data = {}
        
        if tipo == 'general':
            # Reporte general del sistema
            cursor.execute("SELECT COUNT(*) as total FROM usuario")
            data['total_usuarios'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM usuario WHERE activo = TRUE")
            data['usuarios_activos'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM grupos")
            data['total_grupos'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM analisis")
            data['total_analisis'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM alerta_analisis WHERE tipo_alerta = 'critica'")
            data['alertas_criticas'] = cursor.fetchone()['total']
            
            if table_exists(cursor, 'sesion'):
                cursor.execute("SELECT COUNT(*) as total FROM sesion WHERE fecha_fin IS NULL")
                data['sesiones_activas'] = cursor.fetchone()['total']
            else:
                data['sesiones_activas'] = 0
            
            cursor.execute("SELECT COUNT(*) as total FROM recomendaciones")
            data['recomendaciones_generadas'] = cursor.fetchone()['total']
            
            cursor.execute("SELECT COUNT(*) as total FROM recomendaciones WHERE aplica = TRUE")
            aplicadas = cursor.fetchone()['total']
            data['tasa_aplicacion'] = round((aplicadas / max(data['recomendaciones_generadas'], 1)) * 100, 1)
            
        elif tipo == 'individual' and id_usuario:
            # Reporte individual de usuario
            cursor.execute("SELECT nombre, correo FROM usuario WHERE id_usuario = %s", (id_usuario,))
            usuario = cursor.fetchone()
            data['usuario'] = usuario
            
            cursor.execute("""
                SELECT COUNT(*) as total 
                FROM analisis a
                    LEFT JOIN audio ar ON a.id_audio = ar.id_audio
                WHERE ar.id_usuario = %s
            """, (id_usuario,))
            data['total_analisis'] = cursor.fetchone()['total']
            
            if table_exists(cursor, 'sesiones_juego'):
                cursor.execute("SELECT COUNT(*) as total FROM sesiones_juego WHERE id_usuario = %s", (id_usuario,))
                data['total_sesiones'] = cursor.fetchone()['total']
            else:
                data['total_sesiones'] = 0
            
            cursor.execute("""
                SELECT COUNT(*) as total 
                FROM alerta_analisis aa
                LEFT JOIN resultado_analisis ra ON aa.id_resultado = ra.id_resultado
                LEFT JOIN analisis a ON ra.id_analisis = a.id_analisis
                    LEFT JOIN audio ar ON a.id_audio = ar.id_audio
                WHERE ar.id_usuario = %s
            """, (id_usuario,))
            data['alertas_generadas'] = cursor.fetchone()['total']
            
            cursor.execute("""
                SELECT COUNT(*) as total 
                FROM recomendaciones r
                LEFT JOIN resultado_analisis ra ON r.id_resultado = ra.id_resultado
                LEFT JOIN analisis a ON ra.id_analisis = a.id_analisis
                    LEFT JOIN audio ar ON a.id_audio = ar.id_audio
                WHERE ar.id_usuario = %s
            """, (id_usuario,))
            data['recomendaciones_recibidas'] = cursor.fetchone()['total']
            
            cursor.execute("""
                SELECT COUNT(*) as total 
                FROM recomendaciones r
                LEFT JOIN resultado_analisis ra ON r.id_resultado = ra.id_resultado
                LEFT JOIN analisis a ON ra.id_analisis = a.id_analisis
                    LEFT JOIN audio ar ON a.id_audio = ar.id_audio
                WHERE ar.id_usuario = %s AND r.aplica = TRUE
            """, (id_usuario,))
            data['recomendaciones_aplicadas'] = cursor.fetchone()['total']
            
        elif tipo == 'comparativo':
            # Reporte comparativo de usuarios
            # Comparative report: sessions table may not exist in schema; include a placeholder column
            query = """
                SELECT 
                    u.nombre,
                    u.correo as email,
                    COUNT(DISTINCT a.id_analisis) as total_analisis,
                    0 as total_sesiones,
                    COUNT(DISTINCT aa.id_alerta) as total_alertas,
                    AVG(ra.nivel_estres) as nivel_estres_promedio
                FROM usuario u
                    LEFT JOIN audio ar ON u.id_usuario = ar.id_usuario
                LEFT JOIN analisis a ON ar.id_audio = a.id_audio
                LEFT JOIN resultado_analisis ra ON a.id_analisis = ra.id_analisis
                LEFT JOIN alerta_analisis aa ON ra.id_resultado = aa.id_resultado
                GROUP BY u.id_usuario, u.nombre, u.correo
                ORDER BY total_analisis DESC
                LIMIT 50
            """
            cursor.execute(query)
            data['usuarios'] = cursor.fetchall()
            
        elif tipo == 'historico':
            # Reporte histórico por fechas
            where_clause = ""
            params = []
            
            if fecha_inicio and fecha_fin:
                where_clause = "WHERE DATE(a.fecha_analisis) BETWEEN %s AND %s"
                params = [fecha_inicio, fecha_fin]

            # Historical report based on analysis dates (analisis.fecha_analisis)
            query = f"""
                SELECT
                    DATE(a.fecha_analisis) as fecha,
                    COUNT(DISTINCT a.id_audio) as total_audios,
                    COUNT(DISTINCT a.id_analisis) as total_analisis,
                    COUNT(DISTINCT aa.id_alerta) as total_alertas
                FROM analisis a
                LEFT JOIN resultado_analisis ra ON a.id_analisis = ra.id_analisis
                LEFT JOIN alerta_analisis aa ON ra.id_resultado = aa.id_resultado
                {where_clause}
                GROUP BY DATE(a.fecha_analisis)
                ORDER BY fecha DESC
                LIMIT 30
            """
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            data['historico'] = cursor.fetchall()
        
        cursor.close()
        DatabaseConnection.return_connection(conn)
        
        return Helpers.format_response(
            success=True,
            data=data,
            status=200
        )
        
    except Exception as e:
        # Log full traceback to help debugging
        print(f"[ERROR] Excepción al generar reporte: {str(e)}")
        traceback.print_exc()
        return Helpers.format_response(
            success=False,
            message=f'Error al generar reporte: {str(e)}',
            status=500
        )

@bp.route('/exportar', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def exportar_reporte():
    """Exportar reporte en diferentes formatos"""
    try:
        formato = request.args.get('formato', 'csv')
        tipo = request.args.get('tipo', 'general')
        
        # Por ahora solo soportamos CSV
        # PDF y Excel requieren librerías adicionales como reportlab y openpyxl
        
        if formato == 'csv':
            # Reutilizar la función de generar para obtener los datos
            # En producción, esto debería ser más eficiente
            return Helpers.format_response(
                success=True,
                message='Use la funcionalidad de exportación del frontend',
                status=200
            )
        
        return Helpers.format_response(
            success=False,
            message=f'Formato {formato} no soportado aún',
            status=400
        )
        
    except Exception as e:
        return Helpers.format_response(
            success=False,
            message=f'Error al exportar: {str(e)}',
            status=500
        )

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