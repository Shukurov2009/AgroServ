import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronDown,
  Handshake,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatNumber, formatSom } from '../lib/format'
import PageHero from '../components/PageHero'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Ishonch va shaffoflik',
    text: "Har bir sotuvchi, mutaxassis va to'lov tarixi tizimda ko'rinadi. Yashirin to'lov yo'q — platforma bepul.",
    tone: 'emerald',
  },
  {
    icon: Handshake,
    title: "Fermerga yaqin",
    text: "Platforma O'zbekiston fermerlarining haqiqiy ehtiyojlari asosida qurilgan.",
    tone: 'amber',
  },
  {
    icon: Bot,
    title: 'Texnologiya va bilim',
    text: "AI agronom, video darslar va raqamli analitika — bilim har bir fermerga yetib boradi.",
    tone: 'violet',
  },
  {
    icon: TrendingUp,
    title: "O'sishga yo'naltirilgan",
    text: "Sotuvchilar uchun top mahsulot va ixtiyoriy reklama vositalari bilan daromadni oshirish.",
    tone: 'sky',
  },
]

const TIMELINE = [
  {
    year: '2023',
    title: "G'oya paydo bo'ldi",
    text: "Samarqanddagi fermerlar bilan suhbat natijasida agro xizmatlarni bitta raqamli platformaga birlashtirish g'oyasi tug'ildi.",
  },
  {
    year: '2024',
    title: 'Birinchi versiya',
    text: "Bozor, xizmatlar va ish o'rinlari bo'limlari ishga tushdi. 300 dan ortiq fermer ro'yxatdan o'tdi.",
  },
  {
    year: '2025',
    title: 'AI va monetizatsiya',
    text: "AI agronom maslahatchi, top mahsulot xizmati va hamyon tizimi qo'shildi.",
  },
  {
    year: '2026',
    title: 'Milliy miqyos',
    text: "Platforma O'zbekistonning barcha viloyatlarida ishlaydi. Obuna yo'q — faqat 5% savdo komissiyasi va cheksiz e'lonlar.",
  },
]

const FAQ = [
  {
    q: 'AgroServ qanday ishlaydi?',
    a: "AgroServ to'liq serverda ishlaydi: hisoblar, mahsulotlar, buyurtmalar va to'lovlar Neon Postgres bazasida saqlanadi. Internet va brauzer yetarli.",
  },
  {
    q: "Ro'yxatdan o'tish pullikmi?",
    a: "Yo'q. Ro'yxatdan o'tish va e'lon joylash bepul: cheksiz e'lon, 5% savdo komissiyasi va kuniga 50 ta AI savol. Oylik yoki yillik obuna yo'q.",
  },
  {
    q: "To'lovlar qanday amalga oshiriladi?",
    a: "Hamyon, bank o'tkazmasi va naqd to'lov qo'llab-quvvatlanadi. Bank o'tkazmasi admin tasdig'idan keyin, hamyon esa darhol faollashadi. Payme va Click credentiallari ulanganda onlayn to'lov ham ishlaydi.",
  },
  {
    q: 'Rolimni qanday o\'zgartirman?',
    a: "Profil sahifasida Fermer, Sotuvchi, Texnika ustasi yoki Agronom rolini tanlashingiz mumkin. Administrator rolini faqat admin panel orqali beriladi.",
  },
  {
    q: "Komissiya qanday hisoblanadi?",
    a: "Har bir savdodan 5% platforma komissiyasi olinadi — summaning 95% sotuvchiga o'tadi. Faqat top mahsulot ixtiyoriy pullik xizmat bo'lib qoladi.",
  },
  {
    q: 'AI maslahatchi qanday ishlaydi?',
    a: "AI maslahatchi ekinlar, kasalliklar, o'g'itlash va sug'orish bo'yicha bilim bazasidan javob beradi. Har bir savol serverda hisoblanadi. Kuniga 50 ta bepul savol — fair-use limit.",
  },
]

