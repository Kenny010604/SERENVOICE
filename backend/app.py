# backend/app.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from database.config import Config
from database.connection import DatabaseConnection
import os

def create_app():
    """Factory para crear la aplicación Flask"""

    app = Flask(__name__)

    # ===============================
    # CONFIGURACIÓN BASE DE LA APP
    # ===============================
    app.config.from_object(Config)
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES
    Config.init_app(app)

    # ===============================
    # CORS — CONFIGURACIÓN COMPLETA
    # ===============================
  # ===============================
## ===============================
# CORS — CONFIGURACIÓN COMPLETA
# ===============================
    CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.56.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True,
    expose_headers=["Content-Type", "Authorization"]
)

    # ===============================
    # JWT
    # ===============================
    jwt = JWTManager(app)

    # ===============================
    # POOL DE CONEXIONES DB
    # ===============================
    DatabaseConnection.initialize_pool()

    # ===============================
    # SWAGGER CONFIG
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
    from routes.auth_routes import bp as auth_bp
    from routes.usuario_routes import bp as usuarios_bp
    from routes.admin_routes import bp as admin_bp  # ✅ IMPORTANTE

    app.register_blueprint(auth_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(admin_bp)  # ✅ REGISTRA RUTAS ADMIN

    # ===============================
    # ENDPOINTS INTERNOS
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
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'docs': '/api/docs',
                'auth': '/api/auth',
                'usuario': '/api/usuario',
                'admin': '/api/admin'
            }
        }

    return app

# ===============================
# RUN SERVER
# ===============================
if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = Config.DEBUG

    print(f"[SERVIDOR] Iniciando en http://localhost:{port}")
    print(f"[DOCS] Swagger: http://localhost:{port}/api/docs/")
    print(f"[DEBUG] Mode: {debug}")
    print(f"[CORS] Habilitado para:")
    print(f"   - http://localhost:5173")
    print(f"   - http://127.0.0.1:5173")
    print(f"   - http://192.168.56.1:5173")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
