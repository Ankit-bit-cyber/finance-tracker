const BASE = '/api';

const getToken = () => localStorage.getItem('ft_token');
const setToken = (t) => localStorage.setItem('ft_token', t);
const clearToken = () => localStorage.removeItem('ft_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const request = async (method, path, body = null, isFormData = false) => {
  const opts = { method, headers: isFormData ? { Authorization: `Bearer ${getToken()}` } : headers() };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.errors?.[0] || 'Request failed');
  return data.data ?? data;
};

const api = {
  get:    (path)          => request('GET',    path),
  post:   (path, body)    => request('POST',   path, body),
  put:    (path, body)    => request('PUT',    path, body),
  delete: (path)          => request('DELETE', path),
  upload: (path, formData)=> request('POST',   path, formData, true),
  setToken, getToken, clearToken,
};

// Check OAuth token in URL on page load
const urlParams = new URLSearchParams(window.location.search);
const oauthToken = urlParams.get('token');
if (oauthToken) {
  api.setToken(oauthToken);
  window.history.replaceState({}, '', window.location.pathname);
}

window.api = api;
