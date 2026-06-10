# SPEC-004 — Módulo Variable Segmento
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.0.0 | Fecha: 2026-06-09
## ✅ Mapeo real de BD confirmado

---

## 1. DESIGN

### 1.1 Pantalla Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Variable Segmento                                                   │
│                                                                      │
│  ── Criterios de Búsqueda ─────────────────────────────────────── │
│  Descripción: [                              ]                       │
│               [🔍 Buscar]  [✏️ Limpiar]                             │
│                                                                      │
│  ── Resultados de la Búsqueda ──────────────────────── [+ Nuevo]   │
│  ┌─────┬──────────────────┬───────────────────────────┬──────┬──────────┐
│  │ N°  │ Código de banca  │ Descripción banca         │ PIPs │Acciones  │
│  ├─────┼──────────────────┼───────────────────────────┼──────┼──────────┤
│  │  1  │ 0001             │ DIVISION DE NEGOCIOS      │ 100  │  ✏️ 🗑️  │
│  │  2  │ 0002             │ BANCA PREMIUM             │ 150  │  ✏️ 🗑️  │
│  │  3  │ 0003             │ RECURSOS HUMANOS          │ 200  │  ✏️ 🗑️  │
│  │  4  │ 0004             │ BANCA CORPORATIVA         │ 300  │  ✏️ 🗑️  │
│  │  5  │ 0005             │ BANCA COMERCIAL ZONA 1    │ 200  │  ✏️ 🗑️  │
│  │ ... │ ...              │ ...                       │ ...  │  ✏️ 🗑️  │
│  └─────┴──────────────────┴───────────────────────────┴──────┴──────────┘
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Modal — Nuevo Segmento

```
┌──────────────────────────────────────────────┐
│  Nuevo Segmento                          [X] │
├──────────────────────────────────────────────┤
│  Código banca:      [              ]  *      │
│                     Debe ingresar codigo     │
│                     de banca                 │
│  Descripción banca: [              ]  *      │
│                     Debe ingresar            │
│                     descripción banca        │
│  PIPs:              [              ]  *      │
│                     Debe indicar los PIPs    │
│                                              │
│              [ 💾 Guardar ]                  │
└──────────────────────────────────────────────┘
```

### 1.3 Modal — Editar Segmento

```
┌──────────────────────────────────────────────┐
│  Editar Segmento                         [X] │
├──────────────────────────────────────────────┤
│  Código banca:      [0001          ]  *      │  (readonly en edición)
│  Descripción banca: [DIVISION DE   ]  *      │  (readonly en edición)
│                      NEGOCIOS      ]         │
│  PIPs:              [100           ]  *      │  (editable)
│                                              │
│              [ 💾 Guardar ]                  │
└──────────────────────────────────────────────┘
```

### 1.4 Comportamientos UX
- Campo **Descripción** en criterios de búsqueda → filtra por descripción de banca
- `Buscar` → llama al endpoint con filtro
- `Limpiar` → limpia el campo y recarga la lista completa
- `+ Nuevo` → abre modal vacío con validaciones
- ✏️ → abre modal con datos precargados (código y descripción readonly)
- 🗑️ → confirmación → DELETE lógico → refresca lista
- Mensajes de validación en rojo bajo cada campo requerido

---

## 2. REQUIREMENTS

### 2.1 Mapeo Real de BD ✅

#### Tabla principal: `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0007'`
#### Tabla relacionada: `dbo.tbl_mbancaibs` (JOIN por `Key1 = CodBanca`)

| Campo UI | Campo DB | Tabla | Notas |
|---|---|---|---|
| N° | correlativo | — | Generado en frontend |
| Código de banca | `Key1` | `tbl_mmultitabla` | Código de banca (ej: `0001`) |
| Descripción banca | `Banca` | `tbl_mbancaibs` | JOIN por `Key1 = "CodBanca"` |
| PIPs | `Key4` | `tbl_mmultitabla` | VARCHAR → INTEGER |
| Estado activo | `Estado` | `tbl_mmultitabla` | `1` = activo |

