const billeteraRepository = require('../repositories/billetera.repository');

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function create(usuarioId) {
  return billeteraRepository.create(usuarioId);
}

async function getById(id) {
  const wallet = await billeteraRepository.findById(id);
  if (!wallet) throw httpError(404, 'Billetera no encontrada');
  return wallet;
}

async function getBalance(id) {
  const wallet = await getById(id);
  return { billetera_id: wallet.id, moneda: wallet.moneda, saldo: wallet.saldo };
}

async function setStatus(id, status) {
  const wallet = await billeteraRepository.updateStatus(id, status);
  if (!wallet) throw httpError(404, 'Billetera no encontrada');
  return wallet;
}

async function activate(id) {
  return setStatus(id, 'ACTIVA');
}

async function deactivate(id) {
  return setStatus(id, 'INACTIVA');
}

module.exports = { create, getById, getBalance, activate, deactivate };
