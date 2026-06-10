# SPEC-002 — Módulo Variable Horario de Mercado
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.1.0 | Fecha: 2026-06-09
## ✅ Actualizado con mapeo real de BD

---

## 1. DESIGN

### 1.1 Pantalla Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Variable Horario de Mercado                                         │
│                                                                      │
│  ── Horario de mercado ──────────────────────────────────────────── │
│  ┌─────┬──────────────────────────┬────────────┬──────────┬─────┬───────────┐
│  │ N°  │ Nombre                   │ Hora Inicio│ Hora Fin │PIPs │ Acciones  │
│  ├─────┼──────────────────────────┼────────────┼──────────┼─────┼───────────┤
│  │  1  │ Horario de mercado abierto│  09:00    │  13:30   │ 100 │    ✏️     │
│  │  2  │ Horario de mercado cerrado│  13:31    │  08:59   │ 200 │    ✏️     │
│  └─────┴──────────────────────────┴────────────┴──────────┴─────┴───────────┘
│                                                                      │
│  ── Feriados ────────────────────────── Año: [2026 ▼]  [+ Nuevo]   │
│  ┌─────┬──────────────────────────────────────────────────┬──────────┐
│  │ N°  │ Fecha                                            │ Acciones │
│  ├─────┼──────────────────────────────────────────────────┼──────────┤
│  │  1  │ jueves 01/01/2026                                │   🗑️    │
│  │  2  │ jueves 02/04/2026                                │   🗑️    │
│  └─────┴──────────────────────────────────────────────────┴──────────┘
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Modal — Editar Horario de Mercado

```
┌──────────────────────────────────────────────┐
│  Editar Horario de mercado               [X] │
├──────────────────────────────────────────────┤
│  Nombre:               [Horario de mercado   │
│                         abierto          ]   │  (readonly)
│  PIPs:                 [100              ]   │  (editable, numérico)
│  Horario Apertura      [09:00            ]   │  (editable, HH:MM)
│  (HH:MM):                                    │
│  Horario Cierre        [13:30            ]   │  (editable, HH:MM)
│  (HH:MM):                                    │
│                                              │
│  NOTA:                                       │
│  Horario de mercado abierto: Lunes a         │
│  Viernes (durante la mañana)                 │
│  Horario de mercado cerrado: Lunes a         │
│  viernes (durante las tardes), Sábado,       │
│  Domingo y Feriados                          │
│                                              │
│              [ 💾 Guardar ]                  │
└──────────────────────────────────────────────┘
```

### 1.3 Modal — Agregar Feriado

```
┌──────────────────────────────────────┐
│  Agregar Feriado                 [X] │
├──────────────────────────────────────┤
│  Fecha:  [          ] 📅 🖊️         │
│                                      │
│            [ 💾 Guardar ]            │
└──────────────────────────────────────┘
```

---

## 2. REQUIREMENTS

### 2.1 Mapeo Real de BD ✅

#### Sección Horario de Mercado → `dbo.tbl_mmultitabla` (CodGrupo = '0005')

| Campo UI | Campo DB | Valor real |
|---|---|---|
| N° | correlativo | — generado en frontend |
| Nombre | `Campo` | "Horario de mercado abierto" / "Horario de mercado cerrado" |
| Hora Inicio | `Key1` | `09:00` / `13:31` |
| Hora Fin | `Key2` | `13:30` / `08:59` |
| PIPs | `Key3` | `100` / `200` |
| Estado activo | `Marcado` | `1` = activo |

**Registros reales:**
```
CodMultitabla | Campo              | Key1  | Key2  | Key3 | CodGrupo
0005001       | Horario de mercado | 09:00 | 13:30 | 100  | 0005
0005002       | Horario de mercado | 13:31 | 08:59 | 200  | 0005
```

#### Sección Feriados → `dbo.tbl_mferiado`

| Campo UI | Campo DB | Tipo | Notas |
|---|---|---|---|
| N° | correlativo | — | Generado en frontend |
| Fecha | `Fecha` | DATE | Formatear con día semana en frontend |
| Año (filtro) | `EXTRACT(YEAR FROM "Fecha")` | — | Filtro en query |
| Estado | `MtEstado` | VARCHAR(7) | Valor activo = `'0001001'` |

