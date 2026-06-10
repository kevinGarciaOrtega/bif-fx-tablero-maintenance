# SPEC-005 — Módulo Variable Spread de Liquidez
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.0.0 | Fecha: 2026-06-09
## ✅ Mapeo real de BD confirmado

---

## 1. DESIGN

### 1.1 Pantalla Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Variable Spread de Liquidez                                         │
├──────┬──────────────────────────┬────────────────────────┬──────┬──────────┐
│  N°  │  Tipo de Mercado         │  Sentido Operación     │ PIPs │ Acciones │
├──────┼──────────────────────────┼────────────────────────┼──────┼──────────┤
│   1  │  Horario Mercado Abierto │  BANCO COMPRA DÓLARES  │   50 │    ✏️    │
│   2  │  Horario Mercado Abierto │  BANCO VENDE DÓLARES   │   25 │    ✏️    │
│   3  │  Horario Mercado Cerrado │  BANCO COMPRA DÓLARES  │    0 │    ✏️    │
│   4  │  Horario Mercado Cerrado │  BANCO VENDE DÓLARES   │  -15 │    ✏️    │
├──────┴──────────────────────────┴────────────────────────┴──────┴──────────┤
│                       Registros: 4 de 4   << 1 >>                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Características:**
- Solo 4 registros fijos (no se pueden crear ni eliminar)
- Sin filtro de búsqueda
- PIPs puede ser **negativo** (ej: -15, -50)
- Solo botón ✏️ por fila (sin 🗑️)

### 1.2 Modal — Editar Spread de Liquidez

```
┌──────────────────────────────────────────────┐
│  Editar Spread de Liquidez               [X] │
├──────────────────────────────────────────────┤
│  Tipo de Mercado:   [Horario Mercado     ]   │  (readonly)
│                      Abierto            ]    │
│  Sentido Operación: [BANCO COMPRA       ]   │  (readonly)
│                      DÓLARES           ]     │
│  PIPs:              [50                 ]   │  (editable, entero, puede ser negativo)
│                                              │
│              [ 💾 Guardar ]                  │
└──────────────────────────────────────────────┘
```

**Campos del modal:**
| Campo | Tipo | Editable | Validación |
|---|---|---|---|
| Tipo de Mercado | Text readonly | No | — |
| Sentido Operación | Text readonly | No | — |
| PIPs | Number input | Sí | Entero, puede ser negativo |

**Comportamiento:**
- Al abrir modal → carga datos del registro seleccionado
- PIPs acepta valores negativos (ej: -15, -50)
- Al guardar → PUT → cierra modal → refresca tabla
- Al cerrar [X] → descarta cambios

---

## 2. REQUIREMENTS

### 2.1 Mapeo Real de BD ✅

#### Tabla: `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0011'`

| Campo UI | Campo DB | Tipo | Notas |
|---|---|---|---|
| N° | correlativo | — | Generado en frontend |
| Tipo de Mercado | `Valor` | VARCHAR | "Horario Mercado Abierto" / "Horario Mercado Cerrado" |
| Sentido Operación | `Key4` | VARCHAR | "BANCO COMPRA DÓLARES" / "BANCO VENDE DÓLARES" |
| PIPs | `Key3` | VARCHAR → INTEGER | Puede ser negativo |
| Estado activo | `Estado` | SMALLINT | `1` = activo |

**Registros reales en BD:**
```
CodMultitabla | Valor                  | Key3 | Key4                   | CodGrupo
0011001       | Horario Mercado Abierto|   -5 | BANCO COMPRA DÓLARES   | 0011
0011002       | Horario Mercado Abierto|   10 | BANCO VENDE DÓLARES    | 0011
0011003       | Horario Mercado Cerrado|  -50 | BANCO COMPRA DÓLARES   | 0011
0011004       | Horario Mercado Cerrado|   60 | BANCO VENDE DÓLARES    | 0011
```

> ⚠️ Los PIPs en pantalla muestran valores diferentes a los de BD (50, 25, 0, -15 vs -5, 10, -50, 60). Confirmar con el equipo si hay transformación o si los datos de UAT difieren de producción.

### 2.2 Endpoints Requeridos

---

**GET /spread-liquidez**

