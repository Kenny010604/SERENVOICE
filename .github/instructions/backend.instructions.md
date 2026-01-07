# SerenVoice Backend - GitHub Copilot Instructions

> **Versión**: 2.0.0  
> **Última actualización**: Enero 2026  
> **Aplica a**: `backend/**`

---

## 📋 Índice

1. Contexto del Proyecto
2. Arquitectura y Estructura
3. Convenciones de Código
4. Seguridad de Software (Obligatorio)
5. Autenticación y Autorización
6. Base de Datos y Modelos
7. API y Contratos
8. Testing
9. CI/CD y Calidad
10. Observabilidad
11. Reglas Estrictas
12. Checklist para Nuevas Contribuciones

---

## 🎯 Contexto del Proyecto

**SerenVoice** es una aplicación de análisis de voz y detección de emociones que procesa datos altamente sensibles:
- Grabaciones de voz de usuarios
- Métricas emocionales (estrés, ansiedad, felicidad, tristeza, etc.)
- Datos de salud mental y bienestar

### Stack Tecnológico Actual

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework Web | Flask | 3.1.2 |
| Base de Datos | MySQL | 8.x |
| Autenticación | Flask-JWT-Extended | 4.7.1 |
| Rate Limiting | Flask-Limiter | 3.5.0 |
| ORM (opcional) | SQLAlchemy | 2.0.23 |
| Audio Processing | librosa, pydub | 0.10.1 |
| ML | scikit-learn | 1.3.2 |
| IA Generativa | Groq API | Llama 3.1 |
| Documentación API | Flasgger (OpenAPI 3.0) | 0.9.7.1 |

---

## 🏗 Arquitectura y Estructura

### Estructura de Carpetas

```
backend/
├── app.py                    # Factory de aplicación Flask (create_app)
├── run.py                    # Entry point para ejecutar la aplicación
├── extensions.py             # Extensiones Flask (SQLAlchemy, JWT)
├── requirements.txt          # Dependencias Python
├── Dockerfile                # Configuración de contenedor
│
├── database/                 # Configuración y conexión a BD
│   ├── __init__.py
│   ├── config.py            # Clase Config con variables de entorno
│   └── connection.py        # Pool de conexiones MySQL
│
├── models/                   # Modelos de datos (capa de acceso a BD)
│   ├── __init__.py
│   ├── usuario.py           # Modelo Usuario
│   ├── audio.py             # Modelo Audio
│   ├── analisis.py          # Modelo Análisis
│   ├── resultado_analisis.py # Resultados de análisis
│   ├── recomendacion.py     # Recomendaciones IA
│   ├── rol.py               # Roles del sistema
│   ├── rol_usuario.py       # Relación usuario-rol
│   ├── sesion.py            # Sesiones de usuario
│   ├── alerta_analisis.py   # Alertas del sistema
│   ├── notificacion.py      # Notificaciones
│   └── ...                  # Otros modelos
│
├── routes/                   # Blueprints (endpoints API)
│   ├── __init__.py
│   ├── auth_routes.py       # /api/auth/* (registro, login, OAuth)
│   ├── usuario_routes.py    # /api/usuarios/* (perfil, CRUD)
│   ├── audio_routes.py      # /api/audio/* (upload, análisis)
│   ├── analisis_routes.py   # /api/analisis/* (historial)
│   ├── alertas_routes.py    # /api/alertas/* (alertas críticas)
│   ├── admin_routes.py      # /api/admin/* (panel admin)
│   └── ...                  # Otros blueprints
│
├── services/                 # Lógica de negocio
│   ├── __init__.py
│   ├── auth_service.py      # Lógica de autenticación
│   ├── usuario_service.py   # Lógica de usuarios
│   ├── audio_service.py     # Procesamiento de audio + ML
│   ├── analisis_service.py  # Lógica de análisis
│   ├── groq_service.py      # Integración con Groq IA
│   ├── alertas_service.py   # Gestión de alertas
│   ├── email_service.py     # Envío de emails
│   └── ...                  # Otros servicios
│
├── utils/                    # Utilidades compartidas
│   ├── helpers.py           # Helpers generales (format_response)
│   ├── seguridad.py         # Validaciones, hash, sanitización
│   ├── security_middleware.py # Rate limiting, headers, CORS
│   ├── audio_processor.py   # Procesamiento de audio
│   └── feature_extractor.py # Extracción de características ML
│
├── tests/                    # Tests
│   └── test_routes.py       # Tests de rutas
│
└── uploads/                  # Archivos subidos (NO versionar)
    ├── audios/
    └── perfiles/
```

