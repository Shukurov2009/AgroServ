import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getPlan } from '../lib/constants'
import { api } from '../lib/api'

const StoreContext = createContext(null)

const DEFAULT_SETTINGS = {
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

const EMPTY_STATE = {
  settings: DEFAULT_SETTINGS,
  products: [],
  services: [],
  jobs: [],
  videos: [],
  reviews: [],
  users: [],
  orders: [],
  transactions: [],
  walletTx: [],
  applications: [],
  messages: [],
  cards: [],
  subscribers: [],
  payments: [],
  promoCodes: [],
  passwordResets: [],
  cart: [],
  favoriteIds: [],
  aiUsage: null,
  stats: { users: 0, orders: 0, grossSales: 0, commission: 0 },
  providers: { manual: true, wallet: true, cash: true, payme: false, click: false },
  integrations: { google: false, email: false },
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore StoreProvider ichida ishlatilishi kerak')
  return context
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE)
  const [currentUser, setCurrentUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [apiError, setApiError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/bootstrap')
      setState({
        settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
        products: data.products || [],
        services: data.services || [],
        jobs: data.jobs || [],
        videos: data.videos || [],
        reviews: data.reviews || [],
        users: data.users || [],
        orders: data.orders || [],
        transactions: data.transactions || [],
        walletTx: data.walletTx || [],
        applications: data.applications || [],
        messages: data.messages || [],
        cards: data.cards || [],
        subscribers: data.subscribers || [],
        payments: data.payments || [],
        promoCodes: data.promoCodes || [],
        passwordResets: data.passwordResets || [],
        cart: data.cart || [],
        favoriteIds: data.favoriteIds || [],
        aiUsage: data.aiUsage || null,
        stats: data.stats || EMPTY_STATE.stats,
        providers: data.providers || EMPTY_STATE.providers,
        integrations: data.integrations || EMPTY_STATE.integrations,
      })
      setCurrentUser(data.currentUser || null)
      setApiError('')
      return data
    } catch (error) {
      setApiError(error.message || "Server bilan aloqa yo'q")
      throw error
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const run = useCallback(
    async (request, { refreshAfter = true } = {}) => {
      try {
        const data = await request()
        if (refreshAfter) await refresh().catch(() => {})
        return { ok: true, ...(data || {}) }
      } catch (error) {
        return {
          ok: false,
          error: error.message || 'Xatolik yuz berdi',
          code: error.code || 'ERROR',
          data: error.data || null,
        }
      }
    },
    [refresh],
  )

  const signIn = useCallback(
    (email, password) => run(() => api.post('/auth/login', { email, password })),
    [run],
  )

  const signUp = useCallback((payload) => run(() => api.post('/auth/register', payload)), [run])

  const loginWithGoogle = useCallback(
    async (credential, role) => {
      try {
        const data = await api.post('/auth/google', { credential, role })
        await refresh().catch(() => {})
        return { ok: true, ...data }
      } catch (error) {
        return {
          ok: false,
          error: error.message || 'Google orqali kirishda xatolik',
          code: error.code || 'ERROR',
          needsRole: Boolean(error.data?.needsRole),
          profile: error.data?.profile || null,
        }
      }
    },
    [refresh],
  )

  const signOut = useCallback(() => run(() => api.post('/auth/logout')), [run])

  const updateProfile = useCallback((patch) => run(() => api.patch('/profile', patch)), [run])

  const changePassword = useCallback(
    (currentPassword, newPassword) =>
      run(() => api.post('/auth/change-password', { currentPassword, newPassword })),
    [run],
  )

  const resetPassword = useCallback(
    (email) => run(() => api.post('/auth/forgot', { email }), { refreshAfter: false }),
    [run],
  )

  const setSelfRole = useCallback((role) => run(() => api.post('/profile/role', { role })), [run])

  const adminSetRole = useCallback(
    (userId, role) => run(() => api.patch(`/admin/users/${userId}/role`, { role })),
    [run],
  )

  const adminToggleUser = useCallback(
    (userId) => run(() => api.patch(`/admin/users/${userId}/status`, {})),
    [run],
  )

  const adminAdjustWallet = useCallback(
    (userId, amount, note = '') =>
      run(() => api.post(`/admin/users/${userId}/wallet`, { amount, note })),
    [run],
  )

  const adminSetPassword = useCallback(
    (userId, password) => run(() => api.post(`/admin/users/${userId}/password`, { password })),
    [run],
  )

  const adminConfirmPayment = useCallback(
    (paymentId) => run(() => api.post(`/admin/payments/${paymentId}/confirm`, {})),
    [run],
  )

  const adminCancelPayment = useCallback(
    (paymentId, note = '') => run(() => api.post(`/admin/payments/${paymentId}/cancel`, { note })),
    [run],
  )

  const adminResolvePasswordReset = useCallback(
    (resetId, password = '') => run(() => api.post(`/admin/password-resets/${resetId}/resolve`, { password })),
    [run],
  )

  const adminRejectPasswordReset = useCallback(
    (resetId) => run(() => api.post(`/admin/password-resets/${resetId}/reject`, {})),
    [run],
  )

  const addToCart = useCallback(
    (productId, qty = 1) => run(() => api.post('/cart', { productId, qty })),
    [run],
  )

  const updateCartQty = useCallback(
    (productId, qty) => run(() => api.patch(`/cart/${productId}`, { qty })),
    [run],
  )

  const removeFromCart = useCallback(
    (productId) => run(() => api.delete(`/cart/${productId}`)),
    [run],
  )

  const clearCart = useCallback(() => run(() => api.delete('/cart')), [run])

  const toggleFavorite = useCallback(
    (productId) => run(() => api.post(`/favorites/${productId}`, {})),
    [run],
  )

  const checkout = useCallback((payload) => run(() => api.post('/checkout', payload)), [run])

  const updateOrderStatus = useCallback(
    (orderId, status) => run(() => api.patch(`/orders/${orderId}/status`, { status })),
    [run],
  )

  const topUp = useCallback(
    (amount, method = 'manual') => run(() => api.post('/wallet/topup', { amount, method })),
    [run],
  )

  const promoteProduct = useCallback(
    (productId, method = 'wallet', promoCode = '') =>
      run(() => api.post(`/products/${productId}/promote`, { method, promoCode })),
    [run],
  )

  const addProduct = useCallback((payload) => run(() => api.post('/products', payload)), [run])
  const updateProduct = useCallback(
    (productId, patch) => run(() => api.patch(`/products/${productId}`, patch)),
    [run],
  )
  const deleteProduct = useCallback((productId) => run(() => api.delete(`/products/${productId}`)), [run])

  const addService = useCallback((payload) => run(() => api.post('/services', payload)), [run])
  const updateService = useCallback(
    (serviceId, patch) => run(() => api.patch(`/services/${serviceId}`, patch)),
    [run],
  )
  const deleteService = useCallback((serviceId) => run(() => api.delete(`/services/${serviceId}`)), [run])

  const addJob = useCallback((payload) => run(() => api.post('/jobs', payload)), [run])
  const applyToJob = useCallback(
    (jobId, payload) => run(() => api.post(`/jobs/${jobId}/apply`, payload)),
    [run],
  )

  const addVideo = useCallback((payload) => run(() => api.post('/videos', payload)), [run])
  const deleteVideo = useCallback((videoId) => run(() => api.delete(`/videos/${videoId}`)), [run])

  const addReview = useCallback((payload) => run(() => api.post('/reviews', payload)), [run])

  const sendMessage = useCallback(
    (payload) => run(() => api.post('/messages', payload), { refreshAfter: false }),
    [run],
  )

  const markMessageRead = useCallback(
    (messageId) => run(() => api.patch(`/messages/${messageId}/read`, {})),
    [run],
  )

  const deleteMessage = useCallback((messageId) => run(() => api.delete(`/messages/${messageId}`)), [run])

  const addCard = useCallback((payload) => run(() => api.post('/cards', payload)), [run])
  const deleteCard = useCallback((cardId) => run(() => api.delete(`/cards/${cardId}`)), [run])
  const toggleCard = useCallback((cardId) => run(() => api.patch(`/cards/${cardId}/toggle`, {})), [run])

  const updateSettings = useCallback((patch) => run(() => api.patch('/settings', patch)), [run])

  const consumeAiMessage = useCallback(async () => {
    try {
      const data = await api.post('/ai/consume', {})
      setState((prev) => ({
        ...prev,
        aiUsage: { date: todayKey(), count: data.used ?? (prev.aiUsage?.count || 0) + 1 },
      }))
      return { ok: true, ...data }
    } catch (error) {
      return {
        ok: false,
        error: error.message || 'AI limiti tugadi',
        code: error.code || 'ERROR',
        data: error.data || null,
      }
    }
  }, [])

  const subscribeNewsletter = useCallback(
    (email) => run(() => api.post('/newsletter', { email }), { refreshAfter: false }),
    [run],
  )

  const validatePromoCode = useCallback(async (code, scope, amount) => {
    try {
      const data = await api.post('/promo/validate', { code, scope, amount })
      return { ok: true, ...data }
    } catch (error) {
      return { ok: false, error: error.message || 'Promo kod xatosi', code: error.code || 'ERROR' }
    }
  }, [])

  const plan = getPlan(currentUser)
  const isAdmin = currentUser?.role === 'admin'

  const cartItems = useMemo(
    () =>
      state.cart
        .map((item) => {
          const product = state.products.find((entry) => entry.id === item.productId)
          if (!product) return null
          return { ...product, qty: item.qty }
        })
        .filter(Boolean),
    [state.cart, state.products],
  )

  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0)
  const favoriteIds = state.favoriteIds
  const usedToday = state.aiUsage?.count || 0
  const aiRemaining = plan.ai === Infinity ? Infinity : Math.max(0, plan.ai - usedToday)

  const value = {
    state,
    ready,
    apiError,
    refresh,
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
    payments: state.payments,
    promoCodes: state.promoCodes,
    passwordResets: state.passwordResets,
    stats: state.stats,
    providers: state.providers,
    integrations: state.integrations,
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
    loginWithGoogle,
    signOut,
    updateProfile,
    changePassword,
    resetPassword,
    setSelfRole,
    adminSetRole,
    adminToggleUser,
    adminAdjustWallet,
    adminSetPassword,
    adminConfirmPayment,
    adminCancelPayment,
    adminResolvePasswordReset,
    adminRejectPasswordReset,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleFavorite,
    checkout,
    updateOrderStatus,
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
    validatePromoCode,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
