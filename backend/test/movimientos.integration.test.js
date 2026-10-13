require('dotenv').config();
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const db = require('../src/config/database');

let server;
let base;
let walletId;
const token = `integration-${Date.now()}-${Math.random()}`;
process.env.DEPOSITOS_SERVICE_TOKEN = token;
process.env.RETIROS_SERVICE_TOKEN = token;

async function request(path, { method = 'GET', body, service, auth = true } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (auth) { headers['x-service-name'] = service || 'DEPOSITOS'; headers['x-service-token'] = token; }
  const response = await fetch(`${base}${path}`, { method, headers, body: body && JSON.stringify(body) });
  return { status: response.status, json: await response.json() };
}

before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
  const created = await db.query('INSERT INTO billeteras (usuario_id) VALUES ($1) RETURNING id', [Date.now()]);
  walletId = created.rows[0].id;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await db.end();
});

test('aplica ingreso/egreso, rechaza inválidos, saldo insuficiente y fuente no autorizada', async () => {
  const path = `/billeteras/${walletId}/movimientos`;
  const income = await request(path, { method: 'POST', body: { tipo: 'DEPOSITO', direccion: 'INGRESO', monto: '100.00', origen: 'INTERNO', referencia_externa: `in-${Date.now()}` } });
  assert.equal(income.status, 201);
  assert.equal(income.json.data.saldo_posterior, '100.00');
  const expense = await request(path, { method: 'POST', service: 'RETIROS', body: { tipo: 'RETIRO', direccion: 'EGRESO', monto: '30.00', origen: 'INTERNO', referencia_externa: `out-${Date.now()}` } });
  assert.equal(expense.status, 201);
  assert.equal(expense.json.data.saldo_posterior, '70.00');
  const insufficient = await request(path, { method: 'POST', service: 'RETIROS', body: { tipo: 'RETIRO', direccion: 'EGRESO', monto: '1000', origen: 'INTERNO', referencia_externa: `low-${Date.now()}` } });
  assert.equal(insufficient.status, 409);
  const invalid = await request(path, { method: 'POST', body: { tipo: 'DEPOSITO', direccion: 'INGRESO', monto: '0', origen: 'INTERNO', referencia_externa: `zero-${Date.now()}` } });
  assert.equal(invalid.status, 400);
  assert.equal((await request(path, { method: 'POST', auth: false, body: {} })).status, 403);
});

test('reintento y dos solicitudes iguales concurrentes modifican saldo una sola vez', async () => {
  const ref = `idem-${Date.now()}`;
  const body = { tipo: 'DEPOSITO', direccion: 'INGRESO', monto: '7.25', origen: 'INTERNO', referencia_externa: ref };
  const path = `/billeteras/${walletId}/movimientos`;
  const results = await Promise.all([request(path, { method: 'POST', body }), request(path, { method: 'POST', body })]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 201]);
  assert.equal(results.filter((r) => r.json.data.saldo_posterior === '77.25').length, 2);
  const conflict = await request(path, { method: 'POST', body: { ...body, monto: '8.25' } });
  assert.equal(conflict.status, 409);
  const concurrent = await Promise.all([1, 2, 3, 4].map((n) => request(path, { method: 'POST', body: { ...body, monto: '1.00', referencia_externa: `${ref}-${n}` } })));
  assert.ok(concurrent.every((r) => r.status === 201));
  const wallet = await db.query('SELECT saldo FROM billeteras WHERE id = $1', [walletId]);
  assert.equal(wallet.rows[0].saldo, '81.25');
});

test('historial filtra/pagina, no expone borrado y rechaza billetera inactiva/inexistente', async () => {
  const path = `/billeteras/${walletId}/movimientos`;
  const list = await request(`${path}?direccion=INGRESO&pagina=1&limite=2`);
  assert.equal(list.status, 200);
  assert.equal(list.json.data.movimientos.length, 2);
  assert.ok(list.json.data.movimientos.every((m) => m.direccion === 'INGRESO'));
  const missing = await request('/billeteras/999999999/movimientos', { method: 'POST', body: { tipo: 'DEPOSITO', direccion: 'INGRESO', monto: '1', origen: 'INTERNO', referencia_externa: `missing-${Date.now()}` } });
  assert.equal(missing.status, 404);
  await db.query("UPDATE billeteras SET estado = 'INACTIVA' WHERE id = $1", [walletId]);
  const inactive = await request(path, { method: 'POST', body: { tipo: 'DEPOSITO', direccion: 'INGRESO', monto: '1', origen: 'INTERNO', referencia_externa: `inactive-${Date.now()}` } });
  assert.equal(inactive.status, 409);
  assert.equal((await request(`/billeteras/${walletId}/movimientos`, { method: 'DELETE' })).status, 404);
});
