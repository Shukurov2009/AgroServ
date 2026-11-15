import { createHash, randomBytes } from 'node:crypto'
import { PLANS, SELF_ROLES } from '../../src/lib/constants.js'
import { query, withTransaction } from './db.js'
import {
  HttpError,
  ok,
  send,
  fail,
  readBody,
  getPath,
  getIp,
  rateLimit,
  assertSameOrigin,
  parseCookies,
  handleError,
} from './http.js'
import {
  hashPassword,
  verifyPassword,
  createSession,
  getAuthUser,
  destroySession,
  verifyGoogleCredential,
} from './auth.js'
import {
  toUser,
  toPublicUser,
  toProduct,
  toService,
  toJob,
  toApplication,
  toVideo,
  toOrder,
  toTransaction,
  toPayment,
  toMessage,
  toCard,
  toReview,
  settingsFromRows,
} from './serialize.js'
import {
  validatePromo,
  consumePromo,
  releasePromo,
  creditOrderSellers,
  groupBySeller,
  sellerIncome,
  sellerFee,
  applyPaidPayment,
} from './payments.js'
import { emailConfigured, sendEmail, passwordResetEmail } from './email.js'

const DEFAULT_SETTINGS = {
  siteName: 'AgroServ',
  supportPhone: '+998 71 200 00 00',
  supportEmail: 'salom@agroserv.uz',
  telegram: '@agroserv_uz',
  commissionRate: 0,
  featuredPrice: 25000,
  deliveryFee: 20000,
  freeDeliveryFrom: 1000000,
  workingHours: 'Dushanba-Shanba, 09:00-19:00',
  manualPaymentNote:
    "To'lovni quyidagi kartaga o'tkazing va to'lov cheki/izohini buyurtma raqami bilan yuboring. Admin tasdiqlagach buyurtma faollashadi.",
}

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled']
const PRODUCT_STATUSES = ['active', 'paused', 'hidden', 'sold', 'blocked']

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function clean(value, max = 500) {
  return String(value ?? '').trim().slice(0, max)
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function planForRow() {
  return PLANS.free
}

async function loadSettings(client = null) {
  const runner = client ? client.query.bind(client) : query
  const { rows } = await runner('SELECT key, value FROM settings')
  return { ...DEFAULT_SETTINGS, ...settingsFromRows(rows), commissionRate: 0 }
}

function providersConfig() {
  return {
    manual: true,
    wallet: true,
    cash: true,
    payme: Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_KEY),
    click: Boolean(
      process.env.CLICK_SERVICE_ID && process.env.CLICK_MERCHANT_ID && process.env.CLICK_SECRET_KEY,
    ),
  }
}

function integrationsConfig() {
  return {
    google: Boolean(process.env.GOOGLE_CLIENT_ID),
    email: emailConfigured(),
  }
}

function providerRedirect(provider, payment) {
  const appUrl = process.env.APP_URL || ''
  if (provider === 'payme') {
    const merchantId = process.env.PAYME_MERCHANT_ID
    if (!merchantId) return null
    const raw = `m=${merchantId};ac=${payment.id};a=${Number(payment.amount) * 100};l=uz`
    return `https://checkout.paycom.uz/${Buffer.from(raw).toString('base64')}`
  }
  if (provider === 'click') {
    const serviceId = process.env.CLICK_SERVICE_ID
    const merchantId = process.env.CLICK_MERCHANT_ID
    if (!serviceId || !merchantId) return null
    const params = new URLSearchParams({
      service_id: serviceId,
      merchant_id: merchantId,
      amount: String(Number(payment.amount)),
      transaction_param: payment.id,
      return_url: `${appUrl}/kabinet`,
    })
    return `https://my.click.uz/services/pay?${params.toString()}`
  }
  return null
}

async function nextOrderNumber(client) {
  const { rows } = await client.query("SELECT nextval('order_number_seq') AS n")
  return `AG-${new Date().getFullYear()}-${String(rows[0].n).padStart(4, '0')}`
}

async function createPaymentRow(client, { userId, purpose, reference, amount, provider, meta = {} }) {
  const { rows } = await client.query(
    `INSERT INTO payments (user_id, purpose, reference, amount, provider, status, meta)
     VALUES ($1,$2,$3,$4,$5,'pending',$6::jsonb) RETURNING *`,
    [userId, purpose, reference || null, amount, provider, JSON.stringify(meta)],
  )
  return rows[0]
}

async function getOrderWithBuyer(client, id) {
  const { rows } = await client.query(
    `SELECT o.*, b.name AS buyer_name FROM orders o JOIN users b ON b.id = o.buyer_id WHERE o.id = $1`,
    [id],
  )
  return rows[0]
}

function publicPayment(payment) {
  if (!payment) return null
  return {
    ...toPayment(payment),
    redirectUrl: providerRedirect(payment.provider, payment),
  }
}

async function bootstrap(ctx) {
  const user = ctx.user
  const admin = user?.role === 'admin'

  const [
    settingsRows,
    productsResult,
    servicesResult,
    jobsResult,
    videosResult,
    reviewsResult,
    usersResult,
    cardsResult,
    publicStatsResult,
  ] = await Promise.all([
    query('SELECT key, value FROM settings'),
    admin
      ? query(
          `SELECT p.*, u.name AS seller_name, u.phone AS seller_phone, u.verified AS seller_verified
           FROM products p JOIN users u ON u.id = p.seller_id ORDER BY p.created_at DESC`,
        )
      : query(
          `SELECT p.*, u.name AS seller_name, u.phone AS seller_phone, u.verified AS seller_verified
           FROM products p JOIN users u ON u.id = p.seller_id
           WHERE p.status = 'active' OR p.seller_id = $1 ORDER BY p.created_at DESC`,
          [user?.id || null],
        ),
    admin
      ? query('SELECT * FROM services ORDER BY created_at DESC')
      : query(
          `SELECT * FROM services WHERE status = 'active' OR user_id = $1 ORDER BY created_at DESC`,
          [user?.id || null],
        ),
    admin
      ? query('SELECT * FROM jobs ORDER BY created_at DESC')
      : query(
          `SELECT * FROM jobs WHERE status = 'active' OR user_id = $1 ORDER BY created_at DESC`,
          [user?.id || null],
        ),
    query("SELECT * FROM videos WHERE status = 'active' ORDER BY created_at DESC"),
    query('SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC'),
    admin
      ? query('SELECT * FROM users ORDER BY created_at DESC')
      : query(
          `SELECT id, name, region, role, plan, verified, avatar_url, avatar, bio, created_at
           FROM users ORDER BY created_at DESC LIMIT 1000`,
        ),
    admin
      ? query('SELECT * FROM payment_cards ORDER BY created_at DESC')
      : query('SELECT * FROM payment_cards WHERE active = true ORDER BY created_at DESC'),
    query(`SELECT
      (SELECT count(*) FROM users)::int AS users,
      (SELECT count(*) FROM orders)::int AS orders,
      (SELECT coalesce(sum(total),0) FROM orders WHERE status <> 'cancelled')::bigint AS gross_sales,
      (SELECT coalesce(sum(commission_amount),0) FROM orders WHERE status <> 'cancelled')::bigint AS commission`),
  ])

  let orders = []
  let transactions = []
  let cart = []
  let favorites = []
  let applications = []
  let messages = []
  let subscribers = []
  let payments = []
  let promoCodes = []
  let passwordResets = []
  let aiCount = 0

  if (user) {
    const [ordersResult, transactionsResult, cartResult, favoritesResult, applicationsResult, aiResult] =
      await Promise.all([
        admin
          ? query(
              `SELECT o.*, b.name AS buyer_name FROM orders o JOIN users b ON b.id = o.buyer_id
               ORDER BY o.created_at DESC`,
            )
          : query(
              `SELECT o.*, b.name AS buyer_name FROM orders o JOIN users b ON b.id = o.buyer_id
               WHERE o.buyer_id = $1 OR o.seller_id = $1 OR $1 = ANY(o.seller_ids)
               ORDER BY o.created_at DESC`,
              [user.id],
            ),
        admin
          ? query('SELECT * FROM transactions ORDER BY created_at DESC')
          : query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC', [user.id]),
        query('SELECT product_id, qty FROM cart_items WHERE user_id = $1 ORDER BY created_at', [user.id]),
        query('SELECT product_id FROM favorites WHERE user_id = $1', [user.id]),
        admin
          ? query('SELECT * FROM applications ORDER BY created_at DESC')
          : query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', [user.id]),
        query('SELECT count FROM ai_usage WHERE user_id = $1 AND day = CURRENT_DATE', [user.id]),
      ])
    orders = ordersResult.rows
    transactions = transactionsResult.rows
    cart = cartResult.rows
    favorites = favoritesResult.rows
    applications = applicationsResult.rows
    aiCount = aiResult.rows[0]?.count || 0

    if (admin) {
      const [messagesResult, subscribersResult, paymentsResult, promosResult, resetsResult] =
        await Promise.all([
          query('SELECT * FROM messages ORDER BY created_at DESC'),
          query('SELECT email, created_at FROM subscribers ORDER BY created_at DESC'),
          query(
            `SELECT p.*, u.name AS user_name FROM payments p JOIN users u ON u.id = p.user_id
             ORDER BY p.created_at DESC`,
          ),
          query('SELECT * FROM promo_codes ORDER BY code'),
          query('SELECT * FROM password_resets ORDER BY created_at DESC'),
        ])
      messages = messagesResult.rows
      subscribers = subscribersResult.rows.map((row) => row.email)
      payments = paymentsResult.rows
      promoCodes = promosResult.rows
      passwordResets = resetsResult.rows
    }
  }

  const walletTypes = new Set([
    'topup',
    'purchase',
    'earning',
    'refund',
    'refund_deduction',
    'subscription',
    'feature',
    'admin_adjust',
  ])

  return {
    settings: { ...DEFAULT_SETTINGS, ...settingsFromRows(settingsRows.rows) },
    products: productsResult.rows.map(toProduct),
    services: servicesResult.rows.map(toService),
    jobs: jobsResult.rows.map(toJob),
    videos: videosResult.rows.map(toVideo),
    reviews: reviewsResult.rows.map(toReview),
    users: usersResult.rows.map((row) => (admin ? toUser(row, { admin: true }) : toPublicUser(row))),
    currentUser: user ? toUser(user, { self: true }) : null,
    cart: cart.map((row) => ({ productId: row.product_id, qty: row.qty })),
    favoriteIds: favorites.map((row) => row.product_id),
    orders: orders.map(toOrder),
    transactions: transactions.map(toTransaction),
    walletTx: transactions
      .filter((row) => walletTypes.has(row.type))
      .map((row) => ({
        id: row.id,
        userId: row.user_id,
        amount: Number(row.amount),
        type: row.type,
        description: row.description || '',
        createdAt: new Date(row.created_at).toISOString(),
      })),
    applications: applications.map(toApplication),
    messages: messages.map(toMessage),
    cards: cardsResult.rows.map(toCard),
    subscribers,
    payments: payments.map(toPayment),
    promoCodes: promoCodes.map((row) => ({
      code: row.code,
      type: row.type,
      value: Number(row.value),
      maxDiscount: row.max_discount == null ? null : Number(row.max_discount),
      minTotal: Number(row.min_total || 0),
      scope: row.scope,
      description: row.description || '',
      maxUses: row.max_uses,
      uses: row.uses,
      active: Boolean(row.active),
      expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    })),
    passwordResets: passwordResets.map((row) => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      status: row.status,
      note: row.note || '',
      createdAt: new Date(row.created_at).toISOString(),
      resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : null,
    })),
    aiUsage: user ? { date: new Date().toISOString().slice(0, 10), count: aiCount } : null,
    stats: {
      users: publicStatsResult.rows[0].users,
      orders: publicStatsResult.rows[0].orders,
      grossSales: Number(publicStatsResult.rows[0].gross_sales),
      commission: Number(publicStatsResult.rows[0].commission),
    },
    providers: providersConfig(),
    integrations: integrationsConfig(),
  }
}

