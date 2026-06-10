import { HorarioMercado, UpdateHorarioMercadoDto } from '../models/horario-mercado.model';
import { getPool } from '../utils/db';

const fallbackHorarios: HorarioMercado[] = [
  { id: '0005001', nombre: 'Horario de mercado abierto', horaInicio: '09:00', horaFin: '13:30', pips: 100 },
  { id: '0005002', nombre: 'Horario de mercado cerrado', horaInicio: '13:31', horaFin: '08:59', pips: 200 },
];

const schema = process.env.DB_SCHEMA || 'dbo';
const useDatabase = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD);

export const findAllHorarios = async (): Promise<HorarioMercado[]> => {
  if (!useDatabase) {
    return [...fallbackHorarios];
  }

  try {
    const pool = getPool();
    const query = `
      SELECT
        "CodMultitabla" AS id,
        "Campo"         AS nombre,
        "Key1"          AS "horaInicio",
        "Key2"          AS "horaFin",
        "Key3"::INTEGER AS pips
      FROM ${schema}."tbl_mmultitabla"
      WHERE "CodGrupo" = '0005'
      ORDER BY "CodMultitabla"
    `;

    const result = await pool.query<HorarioMercado>(query);
    return result.rows;
  } catch (error) {
    console.warn('Falling back to in-memory horario data:', error);
    return [...fallbackHorarios];
  }
};

export const updateHorario = async (
  id: string,
  dto: UpdateHorarioMercadoDto,
  modUsuario: number
): Promise<HorarioMercado | null> => {
  if (!useDatabase) {
    const index = fallbackHorarios.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = fallbackHorarios[index];
    if (!current) return null;

    const updated: HorarioMercado = {
      ...current,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      pips: dto.pips,
    };

    fallbackHorarios[index] = updated;
    return updated;
  }

  try {
    const pool = getPool();
    const query = `
      UPDATE ${schema}."tbl_mmultitabla"
      SET
        "Key1"       = $1,
        "Key2"       = $2,
        "Key3"       = $3::VARCHAR,
        "ModFecha"   = NOW(),
        "ModUsuario" = $4
      WHERE "CodMultitabla" = $5
        AND "CodGrupo" = '0005'
      RETURNING
        "CodMultitabla" AS id,
        "Campo"         AS nombre,
        "Key1"          AS "horaInicio",
        "Key2"          AS "horaFin",
        "Key3"::INTEGER AS pips
    `;

    const result = await pool.query<HorarioMercado>(query, [dto.horaInicio, dto.horaFin, String(dto.pips), modUsuario, id]);
    return result.rows[0] ?? null;
  } catch (error) {
    console.warn('Falling back to in-memory horario update:', error);
    const index = fallbackHorarios.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = fallbackHorarios[index];
    if (!current) return null;

    const updated: HorarioMercado = {
      ...current,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      pips: dto.pips,
    };

    fallbackHorarios[index] = updated;
    return updated;
  }
};
