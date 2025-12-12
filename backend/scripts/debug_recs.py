import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.connection import DatabaseConnection

mapeo_juegos = {'estable': ['memoria','puzzle']}
estado = 'estable'
tipos_recomendados = mapeo_juegos.get(estado)
DatabaseConnection.initialize_pool()
print('DB ok', DatabaseConnection.test_connection())
placeholders = ','.join(['%s'] * len(tipos_recomendados))
sql = f"SELECT id, nombre, descripcion, tipo_juego, duracion_recomendada, objetivo_emocional, icono, activo FROM juegos_terapeuticos WHERE tipo_juego IN ({placeholders}) AND activo = 1 LIMIT 10"
print('SQL', sql, tipos_recomendados)
juegos_rows = DatabaseConnection.execute_query(sql, tuple(tipos_recomendados))
print('juegos_rows:', juegos_rows)
if len(juegos_rows) < 10:
    existentes_ids = [j['id'] for j in juegos_rows]
    print('existentes', existentes_ids)
    if existentes_ids:
        placeholders_ids = ','.join(['%s'] * len(existentes_ids))
        sql_add = f"SELECT id, nombre FROM juegos_terapeuticos WHERE activo = 1 AND id NOT IN ({placeholders_ids}) LIMIT %s"
        params = tuple(existentes_ids) + (10 - len(juegos_rows),)
    else:
        sql_add = "SELECT id, nombre FROM juegos_terapeuticos WHERE activo = 1 LIMIT %s"
        params = (10 - len(juegos_rows),)
    print('SQL_ADD', sql_add, params)
    adicionales = DatabaseConnection.execute_query(sql_add, params)
    print('adicionales', adicionales)
