const billeteraService = require('../services/billetera.service');

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw Object.assign(new Error('El id debe ser un entero positivo'), { status: 400 });
  return id;
}

async function create(req, res) {
  const usuarioId = req.body?.usuario_id;
  if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
    throw Object.assign(new Error('usuario_id debe ser un entero positivo'), { status: 400 });
  }
  const wallet = await billeteraService.create(usuarioId);
  res.status(201).json({ success: true, data: wallet });
}

async function getById(req, res) {
  res.json({ success: true, data: await billeteraService.getById(parseId(req.params.id)) });
}

async function getBalance(req, res) {
  res.json({ success: true, data: await billeteraService.getBalance(parseId(req.params.id)) });
}

async function activate(req, res) {
  res.json({ success: true, data: await billeteraService.activate(parseId(req.params.id)) });
}

async function deactivate(req, res) {
  res.json({ success: true, data: await billeteraService.deactivate(parseId(req.params.id)) });
}

module.exports = { create, getById, getBalance, activate, deactivate };
