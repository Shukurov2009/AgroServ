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
      "💡 Aniq tashxis uchun kasal bargning rasmini yuboring yoki tuman agronomiga murojaat qiling.",
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
    keywords: ['ekish', 'urug', "ko'chat", 'kochat', 'unib', 'transplant', 'ko‘chat', 'ko‘chat ekish'],
    title: "🌱 Ko'chat va ekishning asosiy usullari",
    answer:
      "Ko'chat ekishning bir nechta usuli bor — tanlov ekin turi, iqlim, maydon va sug'orish imkoniyatiga bog'liq:\n\n" +
      "1. Ko'chatni ochiq yerga ko'chirish (transplanting)\n" +
      "• Ko'chat 4–6 haqiqiy barg chiqqanda, tuproq 10–12°C isiganda ekiladi.\n" +
      "• Ekishdan 3–5 kun oldin ko'chatni asta-sekin tashqi havoga o'rgating (hardening).\n" +
      "• Chuqurcha ko'chat ildiz bo'g'zidan 1–2 sm chuqurroq bo'lsin; ildizni shikastlamang.\n" +
      "• Ekishdan keyin sug'oring va tuproqni yengil zichlang.\n" +
      "• Masofa: pomidor 50–60 sm, qalampir 30–40 sm, bodring 30–40 sm (nav va shaklga qarab).\n\n" +
      "2. To'g'ridan-to'g'ri urug' ekish (direct sowing)\n" +
      "• Ko'chirishni yoqtirmaydigan ekinlar (sabzi, sholg'om, rediska, makkajo'xori, loviya) uchun mos.\n" +
      "• Tuproq 10–12°C isiganda, mayda urug' 2–3 sm, yirik urug' 5–8 sm chuqurlikda ekiladi.\n" +
      "• Qator orasi ekinga qarab 20–70 sm; ekishdan keyin sug'orib, tuproqni zichlang.\n" +
      "• Unib chiqqach, ortiqcha ko'chatlarni yupqalang.\n\n" +
      "3. Issiqxona yoki tunnelda ko'chat yetishtirish\n" +
      "• Erta hosil va sovuqdan himoya uchun ishlatiladi.\n" +
      "• Ko'chat uchun yengil, unumdor tuproq aralashmasi: 2 qism tuproq + 1 qism kompost + 1 qism qum.\n" +
      "• Harorat 20–25°C, yorug'lik yetarli bo'lsin; sug'orishni mo''tadil qiling.\n" +
      "• Ko'chat cho'zilib ketmasligi uchun yorug'likni oshiring va ortiqcha azot bermang.\n\n" +
      "4. Plyonka yoki agrotexnik mato ostida ekish\n" +
      "• Tuproq tez isiydi, namlik saqlanadi, begona o't kamayadi.\n" +
      "• Plyonka ostida ekishdan oldin tuproqni yaxshilab sug'oring va o'g'itlang.\n" +
      "• Teshiklar orasini ekinga moslang; kunduzi ventilyatsiya qiling, kechasi yoping.\n\n" +
      "5. Konteyner yoki qoplamada ekish\n" +
      "• Kichik maydon, balkon yoki ko'chat bosqichi uchun mos.\n" +
      "• Idishda drenaj teshiklari bo'lsin; har kuni namlikni tekshiring.\n" +
      "• Oziqlantirishni suv bilan birga bering, lekin botqoqlashtirmang.\n\n" +
      "Umumiy qoidalar:\n" +
      "• Ekishdan oldin tuproqni 20–25 sm chuqurlikda yumshating, begona o't va ildizlarni tozalang.\n" +
      "• Tuproq tahlili bo'lsa, o'g'itni shunga qarab tanlang.\n" +
      "• Ekishdan keyin birinchi sug'orishni iliq suv bilan qiling.\n" +
      "• Kuzda siderat ekib, tuproq unumdorligini oshiring.\n\n" +
      "💡 Qaysi usulni tanlashni bilmoqchi bo'lsangiz, ekin nomi, viloyat, maydon va sug'orish imkoniyatini yozing — aniqroq tavsiya beraman.",
  },
  {
    keywords: ["ko'chat", 'kochat', 'rassada', 'ko‘chat', 'ko‘chatxona', 'kochatxona'],
    title: "🪴 Ko'chat parvarishi",
    answer:
      "Sifatli ko'chat yetishtirish bosqichlari:\n\n" +
      "• Urug'lik: sertifikatlangan, nav tozaligi yuqori urug' tanlang. Ekishdan oldin unuvchanlikni tekshiring.\n" +
      "• Tuproq aralashmasi: 2 qism unumdor tuproq + 1 qism kompost + 1 qism qum. Aralashmani elakdan o'tkazing.\n" +
      "• Ekish: mayda urug'ni 0.5–1 sm, yirik urug'ni 2–3 sm chuqurlikda eking. Ustini yengil yoping.\n" +
      "• Harorat: unib chiqishda 22–25°C, keyin 18–22°C. Kechasi 15–18°C bo'lsa ko'chat baquvvat bo'ladi.\n" +
      "• Yorug'lik: kuniga 12–14 soat. Deraza tokchasi yetarli bo'lmasa, fitolampa ishlating.\n" +
      "• Sug'orish: tuproq ustki qatlami quriganda iliq suv bilan. Haddan tashqari ko'p sug'orish ildiz chirishiga olib keladi.\n" +
      "• Oziqlantirish: 2–3 haqiqiy barg chiqqach, suyultirilgan kompleks o'g'it bilan bering.\n" +
      "• Pikirovka: ko'chatlar bir-biriga tegib qolsa, alohida idishga ko'chiring.\n" +
      "• Hardening: ochiq yerga ekishdan 3–5 kun oldin kunduzi tashqi havoga chiqaring, vaqtini asta-sekin oshiring.\n\n" +
      "💡 Ko'chat cho'zilib ketsa, yorug'likni oshiring, haroratni pasaytiring va azotli o'g'itni kamaytiring.",
  },
  {
    keywords: ['issiqxona', 'teplitsa', 'tunnel', 'plyonka', 'greenhouse'],
    title: "🏠 Issiqxona va tunnel bo'yicha maslahat",
    answer:
      "Issiqxonada sog'lom hosil yetishtirish:\n\n" +
      "• Harorat: kunduzi 22–28°C, kechasi 15–18°C. 30°C dan yuqori bo'lsa, ventilyatsiya qiling.\n" +
      "• Namlik: 60–70%. Namlik yuqori bo'lsa, zamburug'li kasalliklar tez tarqaladi.\n" +
      "• Ventilyatsiya: har kuni ertalab va kechqurun havo almashtiring. Kondensatsiya bo'lsa, darhol ventilyatsiya qiling.\n" +
      "• Sug'orish: ertalab, iliq suv bilan. Tomchilatib sug'orish namlikni barqaror ushlaydi.\n" +
      "• O'g'itlash: fertigatsiya bilan kichik dozalarda, haftada 1–2 marta.\n" +
      "• Kasalliklar: fitoftora, kulrang chirish, un-shudring. Profilaktika uchun havo aylanishi va barglarni pastdan kesish.\n" +
      "• Zararkunandalar: oq qanot, shira, o'rgimchak kana. Sariq yopishqoq tuzoqlar va ruxsat etilgan preparatlar.\n\n" +
      "💡 Issiqxonani mavsum oxirida tozalang, tuproqni dezinfeksiya qiling va keyingi ekin uchun almashlab ekish rejasini tuzing.",
  },
  {
    keywords: ["sug'orish usul", 'sugorish usul', 'egatlab', "yomg'irlatib", 'sepib sug', 'sug‘orish'],
    title: "💧 Sug'orish usullari",
    answer:
      "Asosiy sug'orish usullari va qachon qaysi biri mos:\n\n" +
      "1. Egatlab sug'orish — an'anaviy usul. Suv egatlar bo'ylab oqadi. Arzon, lekin suv ko'p sarflanadi va tuproq eroziyaga uchraydi. Katta maydon va ko'p suv bo'lsa mos.\n" +
      "2. Tomchilatib sug'orish — suv tomchilab ildiz zonasiga beriladi. Suv 30–50% tejaydi, o'g'itni suv bilan berish mumkin. Sabzavot, bog' va issiqxona uchun eng samarali.\n" +
      "3. Yomg'irlatib sug'orish — suv yomg'ir kabi sepiladi. Yosh ko'chat va o'tlar uchun yaxshi, lekin barg kasalliklarini ko'paytirishi mumkin. Kechqurun yoki ertalab qo'llang.\n" +
      "4. Sepib sug'orish — kichik maydon va ko'chat uchun. Suvni me'yorida bering, barglarni botqoqlashtirmang.\n" +
      "5. Er osti sug'orish — quvurlar tuproq ostida. Suv bug'lanishi kam, begona o't kamayadi. Qimmatroq, lekin uzoq muddatda tejamkor.\n\n" +
      "Umumiy qoidalar:\n" +
      "• Sug'orishni erta tongda qiling — bug'lanish kam.\n" +
      "• Har sug'orishdan keyin tuproq namligini 5–10 sm chuqurlikda tekshiring.\n" +
      "• Ekin turiga qarab suv me'yorini tanlang: sabzavot 3–6 l/buta, meva 10–20 l/daraxt.\n" +
      "• Sho'r suvni ishlatmang yoki ehtiyotkorlik bilan aralashtiring.\n\n" +
      "💡 Tomchilatib sug'orish tizimiga 120–200 mesh filtr o'rnating — tomchilatgichlar tiqilib qolmasin.",
  },
  {
    keywords: ["organik o'g'it", "go'ng", 'gong', 'kompost', 'siderat', 'yashil o‘g‘it'],
    title: "♻️ Organik o'g'it va kompost",
    answer:
      "Organik o'g'itlar tuproq unumdorligini oshiradi:\n\n" +
      "• Go'ng: yaxshi chirigan go'ngni qo'llang. Yangi go'ngni to'g'ridan-to'g'ri ildizga bermang — kuydirishi mumkin. Kuzda 3–5 t/ga, ekishdan oldin 2–3 hafta oldin beriladi.\n" +
      "• Kompost: o'simlik qoldiqlari, go'ng va oshxona chiqindilaridan tayyorlanadi. To'liq chirigan kompostni 2–4 t/ga qo'llang.\n" +
      "• Siderat (yashil o'g'it): beda, no'xat, lupin, gorchitsa. Kuzda ekib, bahorda tuproqqa aralashtiring — azot va organik modda qo'shiladi.\n" +
      "• Biomulch: somon, o't, barglar bilan tuproq ustini qoplang. Namlik saqlanadi, begona o't kamayadi.\n" +
      "• Vermikompost: oz miqdorda ko'chat va issiqxona uchun juda samarali.\n\n" +
      "Muhim:\n" +
      "• Organik o'g'itni har yili tuproq tahliliga qarab bering.\n" +
      "• Kasal o'simlik qoldiqlarini kompostga solmang — kasallik tarqaladi.\n" +
      "• Go'ngni suv bilan aralashtirib, bargga sepishdan oldin suyultiring (1:10).\n\n" +
      "💡 Organik va mineral o'g'itlarni birlashtirib qo'llash ko'pincha eng yaxshi natija beradi.",
  },
  {
    keywords: ['pestitsid', 'fungitsid', 'insektitsid', 'gerbitsid', 'zahar', 'preparat', 'dorilash'],
    title: "🧴 Pestitsidlarni xavfsiz qo'llash",
    answer:
      "Pestitsidlarni qo'llashda xavfsizlik qoidalari:\n\n" +
      "• Faqat ruxsat etilgan va sertifikatlangan preparatlardan foydalaning. Qadoqdagi ko'rsatma va dozaga qat'iy rioya qiling.\n" +
      "• Ishlovdan oldin o'simlik va zararkunanda/kasallikni to'g'ri aniqlang — noto'g'ri preparat foyda bermaydi.\n" +
      "• Himoya vositalari: qo'lqop, respirator, ko'zoynak, uzun kiyim. Ishlovdan keyin qo'l va yuzni yuvib tashlang.\n" +
      "• Shamolli, yomg'irli yoki juda issiq havoda sepmang. Ertalab yoki kechqurun, shamol bo'lmaganda ishlang.\n" +
      "• Asalarilarni himoya qiling: gullash davrida insektitsid sepmang yoki kechqurun qo'llang.\n" +
      "• Hosilni yig'ishdan oldin kutish muddatiga (preparat qadoqidagi muddat) rioya qiling.\n" +
      "• Preparat qoldiqlarini suv manbalariga to'kmang; idishlarni belgilangan joyda yo'q qiling.\n" +
      "• Bir xil preparatni tez-tez ishlatmang — zararkunandada chidamlilik paydo bo'ladi. Faol moddalarni almashtiring.\n\n" +
      "⚠️ Aniq doza va preparat tanlash uchun mahalliy agronom yoki o'simliklarni himoya qilish xizmatiga murojaat qiling.",
  },
  {
    keywords: ['paxta', 'cotton', 'g‘o‘za', "g'o'za", 'goza'],
    title: "🌿 Paxta yetishtirish",
    answer:
      "Paxta yetishtirishda asosiy bosqichlar:\n\n" +
      "• Tuproq: chuqur, unumdor, yaxshi drenajlangan tuproq. Sho'rlangan va botqoq yerda hosil past bo'ladi.\n" +
      "• Ekish: tuproq 14–16°C isiganda, 4–5 sm chuqurlikda, qator orasi 60–90 sm. Urug'ni ekishdan oldin dorilang.\n" +
      "• O'g'itlash: azotni 2–3 bo'lib, fosfor va kaliyni ekish oldidan. Barg tahlili asosida oziqlantiring.\n" +
      "• Sug'orish: unib chiqish, gullash va ko'sak tugish davrida barqaror namlik. Pishish davrida sug'orishni kamaytiring.\n" +
      "• Agrotexnika: yupqalash, chopiq, begona o'tlarni yo'q qilish, o'simlikni shakllantirish.\n" +
      "• Zararkunandalar: o'rgimchak kana, shira, tunlam. Muntazam tekshiruv va ruxsat etilgan preparatlar.\n" +
      "• Kasalliklar: gommoz, fuzarioz, vertitsillyoz. Almashlab ekish va sog'lom urug'lik muhim.\n\n" +
      "💡 Paxtani har yili bir xil joyda ekmaslik va kuzda chuqur shudgor qilish kasallikni kamaytiradi.",
  },
  {
    keywords: ["makkajo'xori", 'makkajoxori', 'corn', 'makkajo', 'sholi', 'rice', 'guruch'],
    title: "🌽 Makkajo'xori va sholi",
    answer:
      "Makkajo'xori:\n" +
      "• Ekish: tuproq 10–12°C isiganda, 5–7 sm chuqurlikda, qator orasi 60–70 sm, o'simlik orasi 20–25 sm.\n" +
      "• O'g'itlash: azotni 2–3 bo'lib, fosfor va kaliy ekish oldidan.\n" +
      "• Sug'orish: naychalash, gullash va don to'lishi davrida kritik. Har sug'orishda 600–800 m³/ga.\n" +
      "• Zararkunandalar: poya parvonasi, tunlam. Muntazam tekshiruv va biologik kurash.\n\n" +
      "Sholi:\n" +
      "• Ekish: suv bosgan maydonlarda ko'chat yoki urug' bilan. Ko'chat 3–4 barg chiqqanda ko'chiriladi.\n" +
      "• Suv: doimiy sayoz suv qatlami (5–10 sm) saqlanadi, keyin asta-sekin kamaytiriladi.\n" +
      "• O'g'itlash: azotni 2–3 bo'lib, fosfor va kaliyni ekish oldidan.\n" +
      "• Begona o'tlar: suv rejimi va gerbitsidlar bilan nazorat qilinadi.\n\n" +
      "💡 Har ikkala ekin uchun ham almashlab ekish va tuproq tahlili hosildorlikni oshiradi.",
  },
  {
    keywords: ['bodring', 'cucumber', 'piyoz', 'sarimsoq', 'sabzi', 'qalampir', 'karam', 'rediska', 'sholg‘om', 'sholg\'om'],
    title: "🥒 Sabzavotlar bo'yicha qisqa maslahat",
    answer:
      "Sabzavotlarni parvarishlashda umumiy qoidalar:\n\n" +
      "• Bodring: issiq va namlikni yaxshi ko'radi. Tuproq 15°C isiganda ekish, har 2–3 kunda sug'orish. Gorchak va zamburug'li kasalliklarga qarshi ventilyatsiya qiling.\n" +
      "• Piyoz: urug' yoki sevok bilan ekiladi. Ekish chuqurligi 2–3 sm, qator orasi 20–25 sm. Sug'orishni pishish davrida kamaytiring.\n" +
      "• Sarimsoq: kuzda (oktyabr) yoki erta bahorda ekiladi. Tishcha 4–5 sm chuqurlikda, uchi yuqoriga. Azotni ko'p bermang.\n" +
      "• Sabzi: to'g'ridan-to'g'ri urug' ekiladi, 1–2 sm chuqurlikda. Unib chiqqach yupqalang. Tuproq yumshoq va toshsiz bo'lsin.\n" +
      "• Qalampir: ko'chat orqali, tuproq 15°C isiganda. Ko'chirishda ildiz bo'g'zini chuqur ko'mmang.\n" +
      "• Karam: ko'chat orqali yoki urug' bilan. Ko'chat 4–5 barg chiqqanda ko'chiriladi. Karam kapalagi va shiraga qarshi tekshiring.\n" +
      "• Rediska va sholg'om: tez pishadigan ekinlar, yengil tuproq va barqaror namlik talab qiladi.\n\n" +
      "💡 Sabzavotlarni har yili almashlab ekish kasallik va zararkunandani kamaytiradi. Bir oila ekinini ketma-ket 3 yildan ortiq ekmaslik tavsiya etiladi.",
  },
  {
    keywords: ['qovun', 'tarvuz', 'melon', 'watermelon', 'poliz'],
    title: "🍈 Poliz ekinlari (qovun, tarvuz)",
    answer:
      "Qovun va tarvuz yetishtirish:\n\n" +
      "• Tuproq: yengil, qumloq, yaxshi isiydigan va drenajlangan tuproq. Sho'r tuproqqa chidamliroq, lekin hosil pasayadi.\n" +
      "• Ekish: tuproq 15–18°C isiganda, 3–5 sm chuqurlikda, qator orasi 1.5–2 m, o'simlik orasi 50–70 sm.\n" +
      "• Sug'orish: unib chiqish va o'sish davrida barqaror namlik. Meva pishish davrida sug'orishni kamaytiring — shakar to'planadi.\n" +
      "• O'g'itlash: azotni ko'p bermang — barg o'sadi, meva kam bo'ladi. Fosfor-kaliy gullash va meva tugishida muhim.\n" +
      "• Shakllantirish: ortiqcha yon novdalarni olib tashlang, har o'simlikda 2–3 meva qoldiring.\n" +
      "• Kasalliklar: antraknoz, peronosporoz, un-shudring. Almashlab ekish va fungitsid profilaktikasi.\n\n" +
      "💡 Poliz ekinlarini shamol o'tadigan, quyoshli joyga eking. Meva ostiga somon yoki taxta qo'ying — chirishdan saqlaydi.",
  },
  {
    keywords: ['anor', 'pomegranate', "o'rik", 'orik', 'shaftoli', 'gilos', 'nok', 'meva bog', "bog'"],
    title: "🍑 Meva bog'i bo'yicha maslahat",
    answer:
      "Meva bog'ini parvarishlash:\n\n" +
      "• Ko'chat ekish: kuzda yoki erta bahorda, ildiz bo'g'zi tuproq sathidan 2–3 sm yuqori bo'lsin. Ekishdan keyin sug'oring va tayanch qo'ying.\n" +
      "• Kesish: har yili qish oxirida quruq, kasal va ichkariga o'sgan shoxlarni olib tashlang. Tojni yorug'lik o'tadigan qilib shakllantiring.\n" +
      "• O'g'itlash: bahorda azot, yozda fosfor-kaliy, kuzda organik o'g'it. Har 3–4 yilda bir marta chuqur o'g'itlash.\n" +
      "• Sug'orish: yosh bog'ni har 10–14 kunda, katta bog'ni gullash, meva tugish va hosildan keyin.\n" +
      "• Kasalliklar: parsha, un-shudring, meva chirishi, klasterosporioz. Bahorda mis preparati bilan profilaktika.\n" +
      "• Zararkunandalar: shira, meva qurti, kana. Feromon tuzoqlar va ruxsat etilgan insektitsidlar.\n" +
      "• Hosilni yig'ish: mevani to'liq pishganda, poyasi bilan ehtiyotkorlik bilan uzib oling.\n\n" +
      "💡 Har yili kuzda tushgan barg va kasal mevalarni yo'q qiling — keyingi yilgi kasallikni kamaytiradi.",
  },
  {
    keywords: ['asalari', 'asal', 'bee', 'parranda', 'tovuq', 'jo‘ja', "jo'ja", 'baliq', 'baliqchilik'],
    title: "🐝 Chorvachilik va asalarichilik",
    answer:
      "Asalarichilik:\n" +
      "• Uyalarni quyoshli, shamoldan himoyalangan joyga qo'ying. Suv manbai yaqin bo'lsin.\n" +
      "• Bahorda uyalarni tozalang, ortiqcha ramkalarni olib tashlang, oziqlantirishni boshlang.\n" +
      "• Asalarilarni pestitsidlardan himoya qiling: gullash davrida insektitsid sepmang yoki kechqurun qo'llang.\n" +
      "• Kasalliklar: varroa, nosema, amerika chirishi. Muntazam tekshiruv va veterinar maslahati.\n" +
      "• Asal olish: faqat yetarli oziqa qoldirib, ortiqcha asalni oling.\n\n" +
      "Parrandachilik:\n" +
      "• Jo'jalar uchun birinchi haftada harorat 32–34°C, keyin har hafta 2–3°C pasaytiriladi.\n" +
      "• Toza suv va balanslangan ozuqa bering. Ozuqa qoldiqlarini muntazam tozalang.\n" +
      "• Emlash va parazitlarga qarshi profilaktika veterinariya kalendariga muvofiq.\n" +
      "• Tovuq chalazion, nafas yo'llari kasalliklari uchun ventilyatsiya va gigiyena muhim.\n\n" +
      "Baliqchilik:\n" +
      "• Suv harorati va kislorod rejimini kuzatib boring. Suvni muntazam almashtiring.\n" +
      "• Ozuqa me'yorida bering — ortiqcha ozuqa suvni ifloslantiradi.\n" +
      "• Zichlikni oshirmang, kasalliklarni erta aniqlang.\n\n" +
      "💡 Har bir hayvon va uya uchun yozuv yuriting: emlash, oziqlantirish, hosil va kasallik tarixi.",
  },
  {
    keywords: ['traktor', 'kombayn', 'texnika', 'plug', 'kultivator', 'sealka', 'mashina'],
    title: "🚜 Agro texnika bo'yicha maslahat",
    answer:
      "Agro texnikani tanlash va ishlatish:\n\n" +
      "• Traktor: maydon kattaligi, tuproq turi va ishlov chuqurligiga qarab tanlang. Kichik maydon uchun 20–40 ot kuchi, katta maydon uchun 80–150 ot kuchi.\n" +
      "• Plug: chuqur shudgor uchun. Kuzda 20–30 sm chuqurlikda shudgor qilish tuproqni yaxshilaydi.\n" +
      "• Kultivator: ekish oldidan tuproqni yumshatish va begona o'tlarni yo'q qilish.\n" +
      "• Sealka: urug'ni bir tekis ekish uchun. Ekish chuqurligi va qator oralig'ini sozlang.\n" +
      "• Kombayn: hosilni yig'ish uchun. Namlik 14–16% bo'lganda yig'ish eng yaxshi.\n" +
      "• Xizmat: har mavsum oldidan moy, filtr va tormozlarni tekshiring. Yoqilg'i va gidravlikani nazorat qiling.\n\n" +
      "💡 Texnikani ijaraga olishdan oldin holatini, yoqilg'i sarfini va operator tajribasini tekshiring. AgroServ'da texnika ijarasi va sotuvchilarni topishingiz mumkin.",
  },
  {
    keywords: ['yer tanlash', 'yer', 'maydon', 'joy tanlash', 'drenaj', 'eroziya', 'shamol'],
    title: "🗺 Yer tanlash va drenaj",
    answer:
      "Ekin maydonini tanlashda e'tibor bering:\n\n" +
      "• Quyosh: kuniga kamida 6–8 soat quyosh tushadigan joy. Soyada hosil kam va kasallik ko'p.\n" +
      "• Suv: sug'orish manbai yaqin, suv sifati yaxshi bo'lsin. Sho'r suvdan ehtiyot bo'ling.\n" +
      "• Tuproq: chuqur, unumdor, yaxshi drenajlangan. Toshli va qattiq qatlamli yerni yumshating.\n" +
      "• Nishab: kuchli nishabda suv oqib ketadi va tuproq yuviladi. Nishabga ko'ndalang shudgor qiling.\n" +
      "• Shamol: kuchli shamoldan himoya uchun daraxtlar yoki to'siqlar. Shamol suv bug'lanishini oshiradi.\n" +
      "• Drenaj: past joylarda ortiqcha suvni chiqarish uchun ariq yoki quvur o'rnating.\n" +
      "• Yo'l: texnika va hosilni tashish uchun qulay kirish yo'li bo'lsin.\n\n" +
      "💡 Ekishdan oldin tuproq namunasini oling va pH, gumus, azot-fosfor-kaliy hamda sho'rlanishni tekshiring.",
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
  "Pomidor ko'chatini issiqxonada qanday parvarishlayman?",
]