const CONTACTS = [
  { icon: Phone, label: 'Qo\'ng\'iroq', value: '+998 71 200 00 00', href: 'tel:+998712000000' },
  { icon: Mail, label: 'Email', value: 'salom@agroserv.uz', href: 'mailto:salom@agroserv.uz' },
  { icon: Send, label: 'Telegram', value: '@agroserv_uz', href: 'https://t.me/agroserv_uz' },
  { icon: MapPin, label: 'Ofis', value: "Toshkent, Amir Temur ko'chasi 108", href: null },
]

export default function About() {
  const { sendMessage, products, services, orders, users, reviews } = useStore()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [openFaq, setOpenFaq] = useState(0)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await sendMessage(form)
    if (result.ok) {
      toast.success("Xabaringiz yuborildi! Tez orada javob beramiz.")
      setForm({ name: '', email: '', subject: '', message: '' })
      setSent(true)
    } else {
      toast.error(result.error)
    }
  }

  const totalSales = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const completedOrders = orders.filter((order) => order.status === 'completed').length
  const providersCount = users.filter((user) => ['worker', 'agronomist'].includes(user.role)).length
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
    : 0

  return (
    <div>
      <PageHero
        eyebrow="Biz haqimizda"
        title="Fermer bilan bozor o'rtasidagi raqamli ko'prik"
        description="AgroServ — O'zbekiston fermerlariga texnika, mahsulot, xizmat va bilimlarni bitta platformada taqdim etuvchi raqamli agro ekotizim. Bizning maqsadimiz: har bir fermer uchun savdo va maslahatni sodda, tez va ishonchli qilish."
        breadcrumbs={[{ label: 'Haqida' }]}
        actions={
          <>
            <Link to="/bozor" className="btn btn-lime">
              Bozorni ko'rish <ArrowRight size={16} />
            </Link>
            <a href="#aloqa" className="btn border-white/20 bg-white/5 text-white hover:bg-white/10">
              Biz bilan bog'lanish
            </a>
          </>
        }
      >
        <div className="grid w-64 grid-cols-2 gap-2 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
          {[
            [formatNumber(users.length), 'Foydalanuvchi'],
            [formatNumber(products.length + services.length), "E'lon"],
            [formatNumber(providersCount), 'Mutaxassis'],
            ['14', 'Viloyat'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-emerald-950/40 p-3 text-center">
              <p className="text-lg font-black text-white">{value}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-100/50">{label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      {/* MISSION */}
      <section className="container-page section-pad">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Missiyamiz</span>
            <h2 className="mt-2.5 text-2xl font-black leading-tight text-emerald-950 sm:text-3xl">
              Har bir fermer o'z mehnatining to'liq qiymatini olishi kerak
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              O'zbekistonda millionlab odam qishloq xo'jaligida ishlaydi, lekin mahsulotini sotish,
              texnika topish yoki agronom maslahatini olish hali ham qiyin. AgroServ bu muammoni
              raqamli vositalar bilan hal qiladi.
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
              Platforma sotuvchi, xizmat ko'rsatuvchi va fermerni bir joyda bog'laydi; to'lovlar
              va buyurtmalar shaffof ishlaydi. Platformadan foydalanish obunasiz — har bir
              savdodan 5% komissiya olinadi.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                "Mahsulot va xizmatlarni bitta joyda",
                "AI agronom maslahati 24/7",
                "Xavfsiz va kuzatiladigan to'lovlar",
                "Sotuvchilar uchun o'sish vositalari",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-xl bg-white p-2.5 text-[11px] font-semibold text-emerald-900 shadow-sm">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard icon={<Users size={18} />} label="Foydalanuvchilar" value={formatNumber(users.length)} hint="Fermer, sotuvchi va mutaxassis" tone="emerald" />
            <StatCard icon={<Store size={18} />} label="E'lonlar" value={formatNumber(products.length + services.length)} hint="Bozor va xizmatlar" tone="sky" />
            <StatCard icon={<TrendingUp size={18} />} label="Savdo hajmi" value={formatSom(totalSales)} hint={`${formatNumber(orders.length)} ta buyurtma`} tone="amber" />
            <StatCard icon={<HeartHandshake size={18} />} label="O'rtacha reyting" value={averageRating ? `${averageRating.toFixed(1)}/5` : '—'} hint={`${formatNumber(reviews.length)} ta fikr`} tone="rose" />
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-white/60">
        <div className="container-page section-pad">
          <SectionHeader
            center
            eyebrow="Qadriyatlarimiz"
            title="Nima uchun AgroServ boshqacha"
            description="Texnologiya fermerni almashtirmaydi — u fermerning ishini yengillashtiradi."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="card hover-lift p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-3 text-sm font-black text-emerald-950">{value.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">{value.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="container-page section-pad">
        <SectionHeader
          eyebrow="Yo'limiz"
          title="G'oyadan 14 viloyatgacha"
          description="Har bir bosqich real foydalanuvchilar fikri va ehtiyoji asosida shakllandi."
        />
        <div className="relative grid gap-4 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-emerald-200 via-lime-300 to-emerald-200 md:block" />
          {TIMELINE.map((item, index) => (
            <div key={item.year} className="relative">
              <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-sm font-black text-lime-300 shadow-lg">
                {item.year}
              </span>
              <h3 className="mt-3 text-sm font-black text-emerald-950">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.text}</p>
              <span className="mt-3 inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                0{index + 1}-bosqich
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM TODAY */}
      <section className="bg-emerald-950 text-white">
        <div className="container-page section-pad">
          <SectionHeader
            light
            eyebrow="Platforma bugun"
            title="Real foydalanuvchilar, real natijalar"
            description="Bu raqamlar serverdagi haqiqiy ma'lumotlardan olinadi. Sun'iy o'sish yoki demo hisoblar yo'q."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, label: `${formatNumber(users.length)} foydalanuvchi`, text: "Ro'yxatdan o'tgan hisoblar" },
              { icon: Store, label: `${formatNumber(products.length + services.length)} e'lon`, text: 'Mahsulot va xizmatlar' },
              { icon: Award, label: `${formatNumber(providersCount)} mutaxassis`, text: 'Usta va agronomlar' },
              { icon: Rocket, label: `${formatNumber(completedOrders)} buyurtma`, text: 'Yakunlangan bitimlar' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-white">{item.label}</p>
                    <p className="text-[10px] text-emerald-100/50">{item.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW PLATFORM EARNS */}
      <section className="container-page section-pad">
        <SectionHeader
          eyebrow="Bepul platforma"
          title="Platforma qanday ishlaydi va nima bepul"
          description="Yashirin to'lovlar yo'q. Asosiy imkoniyatlar barcha uchun bepul, faqat top mahsulot ixtiyoriy."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Store,
              title: 'Bepul foydalanish',
              value: "0 so'm",
              text: "Ro'yxatdan o'tish, e'lon joylash, savdo qilish va buyurtmalarni boshqarish bepul.",
              tone: 'bg-emerald-50 text-emerald-700',
            },
            {
              icon: Sparkles,
              title: '5% komissiya',
              value: '5%',
              text: "Har bir savdodan 5% komissiya olinadi, summaning 95% sotuvchiga qoladi.",
              tone: 'bg-violet-50 text-violet-700',
            },
            {
              icon: Target,
              title: 'Top mahsulot',
              value: "25 000 so'm",
              text: "Ixtiyoriy xizmat: mahsulotni 30 kun davomida bozor boshida ko'rsatadi.",
              tone: 'bg-amber-50 text-amber-700',
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                    <Icon size={19} />
                  </span>
                  <span className="text-lg font-black text-emerald-950">{item.value}</span>
                </div>
                <h3 className="mt-3 text-sm font-black text-emerald-950">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white/60">
        <div className="container-page section-pad">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Savol-javob</span>
              <h2 className="mt-2.5 text-2xl font-black leading-tight text-emerald-950 sm:text-3xl">
                Ko'p beriladigan savollar
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-500">
                Javob topolmadingizmi? Aloqa formasi orqali yozing — jamoamiz 24 soat ichida javob beradi.
              </p>
              <a href="#aloqa" className="btn btn-secondary btn-sm mt-4">
                <MessageSquare size={14} /> Savol yuborish
              </a>
            </div>
            <div className="space-y-2">
              {FAQ.map((item, index) => {
                const open = openFaq === index
                return (
                  <div key={item.q} className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                    >
                      <span className="text-xs font-bold text-emerald-950 sm:text-sm">{item.q}</span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-stone-400 transition ${open ? 'rotate-180 text-emerald-600' : ''}`}
                      />
                    </button>
                    {open && (
                      <p className="animate-fade-in border-t border-stone-100 px-4 py-3.5 text-xs leading-relaxed text-stone-600">
                        {item.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="aloqa" className="container-page section-pad scroll-mt-24">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Aloqa</span>
            <h2 className="mt-2.5 text-2xl font-black leading-tight text-emerald-950 sm:text-3xl">
              Savolingiz bormi? Yozing — javob beramiz
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-stone-500">
              Hamkorlik, texnik yordam, sotuvchilik yoki takliflar bo'yicha murojaat qiling.
              Xabar admin paneliga tushadi va qo'llab-quvvatlash jamoasi javob beradi.
            </p>

            <div className="mt-5 grid gap-2">
              {CONTACTS.map((contact) => {
                const Icon = contact.icon
                const content = (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-white p-3 transition hover:border-emerald-300">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">{contact.label}</p>
                      <p className="text-xs font-bold text-emerald-950">{contact.value}</p>
                    </div>
                  </div>
                )
                return contact.href ? (
                  <a key={contact.label} href={contact.href} target={contact.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  <div key={contact.label}>{content}</div>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
                <BadgeCheck size={14} /> Ish vaqti
              </p>
              <p className="mt-1 text-[11px] text-stone-600">Dushanba–Shanba, 09:00–19:00</p>
              <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
                Xabar serverda saqlanadi. Administrator panelidagi «Xabarlar» bo'limida
                ko'rish va javob berish mumkin.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
            <h3 className="text-sm font-black text-emerald-950">Xabar yuborish</h3>
            <p className="mt-1 text-[11px] text-stone-500">Barcha maydonlarni to'ldiring.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="contact-name">Ismingiz</label>
                <input
                  id="contact-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="input"
                  placeholder="Aziz Karimov"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="input"
                  placeholder="siz@example.uz"
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="contact-subject">Mavzu</label>
              <input
                id="contact-subject"
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                className="input"
                placeholder="Sotuvchi bo'lish haqida"
              />
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="contact-message">Xabar</label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                rows={5}
                className="input resize-none"
                placeholder="Savolingizni batafsil yozing..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary mt-4 w-full">
              <Send size={16} /> Xabarni yuborish
            </button>
            {sent && (
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={14} /> Xabaringiz muvaffaqiyatli yuborildi
              </p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-stone-400">
              <ShieldCheck size={11} /> Ma'lumotlaringiz faqat platforma ichida saqlanadi
            </p>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-7 text-white shadow-soft sm:p-10">
          <div className="pattern-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-lime-300">
                <Sprout size={13} /> Birga o'samiz
              </span>
              <h2 className="mt-3 max-w-xl text-2xl font-black leading-tight sm:text-3xl">
                AgroServ'ga qo'shiling — savdo, xizmat va bilim bir joyda
              </h2>
              <p className="mt-2 max-w-xl text-sm text-emerald-100/65">
                Ro'yxatdan o'tish bepul. Birinchi e'loningizni bugun joylashtiring.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/register" className="btn btn-lime btn-lg">
                Hisob ochish <ArrowRight size={17} />
              </Link>
              <Link to="/narxlar" className="btn btn-lg border-white/20 bg-white/5 text-white hover:bg-white/10">
                Bepul platforma
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
