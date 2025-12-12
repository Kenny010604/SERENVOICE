# services/email_service.py
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import os
from datetime import datetime, timedelta
import secrets

class EmailService:
    def __init__(self):
        # Configurar API key de Brevo
        brevo_api_key = os.getenv('BREVO_API_KEY')
        
        if not brevo_api_key:
            print("[EMAIL WARNING] BREVO_API_KEY no configurada. Funcionalidad de email deshabilitada.")
            print("[EMAIL INFO] Para habilitar emails:")
            print("  1. Crea una cuenta en https://app.brevo.com/")
            print("  2. Obtén tu API key en Settings > SMTP & API > API Keys")
            print("  3. Crea un archivo .env en backend/ con: BREVO_API_KEY=tu_api_key")
            self.api_instance = None
            self.sender = None
            return
        
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = brevo_api_key
        
        self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        self.sender = {"name": "SerenVoice", "email": os.getenv('SENDER_EMAIL', 'sebas.games52@gmail.com')}
    
    def generar_token(self):
        """Genera un token seguro de 32 caracteres"""
        return secrets.token_urlsafe(32)
    
    def calcular_expiracion(self, horas=24):
        """Calcula fecha de expiración (por defecto 24 horas)"""
        return datetime.now() + timedelta(hours=horas)
    
    def enviar_email_verificacion(self, destinatario_email, destinatario_nombre, token_verificacion):
        """Envía email de verificación de cuenta"""
        if not self.api_instance:
            print(f"[EMAIL SKIP] API no configurada. Email de verificación no enviado a {destinatario_email}")
            return False
        
        try:
            # URL de verificación (ajustar según tu dominio)
            url_verificacion = f"http://localhost:5173/verificar-email?token={token_verificacion}"
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": destinatario_email, "name": destinatario_nombre}],
                sender=self.sender,
                subject="Verifica tu cuenta de SerenVoice",
                html_content=f"""
                <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0;">SerenVoice</h1>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #333;">¡Hola {destinatario_nombre}!</h2>
                            <p style="color: #666; line-height: 1.6;">
                                Gracias por registrarte en SerenVoice. Para completar tu registro, 
                                por favor verifica tu dirección de correo electrónico.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{url_verificacion}" 
                                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                          color: white; 
                                          padding: 15px 40px; 
                                          text-decoration: none; 
                                          border-radius: 5px; 
                                          display: inline-block;
                                          font-weight: bold;">
                                    Verificar mi cuenta
                                </a>
                            </div>
                            
                            <p style="color: #999; font-size: 12px; line-height: 1.6;">
                                Este enlace expirará en 24 horas. Si no solicitaste esta verificación, 
                                puedes ignorar este correo.
                            </p>
                            
                            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                                <a href="{url_verificacion}" style="color: #667eea; word-break: break-all;">
                                    {url_verificacion}
                                </a>
                            </p>
                        </div>
                    </body>
                </html>
                """
            )
            
            api_response = self.api_instance.send_transac_email(send_smtp_email)
            print(f"[EMAIL] Verificación enviada a {destinatario_email}: {api_response}")
            return True
            
        except ApiException as e:
            print(f"[EMAIL ERROR] Error enviando verificación: {e}")
            return False
    
    def enviar_email_recuperacion(self, destinatario_email, destinatario_nombre, token_reset):
        """Envía email de recuperación de contraseña"""
        if not self.api_instance:
            print(f"[EMAIL SKIP] API no configurada. Email de recuperación no enviado a {destinatario_email}")
            return False
        
        try:
            # URL de recuperación (ajustar según tu dominio)
            url_reset = f"http://localhost:5173/resetear-contrasena?token={token_reset}"
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": destinatario_email, "name": destinatario_nombre}],
                sender=self.sender,
                subject="Recupera tu contraseña de SerenVoice",
                html_content=f"""
                <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0;">SerenVoice</h1>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #333;">Recuperación de contraseña</h2>
                            <p style="color: #666; line-height: 1.6;">
                                Hola {destinatario_nombre},
                            </p>
                            <p style="color: #666; line-height: 1.6;">
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
                                Haz clic en el siguiente botón para crear una nueva contraseña:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{url_reset}" 
                                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                          color: white; 
                                          padding: 15px 40px; 
                                          text-decoration: none; 
                                          border-radius: 5px; 
                                          display: inline-block;
                                          font-weight: bold;">
                                    Restablecer contraseña
                                </a>
                            </div>
                            
                            <p style="color: #999; font-size: 12px; line-height: 1.6;">
                                Este enlace expirará en 1 hora. Si no solicitaste restablecer tu contraseña, 
                                puedes ignorar este correo de forma segura.
                            </p>
                            
                            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                                <a href="{url_reset}" style="color: #667eea; word-break: break-all;">
                                    {url_reset}
                                </a>
                            </p>
                        </div>
                    </body>
                </html>
                """
            )
            
            api_response = self.api_instance.send_transac_email(send_smtp_email)
            print(f"[EMAIL] Recuperación enviada a {destinatario_email}: {api_response}")
            return True
            
        except ApiException as e:
            print(f"[EMAIL ERROR] Error enviando recuperación: {e}")
            return False

# Instancia global del servicio
email_service = EmailService()
