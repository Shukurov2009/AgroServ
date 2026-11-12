import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  BarChart3,
  Check,
  Crown,
  HelpCircle,
  Rocket,
  Sparkles,
  Store,
  Target,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { PLANS } from '../lib/constants'
import { formatNumber, formatSom } from '../lib/format'
import PageHero from '../components/PageHero'
import PlanCard from '../components/PlanCard'
import SectionHeader from '../components/SectionHeader'

const COMPARISON = [
  { label: 'Mahsulot / xizmat joylash', free: '3 ta', plus: '20 ta', pro: 'Cheksiz' },
  { label: 'Savdo komissiyasi', free: '5%', plus: '3%', pro: '1%' },
  { label: 'AI savol (kuniga)', free: '5 ta', plus: '50 ta', pro: 'Cheksiz' },
  { label: 'Top mahsulot (oyiga)', free: '—', plus: '1 ta', pro: '5 ta' },
  { label: 'Kengaytirilgan statistika', free: false, plus: true, pro: true },
  { label: 'Tekshirilgan sotuvchi belgisi', free: false, plus: false, pro: true },
  { label: 'Shaxsiy menejer', free: false, plus: false, pro: true },
  { label: 'API va eksport', free: false, plus: false, pro: true },
  { label: 'Qo\'llab-quvvatlash', free: 'Email', plus: 'Tezkor', pro: '24/7 shaxsiy' },
]

const REVENUE = [
  {
    icon: Store,
    title: 'Savdo komissiyasi',
    text: "Har bir muvaffaqiyatli bitimdan 1–5%. Bu platformaning asosiy va eng barqaror daromad manbai.",
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Crown,
    title: 'Obuna tariflari',
    text: "Plus va Pro tariflar oylik yoki yillik to'lov. Sotuvchilarga ko'proq imkoniyat, platformaga barqaror daromad.",
    accent: 'from-violet-400 to-purple-500',
  },
  {
    icon: Target,
    title: 'Top mahsulot',
    text: "25 000 so'mga mahsulot 30 kun bozor boshida ko'rsatiladi. Sotuvchi ko'proq mijoz oladi.",
    accent: 'from-amber-400 to-orange-500',
  },
  {
    icon: Wallet,
    title: 'Qo\'shimcha xizmatlar',
    text: "Reklama bannerlari, hamkorlik va premium profil — kelajakda qo'shiladigan daromad yo'nalishlari.",
    accent: 'from-sky-400 to-blue-500',
  },
]

