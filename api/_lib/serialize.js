function num(value) {
  if (value == null) return 0
  return Number(value)
}

export function toUser(row, { self = false, admin = false } = {}) {
  if (!row) return null
  const user = {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    region: row.region || '',
    role: row.role,
    plan: row.plan || 'free',
    planBilling: row.plan_billing || null,
    planExpiresAt: row.plan_expires_at ? new Date(row.plan_expires_at).toISOString() : null,
    wallet: num(row.wallet),
    status: row.status,
    verified: Boolean(row.verified),
    avatarUrl: row.avatar_url || null,
    avatar: row.avatar || '🌱',
    bio: row.bio || '',
    googleLinked: Boolean(row.google_id),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
  if (self || admin) user.email = row.email
  return user
}

export function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    region: row.region || '',
    role: row.role,
    plan: row.plan || 'free',
    verified: Boolean(row.verified),
    avatarUrl: row.avatar_url || null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toProduct(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    price: num(row.price),
    unit: row.unit,
    stock: num(row.stock),
    description: row.description || '',
    region: row.region || '',
    phone: row.phone || '',
    telegram: row.telegram || '',
    emoji: row.emoji || '🌱',
    gradient: row.gradient || 'from-emerald-300 via-green-400 to-teal-600',
    imageUrl: row.image_url || null,
    year: row.year || null,
    condition: row.condition || '',
    rating: Number(row.rating || 0),
    reviewsCount: num(row.reviews_count),
    sales: num(row.sales),
    featured: Boolean(row.featured),
    featuredUntil: row.featured_until ? new Date(row.featured_until).toISOString() : null,
    status: row.status,
    sellerId: row.seller_id,
    sellerName: row.seller_name || '',
    sellerPhone: row.seller_phone || row.phone || '',
    sellerTelegram: row.seller_telegram || row.telegram || '',
    sellerVerified: Boolean(row.seller_verified),
    isSample: Boolean(row.is_sample),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toService(row) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    age: row.age || null,
    experience: num(row.experience),
    serviceType: row.service_type || '',
    equipment: row.equipment || '',
    specialization: row.specialization || '',
    education: row.education || '',
    price: num(row.price),
    unit: row.unit,
    region: row.region || '',
    phone: row.phone || '',
    telegram: row.telegram || '',
    rating: Number(row.rating || 0),
    reviewsCount: num(row.reviews_count),
    completedOrders: num(row.completed_orders),
    verified: Boolean(row.verified),
    description: row.description || '',
    userId: row.user_id,
    gradient: row.gradient || 'from-emerald-400 via-green-500 to-teal-600',
    status: row.status,
    isSample: Boolean(row.is_sample),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toJob(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    type: row.type,
    location: row.location || '',
    salary: row.salary || 'Kelishilgan holda',
    description: row.description,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    contact: row.contact || '',
    applicants: num(row.applicants),
    status: row.status,
    userId: row.user_id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toApplication(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone || '',
    message: row.message || '',
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toVideo(row) {
  return {
    id: row.id,
    title: row.title,
    channel: row.channel || '',
    category: row.category || 'Agrotexnika',
    views: row.views || '0',
    duration: row.duration || '-',
    emoji: row.emoji || '🎬',
    gradient: row.gradient || 'from-emerald-400 via-green-500 to-teal-600',
    youtubeId: row.youtube_id || '',
    url: row.url || '',
    description: row.description || '',
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toOrder(row) {
  return {
    id: row.id,
    number: row.number,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name || '',
    sellerId: row.seller_id,
    type: row.type,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    subtotal: num(row.subtotal),
    delivery: num(row.delivery_fee),
    discount: num(row.discount),
    total: num(row.total),
    platformFee: num(row.commission_amount),
    commissionRate: Number(row.commission_rate || 0),
    promoCode: row.promo_code || '',
    items: Array.isArray(row.items) ? row.items : [],
    info: {
      name: row.buyer_name || '',
      phone: row.phone || '',
      address: row.address || '',
      note: row.note || '',
    },
    credited: Boolean(row.credited),
    refunded: Boolean(row.refunded),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  }
}

export function toTransaction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: num(row.amount),
    balanceAfter: row.balance_after == null ? null : num(row.balance_after),
    description: row.description || '',
    reference: row.reference || '',
    provider: row.provider || '',
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toPayment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name || '',
    purpose: row.purpose,
    reference: row.reference || '',
    amount: num(row.amount),
    provider: row.provider,
    status: row.status,
    providerTxId: row.provider_tx_id || '',
    meta: row.meta || {},
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
  }
}

export function toMessage(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    subject: row.subject || 'Umumiy savol',
    message: row.message,
    read: Boolean(row.read),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toCard(row) {
  return {
    id: row.id,
    cardType: row.card_type,
    number: row.number,
    holder: row.holder,
    active: Boolean(row.active),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function toReview(row) {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    userId: row.user_id,
    userName: row.user_name || '',
    stars: num(row.stars),
    comment: row.comment || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }
}

export function settingsFromRows(rows) {
  const settings = {}
  for (const row of rows) settings[row.key] = row.value
  return settings
}
