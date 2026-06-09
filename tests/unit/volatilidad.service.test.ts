import test from 'node:test';
import assert from 'node:assert/strict';

import * as service from '../../src/services/volatilidad.service';

test('getAll devuelve la lista de volatilidades', async () => {
  const data = await service.getAll();

  assert.equal(Array.isArray(data), true);
  assert.equal(data.length >= 2, true);
  assert.equal(data[0]?.nombre, 'Volatilidad Activa');
});

test('update actualiza PIPs y estado correctamente', async () => {
  const result = await service.update(1, { pips: 150, estadoActual: true });

  assert.equal(result.codCliente, 1);
  assert.equal(result.pips, 150);
  assert.equal(result.estadoActual, true);
});

test('update falla cuando PIPs es menor o igual a cero', async () => {
  await assert.rejects(
    () => service.update(1, { pips: 0, estadoActual: true }),
    /PIPs debe ser un número entero mayor a 0/
  );
});

test('update falla cuando el id no existe', async () => {
  await assert.rejects(
    () => service.update(999, { pips: 50, estadoActual: false }),
    /NOT_FOUND/
  );
});

test('update falla cuando estadoActual no es boolean', async () => {
  await assert.rejects(
    () => service.update(1, { pips: 50, estadoActual: 'true' as unknown as boolean }),
    /Estado actual debe ser verdadero o falso/
  );
});