**Registros reales (muestra):**
```
CodMultitabla | Key1 | Key4 | CodGrupo
0007001       | 0001 | 100  | 0007
0007002       | 0002 | 150  | 0007
0007003       | 0003 | 200  | 0007
0007004       | 0004 | 300  | 0007
0007005       | 0005 | 400  | 0007
... (29 registros total)
```

### 2.2 Endpoints Requeridos

---

**GET /segmento?descripcion=&page=1&limit=10**

Query real:
```sql
SELECT
  m."CodMultitabla"   AS id,
  m."Key1"            AS "codigoBanca",
  b."Banca"           AS "descripcionBanca",
  m."Key4"::INTEGER   AS pips
FROM dbo.tbl_mmultitabla m
LEFT JOIN dbo.tbl_mbancaibs b ON m."Key1" = b."CodBanca"
WHERE m."CodGrupo" = '0007'
  AND m."Estado"   = 1
  AND ($1 = '' OR UPPER(b."Banca") LIKE UPPER('%' || $1 || '%'))
ORDER BY m."Key1"
LIMIT $2 OFFSET $3;
```

**Query params:**
- `descripcion`: texto libre para filtrar (opcional)
- `page`: número de página (default: 1)
- `limit`: registros por página (default: 10)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0007001",
      "codigoBanca": "0001",
      "descripcionBanca": "DIVISION DE NEGOCIOS",
      "pips": 100
    },
    {
      "id": "0007002",
      "codigoBanca": "0002",
      "descripcionBanca": "BANCA PREMIUM",
      "pips": 150
    }
  ],
  "pagination": {
    "total": 29,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

**POST /segmento**
Crea un nuevo segmento.

Query real:
```sql
-- 1. Verificar que el CodBanca existe en tbl_mbancaibs
SELECT "CodBanca", "Banca" FROM dbo.tbl_mbancaibs
WHERE "CodBanca" = $1;

-- 2. Verificar que no existe ya en tbl_mmultitabla con CodGrupo=0007
SELECT COUNT(*) FROM dbo.tbl_mmultitabla
WHERE "Key1" = $1 AND "CodGrupo" = '0007' AND "Estado" = 1;

-- 3. Insertar
INSERT INTO dbo.tbl_mmultitabla
  ("CodMultitabla","Campo","Valor","Key1","Key4","Estado","NoEditable","CodGrupo","ModUsuario","ModFecha")
VALUES
  ($1,'Variable.Segmento','Variable.Segmento',$2,$3::VARCHAR,1,0,'0007',$4,NOW())
RETURNING
  "CodMultitabla" AS id,
  "Key1"          AS "codigoBanca",
  "Key4"::INTEGER AS pips;
```

**Request Body:**
```json
{
  "codigoBanca": "0030",
  "descripcionBanca": "NUEVA BANCA",
  "pips": 120
}
```

**Validaciones:**
- `codigoBanca`: requerido, no vacío
- `descripcionBanca`: requerido, no vacío
- `pips`: requerido, entero > 0
- No debe existir otro segmento activo con el mismo `codigoBanca`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "0007030",
    "codigoBanca": "0030",
    "descripcionBanca": "NUEVA BANCA",
    "pips": 120
  }
}
```

**Response 400 (duplicado):**
```json
{
  "success": false,
  "message": "Ya existe un segmento con el código de banca 0030"
}
```

---

**PUT /segmento/{id}**
Solo actualiza PIPs (código y descripción son readonly en edición).

Query real:
```sql
UPDATE dbo.tbl_mmultitabla
SET
  "Key4"       = $1::VARCHAR,
  "ModFecha"   = NOW(),
  "ModUsuario" = $2
WHERE "CodMultitabla" = $3
  AND "CodGrupo"      = '0007'
  AND "Estado"        = 1
RETURNING
  "CodMultitabla"   AS id,
  "Key1"            AS "codigoBanca",
  "Key4"::INTEGER   AS pips;
