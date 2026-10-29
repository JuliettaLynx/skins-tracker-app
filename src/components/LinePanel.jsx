import { useMemo, useState } from 'react'
import LineCard from './LineCard.jsx'

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
  total: (a, b) => b.total - a.total || a.name.localeCompare(b.name, 'ru'),
  progress: (a, b) => {
    const left = (a.collection + a.shards) / (a.total || 1)
    const right = (b.collection + b.shards) / (b.total || 1)
    return right - left || b.total - a.total || a.name.localeCompare(b.name, 'ru')
  },
}

// Right sidebar with a card per skin line.
export default function LinePanel({ lines }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return lines
      .filter((line) => !needle || line.name.toLowerCase().includes(needle))
      .sort(SORTS[sort])
  }, [lines, query, sort])

  return (
    <section className="line-panel">
      <header className="line-panel__head">
        <h2>Линейки</h2>
        <span className="line-panel__total">{visible.length}</span>
      </header>
      <div className="line-panel__controls">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск линейки"
          aria-label="Поиск линейки"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Сортировка линеек"
        >
          <option value="name">по названию</option>
          <option value="total">по числу скинов</option>
          <option value="progress">по прогрессу</option>
        </select>
      </div>
      <ul className="line-panel__list">
        {visible.map((line) => (
          <LineCard key={line.name} line={line} />
        ))}
        {visible.length === 0 && <li className="line-panel__empty">Ничего не найдено</li>}
      </ul>
    </section>
  )
}
