export const REGIONS = [
  'Toshkent',
  'Toshkent viloyati',
  'Samarqand',
  'Buxoro',
  "Farg'ona",
  'Andijon',
  "Namangan",
  'Qashqadaryo',
  'Surxondaryo',
  'Jizzax',
  'Sirdaryo',
  'Navoiy',
  'Xorazm',
  "Qoraqalpog'iston",
]

export const CATEGORIES = [
  {
    id: 'texnika',
    label: 'Agro texnika',
    short: 'Texnika',
    icon: '🚜',
    description: 'Traktor, kombayn, seyalka va boshqa texnikalar',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    soft: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  {
    id: 'meva',
    label: 'Meva & sabzavot',
    short: 'Meva',
    icon: '🍎',
    description: "Fermerdan to'g'ridan-to'g'ri yangi mahsulotlar",
    gradient: 'from-rose-300 via-red-400 to-orange-500',
    soft: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  {
    id: 'ogit',
    label: "O'g'itlar",
    short: "O'g'it",
    icon: '🧪',
    description: 'Mineral va organik ozuqalar, NPK komplekslari',
    gradient: 'from-teal-300 via-cyan-400 to-blue-500',
    soft: 'bg-teal-50 text-teal-700 border-teal-100',
  },
  {
    id: 'xizmat',
    label: 'Texnika xizmati',
    short: 'Xizmat',
    icon: '🔧',
    description: 'Yer tekislash, shudgor, ekish va yig\'im xizmatlari',
    gradient: 'from-amber-300 via-orange-400 to-amber-600',
    soft: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    id: 'agronom',
    label: 'Agronomlar',
    short: 'Agronom',
    icon: '🌿',
    description: 'Kasallik, o\'g\'it va hosildorlik bo\'yicha maslahat',
    gradient: 'from-emerald-300 via-green-400 to-teal-600',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    id: 'ish',
    label: 'Ish o\'rinlari',
    short: 'Ish',
    icon: '💼',
    description: 'Agro sohada ish va mutaxassislar',
    gradient: 'from-violet-300 via-purple-400 to-indigo-600',
    soft: 'bg-violet-50 text-violet-700 border-violet-100',
  },
]

export const ROLES = {
  user: {
    label: 'Fermer',
    short: 'Fermer',
    icon: '🌾',
    description: 'Mahsulot sotib olish, xizmat yollash va AI maslahat',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  seller: {
    label: 'Sotuvchi',
    short: 'Sotuvchi',
    icon: '🏪',
    description: "Do'kon ochish, mahsulot joylash va savdo qilish",
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  worker: {
    label: 'Texnika ustasi',
    short: 'Usta',
    icon: '🔧',
    description: 'Texnika xizmatlarini ko\'rsatish va buyurtma olish',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  agronomist: {
    label: 'Agronom',
    short: 'Agronom',
    icon: '🌿',
    description: 'Agronomik maslahat va dala xizmatlarini taklif qilish',
    badge: 'bg-lime-50 text-lime-700 border-lime-200',
  },
  admin: {
    label: 'Administrator',
    short: 'Admin',
    icon: '🛡️',
    description: 'Platforma boshqaruvi, foydalanuvchilar va to\'lovlar',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
}

export const SELF_ROLES = ['user', 'seller', 'worker', 'agronomist']

export const FREE_PLAN = {
  id: 'free',
  name: 'Bepul platforma',
  tagline: 'Barcha imkoniyatlar bepul — obuna yo\'q',
  monthly: 0,
  yearly: 0,
  listings: Infinity,
  commission: 0,
  featured: 0,
  ai: 50,
  color: 'emerald',
  icon: '🌱',
  features: [
    'Cheksiz mahsulot va xizmat e\'lonlari',
    '0% savdo komissiyasi — summa to\'liq sotuvchiga',
    'Kuniga 50 ta bepul AI savol',
    'Bepul hamyon va buyurtma boshqaruvi',
    'Top mahsulot — ixtiyoriy pullik xizmat',
  ],
}

// Eski kod bilan moslik uchun saqlanadi. Platformada faqat bitta bepul rejim mavjud.
export const PLANS = {
  free: FREE_PLAN,
}

export const PROMOS = {
  AGRO10: {
    code: 'AGRO10',
    type: 'percent',
    value: 10,
    maxDiscount: 100000,
    minTotal: 100000,
    scope: 'order',
    description: 'Buyurtmaga 10% chegirma (maks. 100 000 so\'m)',
  },
  YANGI2026: {
    code: 'YANGI2026',
    type: 'fixed',
    value: 50000,
    minTotal: 200000,
    scope: 'order',
    description: '200 000 so\'mdan yuqori buyurtmaga 50 000 so\'m chegirma',
  },
  TOP25: {
    code: 'TOP25',
    type: 'fixed',
    value: 5000,
    minTotal: 0,
    scope: 'feature',
    description: 'Top mahsulot narxiga 5 000 so\'m chegirma',
  },
}

export const ORDER_STATUS = {
  pending: { label: 'To\'lov kutilmoqda', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid: { label: 'To\'langan', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  processing: { label: 'Jarayonda', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  shipped: { label: 'Yo\'lda', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  completed: { label: 'Yakunlangan', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Bekor qilingan', className: 'bg-rose-50 text-rose-700 border-rose-200' },
}

export const JOB_TYPES = ['To\'liq kun', 'Yarim kun', 'Mavsumiy', 'Masofadan', 'Kunlik']

export const VIDEO_CATEGORIES = [
  'Barchasi',
  'Agrotexnika',
  'Sug\'orish',
  'O\'g\'itlash',
  'Kasalliklar',
  'Bog\'dorchilik',
  'Chorvachilik',
]

export const PRODUCT_UNITS = ['dona', 'kg', 'tonna', 'ga', 'litr', 'xizmat']

export const PRODUCT_EMOJIS = ['🚜', '🌾', '🍎', '🍅', '🍇', '🥔', '🥒', '🧪', '🌱', '🍑', '🥕', '🍉', '🌽', '🐄', '🚛', '🔧']

export const PRODUCT_GRADIENTS = [
  'from-sky-400 via-blue-500 to-indigo-600',
  'from-rose-300 via-red-400 to-orange-500',
  'from-emerald-300 via-green-400 to-teal-600',
  'from-lime-300 via-emerald-400 to-green-600',
  'from-amber-300 via-orange-400 to-rose-500',
  'from-violet-300 via-purple-400 to-indigo-600',
  'from-teal-300 via-cyan-400 to-blue-500',
  'from-yellow-300 via-amber-400 to-orange-500',
]

export const SERVICE_GRADIENTS = [
  'from-amber-400 via-orange-500 to-rose-500',
  'from-emerald-400 via-green-500 to-teal-600',
  'from-sky-400 via-blue-500 to-indigo-600',
  'from-violet-400 via-purple-500 to-indigo-600',
]

export function getPlan() {
  return FREE_PLAN
}

export function getPlanName(user) {
  return getPlan(user).name
}

export function getCommissionRate(user) {
  return getPlan(user).commission
}

export function planLimitLabel(limit) {
  return limit === Infinity ? 'Cheksiz' : `${limit} ta`
}

export function promoDiscount(promo, amount) {
  if (!promo) return 0
  if (amount < (promo.minTotal || 0)) return 0
  let discount = promo.type === 'percent' ? (amount * promo.value) / 100 : promo.value
  if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount)
  return Math.min(Math.round(discount), amount)
}
