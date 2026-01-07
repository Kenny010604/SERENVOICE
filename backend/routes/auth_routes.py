# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify, Response, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from database.connection import DatabaseConnection, get_db_connection
from models.rol import Rol
from datetime import datetime, date

# Seguridad
from utils.seguridad import Seguridad
from utils.security_middleware import limiter, secure_log
from services.auditoria_service import auditoria

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# ======================================================
# 🔶 PROXY DE IMÁGENAS (para evitar bloqueos externos como 429/CORS)
# Permite al frontend cargar imágenes externas (solo googleusercontent.com)
# ======================================================
@bp.route('/proxy_image')
@limiter.limit("30 per minute")  # Rate limit para proxy
def proxy_image():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Missing url parameter'}), 400

    # Seguridad: permitir solo dominios conocidos (Google user content)
    allowed_hosts = ['googleusercontent.com', 'lh3.googleusercontent.com']
    try:
        lower = url.lower()
    except Exception:
        return jsonify({'error': 'Invalid url'}), 400

    if not any(h in lower for h in allowed_hosts):
        secure_log.warning("Intento de proxy a host no permitido", data={"url": url[:100]})
        return jsonify({'error': 'Host not allowed'}), 403

    # Fetch the image using urllib to avoid adding external deps
    try:
        from urllib.request import Request, urlopen
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(req, timeout=10) as resp:
            data = resp.read()
            content_type = resp.headers.get('Content-Type', 'application/octet-stream')
            return Response(data, mimetype=content_type)
    except Exception as e:
        secure_log.error("Error en proxy de imagen", data={"error": str(e)})
        return jsonify({'error': 'Failed to fetch image'}), 502


# ======================================================
# 🔵 REGISTRO DE USUARIO
# ======================================================
@bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute, 20 per hour")  # Límite estricto para registros
def register():
    client_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', '')
    
    try:
        # Verificar si es multipart (con archivo) o JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Datos del formulario multipart
            nombres = request.form.get('nombre', '').strip()
            apellidos = request.form.get('apellido', '').strip()
            correo = request.form.get('correo', '').lower().strip()
            contrasena = request.form.get('contrasena', '')
            genero = request.form.get('genero')
            fecha_nacimiento = request.form.get('fecha_nacimiento')
            usa_medicamentos = request.form.get('usa_medicamentos', 'false').lower() == 'true'
            foto_perfil_file = request.files.get('foto_perfil')
            print(f"[DEBUG] request.files: {request.files}")
            if foto_perfil_file:
                print(f"[DEBUG] foto_perfil_file.filename: {foto_perfil_file.filename}")
            else:
                print("[DEBUG] No se recibió foto_perfil_file")
        else:
            # Datos JSON (sin foto)
            data = request.get_json()
            nombres = data.get('nombre', '').strip()
            apellidos = data.get('apellido', '').strip()
            correo = data.get('correo', '').lower().strip()
            contrasena = data.get('contrasena', '')
            genero = data.get('genero')
            fecha_nacimiento = data.get('fecha_nacimiento')
            usa_medicamentos = data.get('usa_medicamentos', False)
            foto_perfil_file = None

        # Sanitizar inputs
        nombres = Seguridad.sanitize_input(nombres)
        apellidos = Seguridad.sanitize_input(apellidos)

        # Validaciones
        if not nombres:
            return jsonify({'success': False, 'error': 'Los nombres son requeridos'}), 400
        if not apellidos:
            return jsonify({'success': False, 'error': 'Los apellidos son requeridos'}), 400
        if not correo:
            return jsonify({'success': False, 'error': 'El correo es requerido'}), 400
        
        # Validar formato de email
        if not Seguridad.validate_email(correo):
            return jsonify({'success': False, 'error': 'Formato de correo inválido'}), 400
        
        if not contrasena:
            return jsonify({'success': False, 'error': 'La contraseña es requerida'}), 400
        
        # ✅ Usar validación UNIFICADA de contraseña
        password_valid, password_msg = Seguridad.validate_password_strength(contrasena)
        if not password_valid:
            return jsonify({'success': False, 'error': password_msg}), 400

        # Normalizar fecha
        if fecha_nacimiento == "" or fecha_nacimiento is None:
            fecha_nacimiento = None
            edad = None
        else:
            # Calcular edad si hay fecha de nacimiento
            try:
                fecha_dt = datetime.strptime(fecha_nacimiento, "%Y-%m-%d").date()
                hoy = date.today()
                edad = hoy.year - fecha_dt.year - ((hoy.month, hoy.day) < (fecha_dt.month, fecha_dt.day))
            except Exception as e:
                secure_log.error("Error calculando edad", data={"error": str(e)})
                edad = None

        print(f"[REGISTRO] Datos a guardar: fecha_nacimiento={fecha_nacimiento}, edad={edad}")

        with DatabaseConnection.get_connection() as connection:
            cursor = connection.cursor()

            # Verificar si el correo ya existe
            cursor.execute("SELECT id_usuario FROM usuario WHERE correo = %s", (correo,))
            if cursor.fetchone():
                return jsonify({'success': False, 'error': 'El correo ya está registrado'}), 400

            password_hash = generate_password_hash(contrasena)

            # Procesar foto de perfil si existe
            foto_perfil_path = None
            # Forzar creación de carpeta antes de guardar
            import os
            upload_folder = os.path.join(os.getcwd(), 'uploads', 'perfiles')
            os.makedirs(upload_folder, exist_ok=True)
            if foto_perfil_file and foto_perfil_file.filename:
                import os
                from werkzeug.utils import secure_filename
                import uuid
                
                # Validar extensión de archivo
                allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
                filename = secure_filename(foto_perfil_file.filename)
                extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
                
                if extension in allowed_extensions:
                    # Generar nombre único para el archivo
                    unique_filename = f"{uuid.uuid4().hex}.{extension}"
                    
                    # Crear directorio si no existe
                    upload_folder = os.path.join(os.getcwd(), 'uploads', 'perfiles')
                    os.makedirs(upload_folder, exist_ok=True)
                    
                    # Guardar archivo
                    file_path = os.path.join(upload_folder, unique_filename)
                    foto_perfil_file.save(file_path)
                    
                    # Guardar ruta relativa para la BD
                    foto_perfil_path = f"/uploads/perfiles/{unique_filename}"
                    print(f"[REGISTRO] Foto de perfil guardada: {foto_perfil_path}")
                else:
                    print(f"[REGISTRO] Extensión de archivo no permitida: {extension}")
            
            # Generar token de verificación
            from services.email_service import email_service
            token_verificacion = email_service.generar_token()
            token_expiracion = email_service.calcular_expiracion(24)  # 24 horas

            # Insertar usuario SIN columna 'rol' (ahora usa tabla rol_usuario)
            cursor.execute("""
                INSERT INTO usuario (nombre, apellido, correo, contrasena, fecha_nacimiento, edad, usa_medicamentos, genero, auth_provider, email_verificado, token_verificacion, token_verificacion_expira, foto_perfil)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'local', FALSE, %s, %s, %s)
            """, (nombres, apellidos, correo, password_hash, fecha_nacimiento, edad, usa_medicamentos, genero, token_verificacion, token_expiracion, foto_perfil_path))
            
            print(f"[REGISTRO] Usuario insertado con edad: {edad}")

            connection.commit()
            user_id = cursor.lastrowid
            
            # Asignar rol 'usuario' por defecto usando tabla rol_usuario
            cursor.execute("SELECT id_rol FROM rol WHERE nombre_rol = 'usuario' AND activo = 1 LIMIT 1")
            rol_row = cursor.fetchone()
            
            if rol_row:
                id_rol = rol_row[0]
                cursor.execute("""
                    INSERT INTO rol_usuario (id_usuario, id_rol)
                    VALUES (%s, %s)
                """, (user_id, id_rol))
                connection.commit()

        # Enviar email de verificación
        email_enviado = False
        try:
            from services.email_service import email_service
            email_enviado = email_service.enviar_email_verificacion(correo, nombres, token_verificacion)
            if email_enviado:
                print(f"[REGISTRO] Email de verificación enviado a {correo}")
        except Exception as e:
            print(f"[REGISTRO ERROR] No se pudo enviar email de verificación: {e}")

        # NO generar token - el usuario debe verificar su email primero
        return jsonify({
            'success': True,
            'message': 'Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.',
            'requiresVerification': True,
            'emailSent': email_enviado,
            'correo': correo
        }), 201

    except Exception as e:
        print("Error en /register:", e)
        return jsonify({'success': False, 'error': str(e)}), 500