### Patrón de Arquitectura: Routes → Services → Models

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│   Routes    │ --> │  Services   │ --> │   Models    │ --> │    DB    │
│ (Blueprints)│     │  (Business) │     │ (Data Access)│     │  MySQL   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────────┘
      │                    │
      │                    └── Integración IA (Groq, ML)
      │
      └── Validación de entrada
          Rate Limiting
          Autenticación JWT
```

### Crear Nuevos Componentes

#### Nueva Ruta (Blueprint)

```python
# backend/routes/nueva_ruta_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.nueva_service import NuevaService
from utils.helpers import Helpers
from utils.seguridad import role_required
from utils.security_middleware import limiter

bp = Blueprint('nueva_ruta', __name__, url_prefix='/api/nueva-ruta')

@bp.route('/', methods=['GET'])
@jwt_required()
@limiter.limit("30 per minute")
def get_items():
    """
    Obtener todos los items del usuario
    ---
    tags:
      - NuevaRuta
    security:
      - Bearer: []
    responses:
      200:
        description: Lista de items
    """
    user_id = get_jwt_identity()
    items = NuevaService.get_user_items(user_id)
    return Helpers.format_response(success=True, data=items)
```

#### Nuevo Servicio

```python
# backend/services/nueva_service.py
from typing import List, Dict, Optional
from database.connection import DatabaseConnection
from models.nueva_model import NuevaModel

class NuevaService:
    """Servicio para gestión de [entidad]."""
    
    @staticmethod
    def get_user_items(id_usuario: int) -> List[Dict]:
        """
        Obtener items de un usuario.
        
        Args:
            id_usuario: ID del usuario autenticado.
        
        Returns:
            Lista de items del usuario.
        """
        return NuevaModel.get_by_user(id_usuario)
    
    @staticmethod
    def create_item(id_usuario: int, data: Dict) -> Optional[int]:
        """
        Crear nuevo item.
        
        Args:
            id_usuario: ID del usuario.
            data: Datos del item a crear.
        
        Returns:
            ID del item creado o None si falla.
        """
        # Validación de negocio aquí
        return NuevaModel.create(id_usuario, **data)
```

#### Nuevo Modelo

```python
# backend/models/nueva_model.py
from database.connection import DatabaseConnection
from typing import List, Dict, Optional

class NuevaModel:
    """Modelo para la tabla nueva_tabla."""
    
    @staticmethod
    def create(**kwargs) -> Optional[int]:
        """Crear registro y devolver ID."""
        query = """
            INSERT INTO nueva_tabla (campo1, campo2, id_usuario)
            VALUES (%s, %s, %s)
        """
        result = DatabaseConnection.execute_query(
            query,
            (kwargs['campo1'], kwargs['campo2'], kwargs['id_usuario']),
            fetch=False
        )
        return result.get('last_id')
    
    @staticmethod
    def get_by_id(id_registro: int) -> Optional[Dict]:
        """Obtener registro por ID."""
        query = "SELECT * FROM nueva_tabla WHERE id = %s AND activo = 1"
        results = DatabaseConnection.execute_query(query, (id_registro,))
        return results[0] if results else None
    
    @staticmethod
    def get_by_user(id_usuario: int, limit: int = 50) -> List[Dict]:
        """Obtener registros de un usuario."""
        query = """
            SELECT * FROM nueva_tabla 
            WHERE id_usuario = %s AND activo = 1
            ORDER BY fecha_creacion DESC
            LIMIT %s
        """
        return DatabaseConnection.execute_query(query, (id_usuario, limit))
    
    @staticmethod
    def delete(id_registro: int) -> bool:
        """Soft delete de registro."""
        query = "UPDATE nueva_tabla SET activo = 0, eliminado = 1 WHERE id = %s"
        DatabaseConnection.execute_query(query, (id_registro,), fetch=False)
        return True
```

---

## 📝 Convenciones de Código

### Type Hints (Obligatorio - PEP 484)

```python
# ✅ CORRECTO
from typing import List, Dict, Optional, Tuple, Union

def procesar_audio(
    filepath: str, 
    duracion: float,
    usuario_id: Optional[int] = None
) -> Dict[str, any]:
    """Procesa audio y retorna resultados."""
    pass

