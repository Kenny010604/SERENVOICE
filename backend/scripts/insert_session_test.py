import sys, os
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.connection import DatabaseConnection
from datetime import datetime

def main():
    DatabaseConnection.initialize_pool()
    if not DatabaseConnection.test_connection():
        print(json.dumps({'success': False, 'error': 'No DB'}))
        return
    try:
        query = "INSERT INTO sesiones_juego (id_usuario, id_juego, fecha_inicio) VALUES (%s, %s, %s)"
        now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        res = DatabaseConnection.execute_update(query, (1, 4, now))
        print(json.dumps({'success': True, 'result': res}, default=str))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()
