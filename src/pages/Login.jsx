import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import AuthVisual from '../components/AuthVisual'
import Modal from '../components/Modal'

const DEMO_ACCOUNTS = [
  { label: 'Administrator', email: 'admin@agroserv.uz', password: 'admin123', icon: '🛡️', note: 'To\'liq boshqaruv' },
  { label: 'Sotuvchi', email: 'sotuvchi@agroserv.uz', password: 'demo123', icon: '🚜', note: 'Agro texnika' },
  { label: 'Fermer', email: 'fermer@agroserv.uz', password: 'demo123', icon: '🌾', note: 'Xaridor' },
  { label: 'Texnika ustasi', email: 'ishchi@agroserv.uz', password: 'demo123', icon: '🔧', note: 'Xizmat ko\'rsatuvchi' },
  { label: 'Agronom', email: 'agronom@agroserv.uz', password: 'demo123', icon: '🌿', note: 'Maslahatchi' },
]

export default function Login() {
  const { currentUser, signIn, loginDemo, loginWithGoogle, resetPassword } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/kabinet'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotForm, setForgotForm] = useState({ email: '', password: '' })

  if (currentUser) return <Navigate to={from} replace />

  function handleSubmit(event) {
    event.preventDefault()
    const result = signIn(form.email, form.password)
    if (result.ok) {
      toast.success(`Xush kelibsiz, ${result.user.name}!`)
      navigate(from, { replace: true })
    } else {
      toast.error(result.error)
    }
  }

  function handleDemo(account) {
    const result = loginDemo(account.email)
    if (result.ok) {
      toast.success(`${account.label} sifatida kirdingiz`)
      navigate('/kabinet', { replace: true })
    } else {
      toast.error(result.error)
    }
  }

  function handleGoogle() {
    setGoogleLoading(true)
    window.setTimeout(() => {
      const result = loginWithGoogle()
      setGoogleLoading(false)
      if (result.ok) {
        toast.success('Google hisobi orqali kirdingiz')
        navigate('/kabinet', { replace: true })
      }
    }, 900)
  }

  function handleReset(event) {
    event.preventDefault()
    const result = resetPassword(forgotForm.email, forgotForm.password)
    if (result.ok) {
      toast.success('Parol yangilandi. Endi yangi parol bilan kiring.')
      setForgotOpen(false)
      setForm({ email: forgotForm.email, password: '' })
      setForgotForm({ email: '', password: '' })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <section className="soft-gradient">
      <div className="container-page grid min-h-[calc(100vh-68px)] items-center gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-12">
        <AuthVisual />

        <div className="mx-auto w-full max-w-md">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
              <span className="h-px w-6 bg-emerald-500" /> Hisobingizga kiring
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
              Xush kelibsiz!
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Davom etish uchun email va parolingizni kiriting.
            </p>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="btn btn-secondary mt-6 w-full"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
              )}
              {googleLoading ? 'Google tekshirilmoqda...' : 'Google orqali kirish'}
            </button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">yoki email bilan</span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="label" htmlFor="login-email">Email manzil</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="fermer@agroserv.uz"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="login-password">Parol</label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="mb-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    Parolni unutdingizmi?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="••••••••"
                    className="input pl-10 pr-11"
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

              <label className="flex items-center gap-2 text-[11px] font-medium text-stone-500">
                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                Meni eslab qol
              </label>

              <button type="submit" className="btn btn-primary w-full">
                Kirish <ArrowRight size={16} />
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-stone-500">
              Hisobingiz yo'qmi?{' '}
              <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-900">
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400">
                Demo hisoblar — bir bosishda kirish
              </p>
              <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-lime-700">
                Offline demo
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemo(account)}
                  className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
                >
                  <span className="text-lg">{account.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-bold text-emerald-950">{account.label}</span>
                    <span className="block truncate text-[8px] text-stone-400">{account.note}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 flex items-center gap-1 text-[9px] text-stone-400">
              <ShieldCheck size={11} className="text-emerald-500" />
              Demo parollar: admin123 / demo123. Ma'lumotlar faqat brauzeringizda saqlanadi.
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Parolni tiklash"
        subtitle="Demo rejimda yangi parolni shu yerda belgilashingiz mumkin."
        size="sm"
      >
        <form onSubmit={handleReset} className="space-y-3.5">
          <div>
            <label className="label" htmlFor="forgot-email">Email manzil</label>
            <input
              id="forgot-email"
              type="email"
              value={forgotForm.email}
              onChange={(event) => setForgotForm({ ...forgotForm, email: event.target.value })}
              className="input"
              placeholder="fermer@agroserv.uz"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="forgot-password">Yangi parol</label>
            <input
              id="forgot-password"
              type="password"
              value={forgotForm.password}
              onChange={(event) => setForgotForm({ ...forgotForm, password: event.target.value })}
              className="input"
              placeholder="Kamida 6 ta belgi"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            <KeyRound size={16} /> Parolni yangilash
          </button>
        </form>
      </Modal>
    </section>
  )
}
