const db = require('../config/database');

async function create(usuarioId) {
  const { rows } = await db.query(
    `INSERT INTO billeteras (usuario_id) VALUES ($1)
     RETURNING id, usuario_id, moneda, saldo, estado, created_at, updated_at`,
    [usuarioId],
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT id, usuario_id, moneda, saldo, estado, created_at, updated_at
       FROM billeteras WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function updateStatus(id, status) {
  const { rows } = await db.query(
    `UPDATE billeteras SET estado = $2, updated_at = NOW()
     WHERE id = $1 RETURNING id, usuario_id, moneda, saldo, estado, created_at, updated_at`,
    [id, status],
  );
  return rows[0] || null;
}

async function applyMovement(walletId, movement) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query(
      `SELECT * FROM movimientos WHERE servicio_origen = $1 AND referencia_externa = $2`,
      [movement.servicio_origen, movement.referencia_externa],
    );
    if (existing.rowCount) {
      const row = existing.rows[0];
      const same = Number(row.billetera_id) === walletId && row.tipo === movement.tipo &&
        row.direccion === movement.direccion && row.monto === movement.monto && row.origen === movement.origen &&
        row.descripcion === (movement.descripcion || null);
      if (!same) throw Object.assign(new Error('La referencia ya fue utilizada con datos diferentes'), { status: 409 });
      await client.query('COMMIT');
      return { movement: row, idempotent: true };
    }

    const wallets = await client.query(
      'SELECT id, saldo, estado FROM billeteras WHERE id = $1 FOR UPDATE', [walletId],
    );
    if (!wallets.rowCount) throw Object.assign(new Error('Billetera no encontrada'), { status: 404 });
    const wallet = wallets.rows[0];
    if (wallet.estado !== 'ACTIVA') throw Object.assign(new Error('La billetera está inactiva'), { status: 409 });
    const updated = await client.query(
      `UPDATE billeteras SET saldo = CASE WHEN $2 = 'INGRESO' THEN saldo + $3::numeric ELSE saldo - $3::numeric END,
       updated_at = NOW() WHERE id = $1 AND ($2 = 'INGRESO' OR saldo >= $3::numeric)
       RETURNING saldo - CASE WHEN $2 = 'INGRESO' THEN $3::numeric ELSE -$3::numeric END AS saldo_anterior, saldo AS saldo_posterior`,
      [walletId, movement.direccion, movement.monto],
    );
    if (!updated.rowCount) throw Object.assign(new Error('Saldo insuficiente'), { status: 409 });
    const { rows } = await client.query(
      `INSERT INTO movimientos
       (billetera_id, tipo, direccion, monto, origen, servicio_origen, referencia_externa, descripcion, saldo_anterior, saldo_posterior)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [walletId, movement.tipo, movement.direccion, movement.monto, movement.origen, movement.servicio_origen,
        movement.referencia_externa, movement.descripcion || null, updated.rows[0].saldo_anterior, updated.rows[0].saldo_posterior],
    );
    await client.query('COMMIT');
    return { movement: rows[0], idempotent: false };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      const { rows } = await db.query('SELECT * FROM movimientos WHERE servicio_origen = $1 AND referencia_externa = $2', [movement.servicio_origen, movement.referencia_externa]);
      if (rows[0]) {
        const row = rows[0];
        if (Number(row.billetera_id) === walletId && row.tipo === movement.tipo && row.direccion === movement.direccion && row.monto === movement.monto && row.origen === movement.origen && row.descripcion === (movement.descripcion || null)) return { movement: row, idempotent: true };
        throw Object.assign(new Error('La referencia ya fue utilizada con datos diferentes'), { status: 409 });
      }
    }
    throw error;
  } finally { client.release(); }
}

async function listMovements(walletId, filters) {
  const values = [walletId];
  const where = ['billetera_id = $1'];
  for (const [field, value] of [['tipo', filters.tipo], ['direccion', filters.direccion]]) {
    if (value) { values.push(value); where.push(`${field} = $${values.length}`); }
  }
  if (filters.desde) { values.push(filters.desde); where.push(`created_at >= $${values.length}::date`); }
  if (filters.hasta) { values.push(filters.hasta); where.push(`created_at < ($${values.length}::date + INTERVAL '1 day')`); }
  const count = await db.query(`SELECT COUNT(*)::int AS total FROM movimientos WHERE ${where.join(' AND ')}`, values);
  values.push(filters.limite, (filters.pagina - 1) * filters.limite);
  const { rows } = await db.query(
    `SELECT * FROM movimientos WHERE ${where.join(' AND ')} ORDER BY created_at DESC, id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return { movimientos: rows, paginacion: { pagina: filters.pagina, limite: filters.limite, total: count.rows[0].total, paginas: Math.ceil(count.rows[0].total / filters.limite) } };
}

module.exports = { create, findById, updateStatus, applyMovement, listMovements };
