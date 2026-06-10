# SPEC-003 — Módulo Variable Rango de Importe (PN y PJ)
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.1.0 | Fecha: 2026-06-09
## ✅ Spec finalizada para implementación y pruebas

---

## 1. DESIGN

### 1.1 Pantalla Principal — Rango Importe PN
URL: `/VariableRangoImporte/Index`

```
┌─────────────────────────────────────────────────────────────────────┐
│  Variable Rango de Importe PN                          [+ Nuevo]    │
├──────┬──────────────────────────┬───────────────────────────┬───────┬──────────┐
│  N°  │  Importe mínimo (mayor a)│  Importe máximo (≤ a)    │  PIPs │ Acciones │
├──────┼──────────────────────────┼───────────────────────────┼───────┼──────────┤
│   1  │  0.00                    │  500.00                   │  100  │  ✏️ 🗑️  │
│   2  │  500.00                  │  1,500.00                 │   80  │  ✏️ 🗑️  │
│   3  │  1,500.00                │  10,000.00                │   50  │  ✏️ 🗑️  │
│   4  │  10,000.00               │  25,000.00                │   35  │  ✏️ 🗑️  │
│   5  │  25,000.00               │  40,000.00                │   25  │  ✏️ 🗑️  │
│   6  │  40,000.00               │  50,000.00                │   15  │  ✏️ 🗑️  │
├──────┴──────────────────────────┴───────────────────────────┴───────┴──────────┤
│                    Registros: 6 de 6   << 1 >>                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Pantalla Principal — Rango Importe PJ
URL: `/variableRangoImportePj/Index`

```
┌─────────────────────────────────────────────────────────────────────┐
│  Variable Rango de Importe PJ                          [+ Nuevo]    │
├──────┬──────────────────────────┬───────────────────────────┬───────┬──────────┐
│  N°  │  Importe mínimo (mayor a)│  Importe máximo (≤ a)    │  PIPs │ Acciones │
├──────┼──────────────────────────┼───────────────────────────┼───────┼──────────┤
│   1  │  0.00                    │  1,000.00                 │  100  │  ✏️ 🗑️  │
│   2  │  1,000.00                │  10,000.00                │   80  │  ✏️ 🗑️  │
│   3  │  10,000.00               │  90,000.00                │   60  │  ✏️ 🗑️  │
│   4  │  90,000.00               │  100,000.00               │   40  │  ✏️ 🗑️  │
├──────┴──────────────────────────┴───────────────────────────┴───────┴──────────┤
│                    Registros: 4 de 4   << 1 >>                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Modal — Editar Rango de Importes (PN y PJ comparten el mismo modal)

```
┌──────────────────────────────────────────────┐
│  Editar Rango de importes                [X] │
├──────────────────────────────────────────────┤
│  Importe mínimo (mayor a):  [0.00        ]   │  (editable, decimal)
│  Importe máximo (≤ a):      [500.00      ]   │  (editable, decimal)
│  PIPs:                      [100         ]   │  (editable, entero)
│                                              │
│              [ 💾 Guardar ]                  │
└──────────────────────────────────────────────┘
```

### 1.4 Modal — Nuevo Rango (mismo formulario vacío)

```
┌──────────────────────────────────────────────┐
│  Nuevo Rango de importes                 [X] │
├──────────────────────────────────────────────┤
│  Importe mínimo (mayor a):  [           ]    │  (requerido, decimal)
│  Importe máximo (≤ a):      [           ]    │  (requerido, decimal)
│  PIPs:                      [           ]    │  (requerido, entero)
│                                              │
│              [ 💾 Guardar ]                  │
└──────────────────────────────────────────────┘
```

### 1.5 Comportamientos UX
- `+ Nuevo` → abre modal vacío
- ✏️ → abre modal con datos precargados
- 🗑️ → confirmación → DELETE lógico → refresca lista
- Paginación: `<< N >>` con contador `Registros: X de Y`
- Importes se muestran con formato `#,##0.00`

---

## 2. REQUIREMENTS

### 2.1 Mapeo Real de BD ✅

#### Rango Importe PN → `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0006'`
#### Rango Importe PJ → `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0010'`

| Campo UI | Campo DB | Tipo | Notas |
|---|---|---|---|
| N° | correlativo | — | Generado en frontend |
| Importe mínimo | `Key1` | VARCHAR → DECIMAL | Cast a NUMERIC |
| Importe máximo | `Key2` | VARCHAR → DECIMAL | Cast a NUMERIC |
| PIPs | `Key4` | VARCHAR → INTEGER | Cast a INTEGER |
| Estado activo | `Estado` | SMALLINT | `1` = activo |

