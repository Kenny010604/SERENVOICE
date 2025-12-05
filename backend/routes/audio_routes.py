from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import traceback

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

        # --------------------------------------------------------
        # 2) Guardar archivo temporal
        # --------------------------------------------------------
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        filename = secure_filename(f"{timestamp}_{file.filename}")

        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        print(f"[audio_routes] Archivo guardado temporalmente en {filepath}")

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
            conn = current_app.db
            cursor = conn.cursor()

            insert_query = """
                INSERT INTO audio
                (id_usuario, nombre_archivo, ruta_archivo, duracion, fecha_grabacion)
                VALUES (%s, %s, %s, %s, NOW())
            """

            cursor.execute(insert_query, (
                user_id,
                filename,
                filepath,
                duration
            ))

            conn.commit()
            audio_db_id = cursor.lastrowid
            cursor.close()

            print(f"[audio_routes] Audio guardado en BD con ID {audio_db_id}")

        except Exception as db_err:
            print("[audio_routes] Error guardando en BD:", db_err)

        # --------------------------------------------------------
        # 5) Guardar features para entrenamiento continuo
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
        # 6) Respuesta final
        # --------------------------------------------------------
        return jsonify({
            "success": True,
            "mode": "authenticated" if user_id else "guest_test",
            "emotions": results["emotions"],
            "confidence": results["confidence"],
            "duration": duration,
            "audio_id": audio_db_id,
            "features": results.get("features", None),
            "timestamp": datetime.now().isoformat()
        }), 200

    except Exception as e:
        print("[audio_routes] ERROR GENERAL:", e)
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        # NO BORRAR EL AUDIO si fue guardado en BD
        if filepath and os.path.exists(filepath):

            if "audio_id" not in locals() or audio_db_id is None:
                # solo se borra si NO se guardó en BD
                try:
                    os.remove(filepath)
                    print(f"[audio_routes] Archivo temporal eliminado: {filepath}")
                except Exception:
                    pass
