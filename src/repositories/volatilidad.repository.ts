import { getPool } from '../utils/db';
import { UpdateVolatilidadDto, Volatilidad } from '../models/volatilidad.model';

const SCHEMA = process.env.DB_SCHEMA || 'dbo';
const TABLE = `${SCHEMA}.tbl_mmultitabla`;
const COD_GRUPO = '0004';

const mapRow = (row: Record<string, unknown>): Volatilidad => ({
  id: String(row['CodMultitabla']),
  nombre: String(row['Valor']),
  estadoActual: String(row['Key1']) === '1',
  pips: parseInt(String(row['Key4']), 10),
});

export const findAll = async (): Promise<Volatilidad[]> => {
  const pool = getPool();
  const result = await pool.query(
    `SELECT "CodMultitabla", "Valor", "Key1", "Key4"
     FROM ${TABLE}
     WHERE "CodGrupo" = $1
     ORDER BY "CodMultitabla"`,
    [COD_GRUPO]
  );
  return result.rows.map(mapRow);
};

export const updateById = async (
  id: string,
  dto: UpdateVolatilidadDto
): Promise<Volatilidad | null> => {
  const pool = getPool();

  // Buscar el registro por CodMultitabla completo o por sufijo numérico
  const codMultitabla = id.startsWith(COD_GRUPO)
    ? id
    : `${COD_GRUPO}${id.padStart(3, '0')}`;

  const existing = await pool.query(
    `SELECT "CodMultitabla", "Valor", "Key1", "Key4"
     FROM ${TABLE}
     WHERE "CodGrupo" = $1 AND "CodMultitabla" = $2`,
    [COD_GRUPO, codMultitabla]
  );

  if (existing.rows.length === 0) {
    return null;
  }

  await pool.query(
    `UPDATE ${TABLE}
     SET "Key1"     = $1,
         "Key4"     = $2,
         "ModFecha" = NOW()
     WHERE "CodGrupo" = $3 AND "CodMultitabla" = $4`,
    [dto.estadoActual ? '1' : '0', String(dto.pips), COD_GRUPO, codMultitabla]
  );

  return {
    ...mapRow(existing.rows[0]),
    pips: dto.pips,
    estadoActual: dto.estadoActual,
  };
};