def validar_password(password: str) -> Tuple[bool, str]:
    """Retorna (es_valido, mensaje)."""
    pass

# ❌ INCORRECTO
def procesar_audio(filepath, duracion, usuario_id=None):
    pass
```

### Docstrings (Google Style)

```python
def analyze_audio(
    filepath: str, 
    duration: float, 
    user_id: Optional[int] = None
) -> Dict[str, any]:
    """
    Analiza un archivo de audio y extrae emociones.
    
    Args:
        filepath: Ruta absoluta al archivo de audio.
        duration: Duración en segundos.
        user_id: ID del usuario (opcional para modo invitado).
    
    Returns:
        Diccionario con:
            - emotions: Lista de emociones detectadas
            - confidence: Confianza del modelo (0-1)
            - features: Características extraídas
    
    Raises:
        ValueError: Si el archivo no existe o está corrupto.
        AudioProcessingError: Si falla el análisis.
    
    Example:
        >>> result = analyze_audio('/tmp/audio.wav', 30.5, user_id=123)
        >>> print(result['emotions'][0]['name'])
        'Felicidad'
    """
    pass
```

### Naming Conventions

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos | snake_case | `audio_routes.py`, `user_service.py` |
| Clases | PascalCase | `AudioService`, `Usuario` |
| Funciones/Métodos | snake_case | `get_user_by_id()`, `analyze_audio()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_AUDIO_SIZE`, `ALLOWED_EXTENSIONS` |
| Variables | snake_case | `user_id`, `audio_file` |
| Blueprints | snake_case prefix `bp` | `bp = Blueprint('audio', ...)` |

### Imports (Orden)

```python
# 1. Standard library
import os
import json
from datetime import datetime
from typing import List, Dict, Optional

# 2. Third-party packages
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import numpy as np

# 3. Local imports
from database.connection import DatabaseConnection
from models.usuario import Usuario
from services.auth_service import AuthService
from utils.helpers import Helpers
from utils.seguridad import Seguridad
```

### Herramientas de Calidad

```bash
# Linting y formato (ejecutar antes de commit)
ruff check backend/             # Linting rápido
ruff format backend/            # Auto-formato
black backend/                  # Formato alternativo
mypy backend/                   # Type checking
bandit -r backend/              # Security scanning
```

Configuración recomendada en `pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
target-version = "py311"
select = ["E", "F", "W", "I", "N", "S", "B"]

[tool.black]
line-length = 100
target-version = ['py311']

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
ignore_missing_imports = true
```

---

## 🔒 Seguridad de Software (Obligatorio)

### ⚠️ DATOS SENSIBLES - Clasificación

| Tipo de Dato | Clasificación | Tratamiento |
|--------------|---------------|-------------|
| Grabaciones de voz | **CRÍTICO** | No loguear, encriptar, retención limitada |
| Niveles emocionales | **ALTO** | Anonimizar en logs, agregar para reportes |
| Emails, nombres | **MEDIO** | Enmascarar en logs |
| Tokens, contraseñas | **CRÍTICO** | NUNCA loguear, solo hashes |
| IPs de usuarios | **MEDIO** | Hash para rate limiting |

### Protección de Datos de Voz

```python
# ❌ PROHIBIDO - NUNCA hacer esto
import logging
logging.info(f"Audio recibido: {audio_data}")  # NO
logging.info(f"Emociones detectadas: {emotions}")  # NO
print(f"Nivel de ansiedad del usuario {user_id}: {nivel}")  # NO

# ✅ CORRECTO - Usar SecureLogger
from utils.security_middleware import secure_log

# Solo loguear metadatos agregados, nunca datos raw
secure_log.info("Audio procesado", data={
    "duracion_segundos": duration,
    "formato": "wav",
    "analisis_exitoso": True
})

# Para métricas emocionales, agregar/anonimizar
secure_log.info("Análisis completado", data={
    "clasificacion": "normal",  # Solo categoría, no valores
    "confianza_rango": "alta"   # No valor exacto
})
```

### Retención y Eliminación de Datos

```python
# Política de retención (implementar en jobs programados)
RETENTION_POLICIES = {
    'audio_files': 30,           # Días antes de eliminar archivos físicos
    'analisis_detallado': 90,    # Días antes de anonimizar
    'datos_agregados': 365,      # Mantener estadísticas anónimas
}

