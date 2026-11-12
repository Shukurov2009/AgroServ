import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  Edit3,
  Eye,
  EyeOff,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { ORDER_STATUS, REGIONS, SERVICE_GRADIENTS } from '../lib/constants'
import { formatDate, formatNumber, formatSom, initials } from '../lib/format'
import PageHero from '../components/PageHero'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { PlanBadge, StatusBadge } from '../components/Badges'

export default function MyServices() {
  const {
    currentUser,
    plan,
    services,
    orders,
    addService,
    updateService,
    deleteService,
  } = useStore()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(makeEmptyForm(currentUser))

  function makeEmptyForm(user) {
    const type = user?.role === 'agronomist' ? 'agronomist' : 'worker'
    return {
      type,
      name: user?.name || '',
      age: '30',
      experience: '5',
      serviceType: '',
      specialization: '',
      equipment: '',
      education: '',
      price: '',
      unit: type === 'worker' ? 'ga' : 'tashrif',
      region: user?.region || 'Toshkent',
      phone: user?.phone || '',
      telegram: '',
      description: '',
      gradient: SERVICE_GRADIENTS[0],
    }
  }

  const myServices = useMemo(
    () => services.filter((service) => service.userId === currentUser.id),
    [services, currentUser.id],
  )

  const myServiceOrders = useMemo(
    () =>
      orders.filter((order) =>
        order.items.some((item) => item.type === 'service' && item.sellerId === currentUser.id),
      ),
    [orders, currentUser.id],
  )

  const earningOrders = myServiceOrders.filter((order) =>
    ['paid', 'processing', 'shipped', 'completed'].includes(order.status),
  )

  function lineEarning(item) {
    const gross = item.price * item.qty
    const fee =
      item.fee !== undefined
        ? item.fee
        : Math.round((gross * (item.commissionRate ?? plan.commission)) / 100)
    return gross - fee
  }

  const earnings = earningOrders.reduce(
    (sum, order) =>
      sum +
      order.items
        .filter((item) => item.type === 'service' && item.sellerId === currentUser.id)
        .reduce((lineSum, item) => lineSum + lineEarning(item), 0),
    0,
  )
  const bookings = earningOrders.reduce(
    (sum, order) =>
      sum +
      order.items.filter((item) => item.type === 'service' && item.sellerId === currentUser.id).length,
    0,
  )
  const activeCount = myServices.filter((service) => service.status === 'active').length
  const rated = myServices.filter((service) => service.reviewsCount > 0)
  const avgRating = rated.length
    ? (rated.reduce((sum, service) => sum + service.rating, 0) / rated.length).toFixed(1)
    : '—'
  const limit = plan.listings
  const limitReached = limit !== Infinity && myServices.length >= limit

  const filtered = useMemo(() => {
    let list = myServices
    if (statusFilter !== 'all') list = list.filter((service) => service.status === statusFilter)
    if (query.trim()) {
      const search = query.toLowerCase()
      list = list.filter((service) =>
        `${service.name} ${service.serviceType} ${service.specialization} ${service.region}`
          .toLowerCase()
          .includes(search),
      )
    }
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [myServices, statusFilter, query])

  const recentOrders = [...myServiceOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  function openCreate() {
    if (limitReached) {
      toast.error(`«${plan.name}» tarifida ${limit} tagacha xizmat joylash mumkin. Tarifni oshiring.`)
      return
    }
    setEditId(null)
    setForm(makeEmptyForm(currentUser))
    setModalOpen(true)
  }

  function openEdit(service) {
    setEditId(service.id)
    setForm({
      type: service.type,
      name: service.name,
      age: String(service.age || ''),
      experience: String(service.experience || ''),
      serviceType: service.serviceType || '',
      specialization: service.specialization || '',
      equipment: service.equipment || '',
      education: service.education || '',
      price: String(service.price || ''),
      unit: service.unit || (service.type === 'worker' ? 'ga' : 'tashrif'),
      region: service.region,
      phone: service.phone || '',
      telegram: service.telegram || '',
      description: service.description || '',
      gradient: service.gradient || SERVICE_GRADIENTS[0],
    })
    setModalOpen(true)
  }

  function changeType(type) {
    setForm((prev) => ({
      ...prev,
      type,
      unit: type === 'worker' ? 'ga' : 'tashrif',
      gradient:
        type === 'worker'
          ? SERVICE_GRADIENTS[0]
          : SERVICE_GRADIENTS[1],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = editId ? await updateService(editId, form) : await addService(form)
    if (result.ok) {
      toast.success(editId ? 'Xizmat yangilandi' : "Xizmat e'lon qilindi")
      setModalOpen(false)
      setEditId(null)
      setForm(makeEmptyForm(currentUser))
    } else {
      toast.error(result.error)
    }
  }

  async function toggleStatus(service) {
    const next = service.status === 'active' ? 'paused' : 'active'
    const result = await updateService(service.id, { status: next })
    if (result.ok) {
      toast.success(next === 'active' ? 'Xizmat faollashtirildi' : "Xizmat to'xtatildi")
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete(service) {
    if (!window.confirm(`«${service.specialization || service.serviceType}» xizmatini o'chirmoqchimisiz?`)) {
      return
    }
    const result = await deleteService(service.id)
    if (result.ok) toast.success("Xizmat o'chirildi")
    else toast.error(result.error)
  }

  function usageWidth() {
    if (limit === Infinity) return 100
    return Math.min(100, Math.round((myServices.length / limit) * 100))
  }

  return (
    <div>
      <PageHero
        eyebrow="Mutaxassis kabineti"
        title="Mening xizmatlarim"
        description="Texnika xizmati yoki agronomik maslahat e'lonlarini boshqaring. Buyurtmalar, daromad va mijozlar bahosini bir joyda kuzatib boring."
        breadcrumbs={[{ label: 'Mening xizmatlarim' }]}
        actions={
          <>
            <button type="button" onClick={openCreate} className="btn btn-lime">
              <Plus size={16} /> Yangi xizmat
            </button>
            <Link to="/xizmatlar" className="btn border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Wrench size={15} /> Xizmatlarni ko'rish
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <PlanBadge plan={plan} />
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-100/70">
                {myServices.length} / {limit === Infinity ? '∞' : limit} xizmat
              </span>
            </div>
          </>
        }
      />

      <section className="container-page py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Wrench size={18} />}
            label="Xizmatlar"
            value={`${myServices.length} ta`}
            hint={`${activeCount} faol · ${myServices.length - activeCount} to'xtatilgan`}
            tone="emerald"
          />
          <StatCard
            icon={<Wallet size={18} />}
            label="Daromad"
            value={formatSom(earnings)}
            hint={`${bookings} ta xizmat buyurtmasi`}
            tone="sky"
          />
          <StatCard
            icon={<CalendarCheck size={18} />}
            label="Buyurtmalar"
            value={`${myServiceOrders.length} ta`}
            hint="Barcha holatlar bo'yicha"
            tone="amber"
          />
          <StatCard
            icon={<Star size={18} />}
            label="O'rtacha reyting"
            value={avgRating}
            hint={`${rated.length} ta baholangan xizmat`}
            tone="violet"
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                  <ClipboardList size={15} className="text-emerald-600" /> Tarif limiti
                </h2>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  {limit === Infinity
                    ? 'Pro tarifida xizmatlar soni cheksiz.'
                    : `${plan.name} tarifida ${limit} tagacha xizmat joylash mumkin.`}
                </p>
              </div>
              {plan.id !== 'pro' && (
                <Link to="/narxlar" className="btn btn-secondary btn-sm shrink-0">
                  Tarifni oshirish
                </Link>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full ${
                    limitReached
                      ? 'bg-gradient-to-r from-rose-400 to-orange-400'
                      : 'bg-gradient-to-r from-emerald-500 to-lime-400'
                  }`}
                  style={{ width: `${usageWidth()}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-stone-500">
                {myServices.length}/{limit === Infinity ? '∞' : limit}
              </span>
            </div>
            {limitReached && (
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-600">
                Limit tugadi. Yangi xizmat qo'shish uchun tarifni oshiring yoki keraksiz xizmatni o'chiring.
              </p>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-emerald-950">So'nggi buyurtmalar</h2>
              <Link to="/buyurtmalar" className="text-[10px] font-bold text-emerald-700 hover:underline">
                Barchasi →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="mt-3 rounded-xl bg-stone-50 p-3 text-[10px] leading-relaxed text-stone-500">
                Hozircha buyurtma yo'q. Xizmatni faol holatda saqlang — mijozlar sizni topadi.
              </p>
            ) : (
              <div className="mt-2.5 space-y-1.5">
                {recentOrders.map((order) => {
                  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending
                  const line = order.items.find(
                    (item) => item.type === 'service' && item.sellerId === currentUser.id,
                  )
                  return (
                    <div key={order.id} className="flex items-center justify-between gap-2 rounded-xl border border-stone-100 p-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold text-emerald-950">
                          {line?.title || order.number}
                        </p>
                        <p className="text-[9px] text-stone-400">
                          {formatDate(order.createdAt)} · {formatNumber(line?.qty || 0)} {line?.unit}
                        </p>
                      </div>
                      <StatusBadge label={status.label} className={status.className} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-emerald-950">Xizmatlar boshqaruvi</h2>
            <p className="text-[11px] text-stone-500">
              {activeCount} ta faol e'lon · {formatSom(earnings)} tushum
            </p>
          </div>
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} /> Xizmat qo'shish
          </button>
        </div>

        <div className="card mt-3 flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Xizmat turi, mutaxassislik yoki hudud bo'yicha qidirish..."
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
              icon="🔧"
              title={myServices.length === 0 ? "Xizmat hali qo'shilmagan" : 'Natija topilmadi'}
              description={
                myServices.length === 0
                  ? "Texnika xizmati yoki agronomik maslahat e'lonini joylashtiring — mijozlar siz bilan bog'lanadi."
                  : "Qidiruv yoki filtrni o'zgartirib qayta urinib ko'ring."
              }
              action={myServices.length === 0 ? "Xizmat qo'shish" : undefined}
              actionTo={myServices.length === 0 ? '/xizmatlarim' : undefined}
            />
            {myServices.length === 0 && (
              <div className="mt-3 text-center">
                <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Xizmat qo'shish
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {filtered.map((service) => {
              const isWorker = service.type === 'worker'
              return (
                <div key={service.id} className="card flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center">
                  <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.gradient}`}>
                    <div className="pattern-grid absolute inset-0 rounded-xl opacity-20" />
                    <span className="relative text-lg font-black text-white">{initials(service.name)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        to={`/xizmatlar/${service.id}`}
                        className="line-clamp-1 text-sm font-black text-emerald-950 hover:text-emerald-700"
                      >
                        {isWorker ? service.serviceType : service.specialization}
                      </Link>
                      {service.verified && <BadgeCheck size={13} className="text-emerald-500" />}
                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                        isWorker ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isWorker ? 'Texnika ustasi' : 'Agronom'}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                        service.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}>
                        {service.status === 'active' ? 'Faol' : "To'xtatilgan"}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-stone-400">
                      <span>{service.name}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={9} /> {service.region}</span>
                      <span>{service.experience} yil tajriba</span>
                      <span>⭐ {service.rating || 0} ({service.reviewsCount || 0})</span>
                      <span>{service.completedOrders || 0} ish</span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                      <span className="font-black text-emerald-700">
                        {formatNumber(service.price)}
                        <span className="text-[9px] font-semibold text-stone-400"> so'm/{service.unit}</span>
                      </span>
                      <span className="font-semibold text-stone-500">{formatDate(service.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 lg:shrink-0">
                    <Link to={`/xizmatlar/${service.id}`} className="btn btn-secondary btn-sm">
                      <Eye size={13} /> Ko'rish
                    </Link>
                    <button type="button" onClick={() => openEdit(service)} className="btn btn-secondary btn-sm">
                      <Edit3 size={13} /> Tahrir
                    </button>
                    <button type="button" onClick={() => toggleStatus(service)} className="btn btn-secondary btn-sm">
                      {service.status === 'active' ? <EyeOff size={13} /> : <Eye size={13} />}
                      {service.status === 'active' ? "To'xtatish" : 'Faollashtirish'}
                    </button>
                    <button type="button" onClick={() => handleDelete(service)} className="btn btn-danger btn-sm">
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
              title: 'Tekshirilgan mutaxassis',
              text: "To'liq ma'lumot va mijoz sharhlari ishonchni oshiradi.",
            },
            {
              icon: Users,
              title: "Ko'proq mijoz",
              text: "Xizmatni faol saqlang — qidiruvda yuqoriroq ko'rinasiz.",
            },
            {
              icon: Sparkles,
              title: 'Baholash tizimi',
              text: "Har bir yakunlangan buyurtmadan keyin mijoz sharh qoldirishi mumkin.",
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
        title={editId ? 'Xizmatni tahrirlash' : "Yangi xizmat e'lon qilish"}
        subtitle={
          editId
            ? "O'zgarishlar saqlangach xizmat sahifasida yangilanadi."
            : "Mutaxassisligingiz, narxingiz va tajribangizni ko'rsating."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Xizmat turi</label>
              <select value={form.type} onChange={(event) => changeType(event.target.value)} className="input">
                <option value="worker">🔧 Texnika ustasi</option>
                <option value="agronomist">🌿 Agronom</option>
              </select>
            </div>
            <div>
              <label className="label">Ko'rsatiladigan ism</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="input"
                placeholder="Ahmadjon Toshmatov"
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Yosh</label>
              <input
                type="number"
                min={18}
                max={80}
                value={form.age}
                onChange={(event) => setForm({ ...form, age: event.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Tajriba (yil)</label>
              <input
                type="number"
                min={0}
                max={60}
                value={form.experience}
                onChange={(event) => setForm({ ...form, experience: event.target.value })}
                className="input"
              />
            </div>
          </div>

          {form.type === 'worker' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Xizmat nomi *</label>
                <input
                  value={form.serviceType}
                  onChange={(event) => setForm({ ...form, serviceType: event.target.value })}
                  className="input"
                  placeholder="Yer tekislash"
                  required
                />
              </div>
              <div>
                <label className="label">Texnika</label>
                <div className="relative">
                  <Wrench size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={form.equipment}
                    onChange={(event) => setForm({ ...form, equipment: event.target.value })}
                    className="input pl-9"
                    placeholder="Buldozer T-170"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Mutaxassislik *</label>
                <input
                  value={form.specialization}
                  onChange={(event) => setForm({ ...form, specialization: event.target.value })}
                  className="input"
                  placeholder="Donli ekinlar"
                  required
                />
              </div>
              <div>
                <label className="label">Ma'lumot</label>
                <div className="relative">
                  <GraduationCap size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={form.education}
                    onChange={(event) => setForm({ ...form, education: event.target.value })}
                    className="input pl-9"
                    placeholder="ToshDAU, Agronomiya"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Narx (so'm) *</label>
              <input
                type="number"
                min={1}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className="input"
                placeholder="150000"
                required
              />
            </div>
            <div>
              <label className="label">O'lchov</label>
              <input value={form.unit} readOnly className="input bg-stone-50 text-stone-500" />
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

          <div>
            <label className="label">Tavsif</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={3}
              className="input resize-none"
              placeholder="Xizmat qanday bajariladi, qanday texnika ishlatiladi, kafolat va muddatlar..."
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
                placeholder="@mutaxassis"
              />
            </div>
          </div>

          <div>
            <label className="label">Rang gradienti</label>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_GRADIENTS.map((gradient) => (
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
              {editId ? "O'zgarishlarni saqlash" : "Xizmatni e'lon qilish"}
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
