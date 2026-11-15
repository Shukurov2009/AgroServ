import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { PROMOS } from '../src/lib/constants.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { Pool } = pg

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!connectionString) {
  console.error('DATABASE_URL topilmadi. `vercel env pull` yoki .env.local ni tekshiring.')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
})

const settings = {
  siteName: 'AgroServ',
  supportPhone: '+998 71 200 00 00',
  supportEmail: 'salom@agroserv.uz',
  telegram: '@agroserv_uz',
  commissionRate: 5,
  featuredPrice: 25000,
  deliveryFee: 20000,
  freeDeliveryFrom: 1000000,
  workingHours: 'Dushanba-Shanba, 09:00-19:00',
  manualPaymentNote:
    "To'lovni quyidagi kartaga o'tkazing va to'lov cheki/izohini buyurtma raqami bilan yuboring. Admin tasdiqlagach buyurtma faollashadi.",
}

async function main() {
  const schema = readFileSync(join(__dirname, '..', 'api', '_lib', 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✓ Sxema tayyor')

  for (const [key, value] of Object.entries(settings)) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)],
    )
  }
  console.log('✓ Sozlamalar tayyor')

  for (const promo of Object.values(PROMOS)) {
    await pool.query(
      `INSERT INTO promo_codes
        (code, type, value, max_discount, min_total, scope, description, max_uses, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
       ON CONFLICT (code) DO NOTHING`,
      [
        promo.code,
        promo.type,
        promo.value,
        promo.maxDiscount || null,
        promo.minTotal || 0,
        promo.scope,
        promo.description || '',
        1000,
      ],
    )
  }
  console.log('✓ Promo kodlar tayyor')

  const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@agroserv.uz').trim().toLowerCase()
  const adminName = String(process.env.ADMIN_NAME || 'AgroServ Administrator').trim()
  const generatedPassword = randomBytes(9).toString('base64url')
  const adminPassword = process.env.ADMIN_PASSWORD || generatedPassword
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])

  if (existing.rowCount === 0) {
    const hash = await bcrypt.hash(adminPassword, 12)
    await pool.query(
      `INSERT INTO users (name, email, phone, region, role, password_hash, plan, verified, status)
       VALUES ($1,$2,$3,$4,'admin',$5,'free',true,'active')`,
      [adminName, adminEmail, '+998 71 200 00 00', 'Toshkent', hash],
    )
    console.log(`✓ Admin yaratildi: ${adminEmail}`)
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`  Generatsiya qilingan parol: ${adminPassword}`)
    }
  } else if (process.env.RESET_ADMIN === 'true') {
    const hash = await bcrypt.hash(adminPassword, 12)
    await pool.query(
      `UPDATE users SET password_hash = $1, role = 'admin', status = 'active', updated_at = now()
       WHERE email = $2`,
      [hash, adminEmail],
    )
    console.log(`✓ Admin paroli yangilandi: ${adminEmail}`)
  } else {
    console.log(`✓ Admin allaqachon mavjud: ${adminEmail}`)
  }

  const counts = await pool.query(
    `SELECT
      (SELECT count(*) FROM users) AS users,
      (SELECT count(*) FROM products) AS products,
      (SELECT count(*) FROM orders) AS orders`,
  )
  console.log('✓ Bazadagi holat:', counts.rows[0])
}

main()
  .catch((error) => {
    console.error('Init xatosi:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
