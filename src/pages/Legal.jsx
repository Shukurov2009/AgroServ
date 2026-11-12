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
        "AgroServ serverda ishlaydi. Ism, email, telefon, hudud, e'lonlar, buyurtmalar, xabarlar va hamyon harakatlari Neon Postgres bazasida saqlanadi. Parollar hech qachon ochiq holda saqlanmaydi — ular bcrypt orqali hash qilinadi.",
        "Google orqali kirganda Google hisobingizdagi ism, email va profil rasmi olinadi. Bu ma'lumotlar faqat hisobingizni yaratish va kirishni tasdiqlash uchun ishlatiladi.",
      ],
      bullets: [
        "Hisob ma'lumotlari: ism, email, telefon, hudud va rol.",
        "Faoliyat: mahsulot va xizmat e'lonlari, buyurtmalar, sevimlilar, savat, xabarlar va fikrlar.",
        "To'lovlar: hamyon balansi, bank o'tkazmasi so'rovlari, to'lov tarixi va Payme/Click tranzaksiya identifikatorlari.",
        "Texnik ma'lumotlar: sessiya cookie fayli, xavfsizlik uchun IP manzil va so'rov vaqti.",
      ],
    },
    {
      title: "Ma'lumotlardan foydalanish maqsadi",
      paragraphs: [
        "Ma'lumotlar xizmatni ko'rsatish, buyurtmalarni bajarish, to'lovlarni tasdiqlash, sotuvchi va xaridor o'rtasidagi aloqani ta'minlash, xavfsizlikni himoya qilish va qo'llab-quvvatlash uchun ishlatiladi.",
        "Marketing xabarlari faqat siz ro'yxatdan o'tgan yoki aniq rozilik bildirgan taqdirda yuboriladi. Istalgan vaqtda obunani bekor qilishingiz mumkin.",
      ],
    },
    {
      title: 'Uchinchi tomonlar va cookie',
      paragraphs: [
        "Platforma ishlashi uchun quyidagi xizmatlardan foydalanadi: Vercel (sayt va serverless API hosting), Neon (Postgres baza), Google (OAuth kirish), shuningdek yoqilganda Payme yoki Click (onlayn to'lov). Har bir xizmat o'z maxfiylik siyosatiga ega.",
        "Kirish uchun `agroserv_session` nomli HttpOnly cookie ishlatiladi. U 30 kun amal qiladi va faqat hisobingizni xavfsiz saqlash uchun kerak. Reklama tarmoqlari va kuzatuvchi cookie fayllar ishlatilmaydi.",
      ],
    },
    {
      title: "Ma'lumotlar xavfsizligi",
      paragraphs: [
        "Sayt HTTPS orqali ishlaydi. Sessiya cookie HttpOnly va SameSite himoyasi bilan beriladi, parollar bcrypt bilan hash qilinadi, barcha muhim amallar serverda tekshiriladi.",
        "Parolni unutgan bo'lsangiz, kirish sahifasidagi «Parolni unutdingizmi?» orqali so'rov yuboring. Administrator yangi parol yaratadi va uni siz bilan bog'lanish kanali orqali beradi.",
      ],
    },
    {
      title: 'Sizning huquqlaringiz',
      bullets: [
        "Profilingizni tahrirlash va ma'lumotlarni yangilash.",
        "Parolni o'zgartirish yoki tiklash so'rovini yuborish.",
        "Sevimlilar, savat va buyurtmalarni boshqarish.",
        "Hisobingizni va tegishli ma'lumotlarni o'chirishni qo'llab-quvvatlash orqali so'rash.",
        "O'zingiz haqingizdagi ma'lumotlarning nusxasini so'rash.",
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
      updated="12 noyabr 2026"
      icon={ShieldCheck}
      sections={sections}
      footerNote="Ushbu hujjat platforma faoliyatini tavsiflaydi. Rasmiy yuridik hujjat sifatida foydalanishdan oldin yuridik ekspertizadan o'tkazish tavsiya etiladi."
    />
  )
}