const FAQ = [
  {
    q: 'Tarifni istalgan vaqtda o\'zgartirsam bo\'ladimi?',
    a: "Ha. Tarifni oshirsangiz, yangi imkoniyatlar darhol faollashadi. To'lov hamyon, bank o'tkazmasi yoki yoqilgan onlayn to'lov tizimi orqali amalga oshiriladi.",
  },
  {
    q: 'Yillik to\'lovda qancha tejayman?',
    a: "Plus tarifida yillik to'lov 470 000 so'm — oylikdan 118 000 so'm tejamkor. Pro tarifida 1 430 000 so'm — 358 000 so'm tejamkor.",
  },
  {
    q: 'Bepul tarifda sotish mumkinmi?',
    a: "Ha. Bepul tarifda 3 tagacha mahsulot joylash va 5% komissiya bilan sotish mumkin. Bu boshlash uchun yetarli.",
  },
  {
    q: 'Promo kodlar qanday ishlaydi?',
    a: "To'lov sahifasida promo kodni kiritasiz. Masalan PLUS20 obunaga 20% chegirma beradi. Har bir kodning o'z shartlari bor.",
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { currentUser, plan, validatePromoCode } = useStore()
  const [billing, setBilling] = useState('monthly')
  const [promo, setPromo] = useState('')
  const [promoResult, setPromoResult] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)

  function handleSelect(target) {
    if (target.id === 'free') {
      toast.success("Bepul tarif barcha uchun ochiq. Kabinetga o'tishingiz mumkin.")
      navigate(currentUser ? '/kabinet' : '/register')
      return
    }
    if (!currentUser) {
      toast.error('Tarif sotib olish uchun avval tizimga kiring')
      navigate('/login', { state: { from: '/narxlar' } })
      return
    }
    const price = billing === 'yearly' ? target.yearly : target.monthly
    navigate('/tolov', {
      state: { type: 'plan', planId: target.id, billing, amount: price },
    })
  }

  async function checkPromo(event) {
    event.preventDefault()
    const base = PLANS.plus[billing === 'yearly' ? 'yearly' : 'monthly']
    setPromoLoading(true)
    const result = await validatePromoCode(promo.trim().toUpperCase(), 'plan', base)
    setPromoLoading(false)
    if (result.ok) {
      setPromoResult(result)
      setPromo(result.code)
      toast.success(`Promo kod ishlaydi: ${formatSom(result.discount)} chegirma`)
    } else {
      setPromoResult({ ok: false, error: result.error })
      toast.error(result.error)
    }
  }

  return (
    <div>
      <PageHero
        eyebrow="Tariflar va monetizatsiya"
        title="O'sishingizga mos tarifni tanlang"
        description="Bepul boshlang, savdo hajmi oshgani sari komissiyani kamaytiring. Yashirin to'lovlar yo'q — har bir tarifda nima borligi aniq ko'rsatilgan."
        breadcrumbs={[{ label: 'Narxlar' }]}
        actions={
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`rounded-lg px-3.5 py-1.5 text-[11px] font-bold transition ${
                billing === 'monthly' ? 'bg-lime-400 text-emerald-950' : 'text-emerald-100/70 hover:text-white'
              }`}
            >
              Oylik
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-bold transition ${
                billing === 'yearly' ? 'bg-lime-400 text-emerald-950' : 'text-emerald-100/70 hover:text-white'
              }`}
            >
              Yillik
              <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black ${billing === 'yearly' ? 'bg-emerald-950/15 text-emerald-900' : 'bg-lime-400/15 text-lime-300'}`}>
                −20%
              </span>
            </button>
          </div>
        }
      />

      <section className="container-page section-pad">
        <SectionHeader
          center
          eyebrow="Obuna tariflari"
          title="Uch tarif — har xil hajmdagi biznes uchun"
          description="Barcha tariflar bir xil platformaga kirishni beradi. Farq — limitlar, komissiya va qo'shimcha vositalarda."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {Object.values(PLANS).map((item) => (
            <PlanCard
              key={item.id}
              plan={item}
              billing={billing}
              currentPlanId={currentUser ? plan.id : 'free'}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <BadgePercent size={17} />
            </span>
            <div>
              <p className="text-xs font-black text-emerald-950">Promo kodingiz bormi?</p>
              <p className="text-[10px] text-stone-500">PLUS20 — obunaga 20% chegirma. To'lov sahifasida qo'llang.</p>
            </div>
          </div>
          <form onSubmit={checkPromo} className="flex w-full gap-2 sm:w-auto">
            <input
              value={promo}
              onChange={(event) => {
                setPromo(event.target.value)
                setPromoResult(null)
              }}
              placeholder="PLUS20"
              className="input w-full uppercase sm:w-36"
            />
            <button type="submit" disabled={promoLoading} className="btn btn-secondary shrink-0 disabled:opacity-60">
              {promoLoading ? 'Tekshirilmoqda...' : 'Tekshirish'}
            </button>
          </form>
        </div>
        {promoResult && (
          <div
            className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
              promoResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {promoResult.ok ? <Check size={14} /> : <X size={14} />}
            {promoResult.ok
              ? `${promoResult.code} ishlaydi — ${formatSom(promoResult.discount)} chegirma`
              : promoResult.error}
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Zap, title: 'Tezkor faollashuv', text: "To'lovdan so'ng imkoniyatlar darhol yoqiladi." },
            { icon: BadgeCheck, title: 'Yashirin to\'lov yo\'q', text: "Faqat ko'rsatilgan narx va komissiya." },
            { icon: Sparkles, title: 'Istalgan vaqtda bekor', text: "Obunani bir bosishda to'xtatish mumkin." },
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

      {/* COMPARISON */}
      <section className="bg-white/60">
        <div className="container-page section-pad">
          <SectionHeader
            eyebrow="Solishtirish"
            title="Tariflarni yonma-yon ko'ring"
            description="Har bir imkoniyat qaysi tarifda mavjudligini aniq tekshiring."
          />
          <div className="table-wrap card overflow-hidden">
            <table>
              <thead>
                <tr>
                  <th>Imkoniyat</th>
                  <th className="text-center">Bepul</th>
                  <th className="bg-emerald-50/60 text-center text-emerald-700">Plus ⚡</th>
                  <th className="bg-violet-50/60 text-center text-violet-700">Pro 👑</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label}>
                    <td className="font-semibold text-emerald-950">{row.label}</td>
                    {[row.free, row.plus, row.pro].map((value, index) => (
                      <td key={index} className={`text-center ${index === 1 ? 'bg-emerald-50/30' : index === 2 ? 'bg-violet-50/30' : ''}`}>
                        {value === true ? (
                          <Check size={15} className="mx-auto text-emerald-600" />
                        ) : value === false ? (
                          <X size={15} className="mx-auto text-stone-300" />
                        ) : (
                          <span className="font-bold text-stone-600">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* REVENUE MODEL */}
      <section className="container-page section-pad">
        <SectionHeader
          eyebrow="Shaffof monetizatsiya"
          title="Platforma qanday daromad qiladi"
          description="Har bir daromad manbai foydalanuvchiga real qiymat beradi — reklama emas, xizmat."
          action="Batafsil ma'lumot"
          actionTo="/haqida"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REVENUE.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="card relative overflow-hidden p-5">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`} />
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={20} />
                </span>
                <h3 className="mt-3 text-sm font-black text-emerald-950">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.text}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-emerald-950">
              <BarChart3 size={16} className="text-emerald-600" /> Sotuvchi uchun misol hisob
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              10 000 000 so'mlik savdo qilsangiz, tarifga qarab platforma komissiyasi:
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { name: 'Bepul', rate: 5, tone: 'bg-stone-50 text-stone-700' },
                { name: 'Plus', rate: 3, tone: 'bg-emerald-50 text-emerald-700' },
                { name: 'Pro', rate: 1, tone: 'bg-violet-50 text-violet-700' },
              ].map((item) => (
                <div key={item.name} className={`rounded-xl p-3 ${item.tone}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{item.name} · {item.rate}%</p>
                  <p className="mt-1 text-lg font-black">{formatNumber((10000000 * item.rate) / 100)}</p>
                  <p className="text-[9px] font-semibold opacity-60">so'm komissiya</p>
                  <p className="mt-1 text-[10px] font-bold">
                    Sizga qoladi: {formatNumber(10000000 - (10000000 * item.rate) / 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-emerald-950 p-5 text-white">
            <div className="pattern-grid absolute inset-0 opacity-30" />
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
                <Rocket size={19} />
              </span>
              <h3 className="mt-3 text-sm font-black">Pro tarifga o'tish foydalimi?</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/60">
                Agar oyiga 10 mln so'mdan ko'p savdo qilsangiz, Pro tarif komissiyadan
                tejalgan mablag' hisobiga o'zini tez qoplaydi.
              </p>
              <p className="mt-3 rounded-xl bg-white/10 p-3 text-[11px] font-semibold text-lime-300">
                10 mln savdoda tejam: {formatNumber(400000)} so'm/oy
              </p>
              <button type="button" onClick={() => handleSelect(PLANS.pro)} className="btn btn-lime btn-sm mt-3 w-full">
                Pro tarifni tanlash <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white/60">
        <div className="container-page section-pad">
          <SectionHeader center eyebrow="Savollar" title="Tariflar bo'yicha savol-javob" />
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
                <Users size={20} />
              </span>
              <div>
                <p className="text-sm font-black text-emerald-950">Qaysi tarifni tanlashni bilmayapsizmi?</p>
                <p className="text-[11px] text-stone-500">Bizga yozing — biznesingizga mos tarifni tavsiya qilamiz.</p>
              </div>
            </div>
            <Link to="/haqida#aloqa" className="btn btn-primary">
              Maslahat olish <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
