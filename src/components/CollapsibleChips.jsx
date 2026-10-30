import { useState } from 'react'

export default function CollapsibleChips({ items, renderItem, limit = 12 }) {
  const [expanded, setExpanded] = useState(false)

  if (!items || items.length === 0) return null

  const visible = expanded ? items : items.slice(0, limit)

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-1.5">
        {visible.map(renderItem)}
      </ul>
      {items.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-[11.5px] text-accent hover:underline cursor-pointer bg-transparent border-0 p-0"
        >
          {expanded ? 'Свернуть' : `Показать все (${items.length})`}
        </button>
      )}
    </div>
  )
}