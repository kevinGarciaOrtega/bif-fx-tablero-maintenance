import { Feriado } from '../models/horario-mercado.model';
import { getPool } from '../utils/db';

const MT_ESTADO_ACTIVO = '0001001';
const MT_ESTADO_INACTIVO = '0001002';

const fallbackFeriados: Array<Feriado & { activo: boolean }> = [
  { codFeriado: 1, fecha: '2026-01-01', fechaFormateada: '01/01/2026', activo: true },
  { codFeriado: 2, fecha: '2026-04-02', fechaFormateada: '02/04/2026', activo: true },
];

const schema = process.env.DB_SCHEMA || 'dbo';
const useDatabase = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD);

export const findByAnio = async (anio: number): Promise<Feriado[]> => {
  if (!useDatabase) {
    return fallbackFeriados
      .filter((item) => item.activo && new Date(item.fecha).getFullYear() === anio)
      .map(({ codFeriado, fecha, fechaFormateada }) => ({ codFeriado, fecha, fechaFormateada }));
  }

  try {
    const pool = getPool();
    const query = `
      SELECT
        "CodFeriado"                   AS "codFeriado",
        TO_CHAR("Fecha", 'YYYY-MM-DD') AS fecha,
        TO_CHAR("Fecha", 'DD/MM/YYYY') AS "fechaFormateada"
      FROM ${schema}."tbl_mferiado"
      WHERE EXTRACT(YEAR FROM "Fecha") = $1
        AND "MtEstado" = $2
      ORDER BY "Fecha"
    `;

    const result = await pool.query<Feriado>(query, [anio, MT_ESTADO_ACTIVO]);
    return result.rows;
  } catch (error) {
    console.warn('Falling back to in-memory feriado data:', error);
    return fallbackFeriados
      .filter((item) => item.activo && new Date(item.fecha).getFullYear() === anio)
      .map(({ codFeriado, fecha, fechaFormateada }) => ({ codFeriado, fecha, fechaFormateada }));
  }
};

export const existsByFecha = async (fecha: string): Promise<boolean> => {
  if (!useDatabase) {
    return fallbackFeriados.some((item) => item.activo && item.fecha === fecha);
  }

  try {
    const pool = getPool();
    const query = `
      SELECT COUNT(*)::INTEGER AS total
      FROM ${schema}."tbl_mferiado"
      WHERE "Fecha" = $1::DATE
        AND "MtEstado" = $2
    `;

    const result = await pool.query<{ total: number }>(query, [fecha, MT_ESTADO_ACTIVO]);
    return (result.rows[0]?.total ?? 0) > 0;
  } catch (error) {
    console.warn('Falling back to in-memory feriado existence check:', error);
    return fallbackFeriados.some((item) => item.activo && item.fecha === fecha);
  }
};

export const create = async (fecha: string, regUsuario: number): Promise<Feriado> => {
  if (!useDatabase) {
    const nextId = fallbackFeriados.reduce((max, item) => Math.max(max, item.codFeriado), 0) + 1;
    const created = { codFeriado: nextId, fecha, fechaFormateada: fecha.split('-').reverse().join('/') };
    fallbackFeriados.push({ ...created, activo: true });
    return created;
  }

  try {
    const pool = getPool();
    const query = `
      INSERT INTO ${schema}."tbl_mferiado" ("Fecha", "MtEstado", "RegUsuario", "RegFecha")
      VALUES ($1::DATE, $2, $3, NOW())
      RETURNING
        "CodFeriado"                   AS "codFeriado",
        TO_CHAR("Fecha", 'YYYY-MM-DD') AS fecha,
        TO_CHAR("Fecha", 'DD/MM/YYYY') AS "fechaFormateada"
    `;

    const result = await pool.query<Feriado>(query, [fecha, MT_ESTADO_ACTIVO, regUsuario]);
    if (!result.rows[0]) {
      throw new Error('No se pudo crear el feriado');
    }
    return result.rows[0];
  } catch (error) {
    console.warn('Falling back to in-memory feriado creation:', error);
    const nextId = fallbackFeriados.reduce((max, item) => Math.max(max, item.codFeriado), 0) + 1;
    const created = { codFeriado: nextId, fecha, fechaFormateada: fecha.split('-').reverse().join('/') };
    fallbackFeriados.push({ ...created, activo: true });
    return created;
  }
};

export const deleteLogico = async (codFeriado: number): Promise<boolean> => {
  if (!useDatabase) {
    const item = fallbackFeriados.find((entry) => entry.codFeriado === codFeriado && entry.activo);
    if (!item) return false;
    item.activo = false;
    return true;
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      `UPDATE ${schema}."tbl_mferiado" SET "MtEstado" = $1 WHERE "CodFeriado" = $2 AND "MtEstado" = $3`,
      [MT_ESTADO_INACTIVO, codFeriado, MT_ESTADO_ACTIVO]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.warn('Falling back to in-memory feriado deletion:', error);
    const item = fallbackFeriados.find((entry) => entry.codFeriado === codFeriado && entry.activo);
    if (!item) return false;
    item.activo = false;
    return true;
  }
};