async function register(ctx) {
  const body = await readBody(ctx.req)
  rateLimit(`register:${getIp(ctx.req)}`, 10, 60 * 60 * 1000)
  const name = clean(body.name, 80)
  const email = normalizeEmail(body.email)
  const password = String(body.password || '')
  const role = String(body.role || '')
  if (name.length < 2) throw new HttpError(400, "Ismni to'liq kiriting", 'BAD_NAME')
  if (!isEmail(email)) throw new HttpError(400, "Email manzil noto'g'ri", 'BAD_EMAIL')
  if (password.length < 8) throw new HttpError(400, "Parol kamida 8 ta belgidan iborat bo'lsin", 'BAD_PASSWORD')
  if (!SELF_ROLES.includes(role)) throw new HttpError(400, 'Rolni tanlang', 'BAD_ROLE')

  const existing = await query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rowCount > 0) throw new HttpError(409, "Bu email allaqachon ro'yxatdan o'tgan", 'EMAIL_TAKEN')

  const hash = await hashPassword(password)
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, region, role, password_hash, plan, verified, status)
     VALUES ($1,$2,$3,$4,$5,$6,'free',false,'active') RETURNING *`,
    [name, email, clean(body.phone, 40), clean(body.region, 80) || 'Toshkent', role, hash],
  )
  await createSession(ctx.req, ctx.res, rows[0].id)
  return { user: toUser(rows[0], { self: true }) }
}

async function login(ctx) {
  const body = await readBody(ctx.req)
  const email = normalizeEmail(body.email)
  const password = String(body.password || '')
  rateLimit(`login:${getIp(ctx.req)}:${email}`, 10, 15 * 60 * 1000)
  if (!isEmail(email) || !password) throw new HttpError(400, "Email va parolni kiriting", 'BAD_CREDENTIALS')

  const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email])
  const user = rows[0]
  if (!user) throw new HttpError(401, "Email yoki parol noto'g'ri", 'BAD_CREDENTIALS')
  if (user.status === 'blocked') throw new HttpError(403, 'Hisobingiz bloklangan', 'BLOCKED')
  if (!user.password_hash) {
    throw new HttpError(400, "Bu hisob Google orqali yaratilgan. Google bilan kiring.", 'GOOGLE_ACCOUNT')
  }
  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) throw new HttpError(401, "Email yoki parol noto'g'ri", 'BAD_CREDENTIALS')

  await createSession(ctx.req, ctx.res, user.id)
  return { user: toUser(user, { self: true }) }
}

async function googleAuth(ctx) {
  const body = await readBody(ctx.req)
  rateLimit(`google:${getIp(ctx.req)}`, 20, 15 * 60 * 1000)
  const profile = await verifyGoogleCredential(body.credential)
  const role = String(body.role || '')

  const existing = await query(
    'SELECT * FROM users WHERE google_id = $1 OR email = $2 ORDER BY (google_id = $1) DESC LIMIT 1',
    [profile.sub, profile.email],
  )
  let user = existing.rows[0]

  if (!user) {
    if (!SELF_ROLES.includes(role)) {
      throw new HttpError(409, "Google hisobi topilmadi. Rolni tanlab ro'yxatdan o'ting.", 'NO_ACCOUNT', {
        needsRole: true,
        profile: { email: profile.email, name: profile.name, picture: profile.picture },
      })
    }
    const inserted = await query(
      `INSERT INTO users (name, email, role, google_id, avatar_url, plan, verified, status)
       VALUES ($1,$2,$3,$4,$5,'free',true,'active') RETURNING *`,
      [profile.name, profile.email, role, profile.sub, profile.picture],
    )
    user = inserted.rows[0]
  } else {
    if (user.status === 'blocked') throw new HttpError(403, 'Hisobingiz bloklangan', 'BLOCKED')
    if (!user.google_id) {
      const updated = await query(
        `UPDATE users SET google_id = $1,
           avatar_url = COALESCE(avatar_url, $2), verified = true, updated_at = now()
         WHERE id = $3 RETURNING *`,
        [profile.sub, profile.picture, user.id],
      )
      user = updated.rows[0]
    }
  }

  await createSession(ctx.req, ctx.res, user.id)
  return { user: toUser(user, { self: true }) }
}

async function forgotPassword(ctx) {
  const body = await readBody(ctx.req)
  const email = normalizeEmail(body.email)
  rateLimit(`forgot:${getIp(ctx.req)}`, 5, 60 * 60 * 1000)
  if (!isEmail(email)) throw new HttpError(400, "Email manzil noto'g'ri", 'BAD_EMAIL')

  const emailEnabled = emailConfigured()
  const { rows } = await query('SELECT id, name FROM users WHERE email = $1', [email])

  if (rows[0]) {
    const user = rows[0]

    if (emailEnabled) {
      const recent = await query(
        `SELECT id FROM password_resets
         WHERE user_id = $1 AND status = 'pending' AND token_hash IS NOT NULL
           AND created_at > now() - interval '2 minutes'`,
        [user.id],
      )

      if (recent.rowCount === 0) {
        const token = randomBytes(32).toString('base64url')
        const tokenHash = createHash('sha256').update(token).digest('hex')
        const appUrl = (process.env.APP_URL || 'https://agroserv-lake.vercel.app').replace(/\/+$/, '')
        const resetUrl = `${appUrl}/parolni-tiklash?token=${encodeURIComponent(token)}`

        await query(
          `UPDATE password_resets SET status = 'rejected', resolved_at = now()
           WHERE user_id = $1 AND status = 'pending'`,
          [user.id],
        )
        await query(
          `INSERT INTO password_resets (user_id, email, status, token_hash, expires_at, note)
           VALUES ($1, $2, 'pending', $3, now() + interval '30 minutes', 'email')`,
          [user.id, email, tokenHash],
        )

        const mail = passwordResetEmail({ name: user.name, url: resetUrl })
        const result = await sendEmail({
          to: email,
          subject: "AgroServ: parolni tiklash havolasi",
          text: mail.text,
          html: mail.html,
        })

        if (!result.sent) {
          console.error('Parol tiklash emaili yuborilmadi:', result.reason)
          await query(
            `UPDATE password_resets SET note = 'email-failed'
             WHERE token_hash = $1 AND status = 'pending'`,
            [tokenHash],
          )
        }
      }
    } else {
      const recent = await query(
        `SELECT id FROM password_resets
         WHERE email = $1 AND status = 'pending' AND created_at > now() - interval '10 minutes'`,
        [email],
      )
      if (recent.rowCount === 0) {
        await query('INSERT INTO password_resets (user_id, email) VALUES ($1,$2)', [user.id, email])
      }
    }
  }

  return {
    delivery: emailEnabled ? 'email' : 'admin',
    message: emailEnabled
      ? "Agar bu email ro'yxatdan o'tgan bo'lsa, parolni tiklash havolasi yuborildi. Havola 30 daqiqa amal qiladi."
      : "Agar bu email ro'yxatdan o'tgan bo'lsa, administrator parolni tiklash so'rovini ko'radi va siz bilan bog'lanadi.",
  }
}

async function confirmPasswordReset(ctx) {
  const body = await readBody(ctx.req)
  const token = String(body.token || '').trim()
  const password = String(body.password || '')
  rateLimit(`reset-confirm:${getIp(ctx.req)}`, 20, 60 * 60 * 1000)

  if (!token || token.length < 20) {
    throw new HttpError(400, "Havola yaroqsiz yoki muddati o'tgan", 'BAD_TOKEN')
  }
  if (password.length < 8) {
    throw new HttpError(400, "Yangi parol kamida 8 ta belgidan iborat bo'lsin", 'BAD_PASSWORD')
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const { rows } = await query(
    `SELECT * FROM password_resets
     WHERE token_hash = $1 AND status = 'pending' AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [tokenHash],
  )
  const reset = rows[0]
  if (!reset) throw new HttpError(400, "Havola yaroqsiz yoki muddati o'tgan", 'BAD_TOKEN')

  const hash = await hashPassword(password)
  await withTransaction(async (client) => {
    const updated = await client.query(
      `UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING id`,
      [hash, reset.user_id],
    )
    if (updated.rowCount === 0) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
    await client.query(
      `UPDATE password_resets
       SET status = 'resolved', resolved_at = now(), used_at = now()
       WHERE id = $1`,
      [reset.id],
    )
    await client.query('DELETE FROM sessions WHERE user_id = $1', [reset.user_id])
  })

  return { message: "Parol yangilandi. Endi yangi parol bilan kirishingiz mumkin." }
}

async function changePassword(ctx) {
  const body = await readBody(ctx.req)
  const currentPassword = String(body.currentPassword || '')
  const newPassword = String(body.newPassword || '')
  if (newPassword.length < 8) {
    throw new HttpError(400, "Yangi parol kamida 8 ta belgidan iborat bo'lsin", 'BAD_PASSWORD')
  }
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [ctx.user.id])
  const user = rows[0]
  if (!user) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
  if (user.password_hash) {
    const valid = await verifyPassword(currentPassword, user.password_hash)
    if (!valid) throw new HttpError(400, "Joriy parol noto'g'ri", 'BAD_CURRENT_PASSWORD')
  }
  const hash = await hashPassword(newPassword)
  await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [hash, user.id])
  return { message: user.password_hash ? "Parol o'zgartirildi" : "Parol o'rnatildi" }
}

