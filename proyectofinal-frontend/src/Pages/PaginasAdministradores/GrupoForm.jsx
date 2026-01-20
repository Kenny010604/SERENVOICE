import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import groupsService from '../../services/groupsService';
import { 
  FaUserFriends, 
  FaSave, 
  FaArrowLeft, 
  FaInfoCircle, 
  FaClipboardList, 
  FaUsers,
  FaTag,
  FaAlignLeft,
  FaKey,
  FaLock,
  FaGlobe,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';
import "../../styles/StylesAdmin/AdminPages.css";

export default function GrupoForm(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    nombre: '', 
    descripcion: '', 
    codigo_acceso: '', 
    tipo_grupo: 'apoyo', 
    privacidad: 'privado', 
    max_participantes: '' 
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [miembros, setMiembros] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isEditing = id && id !== 'nuevo';

  useEffect(() => {
    if (isEditing){
      setLoadingData(true);
      (async ()=>{
        try{
          const data = await groupsService.obtener(id);
          setForm({
            nombre: data.nombre || data.name || data.nombre_grupo || '',
            descripcion: data.descripcion || data.description || '',
            codigo_acceso: data.codigo_acceso || '',
            tipo_grupo: data.tipo_grupo || 'apoyo',
            privacidad: data.privacidad || 'privado',
            max_participantes: data.max_participantes || ''
          });
          // Cargar miembros y actividades
          try {
            const [mData, aData] = await Promise.all([
              groupsService.listarMiembros(id),
              groupsService.listarActividades(id)
            ]);
            setMiembros(mData || []);
            setActividades(aData || []);
          } catch(e) { console.error(e); }
        }catch(e){
          console.error(e);
          setErrorMessage('Error al cargar los datos del grupo');
        } finally {
          setLoadingData(false);
        }
      })();
    }
  }, [id, isEditing]);

  const handleChange = (e) => setForm(f=>({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try{
      const payload = {
        nombre_grupo: form.nombre,
        descripcion: form.descripcion,
        codigo_acceso: form.codigo_acceso || undefined,
        tipo_grupo: form.tipo_grupo,
        privacidad: form.privacidad,
        max_participantes: form.max_participantes || undefined
      };
      if (isEditing) {
        await groupsService.actualizar(id, payload);
        setSuccessMessage('Grupo actualizado exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        await groupsService.crear(payload);
        navigate('/admin/grupos');
      }
    }catch(e){
      console.error(e);
      setErrorMessage('Error al guardar el grupo');
    }
    finally{setLoading(false)}
  };

  const getTipoColor = (tipo) => {
    const colores = {
      'apoyo': '#4caf50',
      'terapia': '#2196f3',
      'taller': '#ff9800',
      'empresa': '#9c27b0',
      'educativo': '#00bcd4',
      'familiar': '#e91e63',
      'otro': '#607d8b'
    };
    return colores[tipo] || '#607d8b';
  };

  const tabs = [
    { id: 'info', label: 'Información', icon: <FaInfoCircle /> },
    { id: 'miembros', label: `Miembros (${miembros.length})`, icon: <FaUsers /> },
    { id: 'actividades', label: `Actividades (${actividades.length})`, icon: <FaClipboardList /> },
  ];

  return (
    <div className="admin-grupo-form-page">
      <div className="admin-page-content">
        {/* Header */}
        <div className="admin-page-header">
          <h2><FaUserFriends /> {isEditing ? 'Editar Grupo' : 'Crear Grupo'}</h2>
          <div className="admin-header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigate('/admin/grupos')} className="admin-btn admin-btn-secondary">
              <FaArrowLeft /> <span className="admin-hidden-mobile">Volver</span>
            </button>
            <button onClick={submit} className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSave />}
              <span className="admin-hidden-mobile">{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {successMessage && (
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
            <FaCheckCircle /> {successMessage}
          </div>
        )}
        {errorMessage && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            color: '#f44336',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            ✕ {errorMessage}
          </div>
        )}

        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FaSpinner className="spin" size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando datos del grupo...</p>
          </div>
        ) : (
          <>
            {/* Pestañas */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              borderBottom: '2px solid var(--color-shadow, #e0e0e0)',
              paddingBottom: '0',
              overflowX: 'auto'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--color-primary, #2196f3)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary, #666)',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Información */}
            {activeTab === 'info' && (
              <div className="admin-card" style={{ maxWidth: "700px" }}>
                <div className="admin-card-body">
                  <form onSubmit={submit}>
                    <div className="admin-form-group">
                      <label className="admin-form-label"><FaTag /> Nombre del Grupo *</label>
                      <input 
                        className="admin-form-input"
                        name="nombre" 
                        value={form.nombre} 
                        onChange={handleChange} 
                        required 
                        placeholder="Ingrese el nombre del grupo"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label"><FaAlignLeft /> Descripción</label>
                      <textarea 
                        className="admin-form-input"
                        name="descripcion" 
                        value={form.descripcion} 
                        onChange={handleChange}
                        placeholder="Describa el propósito del grupo"
                        rows={4}
                      />
                    </div>
                    <div className="admin-form-row" style={{ gap: '1rem', marginBottom: '1rem' }}>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label"><FaTag /> Tipo de Grupo</label>
                        <select 
                          className="admin-form-input"
                          name="tipo_grupo" 
                          value={form.tipo_grupo} 
                          onChange={handleChange}
                        >
                          <option value="apoyo">🤝 Apoyo</option>
                          <option value="terapia">💆 Terapia</option>
                          <option value="taller">🎯 Taller</option>
                          <option value="empresa">💼 Empresa</option>
                          <option value="educativo">📚 Educativo</option>
                          <option value="familiar">👨‍👩‍👧 Familiar</option>
                          <option value="otro">📌 Otro</option>
                        </select>
                      </div>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">
                          {form.privacidad === 'publico' ? <FaGlobe /> : <FaLock />} Privacidad
                        </label>
                        <select 
                          className="admin-form-input"
                          name="privacidad" 
                          value={form.privacidad} 
                          onChange={handleChange}
                        >
                          <option value="privado">🔒 Privado</option>
                          <option value="publico">🌐 Público</option>
                          <option value="por_invitacion">✉️ Por invitación</option>
                        </select>
                      </div>
                    </div>
                    <div className="admin-form-row" style={{ gap: '1rem' }}>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label"><FaUsers /> Máx. Participantes</label>
                        <input 
                          type="number"
                          className="admin-form-input"
                          name="max_participantes" 
                          value={form.max_participantes} 
                          onChange={handleChange}
                          placeholder="Sin límite"
                          min={1}
                        />
                      </div>
                      {form.privacidad !== 'publico' && (
                        <div className="admin-form-group" style={{ flex: 1 }}>
                          <label className="admin-form-label"><FaKey /> Código de Acceso</label>
                          <input 
                            className="admin-form-input"
                            name="codigo_acceso" 
                            value={form.codigo_acceso} 
                            onChange={handleChange}
                            placeholder="Auto-generado si vacío"
                          />
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Tab: Miembros */}
            {activeTab === 'miembros' && (
              <div className="admin-card">
                <div className="admin-card-body">
                  <h3 style={{ margin: '0 0 1rem 0' }}>Miembros del Grupo</h3>
                  {miembros.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {miembros.map(m => (
                        <div key={m.id_grupo_miembro || m.id} style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#2196f3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            {(m.nombre || 'U')[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600' }}>{m.nombre} {m.apellido}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'capitalize' }}>{m.rol_grupo}</div>
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            background: m.estado === 'activo' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                            color: m.estado === 'activo' ? '#4caf50' : '#9e9e9e'
                          }}>
                            {m.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                      No hay miembros en este grupo aún.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Actividades */}
            {activeTab === 'actividades' && (
              <div className="admin-card">
                <div className="admin-card-body">
                  <h3 style={{ margin: '0 0 1rem 0' }}>Actividades del Grupo</h3>
                  {actividades.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {actividades.map(a => (
                        <div key={a.id_actividad || a.id} style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{a.titulo}</div>
                            {a.descripcion && (
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>{a.descripcion}</div>
                            )}
                            <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                              Tipo: {a.tipo_actividad} | Participantes: {a.participantes_completados || 0}/{a.participantes_totales || 0}
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            background: a.completada ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                            color: a.completada ? '#4caf50' : '#ff9800'
                          }}>
                            {a.completada ? 'Completada' : 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                      No hay actividades programadas aún.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Botones footer */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => navigate('/admin/grupos')}>
                Cancelar
              </button>
              <button type="button" className="admin-btn admin-btn-primary" disabled={loading} onClick={submit}>
                <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
