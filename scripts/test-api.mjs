import { createHash, randomUUID } from 'node:crypto'
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
const deliveryEmail = `test+delivery-${suffix}@example.test`
const password = 'TestParol#2026'
const adminPassword = process.env.TEST_ADMIN_PASSWORD
let promoUsesBefore = null
let adminCookie = null

async function deleteTestUsers(ids) {
  if (!ids.length) return
  await query('DELETE FROM transactions WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM withdrawals WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM payments WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM orders WHERE buyer_id = ANY($1) OR seller_id = ANY($1) OR courier_id = ANY($1)', [ids])
  await query('DELETE FROM courier_batches WHERE courier_id = ANY($1)', [ids])
  await query('DELETE FROM otp_codes WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM products WHERE seller_id = ANY($1)', [ids])
  await query('DELETE FROM services WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM jobs WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM reviews WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM applications WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM cart_items WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM favorites WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM ai_usage WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM password_resets WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM sessions WHERE user_id = ANY($1)', [ids])
  await query('DELETE FROM users WHERE id = ANY($1)', [ids])
}

async function cleanup() {
  const emails = [sellerEmail, buyerEmail, workerEmail, deliveryEmail]
  const users = await query('SELECT id FROM users WHERE email = ANY($1)', [emails])
  if (promoUsesBefore !== null) {
    await query('UPDATE promo_codes SET uses = $1 WHERE code = $2', [promoUsesBefore, 'AGRO10'])
  }
  await deleteTestUsers(users.rows.map((row) => row.id))
}

// Oldingi uzilgan testlardan qolgan hisoblarni tozalaymiz — navbat testi izolyatsiyasi uchun.
async function cleanupStaleTestUsers() {
  const users = await query("SELECT id FROM users WHERE email LIKE 'test+%@example.test'")
  await deleteTestUsers(users.rows.map((row) => row.id))
}

