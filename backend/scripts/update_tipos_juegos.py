import os
import sys
import json

# Asegurar que el paquete `database` es importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.connection import DatabaseConnection

MAPPING = {
    'relajacion': 'respiracion',
    'reflexion': 'mandala',
    'concentracion': 'puzzle',
    'musicoterapia': 'mindfulness'
}


def main():
    DatabaseConnection.initialize_pool()
    if not DatabaseConnection.test_connection():
        print(json.dumps({'success': False, 'error': 'No se pudo conectar a la BD'}))
        return

    results = []
    for old, new in MAPPING.items():
        try:
            query = "UPDATE juegos_terapeuticos SET tipo_juego = %s WHERE LOWER(tipo_juego) = %s"
            res = DatabaseConnection.execute_update(query, (new, old))
            rowcount = res.get('rowcount') if isinstance(res, dict) else None
            results.append({'from': old, 'to': new, 'rowcount': rowcount})
        except Exception as e:
            results.append({'from': old, 'to': new, 'error': str(e)})

    # También normalizar a minúsculas cualquier tipo_juego restante
    try:
        q2 = "UPDATE juegos_terapeuticos SET tipo_juego = LOWER(tipo_juego)"
        res2 = DatabaseConnection.execute_update(q2)
        results.append({'normalize_lowercase_rowcount': res2.get('rowcount') if isinstance(res2, dict) else None})
    except Exception as e:
        results.append({'normalize_error': str(e)})

    print(json.dumps({'success': True, 'results': results}, ensure_ascii=False))


if __name__ == '__main__':
    main()