```

**Request Body:**
```json
{
  "pips": 175
}
```

**Validaciones:**
- `pips`: requerido, entero > 0

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "0007001",
    "codigoBanca": "0001",
    "descripcionBanca": "DIVISION DE NEGOCIOS",
    "pips": 175
  }
}
```

---

**DELETE /segmento/{id}**
Eliminación lógica.

Query real:
```sql
UPDATE dbo.tbl_mmultitabla
SET "Estado" = 0, "ModFecha" = NOW(), "ModUsuario" = $1
WHERE "CodMultitabla" = $2
  AND "CodGrupo"      = '0007'
  AND "Estado"        = 1;
```

**Response 200:**
```json
{
  "success": true,
  "message": "Segmento eliminado correctamente"
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Segmento no encontrado"
}
```

### 2.3 Reglas de Negocio
- En **creación**: todos los campos son editables
- En **edición**: solo `PIPs` es editable; `codigoBanca` y `descripcionBanca` son readonly
- No se puede crear un segmento con un `codigoBanca` ya registrado y activo
- Búsqueda por descripción es **case insensitive** y parcial (LIKE)
- Eliminación es **lógica** (`Estado = 0`)
- Todas las modificaciones registran en `tbl_pAuditoria`

### 2.4 Seguridad
- Bearer Token / API Key requerido
- Solo usuarios autorizados pueden crear, editar y eliminar

---

## 3. TASKS

### TASK-001 — Modelos TypeScript
**Archivo:** `src/models/segmento.model.ts`
```typescript
export interface Segmento {
  id: string;
  codigoBanca: string;
  descripcionBanca: string;
  pips: number;
}

export interface SegmentoListResponse {
  data: Segmento[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSegmentoDto {
  codigoBanca: string;
  descripcionBanca: string;
  pips: number;
}

export interface UpdateSegmentoDto {
  pips: number;
}
```
**Estimado:** 0.5h

---