async function updateProfile(ctx) {
  const body = await readBody(ctx.req)
  const fields = {}
  if (body.name !== undefined) {
    const name = clean(body.name, 80)
    if (name.length < 2) throw new HttpError(400, 'Ism juda qisqa', 'BAD_NAME')
    fields.name = name
  }
  if (body.phone !== undefined) fields.phone = clean(body.phone, 40)
  if (body.region !== undefined) fields.region = clean(body.region, 80)
  if (body.bio !== undefined) fields.bio = clean(body.bio, 500)
  if (body.avatar !== undefined) fields.avatar = clean(body.avatar, 16)
  const keys = Object.keys(fields)
  if (!keys.length) return { user: toUser(ctx.user, { self: true }) }
  const sets = keys.map((key, index) => `${key} = $${index + 1}`)
  const values = keys.map((key) => fields[key])
  values.push(ctx.user.id)
  const { rows } = await query(
    `UPDATE users SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`,
    values,
  )
  return { user: toUser(rows[0], { self: true }) }
}

async function setSelfRole(ctx) {
  const body = await readBody(ctx.req)
  const role = String(body.role || '')
  if (ctx.user.role === 'admin') {
    throw new HttpError(400, "Administrator roli faqat admin panel orqali o'zgartiriladi", 'ADMIN_ROLE')
  }
  if (!SELF_ROLES.includes(role)) throw new HttpError(400, "Bu rolni tanlash mumkin emas", 'BAD_ROLE')
  const { rows } = await query(
    'UPDATE users SET role = $1, updated_at = now() WHERE id = $2 RETURNING *',
    [role, ctx.user.id],
  )
  return { user: toUser(rows[0], { self: true }) }
}

async function addToCart(ctx) {
  const body = await readBody(ctx.req)
  const productId = clean(body.productId, 60)
  const qty = Math.max(1, Math.floor(Number(body.qty) || 1))
  const { rows } = await query(
    `SELECT p.*, u.name AS seller_name FROM products p JOIN users u ON u.id = p.seller_id
     WHERE p.id = $1 AND p.status = 'active'`,
    [productId],
  )
  const product = rows[0]
  if (!product) throw new HttpError(404, 'Mahsulot topilmadi', 'PRODUCT_NOT_FOUND')
  if (product.seller_id === ctx.user.id) {
    throw new HttpError(400, "O'z mahsulotingizni savatga qo'sha olmaysiz", 'OWN_PRODUCT')
  }
  if (product.stock <= 0) throw new HttpError(400, 'Mahsulot tugagan', 'OUT_OF_STOCK')
  const existing = await query('SELECT qty FROM cart_items WHERE user_id = $1 AND product_id = $2', [
    ctx.user.id,
    productId,
  ])
  const nextQty = Math.min(product.stock, (existing.rows[0]?.qty || 0) + qty)
  await query(
    `INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1,$2,$3)
     ON CONFLICT (user_id, product_id) DO UPDATE SET qty = $3`,
    [ctx.user.id, productId, nextQty],
  )
  return { qty: nextQty }
}

async function updateCartQty(ctx) {
  const body = await readBody(ctx.req)
  const productId = ctx.params.productId
  const qty = Math.floor(Number(body.qty) || 0)
  if (qty <= 0) {
    await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [ctx.user.id, productId])
    return { removed: true }
  }
  const product = await query("SELECT stock FROM products WHERE id = $1 AND status = 'active'", [productId])
  if (!product.rows[0]) throw new HttpError(404, 'Mahsulot topilmadi', 'PRODUCT_NOT_FOUND')
  const nextQty = Math.min(product.rows[0].stock, qty)
  await query('UPDATE cart_items SET qty = $1 WHERE user_id = $2 AND product_id = $3', [
    nextQty,
    ctx.user.id,
    productId,
  ])
  return { qty: nextQty }
}

async function toggleFavorite(ctx) {
  const productId = ctx.params.productId
  const product = await query('SELECT id FROM products WHERE id = $1', [productId])
  if (!product.rows[0]) throw new HttpError(404, 'Mahsulot topilmadi', 'PRODUCT_NOT_FOUND')
  const existing = await query('SELECT 1 FROM favorites WHERE user_id = $1 AND product_id = $2', [
    ctx.user.id,
    productId,
  ])
  if (existing.rowCount > 0) {
    await query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [ctx.user.id, productId])
    return { added: false }
  }
  await query('INSERT INTO favorites (user_id, product_id) VALUES ($1,$2)', [ctx.user.id, productId])
  return { added: true }
}

async function checkout(ctx) {
  const body = await readBody(ctx.req)
  const items = Array.isArray(body.items) ? body.items : []
  if (!items.length) throw new HttpError(400, 'Buyurtma uchun mahsulot tanlanmagan', 'EMPTY_ORDER')
  const method = String(body.method || 'manual')
  if (!['wallet', 'manual', 'cash', 'payme', 'click'].includes(method)) {
    throw new HttpError(400, "To'lov usulini tanlang", 'BAD_METHOD')
  }
  if (['payme', 'click'].includes(method) && !providersConfig()[method]) {
    throw new HttpError(
      503,
      `${method === 'payme' ? 'Payme' : 'Click'} hali sozlanmagan. Administrator bilan bog'laning.`,
      'PROVIDER_NOT_CONFIGURED',
    )
  }
  const promoCode = clean(body.promoCode, 40).toUpperCase()
  const info = body.info || {}
  const clearCartAfter = Boolean(body.clearCartAfter)

  const result = await withTransaction(async (client) => {
    const userResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [ctx.user.id])
    const userRow = userResult.rows[0]
    if (!userRow) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
    const settings = await loadSettings(client)
    const built = []

    for (const item of items) {
      if (item.type === 'product') {
        const productResult = await client.query(
          `SELECT p.*, u.name AS seller_name, u.plan AS seller_plan,
                  u.plan_expires_at AS seller_plan_expires_at
           FROM products p JOIN users u ON u.id = p.seller_id
           WHERE p.id = $1 FOR UPDATE OF p`,
          [item.refId],
        )
        const product = productResult.rows[0]
        if (!product || product.status !== 'active') {
          throw new HttpError(404, 'Mahsulot topilmadi yoki faol emas', 'PRODUCT_NOT_FOUND')
        }
        if (product.seller_id === userRow.id) {
          throw new HttpError(400, "O'z mahsulotingizni sotib olmaysiz", 'OWN_PRODUCT')
        }
        const qty = Math.max(1, Math.floor(Number(item.qty) || 1))
        if (qty > product.stock) {
          throw new HttpError(
            400,
            `«${product.title}» uchun omborda ${product.stock} ${product.unit} qoldi`,
            'OUT_OF_STOCK',
          )
        }
        const rate = 0
        built.push({
          type: 'product',
          refId: product.id,
          title: product.title,
          emoji: product.emoji,
          price: Number(product.price),
          qty,
          unit: product.unit,
          sellerId: product.seller_id,
          sellerName: product.seller_name,
          commissionRate: rate,
          fee: Math.round((Number(product.price) * qty * rate) / 100),
        })
      } else if (item.type === 'service') {
        const serviceResult = await client.query(
          `SELECT s.*, u.plan AS seller_plan, u.plan_expires_at AS seller_plan_expires_at
           FROM services s JOIN users u ON u.id = s.user_id
           WHERE s.id = $1 FOR UPDATE OF s`,
          [item.refId],
        )
        const service = serviceResult.rows[0]
        if (!service || service.status !== 'active') {
          throw new HttpError(404, 'Xizmat topilmadi', 'SERVICE_NOT_FOUND')
        }
        if (service.user_id === userRow.id) {
          throw new HttpError(400, "O'z xizmatingizni band qila olmaysiz", 'OWN_SERVICE')
        }
        const qty = Math.max(1, Math.floor(Number(item.qty) || 1))
        const rate = 0
        built.push({
          type: 'service',
          refId: service.id,
          title: `${service.specialization || service.service_type} — ${service.name}`,
          emoji: service.type === 'worker' ? '🔧' : '🌿',
          price: Number(service.price),
          qty,
          unit: service.unit,
          sellerId: service.user_id,
          sellerName: service.name,
          commissionRate: rate,
          fee: Math.round((Number(service.price) * qty * rate) / 100),
        })
      } else {
        throw new HttpError(400, "Noto'g'ri buyurtma turi", 'BAD_ITEM')
      }
    }

    const subtotal = built.reduce((sum, item) => sum + item.price * item.qty, 0)
    const hasProducts = built.some((item) => item.type === 'product')
    let discount = 0
    let appliedPromo = ''
    if (promoCode) {
      const promotion = await validatePromo(promoCode, 'order', subtotal)
      if (!promotion.ok) throw new HttpError(400, promotion.error, 'BAD_PROMO')
      discount = promotion.discount
      appliedPromo = promotion.promo.code
    }
    const delivery =
      hasProducts && subtotal < Number(settings.freeDeliveryFrom) ? Number(settings.deliveryFee) : 0
    const total = Math.max(0, subtotal - discount + delivery)
    const commissionAmount = built.reduce((sum, item) => sum + item.fee, 0)
    const sellerIds = [...new Set(built.map((item) => item.sellerId).filter(Boolean))]
    const walletPaid = method === 'wallet'

    if (walletPaid && Number(userRow.wallet) < total) {
      throw new HttpError(
        400,
        "Hamyonda mablag' yetarli emas. Hamyonni to'ldiring yoki boshqa usulni tanlang.",
        'INSUFFICIENT_WALLET',
      )
    }

    const number = await nextOrderNumber(client)
    const status = walletPaid ? 'processing' : 'pending'
    const paymentStatus = walletPaid ? 'paid' : 'pending'
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (number, buyer_id, seller_id, seller_ids, type, status, payment_method, payment_status,
         subtotal, delivery_fee, discount, total, commission_rate, commission_amount,
         address, phone, note, items, promo_code, credited)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19,$20)
       RETURNING *`,
      [
        number,
        userRow.id,
        sellerIds[0] || null,
        sellerIds,
        hasProducts ? 'product' : 'service',
        status,
        method,
        paymentStatus,
        subtotal,
        delivery,
        discount,
        total,
        built[0]?.commissionRate || 0,
        commissionAmount,
        clean(info.address, 300),
        clean(info.phone, 40) || userRow.phone || '',
        clean(info.note, 500),
        JSON.stringify(built),
        appliedPromo || null,
        false,
      ],
    )
    const order = orderRows[0]

    for (const item of built) {
      if (item.type !== 'product') continue
      await client.query(
        `UPDATE products SET stock = stock - $1, sales = sales + $1, updated_at = now()
         WHERE id = $2`,
        [item.qty, item.refId],
      )
    }
    for (const item of built) {
      if (item.type !== 'service') continue
      await client.query(
        'UPDATE services SET completed_orders = completed_orders + 1, updated_at = now() WHERE id = $1',
        [item.refId],
      )
    }

    if (appliedPromo) await consumePromo(client, appliedPromo)

    let payment = null
    if (walletPaid) {
      const buyerUpdate = await client.query(
        'UPDATE users SET wallet = wallet - $1, updated_at = now() WHERE id = $2 RETURNING wallet',
        [total, userRow.id],
      )
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
         VALUES ($1,'purchase',$2,$3,$4,$5,'wallet','completed')`,
        [userRow.id, -total, Number(buyerUpdate.rows[0].wallet), `${number} buyurtma to'lovi`, order.id],
      )
      await creditOrderSellers(client, order)
      payment = await createPaymentRow(client, {
        userId: userRow.id,
        purpose: 'order',
        reference: order.id,
        amount: total,
        provider: 'wallet',
        meta: { orderNumber: number },
      })
      await client.query(
        "UPDATE payments SET status = 'paid', paid_at = now() WHERE id = $1",
        [payment.id],
      )
      payment.status = 'paid'
    } else if (method !== 'cash') {
      payment = await createPaymentRow(client, {
        userId: userRow.id,
        purpose: 'order',
        reference: order.id,
        amount: total,
        provider: method,
        meta: { orderNumber: number },
      })
    }

    if (clearCartAfter) {
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [userRow.id])
    }

    const fullOrder = await getOrderWithBuyer(client, order.id)
    return {
      order: toOrder(fullOrder),
      payment: publicPayment(payment),
      providers: providersConfig(),
    }
  })

  return result
}

