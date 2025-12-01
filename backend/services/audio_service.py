# backend/services/audio_service.py
from models.audio import Audio
from models.analisis import Analisis
from models.resultado_analisis import ResultadoAnalisis
from models.recomendacion import Recomendacion
from utils.stress_detector import StressDetector
from utils.helpers import Helpers
import os

class AudioService:
    """Servicio de gestión de audios"""
    
    @staticmethod
    def upload_and_process(file, id_usuario):
        """
        Subir y procesar audio
        
        Args:
            file: Archivo de audio
            id_usuario: ID del usuario
        
        Returns:
            dict: Resultado del proceso
        """
        # Guardar archivo
        file_info = Helpers.save_audio_file(file, id_usuario)
        
        if not file_info:
            return {'success': False, 'error': 'Archivo inválido o formato no permitido'}
        
        try:
            # Registrar audio en BD
            id_audio = Audio.create(
                id_usuario=id_usuario,
                nombre_archivo=file_info['filename'],
                ruta_archivo=file_info['filepath'],
                duracion=None  # Se obtendrá del análisis
            )
            
            # Crear registro de análisis
            id_analisis = Analisis.create(id_audio, estado='procesando')
            
            # Procesar audio
            result = StressDetector.analyze_audio(file_info['filepath'])
            
            if not result['success']:
                Analisis.update_status(id_analisis, 'error')
                return {'success': False, 'error': result.get('error', 'Error en el análisis')}
            
            # Actualizar duración del audio (si existe en el modelo)
            # Audio.update(id_audio, duracion=result['duration'])
            
            # Guardar resultado
            clasificacion = StressDetector.classify_level(result['scores']['general'])
            
            id_resultado = ResultadoAnalisis.create(
                id_analisis=id_analisis,
                nivel_estres=result['scores']['stress'],
                nivel_ansiedad=result['scores']['anxiety'],
                clasificacion=clasificacion,
                confianza_modelo=result['confidence']
            )
            
            # Generar recomendaciones
            recomendaciones = AudioService._generate_recommendations(
                result['scores']['stress'],
                result['scores']['anxiety'],
                result['levels']['stress'],
                result['levels']['anxiety']
            )
            
            for rec in recomendaciones:
                Recomendacion.create(
                    id_resultado=id_resultado,
                    tipo=rec['tipo'],
                    contenido=rec['contenido']
                )
            
            # Actualizar estado del análisis
            Analisis.update_status(id_analisis, 'completado')
            
            return {
                'success': True,
                'id_audio': id_audio,
                'id_analisis': id_analisis,
                'id_resultado': id_resultado,
                'resultados': {
                    'stress_score': result['scores']['stress'],
                    'anxiety_score': result['scores']['anxiety'],
                    'stress_level': result['levels']['stress'],
                    'anxiety_level': result['levels']['anxiety'],
                    'confidence': result['confidence']
                }
            }
        
        except Exception as e:
            # Limpiar archivo si hay error
            Helpers.delete_file(file_info['filepath'])
            return {'success': False, 'error': f'Error al procesar audio: {str(e)}'}
    
    @staticmethod
    def _generate_recommendations(stress_score, anxiety_score, stress_level, anxiety_level):
        """Generar recomendaciones basadas en scores"""
        recomendaciones = []
        
        # Recomendaciones por estrés
        if stress_score >= 70:
            recomendaciones.append({
                'tipo': 'respiracion',
                'contenido': 'Ejercicio de Respiración 4-7-8: Inhala por 4 segundos, retén 7 segundos, exhala por 8 segundos. Repite 4 veces.'
            })
            recomendaciones.append({
                'tipo': 'profesional',
                'contenido': 'Tu nivel de estrés es alto. Considera buscar apoyo de un profesional de salud mental.'
            })
        elif stress_score >= 40:
            recomendaciones.append({
                'tipo': 'ejercicio',
                'contenido': 'Realiza 30 minutos de actividad física moderada: caminar, correr o yoga.'
            })
        else:
            recomendaciones.append({
                'tipo': 'meditacion',
                'contenido': 'Mantén tu bienestar con 10 minutos diarios de meditación mindfulness.'
            })
        
        # Recomendaciones por ansiedad
        if anxiety_score >= 70:
            recomendaciones.append({
                'tipo': 'meditacion',
                'contenido': 'Técnica de Grounding 5-4-3-2-1: Identifica 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas.'
            })
        elif anxiety_score >= 40:
            recomendaciones.append({
                'tipo': 'respiracion',
                'contenido': 'Respiración diafragmática: Coloca una mano en el pecho y otra en el abdomen. Respira profundamente inflando el abdomen.'
            })
        
        # Recomendación general
        recomendaciones.append({
            'tipo': 'otros',
            'contenido': 'Mantén horarios regulares de sueño (7-8 horas), come balanceadamente y limita cafeína y alcohol.'
        })
        
        return recomendaciones
    
    @staticmethod
    def get_user_audios(id_usuario, page=1, per_page=20):
        """Obtener audios de un usuario"""
        offset = (page - 1) * per_page
        return Audio.get_user_audios(id_usuario, limit=per_page, offset=offset)
    
    @staticmethod
    def delete_audio(id_audio):
        """Eliminar audio"""
        audio = Audio.get_by_id(id_audio)
        if audio:
            Helpers.delete_file(audio['ruta_archivo'])
            Audio.delete(id_audio)
            return {'success': True, 'message': 'Audio eliminado exitosamente'}
        return {'success': False, 'error': 'Audio no encontrado'}