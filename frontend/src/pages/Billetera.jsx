import BilleteraCard from '../components/BilleteraCard';
import MovimientosHistorial from '../components/MovimientosHistorial';

export default function Billetera({ wallet, balance, onChangeStatus, onBack }) {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">S/</span><span>Billetera PEN</span></div>
        <button className="text-button" onClick={onBack}>Cambiar billetera</button>
      </header>
      <div className="page-heading">
        <div><p className="eyebrow">Panel de billetera</p><h1>Tu billetera</h1></div>
      </div>
      <BilleteraCard wallet={wallet} balance={balance} />
      <section className="panel status-panel">
        <h2>Estado de la billetera</h2>
        <p className="muted">La billetera está {wallet.estado.toLowerCase()}.</p>
        <button className={wallet.estado === 'ACTIVA' ? 'secondary' : ''} onClick={onChangeStatus}>
          {wallet.estado === 'ACTIVA' ? 'Inactivar billetera' : 'Activar billetera'}
        </button>
      </section>
      <MovimientosHistorial walletId={wallet.id} />
    </main>
  );
}
