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

export function parseYoutubeId(url = '') {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]{6,})/i,
    /youtu\.be\/([\w-]{6,})/i,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return ''
}

// Har qanday video havolani sayt ichida ijro etiladigan manbaga aylantiradi.
export function getVideoEmbed(url = '') {
  const value = String(url || '').trim()
  if (!value) return null

  if (/^data:video\//i.test(value)) {
    return { type: 'file', src: value }
  }

  let parsed
  try {
    parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./i, '').toLowerCase()
  const path = parsed.pathname
  const query = parsed.search

  // YouTube
  let youtubeId = ''
  if (host === 'youtu.be') {
    youtubeId = path.split('/').filter(Boolean)[0] || ''
  } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    if (path === '/watch') youtubeId = parsed.searchParams.get('v') || ''
    else {
      const match = path.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{6,})/)
      if (match) youtubeId = match[1]
    }
  }
  if (/^[A-Za-z0-9_-]{6,}$/.test(youtubeId)) {
    return {
      type: 'youtube',
      id: youtubeId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`,
      thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    }
  }

  // Vimeo
  if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
    const match = path.match(/(\d{6,})/)
    if (match) {
      return {
        type: 'vimeo',
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}?autoplay=1`,
      }
    }
  }

  // Dailymotion
  if (host === 'dai.ly') {
    const id = path.split('/').filter(Boolean)[0] || ''
    if (id) return { type: 'dailymotion', id, embedUrl: `https://www.dailymotion.com/embed/video/${id}?autoplay=1` }
  }
  if (host === 'dailymotion.com' || host.endsWith('.dailymotion.com')) {
    const match = path.match(/\/video\/([A-Za-z0-9]+)/)
    if (match) {
      return {
        type: 'dailymotion',
        id: match[1],
        embedUrl: `https://www.dailymotion.com/embed/video/${match[1]}?autoplay=1`,
      }
    }
  }

  // Rutube
  if (host === 'rutube.ru' || host.endsWith('.rutube.ru')) {
    const match = path.match(/\/video\/(?:private\/)?([a-f0-9]{16,})/i)
    if (match) return { type: 'rutube', id: match[1], embedUrl: `https://rutube.ru/play/embed/${match[1]}/` }
  }

  // OK.ru
  if (host === 'ok.ru' || host.endsWith('.ok.ru') || host === 'odnoklassniki.ru') {
    const match = path.match(/\/video\/(\d+)/)
    if (match) return { type: 'okru', id: match[1], embedUrl: `https://ok.ru/videoembed/${match[1]}` }
  }

  // Google Drive
  if (host === 'drive.google.com') {
    const match = path.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/) || parsed.searchParams.get('id')
    const id = Array.isArray(match) ? match[1] : match
    if (id) return { type: 'gdrive', id, embedUrl: `https://drive.google.com/file/d/${id}/preview` }
  }

  // Instagram
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
    const match = path.match(/\/(reel|p|tv)\/([A-Za-z0-9_-]+)/)
    if (match) {
      return {
        type: 'instagram',
        id: match[2],
        embedUrl: `https://www.instagram.com/${match[1]}/${match[2]}/embed`,
      }
    }
  }

  // TikTok
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
    const match = path.match(/\/video\/(\d+)/)
    if (match) return { type: 'tiktok', id: match[1], embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}` }
  }

  // Facebook
  if (host === 'facebook.com' || host.endsWith('.facebook.com') || host === 'fb.watch') {
    return {
      type: 'facebook',
      id: '',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(parsed.href)}&show_text=false&autoplay=1`,
    }
  }

  // To'g'ridan-to'g'ri video fayl
  if (/\.(mp4|webm|ogg|ogv|mov|m4v)(?:$|[?#])/i.test(path + query)) {
    return { type: 'file', src: parsed.href }
  }

  return null
}

export function maskCard(number = '') {
  const digits = String(number).replace(/\D/g, '')
  if (digits.length < 4) return number
  return `•••• •••• •••• ${digits.slice(-4)}`
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
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
