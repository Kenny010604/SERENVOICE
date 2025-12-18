import React, { useEffect, useState } from 'react';
import groupsService from '../../services/groupsService';
import { Link, useNavigate } from 'react-router-dom';

export default function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await groupsService.listar();
      setGrupos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!confirm('Eliminar grupo?')) return;
    try {
      await groupsService.eliminar(id);
      cargar();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <h2>Grupos</h2>
      <div style={{marginBottom:12}}>
        <button onClick={() => navigate('/admin/grupos/nuevo')}>Crear Grupo</button>
      </div>

      {loading ? <div>Cargando...</div> : (
        <table style={{width:'100%'}}>
          <thead>
            <tr><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {grupos.map(g => (
              <tr key={g.id || g._id}>
                <td>{g.nombre || g.name}</td>
                <td>{g.descripcion || g.description}</td>
                <td>
                  <Link to={`/admin/grupos/${g.id || g._id}`}>Ver / Editar</Link>
                  {' | '}
                  <Link to={`/admin/grupos/${g.id || g._id}/miembros`}>Miembros</Link>
                  {' | '}
                  <Link to={`/admin/grupos/${g.id || g._id}/actividades`}>Actividades</Link>
                  {' | '}
                  <button onClick={() => eliminar(g.id || g._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
