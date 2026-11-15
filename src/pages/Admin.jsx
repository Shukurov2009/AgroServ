import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Crown,
  KeyRound,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Receipt,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import {
  CATEGORIES,
  ORDER_STATUS,
  ROLES,
} from '../lib/constants'
import {
  formatCompact,
  formatDate,
  formatDateTime,
  formatNumber,
  formatSom,
  maskCard,
} from '../lib/format'
import PageHero from '../components/PageHero'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { StatusBadge } from '../components/Badges'

const TABS = [
  { id: 'overview', label: 'Umumiy', icon: LayoutDashboard },
  { id: 'users', label: 'Foydalanuvchilar', icon: Users },
  { id: 'products', label: 'Mahsulotlar', icon: Package },
  { id: 'orders', label: 'Buyurtmalar', icon: ShoppingBag },
  { id: 'payments', label: "To'lovlar", icon: Receipt },
  { id: 'messages', label: 'Xabarlar', icon: MessageSquare },
  { id: 'cards', label: 'Kartalar', icon: CreditCard },
  { id: 'resets', label: 'Parol so‘rovlari', icon: KeyRound },
  { id: 'settings', label: 'Sozlamalar', icon: SettingsIcon },
]

const PAYMENT_LABELS = {
  card: 'Karta',
  wallet: 'Hamyon',
  cash: 'Naqd',
  manual: "Bank o'tkazmasi",
  payme: 'Payme',
  click: 'Click',
}

const PURPOSE_LABELS = {
  order: 'Buyurtma',
  plan: 'Eski tarif',
  wallet_topup: "Hamyon to'ldirish",
  feature: 'Top mahsulot',
}

