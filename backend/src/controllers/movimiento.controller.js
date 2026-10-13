const service = require('../services/movimiento.service');

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw Object.assign(new Error('El id debe ser un entero positivo'), { status: 400 });
  return id;
}

async function apply(req, res) {
  const result = await service.apply(parseId(req.params.id), req.body || {}, req.authorizedService);
  res.status(result.idempotent ? 200 : 201).json({ success: true, data: result.movement, idempotent: result.idempotent });
}

async function list(req, res) {
  res.json({ success: true, data: await service.list(parseId(req.params.id), req.query) });
}

module.exports = { apply, list };
