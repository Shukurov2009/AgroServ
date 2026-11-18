import { createHash, randomInt } from 'node:crypto'
import { HttpError } from './http.js'
import { sendSms, smsConfigured } from './sms.js'

const OTP_TTL_MINUTES = 5
const OTP_COOLDOWN_SECONDS = 60
const OTP_HOURLY_LIMIT = 6
const OTP_MAX_ATTEMPTS = 5

function hashOtp(userId, purpose, code) {
  return createHash('sha256').update(`${userId}:${purpose}:${code}`).digest('hex')
}

export function testModeActive(settings = {}) {
  const setting = settings.smsTestMode
  const enabled = setting === true || setting === 'true' || setting === undefined
  return enabled && !smsConfigured(settings)
}

export async function issueOtp(client, { userId, purpose, phone, settings }) {
  const recent = await client.query(
    `SELECT EXTRACT(EPOCH FROM (now() - created_at))::int AS elapsed_seconds
     FROM otp_codes
     WHERE user_id = $1 AND purpose = $2
     ORDER BY created_at DESC LIMIT 1`,
    [userId, purpose],
  )
  if (recent.rows[0]) {
    const elapsed = Number(recent.rows[0].elapsed_seconds || 0)
    if (elapsed < OTP_COOLDOWN_SECONDS) {
      const wait = Math.max(1, OTP_COOLDOWN_SECONDS - elapsed)
      throw new HttpError(429, `Kod yaqinda yuborilgan. ${wait} soniyadan keyin qayta urinib ko'ring.`, 'OTP_TOO_SOON')
    }
  }

  const hourly = await client.query(
    `SELECT count(*)::int AS count FROM otp_codes
     WHERE user_id = $1 AND created_at > now() - interval '1 hour'`,
    [userId],
  )
  if (hourly.rows[0].count >= OTP_HOURLY_LIMIT) {
    throw new HttpError(429, "Kod yuborish limiti tugadi. Bir soatdan keyin qayta urinib ko'ring.", 'OTP_LIMIT')
  }

  const code = String(randomInt(100000, 1000000))
  const { rows } = await client.query(
    `INSERT INTO otp_codes (user_id, purpose, phone, code_hash, expires_at)
     VALUES ($1, $2, $3, $4, now() + interval '${OTP_TTL_MINUTES} minutes')
     RETURNING id, expires_at`,
    [userId, purpose, phone, hashOtp(userId, purpose, code)],
  )

  const testMode = testModeActive(settings)
  if (!testMode) {
    try {
      await sendSms(settings, phone, `AgroServ tasdiqlash kodi: ${code}. Kod ${OTP_TTL_MINUTES} daqiqa amal qiladi.`)
    } catch (error) {
      await client.query('DELETE FROM otp_codes WHERE id = $1', [rows[0].id])
      if (error.message === 'SMS_NOT_CONFIGURED') {
        throw new HttpError(
          503,
          "SMS xizmati sozlanmagan. Iltimos, adminga murojaat qiling.",
          'SMS_NOT_CONFIGURED',
        )
      }
      if (error.message === 'BAD_PHONE') {
        throw new HttpError(400, "Telefon raqami noto'g'ri", 'BAD_PHONE')
      }
      throw new HttpError(502, "SMS yuborilmadi. Qayta urinib ko'ring.", 'SMS_FAILED')
    }
  }

  return {
    otpId: rows[0].id,
    expiresAt: rows[0].expires_at,
    testMode,
    ...(testMode ? { testCode: code } : {}),
  }
}

export async function consumeOtp(client, { userId, purpose, otpId, code }) {
  if (!otpId) throw new HttpError(400, 'Tasdiqlash kodini oling', 'OTP_REQUIRED')
  const result = await client.query(
    `SELECT *, (expires_at < now()) AS expired
     FROM otp_codes
     WHERE id = $1 AND user_id = $2 AND purpose = $3
     FOR UPDATE`,
    [otpId, userId, purpose],
  )
  const otp = result.rows[0]
  if (!otp) throw new HttpError(400, 'Tasdiqlash kodi topilmadi. Yangi kod oling.', 'OTP_NOT_FOUND')
  if (otp.consumed_at) {
    throw new HttpError(400, 'Bu kod allaqachon ishlatilgan. Yangi kod oling.', 'OTP_USED')
  }
  if (otp.expired) {
    throw new HttpError(400, 'Kod muddati tugagan. Yangi kod oling.', 'OTP_EXPIRED')
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw new HttpError(429, "Juda ko'p urinish. Yangi kod oling.", 'OTP_ATTEMPTS')
  }
  if (otp.code_hash !== hashOtp(userId, purpose, String(code || '').trim())) {
    await client.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [otp.id])
    throw new HttpError(400, "Kod noto'g'ri. Qayta urinib ko'ring.", 'OTP_INVALID')
  }
  await client.query('UPDATE otp_codes SET consumed_at = now() WHERE id = $1', [otp.id])
  return otp
}
