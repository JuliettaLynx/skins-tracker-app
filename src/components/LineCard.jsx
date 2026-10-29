import { LIST_COLORS } from '../rarities.js'

// Progress bar of one skin line: gold part = collection, blue part = shards.
export default function LineCard({ line }) {
  const owned = line.collection + line.shards
  const percent = line.total ? (owned / line.total) * 100 : 0
  const collectionWidth = line.total ? (line.collection / line.total) * 100 : 0
  const shardsWidth = line.total ? (line.shards / line.total) * 100 : 0

  return (
    <li className="line-card">
      <div className="line-card__head">
        <span className="line-card__name">{line.name}</span>
        <span className="line-card__count">
          {owned}/{line.total}
        </span>
      </div>
      <div
        className="line-card__bar"
        role="img"
        aria-label={`Коллекция ${line.collection}, осколки ${line.shards}, всего ${line.total}`}
      >
        <i style={{ width: `${collectionWidth}%`, background: LIST_COLORS.collection }} />
        <i style={{ width: `${shardsWidth}%`, background: LIST_COLORS.shards }} />
      </div>
      <div className="line-card__foot">
        <span>{percent.toFixed(0)}%</span>
        <span className="line-card__legend">
          <em style={{ color: LIST_COLORS.collection }}>кол {line.collection}</em>
          <em style={{ color: LIST_COLORS.shards }}>оск {line.shards}</em>
        </span>
      </div>
    </li>
  )
}
