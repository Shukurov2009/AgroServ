import { useEffect, useRef, useState } from 'react'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import Modal from './Modal'
import { useStore } from '../context/StoreContext'

export default function OtpModal({
  open,
  onClose,
  purpose,
  phone = '',
  title = 'SMS kod bilan tasdiqlash',
  subtitle = '',
  confirmLabel = 'Tasdiqlash',
  onConfirm,
}) {
  const { sendOtp } = useStore()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [otpId, setOtpId] = useState('')
  const [testCode, setTestCode] = useState('')
  const [phoneLast4, setPhoneLast4] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [expiresIn, setExpiresIn] = useState(0)
  const inputs = useRef([])
  const sentForOpen = useRef(false)

  async function sendCode() {
    setSending(true)
    setError('')
    const result = await sendOtp(purpose, phone)
    setSending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setOtpId(result.otpId || '')
    setTestCode(result.testCode || '')
    setPhoneLast4(result.phoneLast4 || '')
    setCooldown(60)
    setExpiresIn(300)
    setDigits(['', '', '', '', '', ''])
    window.setTimeout(() => inputs.current[0]?.focus(), 80)
  }

  useEffect(() => {
    if (!open) {
      sentForOpen.current = false
      return
    }
    if (sentForOpen.current) return
    sentForOpen.current = true
    setDigits(['', '', '', '', '', ''])
    setOtpId('')
    setTestCode('')
    setError('')
    sendCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1))
      setExpiresIn((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [open])

  function setDigit(index, value) {
    const clean = String(value || '').replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    if (clean && index < 5) inputs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(event) {
    const text = String(event.clipboardData?.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, 6)
    if (!text) return
    event.preventDefault()
    const next = ['', '', '', '', '', '']
    text.split('').forEach((char, index) => {
      next[index] = char
    })
    setDigits(next)
    inputs.current[Math.min(text.length, 5)]?.focus()
  }

  function fillTestCode() {
    if (!testCode) return
    setDigits(testCode.split('').slice(0, 6))
    setError('')
  }

  async function confirm() {
    const code = digits.join('')
    if (code.length !== 6) {
      setError('6 xonali kodni to‘liq kiriting')
      return
    }
    if (!otpId) {
      setError('Avval yangi kod oling')
      return
    }
    setVerifying(true)
    setError('')
    const result = await onConfirm(code, otpId)
    setVerifying(false)
    if (!result?.ok) {
      setError(result?.error || 'Kod tasdiqlanmadi')
      return
    }
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={
        subtitle ||
        `Kod ${phoneLast4 ? `•••• ${phoneLast4}` : 'kartaga ulangan telefon'} raqamiga yuboriladi. Kod 5 daqiqa amal qiladi.`
      }
      size="sm"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={sendCode}
            disabled={sending || cooldown > 0}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={13} className={sending ? 'animate-spin' : ''} />
            {cooldown > 0 ? `Qayta yuborish (${cooldown}s)` : 'Kodni qayta yuborish'}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={verifying || digits.join('').length !== 6}
            className="btn btn-primary btn-sm"
          >
            <ShieldCheck size={14} />
            {verifying ? 'Tekshirilmoqda...' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-[11px] leading-relaxed text-emerald-800">
          Telefon raqamiga 6 xonali tasdiqlash kodi yuborildi. Kodni quyidagi kataklarga kiriting.
        </div>

        {testCode && (
          <button
            type="button"
            onClick={fillTestCode}
            className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-[11px] text-amber-800"
          >
            <span className="font-black">Test rejimi:</span> SMS provayderi hali sozlanmagan. Kod:{' '}
            <span className="font-mono text-sm font-black tracking-[0.2em]">{testCode}</span>
            <span className="mt-0.5 block text-[10px] text-amber-600">Kodni avtomatik to‘ldirish uchun bosing.</span>
          </button>
        )}

        <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element
              }}
              value={digit}
              onChange={(event) => setDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              aria-label={`Kod raqami ${index + 1}`}
              className="h-12 w-10 rounded-xl border border-stone-200 bg-white text-center text-lg font-black text-emerald-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:h-14 sm:w-12"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-stone-400">
          <span>{expiresIn > 0 ? `Kod amal qilish muddati: ${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, '0')}` : 'Kod muddati tugadi — yangi kod oling'}</span>
          <span>{phoneLast4 ? `•••• ${phoneLast4}` : ''}</span>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] font-semibold text-rose-600">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
