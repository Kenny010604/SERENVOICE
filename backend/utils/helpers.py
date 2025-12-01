# backend/utils/helpers.py
from flask import jsonify

class Helpers:
    """Funciones utilitarias generales"""

    @staticmethod
    def format_response(success=True, data=None, message="", status=200):
        """
        Estándar de respuesta API
        """
        response = {
            "success": success,
            "message": message
        }

        if data is not None:
            response["data"] = data

        return jsonify(response), status
