import { useEffect, useState } from 'react';
import { api } from '../services/api';

const money = (value) => `S/ ${Number(value).toFixed(2)}`;

export default function MovimientosHistorial({ walletId }) {
  const [filters, setFilters] = useState({ tipo: '', direccion: '', desde: '', hasta: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { setResult(await api.getMovements(walletId, { ...filters, pagina: page, limite: 10 })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [walletId, filters, page]);

  function change(field, value) { setPage(1); setFilters((current) => ({ ...current, [field]: value })); }

  return (
    <section className="panel history-panel">
      <div className="history-heading"><div><p className="eyebrow">Actividad</p><h2>Historial de movimientos</h2></div><button className="secondary" onClick={load} disabled={loading}>Actualizar</button></div>
      <div className="history-filters">
        <label>Tipo<select value={filters.tipo} onChange={(e) => change('tipo', e.target.value)}><option value="">Todos</option>{['DEPOSITO','RETIRO','TRANSFERENCIA','PAGO_SUSCRIPCION','COMISION_BANCARIA','AJUSTE','OTRO'].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Dirección<select value={filters.direccion} onChange={(e) => change('direccion', e.target.value)}><option value="">Todas</option><option>INGRESO</option><option>EGRESO</option></select></label>
        <label>Desde<input type="date" value={filters.desde} onChange={(e) => change('desde', e.target.value)} /></label>
        <label>Hasta<input type="date" value={filters.hasta} onChange={(e) => change('hasta', e.target.value)} /></label>
      </div>
      {loading ? <p className="muted" role="status">Cargando movimientos…</p> : error ? <p className="history-error" role="alert">{error}</p> : result?.movimientos.length ? (
        <>
          <ul className="movement-list">{result.movimientos.map((m) => <li className={`movement ${m.direccion === 'INGRESO' ? 'inflow' : 'outflow'}`} key={m.id}>
            <span className="movement-sign" aria-label={m.direccion}>{m.direccion === 'INGRESO' ? '+' : '−'}</span>
            <div className="movement-main"><strong>{m.descripcion || m.tipo.replaceAll('_', ' ')}</strong><span>{new Date(m.created_at).toLocaleString('es-PE')} · {m.origen} · {m.servicio_origen}</span><small>{m.tipo} · saldo posterior {money(m.saldo_posterior)}</small></div>
            <strong className="movement-amount">{money(m.monto)}</strong>
          </li>)}</ul>
          <div className="pagination"><span>{result.paginacion.total} movimientos · página {page} de {Math.max(1, result.paginacion.paginas)}</span><div><button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button><button className="secondary" disabled={page >= result.paginacion.paginas} onClick={() => setPage(page + 1)}>Siguiente</button></div></div>
        </>
      ) : <p className="muted empty-state">No hay movimientos para mostrar.</p>}
    </section>
  );
}
