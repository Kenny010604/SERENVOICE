import React, { useEffect, useState, useCallback } from 'react';
import { FaUser, FaEnvelope } from 'react-icons/fa';
import groupsService from '../../services/groupsService';
import authService from '../../services/authService';
import { userService } from '../../services/userService';
import SearchResultsDropdown from './SearchResultsDropdown';
import { makeFotoUrlWithProxy } from '../../utils/avatar';

// simple debounce helper
const useDebounced = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export default function GroupMembersPanel({ grupoId, onQueueAdd, queuedMembers = [], onQueueUpdate }){
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debounced = useDebounced(searchTerm, 400);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const cargar = useCallback(async () => {
    if (!grupoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try{
      const data = await groupsService.listarMiembros(grupoId);
      setMiembros(data || []);
    }catch(e){ console.error('[GroupMembersPanel] cargar', e) }
    finally{ setLoading(false) }
  }, [grupoId]);

  const calcAge = (dob) => {
    if (!dob) return null;
    try{
      const d = new Date(dob);
      if (isNaN(d)) return null;
      const diff = Date.now() - d.getTime();
      const ageDt = new Date(diff);
      return Math.abs(ageDt.getUTCFullYear() - 1970);
    }catch{ return null }
  };

  const getFullName = (u) => {
    const first = u.nombre || u.name || u.nombres || '';
    const last = u.apellido || u.apellidos || u.surname || '';
    const combined = `${first || ''} ${last || ''}`.trim();
    return combined || (u.usuario || u.usuario_nombre) || first || last || '';
  };

  useEffect(()=>{ cargar(); }, [cargar]);

  // legacy manual add removed: using search-based add and queued members

  useEffect(() => {
    const doSearch = async () => {
      const q = debounced?.trim();
      if (!q || q.length < 2) { setSearchResults([]); return; }
      setSearching(true);
      setSearchError(null);
      try{
        const resp = await userService.searchUsers(q, 1, 10);
        // normalize: expect resp.data (Helpers.format_response returns { success, data })
        const users = resp?.data || resp?.usuarios || resp?.users || resp || [];

        const idOf = u => String(u.id || u.usuario_id || u._id || u.id_usuario || '');
        const currentUser = authService.getUser();
        const currentUserId = currentUser ? String(currentUser.id_usuario || currentUser.id || currentUser.usuario_id || '') : '';

        const existingIds = new Set([
          ... (miembros || []).map(m => String(m.id_usuario || m.id || m.usuario_id || '')),
          ... (queuedMembers || []).map(m => idOf(m)),
          currentUserId
        ].filter(Boolean));

        const filtered = (users || []).filter(u => {
          const uid = idOf(u);
          return uid && !existingIds.has(uid);
        });

        setSearchResults(filtered || []);
      }catch(err){ 
        console.error('search users', err); 
        setSearchResults([]);
        setSearchError(err?.message || (err?.data && err.data.message) || 'Error al buscar usuarios');
      }
      finally{ setSearching(false); }
    };
    doSearch();
  }, [debounced, miembros, queuedMembers]);

  const eliminar = async (miembroId) => {
    if(!confirm('Eliminar miembro?')) return;
    try{ await groupsService.eliminarMiembro(grupoId, miembroId); cargar(); }catch(e){console.error('[GroupMembersPanel] eliminar', e)}
  };

  const cambiarRol = async (miembroId, nuevoRol) => {
    try{
      if (!grupoId) {
        // if no grupoId, update queued member via callback
        if (onQueueUpdate) {
          onQueueUpdate(queuedMembers.map(m => ( (m.id_grupo_miembro || m.id || m._id) === miembroId ? { ...m, rol_grupo: nuevoRol } : m )));
        }
        return;
      }
      await groupsService.actualizarMiembro(grupoId, miembroId, { rol_grupo: nuevoRol });
      cargar();
    }catch(e){ console.error('[GroupMembersPanel] cambiarRol', e) }
  };

  return (
    <div style={{marginTop:16}}>
      <h3>Miembros</h3>
      <div className="members-form" style={{marginBottom:12}}>
        <div className="form-group" style={{position:'relative'}}>
          <div className="input-labels">
            <label><FaUser /> Buscar usuario por nombre o correo</label>
          </div>
          <div className="input-group no-icon">
            <input placeholder="Escribe al menos 2 caracteres para buscar" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>

          {searching && <div style={{position:'absolute',right:8,top:36}}>Buscando...</div>}

          {(Boolean(debounced && debounced.length >= 2) || searching || searchError || (searchResults && searchResults.length > 0)) && (
            <div className="search-wrapper" style={{marginTop:8}}>
              <SearchResultsDropdown
                results={searchResults}
                error={searchError}
                loading={searching}
                animate={Boolean(debounced && debounced.length >= 2)}
                onSelect={async (u) => {
                const payload = { 
                  nombre: u.nombre || u.name, 
                  apellido: u.apellido || u.apellidos || '',
                  correo: u.correo || u.email, 
                  usuario_id: u.id || u.usuario_id || u._id,
                  foto_perfil: u.foto_perfil || u.fotoPerfil || u.avatar || null,
                  genero: u.genero || u.gender || null,
                  fecha_nacimiento: u.fecha_nacimiento || u.fechaNacimiento || null
                };
                if (!grupoId) {
                  if (onQueueAdd) onQueueAdd(payload);
                } else {
                  try{ await groupsService.agregarMiembro(grupoId, payload); cargar(); }catch(err){console.error('add member',err)}
                }
                setSearchTerm(''); setSearchResults([]);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {(!grupoId) ? (
        <div>
          <div>Estás creando un grupo. Los miembros se pueden agregar en borrador y se guardarán al crear el grupo.</div>
          {queuedMembers.length > 0 && (
            <div style={{marginTop:8}}>
              <strong>Miembros en borrador:</strong>
              <ul className="member-list" style={{marginTop:8}}>
                {queuedMembers.map((m,i) => {
                  const full = getFullName(m);
                  const edad = m.edad || calcAge(m.fecha_nacimiento || m.fechaNacimiento || m.fechaNac);
                  const genero = m.genero || m.gender || m.sexo;
                  return (
                  <li key={`qm-${i}`} className="member-item">
                    <div className="member-avatar">
                        {m.foto_perfil ? <img src={makeFotoUrlWithProxy(m.foto_perfil)} alt="avatar" /> : <div className="avatar-placeholder" />}
                      </div>
                    <div className="member-meta">
                      <div className="member-name">{full}</div>
                      <div className="member-email">{m.correo}</div>
                    </div>
                    <div className="member-extra">
                      {genero && <div className="member-gender">{genero}</div>}
                      {edad && <div className="member-age">{edad} años</div>}
                    </div>
                              {typeof onQueueUpdate === 'function' && (
                                <button onClick={() => onQueueUpdate(queuedMembers.filter((_,j)=>j!==i))}>Quitar</button>
                              )}
                  </li>
                )})}
              </ul>
            </div>
          )}
        </div>
      ) : loading ? (
        <div>Cargando miembros...</div>
      ) : (miembros.length === 0) ? (
        <div>No hay miembros aún.</div>
      ) : (
        <ul className="member-list">
          {miembros.map(m => {
            const full = getFullName(m);
            const edad = m.edad || m.age || calcAge(m.fecha_nacimiento || m.fechaNacimiento || m.fechaNac || m.fecha);
            const genero = m.genero || m.gender || m.sexo;
            return (
            <li key={m.id_grupo_miembro || m.id || m._id} className="member-item">
              <div className="member-avatar">
                {m.foto_perfil ? <img src={makeFotoUrlWithProxy(m.foto_perfil)} alt="avatar" /> : <div className="avatar-placeholder" />}
              </div>
              <div className="member-meta">
                <div className="member-name">{full}</div>
                <div className="member-email">{m.correo || m.email}</div>
              </div>
              <div className="member-extra">
                { genero && <div className="member-gender">{genero}</div> }
                { edad && <div className="member-age">{edad} años</div> }
              </div>
              <div className="member-actions">
                <select value={m.rol_grupo || m.rol || 'participante'} onChange={e=>cambiarRol(m.id_grupo_miembro || m.id || m._id, e.target.value)}>
                  <option value="facilitador">Facilitador</option>
                  <option value="co_facilitador">Co-facilitador</option>
                  <option value="participante">Participante</option>
                  <option value="observador">Observador</option>
                </select>
                <button className="member-action danger" onClick={() => eliminar(m.id_grupo_miembro || m.id || m._id)}>Eliminar</button>
              </div>
            </li>
          )})}
        </ul>
      )}
    </div>
  );
}
