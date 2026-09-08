const BASE_URL = '/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function get(path) {
  return request(path);
}

export function post(path, data) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function put(path, data) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function del(path) {
  return request(path, {
    method: 'DELETE',
  });
}
