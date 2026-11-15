import { AGRO_REFUSAL, isOffTopic } from '../../src/lib/ai.js'

const MAX_HISTORY = 8
const MAX_MESSAGE = 2000
const TOTAL_BUDGET_MS = 55_000

export const AI_UNAVAILABLE =
  "AI xizmati vaqtincha ishlamayapti. Iltimos, adminga murojaat qiling."

export const AI_NOT_CONFIGURED = AI_UNAVAILABLE

const SYSTEM_PROMPT = `Sen "AgroServ AI" agronom maslahatchisisan. Sening yagona vazifang — qishloq xo'jaligi, dehqonchilik, bog'dorchilik, chorvachilik, asalarichilik, agro texnika, o'g'it, urug', ko'chat, sug'orish, o'simlik kasalliklari va zararkunandalar, tuproq, hosilni saqlash, agro bozor narxlari va fermer xo'jaligi iqtisodiyoti bo'yicha maslahat berish. Boshqa hech qanday mavzuda javob bermaysan.

Qoidalar:
1. Agar savol ANIQ agro sohaga oid bo'lmasa (dasturlash, IT, siyosat, sport, o'yin, inson tibbiyoti, moliya, kripto, umumiy ta'lim, huquq, sayohat, moda, shaxsiy munosabatlar), faqat "OFF_TOPIC" so'zini qaytar.
2. Agar savol agroga oid bo'lsa — ekin, tuproq, o'g'it, sug'orish, kasallik, zararkunanda, chorva, bog', texnika, hosil, agro bozor yoki fermer xo'jaligi haqida bo'lsa — hech qachon "OFF_TOPIC" yozma, har doim javob ber. Agro va boshqa mavzu aralash bo'lsa, faqat agro qismiga javob ber.
3. Agro savolga to'liq, erkin va amaliy javob ber. Tayyor shablon yoki oldindan yozilgan javobdan foydalanma — savolni tahlil qil va aynan shu savolga javob ber.
4. Savolda bir nechta usul yoki variant so'ralsa, barchasini sanab o't va qaysi holatda qaysi biri mosligini tushuntir.
5. Javobni o'zbek tilida (lotin yozuvida), aniq va bosqichma-bosqich yoz. Kerak bo'lsa ro'yxat ishlat. Yozishdan oldin imlo va grammatikani tekshir; "bog'", "purkash", "kasallik", "o'g'it", "sug'orish" kabi so'zlarni to'g'ri yoz.
6. Ma'lumot yetishmasa, taxmin qilib yozma — ekin nomi, viloyat, tuproq, belgilar yoki qaysi bosqich ekanini so'ra.
7. Dozalar, preparatlar va kimyoviy ishlovlar haqida ehtiyotkor bo'l: preparat nomini aytishing mumkin, lekin aniq doza yoki konsentratsiyani raqam bilan yozma — doza va qo'llash muddatini preparat yo'riqnomasi hamda mahalliy agronom bilan aniqlash kerakligini eslat. Taqiqlangan yoki xavfli moddalarni tavsiya qilma.
8. O'simlik kasalligi yoki zararkunandasi haqida gapirganda belgilarni sanab o't va birinchi yordam choralarini ayt; aniq tashxis uchun agronom yoki laboratoriya kerakligini eslat.
9. Agar rasm yuborilsa, barg, meva, poya yoki zararkunanda belgilarini tahlil qil. Rasmda ko'rinmayotgan narsani taxmin qilma.
10. Agar foydalanuvchi salomlashsa, qisqa salomlash va darhol savolga o't. Salomlashmasa, salomlashma.
11. O'zingni tanishtirma va nimalar qila olishingni sanab o'tma; birinchi jumladan boshlab faqat savolga javob ber. Faqat so'ralsa "AgroServ AI maslahatchisi" deb ayt. O'zingni inson deb ko'rsatma.
12. Javobda boshqa til yoki mavzuni aralashtirma. Faqat agro soha.`

const PROVIDER_SETTINGS = {
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: () => process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    vision: true,
    timeout: 30_000,
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    vision: false,
    timeout: 25_000,
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: () => process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free',
    vision: true,
    timeout: 35_000,
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: () => process.env.OPENAI_MODEL || 'gpt-4o-mini',
    vision: true,
    timeout: 30_000,
  },
  llm7: {
    url: 'https://api.llm7.io/v1/chat/completions',
    model: () => process.env.LLM7_MODEL || 'glm-5.3-flash',
    vision: false,
    timeout: 22_000,
    keyless: true,
  },
  pollinations: {
    url: 'https://text.pollinations.ai/openai',
    model: () => process.env.POLLINATIONS_MODEL || 'openai',
    vision: false,
    timeout: 30_000,
    keyless: true,
  },
}

function detectProvider(key = '') {
  const value = String(key || '').trim()
  if (value.startsWith('AIza')) return 'gemini'
  if (value.startsWith('gsk_')) return 'groq'
  if (value.startsWith('sk-or-')) return 'openrouter'
  if (value.startsWith('sk-proj-') || value.startsWith('sk-')) return 'openai'
  // Eski admin panelda kalit Gemini uchun kiritilgan
  return 'gemini'
}