# ======================================================
# 🟠 ACTUALIZAR PERFIL + CAMBIO DE CONTRASEÑA
# ======================================================
@bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    
    # Verificar si es multipart (con archivo) o JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Datos del formulario multipart
        nombre = request.form.get('nombre')
        apellido = request.form.get('apellido')
        correo = request.form.get('correo')
        genero = request.form.get('genero')
        fecha_nacimiento = request.form.get('fecha_nacimiento') or None
        usa_medicamentos = request.form.get('usa_medicamentos', '0') == '1' or request.form.get('usa_medicamentos', '').lower() == 'true'
        notificaciones = request.form.get('notificaciones', '1') == '1' or request.form.get('notificaciones', '').lower() == 'true'
        
        # Contraseñas
        contrasena_actual = request.form.get('contrasenaActual')
        contrasena_nueva = request.form.get('contrasenaNueva')
        confirmar_contrasena = request.form.get('confirmarContrasena')
        
        # Foto de perfil
        foto_perfil_file = request.files.get('foto_perfil')
        remover_foto = request.form.get('remover_foto') == 'true'
    else:
        # Datos JSON (sin foto)
        data = request.get_json()
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        correo = data.get("correo")
        genero = data.get("genero")
        fecha_nacimiento = data.get("fecha_nacimiento") or None
        usa_medicamentos = data.get("usa_medicamentos", 0)
        notificaciones = data.get("notificaciones", 1)
        
        # Contraseñas
        contrasena_actual = data.get("contrasenaActual")
        contrasena_nueva = data.get("contrasenaNueva")
        confirmar_contrasena = data.get("confirmarContrasena")
        
        foto_perfil_file = None
        remover_foto = False

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener contraseña actual
        cursor.execute("SELECT contrasena FROM usuario WHERE id_usuario=%s", (user_id,))
        user_row = cursor.fetchone()

        if not user_row:
            return jsonify({"error": "Usuario no encontrado"}), 404

        nueva_contra_hash = user_row["contrasena"]  # default

        # ============================================================
        # 🔵 CAMBIO DE CONTRASEÑA SOLO SI EL USUARIO LA ENVÍA
        # ============================================================
        if contrasena_nueva:
            if not contrasena_actual:
                return jsonify({"error": "Debe ingresar la contraseña actual"}), 400

            if not check_password_hash(user_row["contrasena"], contrasena_actual):
                return jsonify({"error": "La contraseña actual es incorrecta"}), 400

            if contrasena_nueva != confirmar_contrasena:
                return jsonify({"error": "Las contraseñas no coinciden"}), 400

            if len(contrasena_nueva) < 8:
                return jsonify({"error": "La nueva contraseña debe tener al menos 8 caracteres"}), 400

            nueva_contra_hash = generate_password_hash(contrasena_nueva)

        # ============================================================
        # 🔵 PROCESAR FOTO DE PERFIL
        # ============================================================
        foto_perfil_path = None
        actualizar_foto = False
        
        if remover_foto:
            # Eliminar foto existente
            cursor.execute("SELECT foto_perfil FROM usuario WHERE id_usuario = %s", (user_id,))
            usuario_actual = cursor.fetchone()
            if usuario_actual and usuario_actual['foto_perfil']:
                import os
                old_path = os.path.join(os.getcwd(), usuario_actual['foto_perfil'].lstrip('/'))
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                        print(f"[UPDATE] Foto anterior eliminada: {old_path}")
                    except Exception as e:
                        print(f"[UPDATE ERROR] No se pudo eliminar foto: {e}")
            foto_perfil_path = None
            actualizar_foto = True
            
        elif foto_perfil_file and foto_perfil_file.filename:
            import os
            from werkzeug.utils import secure_filename
            import uuid
            
            # Validar extensión de archivo
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
            filename = secure_filename(foto_perfil_file.filename)
            extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            
            if extension in allowed_extensions:
                # Eliminar foto anterior si existe
                cursor.execute("SELECT foto_perfil FROM usuario WHERE id_usuario = %s", (user_id,))
                usuario_actual = cursor.fetchone()
                if usuario_actual and usuario_actual['foto_perfil']:
                    old_path = os.path.join(os.getcwd(), usuario_actual['foto_perfil'].lstrip('/'))
                    if os.path.exists(old_path):
                        try:
                            os.remove(old_path)
                            print(f"[UPDATE] Foto anterior eliminada: {old_path}")
                        except Exception as e:
                            print(f"[UPDATE ERROR] No se pudo eliminar foto anterior: {e}")
                
                # Generar nombre único para el archivo
                unique_filename = f"{uuid.uuid4().hex}.{extension}"
                
                # Crear directorio si no existe
                upload_folder = os.path.join(os.getcwd(), 'uploads', 'perfiles')
                os.makedirs(upload_folder, exist_ok=True)
                
                # Guardar archivo
                file_path = os.path.join(upload_folder, unique_filename)
                foto_perfil_file.save(file_path)
                
                # Guardar ruta relativa para la BD
                foto_perfil_path = f"/uploads/perfiles/{unique_filename}"
                actualizar_foto = True
                print(f"[UPDATE] Nueva foto de perfil guardada: {foto_perfil_path}")
            else:
                print(f"[UPDATE] Extensión de archivo no permitida: {extension}")

        # ============================================================
        # 🔵 ACTUALIZAR PERFIL
        # ============================================================
        if actualizar_foto:
            cursor.execute("""
                UPDATE usuario SET 
                    nombre=%s,
                    apellido=%s,
                    correo=%s,
                    genero=%s,
                    fecha_nacimiento=%s,
                    usa_medicamentos=%s,
                    notificaciones=%s,
                    contrasena=%s,
                    foto_perfil=%s
                WHERE id_usuario=%s
            """, (nombre, apellido, correo, genero, fecha_nacimiento,
                  usa_medicamentos, notificaciones, nueva_contra_hash, foto_perfil_path, user_id))
        else:
            cursor.execute("""
                UPDATE usuario SET 
                    nombre=%s,
                    apellido=%s,
                    correo=%s,
                    genero=%s,
                    fecha_nacimiento=%s,
                    usa_medicamentos=%s,
                    notificaciones=%s,
                    contrasena=%s
                WHERE id_usuario=%s
            """, (nombre, apellido, correo, genero, fecha_nacimiento,
                  usa_medicamentos, notificaciones, nueva_contra_hash, user_id))

        conn.commit()

        # Obtener usuario actualizado SIN la contraseña
        cursor.execute("""
            SELECT id_usuario, nombre, apellido, correo, genero, 
                   fecha_nacimiento, usa_medicamentos, notificaciones,
                   auth_provider, foto_perfil
            FROM usuario 
            WHERE id_usuario=%s
        """, (user_id,))
        user = cursor.fetchone()

        # Calcular edad si hay fecha de nacimiento
        edad = None
        fecha_nac_str = None
        if user["fecha_nacimiento"]:
            fecha_dt = user["fecha_nacimiento"]
            if isinstance(fecha_dt, str):
                fecha_nac_str = fecha_dt
                fecha_dt = datetime.strptime(fecha_dt, "%Y-%m-%d").date()
            else:
                fecha_nac_str = fecha_dt.strftime('%Y-%m-%d')

            hoy = date.today()
            edad = hoy.year - fecha_dt.year - ((hoy.month, hoy.day) < (fecha_dt.month, fecha_dt.day))

        # Obtener roles
        from models.rol_usuario import RolUsuario
        user_roles = RolUsuario.get_user_roles(user["id_usuario"])
        roles_list = [r['nombre_rol'] for r in user_roles] if user_roles else []

        return jsonify({
            "success": True, 
            "user": {
                'id_usuario': user["id_usuario"],
                'nombre': user["nombre"],
                'apellido': user["apellido"],
                'correo': user["correo"],
                'genero': user["genero"],
                'fecha_nacimiento': fecha_nac_str,
                'edad': edad,
                'usa_medicamentos': user["usa_medicamentos"],
                'notificaciones': user.get("notificaciones"),
                'auth_provider': user.get("auth_provider", "local"),
                'foto_perfil': user.get("foto_perfil"),
                'roles': roles_list
            }
        }), 200

    except Exception as e:
        print("Error en /update:", e)
        return jsonify({"error": str(e)}), 500



