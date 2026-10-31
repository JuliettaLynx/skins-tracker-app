import { useMemo } from 'react'
import {
  TIER_META,
  TIERS,
  recommendFor,
  splitRecommItems,
  setsLabel,
} from '../lib/recommendations.js'
import { getSkinPrice } from '../lib/prices.js'
import RecommGroups from './RecommGroups.jsx'

const TIER_ORDER = {
  [TIERS.upgradeNow]: 0,
  [TIERS.upgradeGroup]: 1,
  [TIERS.newChampion]: 2,
  [TIERS.advance]: 3,
  [TIERS.disenchant]: 4,
}

const round2 = (n) => Math.round(n * 100) / 100

export default function WishlistPanel({ wishlist, base, priceMap }) {
  const items = useMemo(() => {
    if (!base || !wishlist?.length) return []
    const recs = recommendFor(wishlist, base, base.collectionSet, new Set(wishlist))
    return [...recs.values()]
      .map((r) => {
        const price = getSkinPrice(r.skin, priceMap)
        return { ...r, price, inShards: base.shardsSet.has(r.skin.id) }
      })
      .sort(
        (a, b) =>
          TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
          b.gain - a.gain ||
          a.skin.name.localeCompare(b.skin.name, 'ru')
      )
  }, [wishlist, base, priceMap])

  const split = useMemo(() => splitRecommItems(items), [items])

  const totals = useMemo(() => {
    const byTier = {
      [TIERS.upgradeNow]: { count: 0, rp: 0 },
      [TIERS.upgradeGroup]: { count: 0, rp: 0 },
      [TIERS.newChampion]: { count: 0, rp: 0 },
      [TIERS.advance]: { count: 0, rp: 0 },
      [TIERS.disenchant]: { count: 0, rp: 0 },
    }
    let gain = 0
    let shardCount = 0
    let totalRp = 0
    const itemById = new Map(items.map((i) => [i.id, i]))

    for (const item of items) {
      const t = byTier[item.tier]
      if (!t) continue
      if (item.tier === TIERS.upgradeGroup) continue
      t.count += 1
      if (item.gain > 0) gain += item.gain
      if (item.inShards) {
        shardCount += 1
      } else if (item.price.available && item.price.RP > 0) {
        t.rp += item.price.RP
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
      const t = byTier[TIERS.upgradeGroup]
      t.count += 1
      if (item.gain > 0) gain += item.gain
      if (item.inShards) {
        shardCount += 1
      } else if (item.price.available && item.price.RP > 0) {
        t.rp += item.price.RP
        totalRp += item.price.RP
      }
    }

    return { count: items.length, gain: round2(gain), byTier, shardCount, totalRp }
  }, [items, split.blocks])

  if (!wishlist?.length) return null

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
        <span className="text-[10px] tabular-nums text-muted">
          +{item.gain.toFixed(2)}
        </span>
        {item.inShards ? (
          <span className="text-[10px] text-muted ml-1">Осколок</span>
        ) : item.price.available ? (
          <span
            className={`text-[10px] tabular-nums ml-1 font-semibold ${
              item.price.isSale ? 'text-[#ff8f8f]' : 'text-text-h'
            }`}
          >
            {item.price.RP} RP
          </span>
        ) : (
          <span className="text-[10px] text-muted ml-1 italic">Нет в магазине</span>
        )}
      </li>
    )
  }

  return (
    <section className="flex flex-col gap-2.5 p-3 bg-panel border border-border rounded-xl">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-h m-0">Рекомендации по вишлисту</h2>
        <span className="text-[11px] text-muted tabular-nums">
          {totals.count} шт
          {setsText ? ` · ${setsText}` : ''}
          {' · '}+{totals.gain.toFixed(2)} к счёту
          {totals.totalRp > 0 ? ` · ${totals.totalRp} RP` : ''}
          {totals.shardCount > 0 ? ` · ${totals.shardCount} уже в осколках` : ''}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
        {Object.entries(TIER_META).map(([tier, meta]) => {
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

      <RecommGroups split={split} renderItem={renderItem} individualLimit={12} />
    </section>
  )
}