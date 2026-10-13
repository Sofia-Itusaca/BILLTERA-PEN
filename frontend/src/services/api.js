async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message || 'No se pudo completar la solicitud');
  return body.data;
}

export const api = {
  createWallet: (usuario_id) => request('/billeteras', { method: 'POST', body: JSON.stringify({ usuario_id }) }),
  getWallet: (id) => request(`/billeteras/${id}`),
  getBalance: (id) => request(`/billeteras/${id}/saldo`),
  activateWallet: (id) => request(`/billeteras/${id}/activar`, { method: 'PATCH' }),
  deactivateWallet: (id) => request(`/billeteras/${id}/inactivar`, { method: 'PATCH' }),
  getMovements: (id, filters = {}) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '' && value != null));
    return request(`/billeteras/${id}/movimientos?${query}`);
  },
};