# Eliminación segura de archivos de audio
import os
import secrets

def secure_delete_audio(filepath: str) -> bool:
    """
    Elimina archivo de audio de forma segura.
    Sobreescribe contenido antes de eliminar.
    """
    try:
        if os.path.exists(filepath):
            # Sobreescribir con datos aleatorios
            file_size = os.path.getsize(filepath)
            with open(filepath, 'wb') as f:
                f.write(secrets.token_bytes(file_size))
            # Eliminar archivo
            os.remove(filepath)
            return True
    except Exception:
        return False
```

### Validación y Sanitización de Inputs

```python
from utils.seguridad import Seguridad

# ✅ Siempre validar y sanitizar
@bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")  # Rate limit estricto
def register():
    data = request.get_json()
    
    # 1. Sanitizar inputs de texto
    nombre = Seguridad.sanitize_input(data.get('nombre', ''))
    apellido = Seguridad.sanitize_input(data.get('apellido', ''))
    
    # 2. Validar formato de email
    correo = data.get('correo', '').lower().strip()
    if not Seguridad.validate_email(correo):
        return Helpers.format_response(False, "Email inválido", status=400)
    
    # 3. Validar fuerza de contraseña
    password_valid, password_msg = Seguridad.validate_password_strength(
        data.get('contrasena', '')
    )
    if not password_valid:
        return Helpers.format_response(False, password_msg, status=400)
    
    # 4. Validar archivos subidos
    if 'foto' in request.files:
        file = request.files['foto']
        if not allowed_file(file.filename):
            return Helpers.format_response(False, "Tipo de archivo no permitido", status=400)
```

### Prevención de Inyecciones SQL

```python
# ✅ SIEMPRE usar consultas parametrizadas
query = "SELECT * FROM usuario WHERE correo = %s AND activo = 1"
results = DatabaseConnection.execute_query(query, (correo,))

# ❌ NUNCA concatenar strings en queries
query = f"SELECT * FROM usuario WHERE correo = '{correo}'"  # VULNERABLE

# ❌ NUNCA usar format()
query = "SELECT * FROM usuario WHERE correo = '{}'".format(correo)  # VULNERABLE
```

### Secrets Management

```python
# ✅ CORRECTO - Siempre desde variables de entorno
import os
from database.config import Config

jwt_secret = Config.JWT_SECRET_KEY  # Viene de os.getenv()
groq_key = os.getenv("GROQ_API_KEY")
db_password = os.getenv("DB_PASSWORD")

# ❌ PROHIBIDO - Nunca hardcodear
JWT_SECRET = "mi-secreto-hardcodeado"  # NUNCA
API_KEY = "sk-12345..."  # NUNCA

# Archivo .env.example (versionar como template)
"""
# .env.example - Copiar a .env y llenar valores reales
FLASK_ENV=development
JWT_SECRET_KEY=  # Generar con: python -c "import secrets; print(secrets.token_hex(32))"
DB_HOST=localhost
DB_USER=
DB_PASSWORD=
DB_NAME=serenvoice
GROQ_API_KEY=
"""
```

### Rate Limiting (Implementado)

```python
from utils.security_middleware import limiter

# Límites por tipo de endpoint
@bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute, 20 per hour")  # Auth: muy estricto
def login():
    pass

@bp.route('/audio/analyze', methods=['POST'])
@limiter.limit("10 per minute")  # Upload: moderado
def analyze():
    pass

@bp.route('/usuarios/perfil', methods=['GET'])
@limiter.limit("60 per minute")  # Lectura: más permisivo
def get_profile():
    pass
```

### Security Headers (Implementado en `security_middleware.py`)

Headers configurados automáticamente:
- `X-Frame-Options: SAMEORIGIN` - Previene clickjacking
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Protección XSS
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (en producción)
- `Strict-Transport-Security` (en producción con HTTPS)
- `Cache-Control: no-store` para rutas sensibles

### CORS Seguro (Implementado)

```python
# En database/config.py
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 
    'http://localhost:5173,http://localhost:5174'
).split(',')

# ❌ NUNCA usar wildcard en producción
CORS(app, resources={r"/api/*": {"origins": "*"}})  # INSEGURO