async function updateOrderStatus(ctx) {
  const body = await readBody(ctx.req)
  const status = String(body.status || '')
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, "Holat noto'g'ri", 'BAD_STATUS')

  const result = await withTransaction(async (client) => {
    const orderResult = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [ctx.params.id])
    const order = orderResult.rows[0]
    if (!order) throw new HttpError(404, 'Buyurtma topilmadi', 'ORDER_NOT_FOUND')
    const isSeller =
      order.seller_id === ctx.user.id || (Array.isArray(order.seller_ids) && order.seller_ids.includes(ctx.user.id))
    const isBuyer = order.buyer_id === ctx.user.id
    const isAdmin = ctx.user.role === 'admin'

    if (!isAdmin) {
      const sellerAllowed = isSeller && ['processing', 'shipped', 'completed'].includes(status)
      const buyerAllowed = isBuyer && status === 'cancelled'
      if (!sellerAllowed && !buyerAllowed) {
        throw new HttpError(403, "Bu amal uchun ruxsat yo'q", 'FORBIDDEN')
      }
    }
    if (order.status === status) {
      return { order: toOrder(await getOrderWithBuyer(client, order.id)) }
    }

    const items = Array.isArray(order.items) ? order.items : []
    const paymentMethod = order.payment_method

    if (status === 'completed') {
      if (!order.credited) {
        if (paymentMethod === 'cash') {
          const groups = groupBySeller(items)
          for (const [sellerId, sellerItems] of groups) {
            const fee = sellerFee(sellerItems)
            if (fee <= 0) continue
            const updated = await client.query(
              'UPDATE users SET wallet = wallet - $1, updated_at = now() WHERE id = $2 RETURNING wallet',
              [fee, sellerId],
            )
            await client.query(
              `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
               VALUES ($1,'commission_deduction',$2,$3,$4,$5,'cash','completed')`,
              [
                sellerId,
                -fee,
                Number(updated.rows[0]?.wallet || 0),
                `${order.number} naqd savdo komissiyasi`,
                order.id,
              ],
            )
          }
          if (Number(order.commission_amount || 0) > 0) {
            await client.query(
              `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
               VALUES ($1,'commission',$2,NULL,$3,$4,'cash','completed')`,
              [
                order.buyer_id,
                Number(order.commission_amount || 0),
                `${order.number} buyurtmasi bo'yicha komissiya`,
                order.id,
              ],
            )
          }
          await client.query('UPDATE orders SET credited = true WHERE id = $1', [order.id])
        } else {
          await creditOrderSellers(client, order)
        }
      }
      if (paymentMethod === 'cash' && order.payment_status !== 'paid') {
        const existingPurchase = await client.query(
          "SELECT 1 FROM transactions WHERE reference = $1 AND type = 'purchase' LIMIT 1",
          [order.id],
        )
        if (existingPurchase.rowCount === 0) {
          const buyer = await client.query('SELECT wallet FROM users WHERE id = $1', [order.buyer_id])
          await client.query(
            `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
             VALUES ($1,'purchase',$2,$3,$4,$5,'cash','completed')`,
            [
              order.buyer_id,
              -Number(order.total),
              Number(buyer.rows[0]?.wallet || 0),
              `${order.number} naqd buyurtma to'lovi`,
              order.id,
            ],
          )
        }
      }
    }

    if (status === 'cancelled') {
      for (const item of items) {
        if (item.type === 'product') {
          await client.query(
            `UPDATE products SET stock = stock + $1,
               sales = GREATEST(0, sales - $1), updated_at = now() WHERE id = $2`,
            [item.qty, item.refId],
          )
        }
        if (item.type === 'service') {
          await client.query(
            'UPDATE services SET completed_orders = GREATEST(0, completed_orders - 1), updated_at = now() WHERE id = $1',
            [item.refId],
          )
        }
      }

      const refundable = ['wallet', 'manual', 'payme', 'click'].includes(paymentMethod)
      if (refundable && order.payment_status === 'paid' && !order.refunded) {
        const updated = await client.query(
          'UPDATE users SET wallet = wallet + $1, updated_at = now() WHERE id = $2 RETURNING wallet',
          [Number(order.total), order.buyer_id],
        )
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
           VALUES ($1,'refund',$2,$3,$4,$5,$6,'completed')`,
          [
            order.buyer_id,
            Number(order.total),
            Number(updated.rows[0]?.wallet || 0),
            `${order.number} buyurtmasi qaytarildi`,
            order.id,
            paymentMethod,
          ],
        )
        await client.query('UPDATE orders SET refunded = true WHERE id = $1', [order.id])
      }

      if (order.credited) {
        const groups = groupBySeller(items)
        for (const [sellerId, sellerItems] of groups) {
          if (paymentMethod === 'cash') {
            const fee = sellerFee(sellerItems)
            if (fee > 0) {
              const updated = await client.query(
                'UPDATE users SET wallet = wallet + $1, updated_at = now() WHERE id = $2 RETURNING wallet',
                [fee, sellerId],
              )
              await client.query(
                `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
                 VALUES ($1,'refund',$2,$3,$4,$5,'cash','completed')`,
                [
                  sellerId,
                  fee,
                  Number(updated.rows[0]?.wallet || 0),
                  `${order.number} bekor qilindi — komissiya qaytarildi`,
                  order.id,
                ],
              )
            }
          } else {
            const income = sellerIncome(sellerItems)
            const updated = await client.query(
              'UPDATE users SET wallet = wallet - $1, updated_at = now() WHERE id = $2 RETURNING wallet',
              [income, sellerId],
            )
            await client.query(
              `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
               VALUES ($1,'refund_deduction',$2,$3,$4,$5,$6,'completed')`,
              [
                sellerId,
                -income,
                Number(updated.rows[0]?.wallet || 0),
                `${order.number} bekor qilindi`,
                order.id,
                paymentMethod,
              ],
            )
          }
        }
      }

      await client.query(
        "UPDATE payments SET status = 'cancelled' WHERE purpose = 'order' AND reference = $1 AND status = 'pending'",
        [order.id],
      )
      if (order.promo_code) await releasePromo(client, order.promo_code)
    }

    await client.query('UPDATE orders SET status = $1, updated_at = now() WHERE id = $2', [status, order.id])
    if (status === 'completed' && paymentMethod === 'cash') {
      await client.query("UPDATE orders SET payment_status = 'paid' WHERE id = $1", [order.id])
    }
    return { order: toOrder(await getOrderWithBuyer(client, order.id)) }
  })

  return result
}

async function plansRemoved() {
  throw new HttpError(
    410,
    "Obuna tariflari bekor qilindi. AgroServ endi to'liq bepul — oylik va yillik to'lov yo'q.",
    'PLANS_REMOVED',
  )
}

async function topUpWallet(ctx) {
  const body = await readBody(ctx.req)
  const amount = Math.round(Number(body.amount) || 0)
  const method = String(body.method || 'manual')
  if (amount < 10000) throw new HttpError(400, "Minimal to'ldirish 10 000 so'm", 'MIN_TOPUP')
  if (amount > 100000000) throw new HttpError(400, "Maksimal to'ldirish 100 000 000 so'm", 'MAX_TOPUP')
  if (!['manual', 'payme', 'click'].includes(method)) {
    throw new HttpError(400, "Hamyonni bu usulda to'ldirish mumkin emas", 'BAD_METHOD')
  }
  if (['payme', 'click'].includes(method) && !providersConfig()[method]) {
    throw new HttpError(503, 'Bu to\'lov tizimi hozircha sozlanmagan', 'PROVIDER_NOT_CONFIGURED')
  }

  const payment = await withTransaction(async (client) => {
    return createPaymentRow(client, {
      userId: ctx.user.id,
      purpose: 'wallet_topup',
      reference: null,
      amount,
      provider: method,
      meta: {},
    })
  })
  return { amount, payment: publicPayment(payment) }
}

async function promoteProduct(ctx) {
  const body = await readBody(ctx.req)
  const method = String(body.method || 'wallet')
  if (!['wallet', 'manual', 'payme', 'click'].includes(method)) {
    throw new HttpError(400, "To'lov usulini tanlang", 'BAD_METHOD')
  }
  if (['payme', 'click'].includes(method) && !providersConfig()[method]) {
    throw new HttpError(503, 'Bu to\'lov tizimi hozircha sozlanmagan', 'PROVIDER_NOT_CONFIGURED')
  }
  const settings = await loadSettings()
  const baseAmount = Number(settings.featuredPrice)
  const promoCode = clean(body.promoCode, 40).toUpperCase()
  let discount = 0
  if (promoCode) {
    const promotion = await validatePromo(promoCode, 'feature', baseAmount)
    if (!promotion.ok) throw new HttpError(400, promotion.error, 'BAD_PROMO')
    discount = promotion.discount
  }
  const amount = Math.max(0, baseAmount - discount)

  const result = await withTransaction(async (client) => {
    const productResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [ctx.params.id])
    const product = productResult.rows[0]
    if (!product) throw new HttpError(404, 'Mahsulot topilmadi', 'PRODUCT_NOT_FOUND')
    if (product.seller_id !== ctx.user.id && ctx.user.role !== 'admin') {
      throw new HttpError(403, "Bu mahsulot sizga tegishli emas", 'FORBIDDEN')
    }
    if (product.featured && product.featured_until && new Date(product.featured_until).getTime() > Date.now()) {
      throw new HttpError(400, "Mahsulot allaqachon top ro'yxatda", 'ALREADY_FEATURED')
    }

    if (method === 'wallet') {
      const userResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [ctx.user.id])
      const user = userResult.rows[0]
      if (Number(user.wallet) < amount) {
        throw new HttpError(400, "Hamyonda mablag' yetarli emas. Hamyonni to'ldiring.", 'INSUFFICIENT_WALLET')
      }
      const updated = await client.query(
        'UPDATE users SET wallet = wallet - $1, updated_at = now() WHERE id = $2 RETURNING wallet',
        [amount, user.id],
      )
      await client.query(
        `UPDATE products SET featured = true, featured_until = now() + interval '30 days', updated_at = now()
         WHERE id = $1`,
        [product.id],
      )
      const payment = await createPaymentRow(client, {
        userId: user.id,
        purpose: 'feature',
        reference: product.id,
        amount,
        provider: 'wallet',
        meta: { promoCode, baseAmount, discount, productTitle: product.title },
      })
      await client.query("UPDATE payments SET status = 'paid', paid_at = now() WHERE id = $1", [payment.id])
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
         VALUES ($1,'feature',$2,$3,$4,$5,'wallet','completed')`,
        [
          user.id,
          -amount,
          Number(updated.rows[0].wallet),
          `Top mahsulot: ${product.title}`,
          payment.id,
        ],
      )
      if (promoCode) await consumePromo(client, promoCode)
      return { amount, payment: publicPayment({ ...payment, status: 'paid' }) }
    }

    const payment = await createPaymentRow(client, {
      userId: ctx.user.id,
      purpose: 'feature',
      reference: product.id,
      amount,
      provider: method,
      meta: { promoCode, baseAmount, discount, productTitle: product.title },
    })
    if (promoCode) await consumePromo(client, promoCode)
    return { amount, payment: publicPayment(payment) }
  })

  return result
}

