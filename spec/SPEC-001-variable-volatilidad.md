# SPEC — Módulo Variable Volatilidad
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.0.0 | Fecha: 2026-06-09

---

## 1. DESIGN

### 1.1 Pantalla Principal — Lista de Variables

```
┌─────────────────────────────────────────────────────────────┐
│  Variable Volatilidad                                        │
├──────┬───────────────────────────┬────────┬─────────────────┤
│  N°  │  Nombre                   │  PIPs  │  Estado actual  │  Acciones │
├──────┼───────────────────────────┼────────┼─────────────────┤
│  1   │  Volatilidad Activa       │  100   │  [ ]            │  ✏️        │
│  2   │  Volatilidad Inactiva     │  200   │  [✓]            │  ✏️        │
└──────┴───────────────────────────┴────────┴─────────────────┘
```

**Componentes:**
- Tabla con columnas: N°, Nombre, PIPs, Estado actual (checkbox readonly), Acciones
- Botón editar (ícono lápiz) por fila → abre modal
- Sin botón de crear (datos precargados)
- Sin paginación (pocos registros)

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
| Estado | Text readonly | No | Nombre de la variable (ej: "Volatilidad Activa") |
| PIPs | Number input | Sí | Valor numérico de PIPs |
| Estado actual | Dropdown | Sí | Activo / Inactivo |

**Comportamiento:**
- Al abrir modal → carga datos actuales del registro
- Dropdown Estado actual → valores: `Activo` / `Inactivo`
- Al guardar → PUT al endpoint → cierra modal → refresca tabla
- Al cerrar [X] → descarta cambios

---

## 2. REQUIREMENTS

### 2.1 Mapeo de Datos
La pantalla Variable Volatilidad corresponde a la tabla **`dbo.tbl_mcliente`**:

| Campo UI | Campo DB | Tipo DB | Notas |
|---|---|---|---|
| N° | correlativo | — | Generado en frontend (índice) |
| Nombre | `MtEstado` | VARCHAR(7) | Nombre descriptivo del estado |
| PIPs | `Pips` | INTEGER | Valor de PIPs |
| Estado actual | `FlagCalculoMora` | BOOLEAN | true=Activo, false=Inactivo |

> ⚠️ Nota: Revisar si existe tabla específica para Volatilidad. De acuerdo a los datos migrados, los registros de volatilidad están almacenados en `tbl_mcliente` filtrando por un criterio específico, o en `tbl_mMultitabla` con un CodGrupo determinado. **Confirmar con el equipo antes de implementar.**

### 2.2 Endpoints Requeridos

