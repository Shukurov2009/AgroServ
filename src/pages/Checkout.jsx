import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  BadgePercent,
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Landmark,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Target,
  Truck,
  Wallet,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { PLANS, REGIONS, validatePromo } from '../lib/constants'
import { formatNumber, formatSom } from '../lib/format'
import EmptyState from '../components/EmptyState'

const TOPUP_AMOUNTS = [50000, 100000, 250000, 500000, 1000000]

const PAYMENT_LABELS = {
  card: 'Bank kartasi',
  wallet: 'AgroServ hamyoni',
  cash: 'Naqd (yetkazib berishda)',
}

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    currentUser,
    cartItems,
    products,
    services,
    settings,
    checkout,
    purchasePlan,
    topUp,
    promoteProduct,
  } = useStore()

  const config = location.state || {}
  const type = config.type || 'cart'

  const [method, setMethod] = useState('card')
  const [info, setInfo] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    region: REGIONS.includes(currentUser?.region) ? currentUser.region : 'Toshkent',
    address: '',
    note: '',
  })
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState('')
  const [promoError, setPromoError] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', holder: '' })
  const [topupAmount, setTopupAmount] = useState(Number(config.amount) || 100000)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const directProduct = useMemo(() => {
    if (type !== 'direct' || !config.item) return null
    return products.find((product) => product.id === config.item.refId) || null
  }, [type, config.item, products])

  const directService = useMemo(() => {
    if (type !== 'service') return null
    return services.find((service) => service.id === config.serviceId) || null
  }, [type, config.serviceId, services])

  const featureProduct = useMemo(() => {
    if (type !== 'feature') return null
    return products.find((product) => product.id === config.productId) || null
  }, [type, config.productId, products])

  const selectedPlan = type === 'plan' ? PLANS[config.planId] : null
  const billing = config.billing === 'yearly' ? 'yearly' : 'monthly'

  const orderLines = useMemo(() => {
    if (type === 'cart') {
      return cartItems.map((item) => ({
        type: 'product',
        refId: item.id,
        title: item.title,
        emoji: item.emoji,
        gradient: item.gradient,
        price: item.price,
        qty: item.qty,
        unit: item.unit,
        sellerName: item.sellerName,
      }))
    }
    if (type === 'direct' && directProduct) {
      return [
        {
          type: 'product',
          refId: directProduct.id,
          title: directProduct.title,
          emoji: directProduct.emoji,
          gradient: directProduct.gradient,
          price: directProduct.price,
          qty: Number(config.item?.qty) || 1,
          unit: directProduct.unit,
          sellerName: directProduct.sellerName,
        },
      ]
    }
    if (type === 'service' && directService) {
      return [
        {
          type: 'service',
          refId: directService.id,
          title: `${directService.specialization || directService.serviceType} — ${directService.name}`,
          emoji: directService.type === 'worker' ? '🔧' : '🌿',
          gradient: directService.gradient,
          price: directService.price,
          qty: Math.max(1, Number(config.qty) || 1),
          unit: directService.unit,
          sellerName: directService.name,
        },
      ]
    }
    return []
  }, [type, cartItems, directProduct, directService, config.item, config.qty])

  const subtotal = orderLines.reduce((sum, line) => sum + line.price * line.qty, 0)
  const hasProducts = orderLines.some((line) => line.type === 'product')
  const delivery = hasProducts && subtotal < settings.freeDeliveryFrom ? settings.deliveryFee : 0

  const planPrice = selectedPlan
    ? billing === 'yearly'
      ? selectedPlan.yearly
      : selectedPlan.monthly
    : 0
  const featurePrice = settings.featuredPrice
  const promoScope = type === 'plan' ? 'plan' : type === 'feature' ? 'feature' : 'order'
  const promoBase =
    type === 'plan' ? planPrice : type === 'feature' ? featurePrice : subtotal
  const promoCheck = appliedPromo
    ? validatePromo(appliedPromo, promoScope, promoBase)
    : { ok: false, discount: 0 }
  const discount = promoCheck.ok ? promoCheck.discount : 0

  const total =
    type === 'plan'
      ? Math.max(0, planPrice - discount)
      : type === 'feature'
        ? Math.max(0, featurePrice - discount)
        : type === 'topup'
          ? Math.max(0, topupAmount)
          : Math.max(0, subtotal - discount + delivery)

  const walletBalance = currentUser?.wallet || 0
  const insufficientWallet = method === 'wallet' && walletBalance < total
  const isOrder = ['cart', 'direct', 'service'].includes(type)
  function handlePromo(event) {
    event.preventDefault()
    if (!promoInput.trim()) {
      setPromoError('Promo kodni kiriting')
      return
    }
    const result = validatePromo(promoInput, promoScope, promoBase)
    if (result.ok) {
      setAppliedPromo(result.promo.code)
      setPromoError('')
      toast.success(`Promo kod qo'llandi: ${formatSom(result.discount)} chegirma`)
    } else {
      setAppliedPromo('')
      setPromoError(result.error)
      toast.error(result.error)
    }
  }

  function removePromo() {
    setAppliedPromo('')
    setPromoInput('')
    setPromoError('')
  }

  function fillDemoCard() {
    setCard({ number: '8600 1234 5678 9012', expiry: '12/29', holder: currentUser?.name || 'AGROSERV DEMO' })
    toast.success('Demo karta ma\'lumotlari to\'ldirildi')
  }

  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  function formatExpiry(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  function validCard() {
    if (method !== 'card') return true
    const digits = card.number.replace(/\D/g, '')
    const [month, year] = card.expiry.split('/')
    if (digits.length < 16) {
      toast.error('Karta raqamini to\'liq kiriting (16 raqam)')
      return false
    }
    if (!month || !year || Number(month) < 1 || Number(month) > 12 || year.length < 2) {
      toast.error('Amal qilish muddatini MM/YY formatida kiriting')
      return false
    }
    if (card.holder.trim().length < 3) {
      toast.error('Karta egasi ismini kiriting')
      return false
    }
    return true
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (isOrder) {
      if (!info.name.trim() || !info.phone.trim()) {
        toast.error('Ism va telefon raqamini kiriting')
        return
      }
      if (!info.address.trim()) {
        toast.error('Yetkazib berish manzilini kiriting')
        return
      }
    }
    if (type === 'topup' && topupAmount < 10000) {
      toast.error('Minimal to\'ldirish 10 000 so\'m')
      return
    }
    if (insufficientWallet) {
      toast.error('Hamyonda mablag\' yetarli emas')
      return
    }
    if (!validCard()) return

    setSubmitting(true)
    window.setTimeout(() => {
      let result
      if (isOrder) {
        result = checkout({
          items: orderLines.map((line) => ({ type: line.type, refId: line.refId, qty: line.qty })),
          info,
          method,
          promoCode: promoCheck.ok ? appliedPromo : '',
          clearCartAfter: type === 'cart',
        })
        if (result.ok) {
          setSuccess({
            kind: 'order',
            title: 'Buyurtma qabul qilindi!',
            message:
              method === 'cash'
                ? 'Buyurtma yaratildi. To\'lov yetkazib berishda naqd amalga oshiriladi.'
                : 'To\'lov muvaffaqiyatli amalga oshirildi. Sotuvchi tez orada bog\'lanadi.',
            rows: [
              ['Buyurtma raqami', result.order.number],
              ['Mahsulotlar', `${orderLines.length} xil tur`],
              ['Jami summa', formatSom(result.order.total)],
              ['To\'lov usuli', PAYMENT_LABELS[method]],
            ],
          })
        }
      } else if (type === 'plan') {
        result = purchasePlan(config.planId, billing, method, promoCheck.ok ? appliedPromo : '')
        if (result.ok) {
          setSuccess({
            kind: 'plan',
            title: 'Tarif faollashtirildi!',
            message: `${selectedPlan.name} tarifi hisobingizga qo'shildi. Yangi imkoniyatlar darhol ishlaydi.`,
            rows: [
              ['Tarif', `${selectedPlan.name} (${billing === 'yearly' ? 'yillik' : 'oylik'})`],
              ['To\'langan summa', formatSom(result.amount)],
              ['Komissiya', `${selectedPlan.commission}%`],
              ['To\'lov usuli', PAYMENT_LABELS[method]],
            ],
          })
        }
      } else if (type === 'topup') {
        result = topUp(topupAmount, 'card')
        if (result.ok) {
          setSuccess({
            kind: 'topup',
            title: 'Hamyon to\'ldirildi!',
            message: 'Mablag\' hamyoningizga qo\'shildi. Endi xarid yoki obuna uchun ishlatishingiz mumkin.',
            rows: [
              ['To\'ldirilgan summa', formatSom(topupAmount)],
              ['Yangi balans', formatSom(walletBalance + topupAmount)],
              ['To\'lov usuli', 'Bank kartasi'],
            ],
          })
        }
      } else if (type === 'feature') {
        result = promoteProduct(config.productId, method, promoCheck.ok ? appliedPromo : '')
        if (result.ok) {
          setSuccess({
            kind: 'feature',
            title: 'Top ro\'yxatga qo\'shildi!',
            message: `«${featureProduct?.title}» mahsuloti 30 kun davomida bozor boshida ko'rsatiladi.`,
            rows: [
              ['Mahsulot', featureProduct?.title || '—'],
              ['Muddat', '30 kun'],
              ['To\'langan summa', formatSom(result.amount)],
              ['To\'lov usuli', PAYMENT_LABELS[method]],
            ],
          })
        }
      }

      setSubmitting(false)
      if (result && !result.ok) toast.error(result.error)
    }, 850)
  }

  if (success) {
    const actions =
      success.kind === 'order'
        ? [
            ['Buyurtmalarim', '/buyurtmalar'],
            ['Kabinetga o\'tish', '/kabinet'],
          ]
        : success.kind === 'plan'
          ? [
              ['Kabinetga o\'tish', '/kabinet'],
              ['Tariflarni ko\'rish', '/narxlar'],
            ]
          : success.kind === 'topup'
            ? [
                ['Profil va hamyon', '/profil'],
                ['Bozorga o\'tish', '/bozor'],
              ]
            : [
                ['Mening do\'konim', '/dokon'],
                ['Bozorni ko\'rish', '/bozor'],
              ]

    return (
      <div className="soft-gradient">
        <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
          <div className="w-full max-w-lg">
            <div className="card overflow-hidden">
              <div className="relative overflow-hidden bg-emerald-950 px-6 py-8 text-center text-white">
                <div className="pattern-grid absolute inset-0 opacity-30" />
                <div className="relative flex justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400 text-emerald-950 shadow-lg">
                    <CheckCircle2 size={32} />
                  </span>
                </div>
                <h1 className="relative mt-3 text-2xl font-black">{success.title}</h1>
                <p className="relative mx-auto mt-2 max-w-sm text-xs leading-relaxed text-emerald-100/70">
                  {success.message}
                </p>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
                  {success.rows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3 border-b border-emerald-100 py-2 text-xs last:border-0">
                      <span className="text-stone-500">{label}</span>
                      <span className="text-right font-black text-emerald-950">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  {actions.map(([label, to], index) => (
                    <Link
                      key={to}
                      to={to}
                      className={`btn flex-1 ${index === 0 ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-stone-400">
                  <ShieldCheck size={11} /> Demo to'lov muvaffaqiyatli simulyatsiya qilindi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Invalid / empty states
  if (type === 'plan' && !selectedPlan) {
    return (
      <div className="container-page py-14">
        <EmptyState icon="💳" title="Tarif topilmadi" description="Tarifni qaytadan tanlang." action="Tariflar" actionTo="/narxlar" />
      </div>
    )
  }
  if ((type === 'cart' && orderLines.length === 0) || (type === 'direct' && !directProduct) || (type === 'service' && !directService)) {
    return (
      <div className="container-page py-14">
        <EmptyState
          icon="🛒"
          title="To'lov uchun ma'lumot topilmadi"
          description="Savat bo'sh yoki havola eskirgan. Mahsulotni qaytadan tanlang."
          action="Bozorga o'tish"
          actionTo="/bozor"
        />
      </div>
    )
  }
  if (type === 'feature' && !featureProduct) {
    return (
      <div className="container-page py-14">
        <EmptyState icon="⭐" title="Mahsulot topilmadi" description="Top mahsulot xizmatini qaytadan tanlang." action="Mening do'konim" actionTo="/dokon" />
      </div>
    )
  }

  const title =
    type === 'plan'
      ? `${selectedPlan.name} tarifini sotib olish`
      : type === 'topup'
        ? 'Hamyonni to\'ldirish'
        : type === 'feature'
          ? 'Mahsulotni top ro\'yxatga chiqarish'
          : 'Buyurtmani rasmiylashtirish'

  const subtitle =
    type === 'plan'
      ? `${billing === 'yearly' ? 'Yillik' : 'Oylik'} obuna · komissiya ${selectedPlan.commission}%`
      : type === 'topup'
        ? 'Bank kartasi orqali hamyon balansini to\'ldiring'
        : type === 'feature'
          ? '30 kun davomida bozor boshida ko\'rsatish'
          : 'Yetkazib berish ma\'lumotlarini kiriting va to\'lov usulini tanlang'

  const paymentOptions = [
    { id: 'card', label: 'Bank kartasi', hint: 'UzCard, Humo, Visa', icon: CreditCard },
    ...(type === 'topup' ? [] : [{ id: 'wallet', label: 'AgroServ hamyoni', hint: `${formatSom(walletBalance)} mavjud`, icon: Wallet }]),
    ...(isOrder ? [{ id: 'cash', label: 'Naqd', hint: 'Yetkazib berishda', icon: Banknote }] : []),
  ]

  return (
    <div className="bg-cream">
      <div className="container-page py-8">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-sm pl-0">
          <ArrowLeft size={15} /> Orqaga
        </button>
        <div className="mt-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            <span className="h-px w-6 bg-emerald-500" /> Xavfsiz to'lov
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-xs text-stone-500">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-3">
            {isOrder && (
              <div className="card p-5">
                <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                  <Truck size={16} className="text-emerald-600" /> Yetkazib berish ma'lumotlari
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Ism-familiya *</label>
                    <input
                      value={info.name}
                      onChange={(event) => setInfo({ ...info, name: event.target.value })}
                      className="input"
                      placeholder="Aziz Karimov"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Telefon *</label>
                    <input
                      value={info.phone}
                      onChange={(event) => setInfo({ ...info, phone: event.target.value })}
                      className="input"
                      placeholder="+998 90 123 45 67"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Viloyat</label>
                    <select
                      value={info.region}
                      onChange={(event) => setInfo({ ...info, region: event.target.value })}
                      className="input"
                    >
                      {REGIONS.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Manzil *</label>
                    <input
                      value={info.address}
                      onChange={(event) => setInfo({ ...info, address: event.target.value })}
                      className="input"
                      placeholder="Tuman, mahalla, ko'cha"
                      required={isOrder}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="label">Izoh (ixtiyoriy)</label>
                  <textarea
                    value={info.note}
                    onChange={(event) => setInfo({ ...info, note: event.target.value })}
                    rows={2}
                    className="input resize-none"
                    placeholder="Yetkazib berish bo'yicha qo'shimcha izoh..."
                  />
                </div>
              </div>
            )}

            {type === 'topup' && (
              <div className="card p-5">
                <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                  <Wallet size={16} className="text-emerald-600" /> To'ldirish summasi
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {TOPUP_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTopupAmount(amount)}
                      className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${
                        topupAmount === amount
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-300'
                      }`}
                    >
                      {formatNumber(amount)}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="label">Yoki o'z summangiz</label>
                  <input
                    type="number"
                    min={10000}
                    value={topupAmount}
                    onChange={(event) => setTopupAmount(Number(event.target.value) || 0)}
                    className="input"
                  />
                  <p className="mt-1 text-[10px] text-stone-400">Minimal to'ldirish: 10 000 so'm</p>
                </div>
                <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-800">
                  Joriy hamyon balansi: <span className="font-black">{formatSom(walletBalance)}</span>
                </div>
              </div>
            )}

            <div className="card p-5">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                <Landmark size={16} className="text-emerald-600" /> To'lov usuli
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {paymentOptions.map((option) => {
                  const Icon = option.icon
                  const active = method === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMethod(option.id)}
                      className={`flex items-start gap-2 rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                          : 'border-stone-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-black text-emerald-950">{option.label}</span>
                        <span className="block truncate text-[9px] text-stone-400">{option.hint}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {method === 'card' && (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-[11px] font-black text-emerald-950">
                      <Lock size={12} className="text-emerald-600" /> Karta ma'lumotlari
                    </p>
                    <button type="button" onClick={fillDemoCard} className="text-[10px] font-bold text-emerald-700 hover:underline">
                      Demo kartani to'ldirish
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="label">Karta raqami</label>
                      <div className="relative">
                        <CreditCard size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          value={card.number}
                          onChange={(event) => setCard({ ...card, number: formatCardNumber(event.target.value) })}
                          className="input pl-10 tracking-wider"
                          placeholder="8600 0000 0000 0000"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Amal qilish muddati</label>
                      <input
                        value={card.expiry}
                        onChange={(event) => setCard({ ...card, expiry: formatExpiry(event.target.value) })}
                        className="input"
                        placeholder="MM/YY"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className="label">Karta egasi</label>
                      <input
                        value={card.holder}
                        onChange={(event) => setCard({ ...card, holder: event.target.value.toUpperCase() })}
                        className="input uppercase"
                        placeholder="AZIZ KARIMOV"
                      />
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[9px] text-stone-400">
                    <ShieldCheck size={11} /> Demo rejim: karta ma'lumotlari saqlanmaydi va real to'lov amalga oshirilmaydi.
                  </p>
                </div>
              )}

              {method === 'wallet' && (
                <div className={`mt-4 rounded-2xl border p-4 ${insufficientWallet ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-stone-600">Hamyon balansi</span>
                    <span className="font-black text-emerald-950">{formatSom(walletBalance)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-stone-600">To'lov summasi</span>
                    <span className="font-black text-emerald-950">{formatSom(total)}</span>
                  </div>
                  {insufficientWallet ? (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] font-bold text-rose-600">
                        Yetishmayapti: {formatSom(total - walletBalance)}
                      </p>
                      <Link
                        to="/tolov"
                        state={{ type: 'topup', amount: Math.max(10000, total - walletBalance) }}
                        className="text-[10px] font-black text-emerald-700 underline"
                      >
                        Hamyonni to'ldirish →
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-2 text-[10px] font-semibold text-emerald-700">
                      To'lovdan keyin balans: {formatSom(walletBalance - total)}
                    </p>
                  )}
                </div>
              )}

              {method === 'cash' && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-800">
                  Naqd to'lovda buyurtma «To'lov kutilmoqda» holatida yaratiladi. Mahsulotni
                  qabul qilganda kuryerga to'lov qilasiz.
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                <ShoppingBag size={16} className="text-emerald-600" /> Buyurtma tarkibi
              </h2>

              {isOrder ? (
                <div className="mt-3 space-y-2">
                  {orderLines.map((line) => (
                    <div key={`${line.type}-${line.refId}`} className="flex items-center gap-2.5 rounded-xl bg-stone-50 p-2">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${line.gradient}`}>
                        <span className="text-lg">{line.emoji}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[11px] font-bold text-emerald-950">{line.title}</p>
                        <p className="text-[9px] text-stone-400">
                          {line.qty} {line.unit} × {formatNumber(line.price)}
                        </p>
                      </div>
                      <span className="text-[11px] font-black text-emerald-800">{formatNumber(line.price * line.qty)}</span>
                    </div>
                  ))}
                </div>
              ) : type === 'plan' ? (
                <div className="mt-3 rounded-xl bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                      <Crown size={19} />
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-emerald-700">{selectedPlan.name}</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-emerald-950">{selectedPlan.tagline}</p>
                  <ul className="mt-2 space-y-1">
                    {selectedPlan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-[10px] text-emerald-900/80">
                        <Check size={11} className="mt-0.5 shrink-0 text-emerald-600" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : type === 'feature' ? (
                <div className="mt-3 rounded-xl bg-amber-50 p-4">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${featureProduct.gradient} text-2xl`}>
                    {featureProduct.emoji}
                  </span>
                  <p className="mt-2 text-sm font-black text-emerald-950">{featureProduct.title}</p>
                  <p className="text-[10px] text-stone-500">{featureProduct.sellerName} · {featureProduct.region}</p>
                  <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-amber-700">
                    <Target size={12} /> 30 kun bozor boshida
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600">
                    <Wallet size={22} />
                  </span>
                  <p className="mt-2 text-lg font-black text-emerald-950">{formatSom(topupAmount)}</p>
                  <p className="text-[10px] text-stone-500">Hamyon balansiga qo'shiladi</p>
                </div>
              )}

              {type !== 'topup' && (
                <div className="mt-4 border-t border-stone-100 pt-3">
                  {promoCheck.ok ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                        <BadgePercent size={14} /> {appliedPromo}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600">−{formatNumber(discount)}</span>
                        <button type="button" onClick={removePromo} className="text-stone-400 hover:text-rose-500">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        value={promoInput}
                        onChange={(event) => {
                          setPromoInput(event.target.value)
                          setPromoError('')
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handlePromo(event)
                        }}
                        placeholder="Promo kod"
                        className="input h-9 flex-1 py-1.5 text-[11px] uppercase"
                      />
                      <button
                        type="button"
                        onClick={handlePromo}
                        className="btn btn-secondary btn-sm shrink-0"
                      >
                        Qo'llash
                      </button>
                    </div>
                  )}
                  {promoError && <p className="mt-1 text-[9px] font-semibold text-rose-500">{promoError}</p>}
                </div>
              )}

              <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3 text-[11px]">
                {isOrder && (
                  <>
                    <div className="flex justify-between text-stone-500">
                      <span>Mahsulotlar</span>
                      <span className="font-semibold text-emerald-950">{formatSom(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Yetkazib berish</span>
                      <span className={`font-semibold ${delivery === 0 ? 'text-emerald-600' : 'text-emerald-950'}`}>
                        {hasProducts ? (delivery === 0 ? 'Bepul' : formatSom(delivery)) : 'Yo\'q'}
                      </span>
                    </div>
                  </>
                )}
                {type === 'plan' && (
                  <div className="flex justify-between text-stone-500">
                    <span>Obuna narxi</span>
                    <span className="font-semibold text-emerald-950">{formatSom(planPrice)}</span>
                  </div>
                )}
                {type === 'feature' && (
                  <div className="flex justify-between text-stone-500">
                    <span>Top mahsulot narxi</span>
                    <span className="font-semibold text-emerald-950">{formatSom(featurePrice)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Chegirma</span>
                    <span className="font-bold">−{formatSom(discount)}</span>
                  </div>
                )}
                <div className="flex items-end justify-between border-t border-stone-100 pt-2">
                  <span className="font-black text-emerald-950">Jami</span>
                  <span className="text-xl font-black text-emerald-800">{formatSom(total)}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting || insufficientWallet} className="btn btn-primary mt-4 w-full">
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> To'lov amalga oshirilmoqda...
                  </>
                ) : (
                  <>
                    <Lock size={15} /> To'lovni tasdiqlash
                  </>
                )}
              </button>

              <p className="mt-2 flex items-center justify-center gap-1 text-[9px] text-stone-400">
                <ShieldCheck size={11} /> Demo to'lov — real pul yechilmaydi
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-emerald-900/10 bg-white p-4">
              <p className="text-[11px] font-black text-emerald-950">Promo kodlar</p>
              <div className="mt-1.5 space-y-1 text-[10px] text-stone-500">
                <p><span className="font-bold text-emerald-700">AGRO10</span> — buyurtmaga 10% chegirma</p>
                <p><span className="font-bold text-emerald-700">YANGI2026</span> — 50 000 so'm chegirma</p>
                <p><span className="font-bold text-emerald-700">PLUS20</span> — obunaga 20% chegirma</p>
                <p><span className="font-bold text-emerald-700">TOP25</span> — top mahsulotga 5 000 so'm</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
