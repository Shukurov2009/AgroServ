import { Briefcase, Clock, MapPin, Users } from 'lucide-react'

export default function JobCard({ job, onApply }) {
  return (
    <article className="card hover-lift flex flex-col p-5">
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
        <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          {job.type}
        </span>
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
        <button type="button" onClick={() => onApply?.(job)} className="btn btn-primary btn-sm">
          Ariza yuborish
        </button>
      </div>
    </article>
  )
}
