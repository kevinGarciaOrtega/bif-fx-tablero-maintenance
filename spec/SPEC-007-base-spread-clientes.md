# SPEC-007 — Módulo Base Spread de Clientes
## Proyecto: bif-fx-tablero-maintenance
## Versión: 1.0.0 | Fecha: 2026-06-09
## ✅ Mapeo real de BD confirmado

---

## 1. DESIGN

### 1.1 Pantalla Principal

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Base spread de clientes                                                          │
│                                                                                   │
│  ── Criterios de Búsqueda ──────────────────────────────────────────────────── │
│  Código de cliente IBS: [              ]    Nombre Cliente:  [              ]    │
│  Nro Documento:         [              ]    Segmento:        [Seleccione... ▼]   │
│  Flag motor:            [Seleccione... ▼]   Tipo Documento:  [Seleccione... ▼]   │
│                         [🔍 Buscar] [✏️ Limpiar]                                 │
│                                             Tipo Personería: [Seleccione... ▼]   │
│                                                                                   │
│  ── Resultados de la Búsqueda ──────────────────── [📥 Exportar] [+ Nuevo]      │
│  ┌────┬──────────────┬──────────────────┬──────────────┬──────────────────────┬────────────┬───────────────────────────┬────────────┬──────────┬──────────┐
│  │ N° │ Tipo doc     │ Tipo personería   │ Nro doc      │ Nombres/Razón Social │ Código IBS │ Segmento Banca            │ Spread(PIPs│ Flag mot │ Acciones │
│  ├────┼──────────────┼──────────────────┼──────────────┼──────────────────────┼────────────┼───────────────────────────┼────────────┼──────────┼──────────┤
│  │  1 │ RUC          │ Persona Jurídica  │ 20100055237  │ ALICO                │ 437        │ BANCA CORPORATIVA GRUPO 1 │ 150        │ Activo   │  ✏️ 🗑️  │
│  │  2 │ RUC          │ Persona Jurídica  │ 20379806768  │ GRUPO                │ 52291      │ BANCA CORPORATIVA GRUPO 2 │ 20         │ Inactivo │  ✏️ 🗑️  │
│  │  3 │ DNI          │ Persona Natural   │ 07813699     │ PUG CAS MAR DEL      │ 2461987    │ BANCA PREMIUM             │ 150        │ Inactivo │  ✏️ 🗑️  │
│  └────┴──────────────┴──────────────────┴──────────────┴──────────────────────┴────────────┴───────────────────────────┴────────────┴──────────┴──────────┘
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Filtros disponibles

| Filtro | Tipo | Campo BD | Valores |
|---|---|---|---|
| Código de cliente IBS | Text input | `c.CodClienteIbs` | Número libre |
| Nombre Cliente | Text input | `i.ApPaternoRazon` + `i.Nombres` | Texto parcial |
| Nro Documento | Text input | `i.NroDocumento` | Número libre |
| Segmento | Dropdown | `i.CodBanca` | Desde `tbl_mmultitabla CodGrupo='0007'` |
| Flag motor | Dropdown | `c.FlagCalculoMora` | Activo / Inactivo |
| Tipo Documento | Dropdown | `i.CodTipoDocumento` | Desde `tbl_mmultitabla CodGrupo='0002'` |
| Tipo Personería | Dropdown | `i.CodTipoPersona` | Desde `tbl_mmultitabla CodGrupo='0003'` |

### 1.3 Acciones disponibles
- `[🔍 Buscar]` → aplica filtros y recarga resultados
- `[✏️ Limpiar]` → limpia todos los filtros y recarga
- `[📥 Exportar]` → descarga resultados en Excel/CSV
- `[+ Nuevo]` → abre modal de creación
- ✏️ → abre modal de edición
- 🗑️ → confirmación → baja lógica

---

## 2. REQUIREMENTS

### 2.1 Mapeo Real de BD ✅

#### Tablas involucradas:

| Tabla | Alias | Rol |
|---|---|---|
| `dbo.tbl_mcliente` | `c` | Tabla principal (Spread, Flag motor, Estado) |
| `dbo.tbl_mclienteibs` | `i` | Datos del cliente (Nombre, Doc, Banca) |
| `dbo.tbl_mmultitabla` CodGrupo=`0007` | `seg` | Segmento Banca (descripción) |
| `dbo.tbl_mmultitabla` CodGrupo=`0002` | — | Tipo Documento (dropdown) |
| `dbo.tbl_mmultitabla` CodGrupo=`0003` | — | Tipo Personería (dropdown) |

#### Mapeo de columnas UI → BD:

| Columna UI | Campo BD | Tabla | Notas |
|---|---|---|---|
| N° | correlativo | — | Frontend |
| Tipo documento | `i.CodTipoDocumento` → lookup `0002.Valor` | tbl_mclienteibs + tbl_mmultitabla | DNI, RUC, etc. |
| Tipo personería | `i.CodTipoPersona` → lookup `0003.Valor` | tbl_mclienteibs + tbl_mmultitabla | PN / PJ |
| Nro documento | `i.NroDocumento` | tbl_mclienteibs | |
| Nombres/Razón Social | `i.ApPaternoRazon` + `i.ApMaterno` + `i.Nombres` | tbl_mclienteibs | Concatenar |
| Código IBS | `c.CodClienteIbs` | tbl_mcliente | |
| Segmento Banca | `i.Banca` | tbl_mclienteibs | Descripción de banca |
| Spread (PIPs) | `c.Pips` | tbl_mcliente | INTEGER |
| Flag motor | `c.FlagCalculoMora` | tbl_mcliente | BOOLEAN → "Activo"/"Inactivo" |

#### Valores de Dropdowns:

**Tipo Documento (CodGrupo=0002):**
```
Key1=1  → DNI
Key1=3  → Carnet de extranjería
Key1=5  → Pasaporte
Key1=8  → RUC
Key1=4  → Carnet Militar
Key1=6  → Temporal
Key1=9  → Autogenerado
```

**Tipo Personería (CodGrupo=0003):**
```
Valor → Persona Natural
Valor → Persona Jurídica
```

**Flag motor:**
```
true  → Activo
false → Inactivo
```

### 2.2 Endpoints Requeridos

---

**GET /cliente/spread?codClienteIbs=&nombre=&nroDocumento=&segmento=&flagMotor=&tipoDocumento=&tipoPersoneria=&page=1&limit=10**

Query real:
```sql
SELECT
  c."CodCliente"                                          AS "codCliente",
  c."CodClienteIbs"                                       AS "codClienteIbs",
  i."CodTipoDocumento"                                    AS "codTipoDocumento",
  td."Valor"                                              AS "tipoDocumento",
  i."CodTipoPersona"                                      AS "codTipoPersona",
  tp."Valor"                                              AS "tipoPersoneria",
  i."NroDocumento"                                        AS "nroDocumento",
  CONCAT_WS(' ',
    NULLIF(i."ApPaternoRazon",''),
    NULLIF(i."ApMaterno",''),
    NULLIF(i."Nombres",'')
  )                                                       AS "nombreCompleto",
  i."CodBanca"                                            AS "codBanca",
  i."Banca"                                               AS "segmentoBanca",
  c."Pips"                                                AS "spreadPips",
  c."FlagCalculoMora"                                     AS "flagMotor",
  c."MtEstado"                                            AS "mtEstado"
FROM dbo.tbl_mcliente c
LEFT JOIN dbo.tbl_mclienteibs i
  ON c."CodClienteIbs" = i."CodClienteIbs"
LEFT JOIN dbo.tbl_mmultitabla td
  ON td."Key1" = i."CodTipoDocumento"
  AND td."CodGrupo" = '0002'
LEFT JOIN dbo.tbl_mmultitabla tp
  ON tp."Key1" = i."CodTipoPersona"
  AND tp."CodGrupo" = '0003'
WHERE c."MtEstado" = '0001001'
  AND ($1 = '' OR CAST(c."CodClienteIbs" AS VARCHAR) LIKE '%' || $1 || '%')
  AND ($2 = '' OR UPPER(CONCAT_WS(' ', i."ApPaternoRazon", i."ApMaterno", i."Nombres"))
                  LIKE UPPER('%' || $2 || '%'))
  AND ($3 = '' OR i."NroDocumento" LIKE '%' || $3 || '%')
  AND ($4 = '' OR i."CodBanca" = $4)
  AND ($5::BOOLEAN IS NULL OR c."FlagCalculoMora" = $5::BOOLEAN)
  AND ($6 = '' OR i."CodTipoDocumento" = $6)
  AND ($7 = '' OR i."CodTipoPersona" = $7)
ORDER BY c."CodCliente"
LIMIT $8 OFFSET $9;
```

**Query params:**
| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `codClienteIbs` | string | '' | Código cliente IBS |
| `nombre` | string | '' | Nombre parcial case-insensitive |
| `nroDocumento` | string | '' | Número de documento parcial |
| `segmento` | string | '' | CodBanca exacto |
| `flagMotor` | boolean | null | true=Activo, false=Inactivo |
| `tipoDocumento` | string | '' | CodTipoDocumento (Key1 de 0002) |
| `tipoPersoneria` | string | '' | CodTipoPersona (Key1 de 0003) |
| `page` | number | 1 | Página actual |
| `limit` | number | 10 | Registros por página |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "codCliente": 3745,
      "codClienteIbs": 46812,
      "codTipoDocumento": "1",
      "tipoDocumento": "DNI",
      "codTipoPersona": "2",
      "tipoPersoneria": "Persona Natural",
      "nroDocumento": "001099740",
      "nombreCompleto": "BARRIENTOS GUADALUPE",
      "codBanca": "0002",
      "segmentoBanca": "BANCA PREMIUM",
      "spreadPips": 50,
      "flagMotor": true
    }
  ],
  "pagination": {
    "total": 743,
    "page": 1,
    "limit": 10,
    "totalPages": 75
  }
}
```

---

**GET /cliente/spread/dropdowns**
Obtiene los valores para los dropdowns de filtros.

Query real:
```sql
-- Segmentos
SELECT DISTINCT "Key1" AS valor, "Valor" AS label
FROM dbo.tbl_mmultitabla
WHERE "CodGrupo" = '0007' AND "Estado" = 1
ORDER BY "Valor";