Query real:
```sql
SELECT
  "CodMultitabla"   AS id,
  "Valor"           AS "tipoMercado",
  "Key4"            AS "sentidoOperacion",
  "Key3"::INTEGER   AS pips
FROM dbo.tbl_mmultitabla
WHERE "CodGrupo" = '0011'
  AND "Estado"   = 1
ORDER BY "CodMultitabla";
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0011001",
      "tipoMercado": "Horario Mercado Abierto",
      "sentidoOperacion": "BANCO COMPRA DÓLARES",
      "pips": -5
    },
    {
      "id": "0011002",
      "tipoMercado": "Horario Mercado Abierto",
      "sentidoOperacion": "BANCO VENDE DÓLARES",
      "pips": 10
    },
    {
      "id": "0011003",
      "tipoMercado": "Horario Mercado Cerrado",
      "sentidoOperacion": "BANCO COMPRA DÓLARES",
      "pips": -50
    },
    {
      "id": "0011004",
      "tipoMercado": "Horario Mercado Cerrado",
      "sentidoOperacion": "BANCO VENDE DÓLARES",
      "pips": 60
    }
  ]
}
```

---

**PUT /spread-liquidez/{id}**
Actualiza solo PIPs del registro.

Query real:
```sql
UPDATE dbo.tbl_mmultitabla
SET
  "Key3"       = $1::VARCHAR,
  "ModFecha"   = NOW(),
  "ModUsuario" = $2
WHERE "CodMultitabla" = $3
  AND "CodGrupo"      = '0011'
  AND "Estado"        = 1
RETURNING
  "CodMultitabla"   AS id,
  "Valor"           AS "tipoMercado",
  "Key4"            AS "sentidoOperacion",
  "Key3"::INTEGER   AS pips;
```

**Request Body:**
```json
{
  "pips": -20
}
```

**Validaciones:**
- `pips`: requerido, entero (positivo o negativo), no nulo

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "0011001",
    "tipoMercado": "Horario Mercado Abierto",
    "sentidoOperacion": "BANCO COMPRA DÓLARES",
    "pips": -20
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Registro de spread no encontrado"
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "PIPs es requerido y debe ser un número entero"
}
```

### 2.3 Reglas de Negocio
- Solo se permite **editar PIPs** — no crear ni eliminar registros
- `Tipo de Mercado` y `Sentido Operación` son de solo lectura
- PIPs acepta valores **negativos, cero y positivos**
- Exactamente **4 registros fijos** en BD
- Todas las modificaciones registran en `tbl_pAuditoria`

### 2.4 Seguridad
- Bearer Token / API Key requerido
- Solo usuarios autorizados pueden editar

---

## 3. TASKS

### TASK-001 — Modelo TypeScript
**Archivo:** `src/models/spread-liquidez.model.ts`
```typescript
export interface SpreadLiquidez {
  id: string;
  tipoMercado: string;
  sentidoOperacion: string;
  pips: number;
}

export interface UpdateSpreadLiquidezDto {
  pips: number;
}
```
**Estimado:** 0.5h

---

### TASK-002 — Repository
**Archivo:** `src/repositories/spread-liquidez.repository.ts`
```typescript
import pool from '../config/database';
import { SpreadLiquidez, UpdateSpreadLiquidezDto } from '../models/spread-liquidez.model';

const COD_GRUPO = '0011';

export const findAll = async (): Promise<SpreadLiquidez[]> => {
  const { rows } = await pool.query(`
    SELECT
      "CodMultitabla"   AS id,
      "Valor"           AS "tipoMercado",
      "Key4"            AS "sentidoOperacion",
      "Key3"::INTEGER   AS pips
    FROM dbo.tbl_mmultitabla
    WHERE "CodGrupo" = $1
      AND "Estado"   = 1
    ORDER BY "CodMultitabla"
  `, [COD_GRUPO]);
  return rows;
};

export const updateById = async (
  id: string,
  dto: UpdateSpreadLiquidezDto,
  modUsuario: number
): Promise<SpreadLiquidez | null> => {
  const { rows } = await pool.query(`
    UPDATE dbo.tbl_mmultitabla
    SET
      "Key3"       = $1::VARCHAR,
      "ModFecha"   = NOW(),
      "ModUsuario" = $2
    WHERE "CodMultitabla" = $3
      AND "CodGrupo"      = $4
      AND "Estado"        = 1
    RETURNING
      "CodMultitabla"   AS id,
      "Valor"           AS "tipoMercado",
      "Key4"            AS "sentidoOperacion",
      "Key3"::INTEGER   AS pips
  `, [String(dto.pips), modUsuario, id, COD_GRUPO]);
  return rows[0] || null;
};
```
**Estimado:** 1h

---

### TASK-003 — Service
**Archivo:** `src/services/spread-liquidez.service.ts`
```typescript
import * as repo from '../repositories/spread-liquidez.repository';
import { UpdateSpreadLiquidezDto } from '../models/spread-liquidez.model';