export const AGRO_REFUSAL =
  "Kechirasiz, men faqat qishloq xo'jaligi va agro sohaga oid savollarga javob beraman. 🌱\n\n" +
  "Menga ekinlar, ko'chat, urug', tuproq, o'g'itlash, sug'orish, o'simlik kasalliklari, " +
  "zararkunandalar, chorvachilik, bog'dorchilik, agro texnika yoki hosilni sotish bo'yicha savol bering."

const GREETING_REPLY =
  "Assalomu alaykum! Men AgroServ AI agronom maslahatchisiman. 🌱\n\n" +
  "Menga quyidagilar bo'yicha savol bering:\n" +
  "• Ko'chat ekish va parvarishlash\n" +
  "• O'simlik kasalliklari va zararkunandalar\n" +
  "• O'g'itlash, sug'orish va tuproq\n" +
  "• Chorvachilik, bog'dorchilik va issiqxona\n" +
  "• Hosilni saqlash va foydali sotish\n\n" +
  "Savolingizni iloji boricha aniq yozing: ekin nomi, belgilar, viloyat va qanday parvarish qilayotganingizni ko'rsating."

const AGRO_HINTS = [
  'agro', 'fermer', 'dehqon', 'qishloq', "xo'jalik", 'ekin', "o'simlik", "ko'chat", 'kochat',
  'urug', 'tuproq', "o'g'it", "sug'or", 'hosil', 'don', "bug'doy", 'paxta', 'pomidor',
  'kartoshka', 'bodring', 'piyoz', 'sarimsoq', 'sabzi', 'qalampir', 'karam', 'qovun',
  'tarvuz', 'olma', 'uzum', 'anor', "o'rik", 'shaftoli', 'gilos', 'nok', 'makkajo',
  'sholi', 'beda', 'loviya', 'nohat', 'chorva', 'sigir', "qo'y", 'echki', 'tovuq',
  'asalari', 'asal', 'baliq', 'issiqxona', 'tomchilatib', 'zararkunanda', 'kasallik',
  'barg', 'sariq', 'dog', 'chirish', 'zamburug', 'fungitsid', 'insektitsid', 'gerbitsid',
  'kompost', "go'ng", 'siderat', 'mulch', 'almashlab', 'hosildorlik', 'bozor narxi',
  'traktor', 'kombayn', 'plug', 'kultivator', 'urug\'lik', 'nav', 'parvarish',
  'ekish', 'unib', 'ildiz', 'gullash', 'meva', 'sabzavot', 'poliz', 'bog\'',
  'yerni', 'shudgor', 'o\'rim', 'saqlash', 'vet', 'emlash', 'ozuqa',
]

