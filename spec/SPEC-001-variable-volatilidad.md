# SPEC-001 — Módulo Variable Volatilidad
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.1.0 | Fecha: 2026-06-09
## ✅ Actualizado con mapeo real de BD

---

## 1. DESIGN

### 1.1 Pantalla Principal — Lista de Variables

```
┌─────────────────────────────────────────────────────────────┐
│  Variable Volatilidad                                        │
├──────┬───────────────────────────┬────────┬─────────────────┬───────────┤
│  N°  │  Nombre                   │  PIPs  │  Estado actual  │ Acciones  │
├──────┼───────────────────────────┼────────┼─────────────────┼───────────┤
│  1   │  Volatilidad Activa       │  100   │  [ ]            │    ✏️     │
│  2   │  Volatilidad Inactiva     │  200   │  [✓]            │    ✏️     │
└──────┴───────────────────────────┴────────┴─────────────────┴───────────┘
```

**Componentes:**
- Tabla con columnas: N°, Nombre, PIPs, Estado actual (checkbox readonly), Acciones
- Botón editar (ícono lápiz) por fila → abre modal
- Sin botón crear (registros fijos)
- Sin paginación (solo 2 registros)

### 1.2 Modal — Editar Volatilidad

```
┌─────────────────────────────────────┐
│  Editar Volatilidad              [X] │
├─────────────────────────────────────┤
│  Estado:        [Volatilidad Activa] │  (readonly)
│  PIPs:          [100              ]  │  (editable, numérico)
│  Estado actual: [Inactivo      ▼  ]  │  (dropdown: Activo/Inactivo)
│                                      │
│           [ 💾 Guardar ]             │
└─────────────────────────────────────┘
```

**Campos del modal:**
| Campo | Tipo | Editable | Descripción |
|---|---|---|---|
| Estado | Text readonly | No | Nombre de la variable (`Campo`) |
| PIPs | Number input | Sí | Valor numérico → campo `Key3` |
| Estado actual | Dropdown | Sí | Activo=1 / Inactivo=0 → campo `Marcado` |

**Comportamiento:**
- Al abrir modal → carga datos del registro seleccionado
- Dropdown: `Activo` (`Marcado=1`) / `Inactivo` (`Marcado=0`)
- Al guardar → PUT → cierra modal → refresca tabla
- Al cerrar [X] → descarta cambios

---

## 2. REQUIREMENTS

### 2.1 Mapeo Real de BD ✅

#### Tabla: `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0004'`

| Campo UI | Campo DB | Valor real |
|---|---|---|
| N° | correlativo | — generado en frontend |
| Nombre | `Campo` | "Volatilidad Activa" / "Volatilidad Inactiva" |
| PIPs | `Key3` | `100` / `200` |
| Estado actual (checkbox) | `Marcado` | `1` = activo, `0` = inactivo |

**Registros reales:**
```
CodMultitabla | Campo               | Key3 | Marcado | CodGrupo
0004001       | Volatilidad Activa  | 100  |    1    | 0004
0004002       | Volatilidad Inactiva| 200  |    0    | 0004
```

### 2.2 Endpoints Requeridos

---

**GET /volatilidad**

Query real:
```sql
SELECT
  "CodMultitabla"        AS id,
  "Campo"                AS nombre,
  "Key3"::INTEGER        AS pips,
  CASE WHEN "Marcado" = 1 THEN true ELSE false END AS "estadoActual"
FROM dbo.tbl_mmultitabla
WHERE "CodGrupo" = '0004'
ORDER BY "CodMultitabla";
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0004001",
      "nombre": "Volatilidad Activa",
      "pips": 100,
      "estadoActual": true
    },
    {
      "id": "0004002",
      "nombre": "Volatilidad Inactiva",
      "pips": 200,
      "estadoActual": false
    }
  ]
}
```

---

**PUT /volatilidad/{id}**

Query real:
```sql
UPDATE dbo.tbl_mmultitabla
SET
  "Key3"       = $1::VARCHAR,
  "Marcado"    = $2,
  "ModFecha"   = NOW(),
  "ModUsuario" = $3
WHERE "CodMultitabla" = $4
  AND "CodGrupo" = '0004'
RETURNING
  "CodMultitabla"                                    AS id,
  "Campo"                                            AS nombre,
  "Key3"::INTEGER                                    AS pips,
  CASE WHEN "Marcado" = 1 THEN true ELSE false END   AS "estadoActual";
```

**Request Body:**
```json
{
  "pips": 150,
  "estadoActual": true
}
```

**Validaciones:**
- `pips`: requerido, entero, mayor a 0, máximo 99999
- `estadoActual`: requerido, booleano

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "0004001",
    "nombre": "Volatilidad Activa",
    "pips": 150,
    "estadoActual": true
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Variable de volatilidad no encontrada"
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "PIPs debe ser un número entero mayor a 0"
}
```

### 2.3 Reglas de Negocio
- Solo se permite **editar**, no crear ni eliminar registros
- El campo **Nombre** es de solo lectura
- `Marcado = 1` → Estado actual activo (checkbox marcado)
- `Marcado = 0` → Estado actual inactivo (checkbox vacío)
- Todas las modificaciones generan registro en `tbl_pAuditoria`

### 2.4 Seguridad
- Bearer Token / API Key requerido
- Solo usuarios autorizados pueden editar

---

## 3. TASKS

### TASK-001 — Modelo TypeScript
**Archivo:** `src/models/volatilidad.model.ts`
```typescript
export interface Volatilidad {
  id: string;
  nombre: string;
  pips: number;
  estadoActual: boolean;
}

