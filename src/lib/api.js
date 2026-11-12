const BASE = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, { code = 'ERROR', status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new ApiError("Server bilan aloqa yo'q. Internetni tekshiring.", { code: 'NETWORK' })
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok || data?.ok === false) {
    throw new ApiError(data?.error || `Server xatosi (${response.status})`, {
      code: data?.code || 'ERROR',
      status: response.status,
      data,
    })
  }

  return data || { ok: true }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: body ?? {} }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body: body ?? {} }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