# ======================================================
# 🟩 LOGIN
# ======================================================
@bp.route('/login', methods=['POST'])
@limiter.limit("20 per minute, 100 per hour")  # Rate limit más permisivo para desarrollo
def login():
    client_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', '')
    
    try:
        # Verificar si la DB está inicializada
        if not current_app.config.get('DB_CONNECTED', True):
            secure_log.error("Intento de login con DB desconectada")
            return jsonify({'success': False, 'error': 'Servicio temporalmente no disponible'}), 503
        
        data = request.get_json()

        correo = data.get('correo', '').lower().strip()
        contrasena = data.get('contrasena', '')
        recordarme = data.get('recordarme', False)  # Parámetro de "Recuérdame"

        if not correo or not contrasena:
            return jsonify({'success': False, 'error': 'Correo y contraseña son requeridos'}), 400

        with DatabaseConnection.get_connection() as connection:
            cursor = connection.cursor(dictionary=True)

            # Obtener usuario para validación
            cursor.execute("""
                SELECT id_usuario, contrasena, email_verificado, auth_provider
                FROM usuario
                WHERE correo = %s LIMIT 1
            """, (correo,))

            user_auth = cursor.fetchone()

        # Validar login - NO revelar si el usuario existe o no
        if not user_auth or not check_password_hash(user_auth["contrasena"], contrasena):
            # Registrar intento fallido en auditoría
            auditoria.registrar_evento(
                tipo_evento=auditoria.EVENTO_LOGIN_FALLIDO,
                descripcion="Credenciales incorrectas",
                ip_address=client_ip,
                user_agent=user_agent,
                exitoso=False
            )
            secure_log.warning("Intento de login fallido", data={"correo_hash": hash(correo) % 10000})
            return jsonify({'success': False, 'error': 'Credenciales incorrectas'}), 401
        
        # Verificar si el email está verificado (solo para usuarios locales)
        if user_auth.get('auth_provider') == 'local' and not user_auth.get('email_verificado'):
            return jsonify({
                'success': False, 
                'error': 'Por favor, verifica tu correo electrónico antes de iniciar sesión.',
                'requiresVerification': True
            }), 403

        # Obtener datos completos del usuario SIN la contraseña
        with DatabaseConnection.get_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT id_usuario, nombre, apellido, correo,
                       fecha_nacimiento, usa_medicamentos, genero, 
                       auth_provider, foto_perfil, notificaciones
                FROM usuario
                WHERE id_usuario = %s LIMIT 1
            """, (user_auth["id_usuario"],))

            user = cursor.fetchone()

        # Obtener roles del usuario desde rol_usuario
        from models.rol_usuario import RolUsuario
        user_roles = RolUsuario.get_user_roles(user["id_usuario"])
        roles_list = [r['nombre_rol'] for r in user_roles] if user_roles else []

        # Edad
        edad = None
        fecha_nac_str = None
        if user["fecha_nacimiento"]:
            fecha_dt = user["fecha_nacimiento"]
            if isinstance(fecha_dt, str):
                fecha_nac_str = fecha_dt
                fecha_dt = datetime.strptime(fecha_dt, "%Y-%m-%d").date()
            else:
                fecha_nac_str = fecha_dt.strftime('%Y-%m-%d')

            hoy = date.today()
            edad = hoy.year - fecha_dt.year - ((hoy.month, hoy.day) < (fecha_dt.month, fecha_dt.day))

        # Crear access token y refresh token con tiempos de expiración según "recordarme"
        from datetime import timedelta
        
        if recordarme:
            # Si el usuario marcó "Recuérdame", extender el tiempo de expiración
            # Access token: 7 días, Refresh token: 30 días
            access_expires = timedelta(days=7)
            refresh_expires = timedelta(days=30)
        else:
            # Sesión normal: Access token corto, Refresh token 7 días
            access_expires = timedelta(hours=8)  # 8 horas
            refresh_expires = timedelta(days=7)
        
        token = create_access_token(identity=str(user["id_usuario"]), expires_delta=access_expires)
        refresh_token = create_refresh_token(identity=str(user["id_usuario"]), expires_delta=refresh_expires)
        
        # ✅ Registrar login exitoso en auditoría
        auditoria.registrar_login(
            id_usuario=user["id_usuario"],
            ip=client_ip,
            user_agent=user_agent,
            exitoso=True
        )
        
        # ✅ Almacenar refresh token en base de datos para persistencia
        try:
            from models.refresh_token import RefreshToken
            from datetime import datetime
            
            # Calcular fecha de expiración del refresh token
            fecha_expiracion_refresh = datetime.now() + refresh_expires
            
            # Detectar dispositivo, navegador y SO del user agent
            ua = request.headers.get('User-Agent', '') or ''
            import re
            
            if re.search(r'Mobile|Android|iPhone|iPad', ua, re.I):
                dispositivo = 'Mobile'
            elif re.search(r'Tablet', ua, re.I):
                dispositivo = 'Tablet'
            else:
                dispositivo = 'Desktop'

            if 'Chrome' in ua and 'Edg' not in ua and 'OPR' not in ua:
                navegador = 'Chrome'
            elif 'Firefox' in ua:
                navegador = 'Firefox'
            elif 'Edg' in ua or 'Edge' in ua:
                navegador = 'Edge'
            elif 'OPR' in ua or 'Opera' in ua:
                navegador = 'Opera'
            elif 'Safari' in ua and 'Chrome' not in ua:
                navegador = 'Safari'
            elif 'MSIE' in ua or 'Trident' in ua:
                navegador = 'Internet Explorer'
            else:
                navegador = ua[:150] if ua else 'Unknown'

            if 'Windows' in ua:
                sistema_operativo = 'Windows'
            elif 'Mac OS X' in ua or 'Macintosh' in ua:
                sistema_operativo = 'macOS'
            elif 'Android' in ua:
                sistema_operativo = 'Android'
            elif 'iPhone' in ua or 'iPad' in ua or 'iOS' in ua:
                sistema_operativo = 'iOS'
            elif 'Linux' in ua:
                sistema_operativo = 'Linux'
            else:
                sistema_operativo = 'Unknown'
            
            # Obtener IP (respetar proxy headers)
            xfwd = request.headers.get('X-Forwarded-For', '')
            if xfwd:
                ip_addr = xfwd.split(',')[0].strip()
            else:
                ip_addr = request.remote_addr
            
            # Guardar refresh token en BD
            RefreshToken.create(
                id_usuario=user["id_usuario"],
                token=refresh_token,
                fecha_expiracion=fecha_expiracion_refresh,
                es_recordarme=recordarme,
                dispositivo=dispositivo,
                navegador=navegador,
                sistema_operativo=sistema_operativo,
                ip_address=ip_addr,
                user_agent=ua[:500] if ua else None
            )
        except Exception as e:
            secure_log.error("Error almacenando refresh token", data={"error": str(e)})
            # No fallar el login si falla el almacenamiento del token
            
            # Valores por defecto si falla la detección anterior
            ua = request.headers.get('User-Agent', '') or ''
            dispositivo = 'Desktop'
            navegador = 'Unknown'
            sistema_operativo = 'Unknown'
            
            xfwd = request.headers.get('X-Forwarded-For', '')
            if xfwd:
                ip_addr = xfwd.split(',')[0].strip()
            else:
                ip_addr = request.remote_addr
        
        # Crear registro de sesión en la base de datos (reutilizar variables ya calculadas)
        try:
            from models.sesion import Sesion
            from datetime import datetime
            
            sesion_result = Sesion.create(
                user["id_usuario"],
                'activa',
                ip_addr,
                dispositivo,
                navegador,
                sistema_operativo,
                datetime.now(),
            )
            # extraer id de sesión creado si está disponible
            session_id = None
            try:
                if isinstance(sesion_result, dict):
                    session_id = sesion_result.get('last_id') or sesion_result.get('lastid')
            except Exception:
                session_id = None
        except Exception as e:
            secure_log.error("Error creando sesión", data={"error": str(e)})

        resp = {
            'success': True,
            'token': token,
            'refresh_token': refresh_token,  # ✅ Incluir refresh token
            'user': {
                'id_usuario': user["id_usuario"],
                'nombre': user["nombre"],
                'apellido': user["apellido"],
                'correo': user["correo"],
                'roles': roles_list,
                'genero': user["genero"],
                'fecha_nacimiento': fecha_nac_str,
                'edad': edad,
                'usa_medicamentos': user["usa_medicamentos"],
                'auth_provider': user.get("auth_provider", "local"),
                'foto_perfil': user.get("foto_perfil")
            }
        }
        # incluir session_id si se obtuvo
        if 'session_id' not in resp:
            resp['session_id'] = session_id

        return jsonify(resp)

    except Exception as e:
        secure_log.error("Error en login", data={"error": str(e)})
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


# ======================================================
# 🔄 REFRESH TOKEN
# ======================================================
@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@limiter.limit("10 per minute")
def refresh():
    """Obtener nuevo access token usando refresh token."""
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        
        secure_log.info("Token renovado", user_id=int(current_user_id))
        
        return jsonify({
            'success': True,
            'token': new_access_token
        }), 200
        
    except Exception as e:
        secure_log.error("Error renovando token", data={"error": str(e)})
        return jsonify({'success': False, 'error': 'Error renovando token'}), 500


# ======================================================
# 🔐 REQUISITOS DE CONTRASEÑA (para mostrar al usuario)
# ======================================================
@bp.route('/password-requirements', methods=['GET'])
def get_password_requirements():
    """Retorna los requisitos de contraseña actuales."""
    requirements = Seguridad.get_password_requirements()
    return jsonify({
        'success': True,
        'requirements': requirements
    }), 200


# ======================================================
# 🟢 GOOGLE AUTH - Login/Register
# ======================================================
@bp.route('/google', methods=['POST'])
@limiter.limit("10 per minute")
def google_auth():
    """Autenticación con Google OAuth"""
    client_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', '')
    
    try:
        from models.usuario import Usuario
        from models.rol_usuario import RolUsuario
        
        data = request.get_json()
        
        # Aceptar tanto 'correo' como 'email' para compatibilidad
        google_uid = data.get('google_uid') if data else None
        email = (data.get('correo') or data.get('email')) if data else None
        nombre = (data.get('nombre') or data.get('given_name', '')) if data else ''
        apellido = (data.get('apellido') or data.get('family_name', '')) if data else ''
        foto_perfil = (data.get('foto_perfil') or data.get('picture')) if data else None
        fecha_nacimiento = data.get('fecha_nacimiento') if data else None
        genero = data.get('genero') if data else None
        
        print(f"[GOOGLE AUTH] google_uid extraido: {google_uid}")
        print(f"[GOOGLE AUTH] email extraido: {email}")
        print(f"[GOOGLE AUTH] nombre extraido: {nombre}")
        print(f"[GOOGLE AUTH] apellido extraido: {apellido}")
        print(f"[GOOGLE AUTH] foto_perfil extraido: {foto_perfil}")
        print(f"[GOOGLE AUTH] fecha_nacimiento extraida: {fecha_nacimiento}")
        print(f"[GOOGLE AUTH] genero extraido: {genero}")
        
        # Validaciones
        if not google_uid or not email:
            print(f"[GOOGLE AUTH] ERROR - Validacion fallida: google_uid={google_uid}, email={email}")
            return jsonify({'success': False, 'error': 'Datos de Google incompletos'}), 400

        # Verificar si la DB está inicializada
        if not current_app.config.get('DB_CONNECTED', True):
            print("[GOOGLE AUTH] ERROR - DB no conectada, rechazando petición")
            return jsonify({'success': False, 'error': 'Servicio temporalmente no disponible (DB desconectada)'}), 503
        
        # Buscar usuario existente por google_uid
        user = Usuario.get_by_google_uid(google_uid)
        
        if not user:
            # Verificar si existe usuario con ese email pero sin google_uid
            user = Usuario.get_by_email(email)
            
            if user:
                # Usuario existe con email pero no tiene google_uid - vincular cuenta
                print(f"[GOOGLE AUTH] Vinculando cuenta existente: {email}")
                with DatabaseConnection.get_connection() as connection:
                    cursor = connection.cursor()
                    cursor.execute("""
                        UPDATE usuario 
                        SET google_uid = %s, auth_provider = 'google', foto_perfil = %s
                        WHERE id_usuario = %s
                    """, (google_uid, foto_perfil, user['id_usuario']))
                    connection.commit()
                
                # Recargar usuario actualizado
                user = Usuario.get_by_id(user['id_usuario'])
            else:
                # Usuario nuevo - crear cuenta
                print(f"[GOOGLE AUTH] Creando nuevo usuario: {email}")
                
                # Calcular edad si hay fecha de nacimiento
                edad = None
                if fecha_nacimiento:
                    print(f"[GOOGLE AUTH] Calculando edad para fecha: {fecha_nacimiento}", flush=True)
                    from datetime import datetime
                    fecha_nac = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date()
                    hoy = datetime.now().date()
                    edad = hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))
                    print(f"[GOOGLE AUTH] Edad calculada: {edad} años", flush=True)
                else:
                    print(f"[GOOGLE AUTH] No hay fecha_nacimiento, edad sera NULL", flush=True)
                
                print(f"[GOOGLE AUTH] Valores a insertar - fecha: {fecha_nacimiento}, genero: {genero}, edad: {edad}", flush=True)
                
                with DatabaseConnection.get_connection() as connection:
                    cursor = connection.cursor()
                    
                    # Insertar con o sin fecha_nacimiento/genero/edad según disponibilidad
                    if fecha_nacimiento and genero:
                        cursor.execute("""
                            INSERT INTO usuario 
                            (nombre, apellido, correo, google_uid, auth_provider, foto_perfil, fecha_nacimiento, genero, edad)
                            VALUES (%s, %s, %s, %s, 'google', %s, %s, %s, %s)
                        """, (nombre or 'Usuario', apellido or 'Google', email.lower(), google_uid, foto_perfil, fecha_nacimiento, genero, edad))
                    elif fecha_nacimiento:
                        cursor.execute("""
                            INSERT INTO usuario 
                            (nombre, apellido, correo, google_uid, auth_provider, foto_perfil, fecha_nacimiento, edad)
                            VALUES (%s, %s, %s, %s, 'google', %s, %s, %s)
                        """, (nombre or 'Usuario', apellido or 'Google', email.lower(), google_uid, foto_perfil, fecha_nacimiento, edad))
                    elif genero:
                        cursor.execute("""
                            INSERT INTO usuario 
                            (nombre, apellido, correo, google_uid, auth_provider, foto_perfil, genero)
                            VALUES (%s, %s, %s, %s, 'google', %s, %s)
                        """, (nombre or 'Usuario', apellido or 'Google', email.lower(), google_uid, foto_perfil, genero))
                    else:
                        cursor.execute("""
                            INSERT INTO usuario 
                            (nombre, apellido, correo, google_uid, auth_provider, foto_perfil)
                            VALUES (%s, %s, %s, %s, 'google', %s)
                        """, (nombre or 'Usuario', apellido or 'Google', email.lower(), google_uid, foto_perfil))
                    
                    connection.commit()
                    user_id = cursor.lastrowid
                    
                    print(f"[GOOGLE AUTH] Usuario creado con ID: {user_id}")
                    
                    # Asignar rol 'usuario' por defecto
                    cursor.execute("SELECT id_rol FROM rol WHERE nombre_rol = 'usuario' AND activo = 1 LIMIT 1")
                    rol_row = cursor.fetchone()
                    
                    if rol_row:
                        id_rol = rol_row[0]
                        cursor.execute("""
                            INSERT INTO rol_usuario (id_usuario, id_rol)
                            VALUES (%s, %s)
                        """, (user_id, id_rol))
                        connection.commit()
                        print(f"[GOOGLE AUTH] Rol 'usuario' asignado")
                    
                    # Obtener usuario recién creado
                    user = Usuario.get_by_id(user_id)
        else:
            # Usuario ya existe con Google - actualizar foto si cambió
            print(f"[GOOGLE AUTH] Usuario existente encontrado: {email}")
            
            # Calcular edad si tiene fecha_nacimiento pero no edad
            if user.get('fecha_nacimiento') and not user.get('edad'):
                from datetime import datetime
                try:
                    if isinstance(user['fecha_nacimiento'], str):
                        fecha_nac = datetime.strptime(user['fecha_nacimiento'], '%Y-%m-%d').date()
                    else:
                        fecha_nac = user['fecha_nacimiento']
                    
                    hoy = datetime.now().date()
                    edad_calculada = hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))
                    
                    with DatabaseConnection.get_connection() as connection:
                        cursor = connection.cursor()
                        cursor.execute("""
                            UPDATE usuario SET edad = %s WHERE id_usuario = %s
                        """, (edad_calculada, user['id_usuario']))
                        connection.commit()
                    
                    user['edad'] = edad_calculada
                    print(f"[GOOGLE AUTH] Edad calculada y actualizada: {edad_calculada}")
                except Exception as e:
                    print(f"[GOOGLE AUTH] Error calculando edad: {e}")
            
            # Actualizar foto si cambió
            if foto_perfil and user.get('foto_perfil') != foto_perfil:
                with DatabaseConnection.get_connection() as connection:
                    cursor = connection.cursor()
                    cursor.execute("""
                        UPDATE usuario SET foto_perfil = %s WHERE id_usuario = %s
                    """, (foto_perfil, user['id_usuario']))
                    connection.commit()
                user['foto_perfil'] = foto_perfil
        
        # Obtener roles del usuario
        user_roles = RolUsuario.get_user_roles(user['id_usuario'])
        roles_list = [r['nombre_rol'] for r in user_roles] if user_roles else ['usuario']
        
        # Convertir fecha_nacimiento a string si es date object
        fecha_nac_str = None
        if user.get('fecha_nacimiento'):
            if isinstance(user['fecha_nacimiento'], str):
                fecha_nac_str = user['fecha_nacimiento']
            else:
                fecha_nac_str = user['fecha_nacimiento'].strftime('%Y-%m-%d')
        
        # Generar token JWT
        access_token = create_access_token(identity=str(user['id_usuario']))
        
        print(f"[GOOGLE AUTH] Login exitoso para: {email}")
        # Crear registro de sesión (metadatos del cliente)
        try:
            from models.sesion import Sesion

            xfwd = request.headers.get('X-Forwarded-For', '')
            if xfwd:
                ip_addr = xfwd.split(',')[0].strip()
            else:
                ip_addr = request.remote_addr

            ua = request.headers.get('User-Agent', '') or ''
            import re

            if re.search(r'Mobile|Android|iPhone|iPad', ua, re.I):
                dispositivo = 'Mobile'
            elif re.search(r'Tablet', ua, re.I):
                dispositivo = 'Tablet'
            else:
                dispositivo = 'Desktop'

            if 'Chrome' in ua and 'Edg' not in ua and 'OPR' not in ua:
                navegador = 'Chrome'
            elif 'Firefox' in ua:
                navegador = 'Firefox'
            elif 'Edg' in ua or 'Edge' in ua:
                navegador = 'Edge'
            elif 'OPR' in ua or 'Opera' in ua:
                navegador = 'Opera'
            elif 'Safari' in ua and 'Chrome' not in ua:
                navegador = 'Safari'
            elif 'MSIE' in ua or 'Trident' in ua:
                navegador = 'Internet Explorer'
            else:
                navegador = ua[:150] if ua else 'Unknown'

            if 'Windows' in ua:
                sistema_operativo = 'Windows'
            elif 'Mac OS X' in ua or 'Macintosh' in ua:
                sistema_operativo = 'macOS'
            elif 'Android' in ua:
                sistema_operativo = 'Android'
            elif 'iPhone' in ua or 'iPad' in ua or 'iOS' in ua:
                sistema_operativo = 'iOS'
            elif 'Linux' in ua:
                sistema_operativo = 'Linux'
            else:
                sistema_operativo = 'Unknown'

            from datetime import datetime
            sesion_result = Sesion.create(
                user['id_usuario'],
                'activa',
                ip_addr,
                dispositivo,
                navegador,
                sistema_operativo,
                datetime.now(),
            )
            session_id = None
            try:
                if isinstance(sesion_result, dict):
                    session_id = sesion_result.get('last_id') or sesion_result.get('lastid')
            except Exception:
                session_id = None
        except Exception as se:
            print(f"[GOOGLE AUTH] Error creando sesion: {se}")
            session_id = None

        return jsonify({
            'success': True,
            'token': access_token,
            'user': {
                'id_usuario': user['id_usuario'],
                'nombre': user['nombre'],
                'apellido': user['apellido'],
                'correo': user['correo'],
                'foto_perfil': user.get('foto_perfil'),
                'auth_provider': 'google',
                'roles': roles_list,
                'genero': user.get('genero'),
                'edad': user.get('edad'),
                'fecha_nacimiento': fecha_nac_str,
                'usa_medicamentos': user.get('usa_medicamentos', False)
            },
            'session_id': session_id
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Google Auth: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ======================================================
# 🟢 GOOGLE WEB AUTH - Login/Register con JWT Credential
# ======================================================
@bp.route('/google-web', methods=['POST'])
@limiter.limit("10 per minute")
def google_web_auth():
    """Autenticación con Google OAuth Web usando JWT credential"""
    try:
        from models.usuario import Usuario
        from models.rol_usuario import RolUsuario
        import jwt
        import requests
        
        data = request.get_json()
        credential = data.get('credential') if data else None
        
        if not credential:
            print("[GOOGLE WEB AUTH] ERROR - Credential no proporcionado")
            return jsonify({'success': False, 'error': 'Credential de Google requerido'}), 400
        
        # Decodificar el JWT de Google (sin verificar firma por ahora)
        # En producción, deberías verificar la firma con las claves públicas de Google
        try:
            decoded = jwt.decode(credential, options={"verify_signature": False})
            print(f"[GOOGLE WEB AUTH] JWT decodificado: {decoded.get('email')}")
        except Exception as decode_error:
            print(f"[GOOGLE WEB AUTH] Error decodificando JWT: {decode_error}")
            return jsonify({'success': False, 'error': 'Credential inválido'}), 400
        
        # Extraer datos del JWT
        google_uid = decoded.get('sub')  # Google User ID
        email = decoded.get('email')
        nombre = decoded.get('given_name', '')
        apellido = decoded.get('family_name', '')
        foto_perfil = decoded.get('picture')
        
        print(f"[GOOGLE WEB AUTH] Datos extraídos - email: {email}, google_uid: {google_uid}")
        
        if not google_uid or not email:
            print(f"[GOOGLE WEB AUTH] ERROR - Datos incompletos del JWT")
            return jsonify({'success': False, 'error': 'Datos de Google incompletos'}), 400
        
        # Verificar DB
        if not current_app.config.get('DB_CONNECTED', True):
            print("[GOOGLE WEB AUTH] ERROR - DB no conectada")
            return jsonify({'success': False, 'error': 'Servicio temporalmente no disponible'}), 503
        
        # Buscar usuario existente por google_uid
        user = Usuario.get_by_google_uid(google_uid)
        
        if not user:
            # Verificar si existe usuario con ese email pero sin google_uid
            user = Usuario.get_by_email(email)
            
            if user:
                # Vincular cuenta existente
                print(f"[GOOGLE WEB AUTH] Vinculando cuenta existente: {email}")
                with DatabaseConnection.get_connection() as connection:
                    cursor = connection.cursor()
                    cursor.execute("""
                        UPDATE usuario 
                        SET google_uid = %s, auth_provider = 'google', foto_perfil = %s
                        WHERE id_usuario = %s
                    """, (google_uid, foto_perfil, user['id_usuario']))
                    connection.commit()
                
                user = Usuario.get_by_id(user['id_usuario'])
            else:
                # Crear nuevo usuario
                print(f"[GOOGLE WEB AUTH] Creando nuevo usuario: {email}")
                with DatabaseConnection.get_connection() as connection:
                    cursor = connection.cursor()
                    cursor.execute("""
                        INSERT INTO usuario 
                        (nombre, apellido, correo, google_uid, auth_provider, foto_perfil)
                        VALUES (%s, %s, %s, %s, 'google', %s)
                    """, (nombre or 'Usuario', apellido or 'Google', email.lower(), google_uid, foto_perfil))
                    connection.commit()
                    user_id = cursor.lastrowid
                    
                    print(f"[GOOGLE WEB AUTH] Usuario creado con ID: {user_id}")
                    
                    # Asignar rol 'usuario'
                    cursor.execute("SELECT id_rol FROM rol WHERE nombre_rol = 'usuario' AND activo = 1 LIMIT 1")
                    rol_row = cursor.fetchone()
                    
                    if rol_row:
                        id_rol = rol_row[0]
                        cursor.execute("""
                            INSERT INTO rol_usuario (id_usuario, id_rol)
                            VALUES (%s, %s)
                        """, (user_id, id_rol))
                        connection.commit()
                    
                    user = Usuario.get_by_id(user_id)
        else:
            # Usuario existente - actualizar foto si cambió
            print(f"[GOOGLE WEB AUTH] Usuario existente: {email}")
            if foto_perfil and user.get('foto_perfil') != foto_perfil:
                with DatabaseConnection.get_connection() as connection:
                    cursor = connection.cursor()
                    cursor.execute("""
                        UPDATE usuario SET foto_perfil = %s WHERE id_usuario = %s
                    """, (foto_perfil, user['id_usuario']))
                    connection.commit()
                user['foto_perfil'] = foto_perfil
        
        # Obtener roles
        user_roles = RolUsuario.get_user_roles(user['id_usuario'])
        roles_list = [r['nombre_rol'] for r in user_roles] if user_roles else ['usuario']
        
        # Generar token JWT
        access_token = create_access_token(identity=str(user['id_usuario']))
        
        print(f"[GOOGLE WEB AUTH] Login exitoso para: {email}")
        
        # Crear sesión
        try:
            from models.sesion import Sesion
            import re
            from datetime import datetime
            
            xfwd = request.headers.get('X-Forwarded-For', '')
            ip_addr = xfwd.split(',')[0].strip() if xfwd else request.remote_addr
            
            ua = request.headers.get('User-Agent', '') or ''
            
            if re.search(r'Mobile|Android|iPhone|iPad', ua, re.I):
                dispositivo = 'Mobile'
            elif re.search(r'Tablet', ua, re.I):
                dispositivo = 'Tablet'
            else:
                dispositivo = 'Desktop'
            
            if 'Chrome' in ua and 'Edg' not in ua and 'OPR' not in ua:
                navegador = 'Chrome'
            elif 'Firefox' in ua:
                navegador = 'Firefox'
            elif 'Edg' in ua or 'Edge' in ua:
                navegador = 'Edge'
            elif 'Safari' in ua:
                navegador = 'Safari'
            else:
                navegador = 'Otro'
            
            if 'Windows' in ua:
                sistema_operativo = 'Windows'
            elif 'Mac' in ua:
                sistema_operativo = 'MacOS'
            elif 'Linux' in ua:
                sistema_operativo = 'Linux'
            elif 'Android' in ua:
                sistema_operativo = 'Android'
            elif 'iOS' in ua or 'iPhone' in ua or 'iPad' in ua:
                sistema_operativo = 'iOS'
            else:
                sistema_operativo = 'Unknown'
            
            sesion_result = Sesion.create(
                user['id_usuario'],
                'activa',
                ip_addr,
                dispositivo,
                navegador,
                sistema_operativo,
                datetime.now(),
            )
            session_id = sesion_result.get('last_id') if isinstance(sesion_result, dict) else None
        except Exception as se:
            print(f"[GOOGLE WEB AUTH] Error creando sesión: {se}")
            session_id = None
        
        # Convertir fecha_nacimiento a string
        fecha_nac_str = None
        if user.get('fecha_nacimiento'):
            if isinstance(user['fecha_nacimiento'], str):
                fecha_nac_str = user['fecha_nacimiento']
            else:
                fecha_nac_str = user['fecha_nacimiento'].strftime('%Y-%m-%d')
        
        return jsonify({
            'success': True,
            'token': access_token,
            'user': {
                'id_usuario': user['id_usuario'],
                'nombre': user['nombre'],
                'apellido': user['apellido'],
                'correo': user['correo'],
                'foto_perfil': user.get('foto_perfil'),
                'auth_provider': 'google',
                'roles': roles_list,
                'genero': user.get('genero'),
                'edad': user.get('edad'),
                'fecha_nacimiento': fecha_nac_str,
                'usa_medicamentos': user.get('usa_medicamentos', False)
            },
            'session_id': session_id
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Google Web Auth: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ======================================================
# 🔵 VERIFICAR TOKEN
# ======================================================
@bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verificar si el token es válido y obtener datos del usuario"""
    try:
        from models.usuario import Usuario
        from models.rol_usuario import RolUsuario
        
        user_id = get_jwt_identity()
        
        # Obtener usuario con estadísticas
        user_stats = Usuario.get_estadisticas(int(user_id))
        user = Usuario.get_by_id(int(user_id))
        
        if not user:
            return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404
        
        # Obtener roles
        user_roles = RolUsuario.get_user_roles(int(user_id))
        
        return jsonify({
            'success': True,
            'user': {
                'id_usuario': user['id_usuario'],
                'nombre': user['nombre'],
                'apellido': user['apellido'],
                'correo': user['correo'],
                'foto_perfil': user.get('foto_perfil'),
                'genero': user.get('genero'),
                'fecha_nacimiento': user.get('fecha_nacimiento'),
                'edad': user.get('edad'),
                'usa_medicamentos': user.get('usa_medicamentos'),
                'auth_provider': user.get('auth_provider', 'local'),
                'roles': [r['nombre_rol'] for r in user_roles] if user_roles else []
            },
            'estadisticas': user_stats
        }), 200
        
    except Exception as e:
        print("Error en /verify:", e)
        return jsonify({'success': False, 'error': str(e)}), 500