-- Tipo Documento
SELECT "Key1" AS valor, "Valor" AS label
FROM dbo.tbl_mmultitabla
WHERE "CodGrupo" = '0002' AND "Estado" = 1
ORDER BY "Valor";

-- Tipo Personería
SELECT "Key1" AS valor, "Valor" AS label
FROM dbo.tbl_mmultitabla
WHERE "CodGrupo" = '0003' AND "Estado" = 1
ORDER BY "Valor";
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "segmentos": [
      { "valor": "0001", "label": "DIVISION DE NEGOCIOS" },
      { "valor": "0002", "label": "BANCA PREMIUM" }
    ],
    "tiposDocumento": [
      { "valor": "1", "label": "DNI" },
      { "valor": "8", "label": "RUC" }
    ],
    "tiposPersoneria": [
      { "valor": "2", "label": "Persona Natural" },
      { "valor": "1", "label": "Persona Jurídica" }
    ],
    "flagMotor": [
      { "valor": true, "label": "Activo" },
      { "valor": false, "label": "Inactivo" }
    ]
  }
}
```

---

**GET /cliente/spread/exportar?[mismos filtros]**
Exporta los resultados filtrados en formato CSV/Excel.

- Mismos filtros que el GET principal
- Sin paginación (trae todos los registros)
- Responde con archivo CSV o binario Excel

**Response 200:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="spread_clientes.csv"
```

