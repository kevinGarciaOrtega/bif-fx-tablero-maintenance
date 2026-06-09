import test from 'node:test';
import assert from 'node:assert/strict';

import { volatilidadHandler } from '../../src/handlers/volatilidad';

test('PUT /volatilidad/1 funciona aunque no venga pathParameters', async () => {
  const response = await volatilidadHandler({
    httpMethod: 'PUT',
    path: '/volatilidad/1',
    body: JSON.stringify({ pips: 150, estadoActual: true }),
  } as never);

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.success, true);
  assert.equal(body.data.codCliente, 1);
  assert.equal(body.data.pips, 150);
});
