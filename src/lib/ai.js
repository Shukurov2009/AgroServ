const KNOWLEDGE = [
  {
    keywords: ['pomidor', 'fitoftora', 'tomato'],
    title: "🍅 Pomidor bo'yicha maslahat",
    answer:
      "Pomidorda eng ko'p uchraydigan muammolar va yechimlar:\n\n" +
      "1. Fitoftora (kechki chirish) — barglarda jigarrang dog'lar, mevada qattiq dog'lar paydo bo'ladi. Namlik yuqori bo'lganda tez tarqaladi. Profilaktika uchun havo aylanishini yaxshilang, barglarni pastdan kesib turing, azotni me'yorida bering. Kasallik boshlanganda mis preparatlari yoki ruxsat etilgan fungitsidlardan foydalaning.\n" +
      "2. Kulrang chirish — gullash davrida namlik ko'p bo'lsa uchraydi. Issiqxonani ventilyatsiya qiling, sug'orishni ertalab qiling.\n" +
      "3. Oqish (xloroz) — temir yoki azot yetishmasligi belgisi. Tuproq tahlilini qildiring, bargdan oziqlantirish bering.\n\n" +
      "💡 Amaliy maslahat: pomidorni 3-4 yilda bir marta o'zgartirilgan joyga eking, har yili bir xil joyda ekish kasalliklarni ko'paytiradi.",
  },
  {
    keywords: ["bug'doy", 'bugdoy', 'wheat', 'g\'alla', 'galla'],
    title: "🌾 Bug'doy bo'yicha maslahat",
    answer:
      "Bug'doy yetishtirishda asosiy bosqichlar:\n\n" +
      "• Ekish: tuproq 8–10 sm chuqurlikda, urug' 180–220 kg/ga (navga qarab). Ekishdan oldin urug'ni fungitsid bilan dorilang.\n" +
      "• O'g'itlash: azotni 2–3 bo'lib bering — kuzda 30%, bahorda 40%, naychalash davrida 30%. Fosfor va kaliy ekish oldidan.\n" +
      "• Sug'orish: kritik davrlar — naychalash va don to'lishi. Har sug'orishda 600–800 m³/ga.\n" +
      "• Kasalliklar: zang, septerioz va fuzariozga qarshi profilaktika qiling. Bargda sariq-jigarrang dog'lar paydo bo'lsa, fungitsid qo'llang.\n\n" +
      "💡 Hosildorlikni oshirish uchun ekishdan oldin tuproq tahlili qildiring va nav tanlashda viloyat uchun tavsiya etilgan navlarni tanlang.",
  },
  {
    keywords: ['kartoshka', 'potato'],
    title: "🥔 Kartoshka bo'yicha maslahat",
    answer:
      "Kartoshka parvarishida e'tibor bering:\n\n" +
      "1. Urug'lik: 30–60 g o'lchamdagi sog'lom tugunaklar, ekishdan oldin ko'kartirilgan bo'lsin.\n" +
      "2. Ekish: tuproq 8–10°C isiganda, 8–10 sm chuqurlikda, qator orasi 70 sm.\n" +
      "3. O'g'itlash: 1 gektarga 60–90 kg azot, 60–80 kg fosfor, 90–120 kg kaliy (tuproq tahliliga qarab).\n" +
      "4. Fitoftora: nam va salqin havoda tez tarqaladi. Profilaktik ishlovni gullashdan oldin boshlang.\n" +
      "5. Kolorado qo'ng'izi: barg ostini muntazam tekshiring, qo'lda yig'ish yoki ruxsat etilgan insektitsid.\n\n" +
      "💡 Kartoshkani 3 yilda bir marta o'zgartirilgan joyga eking. Tugunakni saqlashdan oldin 2 hafta qorong'i va salqin joyda quriting.",
  },
  {
    keywords: ['olma', 'apple', "bog'", 'bog'],
    title: "🍎 Olma bog'i bo'yicha maslahat",
    answer:
      "Olma bog'ida asosiy ishlar:\n\n" +
      "• Bahorgi kesish: quruq, kasal va bir-biriga ishqalanuvchi shoxlarni olib tashlang. Tojni yorug'lik o'tadigan qilib shakllantiring.\n" +
      "• O'g'itlash: bahorda azot, yozda fosfor-kaliy. Organik o'g'itni kuzda 3–4 yilda bir marta.\n" +
      "• Kasalliklar: parsha (qora dog'lar), un-shudring, olma meva chirishi. Profilaktika uchun bahorda mis preparati bilan ishlov bering.\n" +
      "• Zararkunandalar: olma meva qurti, shira. Feromon tuzoqlar va ruxsat etilgan insektitsidlar.\n" +
      "• Sug'orish: yosh bog'ni har 10–14 kunda, katta bog'ni kritik davrlarda.\n\n" +
      "💡 Har yili hosildan keyin bog'ni tozalang: tushgan barg va kasal mevalarni yo'q qiling — bu keyingi yilgi kasallikni kamaytiradi.",
  },
  {
    keywords: ['uzum', 'grape', 'tok'],
    title: "🍇 Uzum bo'yicha maslahat",
    answer:
      "Uzum parvarishida:\n\n" +
      "1. Kesish: qish oxirida, ko'zlar uyg'onishidan oldin. Har tokda 40–60 ko'z qoldiring (navga qarab).\n" +
      "2. Oziqlantirish: bahorda azot, gullashdan oldin fosfor, meva tugishida kaliy.\n" +
      "3. Kasalliklar: mildyu (oq un), oidium, kulrang chirish. Namlik yuqori bo'lsa, profilaktik fungitsid ishlovini o'tkazing.\n" +
      "4. Sug'orish: gullash va meva tugish davrida barqaror namlik. Pishish davrida sug'orishni kamaytiring — shakar to'planadi.\n" +
      "5. Hosilni me'yorlash: ortiqcha uzum barglarini yupqalashtiring, havo aylansin.\n\n" +
      "💡 Uzumni shamol o'tadigan joyga eking. Sershox tok kasallikka ko'proq chalinadi.",
  },
  {
    keywords: ['karbamid', 'urea', 'azot', 'ammiak'],
    title: "🧪 Azotli o'g'itlar (Karbamid) haqida",
    answer:
      "Karbamid (Urea) — eng yuqori azotli o'g'it (46% N). Uni to'g'ri qo'llash:\n\n" +
      "• Doza: don ekinlari uchun 150–250 kg/ga, sabzavotlar uchun 100–150 kg/ga. Tuproq tahliliga qarab aniqlang.\n" +
      "• Vaqt: bahorda, o'simlik faol o'sayotganda. Kuzda qo'llash azotning yuvilishiga olib keladi.\n" +
      "• Usul: tuproqqa 5–8 sm chuqurlikda bering yoki eritib sug'orish suvi bilan. Bargga sepish kechqurun yoki bulutli havoda.\n" +
      "• Aralashtirmang: karbamidni ohak, kul va kalsiy bilan bir vaqtda aralashtirmang — azot yo'qoladi.\n\n" +
      "💡 Karbamiddan keyin 2–3 kun ichida sug'oring. Quruq tuproqda azot samarasi keskin pasayadi.",
  },
  {
    keywords: ['npk', 'fosfor', 'kaliy', 'superfosfat', 'kompleks'],
    title: "🌱 NPK va kompleks o'g'itlar",
    answer:
      "NPK 16-16-16 — azot, fosfor va kaliy teng nisbatda bo'lgan universal kompleks o'g'it.\n\n" +
      "• Ekish oldidan: 300–500 kg/ga, tuproqqa aralashtirib bering.\n" +
      "• O'sish davrida: 100–200 kg/ga, 2–3 bo'lib.\n" +
      "• Fosfor ildiz va gullash uchun, kaliy meva sifati va kasallikka chidamlilik uchun javobgar.\n" +
      "• Superfosfatni kuzda yoki ekish oldidan chuqurroq bering — fosfor tuproqda sekin harakatlanadi.\n" +
      "• Kaliy xloridni xloridga sezgir ekinlarga (uzum, meva) ehtiyotkorlik bilan qo'llang.\n\n" +
      "💡 O'g'itni har yili tuproq tahlili asosida tanlang. Ko'r-ko'rona ko'p o'g'it berish hosilni oshirmaydi, xarajatni oshiradi.",
  },
  {
    keywords: ["sug'orish", 'sugorish', 'tomchilatib', 'drip', 'suv'],
    title: "💧 Sug'orish tizimi bo'yicha maslahat",
    answer:
      "Tomchilatib sug'orish tizimini to'g'ri qo'llash:\n\n" +
      "1. Rejalashtirish: ekin turi, tuproq va iqlimga qarab kunlik suv me'yorini hisoblang. Sabzavotlar uchun 3–6 l/buta, mevalar uchun 10–20 l/daraxt.\n" +
      "2. Filtr: tizim boshiga 120–200 mesh filtr o'rnating — tomchilatgichlar tiqilib qolmasin.\n" +
      "3. Bosim: 1–1.5 bar. Har bir liniyada bosim regulyatori bo'lsa yaxshi.\n" +
      "4. O'g'itlash: fertigatsiya bilan ozuqa bering, lekin tizimni toza suv bilan yuvib tashlang.\n" +
      "5. Xizmat: har oyda filtrlarni tozalang, mavsum oxirida tizimni yuvib, suvni to'kib tashlang.\n\n" +
      "💡 Sug'orishni erta tongda qiling — bug'lanish kam, namlik uzoq saqlanadi.",
  },
  {
    keywords: ['kasallik', 'sariq', 'barg', 'dog', 'chirish', 'zamburug'],
    title: "🩺 O'simlik kasalligini aniqlash",
    answer:
      "Kasallikni aniqlash uchun quyidagi belgilarni tekshiring:\n\n" +
      "• Barglarda sariq dog'lar + jigarrang chegaralar → zamburug'li kasallik (fitoftora, septerioz).\n" +
      "• Barg oqarishi, tomirlar yashil qolishi → temir xloroz yoki virus.\n" +
      "• Barg ostida oq kulrang qatlam → un-shudring yoki oidium.\n" +
      "• Mevada yumshoq chirish → bakterial chirish yoki kulrang chirish.\n" +
      "• O'simlik so'lib qolishi, ildizda jigarrang → ildiz chirishi yoki fusarioz.\n\n" +
      "Birinchi qadam: kasal bargni uzib, sog'lom qismdan ajrating; qaychi va qo'lni dezinfeksiya qiling. Keyin namlikni kamaytiring va havo aylanishini yaxshilang.\n\n" +
      "💡 Aniq tashxis uchun kasal bargning rasmimosini yuboring yoki tuman agronomiga murojaat qiling.",
  },
  {
    keywords: ['zararkunanda', 'hasharot', 'qo\'ng\'iz', 'shira', 'qurt', 'kana'],
    title: "🐜 Zararkunandalar bilan kurash",
    answer:
      "Eng ko'p uchraydigan zararkunandalar:\n\n" +
      "• Shira — yosh barg va novdalarda to'planadi. Sabunli eritma yoki insektitsid bilan ishlov bering.\n" +
      "• Kolorado qo'ng'izi — kartoshka barglarini yeydi. Tuxumlarni qo'lda yig'ing, ruxsat etilgan preparat qo'llang.\n" +
      "• Olma meva qurti — mevaga kirib zarar qiladi. Feromon tuzoq va profilaktik insektitsid.\n" +
      "• O'rgimchak kana — barg ostida mayda nuqtalar, o'rgimchak to'ri. Namlikni oshiring, akaritsid qo'llang.\n\n" +
      "Muhim: insektitsidni faqat ko'rsatmadagi dozada qo'llang, asalarilar uchun gullash davrida ehtiyot bo'ling. Hosildan keyin 20–30 kun kutish muddatiga rioya qiling.",
  },
  {
    keywords: ['tuproq', 'ph', 'tahlil', 'unumdor', 'sho\'r', 'shor'],
    title: "🪨 Tuproq va unumdorlik",
    answer:
      "Tuproq unumdorligini oshirish bo'yicha amaliy qadamlar:\n\n" +
      "1. Tahlil: har 3 yilda bir marta pH, gumus, azot-fosfor-kaliy va sho'rlanishni tekshiring.\n" +
      "2. pH: 6.0–7.0 ko'p ekinlar uchun optimal. Kislotali tuproqqa ohak, ishqoriy tuproqqa gips qo'llang.\n" +
      "3. Organika: go'ng, kompost yoki siderat (yashil o'g'it) bilan gumusni oshiring.\n" +
      "4. Almashlab ekish: bir oila ekinini ketma-ket 3 yildan ortiq ekmaslik kasallik va zararkunandani kamaytiradi.\n" +
      "5. Eroziya: nishab yerlarga ko'ndalang shudgor, tuproqni somon bilan qoplash.\n\n" +
      "💡 Sho'rlangan yerda sug'orishni kamaytiring, drenaj yaxshilang va tuzga chidamli ekinlarni tanlang.",
  },
  {
    keywords: ['ekish', 'urug', 'ko\'chat', 'kochat', 'unib'],
    title: "🌱 Ekish va ko'chat bo'yicha maslahat",
    answer:
      "Sifatli ko'chat va to'g'ri ekish:\n\n" +
      "• Urug'lik: sertifikatlangan, nav tozaligi yuqori urug' tanlang. Ekishdan oldin unuvchanlikni tekshiring.\n" +
      "• Davolash: urug'ni fungitsid va insektitsid bilan dorilang.\n" +
      "• Tuproq: 10–12°C isiganda ekishni boshlang. Juda erta ekish sovuq urug' bilan kasallik keltiradi.\n" +
      "• Chuqurlik: mayda urug' 2–3 sm, yirik urug' 5–8 sm.\n" +
      "• Ko'chat: 4–6 haqiqiy barg chiqqanda ochiq yerga ko'chiring, 3–5 kun oldin asta-sekin quyoshga o'rgating.\n\n" +
      "💡 Ekishdan keyin tuproqni zichlab bering — urug' bilan tuproq yaqin bo'lsa, tez unib chiqadi.",
  },
  {
    keywords: ['iqlim', 'issiq', 'sovuq', 'ayoz', 'yel', 'yomg\'ir', 'yomgir'],
    title: "🌤 Iqlim va ob-havo risklari",
    answer:
      "Ob-havo risklariga tayyorgarlik:\n\n" +
      "• Bahorgi ayoz: ekinlarni somon, agrotexnik mato yoki tunnel bilan yoping. Sug'orish ayozdan 1–2 kun oldin tuproq issiqligini oshiradi.\n" +
      "• Issiq to'lqin: sug'orishni erta tong va kechqurunga ko'chiring, tuproqni mulch qiling.\n" +
      "• Kuchli yomg'ir: drenaj ariqlarini tozalang, past joylardan ekin ekishdan saqlaning.\n" +
      "• Do'l: do'l to'ri yoki himoya tuzilmalari meva bog'lari uchun samarali.\n\n" +
      "💡 Har kuni 7 kunlik ob-havo prognozini kuzatib boring va ishlov berishni shamolsiz, yomg'irsiz kunga rejalashtiring.",
  },
  {
    keywords: ['chorva', 'qoramol', 'qo\'y', 'qoy', 'sigir', 'emlash', 'vet'],
    title: "🐄 Chorvachilik bo'yicha maslahat",
    answer:
      "Chorvachilikda asosiy e'tibor:\n\n" +
      "• Ozuqa: quruq modda, protein va energiya balansini saqlang. Sog'in sigirga kuniga 15–20 kg quruq ozuqa.\n" +
      "• Suv: toza va yetarli — sigir kuniga 60–80 litr suv ichadi.\n" +
      "• Emlash: brutsellyoz, qorason va boshqa rejali emlashlarni veterinariya kalendariga muvofiq qiling.\n" +
      "• Gigiyena: oqibatxona quruq, toza bo'lsin; somatik hujayra sonini nazorat qiling.\n" +
      "• Sog'liq: ishtaha pasayishi, harorat ko'tarilishi — birinchi belgilar. Veterinarni kechiktirmasdan chaqiring.\n\n" +
      "💡 Har bir hayvon uchun individual kartochka yuriting: emlash, tug'ilish, sut mahsuldorligi.",
  },
  {
    keywords: ['narx', 'bozor', 'sotish', 'savdo', 'mijoz', 'marketing'],
    title: "📈 Agro mahsulotni sotish",
    answer:
      "Mahsulotni foydali sotish bo'yicha maslahat:\n\n" +
      "1. Sifatni ko'rsating: mahsulot rasmi, navi, hosil sanasi va saqlash shartlarini aniq yozing.\n" +
      "2. Narxni bozor bilan solishtiring: AgroServ bozorida o'xshash mahsulotlar narxini kuzatib turing.\n" +
      "3. Minimal buyurtma va yetkazib berish shartlarini aniq belgilang.\n" +
      "4. Mijoz izohlariga tez javob bering — bu ishonchni oshiradi.\n" +
      "5. Top mahsulot xizmatidan foydalaning: reklama qilingan mahsulotlar 3–5 baravar ko'proq ko'riladi.\n" +
      "6. Obuna yo'q: e'lonlar cheksiz, savdo komissiyasi 5% — summaning 95% sizga qoladi.\n\n" +
      "💡 Birinchi savdoni tezroq boshlash uchun kichik partiyadan boshlang va sifat bilan obro' orttiring.",
  },
  {
    keywords: ['agroserv', 'platforma', 'obuna', 'tarif', 'to\'lov', 'tolov', 'komissiya', 'admin'],
    title: "🌐 AgroServ platformasi bo'yicha yordam",
    answer:
      "AgroServ'da quyidagilar mavjud:\n\n" +
      "• Bozor: texnika, meva-sabzavot va o'g'itlar. Savatga qo'shib, karta yoki hamyon orqali to'lang.\n" +
      "• Xizmatlar: texnika ustalari va agronomlarni yollang, gektar yoki tashrif bo'yicha hisoblang.\n" +
      "• Ish o'rinlari: agro sohada ish toping yoki e'lon joylang.\n" +
      "• AI maslahatchi: kuniga 50 ta bepul savol (fair-use).\n" +
      "• Narxlar: obuna yo'q — 5% savdo komissiyasi, e'lonlar cheksiz.\n" +
      "• Rollar: Fermer, Sotuvchi, Texnika ustasi, Agronom va Administrator.\n\n" +
      "Savolingiz bo'lsa, «Haqida» sahifasidagi aloqa formasi orqali yozing yoki qo'llab-quvvatlash raqamiga qo'ng'iroq qiling.",
  },
  {
    keywords: ['salom', 'assalom', 'hello', 'qalesiz', 'qalaysiz', 'rahmat'],
    title: "👋 Salom!",
    answer:
      "Assalomu alaykum! Men AgroServ AI maslahatchisiman. 🌱\n\n" +
      "Menga quyidagilar bo'yicha savol bering:\n" +
      "• O'simlik kasalliklari va davolash\n" +
      "• O'g'itlash va sug'orish\n" +
      "• Ekish, ko'chat va tuproq\n" +
      "• Chorvachilik va bozor narxlari\n" +
      "• AgroServ xizmatlari va bepul imkoniyatlar\n\n" +
      "Rasm yuborsangiz, o'simlik holatini tahlil qilishga harakat qilaman.",
  },
]

