import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  MapPin,
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
  { icon: CircleDollarSign, title: 'Xavfsiz to\'lov', text: "Karta, hamyon yoki naqd — barcha to'lovlar tarixi saqlanadi." },
  { icon: Bot, title: 'AI agronom maslahati', text: "Kuniga 50 ta bepul savol — obuna talab qilinmaydi." },
  { icon: Truck, title: 'Yetkazib berish', text: "1 000 000 so'mdan yuqori buyurtmalarga yetkazish bepul." },
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
      <section className="hero-mesh relative overflow-hidden text-white">
        <div className="pattern-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -right-20 top-16 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="container-page relative grid gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/25 bg-lime-300/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-lime-300">
              <Sparkles size={13} /> O'zbekistonning raqamli agro ekotizimi
            </span>

            <h1 className="mt-5 text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]">
              Fermer uchun hamma narsa —{' '}
              <span className="text-gradient">bir joyda.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-emerald-100/70 sm:text-base">
              Agro texnika, yangi meva-sabzavot, o'g'itlar, tajribali ustalar va agronomlar.
              Sotib oling, soting, xizmat yollang va AI maslahat oling.
            </p>

            <form onSubmit={handleSearch} className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-1.5 backdrop-blur-md">
              <Search size={18} className="ml-2.5 shrink-0 text-emerald-100/60" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Traktor, olma, karbamid yoki agronom qidiring..."
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-emerald-100/40"
              />
              <button type="submit" className="btn btn-lime btn-sm shrink-0 sm:btn">
                Qidirish <ArrowRight size={15} />
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100/40">Mashhur:</span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/bozor?q=${encodeURIComponent(tag)}`)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-emerald-100/70 transition hover:border-lime-300/40 hover:text-lime-200"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link to="/bozor" className="btn btn-lime btn-lg">
                Bozorni ko'rish <ArrowRight size={17} />
              </Link>
              <Link to="/haqida" className="btn btn-lg border-white/15 bg-white/5 text-white hover:bg-white/10">
                Platforma haqida
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.map(([value, label]) => (
                <div key={label}>
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-[10px] font-semibold text-emerald-100/45">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative mx-auto hidden w-full max-w-md lg:block">
            <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-lime-400/20 blur-3xl" />
            <div className="absolute -right-6 bottom-0 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative animate-float-slow rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.4rem] bg-emerald-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/45">Platforma savdosi</p>
                    <p className="mt-1 text-2xl font-black text-white">{formatNumber(totalRevenue)} so'm</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-lime-400/15 px-2 py-1 text-[10px] font-bold text-lime-300">
                    <TrendingUp size={11} /> {formatNumber(orders.length)} buyurtma
                  </span>
                </div>

                <div className="mt-4 flex h-24 items-end gap-2">
                  {weeklyBars.map((value, index) => (
                    <div key={index} className="flex-1">
                      <div
                        className="rounded-t-md bg-gradient-to-t from-emerald-500/40 to-lime-300"
                        style={{ height: `${Math.max(4, Math.round((value / maxBar) * 100))}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[8px] font-semibold text-emerald-100/35">
                  {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-100/40">Buyurtmalar</p>
                    <p className="mt-1 text-lg font-black text-white">{formatNumber(orders.length)}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-100/40">Foydalanuvchilar</p>
                    <p className="mt-1 text-lg font-black text-white">{formatNumber(users.length)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-10 top-24 w-48 animate-float rounded-2xl border border-white/20 bg-white p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-lg">🍎</span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Yangi buyurtma</p>
                  <p className="text-xs font-black text-emerald-950">Olma Fuji · 100 kg</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700">800 000 so'm</span>
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">To'landi</span>
              </div>
            </div>

            <div className="absolute -right-8 bottom-16 w-52 animate-float-slow rounded-2xl border border-white/20 bg-white p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Bot size={16} />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">AI maslahatchi</p>
                  <p className="text-[11px] font-black text-emerald-950">Pomidor kasalligi aniqlandi</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
                Davolash rejasi tayyor. Fungitsid va namlik bo'yicha tavsiya.
              </p>
            </div>

            <div className="absolute -bottom-3 left-10 flex items-center gap-2 rounded-xl border border-white/20 bg-lime-400 px-3 py-2 text-emerald-950 shadow-lg">
              <BadgeCheck size={15} />
              <span className="text-[10px] font-black">Tekshirilgan sotuvchilar</span>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4 text-[10px] font-semibold text-emerald-100/45">
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-lime-300" /> Xavfsiz to'lov</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={13} className="text-lime-300" /> Tekshirilgan sotuvchilar</span>
            <span className="flex items-center gap-1.5"><Truck size={13} className="text-lime-300" /> Tezkor yetkazish</span>
            <span className="flex items-center gap-1.5"><Bot size={13} className="text-lime-300" /> AI agronom</span>
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-lime-300" /> 14 viloyat</span>
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
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${category.soft}`}>
                        {category.short}
                      </span>
                      <h3 className="mt-3 text-base font-black text-emerald-950">{category.label}</h3>
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-stone-500">{category.description}</p>
                    </div>
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} text-3xl shadow-lg`}>
                      {category.icon}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-stone-400">
                    <span>{count !== null ? `${count} ta taklif` : 'Yangi imkoniyatlar'}</span>
                    <span className="flex items-center gap-1 text-emerald-700 transition group-hover:gap-2">
                      Kirish <ChevronRight size={13} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-white/60">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="card hover-lift p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-3 text-sm font-black text-emerald-950">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="qanday-ishlaydi" className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="pattern-dots absolute inset-0 opacity-[0.08]" />
        <div className="container-page section-pad relative">
          <SectionHeader
            light
            center
            eyebrow="Qanday ishlaydi"
            title="Uch qadamda foydalanishni boshlang"
            description="Ro'yxatdan o'tishdan to buyurtmani yakunlashgacha — hammasi sodda va tushunarli."
          />
          <div className="relative grid gap-5 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-lime-300/30 to-transparent md:block" />
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
                      <Icon size={22} />
                    </span>
                    <span className="text-3xl font-black text-white/10">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-black text-white">{step.title}</h3>
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
      <section className="bg-white/60">
        <div className="container-page section-pad">
          <SectionHeader
            eyebrow="Bepul platforma"
            title="AgroServ — obunasiz platforma"
            description="Oylik va yillik obunalar yo'q. E'lon joylash bepul, har bir savdodan 5% komissiya."
            action="Batafsil"
            actionTo="/narxlar"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Store, title: "Cheksiz e'lonlar", text: "Mahsulot va xizmatlarni cheklovsiz joylang." },
              { icon: CircleDollarSign, title: '5% komissiya', text: "Savdo summasining 95% sotuvchiga qoladi." },
              { icon: Bot, title: 'Bepul AI', text: 'Kuniga 50 ta agronomik savol.' },
              { icon: Sparkles, title: 'Bepul hamyon', text: "To'lovlar va buyurtmalar bitta joyda." },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="card p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-3 text-sm font-black text-emerald-950">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.text}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-700">
                <Sparkles size={20} />
              </span>
              <div>
                <p className="text-sm font-black text-emerald-950">Faqat ixtiyoriy xizmat — top mahsulot</p>
                <p className="text-[11px] text-stone-500">30 kun bozor boshida ko'rsatish. Asosiy imkoniyatlar bepul.</p>
              </div>
            </div>
            <Link to="/narxlar" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
              Batafsil →
            </Link>
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
      <section className="bg-white/60">
        <div className="container-page section-pad">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Ishonch</span>
              <h2 className="mt-2.5 text-2xl font-black leading-tight text-emerald-950 sm:text-3xl">
                Har bir raqam — real foydalanuvchi va real bitim
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                Platformadagi barcha statistika serverdagi haqiqiy ma'lumotlardan olinadi.
                Yangi foydalanuvchi qo'shilmaguncha raqamlar o'zgarmaydi.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {trustStats.map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-emerald-900/10 bg-white p-3">
                    <p className="text-lg font-black text-emerald-950">{value}</p>
                    <p className="text-[10px] font-semibold text-stone-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-1">
              {reviews.length === 0 ? (
                <div className="card p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                    💬
                  </span>
                  <p className="mt-2 text-sm font-black text-emerald-950">Hozircha fikrlar yo'q</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">
                    Birinchi xaridni amalga oshirib, sotuvchi yoki xizmat haqida fikr qoldiring.
                  </p>
                  <Link to="/bozor" className="btn btn-primary btn-sm mt-3">
                    Bozorga o'tish
                  </Link>
                </div>
              ) : (
                reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="card flex gap-4 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-lime-100 text-xl">
                      {review.targetType === 'service' ? '🌿' : '🌾'}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-emerald-950">{review.userName || 'Foydalanuvchi'}</p>
                        <span className="text-[10px] font-semibold text-stone-400">
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
      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-7 text-white shadow-soft sm:p-10">
          <div className="pattern-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-lime-300">
                <Package size={13} /> Bepul boshlang
              </span>
              <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                Bugun ro'yxatdan o'ting — birinchi savdongizni boshlang
              </h2>
              <p className="mt-2 text-sm text-emerald-100/65">
                Fermer, sotuvchi, usta yoki agronom. Har bir rol uchun alohida imkoniyatlar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to={currentUser ? '/kabinet' : '/register'} className="btn btn-lime btn-lg">
                {currentUser ? 'Kabinetga o\'tish' : "Ro'yxatdan o'tish"} <ArrowRight size={17} />
              </Link>
              <Link to="/narxlar" className="btn btn-lg border-white/20 bg-white/5 text-white hover:bg-white/10">
                Tariflarni ko'rish
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
