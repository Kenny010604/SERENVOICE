import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import groupsService from '../../services/groupsService';

export default function GrupoForm(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre:'', descripcion:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && id !== 'nuevo'){
      (async ()=>{
        try{
          const data = await groupsService.obtener(id);
          setForm({ nombre: data.nombre || data.name || '', descripcion: data.descripcion || data.description || '' });
        }catch(e){console.error(e)}
      })();
    }
  }, [id]);

  const handleChange = (e) => setForm(f=>({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try{
      if (id && id !== 'nuevo') await groupsService.actualizar(id, form);
      else await groupsService.crear(form);
      navigate('/admin/grupos');
    }catch(e){console.error(e)}
    finally{setLoading(false)}
  };

  return (
    <div>
      <h2>{id && id !== 'nuevo' ? 'Editar Grupo' : 'Crear Grupo'}</h2>
      <form onSubmit={submit}>
        <div>
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div>
          <label>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" onClick={() => navigate('/admin/grupos')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