async function validatePromoRoute(ctx) {
  const body = await readBody(ctx.req)
  const scope = String(body.scope || 'order')
  if (!['order', 'plan', 'feature'].includes(scope)) throw new HttpError(400, 'Scope noto\'g\'ri', 'BAD_SCOPE')
  const amount = Math.max(0, Math.round(Number(body.amount) || 0))
  const result = await validatePromo(body.code, scope, amount)
  if (!result.ok) throw new HttpError(400, result.error, 'BAD_PROMO')
  return {
    discount: result.discount,
    code: result.promo.code,
    description: result.promo.description || '',
  }
}

async function consumeAi(ctx) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [ctx.user.id])
  const user = rows[0]
  if (!user) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
  const limit = planForRow(user).ai
  if (limit === Infinity) return { remaining: Infinity, limit: 'Infinity' }

  const current = await query('SELECT count FROM ai_usage WHERE user_id = $1 AND day = CURRENT_DATE', [user.id])
  const count = current.rows[0]?.count || 0
  if (count >= limit) {
    throw new HttpError(
      429,
      "Kunlik bepul AI limiti tugadi. Ertaga qayta urinib ko'ring.",
      'AI_LIMIT',
      { limit },
    )
  }

  const updated = await query(
    `INSERT INTO ai_usage (user_id, day, count) VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (user_id, day) DO UPDATE SET count = ai_usage.count + 1
     RETURNING count`,
    [user.id],
  )
  return { remaining: Math.max(0, limit - updated.rows[0].count), limit, used: updated.rows[0].count }
}

async function createProduct(ctx) {
  const body = await readBody(ctx.req)
  if (!['seller', 'admin'].includes(ctx.user.role)) {
    throw new HttpError(403, "Mahsulot joylash uchun sotuvchi bo'ling", 'FORBIDDEN')
  }
  const title = clean(body.title, 150)
  const price = Math.max(0, Math.round(Number(body.price) || 0))
  const stock = Math.max(0, Math.floor(Number(body.stock) || 0))
  if (title.length < 3) throw new HttpError(400, 'Mahsulot nomini kiriting', 'BAD_TITLE')
  if (price <= 0) throw new HttpError(400, "Narxni to'g'ri kiriting", 'BAD_PRICE')

  const { rows } = await query(
    `INSERT INTO products
      (seller_id, title, category, price, unit, stock, description, region, phone, telegram,
       emoji, gradient, image_url, year, condition)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [
      ctx.user.id,
      title,
      clean(body.category, 40) || 'meva',
      price,
      clean(body.unit, 20) || 'dona',
      stock,
      clean(body.description, 3000),
      clean(body.region, 80) || ctx.user.region || 'Toshkent',
      clean(body.phone, 40) || ctx.user.phone || '',
      clean(body.telegram, 100),
      clean(body.emoji, 16) || '🌱',
      clean(body.gradient, 120) || 'from-emerald-300 via-green-400 to-teal-600',
      clean(body.imageUrl, 500) || null,
      body.year ? Number(body.year) : null,
      clean(body.condition, 80),
    ],
  )
  const joined = await query(
    `SELECT p.*, u.name AS seller_name, u.phone AS seller_phone, u.verified AS seller_verified
     FROM products p JOIN users u ON u.id = p.seller_id WHERE p.id = $1`,
    [rows[0].id],
  )
  return { product: toProduct(joined.rows[0]) }
}

async function updateProduct(ctx) {
  const body = await readBody(ctx.req)
  const existing = await query('SELECT * FROM products WHERE id = $1', [ctx.params.id])
  const product = existing.rows[0]
  if (!product) throw new HttpError(404, 'Mahsulot topilmadi', 'PRODUCT_NOT_FOUND')
  if (product.seller_id !== ctx.user.id && ctx.user.role !== 'admin') {
    throw new HttpError(403, "Ruxsat yo'q", 'FORBIDDEN')
  }
  const map = {
    title: ['title', (v) => clean(v, 150)],
    category: ['category', (v) => clean(v, 40)],
    price: ['price', (v) => Math.max(0, Math.round(Number(v) || 0))],
    unit: ['unit', (v) => clean(v, 20)],
    stock: ['stock', (v) => Math.max(0, Math.floor(Number(v) || 0))],
    description: ['description', (v) => clean(v, 3000)],
    region: ['region', (v) => clean(v, 80)],
    phone: ['phone', (v) => clean(v, 40)],
    telegram: ['telegram', (v) => clean(v, 100)],
    emoji: ['emoji', (v) => clean(v, 16)],
    gradient: ['gradient', (v) => clean(v, 120)],
    imageUrl: ['image_url', (v) => clean(v, 500) || null],
    year: ['year', (v) => (v ? Number(v) : null)],
    condition: ['condition', (v) => clean(v, 80)],
    status: ['status', (v) => (PRODUCT_STATUSES.includes(v) ? v : 'active')],
  }
  const sets = []
  const values = []
  for (const [key, [column, transform]] of Object.entries(map)) {
    if (body[key] === undefined) continue
    sets.push(`${column} = $${values.length + 1}`)
    values.push(transform(body[key]))
  }
  if (!sets.length) return { product: toProduct(product) }
  values.push(product.id)
  await query(`UPDATE products SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length}`, values)
  const joined = await query(
    `SELECT p.*, u.name AS seller_name, u.phone AS seller_phone, u.verified AS seller_verified
     FROM products p JOIN users u ON u.id = p.seller_id WHERE p.id = $1`,
    [product.id],
  )
  return { product: toProduct(joined.rows[0]) }
}

async function deleteProduct(ctx) {
  const existing = await query('SELECT * FROM products WHERE id = $1', [ctx.params.id])
  const product = existing.rows[0]
  if (!product) throw new HttpError(404, 'Mahsulot topilmadi', 'PRODUCT_NOT_FOUND')
  if (product.seller_id !== ctx.user.id && ctx.user.role !== 'admin') {
    throw new HttpError(403, "Ruxsat yo'q", 'FORBIDDEN')
  }
  await query('DELETE FROM products WHERE id = $1', [product.id])
  return { deleted: true }
}

async function createService(ctx) {
  const body = await readBody(ctx.req)
  if (!['worker', 'agronomist', 'admin'].includes(ctx.user.role)) {
    throw new HttpError(403, "Xizmat joylash uchun usta yoki agronom bo'ling", 'FORBIDDEN')
  }
  const type = body.type === 'agronomist' ? 'agronomist' : 'worker'
  const price = Math.max(0, Math.round(Number(body.price) || 0))
  if (price <= 0) throw new HttpError(400, 'Narxni kiriting', 'BAD_PRICE')
  const { rows } = await query(
    `INSERT INTO services
      (user_id, type, name, age, experience, service_type, equipment, specialization, education,
       price, unit, region, phone, telegram, description, gradient)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [
      ctx.user.id,
      type,
      clean(body.name, 100) || ctx.user.name,
      body.age ? Number(body.age) : null,
      Math.max(0, Number(body.experience) || 0),
      clean(body.serviceType, 120),
      clean(body.equipment, 200),
      clean(body.specialization, 150) || clean(body.serviceType, 120) || 'Agro xizmatlar',
      clean(body.education, 200),
      price,
      clean(body.unit, 20) || (type === 'worker' ? 'ga' : 'tashrif'),
      clean(body.region, 80) || ctx.user.region || 'Toshkent',
      clean(body.phone, 40) || ctx.user.phone || '',
      clean(body.telegram, 100),
      clean(body.description, 3000),
      clean(body.gradient, 120) ||
        (type === 'worker'
          ? 'from-amber-400 via-orange-500 to-rose-500'
          : 'from-emerald-400 via-green-500 to-teal-600'),
    ],
  )
  return { service: toService(rows[0]) }
}

async function updateService(ctx) {
  const body = await readBody(ctx.req)
  const existing = await query('SELECT * FROM services WHERE id = $1', [ctx.params.id])
  const service = existing.rows[0]
  if (!service) throw new HttpError(404, 'Xizmat topilmadi', 'SERVICE_NOT_FOUND')
  if (service.user_id !== ctx.user.id && ctx.user.role !== 'admin') {
    throw new HttpError(403, "Ruxsat yo'q", 'FORBIDDEN')
  }
  const map = {
    name: ['name', (v) => clean(v, 100)],
    age: ['age', (v) => (v ? Number(v) : null)],
    experience: ['experience', (v) => Math.max(0, Number(v) || 0)],
    serviceType: ['service_type', (v) => clean(v, 120)],
    equipment: ['equipment', (v) => clean(v, 200)],
    specialization: ['specialization', (v) => clean(v, 150)],
    education: ['education', (v) => clean(v, 200)],
    price: ['price', (v) => Math.max(0, Math.round(Number(v) || 0))],
    unit: ['unit', (v) => clean(v, 20)],
    region: ['region', (v) => clean(v, 80)],
    phone: ['phone', (v) => clean(v, 40)],
    telegram: ['telegram', (v) => clean(v, 100)],
    description: ['description', (v) => clean(v, 3000)],
    gradient: ['gradient', (v) => clean(v, 120)],
    status: ['status', (v) => (['active', 'paused', 'hidden', 'blocked'].includes(v) ? v : 'active')],
  }
  const sets = []
  const values = []
  for (const [key, [column, transform]] of Object.entries(map)) {
    if (body[key] === undefined) continue
    sets.push(`${column} = $${values.length + 1}`)
    values.push(transform(body[key]))
  }
  if (!sets.length) return { service: toService(service) }
  values.push(service.id)
  await query(`UPDATE services SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length}`, values)
  const updated = await query('SELECT * FROM services WHERE id = $1', [service.id])
  return { service: toService(updated.rows[0]) }
}