export function Terms() {
  const sections = [
    {
      title: 'Platformadan foydalanish',
      paragraphs: [
        "AgroServ — O'zbekiston fermerlari, sotuvchilar va mutaxassislari uchun agro ekotizim platformasi. Saytdan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.",
        "Platforma «bor holaticha» taqdim etiladi. Xizmat vaqti-vaqti bilan yangilanadi, texnik ishlar yoki uzilishlar bo'lishi mumkin.",
      ],
    },
    {
      title: 'Hisob va rollar',
      bullets: [
        "Ro'yxatdan o'tishda Fermer, Sotuvchi, Texnika ustasi yoki Agronom rolini o'zingiz tanlaysiz.",
        "Har bir foydalanuvchi bitta shaxsiy hisob ochishi va haqiqiy ma'lumot kiritishi kerak.",
        "Parol maxfiy saqlanadi. Hisobingiz orqali qilingan amallar uchun siz javobgarsiz.",
        "Administrator rolini faqat mavjud administrator panel orqali beradi.",
      ],
      paragraphs: [
        "Hisob ma'lumotlarini himoya qilish sizning zimmangizda. Shubhali kirishni sezsangiz, darhol parolni o'zgartiring va qo'llab-quvvatlashga murojaat qiling.",
      ],
    },
    {
      title: "E'lonlar va kontent",
      paragraphs: [
        "E'lon joylashtirishda haqiqiy, aniq va qonuniy ma'lumot bering. Noto'g'ri narx, yolg'on tavsif, qalbaki mahsulot yoki boshqa foydalanuvchilarni chalg'ituvchi kontent taqiqlanadi.",
        "Platforma e'lonlarni moderatsiya qilish, to'xtatish yoki o'chirish huquqini saqlaydi. E'lon mazmuni uchun uni joylashtirgan foydalanuvchi javobgar.",
      ],
    },
    {
      title: "To'lovlar va monetizatsiya",
      paragraphs: [
        "Tariflar: Bepul (5% komissiya), Plus (3%) va Pro (1%). Obuna to'lovi hamyon, bank o'tkazmasi yoki yoqilgan onlayn to'lov orqali amalga oshiriladi.",
        "Bank o'tkazmasi administrator tasdig'idan keyin faollashadi. Hamyon to'lovi darhol yechiladi. Naqd buyurtmada to'lov yetkazib berishda amalga oshiriladi va buyurtma yakunlanganda sotuvchidan platforma komissiyasi yechiladi.",
        "Payme va Click faqat tegishli merchant sozlamalari ulanganda ishlaydi. Promo kodlar serverda tekshiriladi va bir martalik yoki cheklangan miqdorda qo'llanilishi mumkin.",
      ],
    },
    {
      title: 'Buyurtma va yetkazib berish',
      paragraphs: [
        "AgroServ xaridor va sotuvchi o'rtasidagi vositachi platforma. Mahsulot sifati, yetkazib berish muddati va xizmat natijasi uchun mas'uliyat tegishli sotuvchi yoki mutaxassis zimmasida.",
        "Nizo yuzaga kelsa, buyurtma raqami bilan qo'llab-quvvatlash xizmatiga murojaat qiling. Platforma tomonlarga ma'lumot almashishda yordam beradi.",
      ],
    },
    {
      title: 'Javobgarlik chegarasi',
      paragraphs: [
        "Platforma foydalanuvchilar tomonidan joylashtirilgan kontentning to'g'riligi yoki uchinchi tomon xizmatlarining uzluksiz ishlashi uchun to'liq kafolat bermaydi.",
        "Qonun bilan ruxsat etilgan chegarada platforma bilvosita, tasodifiy yoki natijaviy zararlar uchun javobgarlikni o'z zimmasiga olmaydi.",
      ],
    },
    {
      title: "Shartlarni o'zgartirish",
      paragraphs: [
        "Platforma yangilanganda ushbu shartlar o'zgarishi mumkin. Yangilangan sana sahifa boshida ko'rsatiladi. O'zgarishlardan keyin platformadan foydalanishda davom etsangiz, yangi shartlarga rozilik bildirgan hisoblanasiz. Savollar uchun salom@agroserv.uz manziliga murojaat qiling.",
      ],
    },
  ]

  return (
    <LegalLayout
      eyebrow="Huquqiy ma'lumot"
      title="Foydalanish shartlari"
      description="Platformadan foydalanish qoidalari, rollar, e'lonlar, to'lovlar va javobgarlik chegaralari."
      updated="12 noyabr 2026"
      icon={FileText}
      sections={sections}
      footerNote="Ushbu hujjat namunaviy matn hisoblanadi va yuridik maslahat o'rnini bosmaydi. Tijoriy foydalanishdan oldin yuridik ekspertizadan o'tkazish tavsiya etiladi."
    />
  )
}