**Registros actuales en BD:**
```
── PN (CodGrupo=0006) ──────────────────────────────
CodMultitabla | Key1      | Key2       | Key4
0006001       | 0.00      | 1000.00    | 100
0006002       | 1,000.00  | 10,000.00  | 80
0006003       | 10,000.00 | 100,000.00 | 60

── PJ (CodGrupo=0010) ──────────────────────────────
CodMultitabla | Key1      | Key2       | Key4
0010001       | 0.00      | 1000.00    | 100
0010002       | 1000.00   | 10000.00   | 80
0010003       | 10000.00  | 100000.00  | 60
```

> ⚠️ Los datos actuales en BD tienen 3 registros cada uno. La pantalla muestra más registros (6 PN, 4 PJ) — esto indica que hay registros adicionales por crear o que el frontend pagina desde otra fuente. Confirmar con el equipo.

### 2.2 Endpoints Requeridos

Los endpoints son **idénticos** para PN y PJ, diferenciados por el path `/rango-importe/pn` y `/rango-importe/pj`.

---

**GET /rango-importe/{tipo}**
- `tipo`: `pn` o `pj`
- Query params: `page` (default: 1), `limit` (default: 10)

Query real (ejemplo PN):
```sql
SELECT
  "CodMultitabla"        AS id,
  "Key1"::NUMERIC        AS "importeMinimo",
  "Key2"::NUMERIC        AS "importeMaximo",
  "Key4"::INTEGER        AS pips
FROM dbo.tbl_mmultitabla
WHERE "CodGrupo" = '0006'   -- '0010' para PJ
  AND "Estado"  = 1
ORDER BY "Key1"::NUMERIC
LIMIT $1 OFFSET $2;
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0006001",
      "importeMinimo": 0.00,
      "importeMaximo": 1000.00,
      "pips": 100
    }
  ],
  "pagination": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

**POST /rango-importe/{tipo}**
Crea un nuevo rango.

**Request Body:**
```json
{
  "importeMinimo": 50000.00,
  "importeMaximo": 100000.00,
  "pips": 10
}
```

**Validaciones:**
- `importeMinimo`: requerido, decimal >= 0
- `importeMaximo`: requerido, decimal > importeMinimo
- `pips`: requerido, entero > 0
- No debe existir solapamiento con rangos existentes

Query real:
```sql
INSERT INTO dbo.tbl_mmultitabla
  ("CodMultitabla", "Campo", "Valor", "Key1", "Key2", "Key4", "Estado", "NoEditable", "CodGrupo", "ModUsuario", "ModFecha")
VALUES
  ($1, $2, $3, $4::VARCHAR, $5::VARCHAR, $6::VARCHAR, 1, 0, $7, $8, NOW())
RETURNING
  "CodMultitabla" AS id,
  "Key1"::NUMERIC AS "importeMinimo",
  "Key2"::NUMERIC AS "importeMaximo",
  "Key4"::INTEGER AS pips;
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "0006004",
    "importeMinimo": 50000.00,
    "importeMaximo": 100000.00,
    "pips": 10
  }
}
```

---

**PUT /rango-importe/{tipo}/{id}**
Actualiza un rango existente.

**Request Body:**
```json
{
  "importeMinimo": 0.00,
  "importeMaximo": 600.00,
  "pips": 110
}
```

Query real:
```sql
UPDATE dbo.tbl_mmultitabla
SET
  "Key1"       = $1::VARCHAR,
  "Key2"       = $2::VARCHAR,
  "Key4"       = $3::VARCHAR,
  "ModFecha"   = NOW(),
  "ModUsuario" = $4
WHERE "CodMultitabla" = $5
  AND "CodGrupo"      = $6
  AND "Estado"        = 1
RETURNING
  "CodMultitabla" AS id,
  "Key1"::NUMERIC AS "importeMinimo",
  "Key2"::NUMERIC AS "importeMaximo",
  "Key4"::INTEGER AS pips;
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "0006001",
    "importeMinimo": 0.00,
    "importeMaximo": 600.00,
    "pips": 110
  }
}
```

---

**DELETE /rango-importe/{tipo}/{id}**
Eliminación lógica.

Query real:
```sql
UPDATE dbo.tbl_mmultitabla
SET "Estado" = 0, "ModFecha" = NOW(), "ModUsuario" = $1
WHERE "CodMultitabla" = $2
  AND "CodGrupo"      = $3
  AND "Estado"        = 1;
