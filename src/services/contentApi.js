const API_BASE_URL = (import.meta.env.VITE_CONTENT_API_URL || '').trim().replace(/\/$/, '');

export function isContentApiConfigured() {
  return Boolean(API_BASE_URL);
}

async function request(path, { method = 'GET', token, body } = {}) {
  if (!API_BASE_URL) throw new Error('Content service is not configured yet.');
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
    });
  } catch {
    throw new Error('Could not reach the content service. Try again later.');
  }

  let payload = {};
  try { payload = await response.json(); } catch { /* Response details are optional. */ }
  if (!response.ok) {
    const error = new Error(typeof payload.error === 'string' ? payload.error : 'The content request failed.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const contentApi = {
  publicEntries: type => request(`/api/public/${encodeURIComponent(type)}`),
  login: password => request('/api/auth/login', { method: 'POST', body: { password } }),
  logout: token => request('/api/auth/logout', { method: 'POST', token, body: {} }),
  ownerEntries: token => request('/api/owner/entries', { token }),
  create: (token, type, data, status) => request('/api/owner/entries', {
    method: 'POST', token, body: { type, data, status },
  }),
  update: (token, id, data, status) => request(`/api/owner/entries/${encodeURIComponent(id)}`, {
    method: 'PUT', token, body: { data, status },
  }),
  remove: (token, id) => request(`/api/owner/entries/${encodeURIComponent(id)}`, { method: 'DELETE', token }),
};
