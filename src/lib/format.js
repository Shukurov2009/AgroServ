export function formatNumber(value = 0) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(Number(value) || 0))
}

export function formatSom(value = 0) {
  return `${formatNumber(value)} so'm`
}

export function formatCompact(value = 0) {
  const number = Number(value) || 0
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(1)} mlrd`
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)} mln`
  if (number >= 1_000) return `${(number / 1_000).toFixed(0)} ming`
  return `${number}`
}

export function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function timeAgo(value) {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'hozir'
  if (minutes < 60) return `${minutes} daqiqa oldin`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} kun oldin`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} oy oldin`
  return `${Math.floor(months / 12)} yil oldin`
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function simpleHash(value = '') {
  let hash = 5381
  const source = `${value}::agroserv-demo-salt`
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 33) ^ source.charCodeAt(index)
  }
  return `h${(hash >>> 0).toString(36)}`
}

export function parseYoutubeId(url = '') {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/i,
    /youtu\.be\/([\w-]{6,})/i,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return ''
}

export function maskCard(number = '') {
  const digits = String(number).replace(/\D/g, '')
  if (digits.length < 4) return number
  return `•••• •••• •••• ${digits.slice(-4)}`
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function daysFromNow(days = 0) {
  return new Date(Date.now() + days * 86400000).toISOString()
}

export function addMonths(dateValue, months) {
  const date = new Date(dateValue)
  date.setMonth(date.getMonth() + months)
  return date
}

export function addYears(dateValue, years) {
  const date = new Date(dateValue)
  date.setFullYear(date.getFullYear() + years)
  return date
}

export function uid(prefix = 'id') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function orderNumber(index = 1) {
  return `AG-${new Date().getFullYear()}-${1000 + Number(index)}`
}

export function pluralUz(count, one, many) {
  return `${formatNumber(count)} ${Number(count) === 1 ? one : many}`
}
