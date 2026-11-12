export class HttpError extends Error {
  constructor(status, message, code = 'ERROR', data = null) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}

export function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

export function ok(res, payload = {}) {
  send(res, 200, { ok: true, ...payload })
}

export function fail(res, status, message, code = 'ERROR', data = null) {
  send(res, status, { ok: false, error: message, code, ...(data || {}) })
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body)
    } catch {
      return Object.fromEntries(new URLSearchParams(req.body))
    }
  }
  let raw = ''
  for await (const chunk of req) raw += chunk
  if (!raw) return {}
  const type = String(req.headers['content-type'] || '')
  if (type.includes('application/json')) {
    try {
      return JSON.parse(raw)
    } catch {
      throw new HttpError(400, "So'rov ma'lumoti noto'g'ri", 'BAD_JSON')
    }
  }
  return Object.fromEntries(new URLSearchParams(raw))
}

export function getPath(req) {
  const url = new URL(req.url || '/', 'http://local')
  return url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/'
}

export function getIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

const buckets = new Map()

export function rateLimit(key, limit, windowMs) {
  const now = Date.now()
  const entry = buckets.get(key)
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return
  }
  entry.count += 1
  if (entry.count > limit) {
    throw new HttpError(429, "Juda ko'p urinish. Bir oz kutib turing.", 'RATE_LIMIT')
  }
}

export function assertSameOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const allowed = [
    process.env.APP_URL,
    host ? `https://${host}` : null,
    host ? `http://${host}` : null,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean)
  if (!allowed.includes(origin)) {
    throw new HttpError(403, "So'rov manbasi ruxsat etilmagan", 'BAD_ORIGIN')
  }
}

export function parseCookies(req) {
  const header = req.headers.cookie || ''
  const result = {}
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key) result[key] = decodeURIComponent(value)
  }
  return result
}

export function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  parts.push(`Path=${options.path || '/'}`)
  if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`)
  if (options.httpOnly !== false) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  parts.push(`SameSite=${options.sameSite || 'Lax'}`)
  const current = res.getHeader('Set-Cookie')
  const cookies = Array.isArray(current) ? current : current ? [current] : []
  res.setHeader('Set-Cookie', [...cookies, parts.join('; ')])
}

export function clearCookie(res, name) {
  setCookie(res, name, '', { maxAge: 0 })
}

export function handleError(res, error) {
  if (error instanceof HttpError) {
    fail(res, error.status, error.message, error.code, error.data)
    return
  }
  console.error('API error:', error)
  fail(res, 500, 'Serverda xatolik yuz berdi', 'INTERNAL')
}
