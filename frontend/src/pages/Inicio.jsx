import { useState } from 'react';
import BilleteraForm from '../components/BilleteraForm';

export default function Inicio({ onSelect, onCreate }) {
  const [walletId, setWalletId] = useState('');
  const [busy, setBusy] = useState(false);

  async function handle(event, action) {
    event.preventDefault();
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  async function createWallet(usuarioId) {
    setBusy(true);
    try {
      await onCreate(usuarioId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="welcome">
      <header className="brand"><span className="brand-mark">S/</span><span>Billetera PEN</span></header>
      <section className="welcome-card">
        <p className="eyebrow">Microservicio de billetera</p>
        <h1>Consulta tu billetera</h1>
        <p className="muted">Consulta una billetera o crea una asociada a un usuario mediante su identificador externo.</p>
        <form className="start-form" onSubmit={(event) => handle(event, () => onSelect(walletId))}>
          <label htmlFor="billetera-id">Identificador de billetera</label>
          <input
            id="billetera-id"
            required
            type="number"
            min="1"
            step="1"
            value={walletId}
            onChange={(event) => setWalletId(event.target.value)}
          />
          <button disabled={busy} type="submit">Consultar billetera</button>
        </form>
        <details>
          <summary>Crear billetera</summary>
          <BilleteraForm
            disabled={busy}
            onCreate={createWallet}
          />
        </details>
      </section>
      <p className="footnote">Moneda: PEN · Sol peruano</p>
    </main>
  );
}