const LLM7_MODELS = [
  { model: 'glm-5.3-flash', timeout: 20_000 },
  { model: 'gpt-oss:20b', timeout: 10_000 },
]

function makeProvider(name, key = '', override = {}) {
  const settings = PROVIDER_SETTINGS[name]
  if (!settings) return null
  const model = override.model || settings.model()
  return {
    id: override.model ? `${name}:${override.model}` : name,
    provider: name,
    key,
    url: settings.url,
    model,
    vision: settings.vision,
    timeout: override.timeout || settings.timeout,
    keyless: Boolean(settings.keyless),
  }
}

function providerCandidates(dbKey = '') {
  const candidates = []
  const seen = new Set()

  function add(name, key = '', override = {}) {
    const provider = makeProvider(name, key, override)
    if (!provider || seen.has(provider.id)) return
    seen.add(provider.id)
    candidates.push(provider)
  }

  const cleanKey = String(dbKey || '').trim()
  if (cleanKey) add(detectProvider(cleanKey), cleanKey)

  if (process.env.GEMINI_API_KEY) add('gemini', process.env.GEMINI_API_KEY)
  if (process.env.GROQ_API_KEY) add('groq', process.env.GROQ_API_KEY)
  if (process.env.OPENROUTER_API_KEY) add('openrouter', process.env.OPENROUTER_API_KEY)
  if (process.env.OPENAI_API_KEY) add('openai', process.env.OPENAI_API_KEY)

  // Kalitsiz zaxira: LLM7 (bepul, kunlik limit) va Pollinations (30 sekundda 1 ta)
  for (const model of LLM7_MODELS) add('llm7', '', model)
  add('pollinations')

  return candidates
}

export function aiProviderName(dbKey = '') {
  return providerCandidates(dbKey)[0]?.provider || 'local'
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter(
      (item) =>
        item &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string' &&
        item.content.trim(),
    )
    .slice(-MAX_HISTORY)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_MESSAGE),
    }))
}

async function callProvider(provider, { message, history, imageDataUrl, timeoutMs }) {
  const headers = { 'content-type': 'application/json' }
  if (provider.key) headers.authorization = `Bearer ${provider.key}`
  if (provider.provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.APP_URL || 'https://agroserv-lake.vercel.app'
    headers['X-Title'] = 'AgroServ AI'
  }

  const userContent = imageDataUrl
    ? [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: imageDataUrl } },
      ]
    : message

  const response = await fetch(provider.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...sanitizeHistory(history),
        { role: 'user', content: userContent },
      ],
      temperature: 0.5,
      max_tokens: 1600,
    }),
    signal: AbortSignal.timeout(Math.max(5_000, Math.min(provider.timeout, timeoutMs))),
  })

  const raw = await response.text()
  let data = null
  try {
    data = JSON.parse(raw)
  } catch {
    data = null
  }

  if (!response.ok) {
    const detail = data?.error?.message || raw.slice(0, 200)
    throw new Error(`${provider.provider} ${response.status}: ${detail}`)
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content || typeof content !== 'string') {
    throw new Error(`${provider.provider}: bo'sh javob`)
  }
  return content.trim()
}

export async function generateAiReply({ message, history, imageDataUrl, apiKey }) {
  const cleanMessage = String(message || '').trim()
  if (!cleanMessage && !imageDataUrl) {
    return { reply: 'Savolingizni yozing.', offTopic: false, source: 'guard' }
  }

  // Aniq agro bo'lmagan savollarni LLM chaqiruvidan oldin to'sish
  if (!imageDataUrl && isOffTopic(cleanMessage)) {
    return { reply: AGRO_REFUSAL, offTopic: true, source: 'guard' }
  }

  const allCandidates = providerCandidates(apiKey)
  if (!allCandidates.length) {
    return { reply: AI_UNAVAILABLE, offTopic: false, source: 'not-configured' }
  }

  const candidates = imageDataUrl
    ? allCandidates.filter((provider) => provider.vision)
    : allCandidates

  if (!candidates.length) {
    return { reply: AI_UNAVAILABLE, offTopic: false, source: 'no-vision' }
  }

  const deadline = Date.now() + TOTAL_BUDGET_MS
  let lastError = null

  for (const provider of candidates) {
    const remaining = deadline - Date.now()
    if (remaining < 5_000) break

    try {
      const content = await callProvider(provider, {
        message: cleanMessage || 'Yuklangan rasmni tahlil qil.',
        history,
        imageDataUrl,
        timeoutMs: remaining,
      })

      if (/\bOFF[\s_-]*TOPIC\b/i.test(content)) {
        return {
          reply: AGRO_REFUSAL,
          offTopic: true,
          source: provider.provider,
          model: provider.model,
        }
      }

      return {
        reply: content,
        offTopic: false,
        source: provider.provider,
        model: provider.model,
      }
    } catch (error) {
      lastError = error
      console.error(`[ai] ${provider.provider} ishlamadi:`, error.message)
    }
  }

  throw lastError || new Error('Barcha AI provayderlari ishlamadi')
}
