import { randomUUID } from 'node:crypto'
import { handle } from '../api/_lib/router.js'
import { query } from '../api/_lib/db.js'

function makeReq({ method = 'GET', path = '/', body, headers = {} }) {
  return {
    method,
    url: path,
    body,
    headers: {
      origin: 'http://localhost:5173',
      host: 'localhost:3000',
      'user-agent': 'agroserv-api-test',
      ...headers,
    },
    socket: { remoteAddress: '127.0.0.1' },
  }
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value
    },
    getHeader(key) {
      return this.headers[key.toLowerCase()]
    },
    end(raw) {
      this.payload = raw ? JSON.parse(raw) : null
    },
  }
}

async function call(method, path, { body, cookie, headers } = {}) {
  const req = makeReq({
    method,
    path,
    body,
    headers: { ...(cookie ? { cookie } : {}), ...(headers || {}) },
  })
  const res = makeRes()
  await handle(req, res)
  const setCookie = res.getHeader('set-cookie')
  const cookieValue = Array.isArray(setCookie)
    ? setCookie.find((value) => value.startsWith('agroserv_session='))
    : setCookie
  return {
    status: res.statusCode,
    data: res.payload,
    cookie: cookieValue ? cookieValue.split(';')[0] : null,
  }
}

function assert(condition, label, detail) {
  if (!condition) {
    console.error(`✗ ${label}`, detail ?? '')
    throw new Error(label)
  }
  console.log(`✓ ${label}`)
}

const suffix = randomUUID().slice(0, 8)
const sellerEmail = `test+seller-${suffix}@example.test`
const buyerEmail = `test+buyer-${suffix}@example.test`
const workerEmail = `test+worker-${suffix}@example.test`
const password = 'TestParol#2026'
const adminPassword = process.env.TEST_ADMIN_PASSWORD
let promoUsesBefore = null

async function cleanup() {
  const emails = [sellerEmail, buyerEmail, workerEmail]
  const users = await query('SELECT id FROM users WHERE email = ANY($1)', [emails])
  const ids = users.rows.map((row) => row.id)
  if (promoUsesBefore !== null) {
    await query('UPDATE promo_codes SET uses = $1 WHERE code = $2', [promoUsesBefore, 'AGRO10'])
  }
  if (!ids.length) return
  await query('DELETE FROM transactions WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM payments WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM orders WHERE buyer_id = ANY($1) OR seller_id = ANY($1)', [ids])
  await query('DELETE FROM products WHERE seller_id = ANY($1)', [ids])
  await query('DELETE FROM services WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM reviews WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM applications WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM cart_items WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM favorites WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM ai_usage WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM password_resets WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM sessions WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM users WHERE id = ANY($1)', [ids])
}

