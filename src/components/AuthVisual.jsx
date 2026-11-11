import { BadgeCheck, Bot, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react'
import Logo from './Logo'

const FEATURES = [
  { icon: BadgeCheck, text: "Tekshirilgan sotuvchilar va mutaxassislar" },
  { icon: ShieldCheck, text: "Karta, hamyon va naqd to'lovlar" },
  { icon: Bot, text: "AI agronom maslahati va tahlil" },
  { icon: TrendingUp, text: "Sotuvchi uchun analitika va reklama" },
]

export default function AuthVisual({
  title = 'Agro biznesingizni bir platformada boshqaring',
  subtitle = "Fermer, sotuvchi, texnika ustasi yoki agronom — AgroServ'da har bir rol uchun alohida imkoniyat bor.",
}) {
  return (
    <div className="hero-mesh relative hidden overflow-hidden rounded-3xl p-8 text-white shadow-soft lg:block">
      <div className="pattern-grid absolute inset-0 opacity-50" />
      <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-lime-400/15 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative flex h-full min-h-[560px] flex-col">
        <Logo light />
        <div className="mt-auto pt-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-lime-300">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> 12 000+ fermer ishonchi
          </span>
          <h2 className="mt-4 max-w-md text-balance text-3xl font-black leading-tight tracking-tight">
            {title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-emerald-100/65">{subtitle}</p>

          <ul className="mt-6 space-y-2.5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <li key={feature.text} className="flex items-center gap-2.5 text-xs font-semibold text-emerald-100/80">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
                    <Icon size={13} />
                  </span>
                  {feature.text}
                </li>
              )
            })}
          </ul>

          <div className="mt-7 grid grid-cols-3 gap-2">
            {[
              ['12 000+', 'Fermer'],
              ['8 500+', 'Mahsulot'],
              ['4.9/5', 'Reyting'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-base font-black text-white">{value}</p>
                <p className="text-[9px] font-semibold text-emerald-100/45">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">🌾</span>
            <div>
              <p className="text-[11px] leading-relaxed text-emerald-100/75">
                “AgroServ orqali agronom topdim va hosilni 20% oshirdim. Endi barcha xaridlarim shu yerda.”
              </p>
              <p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-lime-300">
                <CheckCircle2 size={10} /> Aziz Fermer, Samarqand
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
