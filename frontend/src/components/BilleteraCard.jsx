function formatMoney(value) {
  const [units, decimals = ''] = String(value).split('.');
  return `S/ ${units}.${(decimals + '00').slice(0, 2)}`;
}

export default function BilleteraCard({ wallet, balance }) {
  return (
    <section className="wallet-card" aria-label="Resumen de billetera">
      <div>
        <p className="eyebrow">Saldo disponible</p>
        <p className="balance">{formatMoney(balance?.saldo ?? wallet.saldo)}</p>
      </div>
      <dl className="wallet-details">
        <div><dt>Billetera</dt><dd>#{wallet.id}</dd></div>
        <div><dt>Usuario</dt><dd>#{wallet.usuario_id}</dd></div>
        <div><dt>Moneda</dt><dd>{wallet.moneda}</dd></div>
        <div><dt>Estado</dt><dd><span className={`status ${wallet.estado === 'ACTIVA' ? 'status-active' : 'status-inactive'}`}>{wallet.estado}</span></dd></div>
      </dl>
    </section>
  );
}
