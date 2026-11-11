import { Link } from 'react-router-dom'

export default function EmptyState({ icon = '🌱', title, description, action, actionTo }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-black text-emerald-950">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-stone-500">{description}</p>}
      {action && actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-5">
          {action}
        </Link>
      )}
    </div>
  )
}
