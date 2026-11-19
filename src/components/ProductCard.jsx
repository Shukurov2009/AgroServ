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
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/25 via-transparent to-transparent" />
        <Link to={`/mahsulot/${product.id}`} className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${compact ? 'text-5xl' : 'text-6xl'} drop-shadow-[0_12px_18px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-110`}
          >
            {product.emoji}
          </span>
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          )}
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.featured && (
            <span className="rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-amber-700 shadow-sm backdrop-blur">
              ⭐ Top
            </span>
          )}
          <span className="rounded-full border border-white/20 bg-emerald-950/35 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur">
            {category?.short || product.category}
          </span>
        </div>
        <button
          type="button"
          onClick={handleFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-stone-400 shadow-sm backdrop-blur transition hover:scale-110 hover:text-rose-500"
          aria-label="Sevimlilarga qo'shish"
        >
          <Heart size={15} className={favorite ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-emerald-900 shadow-sm backdrop-blur">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {(product.rating || 0).toFixed(1)}
          <span className="font-medium text-stone-400">({product.reviewsCount || 0})</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/mahsulot/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-snug text-emerald-950 transition group-hover:text-emerald-700">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-stone-400">
          <MapPin size={11} />
          {product.region}
          <span className="mx-1 h-1 w-1 rounded-full bg-stone-300" />
          {product.sellerName}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-stone-400">Narx</p>
            <p className="text-base font-black text-emerald-800">
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400 text-emerald-950 shadow-[0_10px_20px_-12px_rgba(147,189,27,0.9)] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
            aria-label="Savatga qo'shish"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </article>
  )
}
