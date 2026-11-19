import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  actionTo,
  center = false,
  light = false,
}) {
  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:mb-11 ${
        center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className={center ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && (
          <span
            className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
              light
                ? 'border-lime-300/25 bg-lime-300/10 text-lime-300'
                : 'border-emerald-950/10 bg-white/60 text-emerald-800 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-lime-300' : 'bg-lime-500'}`} />
            {eyebrow}
          </span>
        )}
        <h2
          className={`text-balance text-[clamp(1.65rem,3vw,2.5rem)] font-extrabold leading-[1.08] tracking-[-0.04em] ${
            light ? 'text-white' : 'text-emerald-950'
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-3 max-w-xl text-sm leading-relaxed ${light ? 'text-emerald-100/65' : 'text-stone-500'}`}>
            {description}
          </p>
        )}
      </div>
      {action && actionTo && (
        <Link
          to={actionTo}
          className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-extrabold transition ${
            light
              ? 'border-white/15 bg-white/5 text-lime-300 hover:border-lime-300/40 hover:bg-white/10'
              : 'border-emerald-950/10 bg-white/70 text-emerald-800 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] hover:border-lime-500/50 hover:bg-white'
          }`}
        >
          {action}
          <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
