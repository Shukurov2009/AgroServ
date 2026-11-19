import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { CATEGORIES } from '../lib/constants'
import { formatNumber } from '../lib/format'
import ProductCard from '../components/ProductCard'
import ServiceCard from '../components/ServiceCard'
import VideoCard from '../components/VideoCard'
import SectionHeader from '../components/SectionHeader'

const QUICK_TAGS = ['Traktor', 'Olma', 'Karbamid', 'Agronom', 'Kombayn']

const STEPS = [
  {
    icon: Store,
    title: "Ro'yxatdan o'ting",
    text: "Fermer, sotuvchi, usta yoki agronom sifatida bir daqiqada hisob oching.",
  },
  {
    icon: Search,
    title: 'Keraklini toping',
    text: "Bozordan mahsulot tanlang yoki xizmat ko'rsatuvchi mutaxassisni toping.",
  },
  {
    icon: CheckCircle2,
    title: 'Xavfsiz yakunlang',
    text: "Hamyon, bank o'tkazmasi yoki naqd orqali to'lang, buyurtmani kuzatib boring va baho qoldiring.",
  },
]

const TRUST = [
  { icon: ShieldCheck, title: 'Tekshirilgan sotuvchilar', text: "Har bir sotuvchi profili va mahsuloti moderatsiyadan o'tadi." },
  { icon: CircleDollarSign, title: "Xavfsiz to'lov", text: "Karta, hamyon yoki naqd — barcha to'lovlar tarixi saqlanadi." },
  { icon: Bot, title: 'AI agronom maslahati', text: 'Kuniga 50 ta bepul savol — obuna talab qilinmaydi.' },
  { icon: Truck, title: 'Yetkazib berish', text: "1 000 000 so'mdan yuqori buyurtmalarga yetkazish bepul." },
]

const PLATFORM_FEATURES = [
  { icon: Store, title: "Cheksiz e'lonlar", text: 'Mahsulot va xizmatlarni cheklovsiz joylang.' },
  { icon: CircleDollarSign, title: '5% komissiya', text: 'Savdo summasining 95% sotuvchiga qoladi.' },
  { icon: Bot, title: 'Bepul AI', text: 'Kuniga 50 ta agronomik savol.' },
  { icon: Sparkles, title: 'Bepul hamyon', text: "To'lovlar va buyurtmalar bitta joyda." },
]

