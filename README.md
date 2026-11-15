# AgroServ — agro xizmatlar platformasi

O'zbekiston fermerlari uchun mahsulot bozori, texnika xizmatlari, ish o'rinlari, video darslar va AI maslahatchini birlashtirgan platforma.

Loyiha demo emas: foydalanuvchilar, mahsulotlar, buyurtmalar, to'lovlar va statistika Neon Postgres bazasida saqlanadi.

## Texnologiyalar

- React 19 + Vite 8
- Tailwind CSS v4
- React Router 7
- Vercel Serverless Functions (`api/index.js`)
- Neon Postgres + `pg`
- `bcryptjs` parol hash’i, `jose` JWT sessiya cookie’si
- `google-auth-library` orqali Google ID token tekshiruvi

## Muhit o'zgaruvchilari

`.env.local` (lokal) yoki Vercel Environment Variables:

| Kalit | Majburiy | Izoh |
| --- | --- | --- |
| `DATABASE_URL` | Ha | Neon Postgres connection string |
| `AUTH_SECRET` | Ha | Kamida 32 belgili tasodifiy sir |
| `APP_URL` | Ha | Sayt manzili, masalan `https://agroserv-lake.vercel.app` |
| `GOOGLE_CLIENT_ID` | Yo'q | Google OAuth server client ID |
| `VITE_GOOGLE_CLIENT_ID` | Yo'q | Google OAuth client ID (frontend) |
| `PAYME_MERCHANT_ID`, `PAYME_KEY` | Yo'q | Payme merchant sozlamalari |
| `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET_KEY` | Yo'q | Click merchant sozlamalari |
| `GMAIL_WEBHOOK_URL` | Yo'q | Apps Script Gmail webhook URL (parol tiklash emaili) |
| `GMAIL_WEBHOOK_SECRET` | Yo'q | Gmail webhook uchun maxfiy kalit |

Google yoki Payme/Click sozlanmagan bo'lsa, tegishli tugma foydalanuvchiga ko'rsatilmaydi; qolgan oqimlar ishlayveradi. `GMAIL_WEBHOOK_URL` va `GMAIL_WEBHOOK_SECRET` bo'lsa, parol tiklash havolasi emailga avtomatik yuboriladi; aks holda so'rov admin panelga tushadi.

## Ishga tushirish

```bash
npm install
vercel env pull .env.local   # yoki .env.local ni qo'lda to'ldiring
npm run db:init
npm run dev
```

`db:init` sxemani yaratadi, sozlamalar va promo kodlarni seed qiladi hamda admin hisobini ochadi:

- `ADMIN_EMAIL` — sukut bo'yicha `admin@agroserv.uz`
- `ADMIN_PASSWORD` — berilmasa tasodifiy parol generatsiya qilinadi va konsolga chiqadi
- Mavjud admin parolini almashtirish: `RESET_ADMIN=true` bilan qayta ishga tushiring

Boshqa demo hisoblar yaratilmaydi.

## API testlari

```bash
$env:TEST_ADMIN_PASSWORD='<admin paroli>'
node --env-file=.env.local scripts/test-api.mjs
```

Testlar vaqtinchalik foydalanuvchilar yaratadi va oxirida ularni bazadan tozalaydi. 45 ta test auth, rollar, mahsulot/xizmat, savat, hamyon, manual to'lov, 0% komissiya, bepul rejim, promo kod va parol tiklash oqimlarini qamrab oladi.

## Asosiy imkoniyatlar

- **Auth:** email/parol, 30 kunlik HttpOnly session cookie, Google OAuth, rol tanlash, email havolasi yoki admin vositachiligida parol tiklash.
- **Bozor:** qidiruv, kategoriya, filtr, mahsulot sahifasi, savat, sevimlilar, sharhlar.
- **Xizmatlar:** usta va agronomlar, buyurtma, sharh, xizmat holati.
- **Ish o'rinlari:** e'lon joylash, ariza yuborish va arizalarni ko'rish.
- **Videolar:** YouTube havolalari va o'z video e'lonlari.
- **AI maslahatchi:** kuniga 50 ta bepul savol (fair-use), serverda hisoblanadi.
- **Rollar:** fermer, sotuvchi, usta, agronom va admin uchun alohida kabinet.
- **Monetizatsiya:** platforma to'liq bepul — 0% komissiya, cheksiz e'lon, obuna yo'q. Faqat top mahsulot ixtiyoriy pullik xizmat.
- **Admin panel:** real foydalanuvchilar, mahsulotlar, buyurtmalar, to'lovlar, xabarlar, kartalar, parol so'rovlari va sozlamalar.

## To'lov oqimlari

- **Hamyon:** balansdan darhol yechiladi, sotuvchilarga darhol o'tkaziladi.
- **Manual bank o'tkazmasi:** buyurtma `pending` holatida turadi; admin chekni tasdiqlagach faollashadi.
- **Naqd:** buyurtma yakunlanganda summa to'liq sotuvchiga o'tadi — komissiya 0%.
- **Payme/Click:** merchant credential’lari bo'lsa redirect va webhook orqali ishlaydi.

## Deploy

```bash
npm run build
vercel --prod
```

`vercel.json` barcha `/api/*` yo'llarini `api/index.js` funksiyasiga, qolgan yo'llarni SPA `index.html` ga yo'naltiradi. Deep link’lar (masalan `/mahsulot/...`) to'g'ridan-to'g'ri ochiladi.
