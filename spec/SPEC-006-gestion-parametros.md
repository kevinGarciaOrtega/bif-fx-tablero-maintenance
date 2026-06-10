# SPEC-006 — Módulo Gestión de Parámetros
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.0.0 | Fecha: 2026-06-09
## ✅ Mapeo real de BD confirmado

---

## 1. DESIGN

### 1.1 Pantalla Principal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Gestión de parámetros                                                           │
├──────┬──────────────────────┬─────────────────────────────────────┬─────────────────────────────┬──────────┐
│  N°  │  Grupo               │  Nombre                             │  Valor                      │ Acciones │
├──────┼──────────────────────┼─────────────────────────────────────┼─────────────────────────────┼──────────┤
│   1  │  Contingencia Datatec│  Activar contingencia (1:activo,    │  1                          │    ✏️    │
│      │                      │  0:inactivo)                        │                             │          │
│   2  │  Contingencia Datatec│  Tipo cambio Banco Compra           │  3.72                       │    ✏️    │
│   3  │  Contingencia Datatec│  Tipo cambio Banco Vende            │  3.73                       │    ✏️    │
│   4  │  Plataforma FX PJ    │  Importe máximo permitido en        │  500,000.00                 │    ✏️    │
│      │                      │  dólares (USD)                      │                             │          │
│   5  │  Plataforma FX PJ    │  Tiempo máximo contador (MM:SS)     │  05:00                      │    ✏️    │
│   6  │  Plataforma FX PN    │  Importe máximo permitido en        │  25,000.00                  │    ✏️    │
│      │                      │  dólares (USD)                      │                             │          │
│   7  │  Plataforma FX PN    │  Tiempo máximo contador (MM:SS)     │  05:00                      │    ✏️    │
│   8  │  Plataforma FX       │  Buzón de correos (separado por     │  dcorro@banbif.com.pe;      │    ✏️    │
│      │                      │  punto y coma)                      │  eriosa@banbif.com.pe       │          │
│   9  │  Plataforma FX       │  Tiempo límite de contador para     │  00:30                      │    ✏️    │
│      │                      │  mostrar banner (MM:SS)             │                             │          │
└──────┴──────────────────────┴─────────────────────────────────────┴─────────────────────────────┴──────────┘
```

**Características:**
- Solo registros con `NoEditable = 0` son visibles
- Sin botón `+ Nuevo` ni 🗑️ — solo edición
- Sin paginación (9 registros visibles)
- El campo `Grupo` se deriva del prefijo de `Descripcion`

### 1.2 Modal — Editar Parámetro

```
┌──────────────────────────────────────────────┐
│  Editar Parámetro                        [X] │
├──────────────────────────────────────────────┤
│  Grupo:    [Contingencia Datatec        ]    │  (readonly)
│  Nombre:   [Activar contingencia        ]    │  (readonly)
│            [(1:activo, 0:inactivo)      ]    │
│  Valor:    [1                           ]    │  (editable, texto libre)
│                                              │
│              [ 💾 Guardar ]                  │
└──────────────────────────────────────────────┘
```

**Campos del modal:**
| Campo | Tipo | Editable | Notas |
|---|---|---|---|
| Grupo | Text readonly | No | Derivado del prefijo de Descripcion |
| Nombre | Text readonly | No | Campo `Descripcion` completo |
| Valor | Text input | Sí | Campo `Valor` — texto libre |

---

## 2. REQUIREMENTS

### 2.1 Mapeo Real de BD ✅

#### Tabla: `dbo.tbl_mparametro`

| Campo UI | Campo DB | Tipo | Notas |
|---|---|---|---|
| N° | correlativo | — | Generado en frontend |
| Grupo | Derivado de `Descripcion` | — | Extraer prefijo antes del punto |
| Nombre | `Descripcion` | VARCHAR(256) | Descripción completa |
| Valor | `Valor` | VARCHAR(1000) | Editable |
| Filtro visibilidad | `NoEditable` | SMALLINT | `0` = visible/editable, `1` = oculto |

**Registros visibles (NoEditable = 0):**
```
CodParametro | Descripcion                                        | Valor           | Grupo
0001         | Plataforma FX PN. Tiempo máximo contador (MM:SS)   | 05:00           | Plataforma FX PN
0002         | Plataforma FX. Tiempo límite de contador...        | 00:30           | Plataforma FX
0003         | Plataforma FX PN. Importe máximo permitido...      | 250,000.00      | Plataforma FX PN
0004         | Plataforma FX. Buzón de correos...                 | dcorro@...      | Plataforma FX
0010         | Contingencia Datatec. Tipo cambio Banco Compra     | 3.7             | Contingencia Datatec
0011         | Contingencia Datatec. Tipo cambio Banco Vende      | 3.9234          | Contingencia Datatec
0012         | Contingencia Datatec. Activar contingencia...      | 0               | Contingencia Datatec
0013         | Plataforma FX PJ. Importe máximo permitido...      | 500,000.00      | Plataforma FX PJ
0014         | Plataforma FX PJ. Tiempo máximo contador...        | 05:00           | Plataforma FX PJ
```

**Registros ocultos (NoEditable = 1 — no aparecen en pantalla):**
```
CodParametro | Descripcion
0005         | Plataforma FX ETL. Frecuencia sincronización maestro
0006         | Plataforma FX ETL. Frecuencia sincronización banca clientes
0007         | Plataforma FX ETL. Fecha ejecución sincroniza maestro
0008         | Plataforma FX ETL. Fecha ejecución sincroniza banca clientes
0009         | Plataforma FX ETL. Servidor de correos
```

**Lógica extracción de Grupo en backend:**
```typescript
// Extraer grupo del prefijo de Descripcion antes del primer punto
// "Plataforma FX PN. Tiempo máximo..." → "Plataforma FX PN"
// "Contingencia Datatec. Tipo cambio..." → "Contingencia Datatec"
const extractGrupo = (descripcion: string): string =>
  descripcion.split('.')[0].trim();
