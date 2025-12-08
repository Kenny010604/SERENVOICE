import mysql.connector
from mysql.connector import pooling, Error
import os
from dotenv import load_dotenv

load_dotenv()


class DatabaseConnection:
    """
    Manejo global (estático) del pool de conexiones.
    """
    pool = None

    # ------------------------------------------------------------
    # Inicializar pool de conexiones — se llama una sola vez
    # ------------------------------------------------------------
    @staticmethod
    def initialize_pool():
        try:
            DatabaseConnection.pool = pooling.MySQLConnectionPool(
                pool_name="mindvoice_pool",
                pool_size=10,
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'serenvoice'),
                port=int(os.getenv('DB_PORT', 3306)),
            )
            print("[DB] Pool de conexiones inicializado correctamente")
        except Error as e:
            print(f"[DB] Error al crear pool: {e}")
            raise

    # ------------------------------------------------------------
    # Obtener conexión desde el pool
    # ------------------------------------------------------------
    @staticmethod
    def get_connection():
        if DatabaseConnection.pool is None:
            raise RuntimeError(
                "El pool no ha sido inicializado. Llama a DatabaseConnection.initialize_pool() primero."
            )
        try:
            return DatabaseConnection.pool.get_connection()
        except Error as e:
            print(f"[DB] Error obteniendo conexión del pool: {e}")
            raise

    # ------------------------------------------------------------
    # Liberar conexión
    # ------------------------------------------------------------
    @staticmethod
    def release_connection(conn):
        if conn:
            conn.close()

    # ------------------------------------------------------------
    # Probar conexión
    # ------------------------------------------------------------
    @staticmethod
    def test_connection():
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT DATABASE()")
            db_name = cursor.fetchone()[0]

            cursor.close()
            conn.close()

            print(f"[DB] Conexión OK — Base de datos actual: {db_name}")
            return True
        except Error as e:
            print(f"[DB] Error al probar conexión: {e}")
            return False

    # ------------------------------------------------------------
    # Ejecutar consultas (SELECT, INSERT, UPDATE, DELETE)
    # ------------------------------------------------------------
    @staticmethod
    def execute_query(query, params=None, fetch=True):
        conn = None
        cursor = None

        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(query, params)

            if fetch:
                result = cursor.fetchall()
                return result

            conn.commit()
            return True

        except Error as e:
            print(f"[DB] Error ejecutando query: {e}")
            raise

        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.release_connection(conn)


# ------------------------------------------------------------
# Compatibilidad con proyectos antiguos
# ------------------------------------------------------------
def get_db_connection():
    return DatabaseConnection.get_connection()


# ------------------------------------------------------------
# Prueba manual
# ------------------------------------------------------------
if __name__ == "__main__":
    DatabaseConnection.initialize_pool()
    DatabaseConnection.test_connection()
