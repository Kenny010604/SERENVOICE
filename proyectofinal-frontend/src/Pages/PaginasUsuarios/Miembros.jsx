import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import groupsService from '../../services/groupsService';

export default function Miembros(){
  const { id } = useParams();
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevo, setNuevo] = useState({ nombre:'', correo:'' });

  const cargar = useCallback(async () => {
    setLoading(true);
    try{
      const data = await groupsService.listarMiembros(id);
      setMiembros(data || []);
    }catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }, [id]);

  useEffect(()=>{ if (id) cargar(); }, [id, cargar]);

  const agregar = async (e) => {
    e.preventDefault();
    try{
      await groupsService.agregarMiembro(id, nuevo);
      setNuevo({ nombre:'', correo:'' });
      cargar();
    }catch(e){ console.error(e) }
  };

  const eliminar = async (miembroId) => {
    if(!confirm('Eliminar miembro?')) return;
    try{ await groupsService.eliminarMiembro(id, miembroId); cargar(); }catch(e){console.error(e)}
  };

  return (
    <div>
      <h2>Miembros del grupo</h2>
      <form onSubmit={agregar} style={{marginBottom:12}}>
        <input placeholder="Nombre" required value={nuevo.nombre} onChange={e=>setNuevo(n=>({...n,nombre:e.target.value}))} />
        <input placeholder="Correo" value={nuevo.correo} onChange={e=>setNuevo(n=>({...n,correo:e.target.value}))} />
        <button type="submit">Agregar</button>
      </form>

      {loading ? <div>Cargando...</div> : (
        <ul>
          {miembros.map(m => (
            <li key={m.id || m._id}>
              {m.nombre || m.name} {m.correo || m.email}
              {' '}
              <button onClick={() => eliminar(m.id || m._id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