const PAYMENT_STATUS = {
  pending: { label: 'Kutilmoqda', className: 'bg-amber-50 text-amber-700' },
  paid: { label: "To'langan", className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Bekor qilingan', className: 'bg-rose-50 text-rose-600' },
  failed: { label: 'Xato', className: 'bg-rose-50 text-rose-600' },
}

const ROLE_OPTIONS = ['user', 'seller', 'worker', 'agronomist', 'admin']
const GOOGLE_CLIENT_READY = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default function Admin() {
  const {
    currentUser,
    users,
    products,
    services,
    orders,
    messages,
    cards,
    transactions,
    settings,
    payments,
    promoCodes,
    passwordResets,
    providers,
    integrations,
    adminSetRole,
    adminToggleUser,
    adminAdjustWallet,
    adminConfirmPayment,
    adminCancelPayment,
    adminResolvePasswordReset,
    adminRejectPasswordReset,
    updateOrderStatus,
    markMessageRead,
    deleteMessage,
    addCard,
    deleteCard,
    toggleCard,
    updateSettings,
    updateProduct,
    deleteProduct,
  } = useStore()

  const [tab, setTab] = useState('overview')
  const [userQuery, setUserQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [productQuery, setProductQuery] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [walletUser, setWalletUser] = useState(null)
  const [walletAmount, setWalletAmount] = useState('50000')
  const [cardOpen, setCardOpen] = useState(false)
  const [cardForm, setCardForm] = useState({ cardType: 'UzCard', number: '', holder: 'AgroServ MChJ' })
  const [settingsForm, setSettingsForm] = useState({ ...settings })
  const [resetResult, setResetResult] = useState(null)

  const unread = messages.filter((message) => !message.read).length
  const pendingPayments = payments.filter((payment) => payment.status === 'pending')
  const pendingResets = passwordResets.filter((reset) => reset.status === 'pending')

  const stats = useMemo(() => {
    const grossSales = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0)
    const commission = transactions
      .filter((entry) => entry.type === 'commission')
      .reduce((sum, entry) => sum + entry.amount, 0)
    const feature = transactions
      .filter((entry) => entry.type === 'feature')
      .reduce((sum, entry) => sum + entry.amount, 0)
    return {
      grossSales,
      commission,
      feature,
      revenue: commission + feature,
      activeUsers: users.filter((user) => user.status === 'active').length,
      blockedUsers: users.filter((user) => user.status === 'blocked').length,
      sellers: users.filter((user) => user.role === 'seller').length,
      providers: users.filter((user) => ['worker', 'agronomist'].includes(user.role)).length,
      activeProducts: products.filter((product) => product.status === 'active').length,
      activeServices: services.filter((service) => service.status === 'active').length,
      pendingOrders: orders.filter((order) => order.status === 'pending').length,
      completedOrders: orders.filter((order) => order.status === 'completed').length,
    }
  }, [orders, transactions, users, products, services])

  const roleCounts = useMemo(
    () =>
      ROLE_OPTIONS.map((role) => ({
        role,
        count: users.filter((user) => user.role === role).length,
      })),
    [users],
  )

  const topSellers = useMemo(() => {
    const totals = new Map()
    for (const order of orders) {
      if (order.status === 'cancelled') continue
      for (const item of order.items) {
        if (!item.sellerId) continue
        totals.set(item.sellerId, (totals.get(item.sellerId) || 0) + item.price * item.qty)
      }
    }
    return users
      .filter((user) => totals.has(user.id))
      .map((user) => ({ ...user, total: totals.get(user.id) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
  }, [orders, users])

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [orders],
  )

  const filteredUsers = useMemo(() => {
    let list = users
    if (roleFilter !== 'all') list = list.filter((user) => user.role === roleFilter)
    if (userQuery.trim()) {
      const search = userQuery.toLowerCase()
      list = list.filter((user) =>
        `${user.name} ${user.email} ${user.region}`.toLowerCase().includes(search),
      )
    }
    return list
  }, [users, roleFilter, userQuery])

  const filteredProducts = useMemo(() => {
    if (!productQuery.trim()) return products
    const search = productQuery.toLowerCase()
    return products.filter((product) =>
      `${product.title} ${product.sellerName} ${product.region}`.toLowerCase().includes(search),
    )
  }, [products, productQuery])

  const filteredOrders = useMemo(
    () => (orderFilter === 'all' ? orders : orders.filter((order) => order.status === orderFilter)),
    [orders, orderFilter],
  )

  async function handleRoleChange(user, role) {
    const result = await adminSetRole(user.id, role)
    if (result.ok) toast.success(`«${user.name}» roli «${ROLES[role].label}» ga o'zgartirildi`)
    else toast.error(result.error)
  }

  async function handleToggleUser(user) {
    if (user.id === currentUser.id) {
      toast.error("O'zingizni bloklay olmaysiz")
      return
    }
    const result = await adminToggleUser(user.id)
    if (result.ok) {
      toast.success(user.status === 'blocked' ? 'Foydalanuvchi faollashtirildi' : 'Foydalanuvchi bloklandi')
    } else {
      toast.error(result.error)
    }
  }

  function openWallet(user) {
    setWalletUser(user)
    setWalletAmount('50000')
  }

  async function submitWallet(event) {
    event.preventDefault()
    const result = await adminAdjustWallet(walletUser.id, Number(walletAmount))
    if (result.ok) {
      toast.success(`Hamyon balansi o'zgartirildi`)
      setWalletUser(null)
    } else {
      toast.error(result.error)
    }
  }

  async function handleOrderStatus(order, status) {
    const result = await updateOrderStatus(order.id, status)
    if (result.ok) toast.success(`${order.number} holati yangilandi`)
    else toast.error(result.error)
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`«${product.title}» mahsulotini o'chirmoqchimisiz?`)) return
    const result = await deleteProduct(product.id)
    if (result.ok) toast.success("Mahsulot o'chirildi")
    else toast.error(result.error)
  }

  async function toggleProductStatus(product) {
    const result = await updateProduct(product.id, {
      status: product.status === 'active' ? 'paused' : 'active',
    })
    if (result.ok) toast.success('Mahsulot holati yangilandi')
    else toast.error(result.error)
  }

  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  async function submitCard(event) {
    event.preventDefault()
    const result = await addCard(cardForm)
    if (result.ok) {
      toast.success("Karta qo'shildi")
      setCardOpen(false)
      setCardForm({ cardType: 'UzCard', number: '', holder: 'AgroServ MChJ' })
    } else {
      toast.error(result.error)
    }
  }

  async function saveSettings(event) {
    event.preventDefault()
    const payload = {
      ...settingsForm,
      featuredPrice: Number(settingsForm.featuredPrice) || 0,
      deliveryFee: Number(settingsForm.deliveryFee) || 0,
      freeDeliveryFrom: Number(settingsForm.freeDeliveryFrom) || 0,
    }
    const result = await updateSettings(payload)
    if (result.ok) toast.success('Platforma sozlamalari saqlandi')
    else toast.error(result.error)
  }

  async function confirmPayment(payment) {
    if (!window.confirm(`${payment.userName || 'Foydalanuvchi'} to'lovini tasdiqlaysizmi?`)) return
    const result = await adminConfirmPayment(payment.id)
    if (result.ok) toast.success("To'lov tasdiqlandi va buyurtma faollashtirildi")
    else toast.error(result.error)
  }

  async function cancelPayment(payment) {
    const note = window.prompt("Bekor qilish sababi (ixtiyoriy):", '')
    if (note === null) return
    const result = await adminCancelPayment(payment.id, note)
    if (result.ok) toast.success("To'lov bekor qilindi")
    else toast.error(result.error)
  }

  async function resolveReset(reset) {
    if (!window.confirm(`${reset.email} uchun yangi parol yaratilsinmi?`)) return
    const result = await adminResolvePasswordReset(reset.id)
    if (result.ok) {
      setResetResult({ email: result.email || reset.email, password: result.password })
      toast.success('Yangi parol yaratildi')
    } else {
      toast.error(result.error)
    }
  }

  async function rejectReset(reset) {
    if (!window.confirm(`${reset.email} so'rovini rad etasizmi?`)) return
    const result = await adminRejectPasswordReset(reset.id)
    if (result.ok) toast.success("So'rov rad etildi")
    else toast.error(result.error)
  }

  async function copyResetPassword() {
    if (!resetResult?.password) return
    try {
      await navigator.clipboard.writeText(resetResult.password)
      toast.success('Parol nusxalandi')
    } catch {
      toast.error("Nusxalab bo'lmadi. Parolni qo'lda ko'chiring.")
    }
  }

  const revenueRows = [
    { label: 'Savdo komissiyasi', value: stats.commission, tone: 'from-emerald-400 to-lime-400', hint: '0% — platforma bepul' },
    { label: 'Top mahsulot', value: stats.feature, tone: 'from-amber-400 to-orange-400', hint: '30 kunlik ixtiyoriy reklama' },
  ]

  return (
    <div>
      <PageHero
        eyebrow="Administrator paneli"
        title="Platforma boshqaruvi"
        description="Foydalanuvchilar, mahsulotlar, buyurtmalar, xabarlar va to'lov sozlamalarini bitta joydan boshqaring. Barcha o'zgarishlar darhol saqlanadi."
        breadcrumbs={[{ label: 'Admin panel' }]}
        actions={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-[11px] font-bold text-purple-200">
                <ShieldCheck size={12} /> Administrator
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-100/70">
                {stats.activeUsers} faol foydalanuvchi
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-100/70">
                {formatSom(stats.revenue)} daromad
              </span>
            </div>
          </>
        }
      />

      <section className="container-page py-6">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[11px] font-bold transition ${
                  active
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <Icon size={14} /> {item.label}
                {item.id === 'messages' && unread > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {tab === 'overview' && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Users size={18} />}
                label="Foydalanuvchilar"
                value={`${formatNumber(users.length)} ta`}
                hint={`${stats.sellers} sotuvchi · ${stats.providers} mutaxassis`}
                tone="emerald"
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="Savdo hajmi"
                value={formatSom(stats.grossSales)}
                hint={`${orders.length} ta buyurtma`}
                tone="sky"
              />
              <StatCard
                icon={<Wallet size={18} />}
                label="Platforma daromadi"
                value={formatSom(stats.revenue)}
                hint="Faqat ixtiyoriy top mahsulot xizmati"
                tone="amber"
              />
              <StatCard
                icon={<Store size={18} />}
                label="Faol e'lonlar"
                value={`${stats.activeProducts + stats.activeServices} ta`}
                hint={`${stats.activeProducts} mahsulot · ${stats.activeServices} xizmat`}
                tone="violet"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                      <BarChart3 size={16} className="text-emerald-600" /> Daromad tarkibi
                    </h2>
                    <span className="text-lg font-black text-emerald-800">{formatSom(stats.revenue)}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {revenueRows.map((row) => {
                      const percent = stats.revenue > 0 ? Math.round((row.value / stats.revenue) * 100) : 0
                      return (
                        <div key={row.label}>
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <div>
                              <span className="font-bold text-emerald-950">{row.label}</span>
                              <span className="ml-2 text-[9px] text-stone-400">{row.hint}</span>
                            </div>
                            <span className="shrink-0 font-black text-emerald-800">
                              {formatSom(row.value)} <span className="text-[9px] font-semibold text-stone-400">({percent}%)</span>
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
                            <div className={`h-full rounded-full bg-gradient-to-r ${row.tone}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-center">
                    {[
                      ['Buyurtmalar', orders.length],
                      ['Yakunlangan', stats.completedOrders],
                      ['Kutilmoqda', stats.pendingOrders],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">{label}</p>
                        <p className="text-base font-black text-emerald-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-5 py-4">
                    <h2 className="text-sm font-black text-emerald-950">So'nggi buyurtmalar</h2>
                    <button type="button" onClick={() => setTab('orders')} className="text-[10px] font-bold text-emerald-700 hover:underline">
                      Barchasi →
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Buyurtma</th>
                          <th>Xaridor</th>
                          <th>Summa</th>
                          <th>Holat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => {
                          const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending
                          return (
                            <tr key={order.id}>
                              <td>
                                <p className="font-bold text-emerald-950">{order.number}</p>
                                <p className="text-[9px] text-stone-400">{formatDate(order.createdAt)}</p>
                              </td>
                              <td className="text-stone-600">{order.buyerName}</td>
                              <td className="font-bold text-emerald-800">{formatSom(order.total)}</td>
                              <td><StatusBadge label={status.label} className={status.className} /></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                      <MessageSquare size={15} className="text-emerald-600" /> Xabarlar
                    </h2>
                    <button type="button" onClick={() => setTab('messages')} className="text-[10px] font-bold text-emerald-700 hover:underline">
                      Barchasi →
                    </button>
                  </div>
                  {messages.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-stone-50 p-3 text-[10px] text-stone-500">Xabar yo'q.</p>
                  ) : (
                    <div className="mt-2.5 space-y-1.5">
                      {messages.slice(0, 3).map((message) => (
                        <button
                          key={message.id}
                          type="button"
                          onClick={() => setTab('messages')}
                          className={`w-full rounded-xl border p-2.5 text-left transition hover:border-emerald-300 ${
                            message.read ? 'border-stone-100 bg-white' : 'border-emerald-200 bg-emerald-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[10px] font-bold text-emerald-950">{message.subject}</p>
                            {!message.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
                          </div>
                          <p className="mt-0.5 truncate text-[9px] text-stone-400">{message.name} · {formatDate(message.createdAt)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <Crown size={15} className="text-amber-500" /> Eng yaxshi sotuvchilar
                  </h2>
                  <div className="mt-2.5 space-y-1.5">
                    {topSellers.map((seller, index) => (
                      <div key={seller.id} className="flex items-center gap-2 rounded-xl border border-stone-100 p-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black ${
                          index === 0 ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-bold text-emerald-950">{seller.name}</p>
                          <p className="text-[9px] text-stone-400">{seller.region}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-black text-emerald-800">{formatCompact(seller.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <UserCog size={15} className="text-emerald-600" /> Rollar taqsimoti
                  </h2>
                  <div className="mt-2.5 space-y-1.5">
                    {roleCounts.map((item) => (
                      <div key={item.role} className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="flex items-center gap-1.5 font-semibold text-stone-600">
                          {ROLES[item.role].icon} {ROLES[item.role].label}
                        </span>
                        <span className="font-black text-emerald-950">{item.count} ta</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/haqida" className="mt-3 inline-flex text-[10px] font-bold text-emerald-700 hover:underline">
                    Platforma haqida →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="mt-4">
            <div className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="Ism, email yoki hudud bo'yicha qidirish..."
                  className="input pl-10 pr-9"
                />
                {userQuery && (
                  <button
                    type="button"
                    onClick={() => setUserQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    aria-label="Tozalash"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="input w-full sm:w-44"
              >
                <option value="all">Barcha rollar</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{ROLES[role].label}</option>
                ))}
              </select>
              <span className="shrink-0 rounded-xl bg-stone-100 px-3 py-2 text-[10px] font-bold text-stone-500">
                {filteredUsers.length} ta
              </span>
            </div>

            <div className="table-wrap card mt-3 overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th>Foydalanuvchi</th>
                    <th>Rol</th>
                    <th>Hamyon</th>
                    <th>Holat</th>
                    <th className="text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-base">
                              {user.avatar || '🌱'}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-emerald-950">
                                {user.name}
                                {user.id === currentUser.id && (
                                  <span className="ml-1 rounded bg-emerald-100 px-1 text-[8px] font-black text-emerald-700">SIZ</span>
                                )}
                              </p>
                              <p className="truncate text-[9px] text-stone-400">{user.email}</p>
                              <p className="text-[9px] text-stone-400">{user.region}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(event) => handleRoleChange(user, event.target.value)}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[10px] font-bold text-stone-600 outline-none focus:border-emerald-400"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>{ROLES[role].label}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <p className="font-bold text-emerald-950">{formatSom(user.wallet || 0)}</p>
                          <button
                            type="button"
                            onClick={() => openWallet(user)}
                            className="text-[9px] font-bold text-emerald-700 hover:underline"
                          >
                            Tuzatish
                          </button>
                        </td>
                        <td>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-600'
                          }`}>
                            {user.status === 'active' ? 'Faol' : 'Bloklangan'}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleUser(user)}
                              disabled={user.id === currentUser.id}
                              className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {user.status === 'active' ? 'Bloklash' : 'Faollashtirish'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="mt-3">
                <EmptyState icon="👥" title="Foydalanuvchi topilmadi" description="Qidiruv yoki rolni o'zgartirib qayta urinib ko'ring." />
              </div>
            )}
          </div>
        )}

        {tab === 'products' && (
          <div className="mt-4">
            <div className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Mahsulot, sotuvchi yoki hudud..."
                  className="input pl-10 pr-9"
                />
                {productQuery && (
                  <button
                    type="button"
                    onClick={() => setProductQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    aria-label="Tozalash"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span className="shrink-0 rounded-xl bg-stone-100 px-3 py-2 text-[10px] font-bold text-stone-500">
                {filteredProducts.length} ta mahsulot
              </span>
            </div>

            <div className="table-wrap card mt-3 overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th>Mahsulot</th>
                    <th>Sotuvchi</th>
                    <th>Narx</th>
                    <th>Ombor</th>
                    <th>Holat</th>
                    <th className="text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const category = CATEGORIES.find((item) => item.id === product.category)
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${product.gradient} text-base`}>
                              {product.emoji}
                            </span>
                            <div className="min-w-0">
                              <Link to={`/mahsulot/${product.id}`} className="line-clamp-1 font-bold text-emerald-950 hover:text-emerald-700">
                                {product.title}
                              </Link>
                              <p className="text-[9px] text-stone-400">{category?.label || product.category} · {product.region}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-stone-600">{product.sellerName}</td>
                        <td className="font-bold text-emerald-800">{formatSom(product.price)}</td>
                        <td>{formatNumber(product.stock)} {product.unit}</td>
                        <td>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            product.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}>
                            {product.status === 'active' ? 'Faol' : "To'xtatilgan"}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end gap-1.5">
                            <button type="button" onClick={() => toggleProductStatus(product)} className="btn btn-secondary btn-sm">
                              {product.status === 'active' ? "To'xtatish" : 'Faollashtirish'}
                            </button>
                            <button type="button" onClick={() => handleDeleteProduct(product)} className="btn btn-danger btn-sm">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="mt-3">
                <EmptyState icon="📦" title="Mahsulot topilmadi" description="Qidiruvni o'zgartirib qayta urinib ko'ring." />
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="mt-4">
            <div className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-black text-emerald-950">Buyurtmalar boshqaruvi</h2>
                <p className="text-[10px] text-stone-500">
                  {orders.length} ta buyurtma · {stats.pendingOrders} ta to'lov kutilmoqda
                </p>
              </div>
              <select
                value={orderFilter}
                onChange={(event) => setOrderFilter(event.target.value)}
                className="input w-full sm:w-52"
              >
                <option value="all">Barcha holatlar</option>
                {Object.entries(ORDER_STATUS).map(([value, info]) => (
                  <option key={value} value={value}>{info.label}</option>
                ))}
              </select>
            </div>

            <div className="table-wrap card mt-3 overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th>Buyurtma</th>
                    <th>Mahsulotlar</th>
                    <th>Summa</th>
                    <th>To'lov</th>
                    <th>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <p className="font-bold text-emerald-950">{order.number}</p>
                        <p className="text-[9px] text-stone-400">{order.buyerName}</p>
                        <p className="text-[9px] text-stone-400">{formatDateTime(order.createdAt)}</p>
                      </td>
                      <td>
                        <p className="line-clamp-2 max-w-xs text-[10px] text-stone-600">
                          {order.items.map((item) => `${item.emoji} ${item.title}`).join(', ')}
                        </p>
                      </td>
                      <td>
                        <p className="font-bold text-emerald-800">{formatSom(order.total)}</p>
                        {order.discount > 0 && (
                          <p className="text-[9px] text-emerald-600">−{formatNumber(order.discount)}</p>
                        )}
                      </td>
                      <td className="text-[10px] font-semibold text-stone-500">
                        {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(event) => handleOrderStatus(order, event.target.value)}
                          className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[10px] font-bold text-stone-600 outline-none focus:border-emerald-400"
                        >
                          {Object.entries(ORDER_STATUS).map(([value, info]) => (
                            <option key={value} value={value}>{info.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="mt-3">
                <EmptyState icon="📦" title="Buyurtma topilmadi" description="Boshqa holatni tanlab ko'ring." />
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Receipt size={18} />}
                label="Jami to'lovlar"
                value={`${formatNumber(payments.length)} ta`}
                hint={`${pendingPayments.length} ta tasdiq kutmoqda`}
                tone="emerald"
              />
              <StatCard
                icon={<CheckCircle2 size={18} />}
                label="Tasdiqlangan summa"
                value={formatSom(
                  payments
                    .filter((payment) => payment.status === 'paid')
                    .reduce((sum, payment) => sum + payment.amount, 0),
                )}
                hint="Muvaffaqiyatli yakunlangan"
                tone="sky"
              />
              <StatCard
                icon={<Wallet size={18} />}
                label="Kutilayotgan summa"
                value={formatSom(pendingPayments.reduce((sum, payment) => sum + payment.amount, 0))}
                hint="Admin tasdig'ini kutmoqda"
                tone="amber"
              />
            </div>

            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <div>
                  <h2 className="text-sm font-black text-emerald-950">To'lovlar tarixi</h2>
                  <p className="text-[10px] text-stone-500">
                    Bank o'tkazmasi va onlayn to'lovlarni tasdiqlang yoki bekor qiling.
                  </p>
                </div>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-500">
                  {payments.length} ta yozuv
                </span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Sana</th>
                      <th>Foydalanuvchi</th>
                      <th>Maqsad</th>
                      <th>Summa</th>
                      <th>Usul</th>
                      <th>Holat</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...payments]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((payment) => {
                        const status = PAYMENT_STATUS[payment.status] || PAYMENT_STATUS.pending
                        return (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap text-[10px] text-stone-500">
                              {formatDateTime(payment.createdAt)}
                            </td>
                            <td>
                              <p className="text-[11px] font-bold text-emerald-950">
                                {payment.userName || 'Foydalanuvchi'}
                              </p>
                              <p className="text-[9px] text-stone-400">{payment.reference || payment.id.slice(0, 8)}</p>
                            </td>
                            <td className="text-[10px] font-semibold text-stone-600">
                              {PURPOSE_LABELS[payment.purpose] || payment.purpose}
                            </td>
                            <td className="whitespace-nowrap font-bold text-emerald-800">
                              {formatSom(payment.amount)}
                            </td>
                            <td className="text-[10px] font-semibold text-stone-500">
                              {PAYMENT_LABELS[payment.provider] || payment.provider}
                            </td>
                            <td>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${status.className}`}>
                                {status.label}
                              </span>
                            </td>
                            <td>
                              {payment.status === 'pending' ? (
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => confirmPayment(payment)}
                                    className="rounded-lg bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white hover:bg-emerald-700"
                                  >
                                    Tasdiqlash
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => cancelPayment(payment)}
                                    className="rounded-lg bg-rose-50 px-2 py-1 text-[9px] font-bold text-rose-600 hover:bg-rose-100"
                                  >
                                    Bekor qilish
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[9px] text-stone-400">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
              {payments.length === 0 && (
                <div className="p-4">
                  <EmptyState
                    icon="🧾"
                    title="To'lovlar yo'q"
                    description="Foydalanuvchilar to'lov qilganda ular shu yerda ko'rinadi."
                  />
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-black text-emerald-950">Promo kodlar</h2>
              <p className="mt-1 text-[10px] text-stone-500">
                Promo kodlar serverda tekshiriladi va ishlatilganda hisoblanadi.
              </p>
              {promoCodes.length === 0 ? (
                <p className="mt-3 rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
                  Hozircha promo kod yo'q.
                </p>
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {promoCodes.map((promo) => (
                    <div key={promo.code} className="rounded-xl border border-stone-100 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black tracking-wider text-emerald-800">{promo.code}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${
                          promo.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {promo.active ? 'Faol' : "O'chirilgan"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-stone-500">{promo.description}</p>
                      <p className="mt-1 text-[9px] text-stone-400">
                        {promo.type === 'percent' ? `${promo.value}%` : formatSom(promo.value)} ·{' '}
                        {promo.uses}/{promo.maxUses ?? '∞'} ishlatilgan
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'resets' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-emerald-950">Parolni tiklash so'rovlari</h2>
                <p className="text-[11px] text-stone-500">
                  {passwordResets.length} ta so'rov · {pendingResets.length} ta kutilmoqda
                </p>
              </div>
            </div>

            {passwordResets.length === 0 ? (
              <EmptyState
                icon="🔑"
                title="So'rovlar yo'q"
                description="Foydalanuvchilar parolni unutganda yuborgan so'rovlar shu yerda ko'rinadi."
              />
            ) : (
              <div className="space-y-2">
                {passwordResets.map((reset) => (
                  <div key={reset.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-black text-emerald-950">{reset.email}</p>
                      <p className="mt-0.5 text-[10px] text-stone-400">
                        {formatDateTime(reset.createdAt)}
                        {reset.resolvedAt ? ` · ${formatDateTime(reset.resolvedAt)}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        reset.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : reset.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-600'
                      }`}>
                        {reset.status === 'pending' ? 'Kutilmoqda' : reset.status === 'resolved' ? 'Hal qilingan' : 'Rad etilgan'}
                      </span>
                      {reset.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => resolveReset(reset)}
                            className="btn btn-primary btn-sm"
                          >
                            <KeyRound size={12} /> Yangi parol
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectReset(reset)}
                            className="btn btn-danger btn-sm"
                          >
                            <X size={12} /> Rad etish
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div className="mt-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-emerald-950">Kelgan xabarlar</h2>
                <p className="text-[11px] text-stone-500">
                  {messages.length} ta xabar · {unread} ta o'qilmagan
                </p>
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    await Promise.all(
                      messages.filter((message) => !message.read).map((message) => markMessageRead(message.id)),
                    )
                    toast.success("Barcha xabarlar o'qilgan deb belgilandi")
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <CheckCircle2 size={13} /> Barchasini o'qilgan qilish
                </button>
              )}
            </div>

            {messages.length === 0 ? (
              <EmptyState
                icon="✉️"
                title="Xabarlar yo'q"
                description="Aloqa formasi orqali kelgan xabarlar shu yerda ko'rinadi."
                action="Aloqa sahifasi"
                actionTo="/haqida"
              />
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`card p-4 ${!message.read ? 'border-l-4 border-l-emerald-500' : ''}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="flex flex-wrap items-center gap-2 text-sm font-black text-emerald-950">
                        {message.subject}
                        {!message.read && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-700">YANGI</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[10px] text-stone-400">
                        {message.name} · {message.email} · {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {!message.read && (
                        <button
                          type="button"
                          onClick={async () => {
                            await markMessageRead(message.id)
                            toast.success("O'qilgan deb belgilandi")
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Check size={12} /> O'qildi
                        </button>
                      )}
                      <a
                        href={`mailto:${message.email}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <Mail size={12} /> Javob
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await deleteMessage(message.id)
                          if (result.ok) toast.success("Xabar o'chirildi")
                          else toast.error(result.error)
                        }}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 rounded-xl bg-stone-50 px-3 py-2.5 text-[11px] leading-relaxed text-stone-600">
                    {message.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'cards' && (
          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-emerald-950">To'lov kartalari</h2>
                <p className="text-[11px] text-stone-500">
                  Platforma hisobiga ulangan kartalar. Faol kartalar manual to'lovlarni qabul qilish uchun ishlatiladi.
                </p>
              </div>
              <button type="button" onClick={() => setCardOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Karta qo'shish
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 ${
                    card.active
                      ? 'border-emerald-200 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white'
                      : 'border-stone-200 bg-stone-100 text-stone-500'
                  }`}
                >
                  <div className="pattern-grid absolute inset-0 opacity-20" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-white/15 px-2 py-0.5 text-[9px] font-black tracking-wide">
                        {card.cardType}
                      </span>
                      <CreditCard size={18} className={card.active ? 'text-lime-300' : 'text-stone-400'} />
                    </div>
                    <p className="mt-5 font-mono text-base font-bold tracking-wider">{maskCard(card.number)}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide opacity-70">{card.holder}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${
                        card.active ? 'bg-lime-400/20 text-lime-300' : 'bg-stone-200 text-stone-500'
                      }`}>
                        {card.active ? 'Faol' : "O'chirilgan"}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={async () => {
                            const result = await toggleCard(card.id)
                            if (result.ok) toast.success('Karta holati yangilandi')
                            else toast.error(result.error)
                          }}
                          className={`rounded-lg px-2 py-1 text-[9px] font-bold ${
                            card.active ? 'bg-white/15 hover:bg-white/25' : 'bg-white hover:bg-stone-50'
                          }`}
                        >
                          {card.active ? "O'chirish" : 'Yoqish'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const result = await deleteCard(card.id)
                            if (result.ok) toast.success("Karta o'chirildi")
                            else toast.error(result.error)
                          }}
                          className="rounded-lg bg-rose-500/20 px-2 py-1 text-[9px] font-bold text-rose-100 hover:bg-rose-500/30"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cards.length === 0 && (
              <div className="mt-3">
                <EmptyState icon="💳" title="Karta qo'shilmagan" description="Platforma to'lovlarini qabul qilish uchun karta qo'shing." />
              </div>
            )}
            <p className="mt-3 flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
              <ShieldCheck size={12} /> Karta raqamlari faqat admin panelda ko'rinadi. Manual to'lovlar admin tasdig'idan keyin faollashadi.
            </p>
          </div>
        )}

        {tab === 'settings' && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <form onSubmit={saveSettings} className="card p-5 sm:p-6">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                <SettingsIcon size={16} className="text-emerald-600" /> Platforma sozlamalari
              </h2>
              <p className="mt-1 text-[11px] text-stone-500">
                Sayt nomi, aloqa ma'lumotlari va to'lov parametrlari. O'zgarishlar barcha sahifalarda aks etadi.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Sayt nomi</label>
                  <input
                    value={settingsForm.siteName}
                    onChange={(event) => setSettingsForm({ ...settingsForm, siteName: event.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Telegram</label>
                  <input
                    value={settingsForm.telegram}
                    onChange={(event) => setSettingsForm({ ...settingsForm, telegram: event.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Qo'llab-quvvatlash telefoni</label>
                  <input
                    value={settingsForm.supportPhone}
                    onChange={(event) => setSettingsForm({ ...settingsForm, supportPhone: event.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Qo'llab-quvvatlash email</label>
                  <input
                    type="email"
                    value={settingsForm.supportEmail}
                    onChange={(event) => setSettingsForm({ ...settingsForm, supportEmail: event.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Ish vaqti</label>
                  <input
                    value={settingsForm.workingHours}
                    onChange={(event) => setSettingsForm({ ...settingsForm, workingHours: event.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Savdo komissiyasi</label>
                  <div className="input flex items-center justify-between bg-stone-50 text-stone-500">
                    <span>0% — platforma bepul</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Bepul</span>
                  </div>
                </div>
                <div>
                  <label className="label">Top mahsulot narxi (so'm)</label>
                  <input
                    type="number"
                    min={0}
                    value={settingsForm.featuredPrice}
                    onChange={(event) => setSettingsForm({ ...settingsForm, featuredPrice: event.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Yetkazib berish narxi (so'm)</label>
                  <input
                    type="number"
                    min={0}
                    value={settingsForm.deliveryFee}
                    onChange={(event) => setSettingsForm({ ...settingsForm, deliveryFee: event.target.value })}
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Bepul yetkazish chegarasi (so'm)</label>
                  <input
                    type="number"
                    min={0}
                    value={settingsForm.freeDeliveryFrom}
                    onChange={(event) => setSettingsForm({ ...settingsForm, freeDeliveryFrom: event.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-4">
                <Check size={15} /> Sozlamalarni saqlash
              </button>
            </form>

            <div className="space-y-3">
              <div className="card p-5">
                <h2 className="text-sm font-black text-emerald-950">Platforma holati</h2>
                <div className="mt-3 space-y-2 text-[11px]">
                  {[
                    ['Foydalanuvchilar', `${users.length} ta`],
                    ['Faol', `${stats.activeUsers} ta`],
                    ['Bloklangan', `${stats.blockedUsers} ta`],
                    ['Mahsulotlar', `${products.length} ta`],
                    ['Xizmatlar', `${services.length} ta`],
                    ['Buyurtmalar', `${orders.length} ta`],
                    ["O'qilmagan xabarlar", `${unread} ta`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-stone-100 pb-1.5 last:border-0">
                      <span className="text-stone-500">{label}</span>
                      <span className="font-bold text-emerald-950">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="text-sm font-black text-emerald-950">Tashqi integratsiyalar</h2>
                <p className="mt-1 text-[10px] leading-relaxed text-stone-500">
                  Kalitlar Vercel Environment Variables'ga qo'shiladi va sayt qayta deploy qilinadi.
                </p>
                <div className="mt-3 space-y-2 text-[11px]">
                  <IntegrationRow
                    label="Google login"
                    ready={integrations.google && GOOGLE_CLIENT_READY}
                    hint={
                      integrations.google && GOOGLE_CLIENT_READY
                        ? 'Ulangan'
                        : 'GOOGLE_CLIENT_ID + VITE_GOOGLE_CLIENT_ID'
                    }
                  />
                  <IntegrationRow
                    label="Email (parol tiklash)"
                    ready={integrations.email}
                    hint={integrations.email ? 'Ulangan' : 'GMAIL_WEBHOOK_URL + SECRET'}
                  />
                  <IntegrationRow
                    label="Payme"
                    ready={providers.payme}
                    hint={providers.payme ? 'Ulangan' : 'PAYME_MERCHANT_ID + PAYME_KEY'}
                  />
                  <IntegrationRow
                    label="Click"
                    ready={providers.click}
                    hint={providers.click ? 'Ulangan' : 'CLICK_SERVICE_ID + CLICK_SECRET_KEY'}
                  />
                </div>
                <p className="mt-3 rounded-lg bg-stone-50 px-2.5 py-2 text-[9px] leading-relaxed text-stone-500">
                  {integrations.email
                    ? "Parol tiklash havolasi foydalanuvchi emailiga avtomatik yuboriladi. Admin panel orqali ham parol yaratish mumkin."
                    : "Parol tiklash hozir admin panel orqali ishlaydi: foydalanuvchi so'rov yuboradi, admin yangi parol yaratadi."}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-black text-emerald-900">
                  <ShieldCheck size={14} /> Xavfsizlik
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-emerald-800/80">
                  Administrator roli faqat shu panel orqali beriladi. Barcha to'lovlar real DB'da
                  saqlanadi va faqat admin tasdig'idan keyin faollashadi.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(walletUser)}
        onClose={() => setWalletUser(null)}
        title="Hamyon balansini tuzatish"
        subtitle={walletUser ? `${walletUser.name} · joriy balans: ${formatSom(walletUser.wallet || 0)}` : ''}
        size="sm"
      >
        {walletUser && (
          <form onSubmit={submitWallet} className="space-y-3">
            <div>
              <label className="label">Summa (so'm)</label>
              <input
                type="number"
                value={walletAmount}
                onChange={(event) => setWalletAmount(event.target.value)}
                className="input"
                placeholder="50000"
                required
              />
              <p className="mt-1 text-[10px] text-stone-400">
                Musbat summa qo'shadi, manfiy summa ayiradi. Masalan: 50000 yoki -20000.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[50000, 100000, 500000, -50000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setWalletAmount(String(amount))}
                  className="rounded-lg border border-stone-200 px-2.5 py-1 text-[10px] font-bold text-stone-600 hover:border-emerald-300"
                >
                  {amount > 0 ? '+' : ''}{formatNumber(amount)}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary w-full">
              <Wallet size={15} /> Balansni yangilash
            </button>
          </form>
        )}
      </Modal>

      <Modal
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        title="Yangi karta qo'shish"
        subtitle="Karta ma'lumotlari serverda saqlanadi va faqat admin panelda ko'rinadi."
        size="sm"
      >
        <form onSubmit={submitCard} className="space-y-3">
          <div>
            <label className="label">Karta turi</label>
            <select
              value={cardForm.cardType}
              onChange={(event) => setCardForm({ ...cardForm, cardType: event.target.value })}
              className="input"
            >
              <option value="UzCard">UzCard</option>
              <option value="Humo">Humo</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
            </select>
          </div>
          <div>
            <label className="label">Karta raqami</label>
            <input
              value={cardForm.number}
              onChange={(event) =>
                setCardForm({ ...cardForm, number: formatCardNumber(event.target.value) })
              }
              className="input font-mono tracking-wider"
              placeholder="8600 0000 0000 0000"
              inputMode="numeric"
              required
            />
          </div>
          <div>
            <label className="label">Karta egasi</label>
            <input
              value={cardForm.holder}
              onChange={(event) => setCardForm({ ...cardForm, holder: event.target.value })}
              className="input"
              placeholder="AgroServ MChJ"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            <Plus size={15} /> Kartani qo'shish
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(resetResult)}
        onClose={() => setResetResult(null)}
        title="Yangi parol yaratildi"
        subtitle="Ushbu parolni foydalanuvchiga xavfsiz kanal orqali yetkazing. Parol boshqa ko'rsatilmaydi."
        size="sm"
      >
        {resetResult && (
          <div className="space-y-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Foydalanuvchi</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-950">{resetResult.email}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Yangi parol</p>
              <p className="mt-1 font-mono text-lg font-black tracking-wider text-emerald-900">
                {resetResult.password}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={copyResetPassword} className="btn btn-secondary flex-1">
                <Copy size={15} /> Nusxalash
              </button>
              <button type="button" onClick={() => setResetResult(null)} className="btn btn-primary flex-1">
                Yopish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function IntegrationRow({ label, ready, hint }) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-1.5 last:border-0">
      <div className="min-w-0">
        <p className="font-semibold text-stone-600">{label}</p>
        <p className="truncate text-[9px] text-stone-400">{hint}</p>
      </div>
      <span
        className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ${
          ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}
      >
        {ready ? <CheckCircle2 size={10} /> : <X size={10} />}
        {ready ? 'Faol' : 'Kalit kerak'}
      </span>
    </div>
  )
}
