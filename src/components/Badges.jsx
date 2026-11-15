import { ROLES } from '../lib/constants'

export function RoleBadge({ role, className = '' }) {
  const info = ROLES[role] || ROLES.user
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${info.badge} ${className}`}
    >
      <span>{info.icon}</span>
      {info.label}
    </span>
  )
}

export function StatusBadge({ label, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}