```

### 2.2 Endpoints Requeridos

---

**GET /parametro**
Obtiene todos los parámetros editables (`NoEditable = 0`).

Query real:
```sql
SELECT
  "CodParametro"  AS id,
  "Descripcion"   AS nombre,
  "Valor"         AS valor,
  "NoEditable"    AS "noEditable"
FROM dbo.tbl_mparametro
WHERE "NoEditable" = 0
ORDER BY "MtTipoParametro", "CodParametro";
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "0010",
      "grupo": "Contingencia Datatec",
      "nombre": "Contingencia Datatec. Tipo cambio Banco Compra",
      "valor": "3.7"
    },
    {
      "id": "0011",
      "grupo": "Contingencia Datatec",
      "nombre": "Contingencia Datatec. Tipo cambio Banco Vende",
      "valor": "3.9234"
    },
    {
      "id": "0012",
      "grupo": "Contingencia Datatec",
      "nombre": "Contingencia Datatec. Activar contingencia (1:activo, 0:inactivo)",
      "valor": "0"
    },
    {
      "id": "0013",
      "grupo": "Plataforma FX PJ",
      "nombre": "Plataforma FX PJ. Importe máximo permitido en dólares (USD)",
      "valor": "500,000.00"
    },
    {
      "id": "0014",
      "grupo": "Plataforma FX PJ",
      "nombre": "Plataforma FX PJ. Tiempo máximo contador (MM:SS)",
      "valor": "05:00"
    },
    {
      "id": "0001",
      "grupo": "Plataforma FX PN",
      "nombre": "Plataforma FX PN. Tiempo máximo contador (MM:SS)",
      "valor": "05:00"
    },
    {
      "id": "0003",
      "grupo": "Plataforma FX PN",
      "nombre": "Plataforma FX PN. Importe máximo permitido en dólares (USD)",
      "valor": "250,000.00"
    },
    {
      "id": "0004",
      "grupo": "Plataforma FX",
      "nombre": "Plataforma FX. Buzón de correos (separado por punto y coma)",
      "valor": "dcorro@banbif.com.pe;eriosa@banbif.com.pe"
    },
    {
      "id": "0002",
      "grupo": "Plataforma FX",
      "nombre": "Plataforma FX. Tiempo límite de contador para mostrar banner (MM:SS)",
      "valor": "00:30"
    }
  ]
}
```

---

**PUT /parametro/{id}**
Actualiza el valor de un parámetro.

Query real:
```sql
UPDATE dbo.tbl_mparametro
SET
  "Valor"      = $1,
  "ModFecha"   = NOW(),
  "ModUsuario" = $2
