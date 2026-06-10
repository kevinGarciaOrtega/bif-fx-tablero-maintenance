export interface HorarioMercado {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  pips: number;
}

export interface UpdateHorarioMercadoDto {
  pips: number;
  horaInicio: string;
  horaFin: string;
}

export interface Feriado {
  codFeriado: number;
  fecha: string;
  fechaFormateada: string;
}

export interface CreateFeriadoDto {
  fecha: string;
}
