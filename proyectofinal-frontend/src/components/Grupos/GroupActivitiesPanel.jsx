import React, { useEffect, useState, useCallback } from 'react';
import { FaTag, FaAlignLeft, FaList, FaCalendarAlt, FaClock } from 'react-icons/fa';
import groupsService from '../../services/groupsService';

export default function GroupActivitiesPanel({ grupoId, onQueueAdd, onQueueUpdate, queuedActivities = [] }){
  const [actividades, setActividades] = useState([]);
  const [nuevo, setNuevo] = useState({ titulo:'', descripcion:'', tipo_actividad:'tarea', fecha_inicio:'', fecha_fin:'' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const cargar = useCallback(async () => {
    if (!grupoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try{
      const data = await groupsService.listarActividades(grupoId);
      setActividades(data || []);
    }catch(e){ console.error('[GroupActivitiesPanel] cargar', e); }
    finally{ setLoading(false); }
  }, [grupoId]);

  useEffect(() => { cargar(); }, [cargar]);

  // visual styling is handled by global.css classes (.activity-card, .activities-grid)

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const str = value.toString();
      // ISO date without time: YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const d = new Date(str + 'T00:00:00');
        return d.toLocaleDateString();
      }
      const d = new Date(str);
      if (!isNaN(d)) return d.toLocaleString();
      const alt = str.replace(' ', 'T');
      const d2 = new Date(alt);
      if (!isNaN(d2)) return d2.toLocaleString();
      return str;
    } catch {
      return value;
    }
  };

  const capitalize = (s) => {
    if (!s) return s;
    try { const str = s.toString(); return str.charAt(0).toUpperCase() + str.slice(1); } catch {return s}
  };

  // Date limits for activity dates: not before today, not more than 1 year ahead
  const toDateInputString = (d) => d.toISOString().slice(0,10);
  const normalizeForDateInput = (v) => {
    if (!v) return '';
    try { const s = v.toString(); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10); const d = new Date(s); if (!isNaN(d)) return d.toISOString().slice(0,10); return s.slice(0,10); } catch { return '' }
  };
  const todayDate = new Date();
  const todayStr = toDateInputString(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()));
  const maxDate = new Date(todayDate);
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxStr = toDateInputString(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()));

  const validateDates = (obj) => {
    // require all fields: titulo, descripcion, tipo_actividad, fecha_inicio, fecha_fin
    const titulo = (obj.titulo || obj.title || '').toString().trim();
    const descripcion = (obj.descripcion || obj.description || '').toString().trim();
    const tipo = (obj.tipo_actividad || obj.type || '').toString().trim();
    const inicio = obj.fecha_inicio || obj.fechaInicio || null;
    const fin = obj.fecha_fin || obj.fechaFin || null;

    if (!titulo) return { ok:false, msg: 'El título es obligatorio' };
    if (!descripcion) return { ok:false, msg: 'La descripción es obligatoria' };
    if (!tipo) return { ok:false, msg: 'Selecciona un tipo de actividad' };
    if (!inicio || !fin) return { ok:false, msg: 'Debe completar Fecha Inicio y Fecha Fin' };

    const parse = (s) => { if (!s) return null; try { return new Date(s + 'T00:00:00'); } catch { return new Date(s); } };
    const di = parse(inicio);
    const df = parse(fin);
    const today = new Date(todayStr + 'T00:00:00');
    const maxD = new Date(maxStr + 'T00:00:00');

    if (isNaN(di)) return { ok:false, msg: 'Fecha inicio inválida' };
    if (isNaN(df)) return { ok:false, msg: 'Fecha fin inválida' };
    if (di < today) return { ok:false, msg: 'La fecha de inicio no puede ser anterior a hoy' };
    if (df < today) return { ok:false, msg: 'La fecha de fin no puede ser anterior a hoy' };
    if (di > maxD) return { ok:false, msg: 'La fecha de inicio no puede ser mayor a un año desde hoy' };
    if (df > maxD) return { ok:false, msg: 'La fecha de fin no puede ser mayor a un año desde hoy' };
    if (df < di) return { ok:false, msg: 'La fecha de fin no puede ser anterior a la fecha de inicio' };
    return { ok:true };
  };

  // Previously we propagated the draft to parent on every change which
  // caused duplicates/overwrites of the queuedActivities. Parent state
  // should only be modified when the user explicitly adds or removes
  // a queued activity (via onQueueAdd/onQueueUpdate). Therefore we
  // do not auto-propagate `nuevo` here.

  const crear = async (e) => {
    e.preventDefault();
    if (!grupoId) {
      if (onQueueAdd) {
        const nowIso = new Date().toISOString();
        // validate dates before queueing/updating
        const v = validateDates(nuevo);
        if (!v.ok) { setErrorMsg(v.msg); return; }
        const queued = { ...nuevo, fecha_creacion: nowIso, fechaCreacion: nowIso };
        if (editingIndex !== null && typeof onQueueUpdate === 'function') {
          const updated = queuedActivities.map((it, idx) => idx === editingIndex ? queued : it);
          onQueueUpdate(updated);
          setEditingIndex(null);
        } else {
          onQueueAdd(queued);
        }
        setNuevo({ titulo:'', descripcion:'', tipo_actividad:'tarea', fecha_inicio:'', fecha_fin:'' });
      } else {
        alert('Guarda el grupo primero para crear actividades');
      }
      return;
    }
    try{
      const nowIso = new Date().toISOString();
      // validate dates before creating
      const v = validateDates(nuevo);
      if (!v.ok) { setErrorMsg(v.msg); return; }
      const payload = { ...nuevo, fecha_creacion: nowIso, fechaCreacion: nowIso };
      if (editingId) {
        await groupsService.actualizarActividad(grupoId, editingId, payload);
        setEditingId(null);
      } else {
        await groupsService.crearActividad(grupoId, payload);
      }
      setNuevo({ titulo:'', descripcion:'', tipo_actividad:'tarea', fecha_inicio:'', fecha_fin:'' });
      setErrorMsg('');
      cargar();
    }catch(e){console.error('[GroupActivitiesPanel] crear',e)}
  };

  const eliminar = async (actividadId) => {
    if(!confirm('Eliminar actividad?')) return;
    try{ await groupsService.eliminarActividad(grupoId, actividadId); cargar(); }catch(e){console.error('[GroupActivitiesPanel] eliminar',e)}
  };

  return (
    <div style={{marginTop:16}}>
      <h3>Actividades</h3>
      {errorMsg && (
        <div className="activity-error" style={{marginTop:8,marginBottom:8}}>{errorMsg}</div>
      )}
      <form onSubmit={crear} className="activities-form" style={{marginBottom:12,display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,alignItems:'center'}}>
        <div className="form-group">
          <div className="input-labels">
            <label><FaTag /> Título</label>
          </div>
          <div className="input-group no-icon">
            <input placeholder="Título" required value={nuevo.titulo} onChange={e=>{ setErrorMsg(''); setNuevo(n=>({...n,titulo:e.target.value})); }} />
          </div>
        </div>

        <div className="form-group">
          <div className="input-labels">
            <label><FaAlignLeft /> Descripción</label>
          </div>
          <div className="input-group no-icon">
            <input placeholder="Descripción" value={nuevo.descripcion} onChange={e=>{ setErrorMsg(''); setNuevo(n=>({...n,descripcion:e.target.value})); }} />
          </div>
        </div>

        <div className="form-group">
          <div className="input-labels">
            <label><FaList /> Tipo</label>
          </div>
          <div className="input-group no-icon">
            <select value={nuevo.tipo_actividad} onChange={e=>{ setErrorMsg(''); setNuevo(n=>({...n,tipo_actividad:e.target.value})); }}>
              <option value="tarea">Tarea</option>
              <option value="actividad">Actividad</option>
              <option value="evaluacion">Evaluación</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Fecha programada removida: se usará fecha de creación automática */}

            <div className="form-group">
          <div className="input-labels">
            <label><FaCalendarAlt /> Fecha inicio</label>
          </div>
          <div className="input-group no-icon">
            <input type="date" min={todayStr} max={maxStr} value={nuevo.fecha_inicio} onChange={e=>{ setErrorMsg(''); setNuevo(n=>({...n,fecha_inicio:e.target.value})); }} />
          </div>
        </div>

        <div className="form-group">
          <div className="input-labels">
            <label><FaCalendarAlt /> Fecha fin</label>
          </div>
            <div className="input-group no-icon">
            <input type="date" min={todayStr} max={maxStr} value={nuevo.fecha_fin} onChange={e=>{ setErrorMsg(''); setNuevo(n=>({...n,fecha_fin:e.target.value})); }} />
          </div>
        </div>

        <div style={{alignSelf:'end',display:'flex',gap:8}}>
          {grupoId ? (
            <>
              <button type="submit">{editingId ? 'Guardar' : 'Crear'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setNuevo({ titulo:'', descripcion:'', tipo_actividad:'tarea', fecha_inicio:'', fecha_fin:'' }); setErrorMsg(''); }}>Cancelar</button>}
            </>
          ) : (
            <>
              <button type="button" onClick={() => {
                if (onQueueAdd) {
                  const v = validateDates(nuevo);
                  if (!v.ok) { setErrorMsg(v.msg); return; }
                  const nowIso = new Date().toISOString();
                  const queued = { ...nuevo, fecha_creacion: nowIso, fechaCreacion: nowIso };
                  if (editingIndex !== null && typeof onQueueUpdate === 'function') {
                    const updated = queuedActivities.map((it, idx) => idx === editingIndex ? queued : it);
                    onQueueUpdate(updated);
                    setEditingIndex(null);
                  } else {
                    onQueueAdd(queued);
                  }
                  setNuevo({ titulo:'', descripcion:'', tipo_actividad:'tarea', fecha_inicio:'', fecha_fin:'' });
                } else {
                  alert('Guarda el grupo primero para agregar actividades');
                }
              }}>{editingIndex !== null ? 'Guardar' : 'Agregar'}</button>
              {editingIndex !== null && <button type="button" onClick={() => { setEditingIndex(null); setNuevo({ titulo:'', descripcion:'', tipo_actividad:'tarea', fecha_inicio:'', fecha_fin:'' }); setErrorMsg(''); }}>Cancelar</button>}
            </>
          )}
        </div>
      </form>

      {(!grupoId) ? (
        <div>
          <div>Estás creando un grupo. Las actividades se pueden agregar en borrador y se guardarán al crear el grupo.</div>
              {queuedActivities.length > 0 && (
                <div style={{marginTop:8}}>
                  <strong>Actividades:</strong>
                  <div className="activities-grid">
                    {queuedActivities.map((a,i) => (
                      <div key={`q-${i}`} className="activity-card">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:8}}>
                          <div style={{flex:1}}>
                            <div className="activity-title">{a.titulo || a.title || 'Sin título'}</div>
                            <div className="activity-desc">{a.descripcion || a.description || 'Sin descripción'}</div>
                          </div>
                          <div style={{marginLeft:8,textAlign:'right'}}>
                            <div className="activity-type">{capitalize(a.tipo_actividad || a.type || 'tarea')}</div>
                          </div>
                        </div>
                        <div className="activity-meta">
                          <div style={{flex:1}}><strong>Inicio:</strong> {formatDate(a.fecha_inicio || a.fechaInicio || a.start_date || a.start)}</div>
                          <div style={{flex:1}}><strong>Fin:</strong> {formatDate(a.fecha_fin || a.fechaFin || a.end_date || a.end)}</div>
                        </div>
                        {typeof onQueueUpdate === 'function' && (
                          <div className="activity-actions row" style={{marginTop:8}}>
                            <button onClick={() => {
                              // start editing this queued item
                              setErrorMsg('');
                              setEditingIndex(i);
                              setEditingId(null);
                              setNuevo({
                                titulo: a.titulo || a.title || '',
                                descripcion: a.descripcion || a.description || '',
                                tipo_actividad: a.tipo_actividad || a.type || 'tarea',
                                fecha_inicio: normalizeForDateInput(a.fecha_inicio || a.fechaInicio || a.start_date || a.start),
                                fecha_fin: normalizeForDateInput(a.fecha_fin || a.fechaFin || a.end_date || a.end),
                              });
                            }} className="auth-button">Editar</button>
                            <button onClick={() => onQueueUpdate(queuedActivities.filter((_,j)=>j!==i))} className="auth-button danger">Quitar</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
        </div>
      ) : loading ? (
        <div>Cargando actividades...</div>
      ) : (actividades.length === 0) ? (
        <div>No hay actividades aún.</div>
      ) : (
        <div className="activities-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12}}>
          {actividades.map(a => (
            <div key={a.id_actividad || a.id || a._id} className="activity-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:8}}>
                <div style={{flex:1}}>
                  <div className="activity-title">{a.titulo || a.title || 'Sin título'}</div>
                <div className="activity-desc">{a.descripcion || a.description || 'Sin descripción'}</div>
                </div>
                <div style={{marginLeft:8,textAlign:'right'}}>
                  <div className="activity-type">{capitalize(a.tipo_actividad || a.type || 'tarea')}</div>
                </div>
              </div>
              <div className="activity-meta">
                <div style={{flex:1}}><strong>Inicio:</strong> {formatDate(a.fecha_inicio || a.fechaInicio || a.start_date || a.start)}</div>
                <div style={{flex:1}}><strong>Fin:</strong> {formatDate(a.fecha_fin || a.fechaFin || a.end_date || a.end)}</div>
              </div>
              <div className="activity-actions row" style={{marginTop:8}}>
                <button onClick={() => {
                  setErrorMsg('');
                  setEditingId(a.id_actividad || a.id || a._id);
                  setEditingIndex(null);
                  setNuevo({
                    titulo: a.titulo || a.title || '',
                    descripcion: a.descripcion || a.description || '',
                    tipo_actividad: a.tipo_actividad || a.type || 'tarea',
                    fecha_inicio: normalizeForDateInput(a.fecha_inicio || a.fechaInicio || a.start_date || a.start),
                    fecha_fin: normalizeForDateInput(a.fecha_fin || a.fechaFin || a.end_date || a.end),
                  });
                }} className="auth-button">Editar</button>
                <button onClick={() => eliminar(a.id_actividad || a.id || a._id)} className="auth-button danger">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
