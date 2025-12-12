import sys
import os
import json
# Ensure backend root is on sys.path so `database` package imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.connection import DatabaseConnection


def main():
    DatabaseConnection.initialize_pool()
    ok = DatabaseConnection.test_connection()
    if not ok:
        print(json.dumps({"success": False, "error": "No se pudo conectar a la BD"}, ensure_ascii=False))
        return

    # Listar juegos
    try:
        rows = DatabaseConnection.execute_query(
            "SELECT id, nombre, tipo_juego, activo, objetivo_emocional FROM juegos_terapeuticos ORDER BY id"
        )
        print(json.dumps({"success": True, "count": len(rows), "rows": rows}, default=str, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))


if __name__ == '__main__':
    main()