**Nota importante:** `MtEstado = '0001001'` corresponde al valor Activo de `tbl_mmultitabla` CodGrupo `0001`.

### 2.2 Endpoints Requeridos

#### SECCIÓN HORARIO DE MERCADO

---

**GET /horario-mercado**

Query real:
```sql
SELECT 
  "CodMultitabla"  AS id,
  "Campo"          AS nombre,
  "Key1"           AS "horaInicio",
  "Key2"           AS "horaFin",
  "Key3"::INTEGER  AS pips
FROM dbo.tbl_mmultitabla
WHERE "CodGrupo" = '0005'
ORDER BY "CodMultitabla";
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0005001",
      "nombre": "Horario de mercado abierto",
      "horaInicio": "09:00",
      "horaFin": "13:30",
      "pips": 100
    },
    {
      "id": "0005002",
      "nombre": "Horario de mercado cerrado",
      "horaInicio": "13:31",
      "horaFin": "08:59",
      "pips": 200
    }
  ]
}
```

---

**PUT /horario-mercado/{id}**

Query real:
```sql
UPDATE dbo.tbl_mmultitabla
SET 
  "Key1"      = $1,
  "Key2"      = $2,
  "Key3"      = $3::VARCHAR,
  "ModFecha"  = NOW(),
  "ModUsuario"= $4
WHERE "CodMultitabla" = $5
  AND "CodGrupo" = '0005'
RETURNING 
  "CodMultitabla" AS id,
  "Campo"         AS nombre,
  "Key1"          AS "horaInicio",
  "Key2"          AS "horaFin",
  "Key3"::INTEGER AS pips;
```

**Request Body:**
```json
{
  "pips": 120,
  "horaInicio": "09:00",
  "horaFin": "15:00"
}
```

**Validaciones:**
- `pips`: requerido, entero, mayor a 0
- `horaInicio`: requerido, formato HH:MM
- `horaFin`: requerido, formato HH:MM

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "0005001",
    "nombre": "Horario de mercado abierto",
    "horaInicio": "09:00",
    "horaFin": "15:00",
    "pips": 120
  }
}
```

---

#### SECCIÓN FERIADOS

---

**GET /feriado?anio=2026**

Query real:
```sql
SELECT 
  "CodFeriado"                          AS "codFeriado",
  TO_CHAR("Fecha", 'YYYY-MM-DD')        AS fecha,
  TO_CHAR("Fecha", 'DD/MM/YYYY')        AS "fechaFormateada"
FROM dbo.tbl_mferiado
WHERE EXTRACT(YEAR FROM "Fecha") = $1
  AND "MtEstado" = '0001001'
ORDER BY "Fecha";
```

> El día de la semana (lunes, martes...) se formatea en el **frontend React** para mayor flexibilidad en el idioma.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "codFeriado": 385,
      "fecha": "2026-01-01",
      "fechaFormateada": "01/01/2026"
    }
  ]
}
```

---

**POST /feriado**

Query real:
```sql
INSERT INTO dbo.tbl_mferiado 
  ("Fecha", "MtEstado", "RegUsuario", "RegFecha")
VALUES 
  ($1::DATE, '0001001', $2, NOW())
RETURNING 
  "CodFeriado" AS "codFeriado",
  TO_CHAR("Fecha", 'YYYY-MM-DD') AS fecha,
  TO_CHAR("Fecha", 'DD/MM/YYYY') AS "fechaFormateada";
```

**Request Body:**
```json
{
  "fecha": "2026-12-25"
}
```

