import { Star } from 'lucide-react'

export default function Stars({ rating = 0, count, size = 13, showValue = true }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(Number(rating) || 0)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-stone-200 text-stone-200'
            }
          />
        ))}
      </span>
      {showValue && (
        <span className="text-[11px] font-semibold text-stone-500">
          {(Number(rating) || 0).toFixed(1)}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </span>
  )
}
