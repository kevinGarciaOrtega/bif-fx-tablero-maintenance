import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

// Mock del repositorio antes de importar el handler
import * as repo from '../../src/repositories/volatilidad.repository';

const mockData = [
  { id: '0004001', nombre: 'Volatilidad Activa',   pips: 100, estadoActual: true  },
  { id: '0004002', nombre: 'Volatilidad Inactiva', pips: 200, estadoActual: false },
];

mock.method(repo, 'findAll', async () => [...mockData]);

mock.method(repo, 'updateById', async (id: string, dto: { pips: number; estadoActual: boolean }) => {
  const record = mockData.find((r) => r.id === id);
  if (!record) return null;
  return { ...record, pips: dto.pips, estadoActual: dto.estadoActual };
});

import { volatilidadHandler } from '../../src/handlers/volatilidad';

test('PUT /volatilidad/0004001 funciona aunque no venga pathParameters', async () => {
  const response = await volatilidadHandler({
    httpMethod: 'PUT',
    path: '/volatilidad/0004001',
    body: JSON.stringify({ pips: 150, estadoActual: true }),
  } as never);

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.success, true);
  assert.equal(body.data.id, '0004001');
  assert.equal(body.data.pips, 150);
});