**Validaciones:**
- `fecha`: requerido, formato YYYY-MM-DD
- No debe existir feriado con la misma fecha y `MtEstado = '0001001'`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "codFeriado": 410,
    "fecha": "2026-12-25",
    "fechaFormateada": "25/12/2026"
  }
}
```

**Response 400 (duplicado):**
```json
{
  "success": false,
  "message": "Ya existe un feriado registrado para la fecha 25/12/2026"
}
```

---

**DELETE /feriado/{codFeriado}**

Eliminación **lógica** — actualiza MtEstado:
```sql
UPDATE dbo.tbl_mferiado
SET "MtEstado" = '0001002'
WHERE "CodFeriado" = $1;
```

> Usa el código `'0001002'` = Inactivo de `tbl_mmultitabla` CodGrupo `0001`.

**Response 200:**
```json
{
  "success": true,
  "message": "Feriado eliminado correctamente"
}
```

### 2.3 Reglas de Negocio

- Solo existen **2 registros fijos** de horario (no se crean ni eliminan)
- El campo Nombre del horario es **solo lectura**
- Feriados se filtran por año seleccionado
- Año por defecto = año actual
- No se permiten fechas duplicadas en feriados activos
- Eliminación de feriados es **lógica** (`MtEstado = '0001002'`)
- Todas las modificaciones generan registro en `tbl_pAuditoria`

### 2.4 Seguridad
- Bearer Token / API Key requerido
- Solo usuarios autorizados pueden editar

---

## 3. TASKS

### TASK-001 — Modelos TypeScript
**Archivo:** `src/models/horario-mercado.model.ts`
```typescript
export interface HorarioMercado {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  pips: number;
}

export interface UpdateHorarioMercadoDto {
  pips: number;
  horaInicio: string;
  horaFin: string;
}

export interface Feriado {
  codFeriado: number;
  fecha: string;
  fechaFormateada: string;
}

export interface CreateFeriadoDto {
  fecha: string; // YYYY-MM-DD
}
```
**Estimado:** 0.5h

---

### TASK-002 — Repository Horario Mercado
**Archivo:** `src/repositories/horario-mercado.repository.ts`
```typescript
import pool from '../config/database';
import { HorarioMercado, UpdateHorarioMercadoDto } from '../models/horario-mercado.model';

export const findAllHorarios = async (): Promise<HorarioMercado[]> => {
  const { rows } = await pool.query(`
    SELECT 
      "CodMultitabla"   AS id,
      "Campo"           AS nombre,
      "Key1"            AS "horaInicio",
      "Key2"            AS "horaFin",
      "Key3"::INTEGER   AS pips
    FROM dbo.tbl_mmultitabla
    WHERE "CodGrupo" = '0005'
    ORDER BY "CodMultitabla"
  `);
  return rows;
};

export const updateHorario = async (
  id: string,
  dto: UpdateHorarioMercadoDto,
  modUsuario: number
): Promise<HorarioMercado | null> => {
  const { rows } = await pool.query(`
    UPDATE dbo.tbl_mmultitabla
    SET 
      "Key1"       = $1,
      "Key2"       = $2,
      "Key3"       = $3::VARCHAR,
      "ModFecha"   = NOW(),
      "ModUsuario" = $4
    WHERE "CodMultitabla" = $5
      AND "CodGrupo" = '0005'
    RETURNING 
      "CodMultitabla"   AS id,
      "Campo"           AS nombre,
      "Key1"            AS "horaInicio",
      "Key2"            AS "horaFin",
      "Key3"::INTEGER   AS pips
  `, [dto.horaInicio, dto.horaFin, String(dto.pips), modUsuario, id]);
  return rows[0] || null;
};
```
**Estimado:** 1.5h

---

### TASK-003 — Repository Feriados
**Archivo:** `src/repositories/feriado.repository.ts`
```typescript
import pool from '../config/database';
import { Feriado } from '../models/horario-mercado.model';

const MT_ESTADO_ACTIVO   = '0001001';
const MT_ESTADO_INACTIVO = '0001002';

export const findByAnio = async (anio: number): Promise<Feriado[]> => {
  const { rows } = await pool.query(`
    SELECT 
      "CodFeriado"                   AS "codFeriado",
      TO_CHAR("Fecha", 'YYYY-MM-DD') AS fecha,
      TO_CHAR("Fecha", 'DD/MM/YYYY') AS "fechaFormateada"
    FROM dbo.tbl_mferiado
    WHERE EXTRACT(YEAR FROM "Fecha") = $1
      AND "MtEstado" = $2
    ORDER BY "Fecha"
  `, [anio, MT_ESTADO_ACTIVO]);
  return rows;
};

