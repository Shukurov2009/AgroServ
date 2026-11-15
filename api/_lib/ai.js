import { AGRO_REFUSAL, getLocalReply, isOffTopic } from '../../src/lib/ai.js'

const MAX_HISTORY = 8
const MAX_MESSAGE = 2000

const SYSTEM_PROMPT = `Sen "AgroServ AI" agronom maslahatchisisan. Sening yagona vazifang — qishloq xo'jaligi, dehqonchilik, bog'dorchilik, chorvachilik, asalarichilik, agro texnika, o'g'it, urug', ko'chat, sug'orish, o'simlik kasalliklari va zararkunandalar, tuproq, hosilni saqlash, agro bozor narxlari va fermer xo'jaligi iqtisodiyoti bo'yicha maslahat berish.

Qoidalar:
1. Faqat shu mavzulardagi savollarga javob ber. Boshqa mavzuda (dasturlash, siyosat, sport, o'yin, inson tibbiyoti, shaxsiy munosabatlar, moliya, kripto, umumiy ta'lim va h.k.) so'ralgan bo'lsa, faqat "OFF_TOPIC" so'zini qaytar, boshqa hech narsa yozma.
2. Savol noaniq bo'lsa, aniqroq ma'lumot so'ra: ekin nomi, viloyat, tuproq, belgilar, qaysi bosqich.
3. Javobni o'zbek tilida (lotin yozuvida) yoz. Qisqa, amaliy va bosqichma-bosqich bo'lsin. Kerak bo'lsa ro'yxat ishlat.
4. Agar savolda bir nechta usul so'ralsa, barcha asosiy usullarni sanab o't va qaysi holatda qaysi usul mosligini ayt.
5. Dozalar, preparatlar va kimyoviy ishlovlar haqida gapirganda ehtiyotkor bo'l: aniq doza uchun tuproq tahlili va mahalliy agronom tavsiyasi kerakligini ayt. Taqiqlangan yoki xavfli moddalarni tavsiya qilma.
6. O'zingni inson deb ko'rsatma; "men agronomman" deb aytma, "AgroServ AI maslahatchisi" deb tanishtir.
7. Javobda ortiqcha umumiy gaplar yozma; foydalanuvchi savoliga bevosita javob ber.
8. Agar savol agro sohaga oid bo'lsa-yu, aniq ma'lumot yetishmasa, taxmin qilib yozma — qisqa savol ber.
9. O'simlik kasalligi yoki zararkunanda haqida gapirganda belgilarni sanab o't va birinchi yordam choralarini ayt; aniq tashxis uchun agronom yoki laboratoriya kerakligini eslat.
10. Hech qachon boshqa tildagi yoki mavzudagi javobni aralashtirma.`

function providerConfig(dbKey = '') {
  const geminiKey = dbKey || process.env.GEMINI_API_KEY
  if (geminiKey) {
    return {
      provider: 'gemini',
      key: geminiKey,
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    }
  }

  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    return {
      provider: 'groq',
      key: groqKey,
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    }
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY
  if (openRouterKey) {
    return {
      provider: 'openrouter',
      key: openRouterKey,
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    }
  }

  const openAiKey = process.env.OPENAI_API_KEY
  if (openAiKey) {
    return {
      provider: 'openai',
      key: openAiKey,
      url: 'https://api.openai.com/v1/chat/completions',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    }
  }

  return null
}

export function aiProviderName(dbKey = '') {
  return providerConfig(dbKey)?.provider || 'local'
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

async function callProvider(provider, { message, history }) {
  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${provider.key}`,
  }
  if (provider.provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.APP_URL || 'https://agroserv-lake.vercel.app'
    headers['X-Title'] = 'AgroServ AI'
  }

  const response = await fetch(provider.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...sanitizeHistory(history),
        { role: 'user', content: message.slice(0, MAX_MESSAGE) },
      ],
      temperature: 0.5,
      max_tokens: 1600,
    }),
    signal: AbortSignal.timeout(30000),
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

export async function generateAiReply({ message, history, imageName, apiKey }) {
  const cleanMessage = String(message || '').trim()
  if (!cleanMessage) {
    return { reply: 'Savolingizni yozing.', offTopic: false, source: 'guard' }
  }

  // Hozircha rasm tahlili fayl nomi va belgilar asosida (vision keyin qo'shiladi)
  if (imageName) {
    return { ...getLocalReply(cleanMessage, imageName), source: 'local-image' }
  }

  // Aniq agro bo'lmagan savollarni LLM chaqiruvidan oldin to'sish
  if (isOffTopic(cleanMessage)) {
    return { reply: AGRO_REFUSAL, offTopic: true, source: 'guard' }
  }

  const provider = providerConfig(apiKey)
  if (!provider) {
    return { ...getLocalReply(cleanMessage), source: 'local' }
  }

  try {
    const content = await callProvider(provider, { message: cleanMessage, history })
    if (/\bOFF[\s_-]*TOPIC\b/i.test(content)) {
      return { reply: AGRO_REFUSAL, offTopic: true, source: provider.provider }
    }
    return { reply: content, offTopic: false, source: provider.provider }
  } catch (error) {
    console.error('[ai] provider error:', error.message)
    return { ...getLocalReply(cleanMessage), source: 'local-fallback' }
  }
}
