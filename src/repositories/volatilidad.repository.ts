import { UpdateVolatilidadDto, Volatilidad } from '../models/volatilidad.model';

const volatilidades: Volatilidad[] = [
  { codCliente: 1, nombre: 'Volatilidad Activa', pips: 100, estadoActual: false },
  { codCliente: 2, nombre: 'Volatilidad Inactiva', pips: 200, estadoActual: true },
];

export const findAll = async (): Promise<Volatilidad[]> => {
  return [...volatilidades];
};

export const updateById = async (
  id: number,
  dto: UpdateVolatilidadDto
): Promise<Volatilidad | null> => {
  const index = volatilidades.findIndex((item) => item.codCliente === id);

  if (index === -1) {
    return null;
  }

  const current = volatilidades[index];

  if (!current) {
    return null;
  }

  const updated: Volatilidad = {
    ...current,
    pips: dto.pips,
    estadoActual: dto.estadoActual,
  };

  volatilidades[index] = updated;

  return updated;
};
