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

// Viloyat markazlarining taxminiy koordinatalari — yuk masofasini hisoblash uchun.
export const REGION_COORDS = {
  Toshkent: [41.2995, 69.2401],
  'Toshkent viloyati': [41.05, 69.35],
  Samarqand: [39.6542, 66.9597],
  Buxoro: [39.7681, 64.4213],
  "Farg'ona": [40.3864, 71.7864],
  Andijon: [40.7829, 72.3442],
  Namangan: [41.0011, 71.6673],
  Qashqadaryo: [38.8606, 65.7891],
  Surxondaryo: [37.2242, 67.2783],
  Jizzax: [40.1158, 67.8422],
  Sirdaryo: [40.4897, 68.7842],
  Navoiy: [40.0844, 65.3792],
  Xorazm: [41.55, 60.6333],
  "Qoraqalpog'iston": [42.4531, 59.6103],
}

function normalizeRegionName(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[ʻʼ‘’`']/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

const REGION_LOOKUP = new Map(
  Object.entries(REGION_COORDS).map(([name, coords]) => [normalizeRegionName(name), coords]),
)

// Ikki viloyat markazi orasidagi yo'l masofasi (km, taxminiy).
export function regionDistanceKm(from = '', to = '') {
  const a = REGION_LOOKUP.get(normalizeRegionName(from))
  const b = REGION_LOOKUP.get(normalizeRegionName(to))
  if (!a || !b) return 0
  const toRad = (value) => (value * Math.PI) / 180
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const straight = 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  // Yo'l chizig'i to'g'ri chiziqdan uzunroq bo'ladi.
  return Math.max(0, Math.round(straight * 1.2 * 10) / 10)
}

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

export const ROLE_GROUPS = [
  {
    id: 'buyers',
    label: 'Xaridor va dehqonlar',
    roles: ['buyer', 'farmer'],
  },
  {
    id: 'product-sellers',
    label: 'Mahsulot sotuvchilari',
    roles: ['vegetable_seller', 'fruit_seller', 'product_seller', 'equipment_seller'],
  },
  {
    id: 'service-providers',
    label: "Xizmat ko'rsatuvchilar",
    roles: ['equipment_renter', 'agronomist'],
  },
  {
    id: 'delivery',
    label: 'Yetkazib berish',
    roles: ['delivery'],
  },
]

export const ROLES = {
  buyer: {
    label: 'Xaridor',
    short: 'Xaridor',
    icon: '🛒',
    description: "Mahsulot xarid qilish, xizmat yollash va AI maslahat",
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  farmer: {
    label: 'Dehqon',
    short: 'Dehqon',
    icon: '🌾',
    description: "Mahsulot yetishtirish, sotib olish va AI maslahat",
    badge: 'bg-lime-50 text-lime-700 border-lime-200',
  },
  vegetable_seller: {
    label: 'Sabzavot sotuvchisi',
    short: 'Sabzavot',
    icon: '🥬',
    description: "Sabzavot e'lonlarini joylash va sotish",
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  fruit_seller: {
    label: 'Meva sotuvchisi',
    short: 'Meva',
    icon: '🍎',
    description: "Meva e'lonlarini joylash va sotish",
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  product_seller: {
    label: 'Mahsulot sotuvchisi',
    short: 'Mahsulot',
    icon: '🏪',
    description: "O'g'it, dori va boshqa agro mahsulotlarini sotish",
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  equipment_seller: {
    label: 'Texnika sotuvchisi',
    short: 'Texnika',
    icon: '🚜',
    description: 'Texnika va ehtiyot qismlarini sotish',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  equipment_renter: {
    label: 'Texnika ijarachisi',
    short: 'Ijara',
    icon: '🔧',
    description: "Texnika ijarasi va xizmatlarini taklif qilish",
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  agronomist: {
    label: 'Agronom',
    short: 'Agronom',
    icon: '🌿',
    description: 'Agronomik maslahat va dala xizmatlarini taklif qilish',
    badge: 'bg-lime-50 text-lime-700 border-lime-200',
  },
  delivery: {
    label: 'Yetkazib beruvchi',
    short: 'Kuryer',
    icon: '🚚',
    description: "Buyurtmalarni manzilga yetkazib berish",
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  // Eski rollar — mavjud hisoblar uchun saqlanadi, ro'yxatdan o'tishda ko'rinmaydi.
  user: {
    label: 'Fermer (eski)',
    short: 'Fermer',
    icon: '🌱',
    description: 'Eski foydalanuvchi roli',
    badge: 'bg-stone-50 text-stone-700 border-stone-200',
    legacy: true,
  },
  seller: {
    label: 'Sotuvchi (eski)',
    short: 'Sotuvchi',
    icon: '🏬',
    description: 'Eski sotuvchi roli',
    badge: 'bg-stone-50 text-stone-700 border-stone-200',
    legacy: true,
  },
  worker: {
    label: 'Texnika ustasi (eski)',
    short: 'Usta',
    icon: '🛠️',
    description: 'Eski usta roli',
    badge: 'bg-stone-50 text-stone-700 border-stone-200',
    legacy: true,
  },
  admin: {
    label: 'Administrator',
    short: 'Admin',
    icon: '🛡️',
    description: 'Platforma boshqaruvi, foydalanuvchilar va to\'lovlar',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
}

export const SELF_ROLES = ROLE_GROUPS.flatMap((group) => group.roles)

// Eski hisoblar uchun saqlanadigan rollar — yangi ro'yxatdan o'tishda ko'rinmaydi.
export const LEGACY_ROLES = ['user', 'seller', 'worker']

export const PRODUCT_SELLER_ROLES = [
  'vegetable_seller',
  'fruit_seller',
  'product_seller',
  'equipment_seller',
  'seller',
]

export const SERVICE_ROLES = ['equipment_renter', 'agronomist', 'worker']

export function canSellProducts(role) {
  return role === 'admin' || PRODUCT_SELLER_ROLES.includes(role)
}

export function canOfferServices(role) {
  return role === 'admin' || SERVICE_ROLES.includes(role)
}

export function isBuyerRole(role) {
  return ['buyer', 'farmer', 'user', 'delivery'].includes(role)
}

export const ROLE_DEFAULT_CATEGORY = {
  vegetable_seller: 'meva',
  fruit_seller: 'meva',
  product_seller: 'ogit',
  equipment_seller: 'texnika',
  seller: 'meva',
}

export const ROLE_DEFAULT_SERVICE_TYPE = {
  equipment_renter: 'worker',
  agronomist: 'agronomist',
  worker: 'worker',
}

export function roleHome(role) {
  if (canSellProducts(role)) return '/dokon'
  if (canOfferServices(role)) return '/xizmatlarim'
  return '/kabinet'
}

export const FREE_PLAN = {
  id: 'free',
  name: 'Bepul platforma',
  tagline: 'Obunasiz platforma — 5% savdo komissiyasi',
  monthly: 0,
  yearly: 0,
  listings: Infinity,
  commission: 5,
  featured: 0,
  ai: 50,
  color: 'emerald',
  icon: '🌱',
  features: [
    'Cheksiz mahsulot va xizmat e\'lonlari',
    '5% savdo komissiyasi — 95% sotuvchiga',
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

export const COURIER_STATUS = {
  idle: { label: 'Navbatda', className: 'bg-stone-100 text-stone-600 border-stone-200' },
  loading: { label: 'Yuk yig‘ilmoqda', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivering: { label: 'Yo‘lda', className: 'bg-sky-50 text-sky-700 border-sky-200' },
}

export const BATCH_STATUS = {
  loading: { label: 'Yuk yig‘ilmoqda', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivering: { label: 'Yo‘lda', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  delivered: { label: 'Topshirilgan', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
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
