import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, MapPin, Phone, User } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { REGIONS, ROLES, SELF_ROLES } from '../lib/constants'
import AuthVisual from '../components/AuthVisual'

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  region: 'Toshkent',
  password: '',
  confirm: '',
  role: '',
}

export default function Register() {
  const { currentUser, signUp } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (currentUser) {
    const target =
      currentUser.role === 'seller'
        ? '/dokon'
        : ['worker', 'agronomist'].includes(currentUser.role)
          ? '/xizmatlarim'
          : '/kabinet'
    return <Navigate to={target} replace />
  }

  const strength = getStrength(form.password)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Ismni kiriting'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Email noto\'g\'ri'
    if (!SELF_ROLES.includes(form.role)) nextErrors.role = 'Rolni tanlang'
    if (form.password.length < 8) nextErrors.password = 'Kamida 8 ta belgi'
    if (form.password !== form.confirm) nextErrors.confirm = 'Parollar mos kelmadi'
    if (!accepted) nextErrors.accepted = 'Foydalanish shartlarini qabul qiling'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Iltimos, maydonlarni tekshiring')
      return
    }

    setSubmitting(true)
    const result = await signUp({
      name: form.name,
      email: form.email,
      phone: form.phone,
      region: form.region,
      password: form.password,
      role: form.role,
    })
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success("Hisob yaratildi. AgroServ'ga xush kelibsiz!")
    if (form.role === 'seller') navigate('/dokon')
    else if (['worker', 'agronomist'].includes(form.role)) navigate('/xizmatlarim')
    else navigate('/kabinet')
  }

  return (
    <section className="soft-gradient">
      <div className="container-page grid min-h-[calc(100vh-68px)] items-center gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-12">
        <AuthVisual
          title="Bir daqiqada hisob oching va savdoni boshlang"
          subtitle="Rolingizni tanlang — tizim sizga mos kabinet, imkoniyatlar va tarif tavsiyalarini tayyorlaydi."
        />

        <div className="mx-auto w-full max-w-xl">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
              <span className="h-px w-6 bg-emerald-500" /> Yangi hisob
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
              Ro'yxatdan o'tish
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Bepul boshlang. E'lon joylash, savdo qilish va AI maslahat — barchasi bepul.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="label">Men kimman?</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SELF_ROLES.map((role) => {
                    const info = ROLES[role]
                    const active = form.role === role
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => update('role', role)}
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
                <p className="mt-1.5 text-[10px] text-stone-400">
                  {form.role ? ROLES[form.role].description : "O'zingizga mos rolni tanlang — bu keyin o'zgartirilishi mumkin."}
                </p>
                {errors.role && <p className="mt-1 text-[10px] font-semibold text-rose-500">{errors.role}</p>}
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="reg-name">Ism-familiya</label>
                  <div className="relative">
                    <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="reg-name"
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      placeholder="Aziz Karimov"
                      className="input pl-10"
                      required
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-[10px] font-semibold text-rose-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="reg-phone">Telefon</label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="reg-phone"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="reg-email">Email manzil</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="reg-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => update('email', event.target.value)}
                      placeholder="siz@agroserv.uz"
                      className="input pl-10"
                      required
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[10px] font-semibold text-rose-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="reg-region">Viloyat</label>
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <select
                      id="reg-region"
                      value={form.region}
                      onChange={(event) => update('region', event.target.value)}
                      className="input pl-10"
                    >
                      {REGIONS.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="reg-password">Parol</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(event) => update('password', event.target.value)}
                      placeholder="Kamida 8 ta belgi"
                      className="input pl-10 pr-10"
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
                  {form.password && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            strength >= level
                              ? strength <= 2
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                              : 'bg-stone-200'
                          }`}
                        />
                      ))}
                      <span className="text-[9px] font-semibold text-stone-400">
                        {strength <= 1 ? 'Zaif' : strength <= 2 ? "O'rtacha" : strength <= 3 ? 'Yaxshi' : 'Kuchli'}
                      </span>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-[10px] font-semibold text-rose-500">{errors.password}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="reg-confirm">Parolni tasdiqlang</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(event) => update('confirm', event.target.value)}
                      placeholder="Parolni qayta kiriting"
                      className="input pl-10"
                      required
                    />
                  </div>
                  {errors.confirm && <p className="mt-1 text-[10px] font-semibold text-rose-500">{errors.confirm}</p>}
                </div>
              </div>

              <label className="flex items-start gap-2 text-[10px] leading-relaxed text-stone-500">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  Men{' '}
                  <Link to="/shartlar" className="font-bold text-emerald-700 hover:underline">
                    foydalanish shartlari
                  </Link>{' '}
                  va{' '}
                  <Link to="/maxfiylik" className="font-bold text-emerald-700 hover:underline">
                    maxfiylik siyosatiga
                  </Link>{' '}
                  roziman.
                </span>
              </label>
              {errors.accepted && <p className="text-[10px] font-semibold text-rose-500">{errors.accepted}</p>}

              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Hisob yaratish <ArrowRight size={16} />
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-stone-500">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-900">
                Kirish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function getStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1
  return score
}