### 2.3 Reglas de Negocio
- Solo se muestran clientes con `MtEstado = '0001001'` (activos)
- Todos los filtros son opcionales y combinables
- Búsqueda por nombre es **case insensitive** y parcial
- `flagMotor`: `true` = Activo, `false` = Inactivo
- El campo `Nombres/Razón Social` concatena `ApPaternoRazon + ApMaterno + Nombres`
- Paginación obligatoria (tabla con 743+ registros)
- Exportar devuelve **todos** los registros filtrados sin límite

### 2.4 Seguridad
- Bearer Token / API Key requerido
- Solo usuarios autorizados pueden ver y exportar

---

## 3. TASKS

### TASK-001 — Modelos TypeScript
**Archivo:** `src/models/cliente-spread.model.ts`
```typescript
export interface ClienteSpread {
  codCliente: number;
  codClienteIbs: number;
  codTipoDocumento: string;
  tipoDocumento: string;
  codTipoPersona: string;
  tipoPersoneria: string;
  nroDocumento: string;
  nombreCompleto: string;
  codBanca: string;
  segmentoBanca: string;
  spreadPips: number;
  flagMotor: boolean;
}

export interface ClienteSpreadFiltros {
  codClienteIbs?: string;
  nombre?: string;
  nroDocumento?: string;
  segmento?: string;
  flagMotor?: boolean | null;
  tipoDocumento?: string;
  tipoPersoneria?: string;
  page?: number;
  limit?: number;
}

export interface DropdownOption {
  valor: string | boolean;
  label: string;
}

export interface ClienteSpreadDropdowns {
  segmentos: DropdownOption[];
  tiposDocumento: DropdownOption[];
  tiposPersoneria: DropdownOption[];
  flagMotor: DropdownOption[];
}
```
**Estimado:** 0.75h

