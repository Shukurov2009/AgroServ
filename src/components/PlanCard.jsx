import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import { formatNumber, formatSom } from '../lib/format'

const STYLES = {
  free: {
    card: 'border-stone-200 bg-white',
    badge: 'bg-stone-100 text-stone-600',
    iconWrap: 'bg-stone-100 text-stone-600',
    button: 'btn-secondary',
    ring: '',
  },
  plus: {
    card: 'border-emerald-300 bg-white ring-2 ring-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    button: 'btn-primary',
    ring: '',
  },
  pro: {
    card: 'border-violet-200 bg-gradient-to-b from-violet-50/70 to-white',
    badge: 'bg-violet-100 text-violet-700',
    iconWrap: 'bg-violet-100 text-violet-700',
    button: 'btn-dark',
    ring: '',
  },
}

export default function PlanCard({ plan, billing = 'monthly', currentPlanId, onSelect, compact = false }) {
  const style = STYLES[plan.id] || STYLES.free
  const current = currentPlanId === plan.id
  const price = billing === 'yearly' ? plan.yearly : plan.monthly
  const isFree = plan.id === 'free'
  const Icon = plan.id === 'pro' ? Crown : plan.id === 'plus' ? Zap : Sparkles

  return (
    <article
      className={`relative flex flex-col rounded-3xl border p-5 shadow-card transition hover:-translate-y-1 hover:shadow-soft sm:p-6 ${style.card} ${
        plan.popular ? 'lg:scale-[1.02]' : ''
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-lg">
          Eng mashhur
        </span>
      )}
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconWrap}`}>
          <Icon size={21} />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${style.badge}`}>
          {plan.name}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-black text-emerald-950">{plan.name}</h3>
      <p className="mt-1 min-h-[2.5rem] text-xs leading-relaxed text-stone-500">{plan.tagline}</p>

      <div className="mt-4 flex items-end gap-1">
        <span className="text-3xl font-black tracking-tight text-emerald-950">
          {isFree ? 'Bepul' : formatNumber(price)}
        </span>
        {!isFree && <span className="pb-1 text-xs font-semibold text-stone-400">so'm/{billing === 'yearly' ? 'yil' : 'oy'}</span>}
      </div>
      {!isFree && billing === 'yearly' && (
        <p className="mt-1 text-[10px] font-semibold text-emerald-600">
          Oylik to'lovdan {formatNumber(plan.monthly * 12 - plan.yearly)} so'm tejamkor
        </p>
      )}

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

      <ul className={`space-y-2.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-stone-600">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={10} strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-stone-50 px-3 py-2.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-stone-500">Savdo komissiyasi</span>
          <span className="font-black text-emerald-700">{plan.commission}%</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-stone-500">Mahsulot limiti</span>
          <span className="font-bold text-stone-700">{plan.listings === Infinity ? 'Cheksiz' : `${plan.listings} ta`}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={current}
        onClick={() => onSelect?.(plan)}
        className={`btn mt-5 w-full ${style.button} ${current ? 'opacity-60' : ''}`}
      >
        {current ? 'Joriy tarif' : isFree ? 'Bepul boshlash' : 'Tarifni tanlash'}
      </button>
      {!isFree && (
        <p className="mt-2 text-center text-[9px] text-stone-400">
          {formatSom(price)} · istalgan vaqtda bekor qilish mumkin
        </p>
      )}
    </article>
  )
}
