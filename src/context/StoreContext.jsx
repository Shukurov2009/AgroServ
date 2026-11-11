import { createContext, useContext, useEffect, useState } from 'react'
import {
  PLANS,
  SELF_ROLES,
  getCommissionRate,
  getPlan,
  validatePromo,
} from '../lib/constants'
import {
  clamp,
  orderNumber,
  parseYoutubeId,
  simpleHash,
  todayKey,
  uid,
} from '../lib/format'
import { createSeedState } from '../lib/seed'
import { clearState, loadState, saveState } from '../lib/storage'

const StoreContext = createContext(null)

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore StoreProvider ichida ishlatilishi kerak')
  return context
}

function addDaysIso(days) {
  return new Date(Date.now() + days * 86400000).toISOString()
}

function extendPlanDate(user, planId, billing) {
  const current =
    user.plan === planId && user.planExpiresAt && new Date(user.planExpiresAt).getTime() > Date.now()
      ? new Date(user.planExpiresAt)
      : new Date()
  if (billing === 'yearly') current.setFullYear(current.getFullYear() + 1)
  else current.setMonth(current.getMonth() + 1)
  return current.toISOString()
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => loadState() || createSeedState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const currentUser = state.session?.userId
    ? state.users.find((user) => user.id === state.session.userId) || null
    : null

  const plan = getPlan(currentUser)
  const isAdmin = currentUser?.role === 'admin'

  const cartItems = state.cart
    .map((item) => {
      const product = state.products.find((entry) => entry.id === item.productId)
      if (!product) return null
      return { ...product, qty: item.qty }
    })
    .filter(Boolean)

  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0)

  const favoriteIds = currentUser
    ? state.favorites.filter((item) => item.userId === currentUser.id).map((item) => item.productId)
    : []

  const usage = currentUser ? state.aiUsage[currentUser.id] : null
  const usedToday = usage?.date === todayKey() ? usage.count : 0
  const aiRemaining = plan.ai === Infinity ? Infinity : Math.max(0, plan.ai - usedToday)

  function signIn(email, password) {
    const normalized = String(email || '').trim().toLowerCase()
    const user = state.users.find((entry) => entry.email.toLowerCase() === normalized)
    if (!user) return { ok: false, error: "Email yoki parol noto'g'ri" }
    if (user.status === 'blocked') {
      return { ok: false, error: "Hisobingiz bloklangan. Administrator bilan bog'laning." }
    }
    if (user.password !== simpleHash(password)) {
      return { ok: false, error: "Email yoki parol noto'g'ri" }
    }
    setState((prev) => ({
      ...prev,
      session: { userId: user.id, at: new Date().toISOString() },
    }))
    return { ok: true, user }
  }

  function signUp({ name, email, password, phone, region, role = 'user' }) {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const cleanName = String(name || '').trim()
    if (cleanName.length < 2) return { ok: false, error: 'Ismni to\'liq kiriting' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { ok: false, error: 'Email manzil noto\'g\'ri' }
    }
    if (String(password || '').length < 6) {
      return { ok: false, error: 'Parol kamida 6 ta belgidan iborat bo\'lsin' }
    }
    if (state.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }
    }
    if (!SELF_ROLES.includes(role)) {
      return { ok: false, error: 'Rolni to\'g\'ri tanlang' }
    }
    const user = {
      id: uid('u'),
      name: cleanName,
      email: normalizedEmail,
      password: simpleHash(password),
      role,
      phone: String(phone || '').trim(),
      region: region || 'Toshkent',
      plan: 'free',
      planExpiresAt: null,
      wallet: 0,
      status: 'active',
      avatar: '🌱',
      bio: '',
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      users: [...prev.users, user],
      session: { userId: user.id, at: new Date().toISOString() },
    }))
    return { ok: true, user }
  }

  function loginDemo(email) {
    const user = state.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase())
    if (!user) return { ok: false, error: 'Demo foydalanuvchi topilmadi' }
    if (user.status === 'blocked') return { ok: false, error: 'Bu demo hisob bloklangan' }
    setState((prev) => ({
      ...prev,
      session: { userId: user.id, at: new Date().toISOString() },
    }))
    return { ok: true, user }
  }

  function loginWithGoogle() {
    let user = state.users.find((entry) => entry.email === 'google@agroserv.uz')
    if (!user) {
      user = {
        id: uid('u'),
        name: 'Google Foydalanuvchi',
        email: 'google@agroserv.uz',
        password: simpleHash('google123'),
        role: 'user',
        phone: '',
        region: 'Toshkent',
        plan: 'free',
        planExpiresAt: null,
        wallet: 0,
        status: 'active',
        avatar: '👤',
        bio: 'Google orqali kirgan foydalanuvchi.',
        createdAt: new Date().toISOString(),
      }
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.some((entry) => entry.id === user.id)
        ? prev.users
        : [...prev.users, user],
      session: { userId: user.id, at: new Date().toISOString() },
    }))
    return { ok: true, user }
  }

  function signOut() {
    setState((prev) => ({ ...prev, session: null }))
  }

  function updateProfile(patch) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const allowed = ['name', 'phone', 'region', 'bio', 'avatar']
    const clean = {}
    for (const key of allowed) {
      if (patch[key] !== undefined) clean[key] = patch[key]
    }
    if (clean.name !== undefined && String(clean.name).trim().length < 2) {
      return { ok: false, error: 'Ism juda qisqa' }
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === currentUser.id ? { ...user, ...clean } : user,
      ),
    }))
    return { ok: true }
  }

  function changePassword(oldPassword, newPassword) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    if (currentUser.password !== simpleHash(oldPassword)) {
      return { ok: false, error: 'Joriy parol noto\'g\'ri' }
    }
    if (String(newPassword || '').length < 6) {
      return { ok: false, error: 'Yangi parol kamida 6 ta belgi bo\'lsin' }
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === currentUser.id ? { ...user, password: simpleHash(newPassword) } : user,
      ),
    }))
    return { ok: true }
  }

  function resetPassword(email, newPassword) {
    const normalized = String(email || '').trim().toLowerCase()
    const user = state.users.find((entry) => entry.email.toLowerCase() === normalized)
    if (!user) return { ok: false, error: 'Bu email bilan foydalanuvchi topilmadi' }
    if (String(newPassword || '').length < 6) {
      return { ok: false, error: 'Yangi parol kamida 6 ta belgi bo\'lsin' }
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((entry) =>
        entry.id === user.id ? { ...entry, password: simpleHash(newPassword) } : entry,
      ),
    }))
    return { ok: true }
  }

  function setSelfRole(role) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    if (currentUser.role === 'admin') {
      return { ok: false, error: 'Administrator roli faqat admin panel orqali o\'zgartiriladi' }
    }
    if (!SELF_ROLES.includes(role)) return { ok: false, error: 'Bu rolni tanlash mumkin emas' }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === currentUser.id ? { ...user, role } : user,
      ),
    }))
    return { ok: true }
  }

  function adminSetRole(userId, role) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    if (!Object.keys(PLANS) || !['user', 'seller', 'worker', 'agronomist', 'admin'].includes(role)) {
      return { ok: false, error: 'Noto\'g\'ri rol' }
    }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) => (user.id === userId ? { ...user, role } : user)),
    }))
    return { ok: true }
  }

  function adminToggleUser(userId) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    if (currentUser?.id === userId) return { ok: false, error: 'O\'zingizni bloklay olmaysiz' }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'blocked' ? 'active' : 'blocked' }
          : user,
      ),
    }))
    return { ok: true }
  }

  function adminAdjustWallet(userId, amount) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    const value = Math.round(Number(amount) || 0)
    if (!value) return { ok: false, error: 'Summani kiriting' }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === userId ? { ...user, wallet: Math.max(0, (user.wallet || 0) + value) } : user,
      ),
      walletTx: [
        {
          id: uid('w'),
          userId,
          amount: value,
          type: 'admin_adjust',
          description: 'Administrator tomonidan hamyon tuzatildi',
          createdAt: new Date().toISOString(),
        },
        ...prev.walletTx,
      ],
    }))
    return { ok: true }
  }

  function addToCart(productId, qty = 1) {
    const product = state.products.find((entry) => entry.id === productId)
    if (!product) return { ok: false, error: 'Mahsulot topilmadi' }
    if (currentUser && product.sellerId === currentUser.id) {
      return { ok: false, error: 'O\'z mahsulotingizni savatga qo\'sha olmaysiz' }
    }
    if (product.stock <= 0) return { ok: false, error: 'Mahsulot tugagan' }
    setState((prev) => {
      const existing = prev.cart.find((item) => item.productId === productId)
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map((item) =>
            item.productId === productId
              ? { ...item, qty: clamp(item.qty + qty, 1, product.stock) }
              : item,
          ),
        }
      }
      return {
        ...prev,
        cart: [...prev.cart, { productId, qty: clamp(qty, 1, product.stock) }],
      }
    })
    return { ok: true }
  }

  function updateCartQty(productId, qty) {
    const product = state.products.find((entry) => entry.id === productId)
    if (!product) return
    setState((prev) => ({
      ...prev,
      cart: prev.cart
        .map((item) =>
          item.productId === productId
            ? { ...item, qty: clamp(Number(qty) || 1, 1, product.stock) }
            : item,
        )
        .filter((item) => item.qty > 0),
    }))
  }

  function removeFromCart(productId) {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.productId !== productId),
    }))
  }

  function clearCart() {
    setState((prev) => ({ ...prev, cart: [] }))
  }

  function toggleFavorite(productId) {
    if (!currentUser) return { ok: false, error: 'Sevimlilarga qo\'shish uchun tizimga kiring' }
    const exists = state.favorites.some(
      (item) => item.userId === currentUser.id && item.productId === productId,
    )
    setState((prev) => ({
      ...prev,
      favorites: exists
        ? prev.favorites.filter(
            (item) => !(item.userId === currentUser.id && item.productId === productId),
          )
        : [...prev.favorites, { userId: currentUser.id, productId }],
    }))
    return { ok: true, added: !exists }
  }

  function checkout({ items, info, method = 'card', promoCode = '', clearCartAfter = false }) {
    if (!currentUser) return { ok: false, error: 'Buyurtma berish uchun tizimga kiring' }
    if (!Array.isArray(items) || items.length === 0) {
      return { ok: false, error: 'Buyurtma uchun mahsulot tanlanmagan' }
    }
    if (!['card', 'wallet', 'cash'].includes(method)) {
      return { ok: false, error: 'To\'lov usulini tanlang' }
    }

    const built = []
    for (const item of items) {
      if (item.type === 'product') {
        const product = state.products.find((entry) => entry.id === item.refId)
        if (!product || product.status !== 'active') {
          return { ok: false, error: 'Mahsulot topilmadi yoki faol emas' }
        }
        if (currentUser && product.sellerId === currentUser.id) {
          return { ok: false, error: 'O\'z mahsulotingizni sotib olmaysiz' }
        }
        const qty = Number(item.qty) || 1
        if (qty > product.stock) {
          return { ok: false, error: `«${product.title}» uchun omborda ${product.stock} ${product.unit} qoldi` }
        }
        built.push({
          type: 'product',
          refId: product.id,
          title: product.title,
          emoji: product.emoji,
          price: product.price,
          qty,
          unit: product.unit,
          sellerId: product.sellerId,
          sellerName: product.sellerName,
        })
      } else if (item.type === 'service') {
        const service = state.services.find((entry) => entry.id === item.refId)
        if (!service || service.status !== 'active') {
          return { ok: false, error: 'Xizmat topilmadi' }
        }
        if (currentUser && service.userId === currentUser.id) {
          return { ok: false, error: 'O\'z xizmatingizni band qila olmaysiz' }
        }
        const qty = Math.max(1, Number(item.qty) || 1)
        built.push({
          type: 'service',
          refId: service.id,
          title: `${service.specialization || service.serviceType} — ${service.name}`,
          emoji: service.type === 'worker' ? '🔧' : '🌿',
          price: service.price,
          qty,
          unit: service.unit,
          sellerId: service.userId,
          sellerName: service.name,
        })
      } else {
        return { ok: false, error: 'Noto\'g\'ri buyurtma turi' }
      }
    }

    const subtotal = built.reduce((sum, item) => sum + item.price * item.qty, 0)
    const hasProducts = built.some((item) => item.type === 'product')
    let discount = 0
    let appliedPromo = ''
    if (promoCode) {
      const promotion = validatePromo(promoCode, 'order', subtotal)
      if (!promotion.ok) return { ok: false, error: promotion.error }
      discount = promotion.discount
      appliedPromo = promotion.promo.code
    }
    const delivery =
      hasProducts && subtotal < state.settings.freeDeliveryFrom ? state.settings.deliveryFee : 0
    const total = Math.max(0, subtotal - discount + delivery)

    if (method === 'wallet' && (currentUser.wallet || 0) < total) {
      return { ok: false, error: 'Hamyonda mablag\' yetarli emas. Hamyonni to\'ldiring yoki karta orqali to\'lang.' }
    }

    const itemsWithFee = built.map((item) => {
      const seller = state.users.find((user) => user.id === item.sellerId)
      const rate = seller ? getCommissionRate(seller) : state.settings.commissionRate
      return {
        ...item,
        commissionRate: rate,
        fee: Math.round((item.price * item.qty * rate) / 100),
      }
    })
    const platformFee = itemsWithFee.reduce((sum, item) => sum + item.fee, 0)
    const paidNow = method === 'card' || method === 'wallet'

    const users = state.users.map((user) => {
      let next = { ...user }
      if (user.id === currentUser.id && method === 'wallet') {
        next.wallet = (next.wallet || 0) - total
      }
      if (paidNow) {
        const sold = itemsWithFee.filter((item) => item.sellerId === user.id)
        if (sold.length > 0) {
          const income = sold.reduce((sum, item) => sum + item.price * item.qty - item.fee, 0)
          next.wallet = (next.wallet || 0) + income
        }
      }
      return next
    })

    const walletEntries = []
    if (method === 'wallet') {
      walletEntries.push({
        id: uid('w'),
        userId: currentUser.id,
        amount: -total,
        type: 'purchase',
        description: 'Buyurtma to\'lovi',
        createdAt: new Date().toISOString(),
      })
    }
    if (paidNow) {
      const sellerIds = [...new Set(itemsWithFee.map((item) => item.sellerId).filter(Boolean))]
      for (const sellerId of sellerIds) {
        const sold = itemsWithFee.filter((item) => item.sellerId === sellerId)
        const income = sold.reduce((sum, item) => sum + item.price * item.qty - item.fee, 0)
        walletEntries.push({
          id: uid('w'),
          userId: sellerId,
          amount: income,
          type: 'earning',
          description: 'Savdodan tushum',
          createdAt: new Date().toISOString(),
        })
      }
    }

    const products = state.products.map((product) => {
      const sold = itemsWithFee.filter((item) => item.refId === product.id)
      if (sold.length === 0) return product
      const qty = sold.reduce((sum, item) => sum + item.qty, 0)
      return {
        ...product,
        stock: Math.max(0, product.stock - qty),
        sales: (product.sales || 0) + qty,
      }
    })

    const services = state.services.map((service) => {
      const booked = itemsWithFee.filter((item) => item.refId === service.id)
      if (booked.length === 0) return service
      return {
        ...service,
        completedOrders: (service.completedOrders || 0) + 1,
      }
    })

    const order = {
      id: uid('o'),
      number: orderNumber(state.orders.length + 1),
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      items: itemsWithFee,
      subtotal,
      discount,
      delivery,
      total,
      platformFee,
      promoCode: appliedPromo,
      status: paidNow ? 'paid' : 'pending',
      paymentMethod: method,
      info,
      credited: paidNow,
      refunded: false,
      createdAt: new Date().toISOString(),
    }

    const transactions = paidNow
      ? [
          {
            id: uid('t'),
            type: 'commission',
            amount: platformFee,
            userId: currentUser.id,
            description: `${order.number} buyurtmasi bo'yicha komissiya`,
            createdAt: new Date().toISOString(),
          },
          ...state.transactions,
        ]
      : state.transactions

    setState((prev) => ({
      ...prev,
      users,
      products,
      services,
      orders: [order, ...prev.orders],
      walletTx: [...walletEntries, ...prev.walletTx],
      transactions,
      cart: clearCartAfter ? [] : prev.cart,
    }))

    return { ok: true, order }
  }

  function updateOrderStatus(orderId, status) {
    const order = state.orders.find((entry) => entry.id === orderId)
    if (!order) return { ok: false, error: 'Buyurtma topilmadi' }
    let users = state.users
    let walletTx = [...state.walletTx]
    let transactions = [...state.transactions]
    let nextOrder = { ...order, status }

    if (status === 'completed' && !order.credited) {
      const sellerIds = [...new Set(order.items.map((item) => item.sellerId).filter(Boolean))]
      for (const sellerId of sellerIds) {
        const sold = order.items.filter((item) => item.sellerId === sellerId)
        const income = sold.reduce((sum, item) => sum + item.price * item.qty - item.fee, 0)
        users = users.map((user) =>
          user.id === sellerId ? { ...user, wallet: (user.wallet || 0) + income } : user,
        )
        walletTx = [
          {
            id: uid('w'),
            userId: sellerId,
            amount: income,
            type: 'earning',
            description: `${order.number} buyurtmasidan tushum`,
            createdAt: new Date().toISOString(),
          },
          ...walletTx,
        ]
      }
      transactions = [
        {
          id: uid('t'),
          type: 'commission',
          amount: order.platformFee,
          userId: order.buyerId,
          description: `${order.number} buyurtmasi bo'yicha komissiya`,
          createdAt: new Date().toISOString(),
        },
        ...transactions,
      ]
      nextOrder.credited = true
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      if (['paid', 'processing', 'shipped'].includes(order.status) && !order.refunded) {
        users = users.map((user) =>
          user.id === order.buyerId
            ? { ...user, wallet: (user.wallet || 0) + order.total }
            : user,
        )
        walletTx = [
          {
            id: uid('w'),
            userId: order.buyerId,
            amount: order.total,
            type: 'refund',
            description: `${order.number} buyurtmasi qaytarildi`,
            createdAt: new Date().toISOString(),
          },
          ...walletTx,
        ]
        nextOrder.refunded = true
      }
      if (order.credited) {
        const sellerIds = [...new Set(order.items.map((item) => item.sellerId).filter(Boolean))]
        for (const sellerId of sellerIds) {
          const sold = order.items.filter((item) => item.sellerId === sellerId)
          const income = sold.reduce((sum, item) => sum + item.price * item.qty - item.fee, 0)
          users = users.map((user) =>
            user.id === sellerId
              ? { ...user, wallet: Math.max(0, (user.wallet || 0) - income) }
              : user,
          )
          walletTx = [
            {
              id: uid('w'),
              userId: sellerId,
              amount: -income,
              type: 'refund_deduction',
              description: `${order.number} bekor qilindi`,
              createdAt: new Date().toISOString(),
            },
            ...walletTx,
          ]
        }
        transactions = [
          {
            id: uid('t'),
            type: 'commission',
            amount: -order.platformFee,
            userId: order.buyerId,
            description: `${order.number} bekor qilindi — komissiya qaytarildi`,
            createdAt: new Date().toISOString(),
          },
          ...transactions,
        ]
      }
    }

    setState((prev) => ({
      ...prev,
      users,
      walletTx,
      transactions,
      orders: prev.orders.map((entry) => (entry.id === orderId ? nextOrder : entry)),
    }))
    return { ok: true }
  }

  function purchasePlan(planId, billing = 'monthly', method = 'card', promoCode = '') {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const target = PLANS[planId]
    if (!target || target.id === 'free') {
      return { ok: false, error: 'Bu tarifni sotib olish mumkin emas' }
    }
    const base = billing === 'yearly' ? target.yearly : target.monthly
    const promotion = promoCode ? validatePromo(promoCode, 'plan', base) : { ok: false }
    const discount = promotion.ok ? promotion.discount : 0
    const amount = Math.max(0, base - discount)
    if (method === 'wallet' && (currentUser.wallet || 0) < amount) {
      return { ok: false, error: 'Hamyonda mablag\' yetarli emas' }
    }
    const users = state.users.map((user) => {
      if (user.id !== currentUser.id) return user
      return {
        ...user,
        plan: planId,
        planExpiresAt: extendPlanDate(user, planId, billing),
        wallet: method === 'wallet' ? (user.wallet || 0) - amount : user.wallet,
      }
    })
    const walletEntry =
      method === 'wallet'
        ? {
            id: uid('w'),
            userId: currentUser.id,
            amount: -amount,
            type: 'subscription',
            description: `${target.name} tarifi (${billing === 'yearly' ? 'yillik' : 'oylik'})`,
            createdAt: new Date().toISOString(),
          }
        : null
    const transaction = {
      id: uid('t'),
      type: 'subscription',
      amount,
      userId: currentUser.id,
      description: `${target.name} tarifi — ${billing === 'yearly' ? 'yillik' : 'oylik'} obuna`,
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      users,
      transactions: [transaction, ...prev.transactions],
      walletTx: walletEntry ? [walletEntry, ...prev.walletTx] : prev.walletTx,
    }))
    return { ok: true, amount }
  }

  function topUp(amount, method = 'card') {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const value = Math.round(Number(amount) || 0)
    if (value < 10000) return { ok: false, error: 'Minimal to\'ldirish 10 000 so\'m' }
    if (method !== 'card') return { ok: false, error: 'Hamyonni faqat karta orqali to\'ldirish mumkin' }
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === currentUser.id ? { ...user, wallet: (user.wallet || 0) + value } : user,
      ),
      walletTx: [
        {
          id: uid('w'),
          userId: currentUser.id,
          amount: value,
          type: 'topup',
          description: 'Hamyonni to\'ldirish',
          createdAt: new Date().toISOString(),
        },
        ...prev.walletTx,
      ],
    }))
    return { ok: true }
  }

  function promoteProduct(productId, method = 'wallet', promoCode = '') {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const product = state.products.find((entry) => entry.id === productId)
    if (!product) return { ok: false, error: 'Mahsulot topilmadi' }
    if (product.sellerId !== currentUser.id && !isAdmin) {
      return { ok: false, error: 'Bu mahsulot sizga tegishli emas' }
    }
    if (product.featured && product.featuredUntil && new Date(product.featuredUntil) > new Date()) {
      return { ok: false, error: 'Mahsulot allaqachon top ro\'yxatda' }
    }
    const promotion = promoCode ? validatePromo(promoCode, 'feature', state.settings.featuredPrice) : { ok: false }
    const discount = promotion.ok ? promotion.discount : 0
    const amount = Math.max(0, state.settings.featuredPrice - discount)
    if (method === 'wallet' && (currentUser.wallet || 0) < amount) {
      return { ok: false, error: 'Hamyonda mablag\' yetarli emas. Hamyonni to\'ldiring.' }
    }
    setState((prev) => ({
      ...prev,
      products: prev.products.map((entry) =>
        entry.id === productId
          ? { ...entry, featured: true, featuredUntil: addDaysIso(30) }
          : entry,
      ),
      users: prev.users.map((user) =>
        user.id === currentUser.id && method === 'wallet'
          ? { ...user, wallet: (user.wallet || 0) - amount }
          : user,
      ),
      walletTx:
        method === 'wallet'
          ? [
              {
                id: uid('w'),
                userId: currentUser.id,
                amount: -amount,
                type: 'feature',
                description: `Top mahsulot: ${product.title}`,
                createdAt: new Date().toISOString(),
              },
              ...prev.walletTx,
            ]
          : prev.walletTx,
      transactions: [
        {
          id: uid('t'),
          type: 'feature',
          amount,
          userId: currentUser.id,
          description: `Top mahsulot: ${product.title}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.transactions,
      ],
    }))
    return { ok: true, amount }
  }

  function addProduct(data) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    if (!['seller', 'admin'].includes(currentUser.role)) {
      return { ok: false, error: 'Mahsulot joylash uchun sotuvchi bo\'ling' }
    }
    const count = state.products.filter((product) => product.sellerId === currentUser.id).length
    if (currentUser.role !== 'admin' && count >= plan.listings) {
      return {
        ok: false,
        error: `«${plan.name}» tarifida ${plan.listings} tagacha mahsulot joylash mumkin. Tarifni oshiring.`,
      }
    }
    const product = {
      id: uid('p'),
      title: String(data.title || '').trim(),
      category: data.category || 'meva',
      price: Math.max(0, Number(data.price) || 0),
      unit: data.unit || 'dona',
      emoji: data.emoji || '🌱',
      gradient: data.gradient || 'from-emerald-300 via-green-400 to-teal-600',
      description: String(data.description || '').trim(),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerPhone: data.phone || currentUser.phone,
      sellerTelegram: data.telegram || '',
      region: data.region || currentUser.region,
      stock: Math.max(0, Number(data.stock) || 0),
      year: data.year ? Number(data.year) : undefined,
      condition: data.condition || '',
      rating: 0,
      reviewsCount: 0,
      sales: 0,
      featured: false,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    if (product.title.length < 3) return { ok: false, error: 'Mahsulot nomini kiriting' }
    if (product.price <= 0) return { ok: false, error: 'Narxni to\'g\'ri kiriting' }
    setState((prev) => ({ ...prev, products: [product, ...prev.products] }))
    return { ok: true, product }
  }

  function updateProduct(productId, patch) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const product = state.products.find((entry) => entry.id === productId)
    if (!product) return { ok: false, error: 'Mahsulot topilmadi' }
    if (product.sellerId !== currentUser.id && !isAdmin) {
      return { ok: false, error: 'Ruxsat yo\'q' }
    }
    setState((prev) => ({
      ...prev,
      products: prev.products.map((entry) =>
        entry.id === productId ? { ...entry, ...patch } : entry,
      ),
    }))
    return { ok: true }
  }

  function deleteProduct(productId) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const product = state.products.find((entry) => entry.id === productId)
    if (!product) return { ok: false, error: 'Mahsulot topilmadi' }
    if (product.sellerId !== currentUser.id && !isAdmin) {
      return { ok: false, error: 'Ruxsat yo\'q' }
    }
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((entry) => entry.id !== productId),
      cart: prev.cart.filter((item) => item.productId !== productId),
      favorites: prev.favorites.filter((item) => item.productId !== productId),
    }))
    return { ok: true }
  }

  function addService(data) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    if (!['worker', 'agronomist', 'admin'].includes(currentUser.role)) {
      return { ok: false, error: 'Xizmat joylash uchun usta yoki agronom bo\'ling' }
    }
    const count = state.services.filter((service) => service.userId === currentUser.id).length
    if (currentUser.role !== 'admin' && count >= plan.listings) {
      return {
        ok: false,
        error: `«${plan.name}» tarifida ${plan.listings} tagacha xizmat joylash mumkin. Tarifni oshiring.`,
      }
    }
    const type = data.type || (currentUser.role === 'agronomist' ? 'agronomist' : 'worker')
    const service = {
      id: uid('s'),
      type,
      name: data.name || currentUser.name,
      age: Number(data.age) || 30,
      experience: Number(data.experience) || 0,
      serviceType: data.serviceType || '',
      equipment: data.equipment || '',
      specialization: data.specialization || data.serviceType || 'Agro xizmatlar',
      education: data.education || '',
      price: Math.max(0, Number(data.price) || 0),
      unit: data.unit || (type === 'worker' ? 'ga' : 'tashrif'),
      region: data.region || currentUser.region,
      phone: data.phone || currentUser.phone,
      telegram: data.telegram || '',
      rating: 4.5,
      reviewsCount: 0,
      completedOrders: 0,
      verified: false,
      description: String(data.description || '').trim(),
      userId: currentUser.id,
      gradient:
        data.gradient ||
        (type === 'worker'
          ? 'from-amber-400 via-orange-500 to-rose-500'
          : 'from-emerald-400 via-green-500 to-teal-600'),
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    if (service.price <= 0) return { ok: false, error: 'Narxni kiriting' }
    setState((prev) => ({ ...prev, services: [service, ...prev.services] }))
    return { ok: true, service }
  }

  function updateService(serviceId, patch) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const service = state.services.find((entry) => entry.id === serviceId)
    if (!service) return { ok: false, error: 'Xizmat topilmadi' }
    if (service.userId !== currentUser.id && !isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({
      ...prev,
      services: prev.services.map((entry) =>
        entry.id === serviceId ? { ...entry, ...patch } : entry,
      ),
    }))
    return { ok: true }
  }

  function deleteService(serviceId) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const service = state.services.find((entry) => entry.id === serviceId)
    if (!service) return { ok: false, error: 'Xizmat topilmadi' }
    if (service.userId !== currentUser.id && !isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((entry) => entry.id !== serviceId),
    }))
    return { ok: true }
  }

  function addJob(data) {
    if (!currentUser) return { ok: false, error: 'E\'lon joylash uchun tizimga kiring' }
    const job = {
      id: uid('j'),
      title: String(data.title || '').trim(),
      company: data.company || currentUser.name,
      type: data.type || "To'liq kun",
      location: data.location || currentUser.region,
      salary: data.salary || 'Kelishilgan holda',
      description: String(data.description || '').trim(),
      requirements: String(data.requirements || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      contact: data.contact || currentUser.phone,
      applicants: 0,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    }
    if (job.title.length < 3) return { ok: false, error: 'Lavozim nomini kiriting' }
    if (!job.description) return { ok: false, error: 'Ish tavsifini kiriting' }
    setState((prev) => ({ ...prev, jobs: [job, ...prev.jobs] }))
    return { ok: true, job }
  }

  function applyToJob(jobId, application) {
    if (!currentUser) return { ok: false, error: 'Ariza yuborish uchun tizimga kiring' }
    if (state.applications.some((entry) => entry.jobId === jobId && entry.userId === currentUser.id)) {
      return { ok: false, error: 'Siz bu ishga allaqachon ariza yuborgansiz' }
    }
    const entry = {
      id: uid('a'),
      jobId,
      userId: currentUser.id,
      name: application.name || currentUser.name,
      phone: application.phone || currentUser.phone,
      message: application.message || '',
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      applications: [entry, ...prev.applications],
      jobs: prev.jobs.map((job) =>
        job.id === jobId ? { ...job, applicants: (job.applicants || 0) + 1 } : job,
      ),
    }))
    return { ok: true }
  }

  function addVideo(data) {
    if (!currentUser) return { ok: false, error: 'Video qo\'shish uchun tizimga kiring' }
    const url = String(data.url || '').trim()
    const youtubeId = parseYoutubeId(url)
    const video = {
      id: uid('v'),
      title: String(data.title || '').trim(),
      channel: data.channel || currentUser.name,
      category: data.category || 'Agrotexnika',
      views: '0',
      duration: '—',
      emoji: data.emoji || '🎬',
      gradient: data.gradient || 'from-emerald-400 via-green-500 to-teal-600',
      youtubeId,
      url,
      description: String(data.description || '').trim(),
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    }
    if (video.title.length < 3) return { ok: false, error: 'Video nomini kiriting' }
    if (!url) return { ok: false, error: 'YouTube havolasini kiriting' }
    setState((prev) => ({ ...prev, videos: [video, ...prev.videos] }))
    return { ok: true, video }
  }

  function deleteVideo(videoId) {
    if (!currentUser) return { ok: false, error: 'Avval tizimga kiring' }
    const video = state.videos.find((entry) => entry.id === videoId)
    if (!video) return { ok: false, error: 'Video topilmadi' }
    if (video.userId !== currentUser.id && !isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({
      ...prev,
      videos: prev.videos.filter((entry) => entry.id !== videoId),
    }))
    return { ok: true }
  }

  function addReview({ targetType, targetId, stars, comment }) {
    if (!currentUser) return { ok: false, error: 'Sharh yozish uchun tizimga kiring' }
    const value = clamp(Number(stars) || 0, 1, 5)
    if (!value) return { ok: false, error: 'Baho tanlang' }
    const existing = state.reviews.find(
      (review) =>
        review.targetType === targetType &&
        review.targetId === targetId &&
        review.userId === currentUser.id,
    )
    const review = {
      id: existing?.id || uid('r'),
      targetType,
      targetId,
      userId: currentUser.id,
      userName: currentUser.name,
      stars: value,
      comment: String(comment || '').trim(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    }
    const reviews = existing
      ? state.reviews.map((entry) => (entry.id === existing.id ? review : entry))
      : [review, ...state.reviews]
    const targetReviews = reviews.filter(
      (entry) => entry.targetType === targetType && entry.targetId === targetId,
    )
    const average =
      targetReviews.reduce((sum, entry) => sum + entry.stars, 0) / Math.max(1, targetReviews.length)
    const rounded = Math.round(average * 10) / 10

    setState((prev) => ({
      ...prev,
      reviews,
      products:
        targetType === 'product'
          ? prev.products.map((product) =>
              product.id === targetId
                ? { ...product, rating: rounded, reviewsCount: targetReviews.length }
                : product,
            )
          : prev.products,
      services:
        targetType === 'service'
          ? prev.services.map((service) =>
              service.id === targetId
                ? { ...service, rating: rounded, reviewsCount: targetReviews.length }
                : service,
            )
          : prev.services,
    }))
    return { ok: true }
  }

  function sendMessage(data) {
    const message = {
      id: uid('m'),
      name: String(data.name || '').trim(),
      email: String(data.email || '').trim(),
      subject: String(data.subject || 'Umumiy savol').trim(),
      message: String(data.message || '').trim(),
      read: false,
      createdAt: new Date().toISOString(),
    }
    if (!message.name || !message.email || !message.message) {
      return { ok: false, error: 'Barcha maydonlarni to\'ldiring' }
    }
    setState((prev) => ({ ...prev, messages: [message, ...prev.messages] }))
    return { ok: true }
  }

  function markMessageRead(messageId) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((message) =>
        message.id === messageId ? { ...message, read: true } : message,
      ),
    }))
    return { ok: true }
  }

  function deleteMessage(messageId) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((message) => message.id !== messageId),
    }))
    return { ok: true }
  }

  function addCard(data) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    const card = {
      id: uid('c'),
      cardType: data.cardType || 'UzCard',
      number: String(data.number || '').trim(),
      holder: String(data.holder || '').trim(),
      active: true,
      createdAt: new Date().toISOString(),
    }
    if (card.number.replace(/\D/g, '').length < 16 || !card.holder) {
      return { ok: false, error: 'Karta raqami va egasini to\'liq kiriting' }
    }
    setState((prev) => ({ ...prev, cards: [card, ...prev.cards] }))
    return { ok: true }
  }

  function deleteCard(cardId) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({ ...prev, cards: prev.cards.filter((card) => card.id !== cardId) }))
    return { ok: true }
  }

  function toggleCard(cardId) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.id === cardId ? { ...card, active: !card.active } : card,
      ),
    }))
    return { ok: true }
  }

  function updateSettings(patch) {
    if (!isAdmin) return { ok: false, error: 'Ruxsat yo\'q' }
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }))
    return { ok: true }
  }

  function consumeAiMessage() {
    if (!currentUser) return { ok: true, remaining: null }
    const limit = getPlan(currentUser).ai
    if (limit === Infinity) return { ok: true, remaining: Infinity }
    const current = state.aiUsage[currentUser.id]
    const count = current?.date === todayKey() ? current.count : 0
    if (count >= limit) {
      return { ok: false, remaining: 0, limit }
    }
    const nextCount = count + 1
    setState((prev) => ({
      ...prev,
      aiUsage: {
        ...prev.aiUsage,
        [currentUser.id]: { date: todayKey(), count: nextCount },
      },
    }))
    return { ok: true, remaining: limit - nextCount, limit }
  }

  function subscribeNewsletter(email) {
    const normalized = String(email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { ok: false, error: 'Email manzil noto\'g\'ri' }
    }
    if (state.subscribers.includes(normalized)) {
      return { ok: false, error: 'Siz allaqachon obuna bo\'lgansiz' }
    }
    setState((prev) => ({ ...prev, subscribers: [...prev.subscribers, normalized] }))
    return { ok: true }
  }

  function resetDemo() {
    clearState()
    const seed = createSeedState()
    setState(seed)
    return { ok: true }
  }

  const value = {
    state,
    settings: state.settings,
    users: state.users,
    products: state.products,
    services: state.services,
    jobs: state.jobs,
    videos: state.videos,
    orders: state.orders,
    reviews: state.reviews,
    messages: state.messages,
    cards: state.cards,
    transactions: state.transactions,
    walletTx: state.walletTx,
    applications: state.applications,
    subscribers: state.subscribers,
    currentUser,
    plan,
    isAdmin,
    cartItems,
    cartCount,
    cartSubtotal,
    favoriteIds,
    usedToday,
    aiRemaining,
    signIn,
    signUp,
    loginDemo,
    loginWithGoogle,
    signOut,
    updateProfile,
    changePassword,
    resetPassword,
    setSelfRole,
    adminSetRole,
    adminToggleUser,
    adminAdjustWallet,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleFavorite,
    checkout,
    updateOrderStatus,
    purchasePlan,
    topUp,
    promoteProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    addService,
    updateService,
    deleteService,
    addJob,
    applyToJob,
    addVideo,
    deleteVideo,
    addReview,
    sendMessage,
    markMessageRead,
    deleteMessage,
    addCard,
    deleteCard,
    toggleCard,
    updateSettings,
    consumeAiMessage,
    subscribeNewsletter,
    resetDemo,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
