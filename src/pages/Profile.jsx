import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Bot,
  CreditCard,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { REGIONS, ROLES, ROLE_GROUPS, LEGACY_ROLES } from '../lib/constants'
import { formatDateTime, formatSom } from '../lib/format'
import { RoleBadge } from '../components/Badges'
import OtpModal from '../components/OtpModal'

const AVATARS = ['🌱', '🌾', '🚜', '🍎', '🧪', '🌿', '🐄', '👨‍🌾', '👩‍🌾', '🛡️', '🍇', '🔧']

const WALLET_LABELS = {
  topup: "To'ldirish",
  purchase: 'Xarid',
  earning: 'Tushum',
  subscription: 'Eski obuna',
  feature: 'Top mahsulot',
  refund: 'Qaytarish',
  refund_deduction: 'Qaytarish ayirmasi',
  admin_adjust: 'Admin tuzatishi',
  withdrawal: 'Pul yechish',
  withdrawal_refund: 'Yechish qaytarildi',
  withdrawal_commission: 'Yechish komissiyasi',
  delivery_payout: 'Yetkazish haqi',
  commission_deduction: 'Naqd savdo komissiyasi',
}

const WITHDRAWAL_STATUS = {
  pending: { label: "Ko'rib chiqilmoqda", className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Tasdiqlangan', className: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rad etilgan', className: 'bg-rose-50 text-rose-600' },
  cancelled: { label: 'Bekor qilingan', className: 'bg-stone-100 text-stone-500' },
}

const WITHDRAWAL_COMMISSION_RATE = 5

function formatCardInput(value = '') {
  return String(value)
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function normalizePhoneInput(value = '') {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 9) digits = `998${digits}`
  if (digits.length === 10 && digits.startsWith('8')) digits = `998${digits.slice(1)}`
  if (digits.length > 12 && digits.startsWith('998')) digits = digits.slice(0, 12)
  return digits ? `+${digits}` : ''
}

