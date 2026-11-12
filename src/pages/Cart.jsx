import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatNumber, formatSom } from '../lib/format'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'

export default function Cart() {
  const navigate = useNavigate()
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    updateCartQty,
    removeFromCart,
    clearCart,
    currentUser,
    products,
    settings,
  } = useStore()

  const delivery =
    cartItems.length > 0 && cartSubtotal < settings.freeDeliveryFrom ? settings.deliveryFee : 0
  const total = cartSubtotal + delivery
  const remainingForFree = Math.max(0, settings.freeDeliveryFrom - cartSubtotal)

  const recommended = products
    .filter(
      (product) =>
        product.status === 'active' &&
        product.stock > 0 &&
        !cartItems.some((item) => item.id === product.id),
    )
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, 4)

  function handleCheckout() {
    if (!currentUser) {
      toast.error('Buyurtma berish uchun tizimga kiring')
      navigate('/login', { state: { from: '/savat' } })
      return
    }
    navigate('/tolov', { state: { type: 'cart' } })
  }

  async function handleClear() {
    await clearCart()
    toast.success('Savat tozalandi')
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-page py-12">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon="🛒"
            title="Savatingiz bo'sh"
            description="Bozordan mahsulot tanlang — savatga qo'shing va qulay tarzda buyurtma bering."
            action="Bozorga o'tish"
            actionTo="/bozor"
          />
        </div>
        {recommended.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-black text-emerald-950">Sizga yoqishi mumkin</h2>
              <Link to="/bozor" className="text-xs font-bold text-emerald-700">Barchasi →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {recommended.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-cream">
      <div className="container-page py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
              <span className="h-px w-6 bg-emerald-500" /> Savat
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
              Sizning savatingiz
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              {cartCount} ta mahsulot · {cartItems.length} xil tur
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/bozor" className="btn btn-secondary btn-sm">
              Xaridni davom ettirish
            </Link>
            <button type="button" onClick={handleClear} className="btn btn-danger btn-sm">
              <Trash2 size={13} /> Tozalash
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-2.5">
            {cartItems.map((item) => (
              <div key={item.id} className="card flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center">
                <Link to={`/mahsulot/${item.id}`} className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.gradient}`}>
                  <span className="text-3xl drop-shadow">{item.emoji}</span>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={`/mahsulot/${item.id}`} className="line-clamp-1 text-sm font-black text-emerald-950 hover:text-emerald-700">
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-[10px] text-stone-400">
                    {item.sellerName} · {item.region}
                  </p>
                  <p className="mt-1 text-xs font-bold text-emerald-700">
                    {formatNumber(item.price)} so'm
                    <span className="text-[9px] font-medium text-stone-400"> / {item.unit}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-lg border border-stone-200 bg-white">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="flex h-8 w-7 items-center justify-center text-stone-500 hover:text-emerald-700"
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      min={1}
                      max={item.stock}
                      onChange={(event) => updateCartQty(item.id, event.target.value)}
                      className="h-8 w-11 border-x border-stone-100 text-center text-xs font-black text-emerald-950 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="flex h-8 w-7 items-center justify-center text-stone-500 hover:text-emerald-700"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-950">{formatNumber(item.price * item.qty)}</p>
                      <p className="text-[9px] text-stone-400">so'm</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-rose-50 hover:text-rose-500"
                      aria-label="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
              <div className="flex items-start gap-2.5">
                <Truck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div className="flex-1">
                  <p className="text-[11px] font-black text-emerald-950">
                    {remainingForFree > 0
                      ? `Bepul yetkazishga ${formatSom(remainingForFree)} qoldi`
                      : 'Sizga bepul yetkazib berish mavjud!'}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                      style={{ width: `${Math.min(100, (cartSubtotal / settings.freeDeliveryFrom) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                <ShoppingBag size={16} className="text-emerald-600" /> Buyurtma xulosasi
              </h2>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Mahsulotlar ({cartCount})</span>
                  <span className="font-semibold text-emerald-950">{formatSom(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Yetkazib berish</span>
                  <span className={`font-semibold ${delivery === 0 ? 'text-emerald-600' : 'text-emerald-950'}`}>
                    {delivery === 0 ? 'Bepul' : formatSom(delivery)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Promo kod</span>
                  <span className="text-[10px] font-semibold">To'lovda kiritiladi</span>
                </div>
                <div className="my-3 h-px bg-stone-100" />
                <div className="flex items-end justify-between">
                  <span className="text-xs font-black text-emerald-950">Jami</span>
                  <span className="text-xl font-black text-emerald-800">{formatSom(total)}</span>
                </div>
              </div>

              <button type="button" onClick={handleCheckout} className="btn btn-primary mt-4 w-full">
                Buyurtmani rasmiylashtirish <ArrowRight size={16} />
              </button>

              {!currentUser && (
                <p className="mt-2 text-center text-[10px] text-stone-400">
                  Buyurtma berish uchun{' '}
                  <Link to="/login" state={{ from: '/savat' }} className="font-bold text-emerald-700 underline">
                    tizimga kiring
                  </Link>
                </p>
              )}

              <div className="mt-4 space-y-2 border-t border-stone-100 pt-3">
                {[
                  [ShieldCheck, 'Xavfsiz to\'lov', "Karta, hamyon yoki naqd"],
                  [Truck, 'Yetkazib berish', `${formatSom(settings.freeDeliveryFrom)}dan bepul`],
                ].map(([Icon, title, text]) => (
                  <div key={title} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Icon size={13} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-950">{title}</p>
                      <p className="text-[9px] text-stone-400">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-emerald-900/10 bg-white p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-950">
                <ShoppingCart size={13} className="text-emerald-600" /> Yordam kerakmi?
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-stone-500">
                Buyurtma yoki to'lov bo'yicha savollaringiz bo'lsa, qo'llab-quvvatlashga murojaat qiling.
              </p>
              <Link to="/haqida#aloqa" className="mt-2 inline-flex text-[10px] font-bold text-emerald-700 hover:underline">
                Aloqa sahifasi →
              </Link>
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-black text-emerald-950">Savatga qo'shimcha</h2>
              <Link to="/bozor" className="text-xs font-bold text-emerald-700">Barchasi →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {recommended.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