export interface UpdateVolatilidadDto {
  pips: number;
  estadoActual: boolean;
}
```
**Estimado:** 0.5h

---

### TASK-002 — Repository
**Archivo:** `src/repositories/volatilidad.repository.ts`
```typescript
import pool from '../config/database';
import { Volatilidad, UpdateVolatilidadDto } from '../models/volatilidad.model';

export const findAll = async (): Promise<Volatilidad[]> => {
  const { rows } = await pool.query(`
    SELECT
      "CodMultitabla"                                   AS id,
      "Campo"                                           AS nombre,
      "Key3"::INTEGER                                   AS pips,
      CASE WHEN "Marcado" = 1 THEN true ELSE false END  AS "estadoActual"
    FROM dbo.tbl_mmultitabla
    WHERE "CodGrupo" = '0004'
    ORDER BY "CodMultitabla"
  `);
  return rows;
};

export const updateById = async (
  id: string,
  dto: UpdateVolatilidadDto,
  modUsuario: number
): Promise<Volatilidad | null> => {
  const marcado = dto.estadoActual ? 1 : 0;
  const { rows } = await pool.query(`
    UPDATE dbo.tbl_mmultitabla
    SET
      "Key3"       = $1::VARCHAR,
      "Marcado"    = $2,
      "ModFecha"   = NOW(),
      "ModUsuario" = $3
    WHERE "CodMultitabla" = $4
      AND "CodGrupo" = '0004'
    RETURNING
      "CodMultitabla"                                   AS id,
      "Campo"                                           AS nombre,
      "Key3"::INTEGER                                   AS pips,
      CASE WHEN "Marcado" = 1 THEN true ELSE false END  AS "estadoActual"
  `, [String(dto.pips), marcado, modUsuario, id]);
  return rows[0] || null;
};
```
**Estimado:** 1h

---

### TASK-003 — Service
**Archivo:** `src/services/volatilidad.service.ts`
```typescript
import * as repo from '../repositories/volatilidad.repository';
import { UpdateVolatilidadDto } from '../models/volatilidad.model';

export const getAll = () => repo.findAll();

export const update = async (
  id: string,
  dto: UpdateVolatilidadDto,
  modUsuario: number
) => {
  if (!dto.pips || dto.pips <= 0 || dto.pips > 99999)
    throw new Error('PIPs debe ser un número entero entre 1 y 99999');
  if (typeof dto.estadoActual !== 'boolean')
    throw new Error('Estado actual debe ser verdadero o falso');

  const updated = await repo.updateById(id, dto, modUsuario);
  if (!updated) throw new Error('NOT_FOUND');
  return updated;
};
```
**Estimado:** 1h

---

### TASK-004 — Handler
**Archivo:** `src/handlers/volatilidad.ts`
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as service from '../services/volatilidad.service';
import { ok, notFound, badRequest, serverError } from '../utils/response.util';

export const volatilidadHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, body } = event;

  try {
    // GET /volatilidad
    if (httpMethod === 'GET' && path === '/volatilidad') {
      return ok(await service.getAll());
    }

    // PUT /volatilidad/{id}
    if (httpMethod === 'PUT' && pathParameters?.id) {
      const dto = JSON.parse(body || '{}');
      const modUsuario = 0; // TODO: extraer del token JWT
      return ok(await service.update(pathParameters.id, dto, modUsuario));
    }

    return badRequest('Método no permitido');

  } catch (error: any) {
    if (error.message === 'NOT_FOUND')
      return notFound('Variable de volatilidad no encontrada');
    if (error.message.includes('PIPs') || error.message.includes('Estado'))
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
import { volatilidadHandler } from './handlers/volatilidad';

if (path.startsWith('/volatilidad')) return volatilidadHandler(event);
```
**Estimado:** 0.25h

---

### TASK-006 — Tests Unitarios
**Archivo:** `tests/unit/volatilidad.service.test.ts`

Casos a probar:
- ✅ getAll → retorna 2 registros con CodGrupo=0004
- ✅ update → actualiza Key3 y Marcado correctamente
- ❌ update → PIPs <= 0
- ❌ update → PIPs > 99999
- ❌ update → estadoActual no es boolean
- ❌ update → id no existe en CodGrupo=0004

**Estimado:** 1.5h

---

### TASK-007 — Auditoría
```typescript
// Actualización volatilidad → código 'VOL001'
await auditoriaRepo.registrar({
  codTransaccion: 'VOL001',
  descripcion: `Actualización Variable Volatilidad ID: ${id}`,
  regUsuario: modUsuario,
  regFecha: new Date()
});
```
**Estimado:** 1h

---

## 4. RESUMEN DE ESTIMACIÓN

| Task | Descripción | Estimado |
|---|---|---|
| TASK-001 | Modelo TypeScript | 0.5h |
| TASK-002 | Repository | 1h |
| TASK-003 | Service | 1h |
| TASK-004 | Handler | 1h |
| TASK-005 | Registro de ruta | 0.25h |
| TASK-006 | Tests unitarios | 1.5h |
| TASK-007 | Auditoría | 1h |
| **TOTAL** | | **6.25h** |

---

## 5. NOTAS FINALES DE BD

| Dato | Valor real confirmado |
|---|---|
| Tabla | `dbo.tbl_mmultitabla` WHERE `CodGrupo = '0004'` |
| Nombre variable | campo `Campo` |
| PIPs | campo `Key3` (VARCHAR → castear a INTEGER) |
| Estado actual (checkbox) | campo `Marcado` (`1`=activo, `0`=inactivo) |
| Solo edición | No se crean ni eliminan registros |
