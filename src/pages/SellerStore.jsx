import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BadgeCheck,
  BarChart3,
  Edit3,
  Eye,
  EyeOff,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import {
  CATEGORIES,
  PRODUCT_EMOJIS,
  PRODUCT_GRADIENTS,
  PRODUCT_UNITS,
  REGIONS,
} from '../lib/constants'
import { formatDate, formatNumber, formatSom } from '../lib/format'
import PageHero from '../components/PageHero'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

export default function SellerStore() {
  const navigate = useNavigate()
  const {
    currentUser,
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useStore()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(makeEmptyForm(currentUser))

  function makeEmptyForm(user) {
    return {
      title: '',
      category: 'meva',
      price: '',
      unit: 'kg',
      stock: '',
      region: user?.region || 'Toshkent',
      emoji: '🍎',
      gradient: PRODUCT_GRADIENTS[0],
      description: '',
      phone: user?.phone || '',
      telegram: '',
      year: '',
      condition: '',
    }
  }

  const myProducts = useMemo(
    () => products.filter((product) => product.sellerId === currentUser.id),
    [products, currentUser.id],
  )

  const mySales = useMemo(
    () => orders.filter((order) => order.items.some((item) => item.sellerId === currentUser.id)),
    [orders, currentUser.id],
  )

  function lineEarning(order, item) {
    const gross = item.price * item.qty
    const fee =
      item.fee !== undefined
        ? item.fee
        : Math.round((gross * (item.commissionRate ?? 0)) / 100)
    return gross - fee
  }

  const earningOrders = mySales.filter((order) =>
    ['paid', 'processing', 'shipped', 'completed'].includes(order.status),
  )
  const revenue = earningOrders.reduce(
    (sum, order) =>
      sum +
      order.items
        .filter((item) => item.sellerId === currentUser.id)
        .reduce((lineSum, item) => lineSum + lineEarning(order, item), 0),
    0,
  )
  const unitsSold = earningOrders.reduce(
    (sum, order) =>
      sum +
      order.items
        .filter((item) => item.sellerId === currentUser.id)
        .reduce((lineSum, item) => lineSum + item.qty, 0),
    0,
  )
  const featuredCount = myProducts.filter((product) => product.featured).length
  const activeCount = myProducts.filter((product) => product.status === 'active').length
  const rated = myProducts.filter((product) => product.reviewsCount > 0)
  const avgRating = rated.length
    ? (rated.reduce((sum, product) => sum + product.rating, 0) / rated.length).toFixed(1)
    : '—'

  const filtered = useMemo(() => {
    let list = myProducts
    if (statusFilter !== 'all') list = list.filter((product) => product.status === statusFilter)
    if (query.trim()) {
      const search = query.toLowerCase()
      list = list.filter((product) =>
        `${product.title} ${product.region} ${product.category}`.toLowerCase().includes(search),
      )
    }
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [myProducts, statusFilter, query])

  function openCreate() {
    setEditId(null)
    setForm(makeEmptyForm(currentUser))
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditId(product.id)
    setForm({
      title: product.title,
      category: product.category,
      price: String(product.price),
      unit: product.unit,
      stock: String(product.stock),
      region: product.region,
      emoji: product.emoji,
      gradient: product.gradient,
      description: product.description,
      phone: product.sellerPhone || currentUser.phone || '',
      telegram: product.sellerTelegram || '',
      year: product.year || '',
      condition: product.condition || '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      ...form,
      year: form.year ? Number(form.year) : undefined,
    }
    const result = editId ? await updateProduct(editId, payload) : await addProduct(payload)
    if (result.ok) {
      toast.success(editId ? "Mahsulot yangilandi" : "Mahsulot do'konga qo'shildi")
      setModalOpen(false)
      setEditId(null)
      setForm(makeEmptyForm(currentUser))
    } else {
      toast.error(result.error)
    }
  }

  async function toggleStatus(product) {
    const next = product.status === 'active' ? 'paused' : 'active'
    const result = await updateProduct(product.id, { status: next })
    if (result.ok) {
      toast.success(next === 'active' ? 'Mahsulot faollashtirildi' : "Mahsulot to'xtatildi")
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`«${product.title}» mahsulotini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`)) {
      return
    }
    const result = await deleteProduct(product.id)
    if (result.ok) toast.success("Mahsulot o'chirildi")
    else toast.error(result.error)
  }

  function handlePromote(product) {
    if (product.featured && product.featuredUntil && new Date(product.featuredUntil) > new Date()) {
      toast.error("Mahsulot allaqachon top ro'yxatda")
      return
    }
    navigate('/tolov', { state: { type: 'feature', productId: product.id } })
  }

  return (
    <div>
      <PageHero
        eyebrow="Sotuvchi kabineti"
        title="Mening do'konim"
        description="Mahsulotlarni boshqaring, top ro'yxatga chiqaring va savdo statistikasini kuzatib boring. Barcha o'zgarishlar darhol bozorda aks etadi."
        breadcrumbs={[{ label: "Mening do'konim" }]}
        actions={
          <>
            <button type="button" onClick={openCreate} className="btn btn-lime">
              <Plus size={16} /> Yangi mahsulot
            </button>
            <Link to="/bozor" className="btn border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Store size={15} /> Bozorni ko'rish
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-[11px] font-semibold text-lime-300">
                5% komissiya
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-100/70">
                {myProducts.length} ta e'lon
              </span>
            </div>
          </>
        }
      />

      <section className="container-page py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Package size={18} />}
            label="Mahsulotlar"
            value={`${myProducts.length} ta`}
            hint={`${activeCount} faol · ${myProducts.length - activeCount} to'xtatilgan`}
            tone="emerald"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Savdo tushumi"
            value={formatSom(revenue)}
            hint={`${earningOrders.length} ta buyurtma`}
            tone="sky"
          />
          <StatCard
            icon={<ShoppingBag size={18} />}
            label="Sotilgan birlik"
            value={formatNumber(unitsSold)}
            hint="Mahsulot dona / kg / litr"
            tone="amber"
          />
          <StatCard
            icon={<Star size={18} />}
            label="O'rtacha reyting"
            value={avgRating}
            hint={`${featuredCount} ta top mahsulot`}
            tone="violet"
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                  <Sparkles size={15} className="text-emerald-600" /> Bepul e'lonlar
                </h2>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Mahsulot joylash bepul va cheklanmagan. Savdodan 5% komissiya olinadi.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                {myProducts.length} ta e'lon
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-stone-50 p-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Faol</p>
                <p className="mt-0.5 text-sm font-black text-emerald-950">{activeCount} ta</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">To'xtatilgan</p>
                <p className="mt-0.5 text-sm font-black text-emerald-950">{myProducts.length - activeCount} ta</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-5 text-white">
            <div className="pattern-grid absolute inset-0 opacity-25" />
            <div className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
                <Target size={17} />
              </span>
              <p className="mt-2.5 text-sm font-black">Top mahsulot xizmati</p>
              <p className="mt-1 text-[10px] leading-relaxed text-emerald-100/60">
                {formatSom(25000)} — 30 kun bozor boshida ko'rsatish. Ko'proq xaridor jalb qiling.
              </p>
              <p className="mt-2 text-[9px] font-semibold text-lime-300">
                Promo kod: TOP25 (−5 000 so'm)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-emerald-950">Mahsulotlar boshqaruvi</h2>
            <p className="text-[11px] text-stone-500">
              {activeCount} ta faol e'lon · {mySales.length} ta buyurtma tarixda
            </p>
          </div>
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} /> Mahsulot qo'shish
          </button>
        </div>

        <div className="card mt-3 flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Mahsulot nomi yoki hudud bo'yicha qidirish..."
              className="input pl-10 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label="Tozalash"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input w-full sm:w-44"
          >
            <option value="all">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="paused">To'xtatilgan</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="🏪"
              title={myProducts.length === 0 ? "Do'kon hali bo'sh" : 'Natija topilmadi'}
              description={
                myProducts.length === 0
                  ? "Birinchi mahsulotingizni joylashtiring — bozorda ko'rinadi va xaridorlar buyurtma bera oladi."
                  : "Qidiruv yoki filtrni o'zgartirib qayta urinib ko'ring."
              }
              action={myProducts.length === 0 ? "Mahsulot qo'shish" : undefined}
              actionTo={myProducts.length === 0 ? '/dokon' : undefined}
            />
            {myProducts.length === 0 && (
              <div className="mt-3 text-center">
                <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Mahsulot qo'shish
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {filtered.map((product) => {
              const category = CATEGORIES.find((item) => item.id === product.category)
              const isFeatured =
                product.featured && product.featuredUntil && new Date(product.featuredUntil) > new Date()
              return (
                <div key={product.id} className="card flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center">
                  <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${product.gradient}`}>
                    <div className="pattern-dots absolute inset-0 rounded-xl opacity-20" />
                    <span className="relative text-3xl drop-shadow">{product.emoji}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        to={`/mahsulot/${product.id}`}
                        className="line-clamp-1 text-sm font-black text-emerald-950 hover:text-emerald-700"
                      >
                        {product.title}
                      </Link>
                      {isFeatured && (
                        <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-700">
                          ⭐ Top
                        </span>
                      )}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                          product.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {product.status === 'active' ? 'Faol' : "To'xtatilgan"}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-stone-400">
                      <span>{category?.icon} {category?.short || product.category}</span>
                      <span>{product.region}</span>
                      <span>{formatDate(product.createdAt)}</span>
                      <span>⭐ {product.rating || 0} ({product.reviewsCount || 0})</span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                      <span className="font-black text-emerald-700">
                        {formatNumber(product.price)}
                        <span className="text-[9px] font-semibold text-stone-400"> so'm/{product.unit}</span>
                      </span>
                      <span className="font-semibold text-stone-500">
                        Ombor: {formatNumber(product.stock)} {product.unit}
                      </span>
                      <span className="font-semibold text-stone-500">Sotilgan: {formatNumber(product.sales || 0)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 lg:shrink-0">
                    <button type="button" onClick={() => openEdit(product)} className="btn btn-secondary btn-sm">
                      <Edit3 size={13} /> Tahrir
                    </button>
                    <button type="button" onClick={() => toggleStatus(product)} className="btn btn-secondary btn-sm">
                      {product.status === 'active' ? <EyeOff size={13} /> : <Eye size={13} />}
                      {product.status === 'active' ? "To'xtatish" : 'Faollashtirish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromote(product)}
                      disabled={Boolean(isFeatured)}
                      className="btn btn-secondary btn-sm text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Sparkles size={13} /> Top
                    </button>
                    <button type="button" onClick={() => handleDelete(product)} className="btn btn-danger btn-sm">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "To'liq ma'lumot",
              text: "Rasm o'rniga emoji vizual, aniq narx va tavsif qo'shing — ishonch oshadi.",
            },
            {
              icon: BarChart3,
              title: 'Statistikani kuzating',
              text: "Qaysi mahsulot ko'p sotilayotganini ko'rib, assortimentni yangilang.",
            },
            {
              icon: Sparkles,
              title: 'Top mahsulot',
              text: "Top xizmati bilan e'loningiz bozor boshida 30 kun turadi.",
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="card flex items-start gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-xs font-black text-emerald-950">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}
        subtitle={
          editId
            ? "O'zgarishlar saqlangach bozorda darhol yangilanadi."
            : "Mahsulot nomi, narxi va tavsifini to'ldiring."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Mahsulot nomi *</label>
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="input"
              placeholder="Masalan: Olma (Fuji navi)"
              required
              minLength={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Kategoriya</label>
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="input"
              >
                {CATEGORIES.filter((item) => ['texnika', 'meva', 'ogit'].includes(item.id)).map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Hudud</label>
              <select
                value={form.region}
                onChange={(event) => setForm({ ...form, region: event.target.value })}
                className="input"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Narx (so'm) *</label>
              <input
                type="number"
                min={1}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className="input"
                placeholder="8000"
                required
              />
            </div>
            <div>
              <label className="label">O'lchov birligi</label>
              <select
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                className="input"
              >
                {PRODUCT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ombor miqdori *</label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(event) => setForm({ ...form, stock: event.target.value })}
                className="input"
                placeholder="1000"
                required
              />
            </div>
          </div>

          {form.category === 'texnika' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Ishlab chiqarilgan yil</label>
                <input
                  type="number"
                  min={1950}
                  max={2026}
                  value={form.year}
                  onChange={(event) => setForm({ ...form, year: event.target.value })}
                  className="input"
                  placeholder="2022"
                />
              </div>
              <div>
                <label className="label">Holati</label>
                <select
                  value={form.condition}
                  onChange={(event) => setForm({ ...form, condition: event.target.value })}
                  className="input"
                >
                  <option value="">Tanlanmagan</option>
                  <option value="Yangi">Yangi</option>
                  <option value="Ishlatilgan">Ishlatilgan</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="label">Tavsif</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={3}
              className="input resize-none"
              placeholder="Mahsulot sifati, navi, yetkazib berish shartlari va boshqa ma'lumotlar..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Telefon</label>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="input"
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div>
              <label className="label">Telegram (ixtiyoriy)</label>
              <input
                value={form.telegram}
                onChange={(event) => setForm({ ...form, telegram: event.target.value })}
                className="input"
                placeholder="@dokon_nomi"
              />
            </div>
          </div>

          <div>
            <label className="label">Emoji vizual</label>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, emoji })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
                    form.emoji === emoji
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Rang gradienti</label>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCT_GRADIENTS.map((gradient) => (
                <button
                  key={gradient}
                  type="button"
                  onClick={() => setForm({ ...form, gradient })}
                  className={`h-8 w-14 rounded-lg border-2 bg-gradient-to-r ${gradient} transition ${
                    form.gradient === gradient ? 'border-emerald-700' : 'border-transparent'
                  }`}
                  aria-label="Rang tanlash"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn btn-primary flex-1">
              {editId ? 'O\'zgarishlarni saqlash' : "Mahsulotni qo'shish"}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Bekor qilish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
