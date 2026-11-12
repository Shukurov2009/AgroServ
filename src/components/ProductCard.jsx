import { Link } from 'react-router-dom'
import { Heart, MapPin, ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../context/StoreContext'
import { CATEGORIES } from '../lib/constants'
import { formatNumber } from '../lib/format'

export default function ProductCard({ product, compact = false }) {
  const { addToCart, toggleFavorite, favoriteIds } = useStore()
  const favorite = favoriteIds.includes(product.id)
  const category = CATEGORIES.find((item) => item.id === product.category)
  const soldOut = product.stock <= 0

  async function handleFavorite(event) {
    event.preventDefault()
    event.stopPropagation()
    const result = await toggleFavorite(product.id)
    if (result.ok) toast.success(result.added ? 'Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi')
    else toast.error(result.error)
  }

  async function handleAdd(event) {
    event.preventDefault()
    event.stopPropagation()
    const result = await addToCart(product.id, 1)
    if (result.ok) toast.success('Savatga qo\'shildi')
    else toast.error(result.error)
  }

  return (
    <article className="card hover-lift group flex flex-col overflow-hidden">
      <div className={`relative bg-gradient-to-br ${product.gradient} ${compact ? 'h-36' : 'h-44'} overflow-hidden`}>
        <div className="pattern-dots absolute inset-0 opacity-20" />
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <Link to={`/mahsulot/${product.id}`} className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${compact ? 'text-5xl' : 'text-6xl'} drop-shadow-[0_12px_18px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-110`}
          >
            {product.emoji}
          </span>
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.featured && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-600 shadow-sm">
              ⭐ Top
            </span>
          )}
          <span className="rounded-full bg-emerald-950/30 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
            {category?.short || product.category}
          </span>
        </div>
        <button
          type="button"
          onClick={handleFavorite}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-sm transition hover:scale-110 hover:text-rose-500"
          aria-label="Sevimlilarga qo'shish"
        >
          <Heart size={15} className={favorite ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-emerald-900 shadow-sm">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {(product.rating || 0).toFixed(1)}
          <span className="font-medium text-stone-400">({product.reviewsCount || 0})</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/mahsulot/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-emerald-950 transition group-hover:text-emerald-700">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-stone-400">
          <MapPin size={11} />
          {product.region}
          <span className="mx-1 h-1 w-1 rounded-full bg-stone-300" />
          {product.sellerName}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Narx</p>
            <p className="text-base font-black text-emerald-700">
              {formatNumber(product.price)}
              <span className="ml-0.5 text-[10px] font-bold text-stone-400">so'm/{product.unit}</span>
            </p>
            <p className={`mt-0.5 text-[10px] font-semibold ${soldOut ? 'text-rose-500' : 'text-stone-400'}`}>
              {soldOut ? 'Omborda tugagan' : `Omborda: ${formatNumber(product.stock)} ${product.unit}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            aria-label="Savatga qo'shish"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </article>
  )
}
