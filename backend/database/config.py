# backend/database/config.py
import os
from dotenv import load_dotenv
import socket
from pathlib import Path

# Cargar variables de entorno desde la raíz del proyecto
root_dir = Path(__file__).parent.parent.parent
env_path = root_dir / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    """Configuración de la aplicación"""
    
    # Base de datos
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'serenvoice'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'autocommit': False,
        'raise_on_warnings': True
    }
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 28800))
    
    # Flask
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    TESTING = False
    
    # Archivos
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads/audios')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 52428800))  # 50MB
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'wav,mp3,ogg,webm').split(','))
    
    @staticmethod
    def init_app(app):
        """Inicializar configuración en la app"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        
    @staticmethod
    def show_server_urls(port=5173):
        """Mostrar URLs del servidor frontend."""
        import socket
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)

        print("\n  Servidor Frontend disponible en:")
        print(f"Local:   http://localhost:{port}/")
        print(f"Network: http://{local_ip}:{port}/")


