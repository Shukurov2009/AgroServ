import { Briefcase, Clock, MapPin, Pause, Play, Trash2, Users } from 'lucide-react'

export default function JobCard({ job, onApply, onToggle, onDelete, canManage = false }) {
  const paused = job.status !== 'active'

  return (
    <article className={`card hover-lift flex flex-col p-5 ${paused ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-lime-100 text-emerald-700">
            <Briefcase size={19} />
          </span>
          <div>
            <h3 className="text-base font-black leading-snug text-emerald-950">{job.title}</h3>
            <p className="mt-0.5 text-xs font-semibold text-stone-500">{job.company}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
            {job.type}
          </span>
          {paused && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
              Qaytarib olingan
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-400">
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} /> {job.applicants} ariza
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> Yangi
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-stone-500">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(job.requirements || []).slice(0, 3).map((requirement) => (
          <span key={requirement} className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-semibold text-stone-500">
            {requirement}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2 border-t border-stone-100 pt-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Maosh</p>
          <p className="text-sm font-black text-emerald-700">{job.salary}</p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap justify-end gap-1.5">
            <button type="button" onClick={() => onToggle?.(job)} className="btn btn-secondary btn-sm">
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? 'Faollashtirish' : 'Qaytarib olish'}
            </button>
            <button type="button" onClick={() => onDelete?.(job)} className="btn btn-danger btn-sm">
              <Trash2 size={12} /> O'chirish
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onApply?.(job)}
            disabled={paused}
            className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ariza yuborish
          </button>
        )}
      </div>
    </article>
  )
}