async function deleteService(ctx) {
  const existing = await query('SELECT * FROM services WHERE id = $1', [ctx.params.id])
  const service = existing.rows[0]
  if (!service) throw new HttpError(404, 'Xizmat topilmadi', 'SERVICE_NOT_FOUND')
  if (service.user_id !== ctx.user.id && ctx.user.role !== 'admin') {
    throw new HttpError(403, "Ruxsat yo'q", 'FORBIDDEN')
  }
  await query('DELETE FROM services WHERE id = $1', [service.id])
  return { deleted: true }
}

async function createJob(ctx) {
  const body = await readBody(ctx.req)
  const title = clean(body.title, 150)
  const description = clean(body.description, 4000)
  if (title.length < 3) throw new HttpError(400, 'Lavozim nomini kiriting', 'BAD_TITLE')
  if (!description) throw new HttpError(400, 'Ish tavsifini kiriting', 'BAD_DESCRIPTION')
  const requirements = Array.isArray(body.requirements)
    ? body.requirements.map((line) => clean(line, 200)).filter(Boolean)
    : String(body.requirements || '')
        .split('\n')
        .map((line) => clean(line, 200))
        .filter(Boolean)
  const { rows } = await query(
    `INSERT INTO jobs (user_id, title, company, type, location, salary, description, requirements, contact)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9) RETURNING *`,
    [
      ctx.user.id,
      title,
      clean(body.company, 150) || ctx.user.name,
      clean(body.type, 40) || "To'liq kun",
      clean(body.location, 100) || ctx.user.region || 'Toshkent',
      clean(body.salary, 100) || 'Kelishilgan holda',
      description,
      JSON.stringify(requirements),
      clean(body.contact, 120) || ctx.user.phone || '',
    ],
  )
  return { job: toJob(rows[0]) }
}

async function applyToJob(ctx) {
  const body = await readBody(ctx.req)
  const job = await query('SELECT * FROM jobs WHERE id = $1', [ctx.params.id])
  if (!job.rows[0]) throw new HttpError(404, 'Ish topilmadi', 'JOB_NOT_FOUND')
  const existing = await query('SELECT 1 FROM applications WHERE job_id = $1 AND user_id = $2', [
    ctx.params.id,
    ctx.user.id,
  ])
  if (existing.rowCount > 0) {
    throw new HttpError(400, 'Siz bu ishga allaqachon ariza yuborgansiz', 'ALREADY_APPLIED')
  }
  const { rows } = await query(
    `INSERT INTO applications (job_id, user_id, name, phone, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [
      ctx.params.id,
      ctx.user.id,
      clean(body.name, 100) || ctx.user.name,
      clean(body.phone, 40) || ctx.user.phone || '',
      clean(body.message, 1000),
    ],
  )
  await query('UPDATE jobs SET applicants = applicants + 1 WHERE id = $1', [ctx.params.id])
  return { application: toApplication(rows[0]) }
}

async function createVideo(ctx) {
  const body = await readBody(ctx.req)
  const url = clean(body.url, 500)
  const title = clean(body.title, 200)
  if (title.length < 3) throw new HttpError(400, 'Video nomini kiriting', 'BAD_TITLE')
  if (!url) throw new HttpError(400, 'YouTube havolasini kiriting', 'BAD_URL')
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  const youtubeId = match ? match[1] : ''
  const { rows } = await query(
    `INSERT INTO videos (user_id, title, channel, category, emoji, gradient, youtube_id, url, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      ctx.user.id,
      title,
      clean(body.channel, 100) || ctx.user.name,
      clean(body.category, 60) || 'Agrotexnika',
      clean(body.emoji, 16) || '🎬',
      clean(body.gradient, 120) || 'from-emerald-400 via-green-500 to-teal-600',
      youtubeId,
      url,
      clean(body.description, 2000),
    ],
  )
  return { video: toVideo(rows[0]) }
}

async function deleteVideo(ctx) {
  const existing = await query('SELECT * FROM videos WHERE id = $1', [ctx.params.id])
  const video = existing.rows[0]
  if (!video) throw new HttpError(404, 'Video topilmadi', 'VIDEO_NOT_FOUND')
  if (video.user_id !== ctx.user.id && ctx.user.role !== 'admin') {
    throw new HttpError(403, "Ruxsat yo'q", 'FORBIDDEN')
  }
  await query('DELETE FROM videos WHERE id = $1', [video.id])
  return { deleted: true }
}

async function addReview(ctx) {
  const body = await readBody(ctx.req)
  const targetType = body.targetType === 'service' ? 'service' : 'product'
  const targetId = clean(body.targetId, 60)
  const stars = Math.max(1, Math.min(5, Math.round(Number(body.stars) || 0)))
  const comment = clean(body.comment, 1500)
  if (!targetId) throw new HttpError(400, 'Target topilmadi', 'BAD_TARGET')

  return withTransaction(async (client) => {
    const table = targetType === 'product' ? 'products' : 'services'
    const target = await client.query(`SELECT id FROM ${table} WHERE id = $1`, [targetId])
    if (!target.rows[0]) throw new HttpError(404, 'Element topilmadi', 'NOT_FOUND')
    const { rows } = await client.query(
      `INSERT INTO reviews (user_id, target_type, target_id, stars, comment)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id, target_type, target_id)
       DO UPDATE SET stars = $4, comment = $5, created_at = now()
       RETURNING *`,
      [ctx.user.id, targetType, targetId, stars, comment],
    )
    const stats = await client.query(
      `SELECT coalesce(avg(stars),0)::numeric(3,2) AS rating, count(*)::int AS count
       FROM reviews WHERE target_type = $1 AND target_id = $2`,
      [targetType, targetId],
    )
    await client.query(
      `UPDATE ${table} SET rating = $1, reviews_count = $2, updated_at = now() WHERE id = $3`,
      [stats.rows[0].rating, stats.rows[0].count, targetId],
    )
    return {
      review: toReview({ ...rows[0], user_name: ctx.user.name }),
      rating: Number(stats.rows[0].rating),
      reviewsCount: stats.rows[0].count,
    }
  })
}

async function sendMessage(ctx) {
  const body = await readBody(ctx.req)
  rateLimit(`message:${getIp(ctx.req)}`, 8, 60 * 60 * 1000)
  const name = clean(body.name, 100)
  const email = normalizeEmail(body.email)
  const message = clean(body.message, 3000)
  if (!name || !isEmail(email) || !message) {
    throw new HttpError(400, "Barcha maydonlarni to'ldiring", 'BAD_MESSAGE')
  }
  const { rows } = await query(
    `INSERT INTO messages (user_id, name, email, subject, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [ctx.user?.id || null, name, email, clean(body.subject, 150) || 'Umumiy savol', message],
  )
  return { message: toMessage(rows[0]) }
}

async function markMessageRead(ctx) {
  const { rows } = await query('UPDATE messages SET read = true WHERE id = $1 RETURNING *', [ctx.params.id])
  if (!rows[0]) throw new HttpError(404, 'Xabar topilmadi', 'MESSAGE_NOT_FOUND')
  return { message: toMessage(rows[0]) }
}

async function deleteMessage(ctx) {
  const { rowCount } = await query('DELETE FROM messages WHERE id = $1', [ctx.params.id])
  if (!rowCount) throw new HttpError(404, 'Xabar topilmadi', 'MESSAGE_NOT_FOUND')
  return { deleted: true }
}

async function subscribeNewsletter(ctx) {
  const body = await readBody(ctx.req)
  rateLimit(`newsletter:${getIp(ctx.req)}`, 10, 60 * 60 * 1000)
  const email = normalizeEmail(body.email)
  if (!isEmail(email)) throw new HttpError(400, "Email manzil noto'g'ri", 'BAD_EMAIL')
  const { rowCount } = await query(
    'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
    [email],
  )
  if (!rowCount) throw new HttpError(409, "Siz allaqachon obuna bo'lgansiz", 'ALREADY_SUBSCRIBED')
  return { email }
}

async function addCard(ctx) {
  const body = await readBody(ctx.req)
  const number = String(body.number || '').replace(/\D/g, '')
  const holder = clean(body.holder, 100)
  if (number.length < 16 || !holder) {
    throw new HttpError(400, "Karta raqami va egasini to'liq kiriting", 'BAD_CARD')
  }
  const { rows } = await query(
    'INSERT INTO payment_cards (card_type, number, holder) VALUES ($1,$2,$3) RETURNING *',
    [clean(body.cardType, 40) || 'UzCard', number, holder],
  )
  return { card: toCard(rows[0]) }
}

async function toggleCard(ctx) {
  const { rows } = await query(
    'UPDATE payment_cards SET active = NOT active WHERE id = $1 RETURNING *',
    [ctx.params.id],
  )
  if (!rows[0]) throw new HttpError(404, 'Karta topilmadi', 'CARD_NOT_FOUND')
  return { card: toCard(rows[0]) }
}

async function deleteCard(ctx) {
  const { rowCount } = await query('DELETE FROM payment_cards WHERE id = $1', [ctx.params.id])
  if (!rowCount) throw new HttpError(404, 'Karta topilmadi', 'CARD_NOT_FOUND')
  return { deleted: true }
}

async function updateSettings(ctx) {
  const body = await readBody(ctx.req)
  const allowed = [
    'siteName',
    'supportPhone',
    'supportEmail',
    'telegram',
    'featuredPrice',
    'deliveryFee',
    'freeDeliveryFrom',
    'workingHours',
    'manualPaymentNote',
  ]
  const numeric = new Set(['featuredPrice', 'deliveryFee', 'freeDeliveryFrom'])
  for (const key of allowed) {
    if (body[key] === undefined) continue
    const value = numeric.has(key) ? Math.max(0, Number(body[key]) || 0) : clean(body[key], 500)
    await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb`,
      [key, JSON.stringify(value)],
    )
  }
  return { settings: await loadSettings() }
}

