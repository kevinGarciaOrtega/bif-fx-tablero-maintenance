export interface Volatilidad {
  id: string;
  nombre: string;
  pips: number;
  estadoActual: boolean;
}

export interface UpdateVolatilidadDto {
  pips: number;
  estadoActual: boolean;
}