export default function Home() {
  const navigate = useNavigate()
  const { products, services, videos, users, orders, reviews, settings, currentUser } = useStore()
  const [query, setQuery] = useState('')

  const featured = [
    ...products.filter((product) => product.featured && product.status === 'active'),
    ...products.filter((product) => !product.featured && product.status === 'active'),
  ].slice(0, 4)

  const topServices = [...services].sort((a, b) => b.rating - a.rating).slice(0, 3)
  const latestVideos = videos.slice(0, 3)
  const totalRevenue = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const completedOrders = orders.filter((order) => order.status === 'completed').length
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
    : 0
  const regionsCount = new Set(users.map((user) => user.region).filter(Boolean)).size
  const weeklyBars = Array.from({ length: 7 }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - (6 - index))
    const key = day.toISOString().slice(0, 10)
    return orders
      .filter((order) => order.status !== 'cancelled' && order.createdAt?.slice(0, 10) === key)
      .reduce((sum, order) => sum + order.total, 0)
  })
  const maxBar = Math.max(...weeklyBars, 1)

  const heroStats = [
    [formatNumber(users.length), 'Foydalanuvchi'],
    [formatNumber(products.length + services.length), "E'lon"],
    [String(regionsCount), 'Viloyat'],
    [averageRating ? `${averageRating.toFixed(1)}/5` : '—', 'Reyting'],
  ]

  const trustStats = [
    [averageRating ? `${averageRating.toFixed(1)}/5` : '—', "O'rtacha reyting"],
    [settings.workingHours || '09:00–19:00', "Qo'llab-quvvatlash"],
    [formatNumber(completedOrders), 'Yakunlangan buyurtma'],
    ['5%', 'Savdo komissiyasi'],
  ]

  function handleSearch(event) {
    event.preventDefault()
    navigate(`/bozor${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <div>
      {/* HERO */}
      <section className="hero-cream relative overflow-hidden">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -right-16 top-0 h-96 w-96 rounded-full bg-lime-400/30 blur-3xl" />
        <div className="pattern-dots absolute inset-x-0 top-0 h-64 opacity-[0.35]" />

        <div className="container-page relative pb-8 pt-10 sm:pt-14 lg:pb-12 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
            <div className="max-w-2xl">
              <span className="eyebrow-chip">
                <Sparkles size={13} className="text-emerald-700" />
                O'zbekistonning raqamli agro ekotizimi
              </span>

              <h1 className="mt-5 text-[clamp(2.55rem,6vw,4.5rem)] font-extrabold leading-[0.99] tracking-[-0.055em] text-emerald-950">
                Fermer uchun hamma narsa —{' '}
                <span className="marker-lime">bir joyda.</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm font-medium leading-relaxed text-stone-600 sm:text-base">
                Agro texnika, yangi meva-sabzavot, o'g'itlar, tajribali ustalar va agronomlar.
                Sotib oling, soting, xizmat yollang va AI maslahat oling.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-7 flex max-w-xl items-center gap-1.5 rounded-full border border-white/90 bg-white/75 p-1.5 shadow-[0_24px_50px_-34px_rgba(8,31,19,0.55)] backdrop-blur-xl"
              >
                <Search size={18} className="ml-3 shrink-0 text-emerald-800/50" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Traktor, olma, karbamid yoki agronom qidiring..."
                  className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm font-medium text-emerald-950 outline-none placeholder:text-stone-400"
                />
                <button type="submit" className="btn btn-primary shrink-0 px-4 py-2.5 text-xs sm:px-5 sm:text-sm">
                  Qidirish <ArrowRight size={15} />
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">Mashhur:</span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/bozor?q=${encodeURIComponent(tag)}`)}
                    className="rounded-full border border-emerald-950/10 bg-white/60 px-2.5 py-1 text-[10px] font-bold text-emerald-900/70 backdrop-blur transition hover:border-lime-500/60 hover:bg-white hover:text-emerald-950"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link to="/bozor" className="btn btn-dark btn-lg">
                  Bozorni ko'rish <ArrowRight size={17} />
                </Link>
                <Link to="/haqida" className="btn btn-secondary btn-lg">
                  Platforma haqida
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-emerald-900/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" /> Xavfsiz to'lov
                </span>
                <span className="flex items-center gap-1.5">
                  <BadgeCheck size={14} className="text-emerald-700" /> Tekshirilgan sotuvchilar
                </span>
                <span className="flex items-center gap-1.5">
                  <Bot size={14} className="text-emerald-700" /> AI agronom
                </span>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative mx-auto hidden w-full max-w-[470px] lg:block">
              <div className="absolute -inset-7 rounded-[3rem] bg-lime-300/25 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.4rem] border border-white/15 bg-emerald-950 p-2 shadow-[0_46px_100px_-44px_rgba(8,31,19,0.9)]">
                <div className="rounded-[2rem] bg-gradient-to-br from-emerald-900 via-emerald-950 to-emerald-950 p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-lime-300">
                      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-lime-400" /> AgroServ live
                    </span>
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-400/70" />
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/45">Platforma savdosi</p>
                    <div className="mt-1.5 flex flex-wrap items-end justify-between gap-2">
                      <p className="text-[1.65rem] font-extrabold leading-none text-white">
                        {formatNumber(totalRevenue)} <span className="text-sm font-bold text-emerald-100/50">so'm</span>
                      </p>
                      <span className="flex items-center gap-1 rounded-full bg-lime-400/15 px-2 py-1 text-[10px] font-bold text-lime-300">
                        <TrendingUp size={11} /> {formatNumber(orders.length)} buyurtma
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex h-24 items-end gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-3 pb-2 pt-3">
                    {weeklyBars.map((value, index) => (
                      <div key={index} className="flex h-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/50 via-lime-400/80 to-lime-300"
                          style={{ height: `${Math.max(5, Math.round((value / maxBar) * 100))}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between px-1 text-[8px] font-bold text-emerald-100/35">
                    {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
                      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-100/40">Buyurtmalar</p>
                      <p className="mt-1 text-lg font-extrabold text-white">{formatNumber(orders.length)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
                      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-emerald-100/40">Foydalanuvchilar</p>
                      <p className="mt-1 text-lg font-extrabold text-white">{formatNumber(users.length)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-6 w-48 -rotate-3 animate-float rounded-2xl border border-white/80 bg-[#fffdf6] p-3 shadow-[0_24px_50px_-24px_rgba(8,31,19,0.5)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-lg">🍎</span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Yangi buyurtma</p>
                    <p className="text-xs font-extrabold text-emerald-950">Olma Fuji · 100 kg</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700">800 000 so'm</span>
                  <span className="rounded-full bg-lime-200 px-1.5 py-0.5 text-[8px] font-black text-emerald-900">To'landi</span>
                </div>
              </div>

              <div className="absolute -right-6 -top-8 w-52 animate-float-slow rounded-2xl border border-white/80 bg-[#fffdf6] p-3 shadow-[0_24px_50px_-24px_rgba(8,31,19,0.5)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 text-lime-300">
                    <Bot size={15} />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">AI maslahatchi</p>
                    <p className="text-[11px] font-extrabold text-emerald-950">Pomidor kasalligi aniqlandi</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
                  Davolash rejasi tayyor. Fungitsid va namlik bo'yicha tavsiya.
                </p>
              </div>

              <div className="absolute -bottom-4 right-6 flex items-center gap-2 rounded-full border border-lime-600/20 bg-lime-400 px-3.5 py-2 text-emerald-950 shadow-lg">
                <BadgeCheck size={15} />
                <span className="text-[10px] font-black">Tekshirilgan sotuvchilar</span>
              </div>
            </div>
          </div>

          {/* STAT STRIP */}
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-white/80 bg-emerald-950/10 shadow-[0_24px_60px_-46px_rgba(8,31,19,0.6)] backdrop-blur-xl sm:grid-cols-4 lg:mt-14">
            {heroStats.map(([value, label], index) => (
              <div key={label} className="bg-[#f8f5ea]/85 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-lime-500' : 'bg-emerald-700/40'}`} />
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-400">{label}</p>
                </div>
                <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-[1.7rem]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-pad">
        <div className="container-page">
          <SectionHeader
            eyebrow="Bo'limlar"
            title="O'zingizga kerakli bo'limni tanlang"
            description="Bozor, xizmatlar, ish o'rinlari va bilimlar — fermer uchun zarur bo'lgan barcha yo'nalishlar."
            action="Barcha bo'limlar"
            actionTo="/bozor"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const to =
                category.id === 'xizmat' || category.id === 'agronom'
                  ? '/xizmatlar'
                  : category.id === 'ish'
                    ? '/ishlar'
                    : `/bozor?tur=${category.id}`
              const count =
                category.id === 'xizmat' || category.id === 'agronom'
                  ? services.filter((service) => (category.id === 'xizmat' ? service.type === 'worker' : service.type === 'agronomist')).length
                  : category.id === 'ish'
                    ? null
                    : products.filter((product) => product.category === category.id).length
              return (
                <Link key={category.id} to={to} className="card hover-lift group relative overflow-hidden p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${category.soft}`}>
                        {category.short}
                      </span>
                      <h3 className="mt-3 text-base font-extrabold text-emerald-950">{category.label}</h3>
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-stone-500">{category.description}</p>
                    </div>
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} text-3xl shadow-[0_18px_30px_-18px_rgba(8,31,19,0.5)]`}>
                      {category.icon}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-emerald-950/[0.06] pt-3 text-[11px] font-bold text-stone-400">
                    <span>{count !== null ? `${count} ta taklif` : 'Yangi imkoniyatlar'}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-950/10 bg-white/70 text-emerald-800 transition group-hover:border-emerald-950 group-hover:bg-emerald-950 group-hover:text-lime-300">
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section-alt">
        <div className="container-page section-pad">
          <SectionHeader
            eyebrow="Top mahsulotlar"
            title="Fermerlar eng ko'p tanlayotgan takliflar"
            description="Tekshirilgan sotuvchilardan agro texnika, yangi hosil va sifatli o'g'itlar."
            action="Bozorga o'tish"
            actionTo="/bozor"
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section-pad">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow-chip mb-3">
                <ShieldCheck size={13} /> Nega AgroServ?
              </span>
              <h2 className="max-w-xl text-[clamp(1.65rem,3vw,2.5rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-emerald-950">
                Har bir bitim orqasida ishonch turadi
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-stone-500">
              Tekshirilgan profillar, shaffof narxlar va xavfsiz to'lov — fermer uchun
              kerakli minimal kafolatlar.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="card-dark hover-lift p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-emerald-950 shadow-[0_14px_28px_-14px_rgba(196,239,69,0.9)]">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/65">{item.text}</p>
                  <div className="mt-4 h-px bg-white/10" />
                  <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-lime-300/70">
                    AgroServ kafolati
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="qanday-ishlaydi" className="relative overflow-hidden rounded-[2rem] bg-emerald-950 text-white sm:mx-3 sm:rounded-[2.75rem] lg:mx-4">
        <div className="pattern-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="container-page section-pad relative">
          <SectionHeader
            light
            center
            eyebrow="Qanday ishlaydi"
            title="Uch qadamda foydalanishni boshlang"
            description="Ro'yxatdan o'tishdan to buyurtmani yakunlashgacha — hammasi sodda va tushunarli."
          />
          <div className="relative grid gap-3 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-lime-300/30 to-transparent md:block" />
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-emerald-950">
                      <Icon size={22} />
                    </span>
                    <span className="text-3xl font-extrabold text-white/10">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/60">{step.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-pad">
        <div className="container-page">
          <SectionHeader
            eyebrow="Mutaxassislar"
            title="Tajribali ustalar va agronomlar"
            description="Yer tekislashdan kasalliklarni aniqlashgacha — kerakli mutaxassisni toping va onlayn band qiling."
            action="Barcha xizmatlar"
            actionTo="/xizmatlar"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {topServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* FREE PLATFORM */}
      <section className="section-alt">
        <div className="container-page section-pad">
          <div className="card-dark p-6 sm:p-8 lg:p-10">
            <div className="pattern-grid absolute inset-0 opacity-20" />
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lime-400/15 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <span className="eyebrow-chip eyebrow-chip-dark">
                  <Sparkles size={13} /> Bepul platforma
                </span>
                <h2 className="mt-4 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold leading-[1.06] tracking-[-0.04em] text-white">
                  AgroServ — obunasiz platforma
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-emerald-100/65">
                  Oylik va yillik obunalar yo'q. E'lon joylash bepul, har bir savdodan 5% komissiya.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link to="/register" className="btn btn-primary">
                    Bepul boshlash <ArrowRight size={16} />
                  </Link>
                  <Link to="/narxlar" className="btn border-white/15 bg-white/5 text-white hover:bg-white/10">
                    Tariflarni ko'rish
                  </Link>
                </div>
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-[11px] text-emerald-100/60">
                  <Package size={15} className="shrink-0 text-lime-300" />
                  Faqat ixtiyoriy xizmat — top mahsulot: 30 kun bozor boshida ko'rsatish.
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {PLATFORM_FEATURES.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
                        <Icon size={18} />
                      </span>
                      <h3 className="mt-3 text-sm font-extrabold text-white">{item.title}</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/55">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="section-pad">
        <div className="container-page">
          <SectionHeader
            eyebrow="Bilim markazi"
            title="Agro bilim videolari"
            description="Yangi texnologiyalar, kasalliklar, o'g'itlash va sug'orish bo'yicha amaliy darslar."
            action="Barcha videolar"
            actionTo="/videolar"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {latestVideos.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={() => navigate('/videolar')} />
            ))}
          </div>
        </div>
      </section>

      {/* STATS + TESTIMONIALS */}
      <section className="section-alt">
        <div className="container-page section-pad">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="card-dark p-6 sm:p-8">
              <div className="pattern-grid absolute inset-0 opacity-20" />
              <div className="relative">
                <span className="eyebrow-chip eyebrow-chip-dark">Ishonch</span>
                <h2 className="mt-4 text-[clamp(1.6rem,2.6vw,2.2rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-white">
                  Har bir raqam — real foydalanuvchi va real bitim
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/60">
                  Platformadagi barcha statistika serverdagi haqiqiy ma'lumotlardan olinadi.
                  Yangi foydalanuvchi qo'shilmaguncha raqamlar o'zgarmaydi.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  {trustStats.map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur">
                      <p className="text-lg font-extrabold text-lime-300">{value}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-emerald-100/50">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid content-start gap-3">
              {reviews.length === 0 ? (
                <div className="card p-6 text-center">
                  <span className="icon-tile mx-auto h-12 w-12 text-2xl">💬</span>
                  <p className="mt-3 text-sm font-extrabold text-emerald-950">Hozircha fikrlar yo'q</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">
                    Birinchi xaridni amalga oshirib, sotuvchi yoki xizmat haqida fikr qoldiring.
                  </p>
                  <Link to="/bozor" className="btn btn-primary btn-sm mt-4">
                    Bozorga o'tish
                  </Link>
                </div>
              ) : (
                reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="card flex gap-4 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-200 text-xl">
                      {review.targetType === 'service' ? '🌿' : '🌾'}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-extrabold text-emerald-950">{review.userName || 'Foydalanuvchi'}</p>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500">
                          {review.targetType === 'service' ? 'Xizmat' : 'Mahsulot'} fikri
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">“{review.comment}”</p>
                      <div className="mt-2 flex gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= review.stars ? 'text-xs' : 'text-xs text-stone-200'}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-lime-300 p-7 shadow-[0_40px_80px_-50px_rgba(111,145,20,0.9)] sm:rounded-[2.5rem] sm:p-10 lg:p-12">
          <div className="pattern-dots absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-emerald-950/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-950">
                <Package size={13} /> Bepul boshlang
              </span>
              <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-emerald-950">
                Bugun ro'yxatdan o'ting — birinchi savdongizni boshlang
              </h2>
              <p className="mt-2.5 text-sm font-medium text-emerald-950/65">
                Fermer, sotuvchi, usta yoki agronom. Har bir rol uchun alohida imkoniyatlar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to={currentUser ? '/kabinet' : '/register'} className="btn btn-dark btn-lg">
                {currentUser ? "Kabinetga o'tish" : "Ro'yxatdan o'tish"} <ArrowRight size={17} />
              </Link>
              <Link to="/narxlar" className="btn btn-secondary btn-lg">
                Tariflarni ko'rish
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
