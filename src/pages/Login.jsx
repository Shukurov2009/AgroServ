import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { ArrowRight, Check, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { ROLES, SELF_ROLES } from '../lib/constants'
import AuthVisual from '../components/AuthVisual'
import Modal from '../components/Modal'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function Login() {
  const { currentUser, signIn, loginWithGoogle, resetPassword, integrations } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/kabinet'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotDelivery, setForgotDelivery] = useState('admin')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [pendingGoogle, setPendingGoogle] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')

  if (currentUser) return <Navigate to={from} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    const result = await signIn(form.email, form.password)
    setSubmitting(false)
    if (result.ok) {
      toast.success(`Xush kelibsiz, ${result.user.name}!`)
      navigate(from, { replace: true })
    } else {
      toast.error(result.error)
    }
  }

  async function handleGoogleCredential(credential) {
    if (!credential) return
    setGoogleLoading(true)
    const result = await loginWithGoogle(credential)
    setGoogleLoading(false)
    if (result.ok) {
      toast.success('Google hisobi orqali kirdingiz')
      navigate(from, { replace: true })
      return
    }
    if (result.code === 'NO_ACCOUNT' && result.needsRole) {
      setSelectedRole('')
      setPendingGoogle({ credential, profile: result.profile || {} })
      return
    }
    toast.error(result.error)
  }

  async function handleGoogleRegister(event) {
    event.preventDefault()
    if (!pendingGoogle) return
    if (!SELF_ROLES.includes(selectedRole)) {
      toast.error('Rolni tanlang')
      return
    }
    setGoogleLoading(true)
    const result = await loginWithGoogle(pendingGoogle.credential, selectedRole)
    setGoogleLoading(false)
    if (result.ok) {
      setPendingGoogle(null)
      toast.success(`Hisob yaratildi. Xush kelibsiz, ${result.user.name}!`)
      const target =
        selectedRole === 'seller'
          ? '/dokon'
          : ['worker', 'agronomist'].includes(selectedRole)
            ? '/xizmatlarim'
            : '/kabinet'
      navigate(target, { replace: true })
    } else {
      toast.error(result.error)
    }
  }

  async function handleForgot(event) {
    event.preventDefault()
    setForgotLoading(true)
    const result = await resetPassword(forgotEmail)
    setForgotLoading(false)
    if (result.ok) {
      setForgotDelivery(result.delivery || (integrations.email ? 'email' : 'admin'))
      setForgotSent(true)
    } else {
      toast.error(result.error)
    }
  }

  function closeForgot() {
    setForgotOpen(false)
    setForgotSent(false)
    setForgotDelivery('admin')
    setForgotEmail('')
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

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="mt-6">
                  <div className="flex justify-center overflow-hidden rounded-xl">
                    <GoogleLogin
                      onSuccess={(response) => handleGoogleCredential(response.credential)}
                      onError={() => toast.error('Google orqali kirish bekor qilindi')}
                      theme="outline"
                      shape="rectangular"
                      size="large"
                      text="continue_with"
                      width="360"
                    />
                  </div>
                  {googleLoading && (
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <Loader2 size={13} className="animate-spin" /> Google tekshirilmoqda...
                    </p>
                  )}
                </div>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-stone-200" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">yoki email bilan</span>
                  <span className="h-px flex-1 bg-stone-200" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className={`space-y-3.5 ${GOOGLE_CLIENT_ID ? '' : 'mt-6'}`}>
              <div>
                <label className="label" htmlFor="login-email">Email manzil</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="siz@agroserv.uz"
                    className="input pl-10"
                    autoComplete="email"
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
                    autoComplete="current-password"
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

              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
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

          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 backdrop-blur">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-[10px] leading-relaxed text-stone-500">
              Ma'lumotlaringiz serverda himoyalangan holda saqlanadi. Har bir foydalanuvchi o'z
              hisobini o'zi yaratadi va faqat o'z paroli bilan kiradi.
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={forgotOpen}
        onClose={closeForgot}
        title="Parolni tiklash"
        subtitle={
          integrations.email
            ? "Email manzilingizni yuboring. Hisob mavjud bo'lsa, 30 daqiqa amal qiladigan tiklash havolasi yuboriladi."
            : "Email manzilingizni yuboring. Administrator so'rovni ko'rib chiqib, yangi parolni siz bilan bog'langan aloqa kanali orqali beradi."
        }
        size="sm"
      >
        {forgotSent ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-bold">
                {forgotDelivery === 'email' ? 'Havola yuborildi' : "So'rov qabul qilindi"}
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                {forgotDelivery === 'email' ? (
                  <>
                    Agar <span className="font-semibold">{forgotEmail}</span> ro'yxatdan o'tgan
                    bo'lsa, parolni tiklash havolasi yuborildi. Pochta qutingizni va spam papkasini
                    tekshiring.
                  </>
                ) : (
                  <>
                    Agar <span className="font-semibold">{forgotEmail}</span> ro'yxatdan o'tgan
                    bo'lsa, administrator parolni tiklash so'rovini ko'radi va siz bilan bog'lanadi.
                  </>
                )}
              </p>
            </div>
            <button type="button" onClick={closeForgot} className="btn btn-primary w-full">
              Tushundim
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-3.5">
            <div>
              <label className="label" htmlFor="forgot-email">Email manzil</label>
              <input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                className="input"
                placeholder="siz@agroserv.uz"
                required
              />
            </div>
            <p className="rounded-lg bg-stone-50 px-3 py-2 text-[10px] leading-relaxed text-stone-500">
              {integrations.email
                ? "Havola 30 daqiqa amal qiladi va faqat bir marta ishlatiladi. Xat kelmasa, spam papkasini tekshiring."
                : "Xavfsizlik uchun parolni faqat administrator yangilaydi. So'rov yuborilgach, u bilan bog'lanish uchun telefon raqamingiz yangilangan bo'lishi kerak."}
            </p>
            <button type="submit" className="btn btn-primary w-full" disabled={forgotLoading}>
              {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {integrations.email ? 'Havola yuborish' : "So'rov yuborish"}
            </button>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(pendingGoogle)}
        onClose={() => setPendingGoogle(null)}
        title="Rolingizni tanlang"
        subtitle="Google hisobi topildi, lekin AgroServ'da hisob yo'q. O'zingizga mos rolni tanlab, hisobni yarating."
        size="sm"
      >
        <form onSubmit={handleGoogleRegister} className="space-y-4">
          {pendingGoogle?.profile?.email && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs">
              <p className="font-bold text-emerald-950">{pendingGoogle.profile.name || 'Google foydalanuvchisi'}</p>
              <p className="text-stone-500">{pendingGoogle.profile.email}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {SELF_ROLES.map((role) => {
              const info = ROLES[role]
              const active = selectedRole === role
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`relative rounded-xl border p-2.5 text-left transition ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                      : 'border-stone-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <span className="text-lg">{info.icon}</span>
                  <p className={`mt-1 text-[10px] font-black ${active ? 'text-emerald-800' : 'text-stone-700'}`}>
                    {info.label}
                  </p>
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={9} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] leading-relaxed text-stone-400">
            {selectedRole ? ROLES[selectedRole].description : "Hisob yaratish uchun rolni tanlang."}
          </p>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={googleLoading || !selectedRole}
          >
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            Hisob yaratish va kirish
          </button>
        </form>
      </Modal>
    </section>
  )
}
