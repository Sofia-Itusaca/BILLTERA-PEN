const repository = require('../repositories/movimiento.repository');
const billeteraRepository = require('../repositories/billetera.repository');

const types = new Set(['DEPOSITO', 'RETIRO', 'TRANSFERENCIA', 'PAGO_SUSCRIPCION', 'COMISION_BANCARIA', 'AJUSTE', 'OTRO']);

function httpError(status, message) { return Object.assign(new Error(message), { status }); }

async function apply(walletId, payload, service) {
  if (!types.has(payload.tipo) || !['INGRESO', 'EGRESO'].includes(payload.direccion) ||
      !/^(0|[1-9]\d{0,12})(\.\d{1,2})?$/.test(String(payload.monto)) || Number(payload.monto) <= 0 ||
      typeof payload.origen !== 'string' || !payload.origen.trim() || payload.origen.length > 40 ||
      typeof payload.referencia_externa !== 'string' || !payload.referencia_externa.trim() || payload.referencia_externa.length > 100 ||
      (payload.descripcion != null && (typeof payload.descripcion !== 'string' || payload.descripcion.length > 255))) {
    throw httpError(400, 'Datos de movimiento inválidos');
  }
  const directionRules = { DEPOSITO: 'INGRESO', RETIRO: 'EGRESO', PAGO_SUSCRIPCION: 'EGRESO', COMISION_BANCARIA: 'EGRESO' };
  if (directionRules[payload.tipo] && directionRules[payload.tipo] !== payload.direccion) throw httpError(400, 'La dirección no corresponde al tipo de movimiento');
  const amount = String(payload.monto);
  const [whole, fraction = ''] = amount.split('.');
  const canonicalAmount = `${whole}.${fraction.padEnd(2, '0')}`;
  return repository.applyMovement(walletId, { ...payload, monto: canonicalAmount, servicio_origen: service });
}

async function list(walletId, query) {
  if (!await billeteraRepository.findById(walletId)) throw httpError(404, 'Billetera no encontrada');
  const allowedTypes = [...types];
  const pagina = Number(query.pagina || 1); const limite = Number(query.limite || 20);
  if (!Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(limite) || limite < 1 || limite > 100 ||
      (query.tipo && !allowedTypes.includes(query.tipo)) || (query.direccion && !['INGRESO', 'EGRESO'].includes(query.direccion)) ||
      (query.desde && !/^\d{4}-\d{2}-\d{2}$/.test(query.desde)) || (query.hasta && !/^\d{4}-\d{2}-\d{2}$/.test(query.hasta)) ||
      (query.desde && query.hasta && query.desde > query.hasta)) throw httpError(400, 'Filtros de historial inválidos');
  return repository.listMovements(walletId, { ...query, pagina, limite });
}

module.exports = { apply, list };
