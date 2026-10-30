import SkinCard from './SkinCard.jsx'
import SkinChip from './SkinChip.jsx'
import SkinsColumn from './SkinsColumn.jsx'
import { LIST, LIST_TITLES, skinKey } from '../skins.js'

const thCls =
  'sticky top-0 z-[3] bg-[#151b26] text-text-h text-[13px] font-semibold text-left px-3 py-2.5 border-b border-border'
const champThCls =
  'w-[150px] min-w-[150px] max-w-[150px] sticky left-0 top-0 z-[4] bg-[#151b26] text-text-h text-[13px] font-semibold text-left px-3 py-2.5 border-b border-border'
const champCellCls =
  'w-[150px] min-w-[150px] max-w-[150px] p-2 border-b border-[#1a2130] align-top text-left font-normal sticky left-0 bg-panel z-[2] text-text-h text-sm'
// Узкие ячейки: w-px → сжаться до контента, не тянуться.
const narrowCellCls = 'w-px p-2 border-b border-[#1a2130] align-top text-left font-normal'
// Широкая ячейка: без width → заберёт весь остаток ширины таблицы.
const wideCellCls = 'p-2 border-b border-[#1a2130] align-top text-left font-normal'

export default function ChampionTable({ rows, onMove }) {
  return (
    <table className="w-full border-separate border-spacing-0 bg-panel border border-border rounded-xl overflow-hidden">
      <thead>
        <tr>
          <th className={champThCls}>
            <span className="inline-block min-w-[22px] mr-1.5 text-muted text-[11px] tabular-nums">#</span>
            Чемпион
          </th>
          <th className={thCls}>{LIST_TITLES[LIST.collection]}</th>
          <th className={thCls}>{LIST_TITLES[LIST.shards]}</th>
          <th className={thCls}>{LIST_TITLES[LIST.rest]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
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
                  <SkinCard key={skinKey(skin)} skin={skin} list={LIST.collection} onMove={onMove} />
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
                  <SkinCard key={skinKey(skin)} skin={skin} list={LIST.shards} onMove={onMove} />
                )}
              />
            </td>
            <td className={wideCellCls}>
              <SkinsColumn
                list={LIST.rest}
                title={LIST_TITLES[LIST.rest]}
                items={row.rest}
                onMove={onMove}
                renderItem={(skin) => <SkinChip key={skinKey(skin)} skin={skin} onMove={onMove} />}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}