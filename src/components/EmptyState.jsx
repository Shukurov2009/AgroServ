import { Link } from 'react-router-dom'

export default function EmptyState({ icon = '🌱', title, description, action, actionTo, onAction }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="icon-tile h-16 w-16 text-3xl">{icon}</div>
      <h3 className="mt-4 text-lg font-extrabold text-emerald-950">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-stone-500">{description}</p>}
      {action && actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-5">
          {action}
        </Link>
      )}
      {action && onAction && (
        <button type="button" onClick={onAction} className="btn btn-primary mt-5">
          {action}
        </button>
      )}
    </div>
  )
}