---

### TASK-002 — Repository
**Archivo:** `src/repositories/cliente-spread.repository.ts`
```typescript
import pool from '../config/database';
import { ClienteSpread, ClienteSpreadFiltros, ClienteSpreadDropdowns } from '../models/cliente-spread.model';

const MT_ESTADO_ACTIVO = '0001001';

export const findAll = async (
  filtros: ClienteSpreadFiltros
): Promise<{ rows: ClienteSpread[]; total: number }> => {
  const {
    codClienteIbs = '', nombre = '', nroDocumento = '',
    segmento = '', flagMotor = null, tipoDocumento = '',
    tipoPersoneria = '', page = 1, limit = 10
  } = filtros;
  const offset = (page - 1) * limit;

  const params = [
    codClienteIbs, nombre, nroDocumento, segmento,
    flagMotor, tipoDocumento, tipoPersoneria,
    limit, offset
  ];

  const baseQuery = `
    FROM dbo.tbl_mcliente c
    LEFT JOIN dbo.tbl_mclienteibs i ON c."CodClienteIbs" = i."CodClienteIbs"
    LEFT JOIN dbo.tbl_mmultitabla td ON td."Key1" = i."CodTipoDocumento" AND td."CodGrupo" = '0002'
    LEFT JOIN dbo.tbl_mmultitabla tp ON tp."Key1" = i."CodTipoPersona"  AND tp."CodGrupo" = '0003'
    WHERE c."MtEstado" = '${MT_ESTADO_ACTIVO}'
      AND ($1 = '' OR CAST(c."CodClienteIbs" AS VARCHAR) LIKE '%' || $1 || '%')
      AND ($2 = '' OR UPPER(CONCAT_WS(' ', i."ApPaternoRazon", i."ApMaterno", i."Nombres"))
                      LIKE UPPER('%' || $2 || '%'))
      AND ($3 = '' OR i."NroDocumento" LIKE '%' || $3 || '%')
      AND ($4 = '' OR i."CodBanca" = $4)
      AND ($5::BOOLEAN IS NULL OR c."FlagCalculoMora" = $5::BOOLEAN)
      AND ($6 = '' OR i."CodTipoDocumento" = $6)
      AND ($7 = '' OR i."CodTipoPersona" = $7)
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(`
      SELECT
        c."CodCliente"        AS "codCliente",
        c."CodClienteIbs"     AS "codClienteIbs",
        i."CodTipoDocumento"  AS "codTipoDocumento",
        td."Valor"            AS "tipoDocumento",
        i."CodTipoPersona"    AS "codTipoPersona",
        tp."Valor"            AS "tipoPersoneria",
        i."NroDocumento"      AS "nroDocumento",
        CONCAT_WS(' ',
          NULLIF(i."ApPaternoRazon",''),
          NULLIF(i."ApMaterno",''),
          NULLIF(i."Nombres",'')
        )                     AS "nombreCompleto",
        i."CodBanca"          AS "codBanca",
        i."Banca"             AS "segmentoBanca",
        c."Pips"              AS "spreadPips",
        c."FlagCalculoMora"   AS "flagMotor"
      ${baseQuery}
      ORDER BY c."CodCliente"
      LIMIT $8 OFFSET $9
    `, params),
    pool.query(`SELECT COUNT(*) AS total ${baseQuery}`, params.slice(0, 7))
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].total) };
};

