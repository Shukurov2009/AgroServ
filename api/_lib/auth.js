import { SignJWT, jwtVerify } from 'jose'
import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcryptjs'
import { query } from './db.js'
import { HttpError, parseCookies, setCookie, clearCookie } from './http.js'

const COOKIE = 'agroserv_session'
const SESSION_DAYS = 30

function secretKey() {
  const value = process.env.AUTH_SECRET
  if (!value || value.length < 24) throw new Error('AUTH_SECRET sozlanmagan')
  return new TextEncoder().encode(value)
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password, hash) {
  if (!hash) return Promise.resolve(false)
  return bcrypt.compare(password, hash)
}

export async function createSession(req, res, userId) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  const { rows } = await query(
    `INSERT INTO sessions (user_id, expires_at, user_agent, ip)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      userId,
      expiresAt.toISOString(),
      String(req.headers['user-agent'] || '').slice(0, 300),
      String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').slice(0, 100),
    ],
  )
  const token = await new SignJWT({ sid: rows[0].id })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey())
  setCookie(res, COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  return rows[0].id
}

export async function getAuthUser(req) {
  const token = parseCookies(req)[COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (!payload.sid) return null
    const { rows } = await query(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = $1 AND s.expires_at > now()
       LIMIT 1`,
      [payload.sid],
    )
    return rows[0] || null
  } catch {
    return null
  }
}

export async function requireUser(req) {
  const user = await getAuthUser(req)
  if (!user) throw new HttpError(401, 'Avval tizimga kiring', 'UNAUTHORIZED')
  if (user.status === 'blocked') throw new HttpError(403, 'Hisobingiz bloklangan', 'BLOCKED')
  return user
}

export async function requireAdmin(req) {
  const user = await requireUser(req)
  if (user.role !== 'admin') throw new HttpError(403, "Ruxsat yo'q", 'FORBIDDEN')
  return user
}

export async function destroySession(req, res) {
  const token = parseCookies(req)[COOKIE]
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey())
      if (payload.sid) await query('DELETE FROM sessions WHERE id = $1', [payload.sid])
    } catch {
      // token already invalid
    }
  }
  clearCookie(res, COOKIE)
}

export async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new HttpError(
      503,
      "Google login hali sozlanmagan. GOOGLE_CLIENT_ID environment variable qo'shing.",
      'GOOGLE_NOT_CONFIGURED',
    )
  }
  if (!credential) throw new HttpError(400, 'Google credential topilmadi', 'BAD_GOOGLE_TOKEN')
  const client = new OAuth2Client(clientId)
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId })
    const payload = ticket.getPayload()
    if (!payload?.email || !payload.email_verified) {
      throw new Error('email not verified')
    }
    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || null,
    }
  } catch {
    throw new HttpError(401, "Google token noto'g'ri yoki muddati tugagan", 'BAD_GOOGLE_TOKEN')
  }
}