const OFF_TOPIC_HINTS = [
  'python', 'javascript', 'java ', 'c++', 'c#', 'php', 'dasturlash', 'kod yoz',
  'sayt yarat', 'web sayt', 'kompyuter', 'telefon', 'internet', 'android', 'ios',
  'siyosat', 'prezident', 'parlament', 'saylov', 'hukumat', 'partiya',
  'futbol', 'sport', 'olimpiada', 'boks', 'kurash', 'tennis', 'basketbol',
  'kripto', 'bitcoin', 'forex', 'aktsiya', 'investitsiya', 'bank', 'kredit', 'soliq',
  'film', 'serial', 'multfilm', 'qo\'shiq', 'musiqa', 'konsert', 'o\'yin', 'game',
  'meditsina', 'shifokor', 'kasalxona', 'retsept', 'dori', 'psixolog', 'depressiya',
  'matematika', 'fizika', 'kimyo', 'biologiya', 'tarix', 'geografiya', 'ingliz tili',
  'universitet', 'imtihon', 'sertifikat', 'rezyume', 'ish topish', 'suhbat',
  'sartarosh', 'avtomobil', 'mashina narxi', 'mehmonxona', 'restoran', 'sayohat',
  'moda', 'kiyim', 'sevgi', 'nikoh', 'ajralish', 'to\'y', 'tug\'ilgan kun',
  'huquq', 'advokat', 'sud', 'pasport', 'viza', 'sug\'urta',
]

