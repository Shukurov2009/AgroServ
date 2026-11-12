import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatNumber, formatSom, initials } from '../lib/format'
import ServiceCard from '../components/ServiceCard'
import Stars from '../components/Stars'
import EmptyState from '../components/EmptyState'

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { services, reviews, currentUser, addReview } = useStore()
  const service = services.find((entry) => entry.id === id)

  const [qty, setQty] = useState(service?.unit === 'tashrif' ? 1 : 10)
  const [reviewStars, setReviewStars] = useState(5)
  const [comment, setComment] = useState('')

  if (!service) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="🚫"
          title="Xizmat topilmadi"
          description="Ehtimol, xizmat o'chirilgan yoki havola noto'g'ri."
          action="Xizmatlarga qaytish"
          actionTo="/xizmatlar"
        />
      </div>
    )
  }

  const isWorker = service.type === 'worker'
  const serviceReviews = reviews.filter(
    (review) => review.targetType === 'service' && review.targetId === service.id,
  )
  const myReview = serviceReviews.find((review) => review.userId === currentUser?.id)
  const similar = services
    .filter((entry) => entry.type === service.type && entry.id !== service.id && entry.status === 'active')
    .slice(0, 3)

  const subtotal = service.price * qty
  const delivery = 0
  const total = subtotal + delivery

  function handleBook() {
    if (!currentUser) {
      toast.error('Band qilish uchun tizimga kiring')
      navigate('/login', { state: { from: `/xizmatlar/${service.id}` } })
      return
    }
    navigate('/tolov', {
      state: { type: 'service', serviceId: service.id, qty },
    })
  }

  async function handleReview(event) {
    event.preventDefault()
    const result = await addReview({
      targetType: 'service',
      targetId: service.id,
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

  return (
    <div className="bg-cream">
      <div className="container-page py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-stone-400">
          <Link to="/" className="hover:text-emerald-700">Bosh sahifa</Link>
          <span>/</span>
          <Link to="/xizmatlar" className="hover:text-emerald-700">Xizmatlar</Link>
          <span>/</span>
          <Link to={`/xizmatlar?tur=${service.type}`} className="hover:text-emerald-700">
            {isWorker ? 'Texnika ustalari' : 'Agronomlar'}
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-emerald-900">{service.name}</span>
        </div>

        <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mt-3 pl-0">
          <ArrowLeft size={15} /> Orqaga
        </button>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-card">
            <div className={`relative min-h-64 bg-gradient-to-br ${service.gradient} p-6 text-white`}>
              <div className="pattern-grid absolute inset-0 opacity-20" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 text-2xl font-black backdrop-blur">
                    {initials(service.name)}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-2xl font-black leading-tight">{service.name}</h1>
                      {service.verified && <BadgeCheck size={19} className="fill-white/20" />}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-white/80">
                      {service.age} yosh · {service.experience} yil tajriba
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur">
                      {isWorker ? '🔧 Texnika ustasi' : '🌿 Agronom'}
                    </span>
                  </div>
                </div>
                <div className="hidden shrink-0 rounded-xl bg-white/15 p-3 text-center backdrop-blur sm:block">
                  <p className="text-2xl font-black">{service.rating.toFixed(1)}</p>
                  <div className="mt-0.5 flex gap-0.5 text-amber-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={9} className={star <= Math.round(service.rating) ? 'fill-amber-300' : 'fill-white/20 text-white/20'} />
                    ))}
                  </div>
                  <p className="mt-1 text-[9px] font-semibold text-white/70">{service.reviewsCount} sharh</p>
                </div>
              </div>

              <div className="relative mt-5 grid grid-cols-3 gap-2">
                {[
                  ['Bajarilgan', `${service.completedOrders}+ ish`],
                  ['Hudud', service.region],
                  ['Tajriba', `${service.experience} yil`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/15 bg-white/10 p-2.5 text-center backdrop-blur">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-white/60">{label}</p>
                    <p className="mt-0.5 truncate text-[11px] font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              <h2 className="text-sm font-black text-emerald-950">
                {isWorker ? service.serviceType : service.specialization}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{service.description}</p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {isWorker ? (
                  <>
                    <div className="flex items-start gap-2 rounded-xl bg-stone-50 p-3">
                      <Wrench size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Texnika</p>
                        <p className="text-[11px] font-bold text-emerald-950">{service.equipment || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-stone-50 p-3">
                      <Briefcase size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Xizmat turi</p>
                        <p className="text-[11px] font-bold text-emerald-950">{service.serviceType}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 rounded-xl bg-stone-50 p-3">
                      <GraduationCap size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Ma'lumot</p>
                        <p className="text-[11px] font-bold text-emerald-950">{service.education || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-stone-50 p-3">
                      <MessageSquare size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Mutaxassislik</p>
                        <p className="text-[11px] font-bold text-emerald-950">{service.specialization}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`tel:${service.phone}`} className="btn btn-secondary btn-sm flex-1">
                  <Phone size={14} /> {service.phone}
                </a>
                {service.telegram ? (
                  <a
                    href={`https://t.me/${service.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <Send size={14} /> {service.telegram}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <div className="card p-5 sm:p-6">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Narx</p>
                  <p className="mt-0.5 text-2xl font-black text-emerald-800">
                    {formatNumber(service.price)}
                    <span className="ml-1 text-xs font-bold text-emerald-600/70">so'm / {service.unit}</span>
                  </p>
                </div>
                {service.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                    <ShieldCheck size={11} /> Tekshirilgan
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Band qilish kalkulyatori</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      {isWorker ? 'Maydon hajmi' : 'Tashriflar soni'}
                    </p>
                    <p className="text-[10px] text-emerald-700/70">
                      {isWorker ? `Gektar hisobida (1 ${service.unit} = ${formatSom(service.price)})` : `1 tashrif = ${formatSom(service.price)}`}
                    </p>
                  </div>
                  <div className="flex items-center rounded-xl border border-emerald-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setQty((value) => Math.max(1, value - 1))}
                      className="flex h-9 w-8 items-center justify-center text-stone-500 hover:text-emerald-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={qty}
                      min={1}
                      onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
                      className="h-9 w-12 border-x border-emerald-100 text-center text-sm font-black text-emerald-950 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQty((value) => value + 1)}
                      className="flex h-9 w-8 items-center justify-center text-stone-500 hover:text-emerald-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 border-t border-emerald-200/60 pt-3 text-[11px]">
                  <div className="flex justify-between text-emerald-900/70">
                    <span>{formatNumber(service.price)} × {qty} {service.unit}</span>
                    <span className="font-semibold">{formatSom(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-900/70">
                    <span>Xizmat haqi (yetkazish yo'q)</span>
                    <span className="font-semibold">0 so'm</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200/60 pt-1.5 text-sm font-black text-emerald-950">
                    <span>Jami</span>
                    <span>{formatSom(total)}</span>
                  </div>
                </div>

                <button type="button" onClick={handleBook} className="btn btn-primary mt-3 w-full">
                  <Calendar size={16} /> Band qilish va to'lash
                </button>
                <p className="mt-2 flex items-center justify-center gap-1 text-[9px] text-emerald-700/60">
                  <CheckCircle2 size={10} /> To'lovdan keyin mutaxassis siz bilan bog'lanadi
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  ['Xavfsiz to\'lov', 'Karta yoki hamyon orqali'],
                  ['Tekshirilgan usta', `${service.completedOrders}+ muvaffaqiyatli buyurtma`],
                  ['Qulay hudud', service.region],
                ].map(([title, text]) => (
                  <div key={title} className="flex items-center gap-2 rounded-xl bg-stone-50 p-2.5">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-950">{title}</p>
                      <p className="text-[9px] text-stone-400">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="card p-5">
            <h2 className="text-base font-black text-emerald-950">Mijozlar bahosi</h2>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-5xl font-black tracking-tight text-emerald-950">{service.rating.toFixed(1)}</p>
              <div className="pb-1">
                <Stars rating={service.rating} showValue={false} size={16} />
                <p className="mt-1 text-[10px] font-semibold text-stone-400">{serviceReviews.length} ta sharh</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = serviceReviews.filter((review) => review.stars === star).length
                const percent = serviceReviews.length ? (count / serviceReviews.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-[10px]">
                    <span className="flex w-7 items-center gap-0.5 font-bold text-stone-500">
                      {star} <Star size={9} className="fill-amber-400 text-amber-400" />
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-5 text-right font-semibold text-stone-400">{count}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-[10px] leading-relaxed text-emerald-800">
              <ShieldCheck size={13} className="mb-1 text-emerald-600" />
              Xizmat ko'rsatish sifati va muddatlari bo'yicha sharhlar tekshiriladi.
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-black text-emerald-950">Sharhlar</h2>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500">
                {serviceReviews.length} ta
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {serviceReviews.length === 0 && (
                <p className="rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
                  Hozircha sharh yo'q. Xizmatdan foydalanib, birinchi bo'lib fikr bildiring.
                </p>
              )}
              {serviceReviews.map((review) => (
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
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className="transition hover:scale-110"
                      aria-label={`${star} yulduz`}
                    >
                      <Star size={22} className={star <= reviewStars ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={3}
                  placeholder="Xizmat sifati, muddati va mutaxassis haqida yozing..."
                  className="input mt-2 resize-none text-xs"
                />
                <button type="submit" className="btn btn-primary btn-sm mt-2">
                  Sharhni yuborish
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center text-[11px] text-emerald-800">
                Sharh qoldirish uchun <Link to="/login" className="font-bold underline">tizimga kiring</Link>.
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-black text-emerald-950">O'xshash mutaxassislar</h2>
              <Link to={`/xizmatlar?tur=${service.type}`} className="text-xs font-bold text-emerald-700">
                Barchasi →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {similar.map((item) => (
                <ServiceCard key={item.id} service={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
