import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { ORDER_STATUS, ROLES } from '../lib/constants'
import { formatDate, formatNumber, formatSom, initials } from '../lib/format'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const {
    currentUser,
    orders,
    products,
    services,
    applications,
    favoriteIds,
    aiRemaining,
    usedToday,
  } = useStore()

  const roleInfo = ROLES[currentUser.role] || ROLES.user
  const isSeller = ['seller', 'admin'].includes(currentUser.role)
  const isProvider = ['worker', 'agronomist', 'admin'].includes(currentUser.role)

  const myOrders = useMemo(
    () => orders.filter((order) => order.buyerId === currentUser.id),
    [orders, currentUser.id],
  )
  const salesOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.items.some((item) => item.sellerId === currentUser.id) &&
          ['paid', 'processing', 'shipped', 'completed'].includes(order.status),
      ),
    [orders, currentUser.id],
  )
  const myProducts = products.filter((product) => product.sellerId === currentUser.id)
  const myServices = services.filter((service) => service.userId === currentUser.id)
  const myApplications = applications.filter((entry) => entry.userId === currentUser.id)
  const pendingSales = salesOrders.filter((order) => ['paid', 'processing'].includes(order.status))

  const earned = salesOrders.reduce((sum, order) => sum + order.subtotal - order.platformFee, 0)
  const spent = myOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)

  const completeness = (() => {
    let score = 50
    if (currentUser.phone) score += 15
    if (currentUser.bio) score += 15
    if (currentUser.avatar && currentUser.avatar !== '🌱') score += 10
    if (currentUser.region) score += 10
    return Math.min(100, score)
  })()

  const recentOrders = [...myOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)

  const quickActions = [
    { to: '/bozor', icon: ShoppingBag, label: 'Bozor', text: "Mahsulot xarid qilish", tone: 'bg-emerald-50 text-emerald-700' },
    { to: '/xizmatlar', icon: Wrench, label: 'Xizmatlar', text: "Usta yoki agronom yollash", tone: 'bg-amber-50 text-amber-700' },
    { to: '/ai-maslahatchi', icon: Bot, label: 'AI maslahat', text: `${aiRemaining === Infinity ? 'Cheksiz' : aiRemaining} savol qoldi`, tone: 'bg-violet-50 text-violet-700' },
    { to: '/sevimlilar', icon: Heart, label: 'Sevimlilar', text: `${favoriteIds.length} ta saqlangan`, tone: 'bg-rose-50 text-rose-700' },
    { to: '/buyurtmalar', icon: Receipt, label: 'Buyurtmalar', text: `${myOrders.length} ta buyurtma`, tone: 'bg-sky-50 text-sky-700' },
    { to: currentUser.role === 'admin' ? '/admin' : '/profil', icon: currentUser.role === 'admin' ? BadgeCheck : Wallet, label: currentUser.role === 'admin' ? 'Admin panel' : 'Hamyon', text: currentUser.role === 'admin' ? "Platforma boshqaruvi" : formatSom(currentUser.wallet || 0), tone: 'bg-stone-100 text-stone-600' },
  ]

  if (isSeller) {
    quickActions.unshift({ to: '/dokon', icon: Store, label: "Mening do'konim", text: `${myProducts.length} ta mahsulot`, tone: 'bg-emerald-50 text-emerald-700' })
  }
  if (isProvider) {
    quickActions.unshift({ to: '/xizmatlarim', icon: Wrench, label: 'Mening xizmatlarim', text: `${myServices.length} ta xizmat`, tone: 'bg-lime-50 text-lime-700' })
  }

  return (
    <div className="soft-gradient">
      <div className="container-page py-8">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-emerald-950 p-6 text-white shadow-soft sm:p-8">
          <div className="pattern-grid absolute inset-0 opacity-30" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime-400/15 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl backdrop-blur">
                {currentUser.avatar || roleInfo.icon}
              </span>
              <div>
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-lime-300">
                  <LayoutDashboard size={12} /> Shaxsiy kabinet
                </p>
                <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
                  Salom, {currentUser.name.split(' ')[0]}!
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                  <span className={`rounded-full border px-2 py-0.5 ${roleInfo.badge}`}>
                    {roleInfo.icon} {roleInfo.label}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-emerald-100">
                    🌱 Bepul platforma
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-emerald-100">
                    {currentUser.region}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur">
                <p className="text-[8px] font-bold uppercase tracking-wide text-emerald-100/50">Hamyon balansi</p>
                <p className="text-sm font-black text-lime-300">{formatSom(currentUser.wallet || 0)}</p>
              </div>
              <Link to="/profil" className="btn btn-lime btn-sm">
                <Wallet size={14} /> Hamyonni to'ldirish
              </Link>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Wallet size={18} />}
            label="Hamyon"
            value={formatSom(currentUser.wallet || 0)}
            hint="Xarid va to'lovlar uchun"
            tone="emerald"
          />
          <StatCard
            icon={<ShoppingBag size={18} />}
            label={isSeller ? 'Savdo tushumi' : 'Xaridlar'}
            value={formatSom(isSeller ? earned : spent)}
            hint={`${isSeller ? salesOrders.length : myOrders.length} ta buyurtma`}
            tone="sky"
          />
          <StatCard
            icon={isSeller ? <Store size={18} /> : isProvider ? <Wrench size={18} /> : <Heart size={18} />}
            label={isSeller ? 'Faol e\'lonlar' : isProvider ? 'Xizmatlarim' : 'Sevimlilar'}
            value={isSeller ? myProducts.length : isProvider ? myServices.length : favoriteIds.length}
            hint={isSeller ? "Cheksiz e'lonlar" : 'Saqlanganlar'}
            tone="amber"
          />
          <StatCard
            icon={<Bot size={18} />}
            label="AI savollar"
            value={aiRemaining === Infinity ? '∞' : `${aiRemaining} ta`}
            hint={`Bugun ${usedToday} ta ishlatildi`}
            tone="violet"
          />
        </div>

        {pendingSales.length > 0 && (
          <div className="mt-3 flex flex-col justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 text-[11px] font-bold text-amber-800">
              <Package size={15} /> {pendingSales.length} ta yangi savdo buyurtmasi jarayonda. Holatni yangilang.
            </p>
            <Link to="/buyurtmalar" className="text-[10px] font-black text-amber-800 underline">
              Savdolarni ko'rish →
            </Link>
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            {/* QUICK ACTIONS */}
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-emerald-950">Tezkor amallar</h2>
                <span className="text-[10px] font-semibold text-stone-400">{currentUser.role === 'admin' ? "To'liq boshqaruv" : 'Bir bosishda'}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.to + action.label}
                      to={action.to}
                      className="group flex items-start gap-2 rounded-xl border border-stone-100 bg-white p-2.5 transition hover:border-emerald-300 hover:bg-emerald-50/40"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${action.tone}`}>
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-black text-emerald-950">{action.label}</span>
                        <span className="block truncate text-[9px] text-stone-400">{action.text}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-emerald-950">So'nggi buyurtmalar</h2>
                <Link to="/buyurtmalar" className="text-[10px] font-bold text-emerald-700 hover:underline">
                  Barchasi →
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="mt-3 rounded-xl bg-stone-50 p-6 text-center">
                  <p className="text-2xl">🛒</p>
                  <p className="mt-1 text-xs font-bold text-emerald-950">Hozircha buyurtma yo'q</p>
                  <p className="mt-0.5 text-[10px] text-stone-500">Bozordan birinchi xaridingizni qiling.</p>
                  <Link to="/bozor" className="btn btn-primary btn-sm mt-3">Bozorga o'tish</Link>
                </div>
              ) : (
                <div className="mt-3 space-y-1.5">
                  {recentOrders.map((order) => {
                    const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending
                    return (
                      <Link
                        key={order.id}
                        to="/buyurtmalar"
                        className="flex items-center gap-2.5 rounded-xl border border-stone-100 p-2.5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-lg">
                          {order.items[0]?.emoji || '📦'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-bold text-emerald-950">
                            {order.items.map((item) => item.title).join(', ')}
                          </p>
                          <p className="text-[9px] text-stone-400">{order.number} · {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black text-emerald-800">{formatNumber(order.total)}</p>
                          <span className={`mt-0.5 inline-block rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* SELLER / PROVIDER PANEL */}
            {isSeller && (
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <Store size={15} className="text-emerald-600" /> Mening mahsulotlarim
                  </h2>
                  <Link to="/dokon" className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Do'konni boshqarish →
                  </Link>
                </div>
                {myProducts.length === 0 ? (
                  <div className="mt-3 rounded-xl bg-stone-50 p-5 text-center">
                    <p className="text-2xl">🏪</p>
                    <p className="mt-1 text-xs font-bold text-emerald-950">Hali mahsulot joylanmagan</p>
                    <p className="mt-0.5 text-[10px] text-stone-500">Birinchi e'loningizni joylashtiring va savdoni boshlang.</p>
                    <Link to="/dokon" className="btn btn-primary btn-sm mt-3">
                      <Plus size={13} /> Mahsulot qo'shish
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {myProducts.slice(0, 4).map((product) => (
                      <Link
                        key={product.id}
                        to={`/mahsulot/${product.id}`}
                        className="flex items-center gap-2 rounded-xl border border-stone-100 p-2 transition hover:border-emerald-300"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${product.gradient} text-lg`}>
                          {product.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-bold text-emerald-950">{product.title}</p>
                          <p className="text-[9px] text-stone-400">{formatSom(product.price)} · {product.stock} {product.unit}</p>
                        </div>
                        {product.featured && <Zap size={12} className="shrink-0 text-amber-500" />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isProvider && (
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <Wrench size={15} className="text-emerald-600" /> Mening xizmatlarim
                  </h2>
                  <Link to="/xizmatlarim" className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Boshqarish →
                  </Link>
                </div>
                {myServices.length === 0 ? (
                  <div className="mt-3 rounded-xl bg-stone-50 p-5 text-center">
                    <p className="text-2xl">🔧</p>
                    <p className="mt-1 text-xs font-bold text-emerald-950">Xizmat joylanmagan</p>
                    <Link to="/xizmatlarim" className="btn btn-primary btn-sm mt-3">
                      <Plus size={13} /> Xizmat qo'shish
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 space-y-1.5">
                    {myServices.slice(0, 3).map((service) => (
                      <Link
                        key={service.id}
                        to={`/xizmatlar/${service.id}`}
                        className="flex items-center gap-2 rounded-xl border border-stone-100 p-2.5 transition hover:border-emerald-300"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${service.gradient} text-sm font-black text-white`}>
                          {initials(service.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-bold text-emerald-950">{service.specialization}</p>
                          <p className="text-[9px] text-stone-400">{formatSom(service.price)}/{service.unit} · ⭐ {service.rating}</p>
                        </div>
                        <ArrowRight size={12} className="shrink-0 text-stone-300" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {myApplications.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <ClipboardList size={15} className="text-emerald-600" /> Ish arizalarim
                  </h2>
                  <Link to="/ishlar" className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Ishlarni ko'rish →
                  </Link>
                </div>
                <div className="mt-3 space-y-1.5">
                  {myApplications.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-xl border border-stone-100 p-2.5">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-950">{entry.name}</p>
                        <p className="text-[9px] text-stone-400">{formatDate(entry.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-bold text-amber-700">Ko'rib chiqilmoqda</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-3">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-emerald-950">Profil to'liqligi</h2>
                <span className="text-sm font-black text-emerald-700">{completeness}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
                {completeness < 100
                  ? "Profilni to'ldirsangiz, mijozlar sizga ko'proq ishonadi."
                  : "Profilingiz to'liq. Ajoyib!"}
              </p>
              <Link to="/profil" className="btn btn-secondary btn-sm mt-3 w-full">
                Profilni tahrirlash
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-5 text-white">
              <div className="pattern-grid absolute inset-0 opacity-25" />
              <div className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
                  <Sparkles size={19} />
                </span>
                <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-lime-300">Bepul platforma</p>
                <h3 className="text-xl font-black">Barchasi bepul</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-emerald-100/60">
                  Cheksiz e'lon · 0% komissiya · kuniga 50 ta AI savol. Oylik yoki yillik to'lov yo'q.
                </p>
                <Link to="/narxlar" className="btn btn-lime btn-sm mt-3 w-full">
                  Batafsil <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-black text-emerald-950">Foydali havolalar</h2>
              <div className="mt-2.5 space-y-1">
                {[
                  { to: '/buyurtmalar', icon: Receipt, label: 'Buyurtmalar tarixi' },
                  { to: '/sevimlilar', icon: Heart, label: 'Sevimli mahsulotlar' },
                  { to: '/profil', icon: Wallet, label: 'Hamyon va kartalar' },
                  { to: '/ai-maslahatchi', icon: Bot, label: 'AI agronom maslahati' },
                  { to: '/haqida#aloqa', icon: Briefcase, label: "Qo'llab-quvvatlash" },
                ].map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.to + link.label}
                      to={link.to}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold text-stone-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <Icon size={13} className="text-emerald-600" /> {link.label}
                      <ArrowRight size={11} className="ml-auto text-stone-300" />
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-black text-amber-900">
                <TrendingUp size={14} /> Foydali maslahat
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-amber-800/80">
                Top mahsulot — ixtiyoriy xizmat. Mahsulotingizni 30 kun bozor boshida ko'rsatib,
                ko'proq xaridor jalb qiling. Asosiy platforma bepul.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
