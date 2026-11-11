import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import PageHero from '../components/PageHero'

function LegalLayout({ eyebrow, title, description, updated, icon: HeroIcon, sections, footerNote }) {
  return (
    <div>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={[{ label: title }]}
        actions={
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-100/70">
            Oxirgi yangilanish: {updated}
          </span>
        }
      />

      <section className="container-page py-8">
        <div className="grid gap-5 lg:grid-cols-[0.32fr_0.68fr]">
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <HeroIcon size={19} />
              </span>
              <h2 className="mt-3 text-sm font-black text-emerald-950">Tezkor navigatsiya</h2>
              <nav className="mt-3 space-y-1.5">
                {sections.map((section, index) => (
                  <a
                    key={section.title}
                    href={`#bolim-${index + 1}`}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-stone-500 transition hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[8px] font-black text-stone-500">
                      {index + 1}
                    </span>
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-emerald-950 p-5 text-white">
              <div className="pattern-grid absolute inset-0 opacity-25" />
              <div className="relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
                  <Mail size={16} />
                </span>
                <p className="mt-2.5 text-sm font-black">Savolingiz bormi?</p>
                <p className="mt-1 text-[10px] leading-relaxed text-emerald-100/60">
                  Huquqiy hujjatlar yoki ma'lumotlaringiz bo'yicha biz bilan bog'laning.
                </p>
                <Link to="/haqida#aloqa" className="btn btn-lime btn-sm mt-3 w-full">
                  Aloqa sahifasi
                </Link>
              </div>
            </div>

            <Link to="/" className="btn btn-secondary btn-sm w-full">
              <ArrowLeft size={14} /> Bosh sahifaga qaytish
            </Link>
          </aside>

          <div className="space-y-3">
            {sections.map((section, index) => (
              <article
                key={section.title}
                id={`bolim-${index + 1}`}
                className="card scroll-mt-24 p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-[11px] font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-emerald-950">{section.title}</h2>
                    <div className="mt-2 space-y-2 text-[12px] leading-relaxed text-stone-600">
                      {section.paragraphs?.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {section.bullets && (
                        <ul className="space-y-1.5">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2">
                              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-900">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                {footerNote}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function Privacy() {
  const sections = [
    {
      title: "Qanday ma'lumotlar saqlanadi",
      paragraphs: [
        "AgroServ offline demo rejimida ishlaydi. Ism, email, telefon, hudud, e'lonlar, buyurtmalar va hamyon harakatlari faqat sizning brauzeringizdagi localStorage xotirasida saqlanadi.",
        "Hech qanday ma'lumot serverga yuborilmaydi va uchinchi tomon xizmatlariga uzatilmaydi.",
      ],
      bullets: [
        "Hisob ma'lumotlari: ism, email, telefon va hudud.",
        "Faoliyat: mahsulot va xizmat e'lonlari, buyurtmalar, sevimlilar, xabarlar.",
        "To'lovlar: demo kartalar va hamyon balansi (real bank ma'lumoti emas).",
      ],
    },
    {
      title: 'Ma\'lumotlardan foydalanish maqsadi',
      paragraphs: [
        "Ma'lumotlar platforma funksiyalarini ko'rsatish uchun ishlatiladi: kabinet, bozor, buyurtmalar, xizmatlar, admin panel va monetizatsiya simulyatsiyasi.",
        "Demo hisoblar orqali barcha rollarni sinab ko'rishingiz mumkin. Ma'lumotlar brauzer xotirasidan tashqariga chiqmaydi.",
      ],
    },
    {
      title: 'Uchinchi tomonlar va cookie',
      paragraphs: [
        "Ilova tashqi API, analitika yoki reklama tarmoqlarini ishlatmaydi. Cookie fayllari faqat brauzer xotirasini saqlash uchun emas, localStorage ishlatiladi.",
        "Tashqi havolalar (masalan, Telegram yoki YouTube) faqat siz bosganingizda ochiladi.",
      ],
    },
    {
      title: "Ma'lumotlar xavfsizligi",
      paragraphs: [
        "Barcha ma'lumotlar sizning qurilmangizda saqlanadi. Brauzer xotirasini tozalash yoki Admin panelidagi «Demo ma'lumotlarni tiklash» tugmasi orqali ularni o'chirishingiz mumkin.",
        "Umumiy qurilmada foydalansangiz, brauzerni yopishdan oldin hisobdan chiqing.",
      ],
    },
    {
      title: 'Sizning huquqlaringiz',
      bullets: [
        "Profilingizni tahrirlash va ma'lumotlarni yangilash.",
        "Sevimlilar, savat va buyurtmalarni o'chirish.",
        "Brauzer sozlamalaridan localStorage ma'lumotlarini to'liq tozalash.",
        "Admin paneli orqali demo ma'lumotlarni boshlang'ich holatga qaytarish.",
      ],
    },
    {
      title: "Bog'lanish",
      paragraphs: [
        "Maxfiylik bo'yicha savollaringizni salom@agroserv.uz manziliga yuborishingiz yoki /haqida sahifasidagi aloqa formasi orqali yozishingiz mumkin.",
      ],
    },
  ]

  return (
    <LegalLayout
      eyebrow="Huquqiy ma'lumot"
      title="Maxfiylik siyosati"
      description="AgroServ sizning ma'lumotlaringizni qanday saqlashi, ishlatishi va himoya qilishi haqida tushunarli tushuntirish."
      updated="10 noyabr 2026"
      icon={ShieldCheck}
      sections={sections}
      footerNote="Bu hujjat offline demo uchun tayyorlangan. Real tijoriy foydalanishdan oldin yuridik ekspertiza talab etiladi."
    />
  )
}

export function Terms() {
  const sections = [
    {
      title: 'Platformadan foydalanish',
      paragraphs: [
        "AgroServ — O'zbekiston fermerlari, sotuvchilar va mutaxassislari uchun agro ekotizim demo platformasi. Saytdan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.",
        "Platforma o'quv va namoyish maqsadida yaratilgan. Barcha to'lovlar va buyurtmalar simulyatsiya qilinadi.",
      ],
    },
    {
      title: 'Hisob va rollar',
      bullets: [
        "Fermer mahsulot xarid qiladi, xizmat buyurtma qiladi va sevimlilarni saqlaydi.",
        "Sotuvchi mahsulot e'lon qiladi va buyurtmalarni boshqaradi.",
        "Usta va agronom xizmat ko'rsatadi, daromad va buyurtmalarni kuzatadi.",
        "Administrator platforma sozlamalari va foydalanuvchilarni boshqaradi.",
      ],
      paragraphs: [
        "Hisob ma'lumotlarini himoya qilish sizning zimmangizda. Demo hisoblardan foydalanganda maxfiy ma'lumot kiritmang.",
      ],
    },
    {
      title: "E'lonlar va kontent",
      paragraphs: [
        "E'lon joylashtirishda haqiqiy, aniq va qonuniy ma'lumot bering. Noto'g'ri narx, yolg'on tavsif yoki boshqa foydalanuvchilarni chalg'ituvchi kontent taqiqlanadi.",
        "Platforma demo bo'lgani uchun barcha e'lonlar brauzer xotirasida saqlanadi va faqat sizga ko'rinadi.",
      ],
    },
    {
      title: "To'lovlar va monetizatsiya",
      paragraphs: [
        "Free, Plus va Pro tariflari, hamyon to'ldirish, top mahsulot va promo kodlar demo rejimda simulyatsiya qilinadi. Real pul yechib olinmaydi.",
        "Komissiya stavkalari tarifga qarab 1–5% oralig'ida ko'rsatiladi va faqat hisob-kitob namoyishi uchun ishlatiladi.",
      ],
    },
    {
      title: "Javobgarlik chegarasi",
      paragraphs: [
        "Demo platforma «bor holaticha» taqdim etiladi. Ma'lumotlarning yo'qolishi, brauzer xotirasining tozalanishi yoki demo xarakteridagi xatolar uchun javobgarlik cheklangan.",
        "Real savdo yoki xizmat ko'rsatishdan oldin tomonlar o'zaro shartnoma tuzishlari tavsiya etiladi.",
      ],
    },
    {
      title: "Shartlarni o'zgartirish",
      paragraphs: [
        "Platforma yangilanganda ushbu shartlar o'zgarishi mumkin. Yangilangan sana sahifa boshida ko'rsatiladi. Savollar uchun salom@agroserv.uz manziliga murojaat qiling.",
      ],
    },
  ]

  return (
    <LegalLayout
      eyebrow="Huquqiy ma'lumot"
      title="Foydalanish shartlari"
      description="Platformadan foydalanish qoidalari, rollar, e'lonlar, demo to'lovlar va javobgarlik chegaralari."
      updated="10 noyabr 2026"
      icon={FileText}
      sections={sections}
      footerNote="Ushbu hujjat faqat demo loyiha uchun namunaviy matn hisoblanadi va yuridik maslahat o'rnini bosmaydi."
    />
  )
}
