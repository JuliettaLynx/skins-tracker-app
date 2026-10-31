import { useMemo } from 'react'
import { TIER_META, TIERS } from '../recommendations.js'
import CollapsibleChips from './CollapsibleChips.jsx'

const TIER_ORDER = {
  [TIERS.upgradeNow]: 0,
  [TIERS.upgradeGroup]: 1,
  [TIERS.newChampion]: 2,
  [TIERS.advance]: 3,
  [TIERS.disenchant]: 4,
}

const round2 = (n) => Math.round(n * 100) / 100

export default function RecommSummary({ recommendations }) {
  const { list, base } = recommendations

  const sorted = useMemo(() => {
    return [...list].sort(
      (a, b) =>
        TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
        b.gain - a.gain ||
        a.skin.name.localeCompare(b.skin.name, 'ru')
    )
  }, [list])

  const totals = useMemo(() => {
    const byTier = {
      [TIERS.upgradeNow]: 0,
      [TIERS.upgradeGroup]: 0,
      [TIERS.newChampion]: 0, 
      [TIERS.advance]: 0,
      [TIERS.disenchant]: 0,
    }
    let gain = 0
    let shardCount = 0
    for (const item of list) {
      byTier[item.tier] += 1
      if (item.gain > 0) gain += item.gain
      if (base?.shardsSet.has(item.skin.id)) shardCount += 1
    }
    return { count: list.length, gain: round2(gain), byTier, shardCount }
  }, [list, base])

  if (!list || list.length === 0) return null

  return (
    <section className="flex flex-col gap-2.5 p-3 bg-panel border border-border rounded-xl">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-h m-0">
          Оптимальные покупки осколков
        </h2>
        <span className="text-[11px] text-muted tabular-nums">
          {totals.count} шт · суммарно +{totals.gain.toFixed(2)} к счёту
          {totals.shardCount > 0 ? ` · ${totals.shardCount} уже в осколках` : ''}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
        {Object.entries(TIER_META).map(([tier, meta]) => (
          <span
            key={tier}
            className="inline-flex items-center gap-1 px-1.5 h-[22px] rounded-full border bg-panel-soft"
            style={{ borderColor: meta.color }}
            title={meta.description}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
            <span className="text-muted">{meta.label}</span>
            <b className="tabular-nums text-text-h">{totals.byTier[tier] ?? 0}</b>
          </span>
        ))}
      </div>

      <CollapsibleChips
        items={sorted}
        renderItem={(item) => {
          const meta = TIER_META[item.tier]
          const inShards = base?.shardsSet.has(item.skin.id)
          return (
            <li
              key={item.id}
              className="flex items-center gap-1 h-7 pl-1.5 pr-2 border rounded-full bg-[#0f141d] text-xs"
              style={{ borderColor: meta.color }}
              title={`${meta.label}: ${meta.description} · выгода ${item.gain.toFixed(2)}`}
            >
              <span className="grid place-items-center w-4 h-4 rounded-full text-[10px] font-semibold flex-none" style={{ background: meta.color, color: '#0d1119' }}>
                {meta.short}
              </span>
              <span className="max-w-[250px] truncate text-text-h">
                {item.skin.champion} — {item.skin.name}
              </span>
              {inShards && <span className="text-[10px] text-[#3fa7ff]">◆</span>}
              <span className="text-[10px] tabular-nums text-muted">
                +{item.gain.toFixed(2)}
              </span>
            </li>
          )
        }}
      />
    </section>
  )
}