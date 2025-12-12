# Script para corregir o eliminar el usuario de prueba
import os
import sys
from werkzeug.security import generate_password_hash

# Cargar variables de entorno
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

from database.connection import DatabaseConnection
from database.config import Config

print("🔧 Script para corregir usuario de prueba\n")

# Inicializar pool
try:
    DatabaseConnection.initialize_pool()
    print("✅ Pool de base de datos inicializado\n")
except Exception as e:
    print(f"❌ Error inicializando pool: {e}")
    sys.exit(1)

correo_test = "testapi@email.com"
nueva_contrasena = "Kenny123"

print(f"Buscando usuario: {correo_test}")

try:
    with DatabaseConnection.get_connection() as connection:
        cursor = connection.cursor(dictionary=True)
        
        # Verificar si existe
        cursor.execute("SELECT id_usuario, nombre, correo FROM usuario WHERE correo = %s", (correo_test,))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ Usuario no encontrado. Puedes registrarlo con test_api.py\n")
            sys.exit(0)
        
        print(f"✅ Usuario encontrado: ID={user['id_usuario']}, Nombre={user['nombre']}")
        
        # Preguntar qué hacer
        print("\n¿Qué deseas hacer?")
        print("1. Actualizar contraseña con hash correcto")
        print("2. Eliminar usuario")
        print("3. Cancelar")
        
        opcion = input("\nOpción (1/2/3): ").strip()
        
        if opcion == "1":
            # Actualizar contraseña
            password_hash = generate_password_hash(nueva_contrasena)
            cursor.execute(
                "UPDATE usuario SET contrasena = %s WHERE correo = %s",
                (password_hash, correo_test)
            )
            connection.commit()
            print(f"\n✅ Contraseña actualizada correctamente")
            print(f"   Ahora puedes hacer login con: {correo_test} / {nueva_contrasena}\n")
            
        elif opcion == "2":
            # Eliminar usuario
            cursor.execute("DELETE FROM usuario WHERE correo = %s", (correo_test,))
            connection.commit()
            print(f"\n✅ Usuario eliminado correctamente")
            print(f"   Ahora puedes registrarlo nuevamente con test_api.py\n")
            
        else:
            print("\n❌ Operación cancelada\n")
            
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