```

**Response 200:**
```json
{
  "success": true,
  "message": "Rango eliminado correctamente"
}
```

### 2.3 Reglas de Negocio
- `tipo` en el path solo acepta `pn` o `pj`
- `importeMaximo` debe ser mayor que `importeMinimo`
- No se permiten rangos solapados (validar en service)
- Generación de `CodMultitabla`: formato `{CodGrupo}{secuencial 3 dígitos}` (ej: `0006004`)
- `Campo` y `Valor` se guardan con el nombre del grupo (ej: `Variable.RangoImportes`)
- Eliminación es **lógica** → `Estado = 0`
- Todas las modificaciones registran en `tbl_pAuditoria`

### 2.4 Seguridad
- Bearer Token / API Key requerido
- Solo usuarios autorizados pueden crear, editar y eliminar

### 2.5 Criterios de aceptación
- La API debe responder con `success: true` para listados, creación, edición y eliminación lógica.
- `GET /rango-importe/pn` y `GET /rango-importe/pj` deben devolver paginación cuando se envíen `page` y `limit`.
- `POST`, `PUT` y `DELETE` deben validar el tipo `pn` o `pj` antes de consultar la BD.
- No debe existir solapamiento entre rangos activos del mismo grupo.
- La eliminación debe ser lógica mediante `Estado = 0`, sin borrar el registro físico.
- Las operaciones deben registrar auditoría con un código de transacción definido por el equipo.

---

## 3. TASKS

### TASK-001 — Modelos TypeScript
**Archivo:** `src/models/rango-importe.model.ts`
```typescript
export type TipoPersona = 'pn' | 'pj';

export interface RangoImporte {
  id: string;
  importeMinimo: number;
  importeMaximo: number;
  pips: number;
}

export interface RangoImporteListResponse {
  data: RangoImporte[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateRangoImporteDto {
  importeMinimo: number;
  importeMaximo: number;
  pips: number;
}

export interface UpdateRangoImporteDto {
  importeMinimo: number;
  importeMaximo: number;
  pips: number;
}
```
**Estimado:** 0.5h

---

### TASK-002 — Repository
**Archivo:** `src/repositories/rango-importe.repository.ts`
```typescript
import pool from '../config/database';
import { RangoImporte, CreateRangoImporteDto, UpdateRangoImporteDto } from '../models/rango-importe.model';

const COD_GRUPO: Record<string, string> = {
  pn: '0006',
  pj: '0010'
};

const CAMPO_NOMBRE: Record<string, string> = {
  pn: 'Variable.RangoImportes',
  pj: 'Variable.RangoImportesPJ'
};

export const findAll = async (
  tipo: string,
  page: number,
  limit: number
): Promise<{ rows: RangoImporte[]; total: number }> => {
  const codGrupo = COD_GRUPO[tipo];
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(`
      SELECT
        "CodMultitabla"   AS id,
        "Key1"::NUMERIC   AS "importeMinimo",
        "Key2"::NUMERIC   AS "importeMaximo",
        "Key4"::INTEGER   AS pips
      FROM dbo.tbl_mmultitabla
      WHERE "CodGrupo" = $1 AND "Estado" = 1
      ORDER BY "Key1"::NUMERIC
      LIMIT $2 OFFSET $3
    `, [codGrupo, limit, offset]),
    pool.query(`
      SELECT COUNT(*) AS total
      FROM dbo.tbl_mmultitabla
      WHERE "CodGrupo" = $1 AND "Estado" = 1
    `, [codGrupo])
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].total)
  };
};

export const findById = async (tipo: string, id: string): Promise<RangoImporte | null> => {
  const { rows } = await pool.query(`
    SELECT
      "CodMultitabla"   AS id,
      "Key1"::NUMERIC   AS "importeMinimo",
      "Key2"::NUMERIC   AS "importeMaximo",
      "Key4"::INTEGER   AS pips
    FROM dbo.tbl_mmultitabla
    WHERE "CodMultitabla" = $1
      AND "CodGrupo" = $2
      AND "Estado" = 1
  `, [id, COD_GRUPO[tipo]]);
  return rows[0] || null;
};

