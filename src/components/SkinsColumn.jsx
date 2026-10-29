import { useState } from 'react'
import { LIST } from '../skins.js'

// Drop zone that renders one list of a champion row.
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
      className={`column column--${list}${hovered ? ' column--hover' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setHovered(true)
      }}
      onDragLeave={() => setHovered(false)}
      onDrop={handleDrop}
    >
      <header className="column__head">
        <span>{title}</span>
        <b>{items.length}</b>
      </header>
      {items.length === 0 ? (
        <p className="column__empty">
          {list === LIST.rest ? 'Пусто' : 'Перетащи скины сюда или нажми ★ / ◆'}
        </p>
      ) : (
        <ul className="column__list">{items.map(renderItem)}</ul>
      )}
    </div>
  )
}