async function adminSetRole(ctx) {
  const body = await readBody(ctx.req)
  const role = String(body.role || '')
  if (!['user', 'seller', 'worker', 'agronomist', 'admin'].includes(role)) {
    throw new HttpError(400, "Noto'g'ri rol", 'BAD_ROLE')
  }
  if (ctx.params.id === ctx.user.id && role !== 'admin') {
    throw new HttpError(400, "O'zingizning admin rolini olib tashlay olmaysiz", 'SELF_ROLE')
  }
  const target = await query('SELECT * FROM users WHERE id = $1', [ctx.params.id])
  if (!target.rows[0]) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
  if (target.rows[0].role === 'admin' && role !== 'admin') {
    const admins = await query("SELECT count(*)::int AS c FROM users WHERE role = 'admin' AND status = 'active'")
    if (admins.rows[0].c <= 1) throw new HttpError(400, "Kamida bitta admin qolishi kerak", 'LAST_ADMIN')
  }
  const { rows } = await query('UPDATE users SET role = $1, updated_at = now() WHERE id = $2 RETURNING *', [
    role,
    ctx.params.id,
  ])
  return { user: toUser(rows[0], { admin: true }) }
}

async function adminToggleUser(ctx) {
  if (ctx.params.id === ctx.user.id) {
    throw new HttpError(400, "O'zingizni bloklay olmaysiz", 'SELF_BLOCK')
  }
  const target = await query('SELECT * FROM users WHERE id = $1', [ctx.params.id])
  if (!target.rows[0]) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
  if (target.rows[0].role === 'admin') {
    throw new HttpError(400, "Admin hisobini bloklash mumkin emas", 'ADMIN_BLOCK')
  }
  const next = target.rows[0].status === 'blocked' ? 'active' : 'blocked'
  const { rows } = await query('UPDATE users SET status = $1, updated_at = now() WHERE id = $2 RETURNING *', [
    next,
    ctx.params.id,
  ])
  return { user: toUser(rows[0], { admin: true }) }
}

