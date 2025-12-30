from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import traceback
from database.connection import DatabaseConnection
from pydub import AudioSegment
import uuid

bp = Blueprint('audio', __name__, url_prefix='/api/audio')

# Extensiones permitidas
ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3', 'ogg', 'm4a'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ======================================================================
# 🟦 Endpoint: ANALIZAR AUDIO
# ======================================================================
@bp.route('/analyze', methods=['POST'])
def analyze_voice():

    filepath = None  # evitar errores si ocurre algo antes

    try:
        service = current_app.audio_service
        if not service:
            return jsonify({'success': False, 'error': 'Servicio de análisis no disponible'}), 500

        # --------------------------------------------------------
        # 1) Validar archivo
        # --------------------------------------------------------
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No se encontró el archivo de audio'}), 400

        file = request.files['audio']

        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nombre de archivo vacío'}), 400

        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Formato no permitido'}), 400

        # Duración enviada por el frontend
        duration_raw = request.form.get('duration', '0')
        duration = float(duration_raw) if duration_raw not in (None, "", "null") else 0.0

        # ID usuario (modo autenticado o modo prueba)
        user_id_raw = request.form.get('user_id')
        user_id = int(user_id_raw) if user_id_raw not in (None, "", "null", "undefined") else None

        # Intentar obtener user_id desde JWT si no vino en el formulario
        if user_id is None:
            try:
                verify_jwt_in_request(optional=True)
                identity = get_jwt_identity()
                # identity puede ser un número (id) o un dict con campos
                if isinstance(identity, dict):
                    possible_keys = ('user_id', 'id', 'uid', 'sub')
                    for k in possible_keys:
                        if k in identity and identity[k]:
                            user_id = int(identity[k])
                            break
                elif identity is not None:
                    user_id = int(identity)
            except Exception as jwt_err:
                # JWT no presente o inválido; continuar como modo invitado
                print('[audio_routes] JWT inválido o ausente:', jwt_err)

        print(f"[audio_routes] Identidad derivada: user_id={user_id}")

        # --------------------------------------------------------
        # 2) Guardar archivo temporal
        # --------------------------------------------------------
        # Usar carpeta absoluta bajo app.root_path
        upload_folder_name = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        # Guardar directamente en 'uploads'
        upload_folder = os.path.join(current_app.root_path, upload_folder_name)
        os.makedirs(upload_folder, exist_ok=True)

        # Nombre final deseado: <YYYYMMDD_HHMMSS_micro>_<rand6>_grabacion.wav
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        rand = uuid.uuid4().hex[:6]
        orig_ext = os.path.splitext(file.filename)[1].lower()
        base_stub = f"{timestamp}_{rand}_grabacion"
        # Nombre temporal con extensión original, luego convertimos
        filename = secure_filename(f"{base_stub}{orig_ext}")

        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        print(f"[audio_routes] Archivo guardado temporalmente en {filepath}")

        # --------------------------------------------------------
        # 2.1) Convertir a WAV si no lo es
        # --------------------------------------------------------
        try:
            if orig_ext != '.wav':
                # cargar con pydub y exportar a wav
                audio_seg = AudioSegment.from_file(filepath)
                wav_filename = f"{base_stub}.wav"
                wav_path = os.path.join(upload_folder, wav_filename)
                audio_seg.export(wav_path, format='wav')
                # Opcional: borrar el archivo original para evitar duplicados
                try:
                    os.remove(filepath)
                except Exception:
                    pass
                # actualizar punteros a nuevo archivo
                filename = wav_filename
                filepath = wav_path
                print(f"[audio_routes] Convertido a WAV: {wav_path}")
        except Exception as conv_err:
            print(f"[audio_routes] Error convirtiendo a WAV, se mantiene original: {conv_err}")

        # --------------------------------------------------------
        # 3) Analizar audio con IA
        # --------------------------------------------------------
        results = service.analyze_audio(filepath, duration)

        if not results:
            raise Exception("El servicio de análisis devolvió una respuesta vacía.")

        # --------------------------------------------------------
        # 4) Guardar en BD (solo si hay usuario autenticado)
        # --------------------------------------------------------
        audio_db_id = None

        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            insert_query = """
                INSERT INTO audio
                (id_usuario, nombre_archivo, ruta_archivo, duracion, fecha_grabacion)
                VALUES (%s, %s, %s, %s, NOW())
            """

            # Guardar SOLO el nombre de archivo en ruta_archivo, no la ruta completa
            cursor.execute(insert_query, (
                user_id,
                filename,  # nombre WAV final
                filename,  # ruta_archivo: solo nombre WAV final
                duration
            ))

            conn.commit()
            audio_db_id = cursor.lastrowid
            cursor.close()
            DatabaseConnection.release_connection(conn)

            print(f"[audio_routes] Audio guardado en BD con ID {audio_db_id}")

        except Exception as db_err:
            print("[audio_routes] Error guardando en BD:", db_err)
            try:
                DatabaseConnection.release_connection(conn)
            except Exception:
                pass

        # --------------------------------------------------------
        # 5) Crear ANALISIS + RESULTADO + RECOMENDACIONES + ALERTA
        # --------------------------------------------------------
        analisis_id = None
        resultado_id = None
        recomendaciones_list = []
        print(f'[audio_routes] Pre-check: audio_db_id={audio_db_id}, user_id={user_id}')
        try:
            if audio_db_id and user_id:
                print(f'[audio_routes] Condicion cumplida: audio_db_id={audio_db_id}, user_id={user_id}')
                print(f'[audio_routes] Creando análisis para audio_id={audio_db_id}, user_id={user_id}')
                
                # Crear registro de análisis
                from models.analisis import Analisis
                analisis_id = Analisis.create(
                    id_audio=audio_db_id,
                    modelo_usado='modelo_v1.0',
                    estado='completado'
                )

                if not analisis_id:
                    raise Exception('No se pudo crear el registro de análisis')

                print(f'[audio_routes] Análisis creado con ID: {analisis_id}')

                # Calcular métricas desde las emociones devueltas
                emotions = results.get("emotions", []) or []
                confidence = float(results.get("confidence", 0.0)) * 100.0

                # Inicializar valores
                nivel_estres = 0.0
                nivel_ansiedad = 0.0

                # Buscar emociones relevantes por nombre
                for e in emotions:
                    name = (e.get("name") or "").lower()
                    val = float(e.get("value") or 0.0)
                    if "estrés" in name or "estres" in name:
                        nivel_estres = max(nivel_estres, val)
                    if "ansiedad" in name:
                        nivel_ansiedad = max(nivel_ansiedad, val)

                # Si no hay etiquetas explícitas, estimar con otras señales
                if nivel_estres == 0.0:
                    enojo = next((float(e.get("value")) for e in emotions if "enojo" in (e.get("name") or "").lower()), 0.0)
                    sorpresa = next((float(e.get("value")) for e in emotions if "sorpresa" in (e.get("name") or "").lower()), 0.0)
                    nivel_estres = max(enojo * 0.6, sorpresa * 0.4)
                if nivel_ansiedad == 0.0:
                    miedo = next((float(e.get("value")) for e in emotions if "miedo" in (e.get("name") or "").lower()), 0.0)
                    tristeza = next((float(e.get("value")) for e in emotions if "tristeza" in (e.get("name") or "").lower()), 0.0)
                    nivel_ansiedad = max(miedo * 0.6, tristeza * 0.4)

                # Clasificación por umbrales
                max_score = max(nivel_estres, nivel_ansiedad)
                if max_score >= 80:
                    clasificacion = 'muy_alto'
                elif max_score >= 65:
                    clasificacion = 'alto'
                elif max_score >= 50:
                    clasificacion = 'moderado'
                elif max_score >= 30:
                    clasificacion = 'leve'
                else:
                    clasificacion = 'normal'

                # Crear resultado del análisis
                from models.resultado_analisis import ResultadoAnalisis
                resultado_id = ResultadoAnalisis.create(
                    id_analisis=analisis_id,
                    nivel_estres=round(nivel_estres, 2),
                    nivel_ansiedad=round(nivel_ansiedad, 2),
                    clasificacion=clasificacion,
                    confianza_modelo=round(confidence, 2)
                )
                
                print(f'[audio_routes] Resultado creado con ID: {resultado_id}')

                if not resultado_id:
                    raise Exception('No se pudo crear el registro de resultado de análisis')

                # Generar recomendaciones con IA (Groq)
                try:
                    from services.recomendaciones_ia import generar_recomendaciones, guardar_en_bd
                    print('[audio_routes] Generando recomendaciones IA con Groq...')
                    
                    resultado_ctx = {
                        'clasificacion': clasificacion,
                        'nivel_estres': nivel_estres,
                        'nivel_ansiedad': nivel_ansiedad,
                        'confianza_modelo': confidence,
                        'duracion': duration,
                        'emocion_dominante': (emotions[0]['name'] if emotions else None),
                        'emotions': emotions,
                    }
                    
                    ia_recs = generar_recomendaciones({ 'resultado': resultado_ctx }, user_id=user_id) or []
                    print(f'[audio_routes] Groq devolvió {len(ia_recs)} recomendaciones: {ia_recs}')
                    # Limpiar campos extra antes de persistir (solo tipo_recomendacion y contenido)
                    # Filtrar recomendaciones con tipo vacío o inválido
                    TIPOS_VALIDOS = {"respiracion", "pausa_activa", "meditacion", "ejercicio", "profesional"}
                    clean_recs = []
                    for r in ia_recs:
                        tipo = (r.get('tipo_recomendacion') or '').strip()
                        contenido = (r.get('contenido') or '').strip()
                        if tipo in TIPOS_VALIDOS and contenido:
                            clean_recs.append({'tipo_recomendacion': tipo, 'contenido': contenido})
                        else:
                            print(f'[audio_routes] WARNING: Recomendacion invalida filtrada: tipo="{tipo}", contenido="{contenido[:50]}..."')
                    print(f'[audio_routes] {len(clean_recs)} recomendaciones validas despues de filtrar')
                    try:
                        count = guardar_en_bd(resultado_id, clean_recs, user_id=user_id)
                        print(f'[audio_routes] {count} recomendaciones IA persistidas en BD.')
                    except Exception as persist_err:
                        print('[audio_routes] Error persistiendo recomendaciones IA:', persist_err)
                        traceback.print_exc()
                    # Leer desde BD para respuesta
                    from models.recomendacion import Recomendacion as _Rec
                    guardadas = _Rec.get_by_result(resultado_id) or []
                    print(f'[audio_routes] Leidas {len(guardadas)} recomendaciones desde BD para resultado_id={resultado_id}')
                    print(f'[audio_routes] DEBUG: TIPOS_VALIDOS = {TIPOS_VALIDOS}')
                    # Filtrar tipos inválidos al leer desde BD (última línea de defensa)
                    recomendaciones_list = []
                    for idx, g in enumerate(guardadas):
                        tipo_raw = g.get('tipo_recomendacion') if isinstance(g, dict) else getattr(g, 'tipo_recomendacion', None)
                        contenido_raw = g.get('contenido') if isinstance(g, dict) else getattr(g, 'contenido', None)
                        tipo = (tipo_raw or '').strip().lower()  # IMPORTANTE: convertir a minúsculas
                        contenido = (contenido_raw or '').strip()
                        print(f'[audio_routes] DEBUG [{idx+1}/{len(guardadas)}]: tipo_raw={repr(tipo_raw)}, tipo_lower={repr(tipo)}, valido={tipo in TIPOS_VALIDOS}, contenido_len={len(contenido)}')
                        if tipo in TIPOS_VALIDOS and contenido:
                            recomendaciones_list.append({
                                'tipo_recomendacion': tipo,
                                'contenido': contenido,
                                'origen': 'ia'
                            })
                            print(f'[audio_routes] DEBUG [{idx+1}]: ACEPTADA')
                        else:
                            print(f'[audio_routes] WARNING [{idx+1}]: Recomendacion RECHAZADA - tipo="{tipo}" (raw: {repr(tipo_raw)}), tiene_contenido={bool(contenido)}')
                    
                except Exception as ia_err:
                    print('[audio_routes] IA recomendaciones fallo:', ia_err)
                    traceback.print_exc()
                    recomendaciones_list = []

                # Generar alerta si la clasificación es alta
                if clasificacion in ('alto', 'muy_alto'):
                    from models.alerta_analisis import AlertaAnalisis
                    alerta_tipo = 'riesgo'
                    descripcion = (
                        f'Niveles elevados detectados: estrés={round(nivel_estres,2)}%, '
                        f'ansiedad={round(nivel_ansiedad,2)}%'
                    )
                    try:
                        AlertaAnalisis.create(resultado_id, alerta_tipo, descripcion)
                    except Exception:
                        pass
            else:
                print(f'[audio_routes] WARNING: Saltando creacion de analisis/resultado/recomendaciones porque audio_db_id={audio_db_id} o user_id={user_id} es None')

        except Exception as pipeline_err:
            print('[audio_routes] Error creando análisis/resultado/recomendaciones/alerta:', pipeline_err)
            # Si falla la creación de análisis/resultado, informar en la respuesta
            return jsonify({'success': False, 'error': str(pipeline_err)}), 500

        # --------------------------------------------------------
        # 6) Guardar features para entrenamiento continuo
        # --------------------------------------------------------
        try:
            service.save_training_sample(
                audio_db_id=audio_db_id,
                features=results.get("features"),
                emotions=results.get("emotions"),
                duration=duration
            )
            print("[audio_routes] Sample de entrenamiento guardado.")
        except Exception as train_err:
            print("[audio_routes] Error guardando sample de entrenamiento:", train_err)

        # --------------------------------------------------------
        # 6.1) Actualizar niveles en la tabla `audio` (si existen emociones)
        # --------------------------------------------------------

        try:
            emotions = results.get('emotions', []) or []
            # Inicializar niveles
            niveles = {
                'nivel_estres': 0.0,
                'nivel_ansiedad': 0.0,
                'nivel_felicidad': 0.0,
                'nivel_tristeza': 0.0,
                'nivel_miedo': 0.0,
                'nivel_neutral': 0.0,
                'nivel_enojo': 0.0,
                'nivel_sorpresa': 0.0,
            }

            # Mapear emociones a columnas
            for e in emotions:
                name = (e.get('name') or '').strip()
                val = float(e.get('value') or 0.0)
                if not name:
                    continue
                key = None
                lname = name.lower()
                if 'felic' in lname:
                    key = 'nivel_felicidad'
                elif 'trist' in lname:
                    key = 'nivel_tristeza'
                elif 'mied' in lname:
                    key = 'nivel_miedo'
                elif 'neutral' in lname or 'neutro' in lname:
                    key = 'nivel_neutral'
                elif 'enojo' in lname or 'enoj' in lname:
                    key = 'nivel_enojo'
                elif 'sorp' in lname:
                    key = 'nivel_sorpresa'
                elif 'estr' in lname:
                    key = 'nivel_estres'
                elif 'ansi' in lname:
                    key = 'nivel_ansiedad'
                if key:
                    niveles[key] = val

            # Si no se detectó estrés o ansiedad explícitamente, usar la misma lógica del pipeline
            if niveles['nivel_estres'] == 0.0:
                enojo = niveles['nivel_enojo']
                sorpresa = niveles['nivel_sorpresa']
                niveles['nivel_estres'] = max(enojo * 0.6, sorpresa * 0.4)
            if niveles['nivel_ansiedad'] == 0.0:
                miedo = niveles['nivel_miedo']
                tristeza = niveles['nivel_tristeza']
                niveles['nivel_ansiedad'] = max(miedo * 0.6, tristeza * 0.4)

            # Ejecutar update solo si tenemos audio_db_id
            if audio_db_id:
                update_query = """
                    UPDATE audio SET
                      nivel_estres = %s,
                      nivel_ansiedad = %s,
                      nivel_felicidad = %s,
                      nivel_tristeza = %s,
                      nivel_miedo = %s,
                      nivel_neutral = %s,
                      nivel_enojo = %s,
                      nivel_sorpresa = %s,
                      procesado_por_ia = 1
                    WHERE id_audio = %s
                """
                update_result = DatabaseConnection.execute_update(update_query, (
                    niveles['nivel_estres'],
                    niveles['nivel_ansiedad'],
                    niveles['nivel_felicidad'],
                    niveles['nivel_tristeza'],
                    niveles['nivel_miedo'],
                    niveles['nivel_neutral'],
                    niveles['nivel_enojo'],
                    niveles['nivel_sorpresa'],
                    audio_db_id
                ))
                print(f"[audio_routes] Niveles guardados en audio_id={audio_db_id}: {niveles} | Resultado update: {update_result}")

        except Exception as persist_levels_err:
            print('[audio_routes] Error guardando niveles en tabla audio:', persist_levels_err)

        # --------------------------------------------------------
        # 7) Respuesta final
        # --------------------------------------------------------
        response_data = {
            "success": True,
            "mode": "authenticated" if user_id else "guest_test",
            "emotions": results["emotions"],
            "confidence": results["confidence"],
            "duration": duration,
            "audio_id": audio_db_id,
            "analisis_id": analisis_id,
            "resultado_id": resultado_id,
            "recomendaciones": recomendaciones_list,
            "features": results.get("features", None),
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response_data), 200

    except Exception as e:
        print("[audio_routes] ERROR GENERAL:", e)
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        # Mantener el archivo en uploads para depuración y reproducción.
        # No eliminar el archivo incluso si no se guardó en BD.
        # Si se desea limpieza, implementar un job separado que borre antiguos.
        if filepath and os.path.exists(filepath):
            print(f"[audio_routes] Archivo persistente en uploads: {filepath}")