#### GET /volatilidad
Obtiene lista de variables de volatilidad.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "codCliente": 1,
      "nombre": "Volatilidad Activa",
      "pips": 100,
      "estadoActual": false
    },
    {
      "codCliente": 2,
      "nombre": "Volatilidad Inactiva",
      "pips": 200,
      "estadoActual": true
    }
  ]
}
```

#### PUT /volatilidad/{id}
Actualiza PIPs y estado de una variable.

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
    "codCliente": 1,
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
- El campo **Nombre/Estado** es de solo lectura (no editable)
- Solo un registro puede tener `estadoActual = true` a la vez *(confirmar con negocio)*
- El cambio de estado debe registrarse en `tbl_pAuditoria`

### 2.4 Seguridad
- Endpoint protegido con API Key o JWT (Bearer token)
- Solo usuarios con rol autorizado pueden editar
- Todas las modificaciones generan registro de auditoría

---

## 3. TASKS

### TASK-001 — Modelo TypeScript
**Archivo:** `src/models/volatilidad.model.ts`
```typescript
export interface Volatilidad {
  codCliente: number;
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
  const query = `
    SELECT 
      "CodCliente"      AS "codCliente",
      "MtEstado"        AS nombre,
      "Pips"            AS pips,
      "FlagCalculoMora" AS "estadoActual"
    FROM dbo.tbl_mcliente
    ORDER BY "CodCliente"
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const updateById = async (
  id: number,
  dto: UpdateVolatilidadDto
): Promise<Volatilidad | null> => {
  const query = `
    UPDATE dbo.tbl_mcliente
    SET 
      "Pips"            = $1,
      "FlagCalculoMora" = $2,
      "ModFecha"        = NOW(),
      "ModUsuario"      = $3
    WHERE "CodCliente" = $4
    RETURNING 
      "CodCliente"      AS "codCliente",
      "MtEstado"        AS nombre,
      "Pips"            AS pips,
      "FlagCalculoMora" AS "estadoActual"
  `;
  const result = await pool.query(query, [dto.pips, dto.estadoActual, 0, id]);
  return result.rows[0] || null;
};
```
**Estimado:** 1h

---

### TASK-003 — Service
**Archivo:** `src/services/volatilidad.service.ts`
```typescript
import * as repo from '../repositories/volatilidad.repository';
import { UpdateVolatilidadDto } from '../models/volatilidad.model';

export const getAll = async () => {
  return await repo.findAll();
};

export const update = async (id: number, dto: UpdateVolatilidadDto) => {
  // Validaciones
  if (!dto.pips || dto.pips <= 0) {
    throw new Error('PIPs debe ser un número entero mayor a 0');
  }
  if (typeof dto.estadoActual !== 'boolean') {
    throw new Error('Estado actual debe ser verdadero o falso');
  }

  const updated = await repo.updateById(id, dto);
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
  const { httpMethod, pathParameters, body } = event;

  try {
    // GET /volatilidad
    if (httpMethod === 'GET' && !pathParameters?.id) {
      const data = await service.getAll();
      return ok(data);
    }

    // PUT /volatilidad/{id}
    if (httpMethod === 'PUT' && pathParameters?.id) {
      const id = parseInt(pathParameters.id);
      const dto = JSON.parse(body || '{}');
      const data = await service.update(id, dto);
      return ok(data);
    }

    return badRequest('Método no permitido');

  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return notFound('Variable de volatilidad no encontrada');
    if (error.message.includes('PIPs') || error.message.includes('Estado')) {
      return badRequest(error.message);
    }
    return serverError('Error interno del servidor');
  }
};
```
**Estimado:** 1h

---

### TASK-005 — Registrar ruta en index.ts
```typescript
// En src/index.ts agregar:
import { volatilidadHandler } from './handlers/volatilidad';

// En el router:
if (path.startsWith('/volatilidad')) return volatilidadHandler(event);
```
**Estimado:** 0.25h

---

### TASK-006 — Configurar API Gateway
```bash
# Crear recurso /volatilidad en API Gateway
aws apigateway create-resource \
  --rest-api-id {API_ID} \
  --parent-id {ROOT_ID} \
  --path-part "volatilidad" \
  --region us-west-2

# Métodos: GET, PUT (con proxy al Lambda)
```
**Estimado:** 1h

---

### TASK-007 — Tests unitarios
**Archivo:** `tests/unit/volatilidad.service.test.ts`

Casos a probar:
- ✅ getAll → retorna lista de volatilidades
- ✅ update → actualiza correctamente PIPs y estado
- ❌ update → error si PIPs <= 0
- ❌ update → error si id no existe
- ❌ update → error si estadoActual no es boolean

**Estimado:** 1.5h

---

### TASK-008 — Auditoría
Registrar en `tbl_pAuditoria` cada actualización:
```typescript
// Agregar en service después del update:
await auditoriaRepo.registrar({
  ipCliente: event.requestContext.identity.sourceIp,
  codTransaccion: 'VOL001',
  descripcion: `Actualización Variable Volatilidad ID: ${id}`,
  regUsuario: usuarioId,
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
| TASK-006 | API Gateway | 1h |
| TASK-007 | Tests unitarios | 1.5h |
| TASK-008 | Auditoría | 1h |
| **TOTAL** | | **7.25h** |

---

## 5. DEPENDENCIAS Y PREGUNTAS ABIERTAS

1. ⚠️ **Confirmar tabla origen**: ¿Los registros de volatilidad vienen de `tbl_mcliente` o de `tbl_mMultitabla`? Revisar con el equipo de negocio.
2. ⚠️ **Regla de unicidad**: ¿Solo puede haber un registro activo a la vez?
3. ⚠️ **Autenticación**: ¿API Key o JWT? ¿Qué sistema de auth usa el frontend React?
4. ⚠️ **CodUsuario auditoría**: ¿Cómo se obtiene el usuario logueado desde el token?
