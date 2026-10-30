import { memo, useEffect, useMemo, useState } from 'react'
import ChromaCard from './ChromaCard.jsx'
import ChromaChip from './ChromaChip.jsx'
import { CHROMA_FILTER_LABELS } from '../skins.js'
import { rarityColor } from '../rarities.js'

const PAGE = 60

const CV = { contentVisibility: 'auto', containIntrinsicSize: 'auto 160px' }

const thCls =
  'sticky top-0 z-[3] bg-[#151b26] text-text-h text-[13px] font-semibold text-left px-3 py-2.5 border-b border-border'
const champThCls =
  'w-[150px] min-w-[150px] max-w-[150px] sticky left-0 top-0 z-[4] bg-[#151b26] text-text-h text-[13px] font-semibold text-left px-3 py-2.5 border-b border-border'
const champCellCls =
  'w-[150px] min-w-[150px] max-w-[150px] p-2 border-b border-[#1a2130] align-top text-left font-normal sticky left-0 bg-panel z-[2] text-text-h text-sm'
const narrowCellCls = 'w-px p-2 border-b border-[#1a2130] align-top text-left font-normal'
const wideCellCls = 'p-2 border-b border-[#1a2130] align-top text-left font-normal'
const fieldCls =
  'px-2 py-[6px] rounded-lg border border-border bg-[#0f141d] text-text-h text-[13px]'

const SORT_COMPARATORS = {
  champion: (a, b) =>
    a.champion.localeCompare(b.champion, 'ru') || a.skin.name.localeCompare(b.skin.name, 'ru'),
  skin: (a, b) => a.skin.name.localeCompare(b.skin.name, 'ru'),
  total: (a, b) => b.total - a.total || a.champion.localeCompare(b.champion, 'ru'),
}