WHERE "CodParametro" = $3
  AND "NoEditable"   = 0
RETURNING
  "CodParametro" AS id,
  "Descripcion"  AS nombre,
  "Valor"        AS valor;
```

**Request Body:**
```json
{
  "valor": "3.85"
}
```

**Validaciones:**
- `valor`: requerido, no vacío, máximo 1000 caracteres
- Solo se puede editar si `NoEditable = 0`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "0010",
    "grupo": "Contingencia Datatec",
    "nombre": "Contingencia Datatec. Tipo cambio Banco Compra",
    "valor": "3.85"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "El valor es requerido"
}
```

**Response 403:**
```json
{
  "success": false,
  "message": "Este parámetro no es editable"
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Parámetro no encontrado"
}
```

### 2.3 Reglas de Negocio
- Solo registros con `NoEditable = 0` son visibles y editables
- Registros con `NoEditable = 1` están protegidos → responde 403 si se intenta editar
- El campo `Grupo` se extrae del prefijo de `Descripcion` (texto antes del primer `.`)
- `Nombre` y `Grupo` son de solo lectura en el modal
- Solo se edita el campo `Valor` (texto libre)
- Todas las modificaciones registran en `tbl_pAuditoria` y `tbl_pParametro_Historico`

### 2.4 Seguridad
- Bearer Token / API Key requerido
- Solo usuarios autorizados pueden editar parámetros

---

## 3. TASKS

### TASK-001 — Modelo TypeScript
**Archivo:** `src/models/parametro.model.ts`
```typescript
export interface Parametro {
  id: string;
  grupo: string;
  nombre: string;
  valor: string;
}

export interface UpdateParametroDto {
  valor: string;
}
```
**Estimado:** 0.5h

---

### TASK-002 — Repository
**Archivo:** `src/repositories/parametro.repository.ts`
```typescript
import pool from '../config/database';
import { Parametro, UpdateParametroDto } from '../models/parametro.model';

const extractGrupo = (descripcion: string): string =>
  descripcion.split('.')[0].trim();

export const findAll = async (): Promise<Parametro[]> => {
  const { rows } = await pool.query(`
    SELECT
      "CodParametro" AS id,
      "Descripcion"  AS nombre,
      "Valor"        AS valor
    FROM dbo.tbl_mparametro
    WHERE "NoEditable" = 0
    ORDER BY "MtTipoParametro", "CodParametro"
  `);
  return rows.map(r => ({ ...r, grupo: extractGrupo(r.nombre) }));
};

export const findById = async (id: string): Promise<(Parametro & { noEditable: number }) | null> => {
  const { rows } = await pool.query(`
    SELECT
      "CodParametro" AS id,
      "Descripcion"  AS nombre,
      "Valor"        AS valor,
      "NoEditable"   AS "noEditable"
    FROM dbo.tbl_mparametro
    WHERE "CodParametro" = $1
  `, [id]);
  if (!rows[0]) return null;
  return { ...rows[0], grupo: extractGrupo(rows[0].nombre) };
};

export const updateById = async (
  id: string,
  dto: UpdateParametroDto,
  modUsuario: number
): Promise<Parametro | null> => {
  const { rows } = await pool.query(`
    UPDATE dbo.tbl_mparametro
    SET
      "Valor"      = $1,
      "ModFecha"   = NOW(),
      "ModUsuario" = $2
    WHERE "CodParametro" = $3
      AND "NoEditable"   = 0
    RETURNING
      "CodParametro" AS id,
      "Descripcion"  AS nombre,
      "Valor"        AS valor
  `, [dto.valor, modUsuario, id]);
  if (!rows[0]) return null;
  return { ...rows[0], grupo: extractGrupo(rows[0].nombre) };
};

export const saveHistorico = async (
  id: string,
  valorAnterior: string,
  valorNuevo: string,
  modUsuario: number
): Promise<void> => {
  await pool.query(`
    INSERT INTO dbo.tbl_pparametro_historico
      ("CodParametro","Valor","RegUsuario","RegFecha")
    VALUES ($1, $2, $3, NOW())
  `, [id, valorAnterior, modUsuario]);
};
```
**Estimado:** 1.5h

