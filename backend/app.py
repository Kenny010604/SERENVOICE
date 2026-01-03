# -*- coding: utf-8 -*-
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger
import os
import sys
import io

# ============================================
# CONFIGURAR UTF-8 PARA WINDOWS
# ============================================
if sys.platform == "win32":
    # Forzar UTF-8 en la salida estándar y de error
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    # Configurar variable de entorno
    os.environ['PYTHONIOENCODING'] = 'utf-8'

from database.config import Config
from database.connection import DatabaseConnection
from services.audio_service import AudioService

# ===============================
# ENV
# ===============================
try:
    from dotenv import load_dotenv
    from pathlib import Path
    # Cargar .env desde la raíz del proyecto
    root_dir = Path(__file__).parent.parent
    env_path = root_dir / '.env'
    load_dotenv(dotenv_path=env_path)
except Exception:
    pass

# ===============================
# SQL EXTENSIONS (OPCIONAL)
# ===============================
try:
    from extensions import db, jwt as sql_jwt
    HAS_SQL_EXTENSIONS = True
except Exception:
    HAS_SQL_EXTENSIONS = False

# ===============================
# BLUEPRINTS
# ===============================
from routes.contact_routes import bp as contact_bp
from routes.auth_routes import bp as auth_bp
from routes.usuario_routes import bp as usuarios_bp
from routes.admin_routes import bp as admin_bp
from routes.audio_routes import bp as audio_bp
from routes.analisis_routes import bp as analisis_bp

from routes.sesion_routes import bp as sesion_bp
from routes.roles_routes import bp as roles_bp
from routes.resultados_routes import bp as resultados_bp
from routes.reportes_routes import bp as reportes_bp
from routes.recomendaciones_routes import bp as recomendaciones_bp
from routes.alertas_routes import bp as alertas_bp
from routes.notificaciones_routes import bp as notificaciones_bp

# ===============================
# JUEGOS (OPCIONAL)
# ===============================
try:
    from routes.juegos_routes import juegos_bp
    HAS_JUEGOS = True
except Exception:
    juegos_bp = None
    HAS_JUEGOS = False