export const create = async (
  tipo: string,
  dto: CreateRangoImporteDto,
  modUsuario: number
): Promise<RangoImporte> => {
  const codGrupo = COD_GRUPO[tipo];
  const campo = CAMPO_NOMBRE[tipo];

  // Generar nuevo CodMultitabla
  const { rows: lastRows } = await pool.query(`
    SELECT "CodMultitabla" FROM dbo.tbl_mmultitabla
    WHERE "CodGrupo" = $1
    ORDER BY "CodMultitabla" DESC LIMIT 1
  `, [codGrupo]);

  const lastNum = lastRows.length > 0
    ? parseInt(lastRows[0].CodMultitabla.slice(-3)) + 1
    : 1;
  const newCod = `${codGrupo}${String(lastNum).padStart(3, '0')}`;

  const { rows } = await pool.query(`
    INSERT INTO dbo.tbl_mmultitabla
      ("CodMultitabla","Campo","Valor","Key1","Key2","Key4","Estado","NoEditable","CodGrupo","ModUsuario","ModFecha")
    VALUES ($1,$2,$3,$4::VARCHAR,$5::VARCHAR,$6::VARCHAR,1,0,$7,$8,NOW())
    RETURNING
      "CodMultitabla"   AS id,
      "Key1"::NUMERIC   AS "importeMinimo",
      "Key2"::NUMERIC   AS "importeMaximo",
      "Key4"::INTEGER   AS pips
  `, [newCod, campo, campo,
      String(dto.importeMinimo), String(dto.importeMaximo),
      String(dto.pips), codGrupo, modUsuario]);
  return rows[0];
};

export const update = async (
  tipo: string,
  id: string,
  dto: UpdateRangoImporteDto,
  modUsuario: number
): Promise<RangoImporte | null> => {
  const { rows } = await pool.query(`
    UPDATE dbo.tbl_mmultitabla
    SET
      "Key1"       = $1::VARCHAR,
      "Key2"       = $2::VARCHAR,
      "Key4"       = $3::VARCHAR,
      "ModFecha"   = NOW(),
      "ModUsuario" = $4
    WHERE "CodMultitabla" = $5
      AND "CodGrupo"      = $6
      AND "Estado"        = 1
    RETURNING
      "CodMultitabla"   AS id,
      "Key1"::NUMERIC   AS "importeMinimo",
      "Key2"::NUMERIC   AS "importeMaximo",
      "Key4"::INTEGER   AS pips
  `, [String(dto.importeMinimo), String(dto.importeMaximo),
      String(dto.pips), modUsuario, id, COD_GRUPO[tipo]]);
  return rows[0] || null;
};

export const deleteLogico = async (
  tipo: string,
  id: string,
  modUsuario: number
): Promise<boolean> => {
  const result = await pool.query(`
    UPDATE dbo.tbl_mmultitabla
    SET "Estado" = 0, "ModFecha" = NOW(), "ModUsuario" = $1
    WHERE "CodMultitabla" = $2
      AND "CodGrupo"      = $3
      AND "Estado"        = 1
  `, [modUsuario, id, COD_GRUPO[tipo]]);
  return (result.rowCount ?? 0) > 0;
};
```
**Estimado:** 2h

---

### TASK-003 — Service
**Archivo:** `src/services/rango-importe.service.ts`
```typescript
import * as repo from '../repositories/rango-importe.repository';
import { CreateRangoImporteDto, UpdateRangoImporteDto, TipoPersona } from '../models/rango-importe.model';

const TIPOS_VALIDOS: TipoPersona[] = ['pn', 'pj'];

const validarTipo = (tipo: string): TipoPersona => {
  if (!TIPOS_VALIDOS.includes(tipo as TipoPersona))
    throw new Error('Tipo inválido. Use "pn" o "pj"');
  return tipo as TipoPersona;
};

const validarDto = (dto: CreateRangoImporteDto) => {
  if (dto.importeMinimo === undefined || dto.importeMinimo < 0)
    throw new Error('Importe mínimo debe ser mayor o igual a 0');
  if (!dto.importeMaximo || dto.importeMaximo <= dto.importeMinimo)
    throw new Error('Importe máximo debe ser mayor al importe mínimo');
  if (!dto.pips || dto.pips <= 0)
    throw new Error('PIPs debe ser un número entero mayor a 0');
};