export const existsByFecha = async (fecha: string): Promise<boolean> => {
  const { rows } = await pool.query(`
    SELECT COUNT(*) AS total
    FROM dbo.tbl_mferiado
    WHERE "Fecha" = $1::DATE
      AND "MtEstado" = $2
  `, [fecha, MT_ESTADO_ACTIVO]);
  return parseInt(rows[0].total) > 0;
};

export const create = async (fecha: string, regUsuario: number): Promise<Feriado> => {
  const { rows } = await pool.query(`
    INSERT INTO dbo.tbl_mferiado ("Fecha", "MtEstado", "RegUsuario", "RegFecha")
    VALUES ($1::DATE, $2, $3, NOW())
    RETURNING 
      "CodFeriado"                   AS "codFeriado",
      TO_CHAR("Fecha", 'YYYY-MM-DD') AS fecha,
      TO_CHAR("Fecha", 'DD/MM/YYYY') AS "fechaFormateada"
  `, [fecha, MT_ESTADO_ACTIVO, regUsuario]);
  return rows[0];
};

export const deleteLogico = async (codFeriado: number): Promise<boolean> => {
  const result = await pool.query(`
    UPDATE dbo.tbl_mferiado
    SET "MtEstado" = $1
    WHERE "CodFeriado" = $2
      AND "MtEstado"   = $3
  `, [MT_ESTADO_INACTIVO, codFeriado, MT_ESTADO_ACTIVO]);
  return (result.rowCount ?? 0) > 0;
};
```
**Estimado:** 1.5h

---

### TASK-004 — Service
**Archivo:** `src/services/horario-mercado.service.ts`
```typescript
import * as horarioRepo from '../repositories/horario-mercado.repository';
import * as feriadoRepo from '../repositories/feriado.repository';
import { UpdateHorarioMercadoDto, CreateFeriadoDto } from '../models/horario-mercado.model';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ── Horario ──────────────────────────────────────────────────────────
export const getAllHorarios = () => horarioRepo.findAllHorarios();

export const updateHorario = async (
  id: string,
  dto: UpdateHorarioMercadoDto,
  modUsuario: number
) => {
  if (!dto.pips || dto.pips <= 0)
    throw new Error('PIPs debe ser un número entero mayor a 0');
  if (!TIME_REGEX.test(dto.horaInicio))
    throw new Error('Horario Apertura debe tener formato HH:MM');
  if (!TIME_REGEX.test(dto.horaFin))
    throw new Error('Horario Cierre debe tener formato HH:MM');

  const updated = await horarioRepo.updateHorario(id, dto, modUsuario);
  if (!updated) throw new Error('NOT_FOUND');
  return updated;
};

// ── Feriados ─────────────────────────────────────────────────────────
export const getFeriadosByAnio = (anio: number) =>
  feriadoRepo.findByAnio(anio);

export const createFeriado = async (dto: CreateFeriadoDto, regUsuario: number) => {
  if (!dto.fecha) throw new Error('La fecha es requerida');

  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_REGEX.test(dto.fecha))
    throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');

  const existe = await feriadoRepo.existsByFecha(dto.fecha);
  if (existe)
    throw new Error(`Ya existe un feriado registrado para la fecha ${dto.fecha}`);

  return feriadoRepo.create(dto.fecha, regUsuario);
};

