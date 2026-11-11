import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { CATEGORIES, REGIONS } from '../lib/constants'
import { formatNumber } from '../lib/format'
import PageHero from '../components/PageHero'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'

const SORTS = {
  new: 'Yangi qo\'shilganlar',
  priceAsc: 'Narx: arzon → qimmat',
  priceDesc: 'Narx: qimmat → arzon',
  rating: 'Reyting bo\'yicha',
  popular: 'Eng ko\'p sotilgan',
}

export default function Market() {
  const { products } = useStore()
  const [params, setParams] = useSearchParams()
  const category = params.get('tur') || 'all'
  const [query, setQuery] = useState(params.get('q') || '')
  const [region, setRegion] = useState('all')
  const [sort, setSort] = useState('new')
  const [maxPrice, setMaxPrice] = useState('')

  const filtered = useMemo(() => {
    const search = (params.get('q') || '').toLowerCase().trim()
    let list = products.filter((product) => product.status === 'active')
    if (category !== 'all') list = list.filter((product) => product.category === category)
    if (region !== 'all') list = list.filter((product) => product.region === region)
    if (search) {
      list = list.filter((product) =>
        `${product.title} ${product.description} ${product.sellerName} ${product.region}`.toLowerCase().includes(search),
      )
    }
    if (maxPrice) list = list.filter((product) => product.price <= Number(maxPrice))

    switch (sort) {
      case 'priceAsc':
        return [...list].sort((a, b) => a.price - b.price)
      case 'priceDesc':
        return [...list].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating)
      case 'popular':
        return [...list].sort((a, b) => (b.sales || 0) - (a.sales || 0))
      default:
        return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }, [products, category, region, sort, maxPrice, params])

  function applySearch(event) {
    event.preventDefault()
    const next = new URLSearchParams(params)
    if (query.trim()) next.set('q', query.trim())
    else next.delete('q')
    setParams(next)
  }

  function setCategory(id) {
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('tur')
    else next.set('tur', id)
    setParams(next)
  }

  function resetFilters() {
    setQuery('')
    setRegion('all')
    setSort('new')
    setMaxPrice('')
    setParams(new URLSearchParams())
  }

  const activeCategory = CATEGORIES.find((item) => item.id === category)
  const sellers = new Set(products.map((product) => product.sellerId).filter(Boolean)).size

  return (
    <div>
      <PageHero
        eyebrow="Agro bozor"
        title={activeCategory ? activeCategory.label : 'Fermerlar bozori'}
        description={
          activeCategory
            ? activeCategory.description
            : "Agro texnika, yangi meva-sabzavot va sifatli o'g'itlar. Tekshirilgan sotuvchilardan xavfsiz xarid qiling."
        }
        breadcrumbs={[{ label: 'Bozor' }]}
        actions={
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-100/70">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              {products.length} ta mahsulot
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              {sellers} ta sotuvchi
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              {new Set(products.map((product) => product.region)).size} viloyat
            </span>
          </div>
        }
      />

      <section className="container-page py-8">
        <div className="card p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  category === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                Barchasi
              </button>
              {CATEGORIES.filter((item) => ['texnika', 'meva', 'ogit'].includes(item.id)).map((item) => {
                const count = products.filter((product) => product.category === item.id && product.status === 'active').length
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                      category === item.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    <span className={`rounded-full px-1.5 text-[9px] ${category === item.id ? 'bg-white/20' : 'bg-white'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <form onSubmit={applySearch} className="relative w-full lg:max-w-xs">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Mahsulot qidirish..."
                className="input pl-10 pr-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    const next = new URLSearchParams(params)
                    next.delete('q')
                    setParams(next)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label="Tozalash"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">
              <SlidersHorizontal size={13} /> Filtr
            </span>
            <select value={region} onChange={(event) => setRegion(event.target.value)} className="input w-auto py-1.5 text-xs">
              <option value="all">Barcha viloyatlar</option>
              {REGIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="input w-auto py-1.5 text-xs">
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Maks. narx (so'm)"
              className="input w-36 py-1.5 text-xs"
            />
            {(query || region !== 'all' || sort !== 'new' || maxPrice || category !== 'all') && (
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
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon="🔍"
              title="Hech narsa topilmadi"
              description="Qidiruv yoki filtrlarni o'zgartirib qayta urinib ko'ring."
              action="Filtrlarni tozalash"
              actionTo="/bozor"
            />
          </div>
        )}
      </section>
    </div>
  )
}
