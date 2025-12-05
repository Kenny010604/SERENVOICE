# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from database.config import Config
from database.connection import DatabaseConnection
import os

# Importar servicios
from services.audio_service import AudioService


def create_app():
    app = Flask(__name__)

    # ===============================
    # CONFIG BASE
    # ===============================
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

    # DB config
    Config.init_app(app)

    # ===============================
    # CORS
    # ===============================
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"]
    )

    @app.before_request
    def handle_cors_preflight():
        if request.method == "OPTIONS":
            return jsonify({"ok": True}), 200

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

    # ===============================
    # DB CONNECTION (POOL)
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
                "endpoint": 'apispec',
                "route": '/api/openapi.json',
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
    from routes.contact_routes import bp as contact_bp
    from routes.auth_routes import bp as auth_bp
    from routes.usuario_routes import bp as usuarios_bp
    from routes.admin_routes import bp as admin_bp
    from routes.audio_routes import bp as audio_bp

    app.register_blueprint(contact_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(audio_bp)

    # ===============================
    # RUTA TEMPORAL PARA CONTACTO
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
    os.makedirs('models', exist_ok=True)

    return app


# ===============================
# RUN SERVER
# ===============================
if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))

    print(f"[SERVIDOR] Iniciando en http://localhost:{port}")
    print(f"[DOCS] http://localhost:{port}/api/docs")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True,
        use_reloader=False
    )
