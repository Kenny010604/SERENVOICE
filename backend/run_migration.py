import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import DatabaseConnection

def run_migration():
    conn = None
    try:
        # Inicializar pool antes de usar
        DatabaseConnection.initialize_pool()
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        print("Ejecutando migración de verificación de email...")
        
        # Agregar columnas
        cursor.execute("""
            ALTER TABLE usuario 
            ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE AFTER correo
        """)
        print("✓ Columna email_verificado agregada")
        
        cursor.execute("""
            ALTER TABLE usuario 
            ADD COLUMN IF NOT EXISTS token_verificacion VARCHAR(255) NULL AFTER email_verificado
        """)
        print("✓ Columna token_verificacion agregada")
        
        cursor.execute("""
            ALTER TABLE usuario 
            ADD COLUMN IF NOT EXISTS token_verificacion_expira DATETIME NULL AFTER token_verificacion
        """)
        print("✓ Columna token_verificacion_expira agregada")
        
        cursor.execute("""
            ALTER TABLE usuario 
            ADD COLUMN IF NOT EXISTS token_reset_password VARCHAR(255) NULL AFTER token_verificacion_expira
        """)
        print("✓ Columna token_reset_password agregada")
        
        cursor.execute("""
            ALTER TABLE usuario 
            ADD COLUMN IF NOT EXISTS token_reset_expira DATETIME NULL AFTER token_reset_password
        """)
        print("✓ Columna token_reset_expira agregada")
        
        # Marcar usuarios de Google como verificados
        cursor.execute("""
            UPDATE usuario 
            SET email_verificado = TRUE 
            WHERE auth_provider = 'google'
        """)
        print("✓ Usuarios de Google marcados como verificados")
        
        # Crear índices
        try:
            cursor.execute("CREATE INDEX idx_token_verificacion ON usuario(token_verificacion)")
            print("✓ Índice idx_token_verificacion creado")
        except:
            print("  (Índice idx_token_verificacion ya existe)")
        
        try:
            cursor.execute("CREATE INDEX idx_token_reset ON usuario(token_reset_password)")
            print("✓ Índice idx_token_reset creado")
        except:
            print("  (Índice idx_token_reset ya existe)")
        
        try:
            cursor.execute("CREATE INDEX idx_email_verificado ON usuario(email_verificado)")
            print("✓ Índice idx_email_verificado creado")
        except:
            print("  (Índice idx_email_verificado ya existe)")
        
        conn.commit()
        print("\n✅ Migración completada exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error en migración: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migration()