export const findAllExport = async (filtros: Omit<ClienteSpreadFiltros, 'page' | 'limit'>) => {
  const { rows } = await findAll({ ...filtros, page: 1, limit: 999999 });
  return rows;
};

export const getDropdowns = async (): Promise<ClienteSpreadDropdowns> => {
  const [segResult, docResult, perResult] = await Promise.all([
    pool.query(`
      SELECT DISTINCT m."Key1" AS valor, i."Banca" AS label
      FROM dbo.tbl_mmultitabla m
      JOIN dbo.tbl_mbancaibs i ON m."Key1" = i."CodBanca"
      WHERE m."CodGrupo" = '0007' AND m."Estado" = 1
      ORDER BY label
    `),
    pool.query(`
      SELECT "Key1" AS valor, "Valor" AS label
      FROM dbo.tbl_mmultitabla
      WHERE "CodGrupo" = '0002' AND "Estado" = 1
      ORDER BY label
    `),
    pool.query(`
      SELECT "Key1" AS valor, "Valor" AS label
      FROM dbo.tbl_mmultitabla
      WHERE "CodGrupo" = '0003' AND "Estado" = 1
      ORDER BY label
    `)
  ]);

  return {
    segmentos: segResult.rows,
    tiposDocumento: docResult.rows,
    tiposPersoneria: perResult.rows,
    flagMotor: [
      { valor: true,  label: 'Activo' },
      { valor: false, label: 'Inactivo' }
    ]
  };
};
```
**Estimado:** 2.5h

---

### TASK-003 — Service
**Archivo:** `src/services/cliente-spread.service.ts`
```typescript
import * as repo from '../repositories/cliente-spread.repository';
import { ClienteSpreadFiltros } from '../models/cliente-spread.model';

