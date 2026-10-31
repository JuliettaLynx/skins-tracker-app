import { useMemo } from 'react'
import { PARAMETER_META, RANK_COLORS, computeParameters } from '../lib/parameters.js'
import { LIST_COLORS } from '../lib/rarities.js'

const fmt2 = (n) => n.toFixed(2)

export default function ParameterCards({
  skins,
  chromaCatalogue,
  champions,
  collection,
  shards,
  chromas,
}) {
  const { collection: c, withShards: s } = useMemo(() => {
    const paramsData = { skins, chromas: chromaCatalogue, champions }
    const collectionSet = new Set(collection)
    const shardSet = new Set(shards)
    const chromaSet = new Set(chromas)
    const allSkinIds = new Set([...collectionSet, ...shardSet])

    return {
      collection: computeParameters({ skinIds: collectionSet, chromaIds: chromaSet }, paramsData),
      withShards: computeParameters({ skinIds: allSkinIds, chromaIds: chromaSet }, paramsData),
    }
  }, [skins, chromaCatalogue, champions, collection, shards, chromas])

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 flex-wrap text-[13px]">
        <span className="text-muted">Ранг коллекции</span>
        <span className="font-semibold" style={{ color: RANK_COLORS[c.rank] ?? '#C89B3C' }}>
          {c.rank}
        </span>
        <span className="tabular-nums text-muted">{c.score.toFixed(2)} / 100</span>
        {s.score > c.score && (
          <>
            <span className="text-muted">·</span>
            <span className="text-muted">с осколками</span>
            <span className="font-semibold" style={{ color: RANK_COLORS[s.rank] ?? '#3FA7FF' }}>
              {s.rank}
            </span>
            <span className="tabular-nums" style={{ color: LIST_COLORS.shards }}>
              {s.score.toFixed(2)} / 100
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {PARAMETER_META.map((meta) => {
          const cv = c.breakdown[meta.key]
          const sv = s.breakdown[meta.key]
          const pctC = Math.min(100, (cv / meta.max) * 100)
          const pctS = Math.min(100, (sv / meta.max) * 100)
          const delta = sv - cv

          return (
            <div
              key={meta.key}
              className="flex flex-col gap-1.5 p-2.5 bg-panel border border-border rounded-xl min-w-0"
              title={meta.description}
            >
              <div className="flex items-baseline justify-between gap-1 min-w-0">
                <span className="text-[11.5px] font-semibold text-text-h truncate">
                  {meta.title}
                </span>
                <span className="text-[10px] text-muted tabular-nums flex-none">{meta.max}</span>
              </div>

              <div className="flex items-baseline justify-between gap-1 tabular-nums">
                <span
                  className="text-[18px] font-semibold leading-none"
                  style={{ color: LIST_COLORS.collection }}
                >
                  {fmt2(cv)}
                </span>
                <span
                  className="text-[13px] leading-none"
                  style={{ color: LIST_COLORS.shards }}
                >
                  {fmt2(sv)}
                </span>
              </div>

              <div className="relative h-1.5 bg-[#1b2230] rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${pctS}%`,
                    background: LIST_COLORS.shards,
                    opacity: 0.4,
                  }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${pctC}%`, background: LIST_COLORS.collection }}
                />
              </div>

              <div className="text-[10px] text-muted tabular-nums leading-tight">
                {delta > 0 ? `+${fmt2(delta)} с осколками` : `${fmt2(delta)} с осколками`}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}