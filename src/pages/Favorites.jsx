import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, ShoppingBag, Sparkles, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { CATEGORIES } from '../lib/constants'
import { formatNumber } from '../lib/format'
import PageHero from '../components/PageHero'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'

export default function Favorites() {
  const { favoriteIds, products } = useStore()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')

  const favorites = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [products, favoriteIds],
  )

  const categories = useMemo(() => {
    const ids = [...new Set(favorites.map((product) => product.category))]
    return CATEGORIES.filter((item) => ids.includes(item.id))
  }, [favorites])

  const filtered = useMemo(() => {
    let list = favorites
    if (category !== 'all') list = list.filter((product) => product.category === category)
    if (query.trim()) {
      const search = query.toLowerCase()
      list = list.filter((product) =>
        `${product.title} ${product.sellerName} ${product.region}`.toLowerCase().includes(search),
      )
    }
    return list
  }, [favorites, category, query])

  const totalValue = favorites.reduce((sum, product) => sum + product.price, 0)
  const available = favorites.filter((product) => product.status === 'active' && product.stock > 0).length

  return (
    <div>
      <PageHero
        eyebrow="Sevimlilar"
        title="Saqlab qo'yilgan mahsulotlar"
        description="Yoqqan mahsulotlarni saqlang, narxlarni kuzatib boring va qulay paytda xarid qiling. Barchasi brauzeringizda saqlanadi."
        breadcrumbs={[{ label: 'Sevimlilar' }]}
        actions={
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-100/70">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              <Heart size={11} className="mr-1 inline" /> {favorites.length} ta saqlangan
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              {available} ta xarid uchun mavjud
            </span>
            {favorites.length > 0 && (
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                ≈ {formatNumber(totalValue)} so'm
              </span>
            )}
          </div>
        }
      />

      <section className="container-page py-8">
        {favorites.length === 0 ? (
          <div className="mx-auto max-w-2xl">
            <EmptyState
              icon="💚"
              title="Sevimlilar ro'yxati bo'sh"
              description="Bozorda mahsulot kartasidagi yurak belgisini bosing. Saqlangan mahsulotlar shu yerda to'planadi."
              action="Bozorga o'tish"
              actionTo="/bozor"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Heart, title: 'Saqlang', text: "Yurakni bosing — mahsulot shu ro'yxatga tushadi." },
                { icon: Sparkles, title: 'Kuzating', text: 'Narx va mavjudlikni istalgan vaqtda tekshiring.' },
                { icon: ShoppingBag, title: 'Xarid qiling', text: 'Tayyor bo\'lganda savatga bir bosishda qo\'shing.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="card p-4 text-center">
                    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                      <Icon size={17} />
                    </span>
                    <p className="mt-2 text-xs font-black text-emerald-950">{item.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-stone-500">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Sevimlilar orasidan qidirish..."
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
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                    category === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                  }`}
                >
                  Barchasi
                </button>
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                      category === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-emerald-50'
                    }`}
                  >
                    {item.icon} {item.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-stone-400">
              <span>{filtered.length} ta mahsulot ko'rsatilmoqda</span>
              <Link to="/bozor" className="font-bold text-emerald-700 hover:underline">
                Yana mahsulot qidirish →
              </Link>
            </div>

            {filtered.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon="🔍"
                  title="Natija topilmadi"
                  description="Qidiruv yoki kategoriyani o'zgartirib qayta urinib ko'ring."
                  action="Barcha sevimlilar"
                  actionTo="/sevimlilar"
                />
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl bg-emerald-950 p-5 text-white sm:flex-row">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-black">
                  <Sparkles size={15} className="text-lime-300" /> Sevimlilaringiz asosida tanlov
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-100/60">
                  Savatga qo'shing yoki sotuvchi bilan to'g'ridan-to'g'ri bog'laning.
                </p>
              </div>
              <Link to="/bozor" className="btn btn-lime btn-sm shrink-0">
                Bozorga o'tish
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
