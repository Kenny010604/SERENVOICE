# backend/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from database.config import Config
from database.connection import DatabaseConnection
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # En producción con variables de entorno del contenedor/hosting, no es necesario .env
    pass

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
from routes.analisis_routes import bp as analisis_bp

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
    # CORS
    # ===============================
    # Habilitar CORS para rutas API y para el blueprint de juegos (/juegos/*)
    CORS(
        app,
        resources={
            r"/api/*": {"origins": "*"},
            r"/juegos/*": {"origins": "*"}
        },
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

    # SQLAlchemy + JWT extra
    if HAS_SQL_EXTENSIONS:
        # Configurar SQLALCHEMY a partir del DB_CONFIG si existe
        try:
            from urllib.parse import quote_plus
            db_conf = Config.DB_CONFIG
            user = db_conf.get('user')
            password = db_conf.get('password', '')
            host = db_conf.get('host', 'localhost')
            port = db_conf.get('port', 3306)
            database = db_conf.get('database')

            # Construir URI y aplicar a la app (escape de password)
            if user and database:
                pwd = quote_plus(str(password)) if password is not None else ''
                app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{user}:{pwd}@{host}:{port}/{database}"
                app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

            # Inicializar SQLAlchemy si está disponible
            try:
                db.init_app(app)
                print('[EXT] SQLAlchemy inicializado con la app')
            except Exception as e:
                print(f"[EXT] ADVERTENCIA: no se pudo inicializar SQLAlchemy: {e}")
        except Exception as e:
            print(f"[EXT] ADVERTENCIA: error preparando configuración SQLAlchemy: {e}")
        sql_jwt.init_app(app)

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
    app.register_blueprint(analisis_bp)
    from routes.sesion_routes import bp as sesion_bp
    from routes.roles_routes import bp as roles_bp
    from routes.resultados_routes import bp as resultados_bp
    from routes.reportes_routes import bp as reportes_bp
    from routes.recomendaciones_routes import bp as recomendaciones_bp
    from routes.alertas_routes import bp as alertas_bp
    app.register_blueprint(sesion_bp)
    app.register_blueprint(roles_bp)
    app.register_blueprint(resultados_bp)
    app.register_blueprint(reportes_bp)
    app.register_blueprint(recomendaciones_bp)
    app.register_blueprint(alertas_bp)
    
    # Grupos - Nuevo
    try:
        from routes.grupos_routes import bp as grupos_bp
        app.register_blueprint(grupos_bp)
        print("[ROUTES] OK - Blueprint de grupos registrado en /api/grupos")
    except ImportError as e:
        print(f"[ROUTES] ADVERTENCIA - No se pudo importar grupos_routes: {e}")

    if HAS_JUEGOS and juegos_bp is not None:
        print("[ROUTES] Registrando blueprint de juegos...")
        app.register_blueprint(juegos_bp)
        print("[ROUTES] OK - Blueprint de juegos registrado correctamente")
        print(f"[ROUTES] Rutas de juegos disponibles en: /juegos/*")
    else:
        print("[ROUTES] ADVERTENCIA - Blueprint de juegos NO disponible")

    # ===============================
    # SERVIR ARCHIVOS DE SUBIDAS
    # ===============================
    @app.route('/uploads/<path:filename>', methods=['GET'])
    def serve_upload(filename):
        # Directorio absoluto de 'uploads'
        uploads_dir = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
        
        # Normalizar nombre (acepta rutas con 'uploads/')
        parts = [p for p in filename.replace('\\', '/').split('/') if p]
        if parts and parts[0].lower() == 'uploads':
            parts = parts[1:]
        
        # Probar rutas posibles
        candidate_paths = []
        if parts:
            candidate_paths.append(os.path.join(uploads_dir, *parts))
        safe_name = os.path.basename(filename)
        candidate_paths.append(os.path.join(uploads_dir, safe_name))

        for path in candidate_paths:
            if os.path.exists(path):
                # Normalizar path para Windows (send_from_directory necesita barras normales)
                rel = os.path.relpath(path, uploads_dir).replace('\\', '/')
                return send_from_directory(uploads_dir, rel, as_attachment=False)

        app.logger.warning(f"uploads: archivo no encontrado: {filename} candidates={candidate_paths}")
        return jsonify({"success": False, "message": "Archivo no encontrado"}), 404

    @app.route('/api/uploads/list', methods=['GET'])
    def list_uploads():
        """Endpoint de diagnóstico: lista archivos en la carpeta uploads"""
        uploads_dir = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
        try:
            files = []
            for root, _, fns in os.walk(uploads_dir):
                for fn in fns:
                    full = os.path.join(root, fn)
                    rel = os.path.relpath(full, uploads_dir)
                    files.append(rel)
            return jsonify({"success": True, "count": len(files), "files": files})
        except Exception as e:
            app.logger.error(f"uploads list error: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

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