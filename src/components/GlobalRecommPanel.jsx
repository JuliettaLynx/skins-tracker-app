import { useMemo } from 'react'
import { TIER_META, TIERS, recommendFor } from '../recommendations.js'
import { getSkinPrice } from '../prices.js'
import CollapsibleChips from './CollapsibleChips.jsx'

const round2 = (n) => Math.round(n * 100) / 100

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
    const candidates = skins.filter(s => !base.collectionSet.has(s.id)).map(s => s.id)
    
    // ПЕРВЫЙ ПРОХОД: оцениваем всех кандидатов
    const firstPass = recommendFor(candidates, base, base.collectionSet, storeAvailableSet)
    
    // Собираем всех, кто полезен И кого реально можно получить (магазин или осколок)
    const interestingIds = new Set()
    for (const [id, r] of firstPass) {
      if (r.tier === TIERS.disenchant) continue
      const price = getSkinPrice(r.skin, priceMap)
      const inShards = base.shardsSet.has(id)
      // Не добавляем то, что нельзя купить и нет в осколках
      if (!price.available && !inShards) continue
      // Не добавляем престижные скины (0 RP), если их нет в осколках — их нельзя получить за RP
      if (price.RP === 0 && !inShards) continue
      interestingIds.add(id)
    }
    
    // ВТОРОЙ ПРОХОД: добавляем полезное в extraSet, чтобы группы собирались в наборы
    const combinedExtraSet = new Set([...storeAvailableSet, ...interestingIds])
    const recs = recommendFor(candidates, base, base.collectionSet, combinedExtraSet)
    
    return [...recs.values()]
      .map(r => {
        const price = getSkinPrice(r.skin, priceMap)
        return { ...r, price, inShards: base.shardsSet.has(r.skin.id) }
      })
      .filter(item => {
        if (!item.price.available && !item.inShards) return false
        if (item.tier === TIERS.disenchant) return false
        if (item.price.RP === 0 && !item.inShards) return false
        
        // Закрывает — всегда
        if (item.tier === TIERS.upgradeNow) return true
        
        // Набор — только если в группе нужно докупить <= 2 скина
        if (item.tier === TIERS.upgradeGroup) {
          return item.groups.some(g =>
            g.owned + g.inPotential === g.total &&  // группа закрывается
            g.total - g.owned <= 2     // но нужно докупить не больше 2
          )
        }
        return false
      })
      .sort((a, b) => {
        return (TIER_ORDER[a.tier] ?? 2) - (TIER_ORDER[b.tier] ?? 2) || b.gain - a.gain
      })
  }, [skins, base, priceMap, storeAvailableSet])

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
              {item.inShards && <span className="text-[10px] text-[#3fa7ff]" title="Осколок уже есть">◆</span>}
              <span className="text-[10px] tabular-nums text-muted ml-1">
                +{item.gain.toFixed(2)}
              </span>
              {item.inShards ? (
                <span className="text-[10px] text-muted ml-1">Осколок</span>
              ) : (
                <span className={`text-[10px] tabular-nums ml-1 font-semibold ${item.price.isSale ? 'text-[#ff8f8f]' : 'text-text-h'}`}>
                  {item.price.RP} RP
                </span>
              )}
            </li>
          )
        }}
      />
    </section>
  )
}