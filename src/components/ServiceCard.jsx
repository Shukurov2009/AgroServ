import { Link } from 'react-router-dom'
import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { formatNumber, initials } from '../lib/format'

export default function ServiceCard({ service }) {
  const isWorker = service.type === 'worker'
  return (
    <article className="card hover-lift group overflow-hidden">
      <div className="relative h-28 overflow-hidden bg-emerald-950 p-4">
        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-40`} />
        <div className="pattern-grid absolute inset-0 opacity-30" />
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-400/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-lg font-black text-white backdrop-blur">
            {initials(service.name)}
          </div>
          <div className="min-w-0 text-white">
            <div className="flex items-center gap-1">
              <h3 className="truncate text-base font-extrabold">{service.name}</h3>
              {service.verified && <BadgeCheck size={15} className="shrink-0 fill-lime-300/20 text-lime-300" />}
            </div>
            <p className="text-xs text-emerald-100/75">
              {service.age} yosh · {service.experience} yil tajriba
            </p>
          </div>
        </div>
        <span className="absolute right-3 top-3 rounded-full border border-lime-300/30 bg-lime-300/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-lime-200 backdrop-blur">
          {isWorker ? 'Texnika ustasi' : 'Agronom'}
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm font-extrabold text-emerald-950">
          {isWorker ? service.serviceType : service.specialization}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-stone-400">
          <MapPin size={11} /> {service.region}
          {isWorker && service.equipment && (
            <>
              <span className="mx-1 h-1 w-1 rounded-full bg-stone-300" />
              {service.equipment}
            </>
          )}
        </p>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-stone-500">
          {service.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-emerald-950/[0.07] pt-3">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {(service.rating || 0).toFixed(1)}
              <span className="font-semibold text-stone-400">({service.reviewsCount || 0})</span>
            </div>
            <p className="mt-1 text-sm font-black text-emerald-800">
              {formatNumber(service.price)}
              <span className="text-[10px] font-semibold text-stone-400"> so'm/{service.unit}</span>
            </p>
          </div>
          <Link to={`/xizmatlar/${service.id}`} className="btn btn-secondary btn-sm">
            Batafsil
          </Link>
        </div>
      </div>
    </article>
  )
}
