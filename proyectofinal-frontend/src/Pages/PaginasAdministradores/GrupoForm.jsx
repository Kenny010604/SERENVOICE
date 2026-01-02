import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import groupsService from '../../services/groupsService';
import { FaUserFriends, FaSave, FaArrowLeft } from 'react-icons/fa';
import "../../styles/StylesAdmin/AdminPages.css";

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
    <div className="admin-grupo-form-page">
      <div className="admin-page-content">
        {/* Header */}
        <div className="admin-page-header">
          <h2><FaUserFriends /> {id && id !== 'nuevo' ? 'Editar Grupo' : 'Crear Grupo'}</h2>
          <div className="admin-header-actions">
            <button onClick={() => navigate('/admin/grupos')} className="admin-btn admin-btn-secondary">
              <FaArrowLeft /> <span className="admin-hidden-mobile">Volver</span>
            </button>
          </div>
        </div>

        <div className="admin-card" style={{ maxWidth: "600px" }}>
          <div className="admin-card-body">
            <form onSubmit={submit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre del Grupo *</label>
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
                <label className="admin-form-label">Descripción</label>
                <textarea 
                  className="admin-form-input"
                  name="descripcion" 
                  value={form.descripcion} 
                  onChange={handleChange}
                  placeholder="Describa el propósito del grupo"
                  rows={4}
                />
              </div>
              <div className="admin-form-row" style={{ gap: "1rem", marginTop: "1.5rem" }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => navigate('/admin/grupos')}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
