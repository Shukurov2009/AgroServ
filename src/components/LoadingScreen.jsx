import { Loader2, ServerCrash, RefreshCw } from 'lucide-react'

export default function LoadingScreen({ error = '' }) {
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <ServerCrash size={26} />
        </div>
        <h2 className="text-lg font-black text-stone-800">Server bilan aloqa yo'q</h2>
        <p className="max-w-md text-sm text-stone-500">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn btn-primary mt-1">
          <RefreshCw size={15} /> Qayta urinish
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-stone-500">
      <Loader2 size={30} className="animate-spin text-emerald-600" />
      <p className="text-sm font-semibold">Yuklanmoqda...</p>
    </div>
  )
}
