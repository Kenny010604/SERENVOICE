import React, { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import groupsService from '../../../constants/groupsService';

// Definir el tipo de las actividades
interface Actividad {
  id?: string;  // El id es opcional para la creación de actividades
  titulo: string;
  descripcion: string;
}

export default function ActividadesGrupo() {
  const { id } = useParams<{ id: string }>(); // Definir el tipo del parámetro 'id' en la URL
  const [actividades, setActividades] = useState<Actividad[]>([]); // Tipo para el estado de actividades
  const [nuevo, setNuevo] = useState<{ titulo: string; descripcion: string }>({ titulo: '', descripcion: '' });
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga, tipo booleano

  // Función para cargar las actividades
  const cargar = async () => {
    if (!id) return; // Asegurarse de que id no sea undefined
    try {
      const data = await groupsService.listarActividades(id);
      setActividades(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  // Función para crear una nueva actividad
  const crear = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Solo pasar titulo y descripcion al crear la actividad
      await groupsService.crearActividad(id!, {
          titulo: nuevo.titulo, descripcion: nuevo.descripcion,
          id: ''
      });
      setNuevo({ titulo: '', descripcion: '' });
      cargar();
    } catch (e) {
      console.error(e);
    }
  };

  // Función para eliminar una actividad
  const eliminar = async (actividadId: string) => {
    if (!confirm('Eliminar actividad?')) return;
    try {
      await groupsService.eliminarActividad(id!, actividadId);
      cargar();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2>Actividades del grupo</h2>
      <form onSubmit={crear} style={{ marginBottom: 12 }}>
        <input
          placeholder="Título"
          required
          value={nuevo.titulo}
          onChange={e => setNuevo(n => ({ ...n, titulo: e.target.value }))}
        />
        <input
          placeholder="Descripción"
          value={nuevo.descripcion}
          onChange={e => setNuevo(n => ({ ...n, descripcion: e.target.value }))}
        />
        <button type="submit">Crear</button>
      </form>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <ul>
          {actividades.map(a => (
            <li key={a.id}>
              <strong>{a.titulo}</strong> - {a.descripcion}{' '}
              <button onClick={() => eliminar(a.id!)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