### TASK-002 — Repository
**Archivo:** `src/repositories/segmento.repository.ts`
```typescript
import pool from '../config/database';
import { Segmento, CreateSegmentoDto, UpdateSegmentoDto } from '../models/segmento.model';

const COD_GRUPO = '0007';

export const findAll = async (
  descripcion: string,
  page: number,
  limit: number
): Promise<{ rows: Segmento[]; total: number }> => {
  const offset = (page - 1) * limit;
  const filtro = descripcion || '';

  const [dataResult, countResult] = await Promise.all([
    pool.query(`
      SELECT
        m."CodMultitabla"   AS id,
        m."Key1"            AS "codigoBanca",
        b."Banca"           AS "descripcionBanca",
        m."Key4"::INTEGER   AS pips
      FROM dbo.tbl_mmultitabla m
      LEFT JOIN dbo.tbl_mbancaibs b ON m."Key1" = b."CodBanca"
      WHERE m."CodGrupo" = $1
        AND m."Estado"   = 1
        AND ($2 = '' OR UPPER(b."Banca") LIKE UPPER('%' || $2 || '%'))
      ORDER BY m."Key1"
      LIMIT $3 OFFSET $4
    `, [COD_GRUPO, filtro, limit, offset]),
    pool.query(`
      SELECT COUNT(*) AS total
      FROM dbo.tbl_mmultitabla m
      LEFT JOIN dbo.tbl_mbancaibs b ON m."Key1" = b."CodBanca"
      WHERE m."CodGrupo" = $1
        AND m."Estado"   = 1
        AND ($2 = '' OR UPPER(b."Banca") LIKE UPPER('%' || $2 || '%'))
    `, [COD_GRUPO, filtro])
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].total) };
};

export const existsByCodBanca = async (codigoBanca: string): Promise<boolean> => {
  const { rows } = await pool.query(`
    SELECT COUNT(*) AS total
    FROM dbo.tbl_mmultitabla
    WHERE "Key1"     = $1
      AND "CodGrupo" = $2
      AND "Estado"   = 1
  `, [codigoBanca, COD_GRUPO]);
  return parseInt(rows[0].total) > 0;
};

export const create = async (
  dto: CreateSegmentoDto,
  modUsuario: number
): Promise<Segmento> => {
  // Generar nuevo CodMultitabla
  const { rows: lastRows } = await pool.query(`
    SELECT "CodMultitabla" FROM dbo.tbl_mmultitabla
    WHERE "CodGrupo" = $1
    ORDER BY "CodMultitabla" DESC LIMIT 1
  `, [COD_GRUPO]);

  const lastNum = lastRows.length > 0
    ? parseInt(lastRows[0].CodMultitabla.slice(-3)) + 1
    : 1;
  const newCod = `${COD_GRUPO}${String(lastNum).padStart(3, '0')}`;

  const { rows } = await pool.query(`
    INSERT INTO dbo.tbl_mmultitabla
      ("CodMultitabla","Campo","Valor","Key1","Key4",
       "Estado","NoEditable","CodGrupo","ModUsuario","ModFecha")
    VALUES ($1,'Variable.Segmento','Variable.Segmento',$2,$3::VARCHAR,1,0,$4,$5,NOW())
    RETURNING
      "CodMultitabla"   AS id,
      "Key1"            AS "codigoBanca",
      "Key4"::INTEGER   AS pips
  `, [newCod, dto.codigoBanca, String(dto.pips), COD_GRUPO, modUsuario]);

  return { ...rows[0], descripcionBanca: dto.descripcionBanca };
};

export const update = async (
  id: string,
  dto: UpdateSegmentoDto,
  modUsuario: number
): Promise<Segmento | null> => {
  const { rows } = await pool.query(`
    UPDATE dbo.tbl_mmultitabla
    SET
      "Key4"       = $1::VARCHAR,
      "ModFecha"   = NOW(),
      "ModUsuario" = $2
    WHERE "CodMultitabla" = $3
      AND "CodGrupo"      = $4
      AND "Estado"        = 1
    RETURNING
      "CodMultitabla"   AS id,
      "Key1"            AS "codigoBanca",
      "Key4"::INTEGER   AS pips
  `, [String(dto.pips), modUsuario, id, COD_GRUPO]);

  if (!rows[0]) return null;

  // Obtener descripción de banca
  const { rows: bancaRows } = await pool.query(`
    SELECT "Banca" AS "descripcionBanca"
    FROM dbo.tbl_mbancaibs WHERE "CodBanca" = $1
  `, [rows[0].codigoBanca]);

  return {
    ...rows[0],
    descripcionBanca: bancaRows[0]?.descripcionBanca || ''
  };
};

export const deleteLogico = async (id: string, modUsuario: number): Promise<boolean> => {
  const result = await pool.query(`
    UPDATE dbo.tbl_mmultitabla
    SET "Estado" = 0, "ModFecha" = NOW(), "ModUsuario" = $1
    WHERE "CodMultitabla" = $2
      AND "CodGrupo"      = $3
      AND "Estado"        = 1
  `, [modUsuario, id, COD_GRUPO]);
  return (result.rowCount ?? 0) > 0;
};
```
**Estimado:** 2h

---

### TASK-003 — Service
**Archivo:** `src/services/segmento.service.ts`
```typescript
import * as repo from '../repositories/segmento.repository';
import { CreateSegmentoDto, UpdateSegmentoDto } from '../models/segmento.model';

export const getAll = async (descripcion = '', page = 1, limit = 10) => {
  const { rows, total } = await repo.findAll(descripcion, page, limit);
  return {
    data: rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

export const create = async (dto: CreateSegmentoDto, modUsuario: number) => {
  if (!dto.codigoBanca?.trim())
    throw new Error('Debe ingresar codigo de banca');
  if (!dto.descripcionBanca?.trim())
    throw new Error('Debe ingresar descripción banca');
  if (!dto.pips || dto.pips <= 0)
    throw new Error('Debe indicar los PIPs');

  const existe = await repo.existsByCodBanca(dto.codigoBanca);
  if (existe)
    throw new Error(`Ya existe un segmento con el código de banca ${dto.codigoBanca}`);

  return repo.create(dto, modUsuario);
};

export const update = async (id: string, dto: UpdateSegmentoDto, modUsuario: number) => {
  if (!dto.pips || dto.pips <= 0)
    throw new Error('Debe indicar los PIPs');

  const updated = await repo.update(id, dto, modUsuario);
  if (!updated) throw new Error('NOT_FOUND');
  return updated;
};

export const remove = async (id: string, modUsuario: number) => {
  const deleted = await repo.deleteLogico(id, modUsuario);
  if (!deleted) throw new Error('NOT_FOUND');
  return { message: 'Segmento eliminado correctamente' };
};
```
**Estimado:** 1.5h

