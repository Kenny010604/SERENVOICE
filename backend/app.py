# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from database.config import Config
from database.connection import DatabaseConnection
import os

# Extensiones SQLAlchemy (opcionales)
try:
    from extensions import db, jwt as sql_jwt
    HAS_SQL_EXTENSIONS = True
except ImportError:
    HAS_SQL_EXTENSIONS = False

# Servicios
from services.audio_service import AudioService

# Blueprints
from routes.contact_routes import bp as contact_bp
from routes.auth_routes import bp as auth_bp
from routes.usuario_routes import bp as usuarios_bp
from routes.admin_routes import bp as admin_bp
from routes.audio_routes import bp as audio_bp

# Blueprint juegos - CON LOGS DE DEPURACION
HAS_JUEGOS = False
juegos_bp = None
try:
    print("[DEBUG] Intentando importar juegos_routes...")
    from routes.juegos_routes import juegos_bp
    HAS_JUEGOS = True
    print("[ROUTES] OK - Blueprint juegos_bp importado correctamente")
except ImportError as e:
    HAS_JUEGOS = False
    print(f"[ERROR] ImportError al importar juegos_routes: {e}")
except Exception as e:
    HAS_JUEGOS = False
    print(f"[ERROR CRITICO] Error general al importar juegos_routes: {e}")
    import traceback
    traceback.print_exc()


def create_app():
    app = Flask(__name__)

    # ===============================
    # CONFIG BASE
    # ===============================
    app.config.from_object(Config)
    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config["UPLOAD_FOLDER"] = "uploads"
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

    # Inicializar DB
    Config.init_app(app)

    # ===============================
    # CORS GLOBAL
    # ===============================
    cors = CORS(
        app,
        origins=["http://localhost:5173", "http://localhost:3000"],
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"]
    )

    # ===============================
    # AUDIO SERVICE
    # ===============================
    print("[AUDIO] Cargando AudioService...")
    app.audio_service = AudioService()
    print("[AUDIO] AudioService inicializado correctamente")

    # ===============================
    # JWT
    # ===============================
    JWTManager(app)

    # SQLAlchemy + JWT extra
    if HAS_SQL_EXTENSIONS:
        #db.init_app(app)
        sql_jwt.init_app(app)

    # ===============================
    # POOL DE CONEXIONES MYSQL
    # ===============================
    print("[DB] Inicializando Pool de MySQL...")
    DatabaseConnection.initialize_pool()
    DatabaseConnection.test_connection()

    # ===============================
    # SWAGGER
    # ===============================
    swagger_config = {
        "headers": [],
        "openapi": "3.0.3",
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/api/openapi.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/swagger_static",
        "swagger_ui": True,
        "specs_route": "/api/docs/"
    }
    Swagger(app, config=swagger_config)

    # ===============================
    # BLUEPRINTS
    # ===============================
    print("[BLUEPRINTS] Registrando blueprints...")
    app.register_blueprint(contact_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(audio_bp)

    if HAS_JUEGOS and juegos_bp is not None:
        print("[ROUTES] Registrando blueprint de juegos...")
        app.register_blueprint(juegos_bp)
        print("[ROUTES] OK - Blueprint de juegos registrado correctamente")
        print(f"[ROUTES] Rutas de juegos disponibles en: /juegos/*")
    else:
        print("[ROUTES] ADVERTENCIA - Blueprint de juegos NO disponible")

    # ===============================
    # RUTA CONTACTO TEMPORAL
    # ===============================
    @app.route('/api/contacto', methods=['POST'])
    def contacto_directo():
        data = request.get_json()
        if not data:
            return jsonify({"ok": False, "error": "No se recibió JSON"}), 400
        print("[CONTACTO DIRECTO]", data)
        return jsonify({"ok": True, "message": "Mensaje recibido"}), 200

    # ===============================
    # HEALTH CHECK
    # ===============================
    @app.route('/api/health', methods=['GET'])
    def health_check():
        db_status = DatabaseConnection.test_connection()
        return {
            'status': 'ok' if db_status else 'error',
            'database': 'connected' if db_status else 'disconnected',
            'message': 'MindVoice API funcionando correctamente'
        }, 200 if db_status else 500

    # ===============================
    # HOME
    # ===============================
    @app.route('/', methods=['GET'])
    def home():
        return {
            'message': 'Bienvenido a MindVoice API',
            'version': '2.0.0'
        }

    # ===============================
    # OPCIONES GLOBALES (PREVENT CORS ERRORS)
    # ===============================
    @app.before_request
    def handle_options_requests():
        if request.method == "OPTIONS":
            return "", 200

    # Crear carpetas necesarias
    os.makedirs('uploads', exist_ok=True)
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
if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv("PORT", 5000))

    print(f"\n{'='*60}")
    print(f"SERVIDOR INICIADO")
    print(f"{'='*60}")
    print(f"URL Local:  http://localhost:{port}")
    print(f"Documentacion: http://localhost:{port}/api/docs")
    print(f"{'='*60}\n")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True,
        use_reloader=False
    )