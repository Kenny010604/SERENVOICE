from database.connection import DatabaseConnection

EMAIL = 'john-m130@hotmail.com'

if __name__ == '__main__':
    try:
        DatabaseConnection.initialize_pool()
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id_usuario FROM usuario WHERE correo = %s", (EMAIL,))
        row = cursor.fetchone()
        if not row:
            print(f'No se encontró usuario con correo {EMAIL}')
        else:
            user_id = row[0]
            print('Usuario encontrado, id_usuario=', user_id)
            cursor.execute("SELECT id_sesion, id_usuario, fecha_inicio, fecha_fin, estado, activo FROM sesion WHERE id_usuario = %s ORDER BY fecha_inicio DESC LIMIT 5", (user_id,))
            sesiones = cursor.fetchall()
            if not sesiones:
                print('No se encontraron sesiones para el usuario')
            else:
                print('Sesiones recientes:')
                for s in sesiones:
                    print(s)

        cursor.close()
        DatabaseConnection.release_connection(conn)
    except Exception as e:
        print('ERROR', e)
