import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

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
      className={`mb-8 flex flex-col gap-4 sm:mb-10 ${
        center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className={center ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && (
          <span
            className={`mb-2.5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] ${
              light ? 'text-lime-300' : 'text-emerald-600'
            }`}
          >
            <span className={`h-px w-6 ${light ? 'bg-lime-300' : 'bg-emerald-500'}`} />
            {eyebrow}
          </span>
        )}
        <h2
          className={`text-balance text-2xl font-black leading-tight tracking-tight sm:text-3xl ${
            light ? 'text-white' : 'text-emerald-950'
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-2.5 text-sm leading-relaxed ${light ? 'text-emerald-100/65' : 'text-stone-500'}`}>
            {description}
          </p>
        )}
      </div>
      {action && actionTo && (
        <Link
          to={actionTo}
          className={`group inline-flex shrink-0 items-center gap-1.5 text-xs font-bold transition ${
            light ? 'text-lime-300 hover:text-lime-200' : 'text-emerald-700 hover:text-emerald-900'
          }`}
        >
          {action}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
