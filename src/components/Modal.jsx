import { useEffect } from 'react'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    function handleKey(event) {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm"
      />
      <div
        className={`relative max-h-[92vh] w-full animate-fade-up overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${SIZES[size] || SIZES.md}`}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 border-b border-emerald-900/5 px-5 py-4 sm:px-6">
            <div>
              {title && <h2 className="text-lg font-black text-emerald-950">{title}</h2>}
              {subtitle && <p className="mt-1 text-xs text-stone-500">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 transition hover:bg-stone-200 hover:text-stone-700"
            >
              <X size={17} />
            </button>
          </div>
        )}
        <div className="max-h-[calc(92vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="border-t border-emerald-900/5 bg-stone-50/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
