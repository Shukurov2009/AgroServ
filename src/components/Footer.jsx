import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../context/StoreContext'
import Logo from './Logo'

const PLATFORM_LINKS = [
  { to: '/bozor', label: 'Bozor' },
  { to: '/xizmatlar', label: 'Xizmatlar' },
  { to: '/ishlar', label: "Ish o'rinlari" },
  { to: '/videolar', label: 'Videolar' },
  { to: '/ai-maslahatchi', label: 'AI maslahatchi' },
]

const COMPANY_LINKS = [
  { to: '/haqida', label: 'Biz haqimizda' },
  { to: '/narxlar', label: 'Tariflar' },
  { to: '/haqida#aloqa', label: 'Aloqa' },
  { to: '/login', label: 'Kirish' },
  { to: '/register', label: "Ro'yxatdan o'tish" },
]

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { subscribeNewsletter } = useStore()
  const [email, setEmail] = useState('')

  async function handleSubscribe(event) {
    event.preventDefault()
    const result = await subscribeNewsletter(email)
    if (result.ok) {
      toast.success('Yangiliklarga muvaffaqiyatli obuna bo\'ldingiz!')
      setEmail('')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <footer className="relative overflow-hidden bg-emerald-950 text-emerald-100">
      <div className="pattern-grid absolute inset-0 opacity-40" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="container-page relative py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-emerald-100/70">
              O'zbekiston fermerlari uchun texnika, mahsulot, xizmat va bilimlarni bitta
              platformada birlashtirgan raqamli agro ekotizim.
            </p>
            <div className="mt-6 space-y-3 text-xs text-emerald-100/75">
              <a href="tel:+998712000000" className="flex items-center gap-2.5 transition hover:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Phone size={14} />
                </span>
                +998 71 200 00 00
              </a>
              <a href="mailto:salom@agroserv.uz" className="flex items-center gap-2.5 transition hover:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Mail size={14} />
                </span>
                salom@agroserv.uz
              </a>
              <p className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <MapPin size={14} />
                </span>
                Toshkent shahri, Amir Temur ko'chasi 108
              </p>
              <a
                href="https://t.me/agroserv_uz"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 transition hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Send size={14} />
                </span>
                Telegram: @agroserv_uz
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">Platforma</h3>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-emerald-100/70 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">Kompaniya</h3>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-emerald-100/70 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">
              Yangiliklar va agro maslahatlar
            </h3>
            <p className="mt-4 text-sm text-emerald-100/70">
              Har hafta bozor narxlari, agrotexnika va yangi imkoniyatlar haqida xabar yuboramiz.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email manzilingiz"
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-emerald-100/40 focus:border-lime-400"
                required
              />
              <button
                type="submit"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-emerald-950 transition hover:bg-lime-300"
                aria-label="Obuna bo'lish"
              >
                <ArrowRight size={18} />
              </button>
            </form>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] text-emerald-100/60">
              <ShieldCheck size={15} className="text-lime-300" />
              Ma'lumotlaringiz xavfsiz saqlanadi. Spam yubormaymiz.
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {['UzCard', 'Humo', 'Visa', 'Mastercard', 'Click', 'Payme'].map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold text-emerald-100/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-emerald-100/45 sm:flex-row">
          <p>© {YEAR} AgroServ. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <Link to="/maxfiylik" className="transition hover:text-white">
              Maxfiylik siyosati
            </Link>
            <Link to="/shartlar" className="transition hover:text-white">
              Foydalanish shartlari
            </Link>
            <span className="flex items-center gap-1 text-lime-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" /> Server onlayn
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
