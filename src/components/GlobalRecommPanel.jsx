import { useMemo } from 'react'
import { TIER_META, TIERS, recommendFor } from '../recommendations.js'
import CollapsibleChips from './CollapsibleChips.jsx'

const round2 = (n) => Math.round(n * 100) / 100

const TIER_ORDER = {
  [TIERS.upgradeNow]: 0,
  [TIERS.upgradeGroup]: 1,
  [TIERS.advance]: 2,
}

export default function GlobalRecommPanel({ skins, base }) {
  const items = useMemo(() => {
    if (!base) return []
    const candidates = skins.filter(s => !base.collectionSet.has(s.id)).map(s => s.id)
    const recs = recommendFor(candidates, base, base.collectionSet)
    
    return [...recs.values()]
      .map(r => ({ ...r, inShards: base.shardsSet.has(r.skin.id) }))
      .filter(item => {
        // Отсеиваем "Отложить" (disenchant) - их слишком много и они бесполезны
        if (item.tier === TIERS.disenchant) return false
        
        // "Закрывает" берем всегда
        if (item.tier === TIERS.upgradeNow) return true
        
        // "Набор" берем, если не хватает <= 3 скинов
        if (item.tier === TIERS.upgradeGroup && item.missingToComplete <= 3) return true
        
        // "Продолжает" берем, если не хватает <= 2 скинов и выгода неплохая (чтобы отсеять мелкие)
        if (item.tier === TIERS.advance && item.missingToComplete <= 2 && item.gain > 0) return true
        
        return false
      })
      .sort((a, b) => {
        return (TIER_ORDER[a.tier] ?? 3) - (TIER_ORDER[b.tier] ?? 3) || b.gain - a.gain
      })
  }, [skins, base])

  const totalGain = useMemo(() => {
    return items.reduce((sum, item) => sum + Math.max(0, item.gain), 0)
  }, [items])

  if (!base) return null

  return (
    <section className="flex flex-col gap-2.5 p-3 bg-panel border border-border rounded-xl">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-h m-0">
          Глобальные рекомендации
        </h2>
        <span className="text-[11px] text-muted tabular-nums">
          {items.length} шт · суммарно +{totalGain.toFixed(2)} к счёту
        </span>
      </header>
      
      <CollapsibleChips
        items={items}
        limit={15}
        renderItem={(item) => {
          const meta = TIER_META[item.tier]
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
              {item.missingToComplete > 0 && item.tier !== TIERS.upgradeNow && (
                <span className="text-[10px] text-muted ml-0.5">
                  (не хватает {item.missingToComplete})
                </span>
              )}
              {item.inShards && <span className="text-[10px] text-[#3fa7ff]">◆</span>}
              <span className="text-[10px] tabular-nums text-muted ml-1">
                +{item.gain.toFixed(2)}
              </span>
            </li>
          )
        }}
      />
    </section>
  )
}