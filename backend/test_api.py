# backend/test_api.py
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

print("🧪 Testeando MindVoice API\n")

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
    "contraseña": "Kenny123"
}

response = requests.post(f"{BASE_URL}/auth/register", json=registro_data)
print("   Status:", response.status_code)
print("   Response:", response.json(), "\n")


# 3. Login
print("3. Login...")
login_data = {
    "correo": "testapi@email.com",
    "contraseña": "Kenny123"
}

response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
data = response.json()

print("   Status:", response.status_code)
print("   Response:", data)

# ❗ Verificar si el login devolvió token
if response.status_code != 200 or "data" not in data:
    print("\n❌ Error en login, no se obtuvo token.\n")
    exit()

token = data["data"]["token"]
print(f"   ✅ Token obtenido: {token[:20]}...\n")


# 4. Obtener perfil
print("4. Obtener perfil...")
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/usuarios/me", headers=headers)

print("   Status:", response.status_code)
print("   Response:", response.json(), "\n")

print("✅ Todos los tests pasaron correctamente!")
