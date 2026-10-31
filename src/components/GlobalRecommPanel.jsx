import { useMemo } from 'react'
import {
  TIER_META,
  TIERS,
  recommendFor,
  splitRecommItems,
  setsLabel,
} from '../recommendations.js'
import { getSkinPrice } from '../prices.js'
import RecommGroups from './RecommGroups.jsx'

const TIER_ORDER = {
  [TIERS.upgradeNow]: 0,
  [TIERS.upgradeGroup]: 1,
}

export default function GlobalRecommPanel({ skins, base, priceMap }) {
  const storeAvailableSet = useMemo(() => {
    if (!priceMap) return new Set()
    const set = new Set()
    for (const [id, price] of Object.entries(priceMap)) {
      if (price.available !== false) set.add(id)
    }
    return set
  }, [priceMap])

  const items = useMemo(() => {
    if (!base) return []
    const candidates = skins.filter((s) => !base.collectionSet.has(s.id)).map((s) => s.id)

    const firstPass = recommendFor(candidates, base, base.collectionSet, storeAvailableSet)

    const interestingIds = new Set()
    for (const [id, r] of firstPass) {
      if (r.tier === TIERS.disenchant) continue
      const price = getSkinPrice(r.skin, priceMap)
      const inShards = base.shardsSet.has(id)
      if (!price.available && !inShards) continue
      if (price.RP === 0 && !inShards) continue
      interestingIds.add(id)
    }

    const combinedExtraSet = new Set([...storeAvailableSet, ...interestingIds])
    const recs = recommendFor(candidates, base, base.collectionSet, combinedExtraSet)

    return [...recs.values()]
      .map((r) => {
        const price = getSkinPrice(r.skin, priceMap)
        return { ...r, price, inShards: base.shardsSet.has(r.skin.id) }
      })
      .filter((item) => {
        if (!item.price.available && !item.inShards) return false
        if (item.tier === TIERS.disenchant) return false
        if (item.price.RP === 0 && !item.inShards) return false

        if (item.tier === TIERS.upgradeNow) return true

        if (item.tier === TIERS.upgradeGroup) {
          return item.groups.some(
            (g) =>
              g.owned + g.inPotential === g.total &&
              g.total - g.owned <= 2
          )
        }
        return false
      })
      .sort(
        (a, b) =>
          (TIER_ORDER[a.tier] ?? 2) - (TIER_ORDER[b.tier] ?? 2) || b.gain - a.gain
      )
  }, [skins, base, priceMap, storeAvailableSet])

  const split = useMemo(() => splitRecommItems(items), [items])

  const totalGain = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(0, item.gain), 0),
    [items]
  )

  const totals = useMemo(() => {
    const byTier = {
      [TIERS.upgradeNow]: { count: 0, rp: 0 },
      [TIERS.upgradeGroup]: { count: 0, rp: 0 },
    }
    let totalRp = 0
    const itemById = new Map(items.map((i) => [i.id, i]))

    for (const item of items) {
      if (item.tier !== TIERS.upgradeNow) continue
      byTier[TIERS.upgradeNow].count += 1
      if (!item.inShards && item.price.available && item.price.RP > 0) {
        byTier[TIERS.upgradeNow].rp += item.price.RP
        totalRp += item.price.RP
      }
    }

    const blockIds = new Set()
    for (const block of split.blocks) {
      for (const m of block.members) blockIds.add(m.id)
    }
    for (const id of blockIds) {
      const item = itemById.get(id)
      if (!item) continue
      byTier[TIERS.upgradeGroup].count += 1
      if (!item.inShards && item.price.available && item.price.RP > 0) {
        byTier[TIERS.upgradeGroup].rp += item.price.RP
        totalRp += item.price.RP
      }
    }

    return { byTier, totalRp }
  }, [items, split.blocks])

  if (!base) return null

  const setsText = split.blocks.length > 0 ? setsLabel(split.blocks.length) : ''

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
        <span className="text-[10px] tabular-nums text-muted ml-1">
          +{item.gain.toFixed(2)}
        </span>
        {item.inShards ? (
          <span className="text-[10px] text-muted ml-1">Осколок</span>
        ) : (
          <span
            className={`text-[10px] tabular-nums ml-1 font-semibold ${
              item.price.isSale ? 'text-[#ff8f8f]' : 'text-text-h'
            }`}
          >
            {item.price.RP} RP
          </span>
        )}
      </li>
    )
  }

  return (
    <section className="flex flex-col gap-2.5 p-3 bg-panel border border-border rounded-xl">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-h m-0">Глобальные рекомендации</h2>
        <span className="text-[11px] text-muted tabular-nums">
          {items.length} шт
          {setsText ? ` · ${setsText}` : ''}
          {' · '}+{totalGain.toFixed(2)} к счёту
          {totals.totalRp > 0 ? ` · ${totals.totalRp} RP` : ''}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
        {[TIERS.upgradeNow, TIERS.upgradeGroup].map((tier) => {
          const meta = TIER_META[tier]
          const t = totals.byTier[tier]
          if (!t || t.count === 0) return null
          const tierSetsText =
            tier === TIERS.upgradeGroup && setsText ? setsText : ''
          return (
            <span
              key={tier}
              className="inline-flex items-center gap-1 px-1.5 h-[22px] rounded-full border bg-panel-soft"
              style={{ borderColor: meta.color }}
              title={`${meta.description}${t.rp > 0 ? ` · купить на ${t.rp} RP` : ''}${tierSetsText ? ` · ${tierSetsText}` : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
              <span className="text-muted">{meta.label}</span>
              <b className="tabular-nums text-text-h">{t.count}</b>
              {t.rp > 0 && (
                <span className="tabular-nums text-muted/90">· {t.rp} RP</span>
              )}
              {tierSetsText && (
                <span className="text-[10px] text-muted/80">{tierSetsText}</span>
              )}
            </span>
          )
        })}
      </div>

      <RecommGroups
        split={split}
        renderItem={renderItem}
        individualLimit={12}
        twoColumns
      />
    </section>
  )
}