export default function Profile() {
  const {
    currentUser,
    updateProfile,
    changePassword,
    setSelfRole,
    walletTx,
    withdrawals,
    transactions,
    requestWithdrawal,
    linkCard,
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
  const [withdrawForm, setWithdrawForm] = useState({ amount: '' })
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawPreview, setWithdrawPreview] = useState(null)
  const [withdrawOtpOpen, setWithdrawOtpOpen] = useState(false)
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: currentUser.cardHolder || currentUser.name,
    phone: normalizePhoneInput(currentUser.phone || ''),
  })
  const [editingCard, setEditingCard] = useState(!currentUser.hasCard)
  const [cardOtpOpen, setCardOtpOpen] = useState(false)

  const myWalletTx = walletTx.filter((entry) => entry.userId === currentUser.id)
  const myTransactions = transactions.filter((entry) => entry.userId === currentUser.id)
  const myWithdrawals = withdrawals.filter((entry) => entry.userId === currentUser.id)

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

  function prepareCardLink(event) {
    event.preventDefault()
    const digits = cardForm.cardNumber.replace(/\D/g, '')
    if (digits.length !== 16) {
      toast.error("Karta raqami 16 xonali bo'lishi kerak")
      return
    }
    if (cardForm.cardHolder.trim().length < 3) {
      toast.error('Karta egasining ismini kiriting')
      return
    }
    if (!/^998\d{9}$/.test(cardForm.phone.replace(/\D/g, ''))) {
      toast.error("Kartaga ulangan telefon raqamini to'g'ri kiriting")
      return
    }
    setCardOtpOpen(true)
  }

  async function confirmCardLink(code, otpId) {
    const digits = cardForm.cardNumber.replace(/\D/g, '')
    const result = await linkCard({
      cardNumber: digits,
      cardHolder: cardForm.cardHolder.trim(),
      phone: cardForm.phone,
      otpId,
      code,
    })
    if (result.ok) {
      toast.success('Karta SMS kod bilan tasdiqlandi va ulandi')
      setEditingCard(false)
      setCardForm({
        cardNumber: '',
        cardHolder: currentUser.name,
        phone: normalizePhoneInput(currentUser.phone || ''),
      })
    } else {
      toast.error(result.error)
    }
    return result
  }

  function prepareWithdraw(event) {
    event.preventDefault()
    const amount = Math.floor(Number(withdrawForm.amount) || 0)
    if (amount < 1) {
      toast.error("Kamida 1 so'm yechish mumkin")
      return
    }
    if (amount > 100000000) {
      toast.error("Bitta so'rovda maksimal 100 000 000 so'm. Kattaroq summani bo'lib yuboring.")
      return
    }
    if (amount > (currentUser.wallet || 0)) {
      toast.error("Hamyon balansida yetarli mablag' yo'q")
      return
    }
    if (!currentUser.hasCard) {
      toast.error('Avval kartani ulang va SMS bilan tasdiqlang')
      setEditingCard(true)
      return
    }
    const commission = Math.round((amount * WITHDRAWAL_COMMISSION_RATE) / 100)
    setWithdrawPreview({ amount, commission, netAmount: amount - commission })
    setWithdrawOtpOpen(true)
  }

  async function confirmWithdraw(code, otpId) {
    if (!withdrawPreview) return { ok: false, error: 'Summani qayta kiriting' }
    setWithdrawing(true)
    const result = await requestWithdrawal({ amount: withdrawPreview.amount, otpId, code })
    setWithdrawing(false)
    if (result.ok) {
      toast.success(
        `Tasdiqlandi. ${formatSom(result.netAmount)} kartangizga o'tkaziladi (komissiya ${formatSom(result.commission)}).`,
      )
      setWithdrawForm({ amount: '' })
      setWithdrawPreview(null)
    } else {
      toast.error(result.error)
    }
    return result
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
                    🌱 Bepul platforma
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
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                        <CreditCard size={16} className="text-emerald-600" /> To'lov kartasi
                      </h2>
                      <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-stone-500">
                        Karta bir marta SMS kod bilan tasdiqlanadi va pul yechish shu kartaga tushadi.
                        O'zgartirish uchun yangi karta va telefon raqamini qayta tasdiqlang.
                      </p>
                    </div>
                    {currentUser.hasCard && !editingCard && (
                      <button
                        type="button"
                        onClick={() => setEditingCard(true)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Pencil size={13} /> O'zgartirish
                      </button>
                    )}
                  </div>

                  {currentUser.hasCard && !editingCard ? (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black tracking-[0.18em] text-emerald-950">
                            {currentUser.cardMasked || '•••• •••• •••• ••••'}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold text-stone-600">{currentUser.cardHolder}</p>
                          <p className="text-[10px] text-stone-500">
                            Telefon: {currentUser.cardPhoneMasked || '—'}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          <BadgeCheck size={11} /> SMS bilan tasdiqlangan
                        </span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={prepareCardLink} className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">Karta raqami *</label>
                        <div className="relative">
                          <CreditCard
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                          />
                          <input
                            inputMode="numeric"
                            value={cardForm.cardNumber}
                            onChange={(event) =>
                              setCardForm({ ...cardForm, cardNumber: formatCardInput(event.target.value) })
                            }
                            className="input pl-10"
                            placeholder="8600 1234 5678 9012"
                            maxLength={19}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Karta egasi *</label>
                        <input
                          value={cardForm.cardHolder}
                          onChange={(event) => setCardForm({ ...cardForm, cardHolder: event.target.value })}
                          className="input"
                          placeholder="F.I.Sh."
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label">Kartaga ulangan telefon raqami *</label>
                        <div className="relative">
                          <Phone
                            size={15}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                          />
                          <input
                            inputMode="tel"
                            value={cardForm.phone}
                            onChange={(event) =>
                              setCardForm({ ...cardForm, phone: normalizePhoneInput(event.target.value) })
                            }
                            className="input pl-10"
                            placeholder="+998 90 123 45 67"
                            required
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-stone-400">
                          Tasdiqlash kodi shu raqamga yuboriladi. Kod kelmasa, operatoringizni tekshiring.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        <button type="submit" className="btn btn-primary">
                          <ShieldCheck size={15} /> SMS kod olish va kartani ulash
                        </button>
                        {currentUser.hasCard && (
                          <button type="button" onClick={() => setEditingCard(false)} className="btn btn-secondary">
                            Bekor qilish
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>

                <div className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-1.5 text-sm font-black text-emerald-950">
                        <ArrowDownToLine size={16} className="text-emerald-600" /> Pul yechish
                      </h2>
                      <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-stone-500">
                        1 so'mdan boshlab yechish mumkin. Bitta so'rovda maksimal 100 000 000 so'm.
                        So'rov SMS kod bilan tasdiqlanadi va avtomatik qabul qilinadi.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      Mavjud: {formatSom(currentUser.wallet || 0)}
                    </span>
                  </div>

                  {!currentUser.hasCard && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] font-semibold text-amber-800">
                      Pul yechish uchun avval yuqorida kartani ulang va SMS kod bilan tasdiqlang.
                    </div>
                  )}

                  <form onSubmit={prepareWithdraw} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Summa (so'm) *</label>
                      <input
                        type="number"
                        min={1}
                        max={100000000}
                        value={withdrawForm.amount}
                        onChange={(event) => setWithdrawForm({ amount: event.target.value })}
                        className="input"
                        placeholder="100000"
                        required
                      />
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {[100000, 500000, 1000000].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setWithdrawForm({ amount: String(value) })}
                            className="rounded-lg bg-stone-100 px-2 py-1 text-[9px] font-bold text-stone-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {formatSom(value)}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setWithdrawForm({
                              amount: String(Math.min(currentUser.wallet || 0, 100000000)),
                            })
                          }
                          className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Hammasi
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl bg-stone-50 p-3">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Hisob-kitob</p>
                      <div className="mt-1.5 space-y-1 text-[11px]">
                        <div className="flex justify-between gap-2">
                          <span className="text-stone-500">Yechish summasi</span>
                          <span className="font-bold text-emerald-950">
                            {formatSom(Math.floor(Number(withdrawForm.amount) || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-stone-500">Komissiya (5%)</span>
                          <span className="font-bold text-rose-600">
                            −{formatSom(Math.round((Math.floor(Number(withdrawForm.amount) || 0) * 5) / 100))}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2 border-t border-stone-200 pt-1">
                          <span className="font-bold text-emerald-950">Kartaga tushadi</span>
                          <span className="font-black text-emerald-700">
                            {formatSom(
                              Math.floor(Number(withdrawForm.amount) || 0) -
                                Math.round((Math.floor(Number(withdrawForm.amount) || 0) * 5) / 100),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={withdrawing || !currentUser.hasCard}
                      >
                        <ShieldCheck size={15} />
                        {withdrawing ? 'Tasdiqlanmoqda...' : 'SMS kod bilan tasdiqlash'}
                      </button>
                      <p className="mt-2 text-[10px] leading-relaxed text-stone-400">
                        Tasdiqlash kodi kartaga ulangan telefon raqamiga yuboriladi. 5% komissiya
                        platforma hamyoniga o'tadi, qolgan summa kartangizga o'tkaziladi.
                      </p>
                    </div>
                  </form>

                  {myWithdrawals.length > 0 && (
                    <div className="mt-4 border-t border-stone-100 pt-4">
                      <h3 className="text-xs font-black text-emerald-950">Yechish tarixi</h3>
                      <div className="mt-2 space-y-1.5">
                        {myWithdrawals.map((entry) => {
                          const status = WITHDRAWAL_STATUS[entry.status] || WITHDRAWAL_STATUS.approved
                          return (
                            <div
                              key={entry.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 p-2.5"
                            >
                              <div>
                                <p className="text-[11px] font-black text-emerald-950">
                                  {formatSom(entry.amount)}
                                  {entry.netAmount != null && (
                                    <span className="ml-1 text-[10px] font-semibold text-stone-400">
                                      → {formatSom(entry.netAmount)} kartaga
                                    </span>
                                  )}
                                </p>
                                <p className="text-[9px] text-stone-400">
                                  •••• {String(entry.cardNumber).slice(-4)} · komissiya{' '}
                                  {formatSom(entry.commission || 0)} · {formatDateTime(entry.createdAt)}
                                </p>
                                {entry.adminNote && (
                                  <p className="mt-0.5 text-[9px] font-semibold text-rose-500">{entry.adminNote}</p>
                                )}
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${status.className}`}>
                                {entry.autoApproved ? 'Avtomatik tasdiqlangan' : status.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
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
                    <div className="mt-3 rounded-xl bg-lime-50 p-3 text-[11px] text-lime-900">
                      Administrator roli faqat admin panel orqali boshqa foydalanuvchilarga beriladi.
                    </div>
                  ) : (
                    <>
                      <div className="mt-3">
                        <label className="label" htmlFor="profile-role">Rol</label>
                        <select
                          id="profile-role"
                          value={role}
                          onChange={(event) => setRole(event.target.value)}
                          className="input"
                        >
                          {LEGACY_ROLES.includes(currentUser.role) && (
                            <option value={currentUser.role}>
                              {ROLES[currentUser.role].icon} {ROLES[currentUser.role].label} — joriy
                            </option>
                          )}
                          {ROLE_GROUPS.map((group) => (
                            <optgroup key={group.id} label={group.label}>
                              {group.roles.map((roleId) => (
                                <option key={roleId} value={roleId}>
                                  {ROLES[roleId].icon} {ROLES[roleId].label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <p className="mt-1.5 text-[10px] leading-relaxed text-stone-500">
                          {role ? ROLES[role].description : "Faoliyatingizga mos rolni tanlang."}
                        </p>
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
                    <Sparkles size={16} className="text-emerald-600" /> Bepul platforma
                  </h2>
                  <div className="mt-3 flex flex-col justify-between gap-3 rounded-xl bg-gradient-to-br from-emerald-50 to-lime-50 p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Sizning imkoniyatingiz</p>
                      <p className="mt-0.5 text-lg font-black text-emerald-950">🌱 Obuna yo'q</p>
                      <p className="mt-1 text-[10px] text-stone-500">
                        Cheksiz e'lon · 5% komissiya · kuniga 50 ta AI savol. Oylik yoki yillik to'lov yo'q.
                      </p>
                    </div>
                    <Link to="/narxlar" className="btn btn-secondary btn-sm shrink-0">
                      Batafsil
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

      <OtpModal
        open={cardOtpOpen}
        onClose={() => setCardOtpOpen(false)}
        purpose="card_link"
        phone={cardForm.phone}
        title="Kartani SMS bilan tasdiqlash"
        subtitle="Kartaga ulangan telefon raqamiga 6 xonali kod yuborildi."
        confirmLabel="Kartani ulash"
        onConfirm={confirmCardLink}
      />

      <OtpModal
        open={withdrawOtpOpen}
        onClose={() => {
          setWithdrawOtpOpen(false)
          setWithdrawPreview(null)
        }}
        purpose="withdrawal"
        title="Pul yechishni tasdiqlash"
        subtitle={
          withdrawPreview
            ? `${formatSom(withdrawPreview.netAmount)} kartaga o'tkaziladi. Komissiya ${formatSom(withdrawPreview.commission)}.`
            : 'Kartaga ulangan telefon raqamiga kod yuboriladi.'
        }
        confirmLabel="Yechishni tasdiqlash"
        onConfirm={confirmWithdraw}
      />
    </div>
  )
}
