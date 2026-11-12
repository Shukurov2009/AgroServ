import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  Crown,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { REGIONS, ROLES, SELF_ROLES } from '../lib/constants'
import { formatDateTime, formatSom } from '../lib/format'
import { RoleBadge } from '../components/Badges'

const AVATARS = ['🌱', '🌾', '🚜', '🍎', '🧪', '🌿', '🐄', '👨‍🌾', '👩‍🌾', '🛡️', '🍇', '🔧']

const WALLET_LABELS = {
  topup: "To'ldirish",
  purchase: 'Xarid',
  earning: 'Tushum',
  subscription: 'Obuna',
  feature: 'Top mahsulot',
  refund: 'Qaytarish',
  refund_deduction: 'Qaytarish ayirmasi',
  admin_adjust: 'Admin tuzatishi',
}

export default function Profile() {
  const {
    currentUser,
    plan,
    updateProfile,
    changePassword,
    setSelfRole,
    walletTx,
    transactions,
    usedToday,
    aiRemaining,
  } = useStore()

  const [profile, setProfile] = useState({
    name: currentUser.name,
    phone: currentUser.phone || '',
    region: currentUser.region || 'Toshkent',
    bio: currentUser.bio || '',
    avatar: currentUser.avatar || '🌱',
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [role, setRole] = useState(currentUser.role)
  const [tab, setTab] = useState('profile')

  const myWalletTx = walletTx.filter((entry) => entry.userId === currentUser.id)
  const myTransactions = transactions.filter((entry) => entry.userId === currentUser.id)

  async function saveProfile(event) {
    event.preventDefault()
    const result = await updateProfile(profile)
    if (result.ok) toast.success("Profil ma'lumotlari saqlandi")
    else toast.error(result.error)
  }

  async function savePassword(event) {
    event.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Yangi parollar mos kelmadi')
      return
    }
    const result = await changePassword(passwordForm.current, passwordForm.next)
    if (result.ok) {
      toast.success("Parol muvaffaqiyatli o'zgartirildi")
      setPasswordForm({ current: '', next: '', confirm: '' })
    } else {
      toast.error(result.error)
    }
  }

  async function saveRole() {
    const result = await setSelfRole(role)
    if (result.ok) toast.success(`Rol «${ROLES[role].label}» ga o'zgartirildi`)
    else toast.error(result.error)
  }

  const isAdmin = currentUser.role === 'admin'
  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'wallet', label: 'Hamyon', icon: Wallet },
    { id: 'security', label: 'Xavfsizlik', icon: Lock },
    { id: 'settings', label: 'Sozlamalar', icon: ShieldCheck },
  ]

  return (
    <div className="bg-cream">
      <div className="container-page py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
              <span className="h-px w-6 bg-emerald-500" /> Profil
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
              Profil va sozlamalar
            </h1>
            <p className="mt-1 text-xs text-stone-500">Shaxsiy ma'lumotlar, hamyon, xavfsizlik va rol boshqaruvi</p>
          </div>
          <Link to="/kabinet" className="btn btn-secondary btn-sm">
            Kabinetga qaytish
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          {/* SIDEBAR */}
          <div className="space-y-3">
            <div className="card overflow-hidden">
              <div className="relative h-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900">
                <div className="pattern-grid absolute inset-0 opacity-25" />
              </div>
              <div className="px-4 pb-4">
                <div className="-mt-8 flex items-end justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-emerald-50 text-3xl shadow-sm">
                    {currentUser.avatar || '🌱'}
                  </span>
                  <RoleBadge role={currentUser.role} />
                </div>
                <h2 className="mt-2 text-base font-black text-emerald-950">{currentUser.name}</h2>
                <p className="text-[10px] text-stone-400">{currentUser.email}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                    {plan.icon} {plan.name}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500">
                    {currentUser.region}
                  </span>
                  {currentUser.status === 'active' && (
                    <span className="flex items-center gap-1 rounded-full bg-lime-50 px-2 py-0.5 text-[9px] font-bold text-lime-700">
                      <BadgeCheck size={9} /> Faol
                    </span>
                  )}
                </div>
                <div className="mt-3 rounded-xl bg-gradient-to-br from-emerald-50 to-lime-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">Hamyon balansi</p>
                  <p className="mt-0.5 text-lg font-black text-emerald-800">{formatSom(currentUser.wallet || 0)}</p>
                  <Link
                    to="/tolov"
                    state={{ type: 'topup', amount: 100000 }}
                    className="btn btn-primary btn-sm mt-2 w-full"
                  >
                    <Wallet size={13} /> Hamyonni to'ldirish
                  </Link>
                </div>
              </div>
            </div>

            <div className="card p-2">
              {tabs.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                      tab === item.id
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon size={15} /> {item.label}
                    <ArrowRight size={12} className="ml-auto text-stone-300" />
                  </button>
                )
              })}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-black text-emerald-950">
                <Bot size={14} /> AI limit
              </p>
              <p className="mt-1 text-[10px] text-stone-500">
                Bugun {usedToday} ta savol · {aiRemaining === Infinity ? 'cheksiz' : `${aiRemaining} ta qoldi`}
              </p>
              <Link to="/ai-maslahatchi" className="mt-2 inline-flex text-[10px] font-bold text-emerald-700 hover:underline">
                AI maslahatga o'tish →
              </Link>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            {tab === 'profile' && (
              <form onSubmit={saveProfile} className="card p-5 sm:p-6">
                <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                  <User size={16} className="text-emerald-600" /> Shaxsiy ma'lumotlar
                </h2>
                <p className="mt-1 text-[11px] text-stone-500">Profil ma'lumotlari barcha bo'limlarda ko'rinadi.</p>

                <div className="mt-4">
                  <label className="label">Avatar</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setProfile({ ...profile, avatar })}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition ${
                          profile.avatar === avatar
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                            : 'border-stone-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Ism-familiya</label>
                    <div className="relative">
                      <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        value={profile.name}
                        onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Telefon</label>
                    <div className="relative">
                      <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        value={profile.phone}
                        onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                        className="input pl-10"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Viloyat</label>
                    <div className="relative">
                      <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <select
                        value={profile.region}
                        onChange={(event) => setProfile({ ...profile, region: event.target.value })}
                        className="input pl-10"
                      >
                        {REGIONS.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Email (o'zgartirilmaydi)</label>
                    <div className="relative">
                      <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input value={currentUser.email} disabled className="input pl-10" />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="label">O'zingiz haqingizda</label>
                  <textarea
                    value={profile.bio}
                    onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                    rows={3}
                    className="input resize-none"
                    placeholder="Fermer xo'jaligingiz, tajribangiz yoki mutaxassisligingiz haqida..."
                  />
                </div>

                <button type="submit" className="btn btn-primary mt-4">
                  <Save size={15} /> O'zgarishlarni saqlash
                </button>
              </form>
            )}

            {tab === 'wallet' && (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl bg-emerald-950 p-5 text-white">
                  <div className="pattern-grid absolute inset-0 opacity-25" />
                  <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-lime-300">
                        <Wallet size={12} /> AgroServ hamyoni
                      </p>
                      <p className="mt-2 text-3xl font-black tracking-tight">{formatSom(currentUser.wallet || 0)}</p>
                      <p className="mt-1 text-[10px] text-emerald-100/55">Karta yoki hamyon orqali xarid qilish uchun ishlatiladi</p>
                    </div>
                    <Link
                      to="/tolov"
                      state={{ type: 'topup', amount: 100000 }}
                      className="btn btn-lime btn-sm shrink-0"
                    >
                      <Wallet size={14} /> To'ldirish
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['Jami tushum', myWalletTx.filter((entry) => entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0), 'text-emerald-700'],
                    ['Jami xarajat', Math.abs(myWalletTx.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum + entry.amount, 0)), 'text-rose-600'],
                    ['Tranzaksiyalar', myWalletTx.length, 'text-emerald-950'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="card p-4">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">{label}</p>
                      <p className={`mt-1 text-lg font-black ${tone}`}>
                        {typeof value === 'number' && label !== 'Tranzaksiyalar' ? formatSom(value) : value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="card p-5">
                  <h2 className="text-sm font-black text-emerald-950">Hamyon harakatlari</h2>
                  {myWalletTx.length === 0 ? (
                    <p className="mt-2 rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
                      Hozircha tranzaksiya yo'q. Hamyonni to'ldirib boshlang.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-1.5">
                      {myWalletTx.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 p-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                                entry.amount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {entry.amount > 0 ? '+' : '−'}
                            </span>
                            <div>
                              <p className="text-[10px] font-bold text-emerald-950">
                                {WALLET_LABELS[entry.type] || entry.type}
                              </p>
                              <p className="text-[9px] text-stone-400">{entry.description} · {formatDateTime(entry.createdAt)}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 text-[11px] font-black ${entry.amount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {entry.amount > 0 ? '+' : ''}{formatSom(entry.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <h2 className="text-sm font-black text-emerald-950">To'lovlar tarixi</h2>
                  {myTransactions.length === 0 ? (
                    <p className="mt-2 rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
                      Hozircha platforma to'lovlari yo'q.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-1.5">
                      {myTransactions.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 p-2.5">
                          <div>
                            <p className="text-[10px] font-bold text-emerald-950">{entry.description}</p>
                            <p className="text-[9px] text-stone-400">{formatDateTime(entry.createdAt)}</p>
                          </div>
                          <span className="text-[11px] font-black text-emerald-800">{formatSom(entry.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div className="space-y-3">
                <form onSubmit={savePassword} className="card p-5 sm:p-6">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <KeyRound size={16} className="text-emerald-600" /> Parolni o'zgartirish
                  </h2>
                  <p className="mt-1 text-[11px] text-stone-500">
                    Xavfsizlik uchun kamida 8 belgidan iborat yangi parol o'rnating.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="label">Joriy parol</label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })}
                        className="input"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">Yangi parol</label>
                        <input
                          type="password"
                          value={passwordForm.next}
                          onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })}
                          className="input"
                          placeholder="Kamida 8 belgi"
                          minLength={8}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Yangi parolni tasdiqlang</label>
                        <input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })}
                          className="input"
                          placeholder="Qayta kiriting"
                          minLength={8}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-4">
                    <Lock size={15} /> Parolni yangilash
                  </button>
                </form>

                <div className="card p-5 sm:p-6">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <Sparkles size={16} className="text-emerald-600" /> Rolni o'zgartirish
                  </h2>
                  <p className="mt-1 text-[11px] text-stone-500">
                    Faoliyatingizga mos rolni tanlang. Rol kabinet imkoniyatlarini o'zgartiradi.
                  </p>
                  {isAdmin ? (
                    <div className="mt-3 rounded-xl bg-purple-50 p-3 text-[11px] text-purple-700">
                      Administrator roli faqat admin panel orqali boshqa foydalanuvchilarga beriladi.
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {SELF_ROLES.map((roleId) => {
                          const info = ROLES[roleId]
                          const active = role === roleId
                          return (
                            <button
                              key={roleId}
                              type="button"
                              onClick={() => setRole(roleId)}
                              className={`flex items-start gap-2 rounded-xl border p-3 text-left transition ${
                                active
                                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                                  : 'border-stone-200 bg-white hover:border-emerald-300'
                              }`}
                            >
                              <span className="text-lg">{info.icon}</span>
                              <span>
                                <span className="flex items-center gap-1 text-[11px] font-black text-emerald-950">
                                  {info.label}
                                  {active && <Check size={11} className="text-emerald-600" />}
                                </span>
                                <span className="mt-0.5 block text-[9px] leading-relaxed text-stone-500">{info.description}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={saveRole}
                        disabled={role === currentUser.role}
                        className="btn btn-primary mt-3"
                      >
                        <Save size={15} /> Rolni saqlash
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="space-y-3">
                <div className="card p-5 sm:p-6">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <Crown size={16} className="text-emerald-600" /> Obuna va tarif
                  </h2>
                  <div className="mt-3 flex flex-col justify-between gap-3 rounded-xl bg-gradient-to-br from-emerald-50 to-lime-50 p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Joriy tarif</p>
                      <p className="mt-0.5 text-lg font-black text-emerald-950">{plan.icon} {plan.name}</p>
                      <p className="mt-1 text-[10px] text-stone-500">
                        Komissiya {plan.commission}% · {plan.listings === Infinity ? 'cheksiz' : plan.listings} ta e'lon ·{' '}
                        {plan.ai === Infinity ? 'cheksiz' : plan.ai} ta AI savol
                      </p>
                      {currentUser.planExpiresAt && plan.id !== 'free' && (
                        <p className="mt-1 text-[9px] font-semibold text-emerald-600">
                          Amal qiladi: {formatDateTime(currentUser.planExpiresAt)}
                        </p>
                      )}
                    </div>
                    <Link to="/narxlar" className="btn btn-primary btn-sm shrink-0">
                      {plan.id === 'pro' ? 'Tariflarni ko\'rish' : 'Tarifni oshirish'}
                    </Link>
                  </div>
                </div>

                <div className="card p-5 sm:p-6">
                  <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                    <ShieldCheck size={16} className="text-emerald-600" /> Ma'lumotlar xavfsizligi
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                    Profilingiz, buyurtmalaringiz va hamyon harakatlaringiz serverda himoyalangan
                    holda saqlanadi. Parolni unutgan bo'lsangiz, kirish sahifasidagi
                    «Parolni unutdingizmi?» orqali administratorga so'rov yuboring.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/login" className="btn btn-secondary">
                      <KeyRound size={15} /> Parolni tiklash so'rovi
                    </Link>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[9px] text-stone-400">
                    <ShieldCheck size={10} /> Sessiya 30 kun amal qiladi va serverda tekshiriladi
                  </p>
                </div>

                <div className="card p-5 sm:p-6">
                  <h2 className="text-sm font-black text-emerald-950">Hisob ma'lumotlari</h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[
                      ['Foydalanuvchi ID', currentUser.id],
                      ['Ro\'yxatdan o\'tgan', formatDateTime(currentUser.createdAt)],
                      ['Rol', ROLES[currentUser.role].label],
                      ['Holat', currentUser.status === 'active' ? 'Faol' : 'Bloklangan'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-stone-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">{label}</p>
                        <p className="mt-0.5 truncate text-[11px] font-bold text-emerald-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
