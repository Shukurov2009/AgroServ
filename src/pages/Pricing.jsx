import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  CircleDollarSign,
  HelpCircle,
  Megaphone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatSom } from '../lib/format'
import PageHero from '../components/PageHero'
import SectionHeader from '../components/SectionHeader'

const FREE_FEATURES = [
  'Cheksiz mahsulot va xizmat e\'lonlari',
  '0% savdo komissiyasi — summa to\'liq sotuvchiga',
  'Kuniga 50 ta bepul AI savol',
  'Bepul hamyon va buyurtma boshqaruvi',
  'Savat, sevimlilar va sharhlar',
  'Barcha viloyatlar va toifalar',
  'Google yoki email orqali kirish',
  'Admin tomonidan tekshirilgan e\'lonlar',
]

const FAQ = [
  {
    q: "Ro'yxatdan o'tish yoki e'lon joylash pullikmi?",
    a: "Yo'q. AgroServ'da ro'yxatdan o'tish, mahsulot yoki xizmat joylash va savdo qilish to'liq bepul. Oylik yoki yillik obuna yo'q.",
  },
  {
    q: 'Savdodan komissiya olinadimi?',
    a: "Yo'q, komissiya 0%. Xaridor to'lagan summa to'liq sotuvchiga o'tadi. Platforma savdo summasidan ulush olmaydi.",
  },
  {
    q: "E'lonlar soni cheklanganmi?",
    a: "Yo'q. Mahsulot va xizmatlarni cheklovsiz joylashtirishingiz mumkin. Sotuvchi yoki mutaxassis bo'lish ham bepul.",
  },
  {
    q: 'AI maslahatchi bepulmi?',
    a: "Ha. Kuniga 50 ta savol bepul. Bu fair-use limit — barcha foydalanuvchilarga xizmat barqaror ishlashi uchun.",
  },
  {
    q: 'Nega top mahsulot pullik?',
    a: "Top mahsulot — ixtiyoriy reklama xizmati. Uni sotib olmasangiz ham platformaning barcha asosiy imkoniyatlari bepul qoladi.",
  },
  {
    q: 'Eski Plus yoki Pro obunam nima bo\'ladi?',
    a: "Obuna tariflari butunlay bekor qilindi. Endi barcha foydalanuvchilar bir xil bepul imkoniyatlarga ega. Qo'shimcha to'lov talab qilinmaydi.",
  },
]

const BENEFITS = [
  {
    icon: Store,
    title: "Cheksiz e'lonlar",
    text: "Mahsulot va xizmatlarni istalgancha joylang. Hech qanday limit yo'q.",
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: CircleDollarSign,
    title: '0% komissiya',
    text: "Savdo summasi to'liq sotuvchiga qoladi. Platforma ulush olmaydi.",
    tone: 'bg-lime-50 text-lime-700',
  },
  {
    icon: Bot,
    title: 'Bepul AI maslahat',
    text: 'Kuniga 50 ta agronomik savol — obuna talab qilinmaydi.',
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    icon: Wallet,
    title: 'Bepul hamyon',
    text: "To'lovlar, buyurtmalar va moliyaviy tarix bitta joyda.",
    tone: 'bg-sky-50 text-sky-700',
  },
]

export default function Pricing() {
  const { currentUser, settings } = useStore()
  const featuredPrice = Number(settings?.featuredPrice) || 25000
  const startLink = currentUser ? '/kabinet' : '/register'

  return (
    <div>
      <PageHero
        eyebrow="Bepul platforma"
        title="AgroServ — hamma uchun bepul"
        description="Uzum Market kabi: ro'yxatdan o'tish, e'lon joylash va savdo qilish bepul. Oylik va yillik obunalar yo'q."
        breadcrumbs={[{ label: 'Bepul platforma' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={startLink} className="btn btn-lime">
              {currentUser ? 'Kabinetga o\'tish' : 'Bepul boshlash'} <ArrowRight size={15} />
            </Link>
            <Link to="/bozor" className="btn border-white/20 bg-white/5 text-white hover:bg-white/10">
              Bozorni ko'rish
            </Link>
          </div>
        }
      />

      <section className="container-page section-pad">
        <SectionHeader
          center
          eyebrow="Bitta rejim"
          title="Barchasi bepul — yashirin to'lov yo'q"
          description="Bitta hisob, bitta bepul platforma. Sotuvchilar, fermerlar va mutaxassislar uchun bir xil imkoniyatlar."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="card p-5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                  <Icon size={20} />
                </span>
                <h3 className="mt-3 text-sm font-black text-emerald-950">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.text}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Sparkles size={22} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Bepul platforma</p>
                <h3 className="mt-0.5 text-xl font-black text-emerald-950">Hammasi bitta tarifda</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  Ro'yxatdan o'ting va bugun soting. Hech qanday oylik to'lov, komissiya yoki yashirin shart yo'q.
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 rounded-xl bg-stone-50 px-3 py-2 text-[11px] font-semibold text-emerald-900">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link to={startLink} className="btn btn-primary">
                {currentUser ? 'Kabinetga o\'tish' : 'Bepul hisob ochish'} <ArrowRight size={15} />
              </Link>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-400">
                <ShieldCheck size={12} className="text-emerald-500" /> Karta talab qilinmaydi
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-emerald-950 p-5 text-white">
            <div className="pattern-grid absolute inset-0 opacity-30" />
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
                <Megaphone size={19} />
              </span>
              <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-lime-300">Ixtiyoriy xizmat</p>
              <h3 className="mt-0.5 text-lg font-black">Top mahsulot</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/65">
                Mahsulotingizni 30 kun bozor boshida ko'rsating. Bu majburiy emas — asosiy platforma bepul qoladi.
              </p>
              <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm font-black text-lime-300">
                {formatSom(featuredPrice)} / 30 kun
              </p>
              <Link to="/dokon" className="btn btn-lime btn-sm mt-3 w-full">
                Top ro'yxatga chiqarish <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: BadgeCheck, title: "Yashirin to'lov yo'q", text: "Faqat ixtiyoriy top mahsulot xizmati." },
            { icon: Rocket, title: 'Darhol boshlash', text: "Ro'yxatdan o'tib, bir daqiqada e'lon joylang." },
            { icon: CircleDollarSign, title: "To'liq tushum", text: "Savdo summasi to'liq sotuvchiga o'tadi." },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex items-start gap-2.5 rounded-xl bg-white p-3 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Icon size={15} />
                </span>
                <div>
                  <p className="text-[11px] font-black text-emerald-950">{item.title}</p>
                  <p className="text-[10px] text-stone-500">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white/60">
        <div className="container-page section-pad">
          <SectionHeader center eyebrow="Savollar" title="Bepul platforma bo'yicha savol-javob" />
          <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q} className="card p-4">
                <p className="flex items-start gap-2 text-xs font-black text-emerald-950">
                  <HelpCircle size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  {item.q}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-stone-500">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50 to-lime-50 p-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                <Store size={20} />
              </span>
              <div>
                <p className="text-sm font-black text-emerald-950">Savdoni bugun boshlang</p>
                <p className="text-[11px] text-stone-500">Ro'yxatdan o'tish bepul — karta yoki obuna talab qilinmaydi.</p>
              </div>
            </div>
            <Link to={startLink} className="btn btn-primary">
              {currentUser ? 'Kabinetga o\'tish' : 'Bepul boshlash'} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
