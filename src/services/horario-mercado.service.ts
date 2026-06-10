import * as horarioRepo from '../repositories/horario-mercado.repository';
import * as feriadoRepo from '../repositories/feriado.repository';
import { CreateFeriadoDto, UpdateHorarioMercadoDto } from '../models/horario-mercado.model';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const getAllHorarios = () => horarioRepo.findAllHorarios();

export const updateHorario = async (
  id: string,
  dto: UpdateHorarioMercadoDto,
  modUsuario: number
) => {
  if (!Number.isInteger(dto.pips) || dto.pips <= 0) {
    throw new Error('PIPs debe ser un número entero mayor a 0');
  }

  if (!TIME_REGEX.test(dto.horaInicio)) {
    throw new Error('Horario Apertura debe tener formato HH:MM');
  }

  if (!TIME_REGEX.test(dto.horaFin)) {
    throw new Error('Horario Cierre debe tener formato HH:MM');
  }

  const updated = await horarioRepo.updateHorario(id, dto, modUsuario);
  if (!updated) {
    throw new Error('NOT_FOUND');
  }

  return updated;
};

export const getFeriadosByAnio = (anio: number) => feriadoRepo.findByAnio(anio);

export const createFeriado = async (dto: CreateFeriadoDto, regUsuario: number) => {
  if (!dto.fecha) {
    throw new Error('La fecha es requerida');
  }

  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_REGEX.test(dto.fecha)) {
    throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
  }

  const existe = await feriadoRepo.existsByFecha(dto.fecha);
  if (existe) {
    throw new Error(`Ya existe un feriado registrado para la fecha ${dto.fecha}`);
  }

  return feriadoRepo.create(dto.fecha, regUsuario);
};

export const deleteFeriado = async (codFeriado: number) => {
  const deleted = await feriadoRepo.deleteLogico(codFeriado);
  if (!deleted) {
    throw new Error('NOT_FOUND');
  }

  return { message: 'Feriado eliminado correctamente' };
};
