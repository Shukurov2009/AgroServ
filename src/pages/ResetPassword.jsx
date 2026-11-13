import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock } from 'lucide-react'
import { api } from '../lib/api'
import PageHero from '../components/PageHero'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lsin")
      return
    }
    if (form.password !== form.confirm) {
      setError('Parollar bir xil emas')
      return
    }
    setSubmitting(true)
    try {
      const result = await api.post('/auth/password-reset/confirm', {
        token,
        password: form.password,
      })
      setDone(true)
      toast.success(result.message || "Parol yangilandi")
    } catch (err) {
      setError(err.message || "Havola yaroqsiz yoki muddati o'tgan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="soft-gradient">
      <PageHero
        dark={false}
        eyebrow="Xavfsizlik"
        title="Parolni tiklash"
        description="Yangi parolni o'rnating. Havola 30 daqiqa amal qiladi va faqat bir marta ishlatiladi."
        breadcrumbs={[{ label: 'Parolni tiklash' }]}
      />

      <div className="container-page py-8 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          {!token ? (
            <div className="card p-6 text-center sm:p-8">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle size={22} />
              </span>
              <h1 className="mt-4 text-xl font-black text-emerald-950">Havola topilmadi</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Parolni tiklash havolasi to'liq emas yoki muddati o'tgan. Iltimos, yangi havola so'rang.
              </p>
              <Link to="/login" className="btn btn-primary mt-5 w-full">
                Kirish sahifasiga qaytish <ArrowRight size={16} />
              </Link>
            </div>
          ) : done ? (
            <div className="card p-6 text-center sm:p-8">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={24} />
              </span>
              <h1 className="mt-4 text-xl font-black text-emerald-950">Parol yangilandi</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Endi yangi parolingiz bilan hisobingizga kirishingiz mumkin. Barcha eski sessiyalar
                xavfsizlik uchun yakunlandi.
              </p>
              <Link to="/login" className="btn btn-primary mt-5 w-full">
                Kirish <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                <span className="h-px w-6 bg-emerald-500" /> Yangi parol
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-emerald-950">
                Parolni yangilang
              </h1>
              <p className="mt-1.5 text-sm text-stone-500">
                Kamida 8 ta belgidan iborat kuchli parol tanlang.
              </p>

              <div className="mt-5 space-y-3.5">
                <div>
                  <label className="label" htmlFor="reset-password">Yangi parol</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      className="input pl-10 pr-11"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      aria-label="Parolni ko'rsatish"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="reset-confirm">Parolni tasdiqlang</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="reset-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(event) => setForm({ ...form, confirm: event.target.value })}
                      className="input pl-10"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                  </p>
                )}

                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                  Parolni saqlash
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-stone-500">
                <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-900">
                  Kirish sahifasiga qaytish
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
