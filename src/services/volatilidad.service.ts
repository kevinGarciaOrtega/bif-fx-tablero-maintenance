import * as repo from '../repositories/volatilidad.repository';
import { UpdateVolatilidadDto } from '../models/volatilidad.model';

export const getAll = async () => {
  return await repo.findAll();
};

export const update = async (id: string, dto: UpdateVolatilidadDto) => {
  if (!Number.isInteger(dto.pips) || dto.pips <= 0) {
    throw new Error('PIPs debe ser un número entero mayor a 0');
  }

  if (typeof dto.estadoActual !== 'boolean') {
    throw new Error('Estado actual debe ser verdadero o falso');
  }

  const updated = await repo.updateById(id, dto);

  if (!updated) {
    throw new Error('NOT_FOUND');
  }

  return updated;
};