const CLARIFY_REPLY =
  "🌱 Savolingiz agro sohaga tegishli, lekin aniq javob berish uchun ma'lumot yetishmayapti.\n\n" +
  "Iltimos, quyidagilarni yozing:\n" +
  "• Qaysi ekin yoki hayvon haqida gapiryapsiz?\n" +
  "• Muammo qanday belgilar bilan namoyon bo'lyapti?\n" +
  "• Qaysi viloyatda, qanday tuproq va iqlimda?\n" +
  "• Sug'orish, o'g'itlash va parvarish qanday olib borilmoqda?\n\n" +
  "Masalan: «Pomidor ko'chatini issiqxonada qanday ekish kerak?» yoki «Bug'doy barglarida sariq dog'lar paydo bo'ldi, nima qilay?»."

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[‘’ʻ`´]/g, "'")
}

export function isOffTopic(message = '') {
  const text = normalizeText(message)
  if (!text.trim()) return false
  if (AGRO_HINTS.some((keyword) => text.includes(keyword))) return false
  return OFF_TOPIC_HINTS.some((keyword) => text.includes(keyword))
}

function isGreeting(message = '') {
  const text = normalizeText(message).trim()
  return /^(salom|assalom|assalomu alaykum|va alaykum assalom|hello|hi|hey|qalaysiz|qalesiz|rahmat|tashakkur|katta rahmat)[\s!.,?]*$/.test(
    text,
  )
}

function findAnswers(message, limit = 2) {
  const text = normalizeText(message)
  const scored = KNOWLEDGE.map((item) => ({
    item,
    score: item.keywords.reduce(
      (total, keyword) => (text.includes(normalizeText(keyword)) ? total + 1 : total),
      0,
    ),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((entry) => entry.item)
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

export function getLocalReply(message = '', imageName = '') {
  if (imageName) return { reply: imageAnalysis(imageName), offTopic: false }

  const text = normalizeText(message)
  if (!text.trim()) return { reply: CLARIFY_REPLY, offTopic: false }
  if (isGreeting(text)) return { reply: GREETING_REPLY, offTopic: false }
  if (isOffTopic(text)) return { reply: AGRO_REFUSAL, offTopic: true }

  const matches = findAnswers(text, 2)
  if (matches.length) {
    const reply = matches.map((match) => `${match.title}\n\n${match.answer}`).join('\n\n———\n\n')
    return { reply, offTopic: false }
  }

  return { reply: CLARIFY_REPLY, offTopic: false }
}

export function getAiReply(message = '', imageName = '') {
  return getLocalReply(message, imageName).reply
}
