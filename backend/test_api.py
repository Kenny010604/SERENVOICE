# backend/test_api.py
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5000/api"

print("🧪 Testeando MindVoice API\n")
print("⚠️  IMPORTANTE: Asegúrate de que el servidor esté corriendo en http://127.0.0.1:5000")
print("   Ejecuta: python app.py\n")

# Verificar conexión al servidor
try:
    response = requests.get("http://127.0.0.1:5000/", timeout=2)
except requests.exceptions.ConnectionError:
    print("❌ ERROR: No se puede conectar al servidor.")
    print("   Por favor, inicia el servidor primero con: python app.py")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERROR: {e}")
    sys.exit(1)

print("✅ Servidor detectado, iniciando tests...\n")

# 1. Health Check
print("1. Health Check...")
response = requests.get(f"{BASE_URL}/health")
print("   Status:", response.status_code)
print("   Response:", response.json(), "\n")


# 2. Registro
print("2. Registrar usuario...")
registro_data = {
    "nombre": "Test",
    "apellido": "User",
    "correo": "testapi@email.com",
    "contrasena": "Kenny123"
}

response = requests.post(f"{BASE_URL}/auth/register", json=registro_data)
print("   Status:", response.status_code)
response_data = response.json()
print("   Response:", response_data)

# Si el usuario ya existe, no es un error crítico
if response.status_code == 400 and "ya está registrado" in response_data.get('error', ''):
    print("   ⚠️  Usuario ya existe, continuando con login...\n")
elif response.status_code == 201:
    print("   ✅ Usuario registrado exitosamente\n")
else:
    print(f"   ⚠️  Respuesta inesperada (código {response.status_code})\n")


# 3. Login
print("3. Login...")
login_data = {
    "correo": "testapi@email.com",
    "contrasena": "Kenny123"
}

response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
data = response.json()

print("   Status:", response.status_code)
print("   Response:", data)

# ❗ Verificar si el login devolvió token
if response.status_code != 200:
    print(f"\n❌ Error en login: {data.get('error', 'Error desconocido')}\n")
    sys.exit(1)

if not data.get("success") or "token" not in data:
    print("\n❌ Login exitoso pero no se obtuvo token.\n")
    sys.exit(1)

token = data["token"]
print(f"   ✅ Token obtenido: {token[:20]}...\n")


# 4. Obtener perfil
print("4. Obtener perfil...")
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/usuarios/me", headers=headers)

print("   Status:", response.status_code)
print("   Response:", response.json(), "\n")

print("✅ Todos los tests pasaron correctamente!")
