import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Eye,
  Film,
  Plus,
  Search,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { VIDEO_CATEGORIES } from '../lib/constants'
import { getVideoEmbed } from '../lib/format'
import PageHero from '../components/PageHero'
import VideoCard from '../components/VideoCard'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

const EMOJIS = ['🎬', '💧', '🌾', '🍅', '🚜', '🍎', '🐄', '🌱', '🧪', '🌿']
const GRADIENTS = [
  'from-emerald-400 via-green-500 to-teal-600',
  'from-sky-400 via-cyan-500 to-blue-600',
  'from-amber-300 via-orange-400 to-yellow-500',
  'from-rose-400 via-red-500 to-orange-500',
  'from-violet-400 via-purple-500 to-indigo-600',
]

export default function Videos() {
  const { videos, currentUser, addVideo, deleteVideo, isAdmin } = useStore()
  const [category, setCategory] = useState('Barchasi')
  const [query, setQuery] = useState('')
  const [playing, setPlaying] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    channel: '',
    category: 'Agrotexnika',
    url: '',
    description: '',
    emoji: '🎬',
    gradient: GRADIENTS[0],
  })

  const filtered = useMemo(() => {
    let list = [...videos]
    if (category !== 'Barchasi') list = list.filter((video) => video.category === category)
    if (query.trim()) {
      const search = query.toLowerCase()
      list = list.filter((video) =>
        `${video.title} ${video.channel} ${video.description} ${video.category}`.toLowerCase().includes(search),
      )
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [videos, category, query])

  const playingSource = playing ? getVideoEmbed(playing.url) : null
  const formSource = form.url ? getVideoEmbed(form.url) : null

  async function handleAdd(event) {
    event.preventDefault()
    if (!currentUser) {
      toast.error('Video qo\'shish uchun tizimga kiring')
      return
    }
    if (!getVideoEmbed(form.url)) {
      toast.error("Bu havolani video sifatida ijro etib bo'lmaydi. YouTube, Vimeo yoki .mp4 havolasini kiriting.")
      return
    }
    const result = await addVideo(form)
    if (result.ok) {
      toast.success('Video muvaffaqiyatli qo\'shildi!')
      setAddOpen(false)
      setForm({
        title: '',
        channel: '',
        category: 'Agrotexnika',
        url: '',
        description: '',
        emoji: '🎬',
        gradient: GRADIENTS[0],
      })
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete(video) {
    const result = await deleteVideo(video.id)
    if (result.ok) {
      toast.success('Video o\'chirildi')
      if (playing?.id === video.id) setPlaying(null)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div>
      <PageHero
        eyebrow="Bilim markazi"
        title="Agro bilim videolari"
        description="Tomchilatib sug'orish, kasalliklarni aniqlash, o'g'itlash va texnika xizmati bo'yicha amaliy darslar."
        breadcrumbs={[{ label: 'Videolar' }]}
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  toast.error('Video qo\'shish uchun tizimga kiring')
                  return
                }
                setAddOpen(true)
              }}
              className="btn btn-lime"
            >
              <Upload size={16} /> Video qo'shish
            </button>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-100/70">
              {videos.length} ta video
            </span>
          </>
        }
      />

      <section className="container-page py-8">
        <div className="card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
              {VIDEO_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    category === item
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:max-w-xs">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Video qidirish..."
                className="input pl-10 pr-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label="Tozalash"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={setPlaying}
                showDelete={Boolean(currentUser)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon="🎬"
              title="Video topilmadi"
              description="Boshqa kategoriyani tanlang yoki qidiruvni o'zgartiring."
              action="Barcha videolar"
              actionTo="/videolar"
            />
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Film, title: 'Amaliy darslar', text: "Qadam-baqadam video qo'llanmalar va tavsiyalar." },
            { icon: Sparkles, title: 'AI tahlil', text: "Video bilan birga AI maslahatchidan savol so'rang." },
            { icon: Video, title: "O'z videongiz", text: "Bilimingizni ulashing va auditoriya to'plang." },
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
        open={Boolean(playing)}
        onClose={() => setPlaying(null)}
        title={playing?.title}
        subtitle={playing ? `${playing.channel} · ${playing.category}` : ''}
        size="lg"
      >
        {playing && (
          <div>
            {playingSource &&
            ['youtube', 'vimeo', 'dailymotion', 'rutube', 'okru', 'gdrive', 'instagram', 'tiktok', 'facebook'].includes(
              playingSource.type,
            ) ? (
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={playingSource.embedUrl}
                  title={playing.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : playingSource?.type === 'file' ? (
              <video
                src={playingSource.src}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full rounded-2xl bg-black"
              />
            ) : (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
                Bu video havolasini sayt ichida ijro etib bo'lmadi. Havolani tekshiring yoki videoni qayta qo'shing.
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-400">
              <span className="flex items-center gap-1"><Eye size={12} /> {playing.views} ko'rish</span>
              <span>{playing.channel} · {playing.category}</span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-stone-600">{playing.description}</p>

            {(isAdmin || playing.userId === currentUser?.id) && (
              <button
                type="button"
                onClick={() => handleDelete(playing)}
                className="btn btn-danger mt-3 w-full"
              >
                Videoni o'chirish
              </button>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Video qo'shish"
        subtitle="Video havolasini kiriting — video sayt ichida ijro etiladi."
        size="md"
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="label">Video nomi</label>
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="input"
              placeholder="Tomchilatib sug'orish tizimini o'rnatish"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Kanal / muallif</label>
              <input
                value={form.channel}
                onChange={(event) => setForm({ ...form, channel: event.target.value })}
                className="input"
                placeholder={currentUser?.name || 'AgroServ Akademiya'}
              />
            </div>
            <div>
              <label className="label">Kategoriya</label>
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="input"
              >
                {VIDEO_CATEGORIES.filter((item) => item !== 'Barchasi').map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Video havolasi *</label>
            <input
              value={form.url}
              onChange={(event) => setForm({ ...form, url: event.target.value })}
              className="input"
              placeholder="https://www.youtube.com/watch?v=... yoki https://.../video.mp4"
              required
            />
            {form.url && (
              formSource ? (
                <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                  Video aniqlandi: {formSource.type === 'file' ? 'video fayl' : formSource.type}. Sayt ichida ijro etiladi.
                </p>
              ) : (
                <p className="mt-1 text-[10px] font-semibold text-rose-500">
                  Bu havola video formatida emas. YouTube, Vimeo, Instagram, TikTok, Rutube, OK.ru,
                  Dailymotion, Google Drive yoki .mp4 havolasini kiriting.
                </p>
              )
            )}
            <p className="mt-1 text-[10px] text-stone-400">
              Havola sayt ichida video sifatida ochiladi — YouTube'ga o'tish shart emas.
            </p>
          </div>
          <div>
            <label className="label">Tavsif</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={3}
              className="input resize-none"
              placeholder="Videoda nima ko'rsatiladi..."
            />
          </div>
          <div>
            <label className="label">Emoji (vizual)</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, emoji })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
                    form.emoji === emoji ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Rang</label>
            <div className="flex flex-wrap gap-1.5">
              {GRADIENTS.map((gradient) => (
                <button
                  key={gradient}
                  type="button"
                  onClick={() => setForm({ ...form, gradient })}
                  className={`h-8 w-14 rounded-lg bg-gradient-to-r ${gradient} border-2 transition ${
                    form.gradient === gradient ? 'border-emerald-700' : 'border-transparent'
                  }`}
                  aria-label="Rang tanlash"
                />
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            <Plus size={16} /> Videoni qo'shish
          </button>
        </form>
      </Modal>
    </div>
  )
}