# ✅ Lista explícita de orígenes
CORS(app, resources={r"/api/*": get_cors_config()})
```

---

## 🔐 Autenticación y Autorización

### JWT Configuration (Actual)

```python
# database/config.py
JWT_SECRET_KEY = _get_secure_jwt_secret()  # Generado/cargado seguro
JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=900)  # 15 min en prod
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
JWT_TOKEN_LOCATION = ['headers']
JWT_HEADER_NAME = 'Authorization'
JWT_HEADER_TYPE = 'Bearer'
JWT_ALGORITHM = 'HS256'
```

### Proteger Endpoints

```python
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.seguridad import role_required

# Endpoint que requiere autenticación
@bp.route('/perfil', methods=['GET'])
@jwt_required()
def get_perfil():
    user_id = get_jwt_identity()  # Obtener ID del token
    # ...

# Endpoint solo para admins
@bp.route('/admin/usuarios', methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_get_users():
    # Solo usuarios con rol 'admin' pueden acceder
    pass

# Endpoint con roles múltiples
@bp.route('/reportes', methods=['GET'])
@jwt_required()
@role_required('admin', 'moderador')
def get_reportes():
    pass
```

### Implementación de `role_required`

```python
# utils/seguridad.py
def role_required(*roles):
    """
    Decorador para verificar roles de usuario.
    
    Args:
        *roles: Roles permitidos (ej: 'admin', 'moderador')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user_roles = RolUsuario.get_user_roles(user_id)
            role_names = [r.get('nombre_rol') for r in user_roles]
            
            if not any(role in role_names for role in roles):
                return jsonify({
                    'success': False,
                    'error': 'No tienes permisos para esta acción'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator
```

---

## 🗃 Base de Datos y Modelos

### Pool de Conexiones (Actual)

```python
# database/connection.py
class DatabaseConnection:
    pool = None
    
    @staticmethod
    def initialize_pool():
        DatabaseConnection.pool = pooling.MySQLConnectionPool(
            pool_name="mindvoice_pool",
            pool_size=10,
            host=os.getenv('DB_HOST'),
            # ...
        )
    
    @staticmethod
    def get_connection():
        # Retorna conexión con context manager
        pass
    
    @staticmethod
    def execute_query(query, params=None, fetch=True):
        # Ejecuta query de forma segura
        pass
```

### Patrón de Modelo (Data Access Layer)

```python
# Todos los modelos siguen este patrón
class NombreModelo:
    """Modelo para la tabla nombre_tabla."""
    
    # CRUD básico
    @staticmethod
    def create(**kwargs) -> Optional[int]: pass
    
    @staticmethod
    def get_by_id(id: int) -> Optional[Dict]: pass
    
    @staticmethod
    def get_all(limit: int = 50) -> List[Dict]: pass
    
    @staticmethod
    def update(id: int, **kwargs) -> bool: pass
    
    @staticmethod
    def delete(id: int) -> bool:  # Soft delete
        query = "UPDATE tabla SET activo = 0, eliminado = 1 WHERE id = %s"
        # ...
```

### Soft Delete (Estándar del Proyecto)

```python
# Todas las tablas usan soft delete con campos:
# - activo: BOOLEAN DEFAULT 1
# - eliminado: BOOLEAN DEFAULT 0

# ✅ Correcto
@staticmethod
def get_by_id(id: int) -> Optional[Dict]:
    query = "SELECT * FROM tabla WHERE id = %s AND activo = 1"
    # ...

# ✅ Eliminar (soft)
@staticmethod
def delete(id: int) -> bool:
    query = "UPDATE tabla SET activo = 0, eliminado = 1 WHERE id = %s"
    # ...
```

---

## 📡 API y Contratos

### Formato de Respuesta Estándar

```python
# Usar SIEMPRE Helpers.format_response()
from utils.helpers import Helpers

# Éxito
return Helpers.format_response(
    success=True,
    data={"usuario": usuario_data},
    message="Usuario obtenido correctamente",
    status=200
)

# Error
return Helpers.format_response(
    success=False,
    message="Usuario no encontrado",
    status=404
)

# Estructura de respuesta:
{
    "success": true/false,
    "message": "Mensaje descriptivo",
    "data": { ... }  // Solo si success=true
}
```

### Códigos HTTP Estándar

| Código | Uso |
|--------|-----|
| 200 | Éxito en GET, PUT, PATCH |
| 201 | Éxito en POST (recurso creado) |
| 400 | Error de validación / Request inválido |
| 401 | No autenticado / Token inválido |
| 403 | No autorizado / Sin permisos |
| 404 | Recurso no encontrado |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

### Documentación OpenAPI (Flasgger)

```python
@bp.route('/analisis/<int:id_analisis>', methods=['GET'])
@jwt_required()
def get_analisis(id_analisis):
    """
    Obtener detalle de un análisis
    ---
    tags:
      - Análisis
    security:
      - Bearer: []
    parameters:
      - name: id_analisis
        in: path
        type: integer
        required: true
        description: ID del análisis
    responses:
      200:
        description: Detalle del análisis
        schema:
          type: object
          properties:
            success:
              type: boolean
            data:
              type: object
              properties:
                analisis:
                  type: object
                resultado:
                  type: object
                recomendaciones:
                  type: array
      404:
        description: Análisis no encontrado
      403:
        description: Sin permisos
    """
    pass
```

### Versionado de API

```python
# Actual: /api/...
# Si se necesita versionado futuro:
# /api/v1/...
# /api/v2/...

# Blueprint con versión
bp = Blueprint('usuarios_v1', __name__, url_prefix='/api/v1/usuarios')
```

---

## 🧪 Testing

### Estructura de Tests

```
backend/tests/
├── __init__.py
├── conftest.py          # Fixtures compartidos
├── test_routes.py       # Tests de rutas/endpoints
├── test_services.py     # Tests de servicios
├── test_models.py       # Tests de modelos
├── test_security.py     # Tests de seguridad
└── test_integration.py  # Tests de integración
```

### Ejemplo de Test

```python
# tests/test_routes.py
import pytest
from app import create_app

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code in (200, 500)  # OK o DB disconnected
    data = response.get_json()
    assert 'status' in data

def test_register_validation(client):
    # Test sin campos requeridos
    response = client.post('/api/auth/register', json={})
    assert response.status_code == 400
    
    # Test con email inválido
    response = client.post('/api/auth/register', json={
        'nombre': 'Test',
        'apellido': 'User',
        'correo': 'invalid-email',
        'contrasena': 'Password123'
    })
    assert response.status_code == 400

def test_protected_route_requires_auth(client):
    response = client.get('/api/usuarios/perfil')
    assert response.status_code == 401
```

### Mocking de Servicios Externos

```python
from unittest.mock import patch, MagicMock

def test_groq_recommendations_failure():
    """Test que el sistema maneja errores de Groq gracefully."""
    with patch('services.groq_service.Groq') as mock_groq:
        mock_groq.return_value.chat.completions.create.side_effect = Exception("API Error")
        
        # El servicio debe retornar lista vacía, no crashear
        result = generate_recommendations_with_groq({})
        assert result == []
```

### Cobertura Mínima

```bash
# Ejecutar tests con cobertura
pytest --cov=backend --cov-report=html

# Cobertura mínima requerida: 70%
# Áreas críticas (80%+): auth_service, seguridad, audio_service
```

---

## 🔄 CI/CD y Calidad

### Checks Obligatorios (Pre-Merge)

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths: ['backend/**']
  pull_request:
    branches: [main, develop]
    paths: ['backend/**']

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install ruff mypy bandit pytest pytest-cov
      
      - name: Lint with ruff
        run: ruff check backend/
      
      - name: Type check with mypy
        run: mypy backend/ --ignore-missing-imports
      
      - name: Security scan with bandit
        run: bandit -r backend/ -ll -ii
      
      - name: Run tests
        run: pytest backend/tests/ --cov=backend --cov-fail-under=70
      
      - name: Dependency scan
        uses: pyupio/safety@v2
        with:
          api-key: ${{ secrets.SAFETY_API_KEY }}
```

### SAST (Static Application Security Testing)

```bash
# Bandit - Security linting
bandit -r backend/ -f json -o bandit-report.json

# Semgrep - Pattern-based analysis
semgrep --config=p/python backend/
```

### SBOM (Software Bill of Materials)

```bash
# Generar SBOM con syft
syft backend/ -o cyclonedx-json > sbom.json

# O con pip
pip-audit --format=cyclonedx-json > sbom.json
```

---

## 📊 Observabilidad

### Health/Readiness Endpoints (Actuales)

```python
# Implementados en app.py
@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = DatabaseConnection.test_connection()
    return {
        'status': 'ok' if db_status else 'error',
        'database': 'connected' if db_status else 'disconnected',
        'message': 'SerenVoice API funcionando correctamente'
    }, 200 if db_status else 500
```

### Structured Logging

```python
from utils.security_middleware import secure_log

# ✅ Logging estructurado y seguro
secure_log.info("Operación completada", data={
    "operacion": "analisis_audio",
    "duracion_ms": 1500,
    "exitoso": True
})

# Los campos sensibles se sanitizan automáticamente
secure_log.info("Usuario autenticado", data={
    "user_id": 123,
    "correo": "user@example.com",  # Se enmascara a "us***le.com"
    "ip": request.remote_addr
})
```

### Métricas Recomendadas

```python
# Para integración futura con Prometheus/OpenTelemetry
METRICAS_CLAVE = {
    'audio_analisis_total': 'Contador de análisis realizados',
    'audio_analisis_duracion': 'Histograma de duración de análisis',
    'auth_login_total': 'Contador de intentos de login',
    'auth_login_fallidos': 'Contador de logins fallidos',
    'api_requests_total': 'Total de requests por endpoint',
    'api_latencia_segundos': 'Latencia de respuesta',
    'groq_llamadas_total': 'Llamadas a API de Groq',
    'groq_errores_total': 'Errores en llamadas a Groq',
}
```

---

## 🚫 Reglas Estrictas

### ❌ PROHIBIDO (NO HACER)

1. **Refactors masivos sin aprobación**
   - No renombrar carpetas existentes (`routes/`, `services/`, `models/`)
   - No cambiar patrones de arquitectura sin RFC
   - No migrar de MySQL a otra BD sin plan completo

2. **Cambios breaking en API**
   - No cambiar URLs de endpoints existentes
   - No modificar estructura de responses sin versionar
   - No eliminar campos de respuestas

3. **Seguridad**
   - NUNCA loguear datos de voz o emociones raw
   - NUNCA hardcodear secretos
   - NUNCA desactivar rate limiting en producción
   - NUNCA usar `*` en CORS en producción

4. **Base de datos**
   - NUNCA concatenar strings en queries SQL
   - NUNCA hacer DELETE físico (usar soft delete)
   - NUNCA exponer IDs internos sin validar permisos

### ✅ SIEMPRE HACER

1. **Antes de crear nuevo código**
   - Verificar si ya existe funcionalidad similar
   - Seguir patrones existentes en el directorio
   - Agregar type hints y docstrings

2. **Para cambios en endpoints**
   - Documentar en Flasgger/OpenAPI
   - Agregar tests
   - Validar inputs con Seguridad.*

3. **Para datos sensibles**
   - Usar SecureLogger
   - Anonimizar/agregar antes de loguear
   - Verificar permisos del usuario

### Cuándo Pedir Revisión Arquitectónica

- Nuevo servicio externo (API, base de datos)
- Cambios en autenticación/autorización
- Nuevo tipo de dato sensible
- Cambios en estructura de carpetas
- Migración de dependencias mayores

---

## ✅ Checklist para Nuevas Contribuciones

```markdown
### Pre-Código
- [ ] Leí las instrucciones del proyecto
- [ ] Verifiqué que no existe funcionalidad similar
- [ ] La ubicación del archivo sigue la estructura existente

### Código
- [ ] Type hints en todas las funciones
- [ ] Docstrings en funciones públicas
- [ ] Inputs validados y sanitizados
- [ ] Queries SQL parametrizadas
- [ ] Sin datos sensibles en logs
- [ ] Rate limiting en endpoints nuevos

### Seguridad
- [ ] No hay secretos hardcodeados
- [ ] Permisos verificados (jwt_required, role_required)
- [ ] Datos de voz/emociones protegidos

### Testing
- [ ] Tests unitarios agregados
- [ ] Tests de integración si aplica
- [ ] Cobertura >= 70%

### Documentación
- [ ] OpenAPI/Flasgger actualizado
- [ ] README actualizado si hay nuevo setup

### CI
- [ ] Linting pasa (ruff)
- [ ] Type checking pasa (mypy)
- [ ] Security scan pasa (bandit)
- [ ] Tests pasan
```

---

## 📚 Referencias

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [PEP 484 - Type Hints](https://peps.python.org/pep-0484/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

---

*Esta documentación es la fuente autoritativa para contribuciones al backend de SerenVoice. Cualquier desviación requiere aprobación explícita del equipo.*