export const AI_SUGGESTIONS = [
  "Pomidorda sariq dog'lar paydo bo'ldi, nima qilay?",
  "Bug'doyni qanday o'g'itlash kerak?",
  "Karbamidni qachon qo'llash to'g'ri?",
  "Tomchilatib sug'orish tizimini qanday o'rnataman?",
  "Olma bog'ini bahorda qanday parvarishlayman?",
  "AgroServ'da qanday bepul imkoniyatlar bor?",
]

function findAnswer(message) {
  const text = message.toLowerCase()
  let best = null
  let bestScore = 0
  for (const item of KNOWLEDGE) {
    const score = item.keywords.reduce(
      (total, keyword) => (text.includes(keyword.toLowerCase()) ? total + 1 : total),
      0,
    )
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }
  return best
}

function imageAnalysis(imageName = '') {
  const name = imageName.toLowerCase()
  let subject = "o'simlik"
  if (name.includes('pomidor') || name.includes('tomato')) subject = 'pomidor'
  else if (name.includes('olma') || name.includes('apple')) subject = 'olma'
  else if (name.includes('uzum') || name.includes('grape')) subject = 'uzum'
  else if (name.includes('kartoshka') || name.includes('potato')) subject = 'kartoshka'
  else if (name.includes('bug') || name.includes('wheat')) subject = "bug'doy"

  return (
    `🖼 Rasm tahlili\n\n` +
    `Rasmda ${subject} aks etgan deb taxmin qildim. Rasm sifati va yorug'likka qarab aniq tashxis qiyin bo'lishi mumkin.\n\n` +
    `Tekshirishni tavsiya qilaman:\n` +
    `1. Barglarda sariq, jigarrang yoki kulrang dog'lar bormi?\n` +
    `2. Barg ostida hasharot, o'rgimchak to'ri yoki oq qatlam bormi?\n` +
    `3. O'simlikning pastki yoki yuqori qismi ko'proq zararlanganmi?\n` +
    `4. Namlik va harorat qanday?\n\n` +
    `Agar dog'lar namlik bilan bog'liq bo'lsa, sug'orishni kamaytiring, havo aylanishini yaxshilang va kasal barglarni olib tashlang. Zamburug'li kasallik ehtimoli yuqori bo'lsa, ruxsat etilgan fungitsid bilan profilaktik ishlov bering.\n\n` +
    `⚠️ Aniq tashxis uchun yashash joyingizdagi agronomga murojaat qiling. Bu javob AgroServ bilim bazasi asosida tayyorlandi.`
  )
}

export function getAiReply(message = '', imageName = '') {
  if (imageName) return imageAnalysis(imageName)
  const match = findAnswer(message)
  if (match) return `${match.title}\n\n${match.answer}`

  return (
    "🌱 Savolingiz uchun rahmat!\n\n" +
    "Aniqroq maslahat berish uchun quyidagilarni yozing:\n" +
    "• Qaysi ekin yoki o'simlik haqida gapiryapsiz?\n" +
    "• Muammo qanday belgilar bilan namoyon bo'lyapti?\n" +
    "• Qaysi viloyatda, qanday tuproqda ekilgan?\n" +
    "• Sug'orish va o'g'itlash qanday amalga oshiriladi?\n\n" +
    "Masalan: «Pomidorda barglari sariq bo'lib qoldi, issiqxonada ekilgan» yoki «Bug'doyga qancha karbamid berish kerak?».\n\n" +
    "💡 AgroServ AI bilim bazasidan tayyorlangan javob beradi. Aniq tashxis va yakuniy qaror uchun agronomga murojaat qiling."
  )
}
