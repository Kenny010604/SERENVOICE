# backend/services/alertas_service.py
from models.alerta_analisis import AlertaAnalisis

class AlertasService:
    """Servicio de alertas"""
    
    @staticmethod
    def get_user_alerts(id_usuario):
        """Obtener alertas de un usuario"""
        return AlertaAnalisis.get_user_alerts(id_usuario)
    
    @staticmethod
    def get_active_alerts():
        """Obtener todas las alertas activas del sistema"""
        return AlertaAnalisis.get_active_alerts()

    @staticmethod
    def get_critical_alerts():
        """Obtener solo alertas críticas"""
        return AlertaAnalisis.get_critical_alerts()
    
    @staticmethod
    def get_alert_by_id(id_alerta):
        """Obtener alerta por ID"""
        return AlertaAnalisis.get_by_id(id_alerta)