export const getAll = () => repo.findAll();

export const update = async (
  id: string,
  dto: UpdateSpreadLiquidezDto,
  modUsuario: number
) => {
  // PIPs puede ser negativo, cero o positivo — solo verificar que sea número entero
  if (dto.pips === undefined || dto.pips === null || !Number.isInteger(dto.pips))
    throw new Error('PIPs es requerido y debe ser un número entero');

  const updated = await repo.updateById(id, dto, modUsuario);
  if (!updated) throw new Error('NOT_FOUND');
  return updated;
};
```
**Estimado:** 0.75h

---

### TASK-004 — Handler
**Archivo:** `src/handlers/spread-liquidez.ts`
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as service from '../services/spread-liquidez.service';
import { ok, notFound, badRequest, serverError } from '../utils/response.util';

export const spreadLiquidezHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, body } = event;
  const id         = pathParameters?.id;
  const modUsuario = 0; // TODO: extraer del token JWT

  try {
    // GET /spread-liquidez
    if (httpMethod === 'GET' && !id)
      return ok(await service.getAll());

    // PUT /spread-liquidez/{id}
    if (httpMethod === 'PUT' && id)
      return ok(await service.update(id, JSON.parse(body || '{}'), modUsuario));

    return badRequest('Método no permitido');

  } catch (error: any) {
    if (error.message === 'NOT_FOUND')
      return notFound('Registro de spread no encontrado');
    if (error.message.includes('PIPs'))
      return badRequest(error.message);

    console.error('Error:', error);
    return serverError('Error interno del servidor');
  }
};
```
**Estimado:** 0.75h

---

### TASK-005 — Registrar ruta en index.ts
```typescript
import { spreadLiquidezHandler } from './handlers/spread-liquidez';

if (path.startsWith('/spread-liquidez')) return spreadLiquidezHandler(event);
```
**Estimado:** 0.25h

---

### TASK-006 — Tests Unitarios
Casos a probar:
- ✅ getAll → retorna 4 registros con CodGrupo=0011
- ✅ update → actualiza Key3 con valor positivo
- ✅ update → actualiza Key3 con valor negativo
- ✅ update → actualiza Key3 con valor cero
- ❌ update → pips es undefined/null
- ❌ update → pips no es entero (decimal)
- ❌ update → id no existe en CodGrupo=0011

**Estimado:** 1.5h

---

### TASK-007 — Auditoría
```typescript
// Editar spread liquidez → 'SPR001'
await auditoriaRepo.registrar({
  codTransaccion: 'SPR001',
  descripcion: `Actualización Spread Liquidez ID: ${id}`,
  regUsuario: modUsuario,
  regFecha: new Date()
});
```
**Estimado:** 0.75h

---

## 4. RESUMEN DE ESTIMACIÓN

| Task | Descripción | Estimado |
|---|---|---|
| TASK-001 | Modelo TypeScript | 0.5h |
| TASK-002 | Repository | 1h |
| TASK-003 | Service | 0.75h |
| TASK-004 | Handler | 0.75h |
| TASK-005 | Registro de ruta | 0.25h |
| TASK-006 | Tests unitarios | 1.5h |
| TASK-007 | Auditoría | 0.75h |
| **TOTAL** | | **5.5h** |

---

## 5. NOTAS FINALES DE BD

| Dato | Valor confirmado |
|---|---|
| Tabla | `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0011'` |
| Tipo de Mercado | campo `Valor` |
| Sentido Operación | campo `Key4` |
| PIPs | campo `Key3` (VARCHAR → INTEGER, puede ser negativo) |
| Total registros | 4 (fijos) |
| Estado activo | `Estado = 1` |
| Operaciones permitidas | Solo edición de PIPs |
| ⚠️ Pendiente confirmar | Diferencia entre valores UAT y producción |