function SortableTh({ children, sortKey, sort, onSort, className }) {
  const active = sort.key === sortKey
  const arrow = active ? (sort.dir === 'asc' ? '▲' : '▼') : ''
  return (
    <th className={className} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 p-0 border-0 bg-transparent cursor-pointer select-none font-semibold text-[13px] ${
          active ? 'text-accent' : 'text-text-h hover:text-accent'
        }`}
        title="Сортировать"
      >
        {children}
        <span className="text-[10px] leading-none">{arrow}</span>
      </button>
    </th>
  )
}

function SkinPreview({ skin }) {
  return (
    <div
      className="w-[110px] rounded-lg overflow-hidden border-2 bg-[#0d1119]"
      style={{ borderColor: rarityColor(skin.rarity) }}
      title={skin.name}
    >
      {skin.image ? (
        <img
          src={skin.image}
          alt={skin.name}
          className="block w-full aspect-[4/3] object-cover object-top bg-[#161d29]"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-[#161d29]" />
      )}
      <span className="block px-1 pt-0.5 pb-1 text-[10.5px] leading-tight text-text-h truncate">
        {skin.name}
      </span>
    </div>
  )
}

// Мемоизируем по (row, owned-ids этой строки). ownedSet пересоздаётся при
// каждом toggle, но если у этой конкретной строки ничего не поменялось —
// пропускаем перерисовку.
const ChromaRow = memo(
  function ChromaRow({ row, num, ownedSet, onToggle }) {
    const owned = useMemo(() => row.all.filter((c) => ownedSet.has(c.id)), [row, ownedSet])
    const rest = useMemo(() => row.all.filter((c) => !ownedSet.has(c.id)), [row, ownedSet])

    return (
      <tr>
        <th className={champCellCls} scope="row">
          <div style={CV}>
            <span className="inline-block min-w-[22px] mr-1.5 text-muted text-[11px] tabular-nums">
              {num}
            </span>
            {row.champion}
          </div>
        </th>
        <td className={narrowCellCls}>
          <div style={CV}>
            <SkinPreview skin={row.skin} />
          </div>
        </td>
        <td className={wideCellCls}>
          <div style={CV}>
            <ul className="flex flex-wrap gap-1.5 min-h-[78px]">
              {owned.map((c) => (
                <ChromaCard key={c.id} chroma={c} onToggle={onToggle} />
              ))}
              {owned.length === 0 && (
                <li className="text-xs text-[#566076] self-center">Нет имеющихся</li>
              )}
            </ul>
          </div>
        </td>
        <td className={wideCellCls}>
          <div style={CV}>
            <ul className="flex flex-wrap gap-1.5 min-h-[78px]">
              {rest.map((c) => (
                <ChromaChip key={c.id} chroma={c} onToggle={onToggle} />
              ))}
              {rest.length === 0 && (
                <li className="text-xs text-[#566076] mt-1">Все хромы собраны</li>
              )}
            </ul>
          </div>
        </td>
      </tr>
    )
  },
  (prev, next) => {
    if (prev.row !== next.row) return false
    if (prev.onToggle !== next.onToggle) return false
    if (prev.num !== next.num) return false

    // Сравниваем только id имеющихся хром этой строки
    const prevIds = []
    const nextIds = []
    for (const c of prev.row.all) if (prev.ownedSet.has(c.id)) prevIds.push(c.id)
    for (const c of next.row.all) if (next.ownedSet.has(c.id)) nextIds.push(c.id)
    if (prevIds.length !== nextIds.length) return false
    for (let i = 0; i < prevIds.length; i += 1) if (prevIds[i] !== nextIds[i]) return false
    return true
  }
)

export default function ChromaTable({ rows, ownedSet, onToggle, filter, onFilterChange }) {
  const [sort, setSort] = useState({ key: 'champion', dir: 'asc' })
  const [visible, setVisible] = useState(PAGE)

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      return { key, dir: key === 'champion' || key === 'skin' ? 'asc' : 'desc' }
    })
  }

  useEffect(() => {
    setVisible(PAGE)
  }, [rows, sort])

  const sortedRows = useMemo(() => {
    const compare = SORT_COMPARATORS[sort.key]
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compare(a, b))
  }, [rows, sort])

  const shown = useMemo(() => sortedRows.slice(0, visible), [sortedRows, visible])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <label htmlFor="chroma-filter" className="text-xs text-muted">
          Показывать:
        </label>
        <select
          id="chroma-filter"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className={fieldCls}
        >
          {Object.entries(CHROMA_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted ml-auto tabular-nums">
          {shown.length} / {sortedRows.length}
        </span>
      </div>

      <table className="w-full border-separate border-spacing-0 bg-panel border border-border rounded-xl overflow-hidden">
        <thead>
          <tr>
            <SortableTh className={champThCls} sortKey="champion" sort={sort} onSort={toggleSort}>
              <span className="inline-block min-w-[22px] mr-1.5 text-muted text-[11px] tabular-nums">
                #
              </span>
              Чемпион
            </SortableTh>
            <SortableTh className={thCls} sortKey="skin" sort={sort} onSort={toggleSort}>
              Скин
            </SortableTh>
            <SortableTh className={thCls} sortKey="total" sort={sort} onSort={toggleSort}>
              Имеются
            </SortableTh>
            <th className={thCls}>
              <span className="text-text-h text-[13px] font-semibold">Остальные</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((row, index) => (
            <ChromaRow
              key={row.skinId}
              row={row}
              num={index + 1}
              ownedSet={ownedSet}
              onToggle={onToggle}
            />
          ))}
          {shown.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 px-4 text-center text-muted text-[13px]">
                Ничего не найдено — попробуй другой фильтр
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {visible < sortedRows.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE)}
          className="self-center px-4 py-2 rounded-lg border border-border bg-panel text-text-h text-[13px] cursor-pointer hover:border-accent"
        >
          Показать ещё {Math.min(PAGE, sortedRows.length - visible)} из {sortedRows.length - visible}
        </button>
      )}
    </div>
  )
}