try {
  await cleanupStaleTestUsers()
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
    body: { name: 'Test Sotuvchi', email: sellerEmail, password, role: 'product_seller', region: 'Toshkent' },
  })
  assert(seller.status === 200 && seller.data.user.role === 'product_seller', "sotuvchi rolida ro'yxatdan o'tish", seller)
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
      imageUrl: 'https://example.test/pomidor.jpg',
    },
  })
  assert(product.status === 200 && product.data.product.title === 'Test pomidor', 'mahsulot yaratish', product)
  const productId = product.data.product.id

  const noImageProduct = await call('POST', '/api/products', {
    cookie: sellerCookie,
    body: {
      title: 'Rasmsiz mahsulot',
      category: 'meva',
      price: 10000,
      stock: 1,
      unit: 'kg',
    },
  })
  assert(
    noImageProduct.status === 400 && noImageProduct.data.code === 'BAD_IMAGE',
    'rasmsiz mahsulot rad etiladi',
    noImageProduct,
  )

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
    body: { name: 'Test Xaridor', email: buyerEmail, password, role: 'buyer', region: 'Toshkent' },
  })
  assert(buyer.status === 200 && buyer.data.user.role === 'buyer', "xaridor rolida ro'yxatdan o'tish", buyer)
  const buyerCookie = buyer.cookie

  const delivery = await call('POST', '/api/auth/register', {
    body: { name: 'Test Kuryer', email: deliveryEmail, password, role: 'delivery', region: 'Toshkent' },
  })
  assert(delivery.status === 200 && delivery.data.user.role === 'delivery', "yetkazib beruvchi rolida ro'yxatdan o'tish", delivery)
  const deliveryCookie = delivery.cookie

  const buyerProduct = await call('POST', '/api/products', {
    cookie: buyerCookie,
    body: { title: 'Ruxsatsiz mahsulot', category: 'meva', price: 10000, stock: 1, unit: 'kg' },
  })
  assert(
    buyerProduct.status === 403 && buyerProduct.data.code === 'FORBIDDEN',
    'xaridor mahsulot joylay olmaydi',
    buyerProduct,
  )

  const buyerService = await call('POST', '/api/services', {
    cookie: buyerCookie,
    body: { type: 'worker', serviceType: 'Ruxsatsiz xizmat', price: 10000 },
  })
  assert(
    buyerService.status === 403 && buyerService.data.code === 'FORBIDDEN',
    'xaridor xizmat joylay olmaydi',
    buyerService,
  )

  const wrongPassword = await call('POST', '/api/auth/login', {
    body: { email: buyerEmail, password: 'notogri-parol' },
  })
  assert(wrongPassword.status === 401, "noto'g'ri parol rad etiladi", wrongPassword)

  const shortPassword = await call('POST', '/api/auth/register', {
    body: { name: 'Qisqa Parol', email: `test+short-${suffix}@example.test`, password: '1234567', role: 'buyer' },
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
    adminCookie = admin.cookie

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
    assert(
      checkout.data.order.courierId === delivery.data.user.id,
      'buyurtma avtomatik navbatdagi kuryerga biriktirildi',
      checkout.data.order,
    )

    const courierAssign = await call('PATCH', `/api/admin/orders/${checkout.data.order.id}/courier`, {
      cookie: adminCookie,
      body: { courierId: delivery.data.user.id },
    })
    assert(
      courierAssign.status === 200 && courierAssign.data.order.courierId === delivery.data.user.id,
      'admin buyurtmaga kuryer biriktirdi',
      courierAssign,
    )

    const courierBootstrap = await call('GET', '/api/bootstrap', { cookie: deliveryCookie })
    assert(
      courierBootstrap.status === 200 &&
        courierBootstrap.data.orders.some((order) => order.id === checkout.data.order.id),
      'kuryer biriktirilgan buyurtmani ko‘radi',
      courierBootstrap.data.orders,
    )
    assert(
      courierBootstrap.data.currentUser.deliveryStatus === 'loading' &&
        courierBootstrap.data.courierBatches.some((batch) => batch.status === 'loading'),
      'kuryer yuk yig‘ish holatida va faol partiya bor',
      {
        status: courierBootstrap.data.currentUser.deliveryStatus,
        batches: courierBootstrap.data.courierBatches,
      },
    )

    const markFull = await call('POST', '/api/courier/batch/full', {
      cookie: deliveryCookie,
      body: {},
    })
    assert(
      markFull.status === 200 &&
        markFull.data.batch.status === 'delivering' &&
        markFull.data.batch.orderCount >= 1,
      '«Mashina to‘ldi» partiyani yo‘lga chiqaradi',
      markFull,
    )

    const courierComplete = await call('PATCH', `/api/orders/${checkout.data.order.id}/status`, {
      cookie: deliveryCookie,
      body: { status: 'completed' },
    })
    assert(
      courierComplete.status === 403 && courierComplete.data.code === 'FORBIDDEN',
      'kuryer buyurtmani yakunlay olmaydi',
      courierComplete,
    )

    const markDelivered = await call('POST', '/api/courier/batch/delivered', {
      cookie: deliveryCookie,
      body: {},
    })
    assert(
      markDelivered.status === 200 &&
        markDelivered.data.batch.status === 'delivered' &&
        markDelivered.data.deliveredCount >= 1,
      '«Buyurtmalar topshirildi» partiyani yakunlaydi',
      markDelivered,
    )

    const courierAfterDelivered = await call('GET', '/api/bootstrap', { cookie: deliveryCookie })
    const deliveredOrder = courierAfterDelivered.data.orders.find(
      (order) => order.id === checkout.data.order.id,
    )
    assert(
      ['idle', 'loading'].includes(courierAfterDelivered.data.currentUser.deliveryStatus) &&
        deliveredOrder?.status === 'completed',
      'yetkazgandan keyin kuryer bo‘shaydi va buyurtma yakunlanadi',
      {
        status: courierAfterDelivered.data.currentUser.deliveryStatus,
        order: deliveredOrder,
      },
    )

    const payBatchResult = await call(
      'POST',
      `/api/admin/courier-batches/${markDelivered.data.batch.id}/pay`,
      { cookie: adminCookie, body: {} },
    )
    assert(
      payBatchResult.status === 200 && payBatchResult.data.batch.paid,
      'admin kuryer haqini hamyoniga o‘tkazadi',
      payBatchResult,
    )

    const courierPaid = await call('GET', '/api/bootstrap', { cookie: deliveryCookie })
    assert(
      courierPaid.data.currentUser.wallet === markDelivered.data.batch.payout,
      'kuryer haqi hamyon balansiga qo‘shildi',
      {
        wallet: courierPaid.data.currentUser.wallet,
        payout: markDelivered.data.batch.payout,
      },
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
    assert(
      plan.status === 410 && plan.data.code === 'PLANS_REMOVED',
      'obuna tariflari butunlay olib tashlangan',
      plan,
    )

    const sellerAfterPlan = await call('GET', '/api/bootstrap', { cookie: sellerCookie })
    assert(
      sellerAfterPlan.data.currentUser.plan === 'free' && !sellerAfterPlan.data.currentUser.planExpiresAt,
      'sotuvchi bepul rejimda qoladi',
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
      cashOrder.data.order.platformFee === 2500 &&
        sellerAfterCash.data.currentUser.wallet === walletBeforeCash - cashOrder.data.order.platformFee,
      'naqd savdoda 5% komissiya yechildi',
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
      serviceOrder.data.order.platformFee === 10000 &&
        workerBootstrap.data.currentUser.wallet === 200000 - serviceOrder.data.order.platformFee,
      'xizmat sotuvchisiga tushum yozildi (5% komissiya)',
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

    const badToken = await call('POST', '/api/auth/password-reset/confirm', {
      body: { token: 'not-a-real-reset-token-1234567890', password: 'YangiParol#2026' },
    })
    assert(badToken.status === 400, "noto'g'ri tiklash havolasi rad etiladi", badToken)

    const shortReset = await call('POST', '/api/auth/password-reset/confirm', {
      body: { token: 'not-a-real-reset-token-1234567890', password: '123' },
    })
    assert(shortReset.status === 400, 'qisqa yangi parol rad etiladi', shortReset)

    const resetToken = `test-${randomUUID()}`
    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex')
    const buyerRow = await query('SELECT id FROM users WHERE email = $1', [buyerEmail])
    await query(
      `INSERT INTO password_resets (user_id, email, status, token_hash, expires_at, note)
       VALUES ($1, $2, 'pending', $3, now() + interval '30 minutes', 'test')`,
      [buyerRow.rows[0].id, buyerEmail, resetTokenHash],
    )
    const confirmed = await call('POST', '/api/auth/password-reset/confirm', {
      body: { token: resetToken, password: 'HavolaParol#2026' },
    })
    assert(confirmed.status === 200, 'email havolasi orqali parol yangilanadi', confirmed)

    const reloginHavola = await call('POST', '/api/auth/login', {
      body: { email: buyerEmail, password: 'HavolaParol#2026' },
    })
    assert(reloginHavola.status === 200, 'havola orqali yangilangan parol ishlaydi', reloginHavola)

    const reused = await call('POST', '/api/auth/password-reset/confirm', {
      body: { token: resetToken, password: 'BoshqaParol#2026' },
    })
    assert(reused.status === 400, 'ishlatilgan havola qayta ishlamaydi', reused)
  } else {
    console.log('- TEST_ADMIN_PASSWORD berilmagan, admin oqimi o‘tkazib yuborildi')
  }

  const aiChat = await call('POST', '/api/ai/chat', {
    cookie: sellerCookie,
    body: { message: "Pomidor ko'chatini qanday ekish kerak? Barcha usullarini ayt." },
  })
  if (aiChat.status === 200) {
    assert(
      typeof aiChat.data.reply === 'string' && aiChat.data.reply.length > 0,
      'AI chat javob beradi',
      aiChat,
    )
    assert(Boolean(aiChat.data.source), 'AI javob manbasi qaytadi', aiChat.data.source)
  } else {
    assert(
      aiChat.status === 503 && aiChat.data.code === 'AI_UNAVAILABLE',
      'AI ishlamaganda aniq xato qaytadi',
      aiChat,
    )
    assert(
      String(aiChat.data.error || '').includes('adminga'),
      "AI xatosida foydalanuvchi adminga yo'naltiriladi",
      aiChat.data.error,
    )
    assert(
      !String(aiChat.data.error || '').includes('Gemini API kalitini'),
      "AI xatosida sozlash yo'riqnomasi ko'rsatilmaydi",
      aiChat.data.error,
    )
  }

  const aiBadImage = await call('POST', '/api/ai/chat', {
    cookie: sellerCookie,
    body: { message: 'Rasmni tahlil qil', imageDataUrl: 'data:text/plain;base64,AAAA' },
  })
  assert(aiBadImage.status === 400, "AI noto'g'ri rasm formatini rad etadi", aiBadImage)

  const aiOffTopic = await call('POST', '/api/ai/chat', {
    cookie: sellerCookie,
    body: { message: 'Python dasturlashni qanday o‘rganaman?' },
  })
  assert(
    aiOffTopic.status === 200 && aiOffTopic.data.offTopic === true,
    "AI agro bo'lmagan savolni rad etadi",
    aiOffTopic,
  )

  const cardOtp = await call('POST', '/api/otp/send', {
    cookie: sellerCookie,
    body: { purpose: 'card_link', phone: '+998901234567' },
  })
  assert(
    cardOtp.status === 200 && Boolean(cardOtp.data.otpId) && Boolean(cardOtp.data.testCode),
    'karta ulash uchun SMS kod (test rejimi) beriladi',
    cardOtp,
  )

  const badCardOtp = await call('POST', '/api/profile/card', {
    cookie: sellerCookie,
    body: {
      cardNumber: '8600123456789012',
      cardHolder: 'Test Sotuvchi',
      phone: '+998901234567',
      otpId: cardOtp.data.otpId,
      code: '000000',
    },
  })
  assert(
    badCardOtp.status === 400 && badCardOtp.data.code === 'OTP_INVALID',
    "noto'g'ri SMS kod bilan karta ulanmaydi",
    badCardOtp,
  )

  const linkCard = await call('POST', '/api/profile/card', {
    cookie: sellerCookie,
    body: {
      cardNumber: '8600123456789012',
      cardHolder: 'Test Sotuvchi',
      phone: '+998901234567',
      otpId: cardOtp.data.otpId,
      code: cardOtp.data.testCode,
    },
  })
  assert(
    linkCard.status === 200 && linkCard.data.user.hasCard,
    'karta SMS kod bilan ulanadi',
    linkCard,
  )

  const cardWithoutOtp = await call('POST', '/api/profile/card', {
    cookie: sellerCookie,
    body: { cardNumber: '8600123456789999', cardHolder: 'Test Sotuvchi', phone: '+998901234567' },
  })
  assert(
    cardWithoutOtp.status === 400 && cardWithoutOtp.data.code === 'OTP_REQUIRED',
    "OTP siz kartani o'zgartirib bo'lmaydi",
    cardWithoutOtp,
  )

  const sellerWalletBefore = await call('GET', '/api/bootstrap', { cookie: sellerCookie })
  const walletBefore = sellerWalletBefore.data.currentUser.wallet
  assert(walletBefore > 1000, 'sotuvchida yechish uchun balans bor', walletBefore)

  const withdrawOtp = await call('POST', '/api/otp/send', {
    cookie: sellerCookie,
    body: { purpose: 'withdrawal' },
  })
  assert(
    withdrawOtp.status === 200 && Boolean(withdrawOtp.data.testCode),
    'pul yechish uchun kartaga ulangan raqamga kod yuboriladi',
    withdrawOtp,
  )

  const withdrawNoOtp = await call('POST', '/api/withdrawals', {
    cookie: sellerCookie,
    body: { amount: 1 },
  })
  assert(
    withdrawNoOtp.status === 400 && withdrawNoOtp.data.code === 'OTP_REQUIRED',
    "OTP siz pul yechib bo'lmaydi",
    withdrawNoOtp,
  )

  const withdrawOne = await call('POST', '/api/withdrawals', {
    cookie: sellerCookie,
    body: { amount: 1000, otpId: withdrawOtp.data.otpId, code: withdrawOtp.data.testCode },
  })
  assert(
    withdrawOne.status === 200 &&
      withdrawOne.data.withdrawal.status === 'approved' &&
      withdrawOne.data.withdrawal.autoApproved,
    "pul yechish admin tasdig'isiz avtomatik tasdiqlanadi",
    withdrawOne,
  )
  assert(
    withdrawOne.data.withdrawal.commission === 50 &&
      withdrawOne.data.withdrawal.netAmount === 950,
    '5% komissiya va net summa to‘g‘ri hisoblanadi',
    withdrawOne.data.withdrawal,
  )
  assert(
    withdrawOne.data.wallet === walletBefore - 1000,
    'yechish summasi hamyondan ushlanadi',
    withdrawOne,
  )

  const commissionTx = await query(
    "SELECT * FROM transactions WHERE type = 'withdrawal_commission' AND reference = $1",
    [withdrawOne.data.withdrawal.id],
  )
  assert(
    commissionTx.rows.length === 1 && Number(commissionTx.rows[0].amount) === 50,
    "5% komissiya admin hamyoniga tranzaksiya bo'lib yoziladi",
    commissionTx.rows,
  )

  const tooBig = await call('POST', '/api/withdrawals', {
    cookie: sellerCookie,
    body: { amount: 100000001 },
  })
  assert(
    tooBig.status === 400 && tooBig.data.code === 'WITHDRAWAL_LIMIT',
    "100 mln dan ortiq summa bitta so'rovda rad etiladi",
    tooBig,
  )

  const oldApprove = await call(
    'POST',
    `/api/admin/withdrawals/${withdrawOne.data.withdrawal.id}/approve`,
    { cookie: adminCookie || '', body: {} },
  )
  assert(
    [401, 403, 404].includes(oldApprove.status),
    'eski admin tasdiqlash endpointi olib tashlangan',
    oldApprove,
  )

  // Har bir rol o'z e'lonini qaytarib olishi yoki butunlay o'chirishi mumkin.
  const listingProduct = await call('POST', '/api/products', {
    cookie: sellerCookie,
    body: {
      title: 'Qaytarib olinadigan mahsulot',
      category: 'meva',
      price: 12000,
      stock: 3,
      unit: 'kg',
      region: 'Toshkent',
      imageUrl: 'https://example.test/listing.jpg',
    },
  })
  assert(listingProduct.status === 200, "mahsulot e'loni yaratildi", listingProduct)
  const listingProductId = listingProduct.data.product.id

  const pausedProduct = await call('PATCH', `/api/products/${listingProductId}`, {
    cookie: sellerCookie,
    body: { status: 'paused' },
  })
  assert(
    pausedProduct.status === 200 && pausedProduct.data.product.status === 'paused',
    "mahsulot e'loni qaytarib olindi",
    pausedProduct,
  )

  const publicAfterProductPause = await call('GET', '/api/bootstrap')
  assert(
    !publicAfterProductPause.data.products.some((item) => item.id === listingProductId),
    "qaytarib olingan mahsulot ommaviy bozorda ko'rinmaydi",
    publicAfterProductPause.data.products,
  )

  const ownerAfterProductPause = await call('GET', '/api/bootstrap', { cookie: sellerCookie })
  assert(
    ownerAfterProductPause.data.products.some((item) => item.id === listingProductId),
    "mahsulot egasi qaytarib olingan e'lonni ko'radi",
    ownerAfterProductPause.data.products,
  )

  const foreignProductPause = await call('PATCH', `/api/products/${listingProductId}`, {
    cookie: workerCookie,
    body: { status: 'active' },
  })
  assert(
    foreignProductPause.status === 403,
    "boshqa foydalanuvchi mahsulot e'lonini o'zgartira olmaydi",
    foreignProductPause,
  )

  const deletedProduct = await call('DELETE', `/api/products/${listingProductId}`, {
    cookie: sellerCookie,
  })
  assert(
    deletedProduct.status === 200 && deletedProduct.data.deleted,
    "mahsulot e'loni butunlay o'chirildi",
    deletedProduct,
  )

  const listingService = await call('POST', '/api/services', {
    cookie: workerCookie,
    body: {
      type: 'agronomist',
      serviceType: 'Qaytarib olinadigan xizmat',
      price: 50000,
      unit: 'tashrif',
      region: 'Toshkent',
    },
  })
  assert(listingService.status === 200, "xizmat e'loni yaratildi", listingService)
  const listingServiceId = listingService.data.service.id

  const pausedService = await call('PATCH', `/api/services/${listingServiceId}`, {
    cookie: workerCookie,
    body: { status: 'paused' },
  })
  assert(
    pausedService.status === 200 && pausedService.data.service.status === 'paused',
    "xizmat e'loni qaytarib olindi",
    pausedService,
  )

  const publicAfterServicePause = await call('GET', '/api/bootstrap')
  assert(
    !publicAfterServicePause.data.services.some((item) => item.id === listingServiceId),
    "qaytarib olingan xizmat ommaviy ro'yxatda ko'rinmaydi",
    publicAfterServicePause.data.services,
  )

  const deletedService = await call('DELETE', `/api/services/${listingServiceId}`, {
    cookie: workerCookie,
  })
  assert(
    deletedService.status === 200 && deletedService.data.deleted,
    "xizmat e'loni butunlay o'chirildi",
    deletedService,
  )

  const listingJob = await call('POST', '/api/jobs', {
    cookie: workerCookie,
    body: {
      title: 'Qaytarib olinadigan ish',
      company: 'Test ferma',
      type: "To'liq kun",
      location: 'Toshkent',
      salary: '5 000 000',
      description: 'Test ish tavsifi',
      requirements: 'Tajriba',
      contact: '+998901112233',
    },
  })
  assert(listingJob.status === 200, "ish e'loni yaratildi", listingJob)
  const listingJobId = listingJob.data.job.id

  const pausedJob = await call('PATCH', `/api/jobs/${listingJobId}`, {
    cookie: workerCookie,
    body: { status: 'paused' },
  })
  assert(
    pausedJob.status === 200 && pausedJob.data.job.status === 'paused',
    "ish e'loni qaytarib olindi",
    pausedJob,
  )

  const publicAfterJobPause = await call('GET', '/api/bootstrap')
  assert(
    !publicAfterJobPause.data.jobs.some((item) => item.id === listingJobId),
    "qaytarib olingan ish e'loni ommaviy ro'yxatda ko'rinmaydi",
    publicAfterJobPause.data.jobs,
  )

  const ownerAfterJobPause = await call('GET', '/api/bootstrap', { cookie: workerCookie })
  assert(
    ownerAfterJobPause.data.jobs.some((item) => item.id === listingJobId),
    "ish e'loni egasi qaytarib olingan e'lonni ko'radi",
    ownerAfterJobPause.data.jobs,
  )

  const applyPausedJob = await call('POST', `/api/jobs/${listingJobId}/apply`, {
    cookie: sellerCookie,
    body: { name: 'Test Sotuvchi', phone: '+998901112233', message: 'test' },
  })
  assert(
    applyPausedJob.status === 400 && applyPausedJob.data.code === 'JOB_INACTIVE',
    "qaytarib olingan ish e'loniga ariza yuborilmaydi",
    applyPausedJob,
  )

  const foreignJobDelete = await call('DELETE', `/api/jobs/${listingJobId}`, {
    cookie: sellerCookie,
  })
  assert(
    foreignJobDelete.status === 403,
    "boshqa foydalanuvchi ish e'lonini o'chira olmaydi",
    foreignJobDelete,
  )

  const deletedJob = await call('DELETE', `/api/jobs/${listingJobId}`, {
    cookie: workerCookie,
  })
  assert(
    deletedJob.status === 200 && deletedJob.data.deleted,
    "ish e'loni butunlay o'chirildi",
    deletedJob,
  )

  const ownerAfterJobDelete = await call('GET', '/api/bootstrap', { cookie: workerCookie })
  assert(
    !ownerAfterJobDelete.data.jobs.some((item) => item.id === listingJobId),
    "o'chirilgan ish e'loni bazadan yo'qoldi",
    ownerAfterJobDelete.data.jobs,
  )

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