---

### TASK-004 — Handler
**Archivo:** `src/handlers/segmento.ts`
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as service from '../services/segmento.service';
import { ok, created, notFound, badRequest, serverError } from '../utils/response.util';

export const segmentoHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, queryStringParameters, body } = event;
  const id          = pathParameters?.id;
  const descripcion = queryStringParameters?.descripcion || '';
  const page        = parseInt(queryStringParameters?.page  || '1');
  const limit       = parseInt(queryStringParameters?.limit || '10');
  const modUsuario  = 0; // TODO: extraer del token JWT

  try {
    // GET /segmento
    if (httpMethod === 'GET' && !id)
      return ok(await service.getAll(descripcion, page, limit));

    // POST /segmento
    if (httpMethod === 'POST')
      return created(await service.create(JSON.parse(body || '{}'), modUsuario));

    // PUT /segmento/{id}
    if (httpMethod === 'PUT' && id)
      return ok(await service.update(id, JSON.parse(body || '{}'), modUsuario));

    // DELETE /segmento/{id}
    if (httpMethod === 'DELETE' && id)
      return ok(await service.remove(id, modUsuario));

    return badRequest('Ruta no encontrada');

  } catch (error: any) {
    if (error.message === 'NOT_FOUND')
      return notFound('Segmento no encontrado');
    if (['codigo', 'descripción', 'PIPs', 'Ya existe'].some(k =>
      error.message.toLowerCase().includes(k.toLowerCase())))
      return badRequest(error.message);

    console.error('Error:', error);
    return serverError('Error interno del servidor');
  }
};
```
**Estimado:** 1h

---

### TASK-005 — Registrar ruta en index.ts
```typescript
import { segmentoHandler } from './handlers/segmento';

if (path.startsWith('/segmento')) return segmentoHandler(event);
```
**Estimado:** 0.25h

---

### TASK-006 — Tests Unitarios
Casos a probar:
- ✅ getAll → retorna registros con JOIN a tbl_mbancaibs
- ✅ getAll → filtra por descripción case insensitive
- ✅ getAll → paginación correcta
- ✅ create → inserta con CodGrupo=0007
- ❌ create → codigoBanca vacío
- ❌ create → descripcionBanca vacío
- ❌ create → PIPs <= 0
- ❌ create → codigoBanca duplicado
- ✅ update → actualiza solo Key4 (PIPs)
- ❌ update → id no existe
- ✅ remove → Estado=0 lógico
- ❌ remove → id no existe

**Estimado:** 2h

---

### TASK-007 — Auditoría
```typescript
// Crear segmento   → 'SEG001'
// Editar segmento  → 'SEG002'
// Eliminar segmento→ 'SEG003'
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
| TASK-005 | Registro de ruta | 0.25h |
| TASK-006 | Tests unitarios | 2h |
| TASK-007 | Auditoría | 1h |
| **TOTAL** | | **8.25h** |

---

## 5. NOTAS FINALES DE BD

| Dato | Valor confirmado |
|---|---|
| Tabla principal | `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0007'` |
| Tabla JOIN | `dbo.tbl_mbancaibs` |
| Código de banca | `Key1` → JOIN con `tbl_mbancaibs."CodBanca"` |
| Descripción banca | `tbl_mbancaibs."Banca"` |
| PIPs | `Key4` (VARCHAR → INTEGER) |
| Total registros | 29 |
| Estado activo | `Estado = 1` |
| Eliminación | Lógica `Estado = 0` |
| En edición | Solo `Key4` (PIPs) es modificable |
