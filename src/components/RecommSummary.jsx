import { useMemo } from 'react'
import {
  TIER_META,
  TIERS,
  splitRecommItems,
} from '../recommendations.js'
import RecommGroups from './RecommGroups.jsx'

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

  const items = useMemo(() => {
    if (!list) return []
    return [...list]
      .map((item) => ({
        ...item,
        inShards: base?.shardsSet.has(item.skin.id) ?? false,
      }))
      .sort(
        (a, b) =>
          TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
          b.gain - a.gain ||
          a.skin.name.localeCompare(b.skin.name, 'ru')
      )
  }, [list, base])

  const split = useMemo(() => splitRecommItems(items), [items])

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
    const itemById = new Map(items.map((i) => [i.id, i]))

    // Все тиры, кроме «Набор», считаем по уникальным items
    for (const item of items) {
      if (item.tier === TIERS.upgradeGroup) continue
      byTier[item.tier] += 1
      if (item.gain > 0) gain += item.gain
      if (item.inShards) shardCount += 1
    }

    // «Набор» — по уникальным скинам среди блоков (пересечения
    // между наборами не считаем дважды)
    const blockIds = new Set()
    for (const block of split.blocks) {
      for (const m of block.members) blockIds.add(m.id)
    }
    for (const id of blockIds) {
      const item = itemById.get(id)
      if (!item) continue
      byTier[TIERS.upgradeGroup] += 1
      if (item.gain > 0) gain += item.gain
      if (item.inShards) shardCount += 1
    }

    return { count: items.length, gain: round2(gain), byTier, shardCount }
  }, [items, split.blocks])

  if (!items.length) return null

  const renderItem = (item) => {
    const meta = TIER_META[item.tier]
    return (
      <li
        key={item.id}
        className="flex items-center gap-1 h-7 pl-1.5 pr-2 border rounded-full bg-[#0f141d] text-xs"
        style={{ borderColor: meta.color }}
        title={`${meta.label}: ${meta.description} · выгода ${item.gain.toFixed(2)}`}
      >
        <span
          className="grid place-items-center w-4 h-4 rounded-full text-[10px] font-semibold flex-none"
          style={{ background: meta.color, color: '#0d1119' }}
        >
          {meta.short}
        </span>
        <span className="max-w-[250px] truncate text-text-h">
          {item.skin.champion} — {item.skin.name}
        </span>
        {item.inShards && (
          <span className="text-[10px] text-[#3fa7ff]" title="Осколок уже есть">
            ◆
          </span>
        )}
        <span className="text-[10px] tabular-nums text-muted">
          +{item.gain.toFixed(2)}
        </span>
      </li>
    )
  }

  return (
    <section className="flex flex-col gap-2.5 p-3 bg-panel border border-border rounded-xl">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-h m-0">
          Оптимальные покупки осколков
        </h2>
        <span className="text-[11px] text-muted tabular-nums">
          {items.length} шт
          {split.blocks.length > 0 ? ` · ${split.blocks.length} наборов` : ''}
          {' · '}+{totals.gain.toFixed(2)} к счёту
          {totals.shardCount > 0 ? ` · ${totals.shardCount} уже в осколках` : ''}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
        {Object.entries(TIER_META).map(([tier, meta]) => {
          const count = totals.byTier[tier]
          if (!count) return null
          const blocksSuffix =
            tier === TIERS.upgradeGroup && split.blocks.length > 0
              ? ` · ${split.blocks.length} наборов`
              : ''
          return (
            <span
              key={tier}
              className="inline-flex items-center gap-1 px-1.5 h-[22px] rounded-full border bg-panel-soft"
              style={{ borderColor: meta.color }}
              title={`${meta.description}${blocksSuffix}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
              <span className="text-muted">{meta.label}</span>
              <b className="tabular-nums text-text-h">{count}</b>
              {blocksSuffix && (
                <span className="text-[10px] text-muted/80">
                  {blocksSuffix.replace(' · ', ' ')}
                </span>
              )}
            </span>
          )
        })}
      </div>

      <RecommGroups split={split} renderItem={renderItem} individualLimit={12} />
    </section>
  )
}