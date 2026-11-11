import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  children,
  dark = true,
  actions,
}) {
  return (
    <section
      className={`relative overflow-hidden ${dark ? 'hero-mesh text-white' : 'soft-gradient border-b border-emerald-950/5'}`}
    >
      {dark && <div className="pattern-grid absolute inset-0 opacity-60" />}
      {dark && <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-lime-400/10 blur-3xl" />}
      {dark && <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />}

      <div className="container-page relative py-12 sm:py-16 lg:py-20">
        <nav className={`mb-5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold ${dark ? 'text-emerald-100/55' : 'text-stone-500'}`}>
          <Link to="/" className="flex items-center gap-1 transition hover:text-lime-300">
            <Home size={12} /> Bosh sahifa
          </Link>
          {breadcrumbs.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="opacity-50" />
              {item.to ? (
                <Link to={item.to} className="transition hover:text-lime-300">
                  {item.label}
                </Link>
              ) : (
                <span className={dark ? 'text-white/85' : 'text-emerald-900'}>{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            {eyebrow && (
              <span
                className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                  dark
                    ? 'border-lime-300/25 bg-lime-300/10 text-lime-300'
                    : 'border-emerald-200 bg-white text-emerald-700'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {eyebrow}
              </span>
            )}
            <h1
              className={`text-balance text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[46px] ${
                dark ? 'text-white' : 'text-emerald-950'
              }`}
            >
              {title}
            </h1>
            {description && (
              <p
                className={`mt-4 max-w-2xl text-sm leading-relaxed sm:text-base ${
                  dark ? 'text-emerald-100/70' : 'text-stone-600'
                }`}
              >
                {description}
              </p>
            )}
            {actions && <div className="mt-6 flex flex-wrap gap-2.5">{actions}</div>}
          </div>
          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
    </section>
  )
}
