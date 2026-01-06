// types/juegos.types.ts
export interface Juego {
  id: string | number;
  nombre: string;
  tipo_juego: "respiracion" | "puzzle" | "memoria" | "mandala" | "mindfulness";
  descripcion?: string;
  duracion_estimada?: number;
  icono?: string;
  color?: string;
  nivel_dificultad?: "facil" | "medio" | "dificil";
}

export interface JuegoProps {
  juego: Juego;
  onFinish: (puntuacion?: number, completado?: boolean) => void;
  onExit: () => void;
}

export interface SesionJuego {
  id?: string;
  juego_id: string | number;
  usuario_id?: string | number;
  estado_antes?: string;
  estado_despues?: string;
  duracion_segundos: number;
  puntuacion?: number;
  completado: boolean;
  fecha_inicio: Date;
  fecha_fin?: Date;
}

export interface EstadisticasJuego {
  juego_id: string | number;
  veces_jugado: number;
  tiempo_total: number;
  mejor_puntuacion?: number;
  promedio_puntuacion?: number;
  ultima_vez_jugado?: Date;
}