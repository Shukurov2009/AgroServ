const TONES = {
  emerald: {
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-950',
    accent: 'from-emerald-400 to-lime-400',
  },
  sky: {
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-emerald-950',
    accent: 'from-sky-400 to-cyan-400',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-emerald-950',
    accent: 'from-amber-400 to-orange-400',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-700',
    value: 'text-emerald-950',
    accent: 'from-violet-400 to-purple-400',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-700',
    value: 'text-emerald-950',
    accent: 'from-rose-400 to-orange-400',
  },
}

export default function StatCard({ icon, label, value, hint, tone = 'emerald' }) {
  const style = TONES[tone] || TONES.emerald
  return (
    <div className="card relative overflow-hidden p-4 sm:p-5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">{label}</p>
          <p className={`mt-2 text-2xl font-black tracking-tight ${style.value}`}>{value}</p>
          {hint && <p className="mt-1 text-[11px] text-stone-500">{hint}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          {icon}
        </span>
      </div>
    </div>
  )
}