async function adminAdjustWallet(ctx) {
  const body = await readBody(ctx.req)
  const amount = Math.round(Number(body.amount) || 0)
  if (!amount) throw new HttpError(400, 'Summani kiriting', 'BAD_AMOUNT')
  return withTransaction(async (client) => {
    const target = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [ctx.params.id])
    if (!target.rows[0]) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
    const next = Math.max(0, Number(target.rows[0].wallet) + amount)
    const updated = await client.query('UPDATE users SET wallet = $1, updated_at = now() WHERE id = $2 RETURNING *', [
      next,
      ctx.params.id,
    ])
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, provider, status)
       VALUES ($1,'admin_adjust',$2,$3,$4,'admin','completed')`,
      [ctx.params.id, amount, next, clean(body.note, 300) || 'Administrator tomonidan hamyon tuzatildi'],
    )
    return { user: toUser(updated.rows[0], { admin: true }) }
  })
}

async function adminSetPassword(ctx) {
  const body = await readBody(ctx.req)
  const password = String(body.password || '')
  if (password && password.length < 8) {
    throw new HttpError(400, "Parol kamida 8 ta belgidan iborat bo'lsin", 'BAD_PASSWORD')
  }
  const target = await query('SELECT id FROM users WHERE id = $1', [ctx.params.id])
  if (!target.rows[0]) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
  const finalPassword = password || `Agro${Math.random().toString(36).slice(2, 8)}!`
  const hash = await hashPassword(finalPassword)
  await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [hash, ctx.params.id])
  await query('DELETE FROM sessions WHERE user_id = $1', [ctx.params.id])
  return { password: finalPassword }
}

async function confirmPayment(ctx) {
  const result = await withTransaction(async (client) => {
    const payment = await applyPaidPayment(client, ctx.params.id, 'admin')
    return { payment: toPayment(payment) }
  })
  return result
}

async function cancelPayment(ctx) {
  const body = await readBody(ctx.req)
  const result = await withTransaction(async (client) => {
    const paymentResult = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [ctx.params.id])
    const payment = paymentResult.rows[0]
    if (!payment) throw new HttpError(404, "To'lov topilmadi", 'PAYMENT_NOT_FOUND')
    if (payment.status === 'paid') {
      throw new HttpError(400, "To'langan to'lovni bekor qilish uchun buyurtmani bekor qiling", 'PAID_PAYMENT')
    }
    if (payment.status === 'cancelled') return { payment: toPayment(payment) }
    await client.query("UPDATE payments SET status = 'cancelled' WHERE id = $1", [payment.id])
    if (payment.purpose === 'order') {
      const order = await client.query('SELECT * FROM orders WHERE id = $1', [payment.reference])
      if (order.rows[0] && order.rows[0].status === 'pending') {
        await client.query(
          `UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1`,
          [payment.reference],
        )
        const items = Array.isArray(order.rows[0].items) ? order.rows[0].items : []
        for (const item of items) {
          if (item.type === 'product') {
            await client.query(
              `UPDATE products SET stock = stock + $1, sales = GREATEST(0, sales - $1), updated_at = now()
               WHERE id = $2`,
              [item.qty, item.refId],
            )
          }
        }
        if (order.rows[0].promo_code) await releasePromo(client, order.rows[0].promo_code)
      }
    }
    if (payment.meta?.promoCode) await releasePromo(client, payment.meta.promoCode)
    const updated = await client.query('SELECT * FROM payments WHERE id = $1', [payment.id])
    return { payment: toPayment(updated.rows[0]), note: clean(body.note, 300) }
  })
  return result
}

async function resolvePasswordReset(ctx) {
  const body = await readBody(ctx.req)
  return withTransaction(async (client) => {
    const reset = await client.query('SELECT * FROM password_resets WHERE id = $1 FOR UPDATE', [ctx.params.id])
    if (!reset.rows[0]) throw new HttpError(404, "So'rov topilmadi", 'RESET_NOT_FOUND')
    if (reset.rows[0].status !== 'pending') throw new HttpError(400, "So'rov allaqachon ko'rib chiqilgan", 'RESET_DONE')
    const user = await client.query('SELECT * FROM users WHERE id = $1', [reset.rows[0].user_id])
    if (!user.rows[0]) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')
    const password = String(body.password || '') || `Agro${Math.random().toString(36).slice(2, 8)}!`
    if (password.length < 8) throw new HttpError(400, 'Parol juda qisqa', 'BAD_PASSWORD')
    const hash = await hashPassword(password)
    await client.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [
      hash,
      user.rows[0].id,
    ])
    await client.query('DELETE FROM sessions WHERE user_id = $1', [user.rows[0].id])
    await client.query(
      "UPDATE password_resets SET status = 'resolved', resolved_at = now() WHERE id = $1",
      [reset.rows[0].id],
    )
    return { password, email: reset.rows[0].email }
  })
}

async function rejectPasswordReset(ctx) {
  const { rows } = await query(
    "UPDATE password_resets SET status = 'rejected', resolved_at = now() WHERE id = $1 AND status = 'pending' RETURNING *",
    [ctx.params.id],
  )
  if (!rows[0]) throw new HttpError(404, "So'rov topilmadi", 'RESET_NOT_FOUND')
  return { rejected: true }
}

/* ---------------- Payment provider webhooks ---------------- */

function paymeError(res, id, code, message) {
  send(res, 200, { jsonrpc: '2.0', id, error: { code, message } })
}

function paymeAuthOk(req) {
  const key = process.env.PAYME_KEY
  if (!key) return false
  const header = String(req.headers.authorization || '')
  if (!header.startsWith('Basic ')) return false
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
    const [, password] = decoded.split(':')
    return password === key
  } catch {
    return false
  }
}

async function paymeWebhook(ctx) {
  const { req, res } = ctx
  const body = await readBody(req)
  const id = body.id ?? null
  if (!paymeAuthOk(req)) {
    paymeError(res, id, -32504, 'Authorization failed')
    return
  }
  const method = body.method
  const params = body.params || {}

  try {
    if (method === 'CheckPerformTransaction') {
      const payment = await query('SELECT * FROM payments WHERE id = $1', [params.account?.payment_id])
      if (!payment.rows[0]) return paymeError(res, id, -31001, 'Payment not found')
      if (Number(payment.rows[0].amount) * 100 !== Number(params.amount)) {
        return paymeError(res, id, -31003, 'Invalid amount')
      }
      return send(res, 200, { jsonrpc: '2.0', id, result: { allow: true } })
    }

    if (method === 'CreateTransaction') {
      const paymentId = params.account?.payment_id
      return withTransaction(async (client) => {
        const payment = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [paymentId])
        if (!payment.rows[0]) return paymeError(res, id, -31001, 'Payment not found')
        if (payment.rows[0].status === 'paid') return paymeError(res, id, -31008, 'Already paid')
        if (Number(payment.rows[0].amount) * 100 !== Number(params.amount)) {
          return paymeError(res, id, -31003, 'Invalid amount')
        }
        if (payment.rows[0].provider_tx_id && payment.rows[0].provider_tx_id !== params.id) {
          return paymeError(res, id, -31008, 'Transaction busy')
        }
        await client.query('UPDATE payments SET provider_tx_id = $1 WHERE id = $2', [params.id, paymentId])
        return send(res, 200, {
          jsonrpc: '2.0',
          id,
          result: {
            create_time: Number(params.time),
            transaction: params.id,
            state: 1,
          },
        })
      })
    }

    if (method === 'PerformTransaction') {
      return withTransaction(async (client) => {
        const payment = await client.query('SELECT * FROM payments WHERE provider_tx_id = $1 FOR UPDATE', [
          params.id,
        ])
        if (!payment.rows[0]) return paymeError(res, id, -31001, 'Transaction not found')
        const paid = await applyPaidPayment(client, payment.rows[0].id, params.id)
        return send(res, 200, {
          jsonrpc: '2.0',
          id,
          result: {
            perform_time: new Date(paid.paid_at || Date.now()).getTime(),
            transaction: params.id,
            state: 2,
          },
        })
      })
    }

    if (method === 'CancelTransaction') {
      return withTransaction(async (client) => {
        const payment = await client.query('SELECT * FROM payments WHERE provider_tx_id = $1 FOR UPDATE', [
          params.id,
        ])
        if (!payment.rows[0]) return paymeError(res, id, -31001, 'Transaction not found')
        if (payment.rows[0].status === 'paid') {
          const order = await client.query('SELECT * FROM orders WHERE id = $1', [payment.rows[0].reference])
          if (order.rows[0] && order.rows[0].status !== 'cancelled') {
            await client.query("UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1", [
              order.rows[0].id,
            ])
          }
        }
        await client.query("UPDATE payments SET status = 'cancelled' WHERE id = $1", [payment.rows[0].id])
        return send(res, 200, {
          jsonrpc: '2.0',
          id,
          result: { cancel_time: Date.now(), transaction: params.id, state: -2 },
        })
      })
    }

    if (method === 'CheckTransaction') {
      const payment = await query('SELECT * FROM payments WHERE provider_tx_id = $1', [params.id])
      if (!payment.rows[0]) return paymeError(res, id, -31001, 'Transaction not found')
      const state = payment.rows[0].status === 'paid' ? 2 : payment.rows[0].status === 'cancelled' ? -2 : 1
      return send(res, 200, {
        jsonrpc: '2.0',
        id,
        result: {
          create_time: new Date(payment.rows[0].created_at).getTime(),
          perform_time: payment.rows[0].paid_at ? new Date(payment.rows[0].paid_at).getTime() : 0,
          cancel_time: 0,
          transaction: params.id,
          state,
          reason: null,
        },
      })
    }

    if (method === 'GetStatement') {
      const { rows } = await query(
        `SELECT * FROM payments WHERE provider = 'payme' AND created_at BETWEEN to_timestamp($1/1000.0) AND to_timestamp($2/1000.0)
         ORDER BY created_at`,
        [params.from || 0, params.to || Date.now()],
      )
      return send(res, 200, {
        jsonrpc: '2.0',
        id,
        result: {
          transactions: rows.map((row) => ({
            id: row.provider_tx_id,
            time: new Date(row.created_at).getTime(),
            amount: Number(row.amount) * 100,
            account: { payment_id: row.id },
            create_time: new Date(row.created_at).getTime(),
            perform_time: row.paid_at ? new Date(row.paid_at).getTime() : 0,
            cancel_time: 0,
            transaction: row.provider_tx_id,
            state: row.status === 'paid' ? 2 : row.status === 'cancelled' ? -2 : 1,
            reason: null,
          })),
        },
      })
    }

    return paymeError(res, id, -32601, 'Method not found')
  } catch (error) {
    console.error('Payme webhook error:', error)
    return paymeError(res, id, -31008, "To'lovni amalga oshirib bo'lmadi")
  }
}

function clickSign({ clickTransId, serviceId, secretKey, merchantTransId, amount, action, signTime }) {
  return createHash('md5')
    .update(`${clickTransId}${serviceId}${secretKey}${merchantTransId}${amount}${action}${signTime}`)
    .digest('hex')
}

async function clickWebhook(ctx, action) {
  const body = await readBody(ctx.req)
  const res = ctx.res
  const serviceId = String(body.service_id || '')
  const secret = process.env.CLICK_SECRET_KEY || ''
  const expected = clickSign({
    clickTransId: body.click_trans_id,
    serviceId,
    secretKey: secret,
    merchantTransId: body.merchant_trans_id,
    amount: body.amount,
    action: body.action,
    signTime: body.sign_time,
  })
  const reply = (error, note, extra = {}) =>
    send(res, 200, { error, error_note: note, ...extra })

  if (!secret) return reply(-1, 'Click sozlanmagan')
  if (!expected || expected !== body.sign_string) return reply(-1, 'Invalid sign')
  if (serviceId !== String(process.env.CLICK_SERVICE_ID)) return reply(-1, 'Invalid service')

  const paymentId = body.merchant_trans_id
  try {
    if (action === 'prepare') {
      const payment = await query('SELECT * FROM payments WHERE id = $1', [paymentId])
      if (!payment.rows[0]) return reply(-5, 'Payment not found')
      if (payment.rows[0].status === 'paid') return reply(-4, 'Already paid')
      if (Number(payment.rows[0].amount) !== Number(body.amount)) return reply(-2, 'Invalid amount')
      return reply(0, 'Success', {
        merchant_trans_id: paymentId,
        click_trans_id: body.click_trans_id,
        merchant_prepare_id: paymentId,
      })
    }

    if (action === 'complete') {
      return withTransaction(async (client) => {
        const payment = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [paymentId])
        if (!payment.rows[0]) return reply(-5, 'Payment not found')
        if (Number(payment.rows[0].amount) !== Number(body.amount)) return reply(-2, 'Invalid amount')
        if (Number(body.error) !== 0) {
          await client.query("UPDATE payments SET status = 'cancelled' WHERE id = $1", [paymentId])
          return reply(-9, 'Cancelled by Click')
        }
        await applyPaidPayment(client, paymentId, body.click_trans_id)
        return reply(0, 'Success', {
          merchant_trans_id: paymentId,
          click_trans_id: body.click_trans_id,
          merchant_confirm_id: paymentId,
        })
      })
    }
    return reply(-3, 'Unknown action')
  } catch (error) {
    console.error('Click webhook error:', error)
    return reply(-9, "To'lovni amalga oshirib bo'lmadi")
  }
}

/* ---------------- Routing ---------------- */

const routes = []

function route(method, path, handler, options = {}) {
  routes.push({
    method,
    segments: path.split('/').filter(Boolean),
    handler,
    ...options,
  })
}

function matchRoute(routeEntry, segments) {
  if (routeEntry.segments.length !== segments.length) return null
  const params = {}
  for (let index = 0; index < segments.length; index += 1) {
    const expected = routeEntry.segments[index]
    if (expected.startsWith(':')) {
      params[expected.slice(1)] = decodeURIComponent(segments[index])
    } else if (expected !== segments[index]) {
      return null
    }
  }
  return params
}

// Public
route('GET', '/health', async () => {
  await query('SELECT 1')
  return { time: new Date().toISOString() }
}, { public: true })
route('GET', '/bootstrap', bootstrap, { public: true })
route('POST', '/newsletter', subscribeNewsletter, { public: true })
route('POST', '/messages', sendMessage, { public: true })
route('POST', '/promo/validate', validatePromoRoute, { public: true })
route('GET', '/payments/providers', async () => ({ providers: providersConfig() }), { public: true })
route('POST', '/payments/payme', paymeWebhook, { public: true, webhook: true })
route('POST', '/payments/click/prepare', (ctx) => clickWebhook(ctx, 'prepare'), {
  public: true,
  webhook: true,
})
route('POST', '/payments/click/complete', (ctx) => clickWebhook(ctx, 'complete'), {
  public: true,
  webhook: true,
})

// Auth
route('POST', '/auth/register', register, { public: true })
route('POST', '/auth/login', login, { public: true })
route('POST', '/auth/google', googleAuth, { public: true })
route('POST', '/auth/logout', async (ctx) => {
  await destroySession(ctx.req, ctx.res)
  return { signedOut: true }
}, { public: true })
route('GET', '/auth/me', async (ctx) => ({ user: ctx.user ? toUser(ctx.user, { self: true }) : null }), {
  public: true,
})
route('POST', '/auth/forgot', forgotPassword, { public: true })
route('POST', '/auth/password-reset/confirm', confirmPasswordReset, { public: true })
route('POST', '/auth/change-password', changePassword)
route('PATCH', '/profile', updateProfile)
route('POST', '/profile/role', setSelfRole)

// User
route('POST', '/cart', addToCart)
route('PATCH', '/cart/:productId', updateCartQty)
route('DELETE', '/cart/:productId', async (ctx) => {
  await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [
    ctx.user.id,
    ctx.params.productId,
  ])
  return { removed: true }
})
route('DELETE', '/cart', async (ctx) => {
  await query('DELETE FROM cart_items WHERE user_id = $1', [ctx.user.id])
  return { cleared: true }
})
route('POST', '/favorites/:productId', toggleFavorite)
route('POST', '/checkout', checkout)
route('PATCH', '/orders/:id/status', updateOrderStatus)
route('POST', '/plans/purchase', plansRemoved)
route('POST', '/wallet/topup', topUpWallet)
route('POST', '/products/:id/promote', promoteProduct)
route('POST', '/ai/consume', consumeAi)
route('POST', '/payments/:id/cancel', async (ctx) => {
  const payment = await query('SELECT * FROM payments WHERE id = $1 AND user_id = $2', [
    ctx.params.id,
    ctx.user.id,
  ])
  if (!payment.rows[0]) throw new HttpError(404, "To'lov topilmadi", 'PAYMENT_NOT_FOUND')
  if (payment.rows[0].status !== 'pending') throw new HttpError(400, "Bu to'lovni bekor qilib bo'lmaydi", 'BAD_STATUS')
  await query("UPDATE payments SET status = 'cancelled' WHERE id = $1", [ctx.params.id])
  if (payment.rows[0].purpose === 'order') {
    await query("UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1 AND status = 'pending'", [
      payment.rows[0].reference,
    ])
  }
  return { cancelled: true }
})

// Catalog
route('POST', '/products', createProduct)
route('PATCH', '/products/:id', updateProduct)
route('DELETE', '/products/:id', deleteProduct)
route('POST', '/services', createService)
route('PATCH', '/services/:id', updateService)
route('DELETE', '/services/:id', deleteService)
route('POST', '/jobs', createJob)
route('POST', '/jobs/:id/apply', applyToJob)
route('POST', '/videos', createVideo)
route('DELETE', '/videos/:id', deleteVideo)
route('POST', '/reviews', addReview)

// Admin
route('PATCH', '/admin/users/:id/role', adminSetRole, { admin: true })
route('PATCH', '/admin/users/:id/status', adminToggleUser, { admin: true })
route('POST', '/admin/users/:id/wallet', adminAdjustWallet, { admin: true })
route('POST', '/admin/users/:id/password', adminSetPassword, { admin: true })
route('POST', '/admin/payments/:id/confirm', confirmPayment, { admin: true })
route('POST', '/admin/payments/:id/cancel', cancelPayment, { admin: true })
route('POST', '/admin/password-resets/:id/resolve', resolvePasswordReset, { admin: true })
route('POST', '/admin/password-resets/:id/reject', rejectPasswordReset, { admin: true })
route('PATCH', '/messages/:id/read', markMessageRead, { admin: true })
route('DELETE', '/messages/:id', deleteMessage, { admin: true })
route('POST', '/cards', addCard, { admin: true })
route('PATCH', '/cards/:id/toggle', toggleCard, { admin: true })
route('DELETE', '/cards/:id', deleteCard, { admin: true })
route('PATCH', '/settings', updateSettings, { admin: true })

export async function handle(req, res) {
  const method = String(req.method || 'GET').toUpperCase()
  const path = getPath(req)
  const segments = path.split('/').filter(Boolean)

  for (const entry of routes) {
    if (entry.method !== method) continue
    const params = matchRoute(entry, segments)
    if (!params) continue

    try {
      if (!entry.webhook && method !== 'GET' && method !== 'HEAD') {
        assertSameOrigin(req)
      }
      let user = null
      if (!entry.webhook) {
        const cookies = parseCookies(req)
        if (cookies.agroserv_session) {
          user = await getAuthUser(req)
          if (user?.status === 'blocked') {
            throw new HttpError(403, 'Hisobingiz bloklangan', 'BLOCKED')
          }
        }
      }
      if (!entry.public && !user) throw new HttpError(401, 'Avval tizimga kiring', 'UNAUTHORIZED')
      if (entry.admin && user?.role !== 'admin') throw new HttpError(403, "Ruxsat yo'q", 'FORBIDDEN')

      const result = await entry.handler({ req, res, user, params })
      if (result !== undefined) ok(res, result)
      return
    } catch (error) {
      handleError(res, error)
      return
    }
  }

  fail(res, 404, 'Endpoint topilmadi', 'NOT_FOUND')
}