export const getAll = async (filtros: ClienteSpreadFiltros) => {
  const page  = Math.max(1, filtros.page  || 1);
  const limit = Math.min(100, filtros.limit || 10);
  const { rows, total } = await repo.findAll({ ...filtros, page, limit });
  return {
    data: rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

export const getDropdowns = () => repo.getDropdowns();

export const exportar = async (filtros: Omit<ClienteSpreadFiltros, 'page' | 'limit'>) => {
  return repo.findAllExport(filtros);
};
```
**Estimado:** 1h

---

### TASK-004 — Handler
**Archivo:** `src/handlers/cliente-spread.ts`
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as service from '../services/cliente-spread.service';
import { ok, serverError } from '../utils/response.util';

export const clienteSpreadHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, queryStringParameters } = event;
  const qs = queryStringParameters || {};

  const filtros = {
    codClienteIbs:  qs.codClienteIbs  || '',
    nombre:         qs.nombre         || '',
    nroDocumento:   qs.nroDocumento   || '',
    segmento:       qs.segmento       || '',
    flagMotor:      qs.flagMotor !== undefined
                      ? qs.flagMotor === 'true'
                      : null,
    tipoDocumento:  qs.tipoDocumento  || '',
    tipoPersoneria: qs.tipoPersoneria || '',
    page:           parseInt(qs.page  || '1'),
    limit:          parseInt(qs.limit || '10')
  };

  try {
    // GET /cliente/spread/dropdowns
    if (httpMethod === 'GET' && path.endsWith('/dropdowns'))
      return ok(await service.getDropdowns());

    // GET /cliente/spread/exportar
    if (httpMethod === 'GET' && path.endsWith('/exportar')) {
      const data = await service.exportar(filtros);
      const csv  = convertToCSV(data);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="spread_clientes.csv"',
          'Access-Control-Allow-Origin': '*'
        },
        body: csv
      };
    }

    // GET /cliente/spread
    if (httpMethod === 'GET')
      return ok(await service.getAll(filtros));

    return { statusCode: 405, body: JSON.stringify({ message: 'Método no permitido' }) };

  } catch (error: any) {
    console.error('Error:', error);
    return serverError('Error interno del servidor');
  }
};

const convertToCSV = (data: any[]): string => {
  if (!data.length) return '';
  const headers = [
    'Tipo Documento','Tipo Personería','Nro Documento',
    'Nombres/Razón Social','Código IBS','Segmento Banca',
    'Spread (PIPs)','Flag Motor'
  ];
  const rows = data.map(r => [
    r.tipoDocumento, r.tipoPersoneria, r.nroDocumento,
    r.nombreCompleto, r.codClienteIbs, r.segmentoBanca,
    r.spreadPips, r.flagMotor ? 'Activo' : 'Inactivo'
  ].map(v => `"${v ?? ''}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
};
```
**Estimado:** 1.5h

---

### TASK-005 — Registrar rutas en index.ts
```typescript
import { clienteSpreadHandler } from './handlers/cliente-spread';

// Rutas:
// GET /cliente/spread
// GET /cliente/spread/dropdowns
// GET /cliente/spread/exportar
if (path.startsWith('/cliente/spread')) return clienteSpreadHandler(event);
```
**Estimado:** 0.25h

---

### TASK-006 — Tests Unitarios
Casos a probar:
- ✅ getAll → sin filtros retorna paginado
- ✅ getAll → filtra por codClienteIbs
- ✅ getAll → filtra por nombre (case insensitive)
- ✅ getAll → filtra por nroDocumento
- ✅ getAll → filtra por segmento
- ✅ getAll → filtra por flagMotor=true
- ✅ getAll → filtra por flagMotor=false
- ✅ getAll → filtra por tipoDocumento
- ✅ getAll → filtra por tipoPersoneria
- ✅ getAll → combinación de múltiples filtros
- ✅ getDropdowns → retorna 4 listas correctas
- ✅ exportar → retorna todos sin paginación
- ✅ convertToCSV → formato correcto con headers

**Estimado:** 2.5h

---

## 4. RESUMEN DE ESTIMACIÓN

| Task | Descripción | Estimado |
|---|---|---|
| TASK-001 | Modelos TypeScript | 0.75h |
| TASK-002 | Repository | 2.5h |
| TASK-003 | Service | 1h |
| TASK-004 | Handler + CSV Export | 1.5h |
| TASK-005 | Registro de rutas | 0.25h |
| TASK-006 | Tests unitarios | 2.5h |
| **TOTAL** | | **8.5h** |

---

## 5. NOTAS FINALES DE BD

| Dato | Valor confirmado |
|---|---|
| Tabla principal | `dbo.tbl_mcliente` |
| Tabla datos cliente | `dbo.tbl_mclienteibs` JOIN por `CodClienteIbs` |
| Tipo Documento | `tbl_mmultitabla` CodGrupo=`0002`, campo `Key1`=código, `Valor`=label |
| Tipo Personería | `tbl_mmultitabla` CodGrupo=`0003`, campo `Key1`=código, `Valor`=label |
| Segmento | `tbl_mclienteibs.Banca` (descripción directa) |
| Spread PIPs | `tbl_mcliente.Pips` (INTEGER) |
| Flag Motor | `tbl_mcliente.FlagCalculoMora` (BOOLEAN) |
| Estado activo | `tbl_mcliente.MtEstado = '0001001'` |
| Total registros | ~743 clientes |
| ⚠️ Pendiente | Confirmar modal de edición/creación (POST/PUT) |
