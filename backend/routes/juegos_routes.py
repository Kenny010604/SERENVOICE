# backend/routes/juegos_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

print("[DEBUG] juegos_routes.py - Inicio de carga del módulo")

# Intentar importar modelos y extensiones
try:
    from models.juego_model import JuegoTerapeutico, SesionJuego
    print("[DEBUG] OK - Modelos JuegoTerapeutico y SesionJuego importados")
    HAS_MODELS = True
except ImportError as e:
    print(f"[DEBUG] ADVERTENCIA - No se pudieron importar modelos: {e}")
    HAS_MODELS = False

try:
    from extensions import db
    print("[DEBUG] OK - Extension db importada")
    HAS_DB = True
except ImportError as e:
    print(f"[DEBUG] ADVERTENCIA - No se pudo importar db: {e}")
    HAS_DB = False

from sqlalchemy.exc import SQLAlchemyError

# Crear Blueprint con url_prefix
juegos_bp = Blueprint('juegos', __name__, url_prefix='/juegos')
print("[DEBUG] OK - Blueprint 'juegos' creado con url_prefix='/juegos'")


@juegos_bp.route('/recomendados', methods=['GET'])
def juegos_recomendados():
    """
    Obtiene juegos recomendados según el estado emocional
    Sin autenticación para facilitar pruebas
    """
    try:
        estado = request.args.get('estado', 'estable').lower()
        print(f"[JUEGOS] Solicitud de juegos recomendados - Estado: {estado}")
        
        # Mapeo de estado a tipos de juegos
        mapeo_juegos = {
            'critico': ['respiracion', 'mindfulness'],
            'alerta': ['respiracion', 'puzzle', 'mandala'],
            'precaucion': ['puzzle', 'memoria', 'mandala'],
            'estable': ['memoria', 'puzzle'],
            'positivo': ['memoria', 'puzzle', 'mandala']
        }
        
        tipos_recomendados = mapeo_juegos.get(estado, ['memoria', 'puzzle'])
        print(f"[JUEGOS] Tipos recomendados: {tipos_recomendados}")
        
        # Intentar obtener de la base de datos
        if HAS_MODELS and HAS_DB:
            try:
                print("[JUEGOS] Consultando base de datos...")
                juegos = JuegoTerapeutico.query.filter(
                    JuegoTerapeutico.tipo_juego.in_(tipos_recomendados),
                    JuegoTerapeutico.activo == True
                ).limit(10).all()
                
                juegos_data = [juego.to_dict() for juego in juegos]
                print(f"[JUEGOS] OK - {len(juegos_data)} juegos encontrados en BD")
                
                return jsonify({
                    'success': True,
                    'estado': estado,
                    'juegos_recomendados': juegos_data,
                    'fuente': 'base_de_datos'
                }), 200
                
            except Exception as db_error:
                print(f"[JUEGOS] ADVERTENCIA - Error al consultar BD: {db_error}")
                # Continuar con datos de ejemplo si falla la BD
        
        # Datos de ejemplo como fallback
        print("[JUEGOS] ADVERTENCIA - Usando datos de ejemplo (fallback)")
        juegos_ejemplo = [
            {
                "id": 1,
                "nombre": "Respiración Consciente",
                "descripcion": "Ejercicios guiados de respiración para calmar la mente",
                "tipo_juego": "respiracion",
                "duracion_minutos": 5,
                "dificultad": "facil",
                "imagen_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
                "activo": True
            },
            {
                "id": 2,
                "nombre": "Puzzle Zen",
                "descripcion": "Rompecabezas relajantes para mejorar concentración",
                "tipo_juego": "puzzle",
                "duracion_minutos": 10,
                "dificultad": "media",
                "imagen_url": "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400",
                "activo": True
            },
            {
                "id": 3,
                "nombre": "Mandala Digital",
                "descripcion": "Colorea mandalas para reducir estrés",
                "tipo_juego": "mandala",
                "duracion_minutos": 15,
                "dificultad": "facil",
                "imagen_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
                "activo": True
            },
            {
                "id": 4,
                "nombre": "Memoria Emocional",
                "descripcion": "Juego de memoria con emociones positivas",
                "tipo_juego": "memoria",
                "duracion_minutos": 8,
                "dificultad": "media",
                "imagen_url": "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400",
                "activo": True
            },
            {
                "id": 5,
                "nombre": "Mindfulness Garden",
                "descripcion": "Cuida tu jardín virtual con ejercicios de mindfulness",
                "tipo_juego": "mindfulness",
                "duracion_minutos": 12,
                "dificultad": "facil",
                "imagen_url": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400",
                "activo": True
            }
        ]
        
        # Filtrar juegos por tipo
        juegos_filtrados = [
            juego for juego in juegos_ejemplo 
            if juego['tipo_juego'] in tipos_recomendados
        ]
        
        return jsonify({
            'success': True,
            'estado': estado,
            'juegos_recomendados': juegos_filtrados,
            'fuente': 'datos_ejemplo'
        }), 200
        
    except Exception as e:
        print(f"[ERROR] juegos_recomendados: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False, 
            'error': str(e)
        }), 500


