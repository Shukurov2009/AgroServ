import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  Bot,
  Camera,
  Check,
  Crown,
  Image as ImageIcon,
  Leaf,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { AI_SUGGESTIONS, getAiReply } from '../lib/ai'
import { PLANS } from '../lib/constants'
import PageHero from '../components/PageHero'

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'assistant',
    text:
      "Assalomu alaykum! Men AgroServ AI agronom maslahatchisiman. 🌱\n\n" +
      "Menga ekinlar, kasalliklar, o'g'itlash, sug'orish yoki platforma xizmatlari haqida savol bering. " +
      "Barg yoki o'simlik rasmini ham yuklashingiz mumkin — umumiy tahlil beraman.",
    at: new Date().toISOString(),
  },
]

const TOPICS = [
  { icon: '🍅', label: 'Pomidor', text: "Pomidorda barglari sariq bo'lib qoldi, nima qilay?" },
  { icon: '🌾', label: "Bug'doy", text: "Bug'doyni qanday o'g'itlash kerak?" },
  { icon: '🧪', label: "O'g'it", text: "Karbamidni qachon qo'llash to'g'ri?" },
  { icon: '💧', label: "Sug'orish", text: "Tomchilatib sug'orish tizimini qanday o'rnataman?" },
  { icon: '🍎', label: "Bog'", text: "Olma bog'ini bahorda qanday parvarishlayman?" },
  { icon: '📈', label: 'Savdo', text: "Mahsulotimni qanday foydali sotaman?" },
]