def create_app():
    app = Flask(__name__)

    # ===============================
    # CONFIG
    # ===============================
    app.config.from_object(Config)
    app.config["UPLOAD_FOLDER"] = "uploads"
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

    # ===============================
    # ✅ CORS SIMPLIFICADO Y CORREGIDO
    # ===============================
    # Habilitar CORS para rutas API y para el blueprint de juegos (/juegos/*)
    CORS(
        app,
        resources={
            r"/api/*": {"origins": "*"},
            r"/juegos/*": {"origins": "*"},
            r"/grupos*": {"origins": "*"}
        },
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"]
    )

    # ===============================
    # ✅ MANEJADOR EXPLÍCITO PARA OPTIONS
    # ===============================
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            return response

    # ===============================
    # JWT
    # ===============================
    JWTManager(app)

    # ===============================
    # AUDIO SERVICE
    # ===============================
    app.audio_service = AudioService()
    print("[AUDIO] AudioService OK")
    # ===============================
    # DATABASE (la inicialización de pool se hace más abajo con manejo de errores)
    # ===============================

    # ===============================
    # SQLALCHEMY (SI EXISTE)
    # ===============================
    if HAS_SQL_EXTENSIONS:
        try:
            from urllib.parse import quote_plus

            db_conf = Config.DB_CONFIG
            user = db_conf.get("user")
            password = quote_plus(str(db_conf.get("password", "")))
            host = db_conf.get("host", "localhost")
            port = db_conf.get("port", 3306)
            database = db_conf.get("database")

            if user and database:
                app.config["SQLALCHEMY_DATABASE_URI"] = (
                    f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{database}"
                )
                app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

            db.init_app(app)
            sql_jwt.init_app(app)
            print("[EXT] SQLAlchemy OK")
        except Exception as e:
            print(f"[EXT] ADVERTENCIA: error preparando configuración SQLAlchemy: {e}")
            # No intentar init_app de nuevo aquí; ya se intentó dentro del bloque try

    # ===============================
    # POOL DE CONEXIONES MYSQL (manejar fallos en entorno local)
    # ===============================
    print("[DB] Inicializando Pool de MySQL...")
    try:
        DatabaseConnection.initialize_pool()
        DatabaseConnection.test_connection()
        app.config['DB_CONNECTED'] = True
    except Exception as e:
        # No detener la aplicación sólo por falta de DB en desarrollo local
        print(f"[DB] ADVERTENCIA: no se pudo inicializar el pool de MySQL: {e}")
        app.config['DB_CONNECTED'] = False

    # ===============================
    # SWAGGER
    # ===============================
    Swagger(app, config={
        "openapi": "3.0.3",
        "swagger_ui": True,
        "specs_route": "/api/docs/",
        "headers": [],
        "specs": [{
            "endpoint": "apispec",
            "route": "/api/openapi.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }],
    })

    # ===============================
    # REGISTER BLUEPRINTS
    # ===============================
    app.register_blueprint(contact_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(audio_bp)
    app.register_blueprint(analisis_bp)

    app.register_blueprint(sesion_bp)
    app.register_blueprint(roles_bp)
    app.register_blueprint(resultados_bp)
    app.register_blueprint(reportes_bp)
    app.register_blueprint(recomendaciones_bp)
    app.register_blueprint(alertas_bp)
    app.register_blueprint(notificaciones_bp)


    print("[ROUTES] OK - Blueprint de notificaciones registrado en /api/notificaciones")
    
    # Blueprint de reportes de admin
    try:
        from routes.admin_reportes_routes import bp as admin_reportes_bp
        app.register_blueprint(admin_reportes_bp)
        print("[ROUTES] OK - Blueprint de reportes admin registrado en /api/admin/reportes")
    except ImportError as e:
        print(f"[ROUTES] ADVERTENCIA - No se pudo importar admin_reportes_routes: {e}")
    
    # Nuevos blueprints para admin
    try:
        from routes.auditoria_routes import bp as auditoria_bp
        app.register_blueprint(auditoria_bp)
        print("[ROUTES] OK - Blueprint de auditoría registrado en /api/auditoria")
    except ImportError as e:
        print(f"[ROUTES] ADVERTENCIA - No se pudo importar auditoria_routes: {e}")
    
    try:
        from routes.sesiones_juego_routes import bp as sesiones_juego_bp
        app.register_blueprint(sesiones_juego_bp)
        print("[ROUTES] OK - Blueprint de sesiones de juego registrado en /api/sesiones-juego")
    except ImportError as e:
        print(f"[ROUTES] ADVERTENCIA - No se pudo importar sesiones_juego_routes: {e}")
    
    # Grupos - Nuevo
    try:
        from routes.grupos_routes import bp as grupos_bp
        app.register_blueprint(grupos_bp)
        print("[ROUTES] grupos_bp OK")
    except Exception as e:
        print(f"[ROUTES] grupos_bp NO cargado: {e}")

    if HAS_JUEGOS and juegos_bp:
        app.register_blueprint(juegos_bp)
        print("[ROUTES] juegos_bp OK")

    # ===============================
    # UPLOADS
    # ===============================
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(
            os.path.join(app.root_path, "uploads"),
            filename
        )

    # ===============================
    # HEALTH
    # ===============================
    @app.route('/api/contacto', methods=['POST'])
    def contacto_directo():
        data = request.get_json()
        if not data:
            return jsonify({"ok": False, "error": "No se recibió JSON"}), 400

        nombre = data.get("nombre", "")
        email = data.get("email", "")
        mensaje = data.get("mensaje", "")

        print("[CONTACTO DIRECTO] Datos recibidos:")
        print("Nombre:", nombre)
        print("Email:", email)
        print("Mensaje:", mensaje)

        return jsonify({"ok": True, "message": "Mensaje recibido"}), 200

    # ===============================
    # HOME
    # ===============================
    @app.route('/api/health', methods=['GET'])
    def health_check():
        db_status = DatabaseConnection.test_connection()
        return {
            'status': 'ok' if db_status else 'error',
            'database': 'connected' if db_status else 'disconnected',
            'message': 'MindVoice API funcionando correctamente'
        }, 200 if db_status else 500

    @app.route('/', methods=['GET'])
    def home():
        return {
            'message': 'Bienvenido a MindVoice API',
            'version': '2.0.0',
            'endpoints': {
                'health': '/api/health',
                'docs': '/api/docs',
                'auth': '/api/auth',
                'usuario': '/api/usuario',
                'admin': '/api/admin',
                'audio': '/api/audio',
                'contacto': '/api/contacto'
            }
        }

    # Crear directorios necesarios
    os.makedirs('uploads', exist_ok=True)
    os.makedirs(os.path.join('uploads','audios'), exist_ok=True)
    os.makedirs('models', exist_ok=True)

    # ===============================
    # MOSTRAR TODAS LAS RUTAS REGISTRADAS
    # ===============================
    print("\n" + "="*60)
    print("RUTAS REGISTRADAS EN LA APLICACION:")
    print("="*60)
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':
            # Usar -> en lugar de → para evitar problemas de encoding en Windows
            print(f"  {rule.rule:50s} -> {rule.endpoint}")
    print("="*60 + "\n")

    return app


# ===============================
# RUN
# ===============================
if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))

    print(f"[SERVER] http://0.0.0.0:{port}")
    print(f"[DOCS]   http://localhost:{port}/api/docs")
    print(f"[CORS]   Habilitado para todos los orígenes")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True,
        use_reloader=False
    )