export const deleteFeriado = async (codFeriado: number) => {
  const deleted = await feriadoRepo.deleteLogico(codFeriado);
  if (!deleted) throw new Error('NOT_FOUND');
  return { message: 'Feriado eliminado correctamente' };
};
```
**Estimado:** 1.5h

---

### TASK-005 — Handler
**Archivo:** `src/handlers/horario-mercado.ts`
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as service from '../services/horario-mercado.service';
import { ok, created, notFound, badRequest, serverError } from '../utils/response.util';

export const horarioMercadoHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;

  try {
    // GET /horario-mercado
    if (httpMethod === 'GET' && path === '/horario-mercado') {
      return ok(await service.getAllHorarios());
    }

    // PUT /horario-mercado/{id}
    if (httpMethod === 'PUT' && pathParameters?.id) {
      const dto = JSON.parse(body || '{}');
      const modUsuario = 0; // TODO: extraer del token JWT
      return ok(await service.updateHorario(pathParameters.id, dto, modUsuario));
    }

    // GET /feriado?anio=2026
    if (httpMethod === 'GET' && path === '/feriado') {
      const anio = parseInt(
        queryStringParameters?.anio || String(new Date().getFullYear())
      );
      return ok(await service.getFeriadosByAnio(anio));
    }

    // POST /feriado
    if (httpMethod === 'POST' && path === '/feriado') {
      const dto = JSON.parse(body || '{}');
      const regUsuario = 0; // TODO: extraer del token JWT
      return created(await service.createFeriado(dto, regUsuario));
    }

    // DELETE /feriado/{codFeriado}
    if (httpMethod === 'DELETE' && pathParameters?.codFeriado) {
      return ok(await service.deleteFeriado(parseInt(pathParameters.codFeriado)));
    }

    return badRequest('Ruta no encontrada');

  } catch (error: any) {
    if (error.message === 'NOT_FOUND')
      return notFound('Registro no encontrado');
    if (['PIPs', 'fecha', 'Horario', 'Ya existe', 'Formato'].some(k =>
      error.message.includes(k)))
      return badRequest(error.message);

    console.error('Error:', error);
    return serverError('Error interno del servidor');
  }
};
```
**Estimado:** 1h

---

### TASK-006 — Registrar rutas en index.ts
```typescript
import { horarioMercadoHandler } from './handlers/horario-mercado';

if (path.startsWith('/horario-mercado')) return horarioMercadoHandler(event);
if (path.startsWith('/feriado'))         return horarioMercadoHandler(event);
```
**Estimado:** 0.25h

---

### TASK-007 — Tests Unitarios
Casos a probar:

**Horario Mercado:**
- ✅ getAllHorarios → retorna 2 registros con CodGrupo=0005
- ✅ updateHorario → actualiza Key1, Key2, Key3 correctamente
- ❌ updateHorario → PIPs <= 0
- ❌ updateHorario → formato hora inválido
- ❌ updateHorario → CodMultitabla no existe

**Feriados:**
- ✅ getFeriadosByAnio → filtra por año y MtEstado='0001001'
- ✅ createFeriado → inserta con MtEstado='0001001'
- ❌ createFeriado → fecha duplicada
- ❌ createFeriado → formato fecha inválido
- ✅ deleteFeriado → actualiza MtEstado a '0001002'
- ❌ deleteFeriado → codFeriado no existe

**Estimado:** 2h

---

### TASK-008 — Auditoría
```typescript
// Actualización horario → código 'HOR001'
// Creación feriado     → código 'FER001'
// Eliminación feriado  → código 'FER002'
```
**Estimado:** 1h

---

## 4. RESUMEN DE ESTIMACIÓN

| Task | Descripción | Estimado |
|---|---|---|
| TASK-001 | Modelos TypeScript | 0.5h |
| TASK-002 | Repository Horario Mercado | 1.5h |
| TASK-003 | Repository Feriados | 1.5h |
| TASK-004 | Service | 1.5h |
| TASK-005 | Handler | 1h |
| TASK-006 | Registro de rutas | 0.25h |
| TASK-007 | Tests unitarios | 2h |
| TASK-008 | Auditoría | 1h |
| **TOTAL** | | **9.25h** |

---

## 5. NOTAS FINALES DE BD

| Dato | Valor real confirmado |
|---|---|
| Tabla horarios | `dbo.tbl_mmultitabla` WHERE CodGrupo = `'0005'` |
| Hora inicio | campo `Key1` |
| Hora fin | campo `Key2` |
| PIPs | campo `Key3` |
| Tabla feriados | `dbo.tbl_mferiado` |
| Estado activo | `MtEstado = '0001001'` |
| Estado inactivo (baja lógica) | `MtEstado = '0001002'` |
| Día semana en español | Formateado en **frontend React** |
