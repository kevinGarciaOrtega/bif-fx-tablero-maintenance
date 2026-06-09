export interface Volatilidad {
  codCliente: number;
  nombre: string;
  pips: number;
  estadoActual: boolean;
}

export interface UpdateVolatilidadDto {
  pips: number;
  estadoActual: boolean;
}
