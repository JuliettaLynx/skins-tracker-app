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

const fieldCls =
  'px-2 py-[6px] rounded-lg border border-border bg-[#0f141d] text-text-h text-[13px]'

// Right sidebar with a card per skin line.
export default function LinePanel({ lines }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('progress')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return lines
      .filter((line) => !needle || line.name.toLowerCase().includes(needle))
      .sort(SORTS[sort])
  }, [lines, query, sort])

  return (
    <section className="flex flex-col gap-2.5 w-full p-3 bg-panel border border-border rounded-xl min-h-0">
      <header className="flex justify-between items-baseline">
        <h2 className="text-base font-semibold text-text-h">Линейки</h2>
        <span className="text-xs text-muted">{visible.length}</span>
      </header>
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск линейки"
          aria-label="Поиск линейки"
          className={`flex-1 min-w-0 ${fieldCls}`}
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Сортировка линеек"
          className={fieldCls}
        >
          <option value="progress">по % заполнения</option>
          <option value="name">по названию</option>
          <option value="total">по числу скинов</option>
        </select>
      </div>
      <ul className="grid gap-2 overflow-y-auto min-h-0 max-h-[calc(100svh-210px)] max-[1100px]:max-h-[420px] pr-1">
        {visible.map((line) => (
          <LineCard key={line.name} line={line} />
        ))}
        {visible.length === 0 && (
          <li className="text-muted text-[13px] py-3 text-center">Ничего не найдено</li>
        )}
      </ul>
    </section>
  )
}