@juegos_bp.route('/', methods=['GET'])
def listar_juegos():
    """Lista todos los juegos activos (sin autenticación)"""
    try:
        print("[JUEGOS] Listando todos los juegos")
        
        if HAS_MODELS and HAS_DB:
            try:
                juegos = JuegoTerapeutico.query.filter_by(activo=True).all()
                juegos_data = [juego.to_dict() for juego in juegos]
                print(f"[JUEGOS] OK - {len(juegos_data)} juegos encontrados")
                
                return jsonify({
                    'success': True,
                    'juegos': juegos_data
                }), 200
            except Exception as db_error:
                print(f"[JUEGOS] ADVERTENCIA - Error BD: {db_error}")
        
        # Datos de ejemplo
        juegos_ejemplo = [
            {"id": 1, "nombre": "Respiración Consciente", "tipo_juego": "respiracion", "activo": True},
            {"id": 2, "nombre": "Puzzle Zen", "tipo_juego": "puzzle", "activo": True},
            {"id": 3, "nombre": "Mandala Digital", "tipo_juego": "mandala", "activo": True},
            {"id": 4, "nombre": "Memoria Emocional", "tipo_juego": "memoria", "activo": True},
            {"id": 5, "nombre": "Mindfulness Garden", "tipo_juego": "mindfulness", "activo": True}
        ]
        
        return jsonify({
            'success': True,
            'juegos': juegos_ejemplo,
            'fuente': 'datos_ejemplo'
        }), 200
        
    except Exception as e:
        print(f"[ERROR] listar_juegos: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@juegos_bp.route('/iniciar', methods=['POST'])
@jwt_required()
def iniciar_juego():
    """Inicia una nueva sesión de juego"""
    if not (HAS_MODELS and HAS_DB):
        return jsonify({
            'success': False, 
            'error': 'Modelos de base de datos no disponibles'
        }), 503
    
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        juego_id = data.get('juego_id')
        estado_antes = data.get('estado_antes', 'no_definido')
        
        if not juego_id:
            return jsonify({'success': False, 'error': 'juego_id es requerido'}), 400
        
        juego = JuegoTerapeutico.query.get(juego_id)
        if not juego:
            return jsonify({'success': False, 'error': 'Juego no encontrado'}), 404
        
        nueva_sesion = SesionJuego(
            id_usuario=current_user_id,
            id_juego=juego_id,
            estado_antes=estado_antes,
            fecha_inicio=datetime.utcnow()
        )
        
        db.session.add(nueva_sesion)
        db.session.commit()
        
        print(f"[JUEGOS] OK - Sesion iniciada - Usuario: {current_user_id}, Juego: {juego_id}")
        
        return jsonify({
            'success': True,
            'sesion_id': nueva_sesion.id,
            'mensaje': 'Sesión de juego iniciada correctamente'
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"[ERROR] Error BD al iniciar juego: {e}")
        return jsonify({'success': False, 'error': 'Error en la base de datos'}), 500
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Error al iniciar juego: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@juegos_bp.route('/finalizar', methods=['POST'])
@jwt_required()
def finalizar_juego():
    """Finaliza una sesión de juego y guarda los resultados"""
    if not (HAS_MODELS and HAS_DB):
        return jsonify({
            'success': False, 
            'error': 'Modelos de base de datos no disponibles'
        }), 503
    
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        sesion_id = data.get('sesion_id')
        if not sesion_id:
            return jsonify({'success': False, 'error': 'sesion_id es requerido'}), 400
        
        sesion = SesionJuego.query.get(sesion_id)
        if not sesion:
            return jsonify({'success': False, 'error': 'Sesión no encontrada'}), 404
        
        if sesion.id_usuario != current_user_id:
            return jsonify({'success': False, 'error': 'No autorizado'}), 403
        
        sesion.fecha_fin = datetime.utcnow()
        sesion.duracion_segundos = int((sesion.fecha_fin - sesion.fecha_inicio).total_seconds())
        sesion.puntuacion = data.get('puntuacion', 0)
        sesion.completado = data.get('completado', False)
        sesion.estado_despues = data.get('estado_despues', sesion.estado_antes)
        sesion.mejora_percibida = data.get('mejora_percibida', 'no_especificado')
        sesion.notas = data.get('notas', '')
        
        db.session.commit()
        
        print(f"[JUEGOS] OK - Sesion finalizada - ID: {sesion_id}")
        
        return jsonify({
            'success': True,
            'sesion': sesion.to_dict(),
            'mensaje': 'Sesión finalizada correctamente'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"[ERROR] Error BD al finalizar juego: {e}")
        return jsonify({'success': False, 'error': 'Error en la base de datos'}), 500
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Error al finalizar juego: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@juegos_bp.route('/estadisticas', methods=['GET'])
@jwt_required()
def estadisticas_juegos():
    """Obtiene estadísticas de juegos del usuario"""
    if not (HAS_MODELS and HAS_DB):
        return jsonify({
            'success': False, 
            'error': 'Modelos de base de datos no disponibles'
        }), 503
    
    try:
        current_user_id = get_jwt_identity()
        sesiones = SesionJuego.query.filter_by(id_usuario=current_user_id).all()
        
        total_sesiones = len(sesiones)
        sesiones_completadas = len([s for s in sesiones if s.completado])
        puntuacion_total = sum(s.puntuacion for s in sesiones)
        
        juegos_count = {}
        for sesion in sesiones:
            juego_nombre = sesion.juego.nombre if sesion.juego else 'Desconocido'
            juegos_count[juego_nombre] = juegos_count.get(juego_nombre, 0) + 1
        
        juego_mas_jugado = max(juegos_count.items(), key=lambda x: x[1])[0] if juegos_count else None
        mejoras = [s for s in sesiones if s.mejora_percibida in ['mejor', 'mucho_mejor']]
        
        return jsonify({
            'success': True,
            'estadisticas': {
                'total_sesiones': total_sesiones,
                'sesiones_completadas': sesiones_completadas,
                'puntuacion_total': puntuacion_total,
                'juego_mas_jugado': juego_mas_jugado,
                'veces_mejorado': len(mejoras),
                'tasa_mejora': round(len(mejoras) / total_sesiones * 100, 2) if total_sesiones else 0
            }
        }), 200
    except SQLAlchemyError as e:
        print(f"[ERROR] Error BD en estadisticas: {e}")
        return jsonify({'success': False, 'error': 'Error en la base de datos'}), 500
    except Exception as e:
        print(f"[ERROR] Error en estadisticas: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@juegos_bp.route('/historial', methods=['GET'])
@jwt_required()
def historial_juegos():
    """Obtiene el historial de juegos del usuario"""
    if not (HAS_MODELS and HAS_DB):
        return jsonify({
            'success': False, 
            'error': 'Modelos de base de datos no disponibles'
        }), 503
    
    try:
        current_user_id = get_jwt_identity()
        limit = request.args.get('limit', 20, type=int)
        
        sesiones = SesionJuego.query.filter_by(id_usuario=current_user_id)\
            .order_by(SesionJuego.fecha_inicio.desc())\
            .limit(limit)\
            .all()
        
        return jsonify({
            'success': True,
            'historial': [sesion.to_dict() for sesion in sesiones]
        }), 200
    except SQLAlchemyError as e:
        print(f"[ERROR] Error BD en historial: {e}")
        return jsonify({'success': False, 'error': 'Error en la base de datos'}), 500
    except Exception as e:
        print(f"[ERROR] Error en historial: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


print("[DEBUG] OK - juegos_routes.py - Modulo cargado completamente")