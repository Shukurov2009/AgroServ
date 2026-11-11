import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  Home,
  Map,
  Search,
  ShoppingBag,
  Sprout,
  Store,
  Wrench,
} from 'lucide-react'

const LINKS = [
  { to: '/bozor', icon: Store, label: 'Bozor', text: "Mahsulot va texnika xaridi" },
  { to: '/xizmatlar', icon: Wrench, label: 'Xizmatlar', text: "Usta va agronomlar" },
  { to: '/ishlar', icon: Map, label: "Ish o'rinlari", text: "Agro sohada ish toping" },
  { to: '/ai-maslahatchi', icon: Bot, label: 'AI maslahatchi', text: 'Ekinlar bo\'yicha savol bering' },
]

export default function NotFound() {
  return (
    <div className="soft-gradient">
      <div className="container-page flex min-h-[75vh] flex-col items-center justify-center py-16 text-center">
        <div className="relative">
          <div className="pattern-dots absolute -inset-10 opacity-40" />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 text-5xl shadow-soft">
            🌱
          </span>
        </div>

        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
          404 · Sahifa topilmadi
        </p>
        <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-emerald-950 sm:text-4xl">
          Bu sahifa dalada yo'qolib qoldi
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-500">
          Siz izlagan sahifa o'chirilgan, manzil o'zgargan yoki noto'g'ri kiritilgan bo'lishi mumkin.
          Quyidagi bo'limlardan davom eting.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn btn-primary">
            <Home size={15} /> Bosh sahifa
          </Link>
          <Link to="/bozor" className="btn btn-secondary">
            <ShoppingBag size={15} /> Bozorga o'tish
          </Link>
          <button type="button" onClick={() => window.history.back()} className="btn btn-secondary">
            <ArrowLeft size={15} /> Orqaga
          </button>
        </div>

        <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="card group flex items-start gap-2.5 p-4 text-left transition hover:border-emerald-300"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon size={16} />
                </span>
                <span>
                  <span className="block text-xs font-black text-emerald-950">{item.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-stone-500">{item.text}</span>
                </span>
              </Link>
            )
          })}
        </div>

        <p className="mt-8 flex items-center gap-1.5 text-[10px] font-semibold text-stone-400">
          <Sprout size={12} className="text-emerald-500" />
          AgroServ — fermer bilan bozor o'rtasidagi raqamli ko'prik
          <Search size={11} className="ml-1" />
        </p>
      </div>
    </div>
  )
}
