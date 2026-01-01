import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import groupsService from '../../services/groupsService';

export default function ActividadesGrupo(){
  const { id } = useParams();
  const [actividades, setActividades] = useState([]);
  const [nuevo, setNuevo] = useState({ titulo:'', descripcion:'' });
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try{ const data = await groupsService.listarActividades(id); setActividades(data || []); }catch(e){console.error(e)}finally{setLoading(false)}
  }, [id]);

  useEffect(()=>{ if (id) cargar(); }, [id, cargar]);

  const crear = async (e) => {
    e.preventDefault();
    try{ await groupsService.crearActividad(id, nuevo); setNuevo({ titulo:'', descripcion:'' }); cargar(); }catch(e){console.error(e)}
  };

  const eliminar = async (actividadId) => {
    if(!confirm('Eliminar actividad?')) return;
    try{ await groupsService.eliminarActividad(id, actividadId); cargar(); }catch(e){console.error(e)}
  };

  return (
    <div className="actividades-grupo-content page-content">
      <h2>Actividades del grupo</h2>
      <form onSubmit={crear} style={{marginBottom:12}}>
        <input placeholder="Título" required value={nuevo.titulo} onChange={e=>setNuevo(n=>({...n,titulo:e.target.value}))} />
        <input placeholder="Descripción" value={nuevo.descripcion} onChange={e=>setNuevo(n=>({...n,descripcion:e.target.value}))} />
        <button type="submit">Crear</button>
      </form>

      {loading ? <div>Cargando...</div> : (
        <ul>
          {actividades.map(a => (
            <li key={a.id || a._id}>
              <strong>{a.titulo || a.title}</strong> - {a.descripcion || a.description}
              {' '}
              <button onClick={() => eliminar(a.id || a._id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