try {
  const promoBefore = await query('SELECT uses FROM promo_codes WHERE code = $1', ['AGRO10'])
  promoUsesBefore = promoBefore.rows[0]?.uses ?? null

  const health = await call('GET', '/api/health')
  assert(health.status === 200 && health.data.ok, 'health endpoint ishlaydi', health)

  const bootstrap = await call('GET', '/api/bootstrap')
  assert(
    bootstrap.status === 200 && Array.isArray(bootstrap.data.products) && bootstrap.data.currentUser === null,
    'public bootstrap ishlaydi',
    bootstrap.data,
  )

  const seller = await call('POST', '/api/auth/register', {
    body: { name: 'Test Sotuvchi', email: sellerEmail, password, role: 'seller', region: 'Toshkent' },
  })
  assert(seller.status === 200 && seller.data.user.role === 'seller', "sotuvchi rolida ro'yxatdan o'tish", seller)
  const sellerCookie = seller.cookie
  assert(Boolean(sellerCookie), 'session cookie berildi')

  const badRole = await call('POST', '/api/auth/register', {
    body: { name: 'Test Admin', email: `test+admin-${suffix}@example.test`, password, role: 'admin' },
  })
  assert(badRole.status === 400, 'admin rolida ommaviy ro‘yxatdan o‘tish taqiqlangan', badRole)

  const product = await call('POST', '/api/products', {
    cookie: sellerCookie,
    body: {
      title: 'Test pomidor',
      category: 'meva',
      price: 50000,
      stock: 10,
      unit: 'kg',
      description: 'Test mahsulot',
      region: 'Toshkent',
    },
  })
  assert(product.status === 200 && product.data.product.title === 'Test pomidor', 'mahsulot yaratish', product)
  const productId = product.data.product.id

  const worker = await call('POST', '/api/auth/register', {
    body: { name: 'Test Agronom', email: workerEmail, password, role: 'agronomist', region: 'Toshkent' },
  })
  assert(worker.status === 200 && worker.data.user.role === 'agronomist', "agronom rolida ro'yxatdan o'tish", worker)
  const workerCookie = worker.cookie

  const service = await call('POST', '/api/services', {
    cookie: workerCookie,
    body: {
      type: 'agronomist',
      serviceType: 'Agronom maslahati',
      specialization: 'Pomidor kasalliklari',
      price: 200000,
      unit: 'tashrif',
      region: 'Toshkent',
      description: 'Test xizmat',
    },
  })
  assert(service.status === 200 && service.data.service.price === 200000, 'xizmat yaratish', service)
  const serviceId = service.data.service.id

  const buyer = await call('POST', '/api/auth/register', {
    body: { name: 'Test Xaridor', email: buyerEmail, password, role: 'user', region: 'Toshkent' },
  })
  assert(buyer.status === 200 && buyer.data.user.role === 'user', "xaridor rolida ro'yxatdan o'tish", buyer)
  const buyerCookie = buyer.cookie

  const wrongPassword = await call('POST', '/api/auth/login', {
    body: { email: buyerEmail, password: 'notogri-parol' },
  })
  assert(wrongPassword.status === 401, "noto'g'ri parol rad etiladi", wrongPassword)

  const shortPassword = await call('POST', '/api/auth/register', {
    body: { name: 'Qisqa Parol', email: `test+short-${suffix}@example.test`, password: '1234567', role: 'user' },
  })
  assert(
    shortPassword.status === 400 && shortPassword.data.code === 'BAD_PASSWORD',
    '8 belgidan qisqa parol rad etiladi',
    shortPassword,
  )

  const google = await call('POST', '/api/auth/google', { body: { credential: 'fake-google-token' } })
  if (process.env.GOOGLE_CLIENT_ID) {
    assert(
      google.status === 401 && google.data.code === 'BAD_GOOGLE_TOKEN',
      "soxta Google token rad etiladi",
      google,
    )
  } else {
    assert(
      google.status === 503 && google.data.code === 'GOOGLE_NOT_CONFIGURED',
      'Google sozlanmaganini aniq qaytaradi',
      google,
    )
  }

  if (adminPassword) {
    const admin = await call('POST', '/api/auth/login', {
      body: { email: 'admin@agroserv.uz', password: adminPassword },
    })
    assert(admin.status === 200 && admin.data.user.role === 'admin', 'admin login ishlaydi', admin)
    const adminCookie = admin.cookie

    const adjust = await call('POST', `/api/admin/users/${buyer.data.user.id}/wallet`, {
      cookie: adminCookie,
      body: { amount: 1000000, note: 'API test' },
    })
    assert(adjust.status === 200 && adjust.data.user.wallet === 1000000, 'admin hamyon to‘ldirdi', adjust)

    const buyerBootstrap = await call('GET', '/api/bootstrap', { cookie: buyerCookie })
    assert(
      buyerBootstrap.status === 200 && buyerBootstrap.data.currentUser.wallet === 1000000,
      'xaridor balansi real DB‘dan',
      buyerBootstrap.data.currentUser,
    )

    const checkout = await call('POST', '/api/checkout', {
      cookie: buyerCookie,
      body: {
        method: 'wallet',
        items: [{ type: 'product', refId: productId, qty: 2 }],
        info: { name: 'Test Xaridor', phone: '+998901112233', address: 'Toshkent, test', note: '' },
        promoCode: 'AGRO10',
        clearCartAfter: true,
      },
    })
    assert(
      checkout.status === 200 && checkout.data.order.total === 110000,
      'checkout wallet ishlaydi',
      checkout,
    )

    const sellerBootstrap = await call('GET', '/api/bootstrap', { cookie: sellerCookie })
    assert(
      sellerBootstrap.status === 200 && sellerBootstrap.data.currentUser.wallet > 0,
      'sotuvchi hamyoniga tushum yozildi',
      sellerBootstrap.data.currentUser,
    )
    const sellerProduct = sellerBootstrap.data.products.find((item) => item.id === productId)
    assert(sellerProduct.stock === 8 && sellerProduct.sales === 2, 'ombor va savdo yangilandi', sellerProduct)

    const adminBootstrap = await call('GET', '/api/bootstrap', { cookie: adminCookie })
    assert(
      adminBootstrap.status === 200 &&
        adminBootstrap.data.users.length >= 3 &&
        adminBootstrap.data.orders.length >= 1 &&
        adminBootstrap.data.payments.length >= 1,
      'admin panel real DB ma’lumotlarini oladi',
      {
        users: adminBootstrap.data.users.length,
        orders: adminBootstrap.data.orders.length,
        payments: adminBootstrap.data.payments.length,
      },
    )

    const plan = await call('POST', '/api/plans/purchase', {
      cookie: sellerCookie,
      body: { planId: 'plus', billing: 'monthly', method: 'wallet' },
    })
    assert(plan.status === 200 && plan.data.plan === 'plus', 'tarif sotib olish ishlaydi', plan)

    const sellerAfterPlan = await call('GET', '/api/bootstrap', { cookie: sellerCookie })
    assert(
      sellerAfterPlan.data.currentUser.plan === 'plus' && sellerAfterPlan.data.currentUser.planExpiresAt,
      'tarif DB‘da saqlandi',
      sellerAfterPlan.data.currentUser,
    )

    const promo = await call('POST', '/api/promo/validate', {
      body: { code: 'AGRO10', scope: 'order', amount: 500000 },
    })
    assert(promo.status === 200 && promo.data.discount === 50000, 'promo kod serverda tekshiriladi', promo)

    const complete = await call('PATCH', `/api/orders/${checkout.data.order.id}/status`, {
      cookie: adminCookie,
      body: { status: 'completed' },
    })
    assert(complete.status === 200 && complete.data.order.status === 'completed', 'buyurtma yakunlash', complete)

    const orderInfo = {
      name: 'Test Xaridor',
      phone: '+998901112233',
      address: 'Toshkent, test',
      note: '',
    }

    const manualOrder = await call('POST', '/api/checkout', {
      cookie: buyerCookie,
      body: {
        method: 'manual',
        items: [{ type: 'product', refId: productId, qty: 1 }],
        info: orderInfo,
      },
    })
    assert(
      manualOrder.status === 200 &&
        manualOrder.data.order.paymentStatus === 'pending' &&
        manualOrder.data.payment?.status === 'pending',
      'manual buyurtma pending yaratildi',
      manualOrder,
    )
    const manualPaymentId = manualOrder.data.payment.id

    const confirmManual = await call('POST', `/api/admin/payments/${manualPaymentId}/confirm`, {
      cookie: adminCookie,
    })
    assert(
      confirmManual.status === 200 && confirmManual.data.payment.status === 'paid',
      'admin manual to‘lovni tasdiqladi',
      confirmManual,
    )

    const afterManual = await call('GET', '/api/bootstrap', { cookie: adminCookie })
    const confirmedOrder = afterManual.data.orders.find((order) => order.id === manualOrder.data.order.id)
    assert(
      confirmedOrder?.status === 'processing' && confirmedOrder?.paymentStatus === 'paid',
      'manual to‘lov buyurtmani faollashtirdi',
      confirmedOrder,
    )
    const stockBeforeCancel = afterManual.data.products.find((item) => item.id === productId).stock

    const cancelOrder = await call('POST', '/api/checkout', {
      cookie: buyerCookie,
      body: {
        method: 'manual',
        items: [{ type: 'product', refId: productId, qty: 1 }],
        info: orderInfo,
      },
    })
    assert(cancelOrder.status === 200 && cancelOrder.data.payment?.id, 'bekor qilish uchun buyurtma yaratildi', cancelOrder)

    const cancelManual = await call('POST', `/api/admin/payments/${cancelOrder.data.payment.id}/cancel`, {
      cookie: adminCookie,
      body: { note: 'API test bekor qilish' },
    })
    assert(
      cancelManual.status === 200 && cancelManual.data.payment.status === 'cancelled',
      'admin manual to‘lovni bekor qildi',
      cancelManual,
    )

    const afterCancel = await call('GET', '/api/bootstrap', { cookie: adminCookie })
    const cancelledOrder = afterCancel.data.orders.find((order) => order.id === cancelOrder.data.order.id)
    const stockAfterCancel = afterCancel.data.products.find((item) => item.id === productId).stock
    assert(
      cancelledOrder?.status === 'cancelled' && stockAfterCancel === stockBeforeCancel,
      'bekor qilinganda ombor qaytarildi',
      { cancelledOrder, stockBeforeCancel, stockAfterCancel },
    )

    const cashOrder = await call('POST', '/api/checkout', {
      cookie: buyerCookie,
      body: {
        method: 'cash',
        items: [{ type: 'product', refId: productId, qty: 1 }],
        info: orderInfo,
      },
    })
    assert(
      cashOrder.status === 200 && cashOrder.data.order.paymentStatus === 'pending' && !cashOrder.data.payment,
      'naqd buyurtma pending yaratildi',
      cashOrder,
    )

    const sellerBeforeCash = await call('GET', '/api/bootstrap', { cookie: sellerCookie })
    const walletBeforeCash = sellerBeforeCash.data.currentUser.wallet
    const completeCash = await call('PATCH', `/api/orders/${cashOrder.data.order.id}/status`, {
      cookie: adminCookie,
      body: { status: 'completed' },
    })
    assert(
      completeCash.status === 200 &&
        completeCash.data.order.status === 'completed' &&
        completeCash.data.order.paymentStatus === 'paid',
      'naqd buyurtma yakunlandi',
      completeCash,
    )

    const sellerAfterCash = await call('GET', '/api/bootstrap', { cookie: sellerCookie })
    assert(
      sellerAfterCash.data.currentUser.wallet === walletBeforeCash - cashOrder.data.order.platformFee,
      'naqd savdoda sotuvchidan komissiya yechildi',
      {
        walletBeforeCash,
        walletAfterCash: sellerAfterCash.data.currentUser.wallet,
        fee: cashOrder.data.order.platformFee,
      },
    )

    const serviceOrder = await call('POST', '/api/checkout', {
      cookie: buyerCookie,
      body: {
        method: 'wallet',
        items: [{ type: 'service', refId: serviceId, qty: 1 }],
        info: orderInfo,
      },
    })
    assert(
      serviceOrder.status === 200 &&
        serviceOrder.data.order.total === 200000 &&
        serviceOrder.data.order.items[0]?.type === 'service',
      'xizmat buyurtmasi wallet orqali ishlaydi',
      serviceOrder,
    )

    const workerBootstrap = await call('GET', '/api/bootstrap', { cookie: workerCookie })
    assert(
      workerBootstrap.data.currentUser.wallet === 200000 - serviceOrder.data.order.platformFee,
      'xizmat sotuvchisiga tushum yozildi',
      workerBootstrap.data.currentUser,
    )
    const serviceAfterOrder = workerBootstrap.data.services.find((item) => item.id === serviceId)
    assert(serviceAfterOrder?.completedOrders >= 1, 'xizmat buyurtmalari hisoblandi', serviceAfterOrder)

    const forgot = await call('POST', '/api/auth/forgot', { body: { email: buyerEmail } })
    assert(forgot.status === 200, 'parol tiklash so‘rovi yaratildi', forgot)

    const resetBootstrap = await call('GET', '/api/bootstrap', { cookie: adminCookie })
    const resetRequest = resetBootstrap.data.passwordResets.find(
      (reset) => reset.email === buyerEmail && reset.status === 'pending',
    )
    assert(Boolean(resetRequest), 'admin parol so‘rovini ko‘radi', resetRequest)

    const resolved = await call('POST', `/api/admin/password-resets/${resetRequest.id}/resolve`, {
      cookie: adminCookie,
      body: { password: 'YangiParol#2026' },
    })
    assert(
      resolved.status === 200 && resolved.data.password === 'YangiParol#2026',
      'admin yangi parol yaratdi',
      resolved,
    )

    const oldSession = await call('GET', '/api/bootstrap', { cookie: buyerCookie })
    assert(oldSession.data.currentUser === null, 'parol tiklanganda eski sessiyalar o‘chirildi', oldSession.data.currentUser)

    const relogin = await call('POST', '/api/auth/login', {
      body: { email: buyerEmail, password: 'YangiParol#2026' },
    })
    assert(relogin.status === 200, 'yangi parol bilan kirish ishlaydi', relogin)
  } else {
    console.log('- TEST_ADMIN_PASSWORD berilmagan, admin oqimi o‘tkazib yuborildi')
  }

  console.log('\nBarcha API testlari muvaffaqiyatli o‘tdi.')
} catch (error) {
  console.error('\nAPI testlari muvaffaqiyatsiz:', error.message)
  process.exitCode = 1
} finally {
  try {
    await cleanup()
  } catch (cleanupError) {
    console.error('Tozalashda xato:', cleanupError.message)
    process.exitCode = 1
  }
  process.exit(process.exitCode || 0)
}
