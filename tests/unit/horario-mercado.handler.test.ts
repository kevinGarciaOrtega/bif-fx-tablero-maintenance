import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

import * as service from '../../src/services/horario-mercado.service';

mock.method(service, 'getAllHorarios', async () => [
  {
    id: '0005001',
    nombre: 'Horario de mercado abierto',
    horaInicio: '09:00',
    horaFin: '13:30',
    pips: 100,
  },
]);

import { horarioMercadoHandler } from '../../src/handlers/horario-mercado';

test('GET /prod/horario-mercado funciona con prefijo de stage', async () => {
  const response = await horarioMercadoHandler({
    httpMethod: 'GET',
    path: '/prod/horario-mercado',
  } as never);

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.success, true);
  assert.equal(Array.isArray(body.data), true);
  assert.equal(body.data[0].id, '0005001');
});
