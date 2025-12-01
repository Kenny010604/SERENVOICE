# backend/database/connection.py
import mysql.connector
from mysql.connector import Error, pooling
from database.config import Config
from contextlib import contextmanager

class DatabaseConnection:
    """Gestión de conexiones a la base de datos con pool"""
    
    _pool = None
    
    @classmethod
    def initialize_pool(cls):
        """Inicializar el pool de conexiones"""
        try:
            cls._pool = pooling.MySQLConnectionPool(
                pool_name="sistema_estres_pool",
                pool_size=5,
                pool_reset_session=True,
                **Config.DB_CONFIG
            )
            print("[OK] Pool de conexiones inicializado correctamente")
        except Error as e:
            print(f"[ERROR] Error al crear pool de conexiones: {e}")
            raise
    
    @classmethod
    @contextmanager
    def get_connection(cls):
        """Context manager para obtener una conexión del pool"""
        if cls._pool is None:
            cls.initialize_pool()
        
        connection = None
        try:
            connection = cls._pool.get_connection()
            yield connection
        except Error as e:
            if connection:
                connection.rollback()
            print(f"[ERROR] Error en la conexion: {e}")
            raise
        finally:
            if connection and connection.is_connected():
                connection.close()
    
    @classmethod
    @contextmanager
    def get_cursor(cls, dictionary=True):
        """Context manager para obtener un cursor"""
        with cls.get_connection() as connection:
            cursor = connection.cursor(dictionary=dictionary)
            try:
                yield cursor
                connection.commit()
            except Error as e:
                connection.rollback()
                print(f"[ERROR] Error en la consulta: {e}")
                raise
            finally:
                cursor.close()
    
    @classmethod
    def execute_query(cls, query, params=None, fetch=True):
        """Ejecutar una consulta de forma simplificada"""
        with cls.get_cursor() as cursor:
            cursor.execute(query, params or ())
            
            if fetch:
                return cursor.fetchall()
            else:
                return cursor.lastrowid
    
    @classmethod
    def test_connection(cls):
        """Probar la conexión a la base de datos"""
        try:
            with cls.get_cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                print("[OK] Conexion a la base de datos exitosa")
                return True
        except Error as e:
            print(f"[ERROR] Error al conectar a la base de datos: {e}")
            return False