---

### TASK-003 — Service
**Archivo:** `src/services/parametro.service.ts`
```typescript
import * as repo from '../repositories/parametro.repository';
import { UpdateParametroDto } from '../models/parametro.model';

export const getAll = () => repo.findAll();

export const update = async (
  id: string,
  dto: UpdateParametroDto,
  modUsuario: number
) => {
  if (!dto.valor?.trim())
    throw new Error('El valor es requerido');
  if (dto.valor.length > 1000)
    throw new Error('El valor no puede superar los 1000 caracteres');

  // Verificar existencia y si es editable
  const existing = await repo.findById(id);
  if (!existing) throw new Error('NOT_FOUND');
  if (existing.noEditable === 1) throw new Error('NOT_EDITABLE');

  // Guardar histórico antes de actualizar
  await repo.saveHistorico(id, existing.valor, dto.valor, modUsuario);

  return repo.updateById(id, dto, modUsuario);
};
```
**Estimado:** 1h

---

### TASK-004 — Handler
**Archivo:** `src/handlers/parametro.ts`
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as service from '../services/parametro.service';
import { ok, notFound, badRequest, serverError } from '../utils/response.util';

const forbidden = (msg: string) => ({
  statusCode: 403,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify({ success: false, message: msg })
});

export const parametroHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  const id         = pathParameters?.id;
  const modUsuario = 0; // TODO: extraer del token JWT

  try {
    // GET /parametro
    if (httpMethod === 'GET' && !id)
      return ok(await service.getAll());

    // PUT /parametro/{id}
    if (httpMethod === 'PUT' && id)
      return ok(await service.update(id, JSON.parse(body || '{}'), modUsuario));

    return badRequest('Ruta no encontrada');

  } catch (error: any) {
    if (error.message === 'NOT_FOUND')
      return notFound('Parámetro no encontrado');
    if (error.message === 'NOT_EDITABLE')
      return forbidden('Este parámetro no es editable');
    if (['valor', 'caracteres'].some(k => error.message.toLowerCase().includes(k)))
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
import { parametroHandler } from './handlers/parametro';

if (path.startsWith('/parametro')) return parametroHandler(event);
```
**Estimado:** 0.25h

---

### TASK-006 — Tests Unitarios
Casos a probar:
- ✅ getAll → retorna solo registros con NoEditable=0
- ✅ getAll → campo `grupo` extraído correctamente del prefijo
- ✅ update → actualiza Valor correctamente
- ✅ update → guarda en tbl_pparametro_historico antes de actualizar
- ❌ update → valor vacío
- ❌ update → valor supera 1000 caracteres
- ❌ update → id no existe (NOT_FOUND)
- ❌ update → NoEditable=1 (NOT_EDITABLE → 403)

**Estimado:** 2h

---

### TASK-007 — Auditoría + Histórico
```typescript
// Editar parámetro → 'PAR001'
// Además guardar en tbl_pparametro_historico (ya incluido en TASK-002)
```
**Estimado:** 0.75h

---

## 4. RESUMEN DE ESTIMACIÓN

| Task | Descripción | Estimado |
|---|---|---|
| TASK-001 | Modelo TypeScript | 0.5h |
| TASK-002 | Repository | 1.5h |
| TASK-003 | Service | 1h |
| TASK-004 | Handler | 1h |
| TASK-005 | Registro de ruta | 0.25h |
| TASK-006 | Tests unitarios | 2h |
| TASK-007 | Auditoría + Histórico | 0.75h |
| **TOTAL** | | **7h** |

---

## 5. NOTAS FINALES DE BD

| Dato | Valor confirmado |
|---|---|
| Tabla principal | `dbo.tbl_mparametro` |
| Tabla histórico | `dbo.tbl_pparametro_historico` |
| Registros visibles | `NoEditable = 0` (9 registros) |
| Registros ocultos | `NoEditable = 1` (5 registros ETL) |
| Campo Grupo | Derivado: prefijo de `Descripcion` antes del `.` |
| Campo editable | Solo `Valor` (VARCHAR 1000) |
| Histórico | Guardar valor anterior en `tbl_pparametro_historico` antes de actualizar |
| Operaciones permitidas | Solo GET y PUT |
