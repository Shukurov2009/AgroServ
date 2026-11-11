import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Plus,
  Search,
  Send,
  Users,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { JOB_TYPES, REGIONS } from '../lib/constants'
import { formatDate } from '../lib/format'
import PageHero from '../components/PageHero'
import JobCard from '../components/JobCard'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

export default function Jobs() {
  const { jobs, currentUser, addJob, applyToJob, applications } = useStore()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [location, setLocation] = useState('all')
  const [tab, setTab] = useState('all')
  const [applyJob, setApplyJob] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [application, setApplication] = useState({ name: '', phone: '', message: '' })
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    type: "To'liq kun",
    location: 'Toshkent',
    salary: '',
    description: '',
    requirements: '',
    contact: '',
  })

  const myApplications = applications.filter((entry) => entry.userId === currentUser?.id)
  const appliedJobIds = myApplications.map((entry) => entry.jobId)

  const filtered = useMemo(() => {
    let list = [...jobs]
    if (type !== 'all') list = list.filter((job) => job.type === type)
    if (location !== 'all') list = list.filter((job) => job.location === location)
    if (query.trim()) {
      const search = query.toLowerCase()
      list = list.filter((job) =>
        `${job.title} ${job.company} ${job.description} ${job.location}`.toLowerCase().includes(search),
      )
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [jobs, type, location, query])

  function openApply(job) {
    if (!currentUser) {
      toast.error('Ariza yuborish uchun tizimga kiring')
      return
    }
    setApplyJob(job)
    setApplication({
      name: currentUser.name,
      phone: currentUser.phone || '',
      message: '',
    })
  }

  function handleApply(event) {
    event.preventDefault()
    const result = applyToJob(applyJob.id, application)
    if (result.ok) {
      toast.success('Arizangiz yuborildi! Ish beruvchi tez orada bog\'lanadi.')
      setApplyJob(null)
      setApplication({ name: '', phone: '', message: '' })
    } else {
      toast.error(result.error)
    }
  }

  function handleAddJob(event) {
    event.preventDefault()
    if (!currentUser) {
      toast.error("E'lon joylash uchun tizimga kiring")
      return
    }
    const result = addJob(jobForm)
    if (result.ok) {
      toast.success("Ish e'loni joylandi!")
      setAddOpen(false)
      setJobForm({
        title: '',
        company: '',
        type: "To'liq kun",
        location: 'Toshkent',
        salary: '',
        description: '',
        requirements: '',
        contact: '',
      })
    } else {
      toast.error(result.error)
    }
  }

  const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicants || 0), 0)

  return (
    <div>
      <PageHero
        eyebrow="Ish o'rinlari"
        title="Agro sohada ish toping yoki xodim yollang"
        description="Agronom, traktorchi, kombayn operatori, issiqxona mutaxassisi va boshqa yo'nalishlarda ish o'rinlari. Ariza yuboring yoki o'z e'loningizni joylang."
        breadcrumbs={[{ label: "Ish o'rinlari" }]}
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  toast.error("E'lon joylash uchun tizimga kiring")
                  return
                }
                setAddOpen(true)
              }}
              className="btn btn-lime"
            >
              <Plus size={16} /> Ish e'loni joylash
            </button>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-100/70">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{jobs.length} ta e'lon</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{totalApplicants} ta ariza</span>
            </div>
          </>
        }
      />

      <section className="container-page py-8">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              tab === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-stone-600 hover:bg-emerald-50'
            }`}
          >
            <Briefcase size={14} /> Barcha ishlar
            <span className={`rounded-full px-1.5 text-[9px] ${tab === 'all' ? 'bg-white/20' : 'bg-stone-100'}`}>{jobs.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('mine')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              tab === 'mine' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-stone-600 hover:bg-emerald-50'
            }`}
          >
            <ClipboardList size={14} /> Mening arizalarim
            <span className={`rounded-full px-1.5 text-[9px] ${tab === 'mine' ? 'bg-white/20' : 'bg-stone-100'}`}>
              {myApplications.length}
            </span>
          </button>
        </div>

        {tab === 'all' ? (
          <>
            <div className="card mt-4 p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Lavozim, kompaniya yoki kalit so'z..."
                    className="input pl-10"
                  />
                </div>
                <select value={type} onChange={(event) => setType(event.target.value)} className="input w-full sm:w-40">
                  <option value="all">Barcha turlar</option>
                  {JOB_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <select value={location} onChange={(event) => setLocation(event.target.value)} className="input w-full sm:w-44">
                  <option value="all">Barcha hududlar</option>
                  {REGIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-stone-400">
                <span>{filtered.length} ta natija</span>
                {(query || type !== 'all' || location !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setType('all')
                      setLocation('all')
                    }}
                    className="font-bold text-rose-500 hover:text-rose-700"
                  >
                    Filtrni tozalash
                  </button>
                )}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {filtered.map((job) => (
                  <div key={job.id} className="relative">
                    {appliedJobIds.includes(job.id) && (
                      <span className="absolute -top-2 right-3 z-10 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                        <CheckCircle2 size={10} /> Ariza yuborilgan
                      </span>
                    )}
                    <JobCard job={job} onApply={openApply} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon="💼"
                  title="Ish e'loni topilmadi"
                  description="Qidiruv yoki filtrlarni o'zgartirib qayta urinib ko'ring."
                  action="Filtrlarni tozalash"
                  actionTo="/ishlar"
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 grid gap-3">
            {myApplications.length === 0 ? (
              <EmptyState
                icon="📋"
                title="Hozircha ariza yo'q"
                description="Ish e'lonlarini ko'rib chiqing va o'zingizga mosini tanlab ariza yuboring."
                action="Ishlarni ko'rish"
                actionTo="/ishlar"
              />
            ) : (
              myApplications.map((entry) => {
                const job = jobs.find((item) => item.id === entry.jobId)
                return (
                  <div key={entry.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Briefcase size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-black text-emerald-950">{job?.title || "E'lon o'chirilgan"}</p>
                        <p className="text-[11px] text-stone-500">{job?.company || '—'}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-stone-400">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {job?.location || '—'}</span>
                          <span className="flex items-center gap-1"><Send size={10} /> {formatDate(entry.createdAt)}</span>
                        </p>
                        {entry.message && (
                          <p className="mt-2 rounded-lg bg-stone-50 px-2.5 py-1.5 text-[10px] text-stone-500">
                            {entry.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
                      Ko'rib chiqilmoqda
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Users, title: '900+ mutaxassis', text: "Platformada ro'yxatdan o'tgan agro mutaxassislar." },
            { icon: Briefcase, title: "Oson ariza", text: "Bir necha maydon to'ldirib, arizani yuboring." },
            { icon: ClipboardList, title: 'Barcha arizalar', text: "Yuborilgan arizalarni kabinetda kuzatib boring." },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="card flex items-start gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-xs font-black text-emerald-950">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Modal
        open={Boolean(applyJob)}
        onClose={() => setApplyJob(null)}
        title="Ariza yuborish"
        subtitle={applyJob ? `${applyJob.title} · ${applyJob.company}` : ''}
        size="md"
      >
        {applyJob && (
          <form onSubmit={handleApply} className="space-y-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Lavozim haqida</p>
              <p className="mt-1 text-xs font-bold text-emerald-950">{applyJob.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-600">{applyJob.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(applyJob.requirements || []).map((item) => (
                  <span key={item} className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Ism-familiya</label>
                <input
                  value={application.name}
                  onChange={(event) => setApplication({ ...application, name: event.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input
                  value={application.phone}
                  onChange={(event) => setApplication({ ...application, phone: event.target.value })}
                  className="input"
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Qisqa xabar</label>
              <textarea
                value={application.message}
                onChange={(event) => setApplication({ ...application, message: event.target.value })}
                rows={4}
                className="input resize-none"
                placeholder="Tajribangiz va bu lavozimga qiziqishingiz haqida yozing..."
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              <Send size={16} /> Arizani yuborish
            </button>
          </form>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ish e'loni joylash"
        subtitle="E'lon darhol ro'yxatga chiqadi va barcha foydalanuvchilarga ko'rinadi."
        size="lg"
      >
        <form onSubmit={handleAddJob} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Lavozim nomi</label>
              <input
                value={jobForm.title}
                onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })}
                className="input"
                placeholder="Agronom mutaxassisi"
                required
              />
            </div>
            <div>
              <label className="label">Kompaniya / ferma</label>
              <input
                value={jobForm.company}
                onChange={(event) => setJobForm({ ...jobForm, company: event.target.value })}
                className="input"
                placeholder={currentUser?.name || 'AgroFerma Plus'}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Ish turi</label>
              <select
                value={jobForm.type}
                onChange={(event) => setJobForm({ ...jobForm, type: event.target.value })}
                className="input"
              >
                {JOB_TYPES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Hudud</label>
              <select
                value={jobForm.location}
                onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })}
                className="input"
              >
                {REGIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Maosh</label>
              <input
                value={jobForm.salary}
                onChange={(event) => setJobForm({ ...jobForm, salary: event.target.value })}
                className="input"
                placeholder="6 000 000 – 9 000 000 so'm"
              />
            </div>
          </div>
          <div>
            <label className="label">Ish tavsifi</label>
            <textarea
              value={jobForm.description}
              onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })}
              rows={3}
              className="input resize-none"
              placeholder="Vazifalar, sharoitlar va talablar haqida..."
              required
            />
          </div>
          <div>
            <label className="label">Talablar (har biri yangi qatorda)</label>
            <textarea
              value={jobForm.requirements}
              onChange={(event) => setJobForm({ ...jobForm, requirements: event.target.value })}
              rows={3}
              className="input resize-none"
              placeholder={"Agronomiya yo'nalishida ma'lumot\n3 yillik tajriba"}
            />
          </div>
          <div>
            <label className="label">Aloqa uchun telefon</label>
            <input
              value={jobForm.contact}
              onChange={(event) => setJobForm({ ...jobForm, contact: event.target.value })}
              className="input"
              placeholder={currentUser?.phone || '+998 90 123 45 67'}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            <Plus size={16} /> E'lonni joylash
          </button>
        </form>
      </Modal>
    </div>
  )
}