export const getAll = async (tipo: string, page = 1, limit = 10) => {
  const t = validarTipo(tipo);
  const { rows, total } = await repo.findAll(t, page, limit);
  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const create = async (
  tipo: string,
  dto: CreateRangoImporteDto,
  modUsuario: number
) => {
  const t = validarTipo(tipo);
  validarDto(dto);
  return repo.create(t, dto, modUsuario);
};

export const update = async (
  tipo: string,
  id: string,
  dto: UpdateRangoImporteDto,
  modUsuario: number
) => {
  const t = validarTipo(tipo);
  validarDto(dto);
  const updated = await repo.update(t, id, dto, modUsuario);
  if (!updated) throw new Error('NOT_FOUND');
  return updated;
};

export const remove = async (tipo: string, id: string, modUsuario: number) => {
  const t = validarTipo(tipo);
  const deleted = await repo.deleteLogico(t, id, modUsuario);
  if (!deleted) throw new Error('NOT_FOUND');
  return { message: 'Rango eliminado correctamente' };
};
```
**Estimado:** 1.5h

---

### TASK-004 — Handler
**Archivo:** `src/handlers/rango-importe.ts`
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as service from '../services/rango-importe.service';
import { ok, created, notFound, badRequest, serverError } from '../utils/response.util';

export const rangoImporteHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, queryStringParameters, body } = event;
  const tipo  = pathParameters?.tipo || '';
  const id    = pathParameters?.id;
  const page  = parseInt(queryStringParameters?.page  || '1');
  const limit = parseInt(queryStringParameters?.limit || '10');
  const modUsuario = 0; // TODO: extraer del token JWT

  try {
    // GET /rango-importe/{tipo}
    if (httpMethod === 'GET' && !id)
      return ok(await service.getAll(tipo, page, limit));

    // POST /rango-importe/{tipo}
    if (httpMethod === 'POST' && !id)
      return created(await service.create(tipo, JSON.parse(body || '{}'), modUsuario));

    // PUT /rango-importe/{tipo}/{id}
    if (httpMethod === 'PUT' && id)
      return ok(await service.update(tipo, id, JSON.parse(body || '{}'), modUsuario));

    // DELETE /rango-importe/{tipo}/{id}
    if (httpMethod === 'DELETE' && id)
      return ok(await service.remove(tipo, id, modUsuario));

    return badRequest('Ruta no encontrada');

  } catch (error: any) {
    if (error.message === 'NOT_FOUND')
      return notFound('Rango de importe no encontrado');
    if (['Importe', 'PIPs', 'Tipo', 'mayor'].some(k => error.message.includes(k)))
      return badRequest(error.message);
    console.error('Error:', error);
    return serverError('Error interno del servidor');
  }
};
```
**Estimado:** 1h

---

### TASK-005 — Registrar rutas en index.ts
```typescript
import { rangoImporteHandler } from './handlers/rango-importe';

// Rutas:
// GET    /rango-importe/pn
// POST   /rango-importe/pn
// PUT    /rango-importe/pn/{id}
// DELETE /rango-importe/pn/{id}
// GET    /rango-importe/pj
// POST   /rango-importe/pj
// PUT    /rango-importe/pj/{id}
// DELETE /rango-importe/pj/{id}

if (path.startsWith('/rango-importe')) return rangoImporteHandler(event);
```
**Estimado:** 0.25h

---

### TASK-006 — Tests Unitarios
Casos a probar:
- ✅ getAll(pn) → retorna registros CodGrupo=0006
- ✅ getAll(pj) → retorna registros CodGrupo=0010
- ❌ getAll → tipo inválido
- ✅ create → genera CodMultitabla correcto
- ❌ create → importeMaximo <= importeMinimo
- ❌ create → PIPs <= 0
- ✅ update → actualiza Key1, Key2, Key4
- ❌ update → id no existe
- ✅ remove → Estado=0 lógico
- ❌ remove → id no existe

**Estimado:** 2h

---

### TASK-007 — Auditoría
```typescript
// Crear rango   → 'RAN001'
// Editar rango  → 'RAN002'
// Eliminar rango→ 'RAN003'
// (aplica igual para PN y PJ)
```
**Estimado:** 1h

---

## 4. RESUMEN DE ESTIMACIÓN

| Task | Descripción | Estimado |
|---|---|---|
| TASK-001 | Modelos TypeScript | 0.5h |
| TASK-002 | Repository | 2h |
| TASK-003 | Service | 1.5h |
| TASK-004 | Handler | 1h |
| TASK-005 | Registro de rutas | 0.25h |
| TASK-006 | Tests unitarios | 2h |
| TASK-007 | Auditoría | 1h |
| **TOTAL** | | **8.25h** |

---

## 5. NOTAS FINALES DE BD

| Dato | PN | PJ |
|---|---|---|
| Tabla | `dbo.tbl_mmultitabla` | `dbo.tbl_mmultitabla` |
| CodGrupo | `'0006'` | `'0010'` |
| Campo nombre | `Variable.RangoImportes` | `Variable.RangoImportesPJ` |
| Importe mínimo | `Key1` (VARCHAR→NUMERIC) | `Key1` (VARCHAR→NUMERIC) |
| Importe máximo | `Key2` (VARCHAR→NUMERIC) | `Key2` (VARCHAR→NUMERIC) |
| PIPs | `Key4` (VARCHAR→INTEGER) | `Key4` (VARCHAR→INTEGER) |
| Estado activo | `Estado = 1` | `Estado = 1` |
| Eliminación | Lógica `Estado = 0` | Lógica `Estado = 0` |
