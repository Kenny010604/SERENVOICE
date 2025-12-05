from flask import Blueprint, request, jsonify

bp = Blueprint('contact', __name__, url_prefix='/api/contact')

# ======================================================
# 🔵 CONTACTO TEMPORAL (NO GUARDA EN BD)
# ======================================================
@bp.route('/send', methods=['POST'])
def send_contact():
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "error": "No se recibió JSON"}), 400

    nombre = data.get("nombre", "")
    email = data.get("email", "")
    mensaje = data.get("mensaje", "")

    print("Datos recibidos:", nombre, email, mensaje)

    return jsonify({"ok": True, "message": "Mensaje recibido"}), 200
