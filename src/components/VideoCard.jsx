import toast from 'react-hot-toast'
import { Play, Trash2 } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { getVideoEmbed } from '../lib/format'

export default function VideoCard({ video, onPlay, showDelete = false }) {
  const { currentUser, isAdmin, deleteVideo } = useStore()
  const canDelete = showDelete && (isAdmin || video.userId === currentUser?.id)
  const source = getVideoEmbed(video.url)
  const thumbnail = source?.thumbnail || (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg` : '')

  async function handleDelete() {
    const result = await deleteVideo(video.id)
    if (result.ok) toast.success("Video o'chirildi")
    else toast.error(result.error)
  }

  return (
    <article className="card hover-lift group overflow-hidden">
      <button type="button" onClick={() => onPlay?.(video)} className="relative block h-44 w-full overflow-hidden text-left">
        <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient}`} />
        <div className="pattern-grid absolute inset-0 opacity-20" />
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/55 via-emerald-950/5 to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110">
          {video.emoji}
        </span>
        {thumbnail && (
          <img
            src={thumbnail}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-emerald-950/40 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur">
          {video.category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-emerald-950/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
          {video.duration}
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 transition group-hover:bg-emerald-950/20">
          <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-lime-400 text-emerald-950 opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100">
            <Play size={20} className="ml-0.5 fill-emerald-950" />
          </span>
        </span>
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-snug text-emerald-950">
            {video.title}
          </h3>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-rose-500"
              aria-label="O'chirish"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-stone-400">
          <span>{video.channel}</span>
          <span>{video.views} ko'rish</span>
        </div>
      </div>
    </article>
  )
}
