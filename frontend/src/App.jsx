import { useState } from 'react';
import Inicio from './pages/Inicio';
import Billetera from './pages/Billetera';
import { api } from './services/api';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadWallet(id) {
    const [currentWallet, currentBalance] = await Promise.all([
      api.getWallet(id),
      api.getBalance(id),
    ]);
    setWallet(currentWallet);
    setBalance(currentBalance);
  }

  async function safely(action, successMessage) {
    try {
      await action();
      setError('');
      setNotice(successMessage || '');
      return true;
    } catch (requestError) {
      setError(requestError.message);
      setNotice('');
      return false;
    }
  }

  async function createWallet(usuarioId) {
    return safely(async () => {
      const created = await api.createWallet(Number(usuarioId));
      await loadWallet(created.id);
    }, 'Billetera creada correctamente.');
  }

  async function selectWallet(id) {
    return safely(() => loadWallet(id));
  }

  async function changeStatus() {
    if (!wallet) return;
    const updateStatus = wallet.estado === 'ACTIVA' ? api.deactivateWallet : api.activateWallet;
    return safely(async () => {
      await updateStatus(wallet.id);
      await loadWallet(wallet.id);
    }, `Billetera ${wallet.estado === 'ACTIVA' ? 'inactivada' : 'activada'} correctamente.`);
  }

  function clearWallet() {
    setWallet(null);
    setBalance(null);
    setError('');
    setNotice('');
  }

  return (
    <>
      {error && <div className="toast error" role="alert">{error}</div>}
      {notice && <div className="toast success" role="status">{notice}</div>}
      {wallet ? (
        <Billetera wallet={wallet} balance={balance} onChangeStatus={changeStatus} onBack={clearWallet} />
      ) : (
        <Inicio onSelect={selectWallet} onCreate={createWallet} />
      )}
    </>
  );
}
