import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BadgeCheck, Search, SlidersHorizontal, Sparkles, Wrench, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { REGIONS } from '../lib/constants'
import { formatNumber } from '../lib/format'
import PageHero from '../components/PageHero'
import ServiceCard from '../components/ServiceCard'
import EmptyState from '../components/EmptyState'

const TABS = [
  { id: 'worker', label: 'Texnika ustalari', icon: '🔧', description: 'Yer tekislash, shudgor, ekish, kultivatsiya va yig\'im xizmatlari' },
  { id: 'agronomist', label: 'Agronomlar', icon: '🌿', description: 'Kasalliklar, o\'g\'itlash, sug\'orish va hosildorlik bo\'yicha maslahat' },
]

const SORTS = {
  rating: 'Reyting bo\'yicha',
  priceAsc: 'Narx: arzon → qimmat',
  priceDesc: 'Narx: qimmat → arzon',
  experience: 'Tajriba bo\'yicha',
}

export default function Services() {
  const { services } = useStore()
  const [params, setParams] = useSearchParams()
  const type = params.get('tur') === 'agronomist' ? 'agronomist' : 'worker'
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('all')
  const [sort, setSort] = useState('rating')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const filtered = useMemo(() => {
    let list = services.filter((service) => service.type === type && service.status === 'active')
    if (region !== 'all') list = list.filter((service) => service.region === region)
    if (verifiedOnly) list = list.filter((service) => service.verified)
    if (query.trim()) {
      const search = query.toLowerCase()
      list = list.filter((service) =>
        `${service.name} ${service.specialization} ${service.serviceType} ${service.equipment} ${service.region}`
          .toLowerCase()
          .includes(search),
      )
    }
    switch (sort) {
      case 'priceAsc':
        return [...list].sort((a, b) => a.price - b.price)
      case 'priceDesc':
        return [...list].sort((a, b) => b.price - a.price)
      case 'experience':
        return [...list].sort((a, b) => b.experience - a.experience)
      default:
        return [...list].sort((a, b) => b.rating - a.rating)
    }
  }, [services, type, region, verifiedOnly, query, sort])

  function setType(nextType) {
    const next = new URLSearchParams(params)
    if (nextType === 'worker') next.delete('tur')
    else next.set('tur', nextType)
    setParams(next)
  }

  function resetFilters() {
    setQuery('')
    setRegion('all')
    setSort('rating')
    setVerifiedOnly(false)
  }

  const workers = services.filter((service) => service.type === 'worker' && service.status === 'active')
  const agronomists = services.filter((service) => service.type === 'agronomist' && service.status === 'active')
  const avgRating =
    services.length > 0
      ? (services.reduce((sum, service) => sum + service.rating, 0) / services.length).toFixed(1)
      : '0.0'

  return (
    <div>
      <PageHero
        eyebrow="Xizmatlar"
        title="Tajribali ustalar va agronomlar"
        description="Yer tekislashdan kasalliklarni aniqlashgacha — kerakli mutaxassisni toping, narxni hisoblang va onlayn band qiling."
        breadcrumbs={[{ label: 'Xizmatlar' }]}
        actions={
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-100/70">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              {workers.length} ta texnika ustasi
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              {agronomists.length} ta agronom
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              ⭐ O'rtacha {avgRating}
            </span>
          </div>
        }
      />

      <section className="container-page py-8">
        <div className="grid gap-2 sm:grid-cols-2">
          {TABS.map((item) => {
            const active = type === item.id
            const count = item.id === 'worker' ? workers.length : agronomists.length
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-100'
                    : 'border-emerald-900/10 bg-white hover:border-emerald-300'
                }`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${active ? 'bg-white shadow-sm' : 'bg-stone-100'}`}>
                  {item.icon}
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-emerald-950">
                    {item.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${active ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      {count}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">{item.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="card mt-4 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={type === 'worker' ? "Usta, xizmat turi yoki texnika qidiring..." : "Agronom, mutaxassislik yoki hudud qidiring..."}
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
            <select value={region} onChange={(event) => setRegion(event.target.value)} className="input w-full sm:w-44">
              <option value="all">Barcha viloyatlar</option>
              {REGIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="input w-full sm:w-48">
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">
              <SlidersHorizontal size={13} /> Filtr
            </span>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <BadgeCheck size={13} className="text-emerald-500" /> Faqat tekshirilganlar
            </label>
            {(query || region !== 'all' || sort !== 'rating' || verifiedOnly) && (
              <button type="button" onClick={resetFilters} className="text-[10px] font-bold text-rose-500 hover:text-rose-700">
                Filtrni tozalash
              </button>
            )}
            <span className="ml-auto text-[11px] font-semibold text-stone-400">
              {formatNumber(filtered.length)} ta natija
            </span>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon="🔍"
              title="Mutaxassis topilmadi"
              description="Qidiruv yoki filtrlarni o'zgartirib qayta urinib ko'ring."
              action="Filtrlarni tozalash"
              actionTo="/xizmatlar"
            />
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Onlayn band qilish', text: "Xizmatni tanlang, gektar yoki tashrif sonini kiriting va to'lang." },
            { icon: BadgeCheck, title: 'Tekshirilgan mutaxassislar', text: "Tajriba, reyting va mijoz sharhlari asosida tanlang." },
            { icon: Wrench, title: 'Har xil xizmatlar', text: "Shudgor, tekislash, ekish, sug'orish va agronom maslahati." },
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

        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl bg-emerald-950 p-5 text-white sm:flex-row">
          <div>
            <p className="text-sm font-black">Siz ham mutaxassismissiz?</p>
            <p className="mt-0.5 text-[11px] text-emerald-100/60">
              Usta yoki agronom sifatida ro'yxatdan o'ting va mijozlarga xizmatingizni taklif qiling.
            </p>
          </div>
          <Link to="/register" className="btn btn-lime btn-sm shrink-0">
            Xizmat ko'rsatuvchi bo'lish
          </Link>
        </div>
      </section>
    </div>
  )
}
