import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Heart,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../context/StoreContext'
import { CATEGORIES } from '../lib/constants'
import { formatNumber, formatSom, initials } from '../lib/format'
import ProductCard from '../components/ProductCard'
import Stars from '../components/Stars'
import EmptyState from '../components/EmptyState'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    products,
    users,
    reviews,
    currentUser,
    addToCart,
    toggleFavorite,
    favoriteIds,
    addReview,
    settings,
  } = useStore()

  const product = products.find((entry) => entry.id === id)
  const seller = product ? users.find((user) => user.id === product.sellerId) : null
  const [qty, setQty] = useState(1)
  const [reviewStars, setReviewStars] = useState(5)
  const [comment, setComment] = useState('')

  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="🚫"
          title="Mahsulot topilmadi"
          description="Ehtimol, mahsulot o'chirilgan yoki havola noto'g'ri."
          action="Bozorga qaytish"
          actionTo="/bozor"
        />
      </div>
    )
  }

  const category = CATEGORIES.find((item) => item.id === product.category)
  const productReviews = reviews.filter(
    (review) => review.targetType === 'product' && review.targetId === product.id,
  )
  const myReview = productReviews.find((review) => review.userId === currentUser?.id)
  const favorite = favoriteIds.includes(product.id)
  const similar = products
    .filter((entry) => entry.category === product.category && entry.id !== product.id && entry.status === 'active')
    .slice(0, 4)
  const soldOut = product.stock <= 0

  function handleAdd() {
    const result = addToCart(product.id, qty)
    if (result.ok) toast.success(`${qty} ${product.unit} savatga qo'shildi`)
    else toast.error(result.error)
  }

  function handleBuyNow() {
    if (!currentUser) {
      toast.error('Buyurtma berish uchun tizimga kiring')
      navigate('/login', { state: { from: `/mahsulot/${product.id}` } })
      return
    }
    navigate('/tolov', {
      state: { type: 'direct', item: { type: 'product', refId: product.id, qty } },
    })
  }

  function handleFavorite() {
    const result = toggleFavorite(product.id)
    if (result.ok) toast.success(result.added ? 'Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi')
    else toast.error(result.error)
  }

  function handleReview(event) {
    event.preventDefault()
    const result = addReview({
      targetType: 'product',
      targetId: product.id,
      stars: reviewStars,
      comment,
    })
    if (result.ok) {
      toast.success('Sharhingiz saqlandi. Rahmat!')
      setComment('')
    } else {
      toast.error(result.error)
    }
  }

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviews.filter((review) => review.stars === star).length,
  }))

  return (
    <div className="bg-cream">
      <div className="container-page py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-stone-400">
          <Link to="/" className="hover:text-emerald-700">Bosh sahifa</Link>
          <span>/</span>
          <Link to="/bozor" className="hover:text-emerald-700">Bozor</Link>
          <span>/</span>
          <Link to={`/bozor?tur=${product.category}`} className="hover:text-emerald-700">{category?.label}</Link>
          <span>/</span>
          <span className="line-clamp-1 text-emerald-900">{product.title}</span>
        </div>

        <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mt-3 pl-0">
          <ArrowLeft size={15} /> Orqaga
        </button>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* VISUAL */}
          <div className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-card">
            <div className={`relative flex h-72 items-center justify-center bg-gradient-to-br ${product.gradient} sm:h-96`}>
              <div className="pattern-dots absolute inset-0 opacity-20" />
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
              <span className="relative text-[120px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.2)] sm:text-[150px]">
                {product.emoji}
              </span>
              {product.featured && (
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-600 shadow">
                  ⭐ Top mahsulot
                </span>
              )}
              <button
                type="button"
                onClick={handleFavorite}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow transition hover:scale-105 hover:text-rose-500"
              >
                <Heart size={18} className={favorite ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-4">
              {[
                ['Kategoriya', category?.label || product.category, category?.icon || '🌱'],
                ['Hudud', product.region, '📍'],
                ['Holat', soldOut ? 'Tugagan' : 'Mavjud', soldOut ? '⛔' : '✅'],
              ].map(([label, value, icon]) => (
                <div key={label} className="rounded-xl bg-stone-50 p-2.5 text-center">
                  <p className="text-lg">{icon}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-stone-400">{label}</p>
                  <p className="mt-0.5 truncate text-[10px] font-bold text-emerald-950">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div>
            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${category?.soft}`}>
                  {category?.icon} {category?.label}
                </span>
                {product.condition && (
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700">
                    {product.condition}
                  </span>
                )}
                {product.year && (
                  <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[9px] font-bold text-sky-700">
                    {product.year} yil
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-emerald-950 sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                <Stars rating={product.rating} count={product.reviewsCount} />
                <span className="text-[10px] text-stone-300">|</span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                  <MapPin size={12} /> {product.region}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                  <Package size={12} /> {formatNumber(product.sales)} ta sotilgan
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.description}</p>

              <div className="mt-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Narx</p>
                    <p className="mt-0.5 text-2xl font-black text-emerald-800">
                      {formatNumber(product.price)}
                      <span className="ml-1 text-xs font-bold text-emerald-600/70">so'm / {product.unit}</span>
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${soldOut ? 'bg-rose-100 text-rose-600' : 'bg-white text-emerald-700'}`}>
                    {soldOut ? 'Omborda tugagan' : `Omborda ${formatNumber(product.stock)} ${product.unit}`}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center rounded-xl border border-emerald-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setQty((value) => Math.max(1, value - 1))}
                      className="flex h-10 w-9 items-center justify-center text-stone-500 hover:text-emerald-700"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      min={1}
                      max={product.stock}
                      onChange={(event) => setQty(Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)))}
                      className="h-10 w-14 border-x border-emerald-100 text-center text-sm font-black text-emerald-950 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQty((value) => Math.min(product.stock, value + 1))}
                      className="flex h-10 w-9 items-center justify-center text-stone-500 hover:text-emerald-700"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button type="button" onClick={handleAdd} disabled={soldOut} className="btn btn-secondary flex-1">
                    <ShoppingCart size={16} /> Savatga
                  </button>
                  <button type="button" onClick={handleBuyNow} disabled={soldOut} className="btn btn-primary flex-1">
                    Sotib olish
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-3">
                  <Truck size={17} className="text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-950">Yetkazib berish</p>
                    <p className="text-[9px] text-stone-400">
                      {formatSom(settings.freeDeliveryFrom)}dan bepul
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-3">
                  <ShieldCheck size={17} className="text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-950">Xavfsiz to'lov</p>
                    <p className="text-[9px] text-stone-400">Karta yoki hamyon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SELLER */}
            <div className="card mt-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-lime-100 text-base font-black text-emerald-700">
                    {seller?.avatar || initials(product.sellerName)}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Sotuvchi</p>
                    <p className="flex items-center gap-1 text-sm font-black text-emerald-950">
                      {product.sellerName}
                      <BadgeCheck size={14} className="text-emerald-500" />
                    </p>
                    <p className="text-[10px] text-stone-400">{seller?.region || product.region}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  Tekshirilgan
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={`tel:${product.sellerPhone}`} className="btn btn-secondary btn-sm">
                  <Phone size={14} /> Qo'ng'iroq
                </a>
                {product.sellerTelegram ? (
                  <a
                    href={`https://t.me/${product.sellerTelegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Send size={14} /> Telegram
                  </a>
                ) : (
                  <button type="button" className="btn btn-secondary btn-sm" disabled>
                    <Send size={14} /> Telegram
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="card p-5">
            <h2 className="text-base font-black text-emerald-950">Mijozlar bahosi</h2>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-5xl font-black tracking-tight text-emerald-950">
                {(product.rating || 0).toFixed(1)}
              </p>
              <div className="pb-1">
                <Stars rating={product.rating} showValue={false} size={16} />
                <p className="mt-1 text-[10px] font-semibold text-stone-400">
                  {productReviews.length} ta sharh
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {ratingBuckets.map((bucket) => {
                const percent = productReviews.length ? (bucket.count / productReviews.length) * 100 : 0
                return (
                  <div key={bucket.star} className="flex items-center gap-2 text-[10px]">
                    <span className="flex w-7 items-center gap-0.5 font-bold text-stone-500">
                      {bucket.star} <Star size={9} className="fill-amber-400 text-amber-400" />
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-5 text-right font-semibold text-stone-400">{bucket.count}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-[10px] leading-relaxed text-emerald-800">
              <CheckCircle2 size={13} className="mb-1 text-emerald-600" />
              Faqat xarid qilgan foydalanuvchilar sharh qoldirishi tavsiya etiladi.
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-black text-emerald-950">Sharhlar</h2>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500">
                {productReviews.length} ta
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {productReviews.length === 0 && (
                <p className="rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
                  Hozircha sharh yo'q. Birinchi bo'lib fikringizni qoldiring!
                </p>
              )}
              {productReviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-emerald-700 shadow-sm">
                        {initials(review.userName)}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">{review.userName}</p>
                        <p className="text-[9px] text-stone-400">{new Date(review.createdAt).toLocaleDateString('uz-UZ')}</p>
                      </div>
                    </div>
                    <Stars rating={review.stars} showValue={false} size={11} />
                  </div>
                  {review.comment && <p className="mt-2 text-xs leading-relaxed text-stone-600">{review.comment}</p>}
                </div>
              ))}
            </div>

            {currentUser ? (
              <form onSubmit={handleReview} className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <h3 className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <MessageSquare size={14} /> {myReview ? 'Sharhingizni yangilang' : 'Sharh qoldiring'}
                </h3>
                {myReview && (
                  <p className="mt-1 text-[10px] text-emerald-700">
                    Siz avval {myReview.stars} yulduz bilan baho bergansiz. Yangi sharh eskisini almashtiradi.
                  </p>
                )}
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className="text-2xl transition hover:scale-110"
                      aria-label={`${star} yulduz`}
                    >
                      <Star
                        size={22}
                        className={star <= reviewStars ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={3}
                  placeholder="Mahsulot sifati, yetkazib berish va xizmat haqida yozing..."
                  className="input mt-2 resize-none text-xs"
                />
                <button type="submit" className="btn btn-primary btn-sm mt-2">
                  Sharhni yuborish
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center text-[11px] text-emerald-800">
                Sharh qoldirish uchun{' '}
                <Link to="/login" className="font-bold underline">tizimga kiring</Link>.
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-black text-emerald-950">O'xshash mahsulotlar</h2>
              <Link to={`/bozor?tur=${product.category}`} className="text-xs font-bold text-emerald-700">
                Barchasi →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {similar.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
