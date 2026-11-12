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

export const PLANS = {
  free: {
    id: 'free',
    name: 'Bepul',
    tagline: 'Platformani sinab ko\'rish uchun',
    monthly: 0,
    yearly: 0,
    listings: 3,
    commission: 5,
    featured: 0,
    ai: 5,
    color: 'stone',
    icon: '🌱',
    features: [
      '3 tagacha mahsulot / xizmat',
      '5% savdo komissiyasi',
      'Kuniga 5 ta AI savol',
      'Asosiy statistika',
      'Email qo\'llab-quvvatlash',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    tagline: 'O\'sayotgan fermer va sotuvchilar uchun',
    monthly: 49000,
    yearly: 470000,
    listings: 20,
    commission: 3,
    featured: 1,
    ai: 50,
    color: 'emerald',
    icon: '⚡',
    popular: true,
    features: [
      '20 tagacha mahsulot / xizmat',
      '3% savdo komissiyasi',
      'Oyiga 1 ta top mahsulot',
      'Kuniga 50 ta AI savol',
      'Kengaytirilgan statistika',
      'Tezkor qo\'llab-quvvatlash',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Yirik fermer xo\'jaliklari va do\'konlar uchun',
    monthly: 149000,
    yearly: 1430000,
    listings: Infinity,
    commission: 1,
    featured: 5,
    ai: Infinity,
    color: 'violet',
    icon: '👑',
    features: [
      'Cheksiz mahsulot / xizmat',
      '1% savdo komissiyasi',
      'Oyiga 5 ta top mahsulot',
      'Cheksiz AI maslahat',
      'Shaxsiy menejer',
      'Tasdiqlangan sotuvchi belgisi',
      'API va eksport',
    ],
  },
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
  PLUS20: {
    code: 'PLUS20',
    type: 'percent',
    value: 20,
    maxDiscount: 300000,
    minTotal: 0,
    scope: 'plan',
    description: 'Obuna tarifiga 20% chegirma',
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

export function getPlan(user) {
  if (!user) return PLANS.free
  const plan = PLANS[user.plan] || PLANS.free
  if (plan.id === 'free') return plan
  if (!user.planExpiresAt) return PLANS.free
  return new Date(user.planExpiresAt).getTime() > Date.now() ? plan : PLANS.free
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
