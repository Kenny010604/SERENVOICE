# backend/test_models.py
import os
import sys

# Cargar variables de entorno
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

from database.connection import DatabaseConnection
from database.config import Config
from models.usuario import Usuario
from models.rol import Rol

# Probar conexión y modelos
print("🧪 Probando modelos...\n")

# Inicializar pool de conexiones
print("Inicializando pool de base de datos...")
try:
    DatabaseConnection.initialize_pool()
    print("✅ Pool inicializado correctamente\n")
except Exception as e:
    print(f"❌ Error inicializando pool: {e}")
    print("   Verifica tu archivo .env y que MySQL esté corriendo")
    sys.exit(1)

# Test 1: Obtener roles
print("\n1. Probando Rol.get_all():")
roles = Rol.get_all()
print(f"   Roles encontrados: {len(roles)}")
for rol in roles:
    print(f"   - {rol['nombre_rol']}: {rol['descripcion']}")

# Test 2: Obtener usuarios
print("\n2. Probando Usuario.get_all():")
usuarios = Usuario.get_all(limit=5)
print(f"   Usuarios encontrados: {len(usuarios)}")
for usuario in usuarios:
    print(f"   - {usuario['nombre']} {usuario['apellido']} ({usuario['correo']})")

# Test 3: Buscar usuario por email
print("\n3. Probando Usuario.get_by_email():")
usuario = Usuario.get_by_email('juan.perez@email.com')
if usuario:
    print(f"   ✅ Usuario encontrado: {usuario['nombre']} {usuario['apellido']}")
else:
    print("   ❌ Usuario no encontrado")

print("\n✅ Todos los tests pasaron correctamente!")