export default function AiAdvisor() {
  const { plan, aiRemaining, usedToday, consumeAiMessage } = useStore()
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [image, setImage] = useState(null)
  const [limitHit, setLimitHit] = useState(false)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing])

  function handleImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm faylini yuklang')
      return
    }
    setImage({ file, url: URL.createObjectURL(file), name: file.name })
  }

  function clearImage() {
    if (image?.url) URL.revokeObjectURL(image.url)
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function send(text) {
    const content = String(text || '').trim()
    if (!content && !image) return
    if (typing) return

    setTyping(true)
    const limit = await consumeAiMessage()
    if (!limit.ok) {
      setTyping(false)
      setLimitHit(true)
      toast.error(limit.error || 'Kunlik AI limit tugadi. Tarifni oshiring.')
      return
    }
    setLimitHit(false)

    const userMessage = {
      id: `u${Date.now()}`,
      role: 'user',
      text: content || 'Yuklangan rasmni tahlil qiling',
      image: image?.url || null,
      imageName: image?.name || '',
      at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    const imageName = image?.name || ''
    clearImage()

    const reply = getAiReply(content, imageName)
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          role: 'assistant',
          text: reply,
          at: new Date().toISOString(),
        },
      ])
      setTyping(false)
    }, 800)
  }

  function handleSubmit(event) {
    event.preventDefault()
    send(input)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(input)
    }
  }

  function clearChat() {
    setMessages(INITIAL_MESSAGES)
    clearImage()
    setInput('')
    toast.success('Suhbat tozalandi')
  }

  return (
    <div>
      <PageHero
        eyebrow="AI maslahatchi"
        title="Agronom maslahati — 24/7"
        description="Ekinlar, kasalliklar, o'g'itlash va sug'orish bo'yicha savollaringizga AgroServ bilim bazasi asosida javob beradi."
        breadcrumbs={[{ label: 'AI maslahatchi' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-[11px] font-bold text-lime-300">
              <Sparkles size={12} /> {plan.name} tarif
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-emerald-100/70">
              {aiRemaining === Infinity ? 'Cheksiz savol' : `${aiRemaining} ta savol qoldi`}
            </span>
          </div>
        }
      />

      <section className="container-page py-6 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          {/* CHAT */}
          <div className="card flex h-[520px] flex-col overflow-hidden sm:h-[640px]">
            <div className="flex items-center justify-between gap-3 border-b border-emerald-900/5 bg-gradient-to-r from-emerald-50 to-lime-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Bot size={20} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-lime-400" />
                </span>
                <div>
                  <p className="text-sm font-black text-emerald-950">AgroServ AI</p>
                  <p className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />
                    Onlayn · AgroServ bilim bazasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearChat}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-stone-400 transition hover:bg-white hover:text-rose-500"
              >
                <Trash2 size={12} /> Tozalash
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_20%_10%,#f0fdf4,transparent_45%),radial-gradient(circle_at_90%_80%,#fefce8,transparent_40%)] px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-emerald-950 text-lime-300'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {message.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      message.role === 'user'
                        ? 'rounded-tr-sm bg-emerald-700 text-white'
                        : 'rounded-tl-sm border border-emerald-900/5 bg-white text-stone-700'
                    }`}
                  >
                    {message.image && (
                      <div className="mb-2 overflow-hidden rounded-xl border border-white/20">
                        <img src={message.image} alt="Yuklangan rasm" className="max-h-40 w-full object-cover" />
                      </div>
                    )}
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p
                      className={`mt-1.5 text-[9px] font-medium ${
                        message.role === 'user' ? 'text-emerald-100/60' : 'text-stone-400'
                      }`}
                    >
                      {new Date(message.at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Bot size={15} />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-emerald-900/5 bg-white px-4 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '120ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '240ms' }} />
                    <span className="ml-1 text-[10px] font-semibold text-stone-400">AI o'ylayapti...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {limitHit && (
              <div className="border-t border-rose-100 bg-rose-50 px-4 py-2.5">
                <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-rose-700">
                  Kunlik limit tugadi.
                  <Link to="/narxlar" className="inline-flex items-center gap-1 font-black underline">
                    Tarifni oshiring <ArrowRight size={11} />
                  </Link>
                </p>
              </div>
            )}

            <div className="border-t border-emerald-900/5 bg-white px-3 py-3">
              {image && (
                <div className="mb-2 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
                  <img src={image.url} alt="Ko'rinish" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold text-emerald-950">{image.name}</p>
                    <p className="text-[9px] text-emerald-600">Rasm tahlilga qo'shiladi</p>
                  </div>
                  <button type="button" onClick={clearImage} className="text-stone-400 hover:text-rose-500">
                    <X size={15} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-400 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                  aria-label="Rasm yuklash"
                >
                  <Camera size={18} />
                </button>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Savolingizni yozing... (Enter — yuborish)"
                  className="input max-h-28 min-h-10 flex-1 resize-none py-2.5 text-xs"
                />
                <button
                  type="submit"
                  disabled={typing || (!input.trim() && !image)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                  aria-label="Yuborish"
                >
                  {typing ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
              </form>
              <p className="mt-1.5 text-center text-[9px] text-stone-400">
                AI AgroServ bilim bazasidan javob beradi. Muhim qarorlar uchun agronomga murojaat qiling.
              </p>
            </div>
          </div>

          {/* SIDE */}
          <div className="space-y-3">
            <div className="card p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                <Leaf size={15} className="text-emerald-600" /> Tez savollar
              </h3>
              <div className="mt-2.5 grid gap-1.5">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => send(topic.text)}
                    className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
                  >
                    <span className="text-base">{topic.icon}</span>
                    <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-stone-600">{topic.text}</span>
                    <ArrowRight size={12} className="shrink-0 text-stone-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                <Sparkles size={15} className="text-emerald-600" /> Tavsiya etilgan savollar
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {AI_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-emerald-950">Kunlik limit</h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  {plan.name}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-black text-emerald-950">
                  {usedToday}
                  <span className="text-xs font-bold text-stone-400">
                    /{plan.ai === Infinity ? '∞' : plan.ai}
                  </span>
                </p>
                <p className="text-[10px] font-semibold text-stone-400">savol ishlatildi</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                  style={{
                    width:
                      plan.ai === Infinity
                        ? '12%'
                        : `${Math.min(100, (usedToday / plan.ai) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-3 space-y-1.5">
                {Object.values(PLANS).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[10px]">
                    <span className={`flex items-center gap-1 font-bold ${item.id === plan.id ? 'text-emerald-700' : 'text-stone-500'}`}>
                      {item.id === 'pro' ? <Crown size={11} /> : item.id === 'plus' ? <Zap size={11} /> : <Sparkles size={11} />}
                      {item.name}
                      {item.id === plan.id && <Check size={10} />}
                    </span>
                    <span className="font-semibold text-stone-400">
                      {item.ai === Infinity ? 'Cheksiz' : `${item.ai} savol`}
                    </span>
                  </div>
                ))}
              </div>
              {plan.id !== 'pro' && (
                <Link to="/narxlar" className="btn btn-primary btn-sm mt-3 w-full">
                  Tarifni oshirish <ArrowRight size={13} />
                </Link>
              )}
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-black text-amber-900">
                <ImageIcon size={14} /> Rasm yuborish
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-amber-800/80">
                Kasallik belgilari bo'lgan barg yoki meva rasmini yuklang. AI rasm nomi va belgilar asosida
                umumiy tahlil beradi. Aniq tashxis uchun agronomga murojaat qiling.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
