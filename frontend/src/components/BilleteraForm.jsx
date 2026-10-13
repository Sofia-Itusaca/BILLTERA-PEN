import { useState } from 'react';

export default function BilleteraForm({ onCreate, disabled }) {
  const [usuarioId, setUsuarioId] = useState('');

  async function submit(event) {
    event.preventDefault();
    const created = await onCreate(usuarioId);
    if (created) setUsuarioId('');
  }

  return (
    <form className="start-form" onSubmit={submit}>
      <label htmlFor="usuario-id">usuario_id externo</label>
      <input
        id="usuario-id"
        required
        type="number"
        min="1"
        step="1"
        value={usuarioId}
        onChange={(event) => setUsuarioId(event.target.value)}
      />
      <button disabled={disabled} type="submit">Crear billetera PEN</button>
      <p className="hint">Este formulario no crea ni consulta usuarios.</p>
    </form>
  );
}