# ======================================================
# 📧 VERIFICACIÓN DE EMAIL
# ======================================================
@bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    """Verificar email con token"""
    try:
        from database.connection import DatabaseConnection
        from datetime import datetime
        
        with DatabaseConnection.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # Buscar usuario con este token
            cursor.execute("""
                SELECT id_usuario, correo, email_verificado, token_verificacion_expira
                FROM usuario
                WHERE token_verificacion = %s
            """, (token,))
            
            user = cursor.fetchone()
            cursor.fetchall()  # Limpiar resultados pendientes
            
            # Si no se encuentra, el token es inválido o ya fue usado
            if not user:
                return jsonify({'success': False, 'error': 'Token inválido o ya usado'}), 400
            
            # Verificar si ya está verificado
            if user['email_verificado']:
                return jsonify({
                    'success': True, 
                    'message': 'Email ya verificado'
                }), 200
            
            # Verificar si el token expiró
            if user['token_verificacion_expira'] and datetime.now() > user['token_verificacion_expira']:
                return jsonify({'success': False, 'error': 'Token expirado'}), 400
            
            # Marcar como verificado y limpiar el token para que no pueda
            # volver a usarse. El frontend debe evitar llamadas duplicadas
            # y redirigir inmediatamente al login después de éxito.
            cursor.execute("""
                UPDATE usuario
                SET email_verificado = TRUE,
                    token_verificacion = NULL,
                    token_verificacion_expira = NULL
                WHERE id_usuario = %s
            """, (user['id_usuario'],))
            
            conn.commit()
            cursor.fetchall()  # Limpiar resultados pendientes
            
            return jsonify({
                'success': True,
                'message': 'Email verificado exitosamente'
            }), 200
            
    except Exception as e:
        print(f"[ERROR] Verificación de email: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/resend-verification', methods=['POST'])
@jwt_required()
def resend_verification():
    """Reenviar email de verificación"""
    try:
        from database.connection import DatabaseConnection
        from services.email_service import email_service
        
        user_id = get_jwt_identity()
        
        with DatabaseConnection.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT id_usuario, nombre, correo, email_verificado
                FROM usuario
                WHERE id_usuario = %s
            """, (user_id,))
            
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404
            
            if user['email_verificado']:
                return jsonify({'success': False, 'error': 'Email ya verificado'}), 400
            
            # Generar nuevo token
            token = email_service.generar_token()
            expiracion = email_service.calcular_expiracion(24)
            
            # Guardar token
            cursor.execute("""
                UPDATE usuario
                SET token_verificacion = %s,
                    token_verificacion_expira = %s
                WHERE id_usuario = %s
            """, (token, expiracion, user_id))
            
            conn.commit()
            
            # Enviar email
            email_enviado = email_service.enviar_email_verificacion(
                user['correo'],
                user['nombre'],
                token
            )
            
            if not email_enviado:
                return jsonify({'success': False, 'error': 'Error al enviar email'}), 500
            
            return jsonify({
                'success': True,
                'message': 'Email de verificación enviado'
            }), 200
            
    except Exception as e:
        print(f"[ERROR] Reenvío de verificación: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ======================================================
# 🔑 RECUPERACIÓN DE CONTRASEÑA
# ======================================================
@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Solicitar recuperación de contraseña"""
    try:
        from database.connection import DatabaseConnection
        from services.email_service import email_service
        
        data = request.get_json()
        correo = data.get('correo', '').lower().strip()
        
        if not correo:
            return jsonify({'success': False, 'error': 'Correo requerido'}), 400
        
        with DatabaseConnection.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT id_usuario, nombre, correo, auth_provider
                FROM usuario
                WHERE correo = %s
            """, (correo,))
            
            user = cursor.fetchone()
            
            # Por seguridad, siempre devolver éxito aunque el email no exista
            if not user:
                return jsonify({
                    'success': True,
                    'message': 'Si el correo existe, recibirás un email de recuperación'
                }), 200
            
            # No permitir reset para usuarios de Google
            if user['auth_provider'] == 'google':
                return jsonify({
                    'success': False,
                    'error': 'Los usuarios de Google deben recuperar su contraseña desde Google'
                }), 400
            
            # Generar token
            token = email_service.generar_token()
            expiracion = email_service.calcular_expiracion(1)  # 1 hora
            
            # Guardar token
            cursor.execute("""
                UPDATE usuario
                SET token_reset_password = %s,
                    token_reset_expira = %s
                WHERE id_usuario = %s
            """, (token, expiracion, user['id_usuario']))
            
            conn.commit()
            
            # Enviar email
            email_enviado = email_service.enviar_email_recuperacion(
                user['correo'],
                user['nombre'],
                token
            )
            
            if not email_enviado:
                # Si falla el envío pero el token se guardó, informar al usuario
                print(f"[WARNING] Email no enviado, pero token generado para {user['correo']}")
                return jsonify({
                    'success': False, 
                    'error': 'No se pudo enviar el email. Por favor, verifica la configuración del servicio de email.'
                }), 500
            
            return jsonify({
                'success': True,
                'message': 'Email de recuperación enviado'
            }), 200
            
    except Exception as e:
        print(f"[ERROR] Forgot password: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Restablecer contraseña con token"""
    try:
        from database.connection import DatabaseConnection
        from datetime import datetime
        
        data = request.get_json()
        token = data.get('token')
        nueva_contrasena = data.get('nueva_contrasena')
        
        if not token or not nueva_contrasena:
            return jsonify({'success': False, 'error': 'Token y contraseña requeridos'}), 400
        
        if len(nueva_contrasena) < 8:
            return jsonify({'success': False, 'error': 'La contraseña debe tener al menos 8 caracteres'}), 400
        
        with DatabaseConnection.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # Buscar usuario con este token
            cursor.execute("""
                SELECT id_usuario, correo, token_reset_expira
                FROM usuario
                WHERE token_reset_password = %s
            """, (token,))
            
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'success': False, 'error': 'Token inválido'}), 400
            
            # Verificar si el token expiró
            if user['token_reset_expira'] and datetime.now() > user['token_reset_expira']:
                return jsonify({'success': False, 'error': 'Token expirado'}), 400
            
            # Hash de la nueva contraseña
            nueva_contra_hash = generate_password_hash(nueva_contrasena)
            
            # Actualizar contraseña y limpiar tokens
            cursor.execute("""
                UPDATE usuario
                SET contrasena = %s,
                    token_reset_password = NULL,
                    token_reset_expira = NULL
                WHERE id_usuario = %s
            """, (nueva_contra_hash, user['id_usuario']))
            
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Contraseña actualizada exitosamente'
            }), 200
            
    except Exception as e:
        print(f"[ERROR] Reset password: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

