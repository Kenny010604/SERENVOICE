// Definir tipos de las actividades
export interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
}

const groupsService = {
  listarActividades: async (id: string): Promise<Actividad[]> => {
    // Lógica de la API para listar actividades, por ejemplo:
    return [{ id: '1', titulo: 'Actividad 1', descripcion: 'Descripción de actividad 1' }];
  },
  crearActividad: async (id: string, actividad: Actividad): Promise<void> => {
    // Lógica de la API para crear una actividad
    console.log('Actividad creada:', actividad);
  },
  eliminarActividad: async (id: string, actividadId: string): Promise<void> => {
    // Lógica de la API para eliminar una actividad
    console.log('Actividad eliminada:', actividadId);
  }
};

export default groupsService;
