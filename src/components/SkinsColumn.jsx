import { useState } from 'react'
import { LIST } from '../skins.js'

const hoverByList = {
  [LIST.collection]: 'border-[#c89b3c] bg-[rgba(200,155,60,0.1)]',
  [LIST.shards]: 'border-[#3fa7ff] bg-[rgba(63,167,255,0.1)]',
  [LIST.rest]: 'border-accent bg-[rgba(200,155,216,0.08)]',
}

export default function SkinsColumn({ list, title, items, onMove, renderItem }) {
  const [hovered, setHovered] = useState(false)

  const handleDrop = (event) => {
    event.preventDefault()
    setHovered(false)
    const uuid = event.dataTransfer.getData('text/plain')
    if (uuid) onMove(uuid, list)
  }

  return (
    <div
      className={`min-h-[104px] p-2 rounded-[10px] border border-dashed transition-colors ${
        hovered ? hoverByList[list] : 'bg-panel-soft border-[#2b3444]'
      }`}
      onDragOver={(event) => {
        event.preventDefault()
        setHovered(true)
      }}
      onDragLeave={() => setHovered(false)}
      onDrop={handleDrop}
    >
      <header className="flex justify-between items-center mb-1.5 px-1 text-[11px] uppercase tracking-[0.4px] text-muted">
        <span className="truncate">{title}</span>
        <b className="text-text-h text-xs">{items.length}</b>
      </header>
      {items.length === 0 ? (
        <p className="text-[#566076] text-xs py-2 px-1 leading-snug">
          {list === LIST.rest ? 'Пусто' : 'Перетащи сюда или ★ / ◆'}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">{items.map(renderItem)}</ul>
      )}
    </div>
  )
}