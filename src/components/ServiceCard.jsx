import { Link } from 'react-router-dom'
import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { formatNumber, initials } from '../lib/format'

export default function ServiceCard({ service }) {
  const isWorker = service.type === 'worker'
  return (
    <article className="card hover-lift group overflow-hidden">
      <div className={`relative h-24 bg-gradient-to-r ${service.gradient} p-4`}>
        <div className="pattern-grid absolute inset-0 opacity-20" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 text-lg font-black text-white backdrop-blur">
            {initials(service.name)}
          </div>
          <div className="min-w-0 text-white">
            <div className="flex items-center gap-1">
              <h3 className="truncate text-base font-black">{service.name}</h3>
              {service.verified && <BadgeCheck size={15} className="shrink-0 fill-white/20 text-white" />}
            </div>
            <p className="text-xs text-white/80">
              {service.age} yosh · {service.experience} yil tajriba
            </p>
          </div>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-800">
          {isWorker ? 'Texnika ustasi' : 'Agronom'}
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm font-bold text-emerald-950">
          {isWorker ? service.serviceType : service.specialization}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-400">
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

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {(service.rating || 0).toFixed(1)}
              <span className="text-stone-400">({service.reviewsCount || 0})</span>
            </div>
            <p className="mt-1 text-sm font-black text-emerald-700">
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
