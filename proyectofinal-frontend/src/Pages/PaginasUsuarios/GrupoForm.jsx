import React, { useEffect, useState, useContext, useCallback } from 'react';
import { FaTag, FaAlignLeft, FaKey, FaLock, FaUsers, FaUser } from 'react-icons/fa';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import groupsService from '../../services/groupsService';
import authService from '../../services/authService';
import NavbarUsuario from '../../components/Usuario/NavbarUsuario';
import GroupMembersPanel from '../../components/Grupos/GroupMembersPanel';
import GroupActivitiesPanel from '../../components/Grupos/GroupActivitiesPanel';
import '../../global.css';
import { ThemeContext } from '../../context/themeContextDef';
import FondoClaro from '../../assets/FondoClaro.svg';
import FondoOscuro from '../../assets/FondoOscuro.svg';

export default function GrupoForm(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre:'', descripcion:'', codigo_acceso:'', tipo_grupo:'apoyo', privacidad:'privado', max_participantes:'' });
  const [loading, setLoading] = useState(false);
  const [currentId, setCurrentId] = useState(id && id !== 'nuevo' ? id : null);
  const [queuedActivities, setQueuedActivities] = useState([]);
  const [queuedMembers, setQueuedMembers] = useState([]);
  const { isDark } = useContext(ThemeContext);
  const userData = authService.getUser();

  useEffect(() => {
    if (id && id !== 'nuevo'){
      (async ()=>{
        try{
          const data = await groupsService.obtener(id);
          setForm({
            nombre: data.nombre || data.name || '',
            descripcion: data.descripcion || data.description || '',
            codigo_acceso: data.codigo_acceso || '',
            tipo_grupo: data.tipo_grupo || 'apoyo',
            privacidad: data.privacidad || 'privado',
            max_participantes: data.max_participantes || ''
          });
          setCurrentId(id);
        }catch(e){console.error(e)}
      })();
    }
  }, [id]);

  const handleChange = (e) => setForm(f=>({ ...f, [e.target.name]: e.target.value }));

  // Memoized handlers to avoid creating new function identities on every render
  const handleQueueAddActivity = useCallback((a) => setQueuedActivities(q => [...q, a]), []);
  const handleQueueUpdateActivities = useCallback((newQ) => setQueuedActivities(newQ), []);
  const handleQueueAddMember = useCallback((m) => setQueuedMembers(q => [...q, m]), []);
  const handleQueueUpdateMembers = useCallback((newQ) => setQueuedMembers(newQ), []);

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try{
      const payload = {
        nombre_grupo: form.nombre,
        descripcion: form.descripcion,
        codigo_acceso: form.codigo_acceso || undefined,
        tipo_grupo: form.tipo_grupo,
        privacidad: form.privacidad,
        max_participantes: form.max_participantes || undefined
      };

      if (id && id !== 'nuevo') {
        await groupsService.actualizar(id, payload);
        // stay on the same edit page
      } else {
        // Al crear, añadir la fecha de creación con la fecha/hora actual
        const nowIso = new Date().toISOString();
        payload.fecha_creacion = nowIso;
        payload.fechaCreacion = nowIso; // alias por compatibilidad
        const res = await groupsService.crear(payload);
        const createdId = res && (res.id_grupo || res.id || res._id);
        if (createdId) {
          // persist queued members and activities
          try{
            for (const m of queuedMembers) {
              await groupsService.agregarMiembro(createdId, m);
            }
            for (const a of queuedActivities) {
              await groupsService.crearActividad(createdId, a);
            }
          }catch(e){ console.error('Error al guardar en cola:', e) }

          setQueuedActivities([]);
          setQueuedMembers([]);
          setCurrentId(createdId);
          // update URL to the created group's edit page
          navigate(`/grupos/${createdId}`);
          return;
        } else {
          navigate('/grupos');
        }
      }
    }catch(e){console.error(e)}
    finally{setLoading(false)}
  };

  if (!userData) return <Navigate to="/login" replace />;

  return (
    <>
      <NavbarUsuario userData={userData} />

      <main
        className="container"
        style={{
          paddingTop: '2rem',
          paddingBottom: '4rem',
          backgroundImage: `url(${isDark ? FondoOscuro : FondoClaro})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        <div className="card" style={{maxWidth:900,margin:'0 auto',padding:16}}>
          <h2 style={{marginTop:0}}>{id && id !== 'nuevo' ? 'Editar Grupo' : 'Crear Grupo'}</h2>

          <div className="card inner-card" style={{marginTop:12,padding:12}}>
            <form onSubmit={submit} className="auth-form">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:12}}>
                <div />
              </div>
            <div className="form-group">
              <div className="input-labels">
                <label><FaTag /> Nombre del grupo</label>
              </div>
              <div className="input-group no-icon">
                <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre del grupo" />
              </div>
            </div>

            <div className="form-group">
              <div className="input-labels">
                <label><FaAlignLeft /> Descripción</label>
              </div>
              <div className="input-group no-icon">
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción (opcional)" className="input-textarea" />
              </div>
            </div>

            <div className="form-group">
              <div className="input-labels">
                <label><FaKey /> Código de acceso (opcional)</label>
              </div>
              <div className="input-group">
                <span className="input-icon" />
                <input name="codigo_acceso" value={form.codigo_acceso} onChange={handleChange} placeholder="Código de acceso" />
              </div>
            </div>

            <div className="form-group group-controls" style={{display:'flex',gap:8}}>
              <div style={{flex:1}}>
                <div className="input-labels">
                  <label><FaTag /> Tipo de grupo</label>
                </div>
                <div className="input-group">
                  <span className="input-icon" />
                  <select name="tipo_grupo" value={form.tipo_grupo} onChange={handleChange}>
                    <option value="apoyo">Apoyo</option>
                    <option value="terapia">Terapia</option>
                    <option value="taller">Taller</option>
                    <option value="empresa">Empresa</option>
                    <option value="educativo">Educativo</option>
                    <option value="familiar">Familiar</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div style={{flex:1}}>
                <div className="input-labels">
                  <label><FaLock /> Privacidad</label>
                </div>
                <div className="input-group">
                  <span className="input-icon" />
                  <select name="privacidad" value={form.privacidad} onChange={handleChange}>
                    <option value="privado">Privado</option>
                    <option value="publico">Público</option>
                    <option value="por_invitacion">Por invitación</option>
                  </select>
                </div>
              </div>

              <div style={{width:160}}>
                <div className="input-labels">
                  <label><FaUsers /> Max participantes</label>
                </div>
                <div className="input-group">
                  <span className="input-icon" />
                  <input type="number" name="max_participantes" value={form.max_participantes} onChange={handleChange} min={1} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-labels">
                <label><FaUser /> Facilitador</label>
              </div>
              <div className="input-group">
                <span className="input-icon" />
                <input value={userData ? (userData.nombre || userData.name || userData.usuario || '') : ''} readOnly />
              </div>
            </div>

            
            </form>
          </div>

          <div className="card inner-card" style={{marginTop:12,padding:12}}>
            <GroupActivitiesPanel 
              grupoId={currentId} 
              onQueueAdd={handleQueueAddActivity} 
              onQueueUpdate={handleQueueUpdateActivities} 
              queuedActivities={queuedActivities} 
            />
          </div>

          <div className="card inner-card" style={{marginTop:12,padding:12}}>
            <GroupMembersPanel 
              grupoId={currentId} 
              onQueueAdd={handleQueueAddMember} 
              queuedMembers={queuedMembers} 
              onQueueUpdate={handleQueueUpdateMembers} 
            />
          </div>

          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
            <button type="button" onClick={() => navigate('/grupos')} className="auth-button">Cancelar</button>
            <button type="button" disabled={loading} onClick={submit} className="auth-button">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>

        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SerenVoice — Todos los derechos reservados.
      </footer>
    </>
  );
}
