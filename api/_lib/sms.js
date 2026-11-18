const ESKIZ_BASE = 'https://notify.eskiz.uz/api'
const globalForSms = globalThis

export function normalizePhone(value = '') {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 9) digits = `998${digits}`
  if (digits.length === 10 && digits.startsWith('8')) digits = `998${digits.slice(1)}`
  if (digits.length === 12 && digits.startsWith('998')) return digits
  if (digits.length === 13 && digits.startsWith('0998')) return digits.slice(1)
  return digits
}

export function isValidUzPhone(value = '') {
  return /^998\d{9}$/.test(normalizePhone(value))
}

export function smsCredentials(settings = {}) {
  return {
    email: String(settings.smsEmail || process.env.ESKIZ_EMAIL || '').trim(),
    password: String(settings.smsPassword || process.env.ESKIZ_PASSWORD || '').trim(),
    from: String(settings.smsFrom || process.env.ESKIZ_FROM || '4546').trim(),
    customUrl: String(process.env.SMS_API_URL || '').trim(),
    customKey: String(process.env.SMS_API_KEY || '').trim(),
  }
}

export function smsConfigured(settings = {}) {
  const creds = smsCredentials(settings)
  return Boolean((creds.email && creds.password) || (creds.customUrl && creds.customKey))
}

async function eskizToken(email, password) {
  const cached = globalForSms.__agroservEskiz
  if (cached && cached.token && cached.email === email && cached.expiresAt > Date.now()) {
    return cached.token
  }
  const response = await fetch(`${ESKIZ_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(12_000),
  })
  const data = await response.json().catch(() => ({}))
  const token = data?.data?.token
  if (!response.ok || !token) {
    throw new Error(data?.message || `Eskiz login ${response.status}`)
  }
  globalForSms.__agroservEskiz = {
    token,
    email,
    expiresAt: Date.now() + 20 * 60 * 60 * 1000,
  }
  return token
}

async function sendEskiz(creds, phone, message) {
  const token = await eskizToken(creds.email, creds.password)
  const form = new FormData()
  form.append('mobile_phone', phone)
  form.append('message', message)
  form.append('from', creds.from)
  const response = await fetch(`${ESKIZ_BASE}/message/sms/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    signal: AbortSignal.timeout(15_000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data?.status === 'error') {
    throw new Error(data?.message || `Eskiz SMS ${response.status}`)
  }
  return { sent: true, provider: 'eskiz' }
}

async function sendCustom(creds, phone, message) {
  const response = await fetch(creds.customUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${creds.customKey}`,
    },
    body: JSON.stringify({ phone, message }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`SMS API ${response.status}`)
  return { sent: true, provider: 'custom' }
}

export async function sendSms(settings, phone, message) {
  const normalized = normalizePhone(phone)
  if (!isValidUzPhone(normalized)) throw new Error('BAD_PHONE')
  const creds = smsCredentials(settings)
  if (creds.email && creds.password) return sendEskiz(creds, normalized, message)
  if (creds.customUrl && creds.customKey) return sendCustom(creds, normalized, message)
  throw new Error('SMS_NOT_CONFIGURED')
}
