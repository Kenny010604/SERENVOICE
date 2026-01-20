import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FaMicrophone, FaStop, FaSpinner, FaCheck, FaTimes, FaUsers, FaPlay,
  FaClock, FaChartBar, FaArrowLeft, FaUpload, FaCloudUploadAlt
} from 'react-icons/fa';
import sesionesGrupalesService from '../../services/sesionesGrupalesService';
import audioService from '../../services/audioService';
import authService from '../../services/authService';
import '../../global.css';

const SesionGrupalVoz = ({ 
  grupo, 
  sesionActiva, 
  onClose, 
  onSesionUpdated,
  puedeIniciar = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado de sesión
  const [sesion, setSesion] = useState(sesionActiva || null);
  const [participantes, setParticipantes] = useState([]);
  const [miParticipacion, setMiParticipacion] = useState(null);
  
  // Estado de grabación
  const [grabando, setGrabando] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  
  // Nueva sesión
  const [showNuevaSesion, setShowNuevaSesion] = useState(false);
  const [nuevaSesion, setNuevaSesion] = useState({ titulo: '', descripcion: '', duracion_horas: 24 });
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  
  // Cargar datos de sesión
  const cargarSesion = useCallback(async () => {
    if (!sesionActiva?.id_sesion) return;
    
    try {
      const [detalleRes, participantesRes, miPartRes] = await Promise.all([
        sesionesGrupalesService.obtenerDetalle(sesionActiva.id_sesion),
        sesionesGrupalesService.listarParticipantes(sesionActiva.id_sesion),
        sesionesGrupalesService.obtenerMiParticipacion(sesionActiva.id_sesion)
      ]);
      
      setSesion(detalleRes.sesion || detalleRes);
      setParticipantes(participantesRes || []);
      setMiParticipacion(miPartRes?.participacion || null);
    } catch (e) {
      console.error('Error cargando sesión:', e);
    }
  }, [sesionActiva]);
  
  useEffect(() => {
    cargarSesion();
  }, [cargarSesion]);
  
  // Iniciar grabación
  const iniciarGrabacion = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start(250);
      setGrabando(true);
      setTiempoGrabacion(0);
      
      // Temporizador
      timerRef.current = setInterval(() => {
        setTiempoGrabacion(prev => prev + 1);
      }, 1000);
      
    } catch (e) {
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
      console.error('Error accessing microphone:', e);
    }
  };
  
  // Detener grabación
  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setGrabando(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  // Subir audio y participar
  const subirAudioYParticipar = async () => {
    if (!audioBlob || !sesion?.id_sesion) return;
    
    setSubiendo(true);
    setError('');
    setProgresoSubida(0);
    
    try {
      // Obtener usuario actual
      const userData = authService.getUser();
      const userId = userData?.id_usuario || userData?.id;
      
      setProgresoSubida(30);
      
      // Subir y analizar el audio usando el servicio existente
      const resultadoAudio = await audioService.analyzeAudio(audioBlob, tiempoGrabacion, userId);
      
      setProgresoSubida(80);
      
      // Registrar participación con los IDs del análisis
      const participacionData = {
        id_audio: resultadoAudio.audio?.id_audio || resultadoAudio.id_audio,
        id_analisis: resultadoAudio.analisis?.id_analisis || resultadoAudio.id_analisis,
        id_resultado: resultadoAudio.resultado?.id_resultado || resultadoAudio.id_resultado
      };
      
      await sesionesGrupalesService.registrarParticipacion(sesion.id_sesion, participacionData);
      
      setProgresoSubida(100);
      setSuccess('¡Participación registrada exitosamente!');
      setAudioBlob(null);
      setTiempoGrabacion(0);
      
      // Recargar datos
      cargarSesion();
      if (onSesionUpdated) onSesionUpdated();
      
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Error al subir el audio');
    } finally {
      setSubiendo(false);
    }
  };
  
  // Crear nueva sesión
  const crearSesion = async (e) => {
    e.preventDefault();
    if (!nuevaSesion.titulo.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await sesionesGrupalesService.iniciarSesion(grupo.id_grupo, nuevaSesion);
      
      if (res.success) {
        setSuccess('Sesión creada exitosamente');
        setSesion(res.sesion);
        setShowNuevaSesion(false);
        setNuevaSesion({ titulo: '', descripcion: '', duracion_horas: 24 });
        if (onSesionUpdated) onSesionUpdated();
      } else {
        setError(res.error || 'Error al crear la sesión');
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear la sesión');
    } finally {
      setLoading(false);
    }
  };
  
  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const yaParticipo = miParticipacion && miParticipacion.estado === 'completado';
  const sesionCompletada = sesion?.estado === 'completada' || sesion?.estado === 'cancelada';
  
  return (
    <div style={{
      background: 'var(--color-panel)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid var(--color-shadow)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaMicrophone /> Sesión de Análisis de Voz Grupal
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--color-text-secondary)', 
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <FaTimes size={20} />
          </button>
        )}
      </div>
      
      {/* Mensajes */}
      {error && (
        <div style={{
          background: 'rgba(244, 67, 54, 0.1)',
          color: '#f44336',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaTimes /> {error}
        </div>
      )}
      
      {success && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          color: '#4caf50',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaCheck /> {success}
        </div>
      )}
      
      {/* Sin sesión activa */}
      {!sesion && !showNuevaSesion && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1rem', 
            opacity: 0.3 
          }}>
            🎤
          </div>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            No hay sesión de voz activa en este grupo.
          </p>
          {puedeIniciar && (
            <button
              onClick={() => setShowNuevaSesion(true)}
              className="auth-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPlay /> Iniciar Sesión de Voz
            </button>
          )}
        </div>
      )}
      
      {/* Formulario nueva sesión */}
      {showNuevaSesion && (
        <form onSubmit={crearSesion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Título de la sesión *
            </label>
            <input
              type="text"
              placeholder="Ej: Reflexión del día, Cómo te sientes hoy..."
              value={nuevaSesion.titulo}
              onChange={e => setNuevaSesion({ ...nuevaSesion, titulo: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--color-shadow)',
                background: 'var(--color-panel-solid)',
                color: 'var(--color-text-main)'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Descripción (opcional)
            </label>
            <textarea
              placeholder="Instrucciones o contexto para los participantes..."
              value={nuevaSesion.descripcion}
              onChange={e => setNuevaSesion({ ...nuevaSesion, descripcion: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--color-shadow)',
                background: 'var(--color-panel-solid)',
                color: 'var(--color-text-main)',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Duración límite (horas)
            </label>
            <select
              value={nuevaSesion.duracion_horas}
              onChange={e => setNuevaSesion({ ...nuevaSesion, duracion_horas: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--color-shadow)',
                background: 'var(--color-panel-solid)',
                color: 'var(--color-text-main)'
              }}
            >
              <option value={1}>1 hora</option>
              <option value={6}>6 horas</option>
              <option value={12}>12 horas</option>
              <option value={24}>24 horas</option>
              <option value={48}>48 horas</option>
              <option value={72}>72 horas</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? <><FaSpinner className="spin" /> Creando...</> : 'Crear Sesión'}
            </button>
            <button
              type="button"
              onClick={() => setShowNuevaSesion(false)}
              className="auth-button"
              style={{ background: 'var(--color-panel-solid)', color: 'var(--color-text-main)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      
      {/* Sesión activa */}
      {sesion && !showNuevaSesion && (
        <div>
          {/* Info de la sesión */}
          <div style={{
            background: 'var(--color-panel-solid)',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-main)' }}>
              {sesion.titulo}
            </h4>
            {sesion.descripcion && (
              <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                {sesion.descripcion}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaUsers /> {sesion.participantes_completados || 0}/{sesion.total_participantes || 0} participantes
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaClock /> {sesion.estado === 'en_progreso' ? 'En progreso' : sesion.estado}
              </span>
            </div>
          </div>
          
          {/* Ya participó */}
          {yaParticipo && (
            <div style={{
              background: 'rgba(76, 175, 80, 0.1)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FaCheck size={40} style={{ color: '#4caf50', marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#4caf50' }}>
                ¡Ya participaste en esta sesión!
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                Tu análisis ha sido registrado. Espera a que finalice la sesión para ver los resultados grupales.
              </p>
            </div>
          )}
          
          {/* Sesión completada */}
          {sesionCompletada && !yaParticipo && (
            <div style={{
              background: 'rgba(158, 158, 158, 0.1)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FaClock size={40} style={{ color: '#9e9e9e', marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)' }}>
                Esta sesión ha finalizado
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                No pudiste participar a tiempo. Espera la próxima sesión.
              </p>
            </div>
          )}
          
          {/* Área de grabación */}
          {!yaParticipo && !sesionCompletada && (
            <div style={{
              background: 'var(--color-panel-solid)',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              {!audioBlob ? (
                <>
                  {/* Botón de grabación */}
                  <div 
                    onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: grabando 
                        ? 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)'
                        : 'linear-gradient(135deg, var(--color-primary) 0%, #2196f3 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      cursor: 'pointer',
                      boxShadow: grabando
                        ? '0 0 0 8px rgba(244, 67, 54, 0.2), 0 8px 20px rgba(244, 67, 54, 0.3)'
                        : '0 8px 20px rgba(33, 150, 243, 0.3)',
                      transition: 'all 0.3s ease',
                      animation: grabando ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    {grabando ? (
                      <FaStop size={40} style={{ color: 'white' }} />
                    ) : (
                      <FaMicrophone size={40} style={{ color: 'white' }} />
                    )}
                  </div>
                  
                  {/* Tiempo o instrucción */}
                  {grabando ? (
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f44336', marginBottom: '0.5rem' }}>
                      {formatTime(tiempoGrabacion)}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                      Toca el botón para comenzar a grabar
                    </p>
                  )}
                  
                  {grabando && (
                    <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
                      Toca de nuevo para detener
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Audio grabado, listo para subir */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <FaCheck size={50} style={{ color: '#4caf50', marginBottom: '1rem' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-main)' }}>
                      ¡Audio grabado!
                    </h4>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                      Duración: {formatTime(tiempoGrabacion)}
                    </p>
                  </div>
                  
                  {/* Barra de progreso */}
                  {subiendo && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{
                        height: 8,
                        background: 'var(--color-shadow)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          width: `${progresoSubida}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                        {progresoSubida < 70 ? 'Subiendo audio...' : 
                         progresoSubida < 90 ? 'Analizando emociones...' : 'Finalizando...'}
                      </p>
                    </div>
                  )}
                  
                  {/* Botones */}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={subirAudioYParticipar}
                      disabled={subiendo}
                      className="auth-button"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {subiendo ? (
                        <><FaSpinner className="spin" /> Subiendo...</>
                      ) : (
                        <><FaCloudUploadAlt /> Enviar y Participar</>
                      )}
                    </button>
                    <button
                      onClick={() => { setAudioBlob(null); setTiempoGrabacion(0); }}
                      disabled={subiendo}
                      className="auth-button"
                      style={{ background: 'var(--color-panel)', color: 'var(--color-text-main)' }}
                    >
                      Grabar de nuevo
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Lista de participantes */}
          {participantes.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaUsers /> Participantes ({participantes.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {participantes.map(p => (
                  <div key={p.id_participacion} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: p.estado === 'completado' ? 'rgba(76, 175, 80, 0.1)' : 'var(--color-panel-solid)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: p.estado === 'completado' ? '#4caf50' : 'var(--color-text-secondary)'
                  }}>
                    {p.estado === 'completado' && <FaCheck size={12} />}
                    {p.nombre} {p.apellido}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* CSS para animación */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SesionGrupalVoz;
