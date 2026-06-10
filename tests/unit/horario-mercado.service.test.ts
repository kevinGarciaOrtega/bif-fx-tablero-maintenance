import test from 'node:test';
import assert from 'node:assert/strict';

import * as service from '../../src/services/horario-mercado.service';

test('getAllHorarios devuelve al menos dos registros del horario de mercado', async () => {
  const data = await service.getAllHorarios();

  assert.equal(Array.isArray(data), true);
  assert.equal(data.length >= 2, true);
  assert.equal(typeof data[0]?.nombre, 'string');
});

test('updateHorario falla cuando PIPs es menor o igual a cero', async () => {
  await assert.rejects(
    () => service.updateHorario('0005001', { pips: 0, horaInicio: '09:00', horaFin: '13:30' }, 0),
    /PIPs debe ser un número entero mayor a 0/
  );
});

test('createFeriado falla con formato de fecha inválido', async () => {
  await assert.rejects(
    () => service.createFeriado({ fecha: '2026/12/25' }, 0),
    /Formato de fecha inválido/
  );
});

test('deleteFeriado devuelve mensaje de eliminación', async () => {
  const result = await service.deleteFeriado(1);

  assert.deepEqual(result, { message: 'Feriado eliminado correctamente' });
});
