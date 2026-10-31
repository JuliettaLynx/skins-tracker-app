import { useMemo, useState } from 'react'
import { LIST, LIST_TITLES, skinKey } from '../lib/skins.js'
import SkinCard from './SkinCard.jsx'
import SkinChip from './SkinChip.jsx'
import SkinsColumn from './SkinsColumn.jsx'

const thCls =
  'sticky top-0 z-[3] bg-[#151b26] text-text-h text-[13px] font-semibold text-left px-3 py-2.5 border-b border-border'
const champThCls =
  'w-[150px] min-w-[150px] max-w-[150px] sticky left-0 top-0 z-[4] bg-[#151b26] text-text-h text-[13px] font-semibold text-left px-3 py-2.5 border-b border-border'
const champCellCls =
  'w-[150px] min-w-[150px] max-w-[150px] p-2 border-b border-[#1a2130] align-top text-left font-normal sticky left-0 bg-panel z-[2] text-text-h text-sm'
const narrowCellCls = 'w-px p-2 border-b border-[#1a2130] align-top text-left font-normal'
const wideCellCls = 'p-2 border-b border-[#1a2130] align-top text-left font-normal'

const SORT_COMPARATORS = {
  champion: (a, b) => a.champion.localeCompare(b.champion, 'ru'),
  collection: (a, b) =>
    a.collection.length - b.collection.length || a.champion.localeCompare(b.champion, 'ru'),
  shards: (a, b) =>
    a.shards.length - b.shards.length || a.champion.localeCompare(b.champion, 'ru'),
  rest: (a, b) =>
    a.rest.length - b.rest.length || a.champion.localeCompare(b.champion, 'ru'),
  wishlist: (a, b) =>
    (a.wishlist?.length ?? 0) - (b.wishlist?.length ?? 0) ||
    a.champion.localeCompare(b.champion, 'ru'),
}

function SortableTh({ children, sortKey, sort, onSort, className }) {
  const active = sort.key === sortKey
  const arrow = active ? (sort.dir === 'asc' ? '▲' : '▼') : ''

  return (
    <th
      className={className}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
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

export default function ChampionTable({
  rows,
  onMove,
  recommendationsById,
  onWishlist,
  isWished,
}) {
  const [sort, setSort] = useState({ key: 'champion', dir: 'asc' })

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      return { key, dir: key === 'champion' ? 'asc' : 'desc' }
    })
  }

  const sortedRows = useMemo(() => {
    const compare = SORT_COMPARATORS[sort.key]
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => factor * compare(a, b))
  }, [rows, sort])

  return (
    <table className="w-full border-separate border-spacing-0 bg-panel border border-border rounded-xl overflow-hidden">
      <thead>
        <tr>
          <SortableTh className={champThCls} sortKey="champion" sort={sort} onSort={toggleSort}>
            <span className="inline-block min-w-[22px] mr-1.5 text-muted text-[11px] tabular-nums">#</span>
            Чемпион
          </SortableTh>
          <SortableTh className={thCls} sortKey="collection" sort={sort} onSort={toggleSort}>
            {LIST_TITLES[LIST.collection]}
          </SortableTh>
          <SortableTh className={thCls} sortKey="shards" sort={sort} onSort={toggleSort}>
            {LIST_TITLES[LIST.shards]}
          </SortableTh>
          <SortableTh className={thCls} sortKey="rest" sort={sort} onSort={toggleSort}>
            {LIST_TITLES[LIST.rest]}
          </SortableTh>
          <SortableTh className={thCls} sortKey="wishlist" sort={sort} onSort={toggleSort}>
            Вишлист
          </SortableTh>
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => (
          <tr key={row.champion}>
            <th className={champCellCls} scope="row">
              <span className="inline-block min-w-[22px] mr-1.5 text-muted text-[11px] tabular-nums">{row.num}</span>
              {row.champion}
            </th>
            <td className={narrowCellCls}>
              <SkinsColumn
                compact
                list={LIST.collection}
                title={LIST_TITLES[LIST.collection]}
                items={row.collection}
                onMove={onMove}
                renderItem={(skin) => (
                  <SkinCard
                    key={skinKey(skin)}
                    skin={skin}
                    list={LIST.collection}
                    onMove={onMove}
                    onWishlist={onWishlist}
                    isWished={isWished?.(skinKey(skin))}
                  />
                )}
              />
            </td>
            <td className={narrowCellCls}>
              <SkinsColumn
                compact
                list={LIST.shards}
                title={LIST_TITLES[LIST.shards]}
                items={row.shards}
                onMove={onMove}
                renderItem={(skin) => (
                  <SkinCard
                    key={skinKey(skin)}
                    skin={skin}
                    list={LIST.shards}
                    onMove={onMove}
                    tier={recommendationsById?.get(skinKey(skin))?.tier}
                    onWishlist={onWishlist}
                    isWished={isWished?.(skinKey(skin))}
                  />
                )}
              />
            </td>
            <td className={wideCellCls}>
              <SkinsColumn
                list={LIST.rest}
                title={LIST_TITLES[LIST.rest]}
                items={row.rest}
                onMove={onMove}
                renderItem={(skin) => (
                  <SkinChip
                    key={skinKey(skin)}
                    skin={skin}
                    onMove={onMove}
                    onWishlist={onWishlist}
                    isWished={isWished?.(skinKey(skin))}
                  />
                )}
              />
            </td>
            <td className={wideCellCls}>
              <SkinsColumn
                list="wishlist"
                title="Вишлист"
                items={row.wishlist ?? []}
                onMove={onMove}
                renderItem={(skin) => (
                  <SkinChip
                    key={skinKey(skin)}
                    skin={skin}
                    onMove={onMove}
                    onWishlist={onWishlist}
                    isWished
                  />
                )}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}