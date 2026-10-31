import { LIST_COLORS } from '../lib/rarities.js'

export default function LineCard({ line }) {
  const owned = line.collection + line.shards
  const percent = line.total ? (owned / line.total) * 100 : 0
  const collectionWidth = line.total ? (line.collection / line.total) * 100 : 0
  const shardsWidth = line.total ? (line.shards / line.total) * 100 : 0

  return (
    <li className="px-2.5 py-2 border border-[#1e2534] rounded-[10px] bg-panel-soft">
      <div className="flex justify-between gap-2 text-[13px] text-text-h">
        <span className="truncate">{line.name}</span>
        <span className="flex-none tabular-nums text-muted">
          {owned}/{line.total}
        </span>
      </div>
      <div
        className="flex h-2.5 mt-1.5 mb-1 rounded-full overflow-hidden bg-[#1b2230]"
        role="img"
        aria-label={`Коллекция ${line.collection}, осколки ${line.shards}, всего ${line.total}`}
      >
        <i className="block h-full" style={{ width: `${collectionWidth}%`, background: LIST_COLORS.collection }} />
        <i className="block h-full" style={{ width: `${shardsWidth}%`, background: LIST_COLORS.shards }} />
      </div>
      <div className="flex justify-between text-[11px] text-muted">
        <span>{percent.toFixed(0)}%</span>
        <span className="flex gap-2">
          <em className="not-italic" style={{ color: LIST_COLORS.collection }}>кол {line.collection}</em>
          <em className="not-italic" style={{ color: LIST_COLORS.shards }}>оск {line.shards}</em>
        </span>
      </div>
    </li>
  )
}