import { useMemo, useState } from 'react'
import { TIER_META, TIERS, recommendFor } from '../recommendations.js'

const TIER_ORDER = {
  [TIERS.upgradeNow]: 0,
  [TIERS.upgradeGroup]: 1,
  [TIERS.advance]: 2,
  [TIERS.disenchant]: 3,
}

const SORTS = {
  priority: (a, b) =>
    TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
    b.gain - a.gain ||
    a.skin.name.localeCompare(b.skin.name, 'ru'),
  gain: (a, b) => b.gain - a.gain || a.skin.name.localeCompare(b.skin.name, 'ru'),
}

const fieldCls =
  'px-2 py-[6px] rounded-lg border border-border bg-[#0f141d] text-text-h text-[13px]'

const round2 = (n) => Math.round(n * 100) / 100

export default function WishlistPanel({ wishlist, base, onRemove }) {
  const [sortMode, setSortMode] = useState('priority')

    const items = useMemo(() => {
      if (!base || !wishlist?.length) return []
      // Передаем вишлист в extraSet, чтобы "Набор" учитывал будущую покупку
      const recs = recommendFor(wishlist, base, base.collectionSet, new Set(wishlist))
      return [...recs.values()].map((r) => ({
        ...r,
        inShards: base.shardsSet.has(r.skin.id),
      }))
    }, [wishlist, base])

  const sorted = useMemo(() => [...items].sort(SORTS[sortMode]), [items, sortMode])

  const totals = useMemo(() => {
    const byTier = {
      [TIERS.upgradeNow]: 0,
      [TIERS.upgradeGroup]: 0,
      [TIERS.advance]: 0,
      [TIERS.disenchant]: 0,
    }
    let gain = 0
    let shardCount = 0
    for (const item of items) {
      byTier[item.tier] += 1
      if (item.gain > 0) gain += item.gain
      if (item.inShards) shardCount += 1
    }
    return { count: items.length, gain: round2(gain), byTier, shardCount }
  }, [items])

  if (!wishlist?.length) return null

  return (
    <section className="flex flex-col gap-2.5 p-3 bg-panel border border-border rounded-xl">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-h m-0">
          Рекомендации по вишлисту
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

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="wish-sort" className="text-[12px] text-muted">Сортировка:</label>
        <select
          id="wish-sort"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          className={fieldCls}
        >
          <option value="priority">по важности</option>
          <option value="gain">по выгоде</option>
        </select>
      </div>

      <ul className="flex flex-wrap gap-1.5">
        {sorted.map((item) => {
          const meta = TIER_META[item.tier]
          return (
            <li
              key={item.id}
              className="flex items-center gap-1 h-7 pl-1.5 pr-0.5 border rounded-full bg-[#0f141d] text-xs"
              style={{ borderColor: meta.color }}
              title={`${meta.label}: ${meta.description} · выгода ${item.gain.toFixed(2)}${
                item.inShards ? ' · осколок уже есть' : ''
              }`}
            >
              <span
                className="grid place-items-center w-4 h-4 rounded-full text-[10px] font-semibold flex-none"
                style={{ background: meta.color, color: '#0d1119' }}
                aria-label={meta.label}
              >
                {meta.short}
              </span>
              <span className="max-w-[150px] truncate text-text-h">
                {item.skin.champion} — {item.skin.name}
              </span>
              {item.inShards && (
                <span
                  className="text-[10px] text-[#3fa7ff]"
                  title="Осколок уже есть — обновление дешевле покупки"
                >
                  ◆
                </span>
              )}
              <span className="text-[10px] tabular-nums text-muted">
                +{item.gain.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                title="Убрать из вишлиста"
                className="grid place-items-center w-5 h-5 flex-none rounded border border-[#2c3546] bg-[#1a2130] text-text-h text-xs cursor-pointer hover:border-accent"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}