import { TIER_META, TIERS } from '../recommendations.js'

export default function RecommSummary({ summary }) {
  if (!summary || summary.total === 0) return null

  const items = [
    { tier: TIERS.upgradeNow, count: summary.upgradeNow, gain: summary.potentialGain.upgradeNow },
    { tier: TIERS.upgradeGroup, count: summary.upgradeGroup, gain: summary.potentialGain.upgradeGroup },
    { tier: TIERS.advance, count: summary.advance },
    { tier: TIERS.disenchant, count: summary.disenchant },
  ]

  return (
    <section className="flex flex-col gap-2 p-3 bg-panel border border-border rounded-xl">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-h m-0">Оптимальные покупки осколков</h2>
        <span className="text-[11px] text-muted tabular-nums">всего осколков: {summary.total}</span>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map(({ tier, count, gain }) => {
          const meta = TIER_META[tier]
          return (
            <div
              key={tier}
              className="flex flex-col gap-1 p-2 rounded-lg bg-panel-soft border border-border min-w-0"
              style={{ borderLeft: `3px solid ${meta.color}` }}
              title={meta.description}
            >
              <span className="text-[11px] text-muted truncate">{meta.label}</span>
              <div className="flex items-baseline justify-between gap-1 tabular-nums">
                <span className="text-[18px] font-semibold leading-none" style={{ color: meta.color }}>
                  {count}
                </span>
                {gain > 0 && (
                  <span className="text-[10px] text-muted">+{gain.toFixed(2)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {summary.disenchant > 0 && (
        <p className="text-[11.5px] text-muted leading-snug m-0">
          {summary.disenchant} осколков откроют новые коллекции, которые не закрыть текущим инвентарём. Их можно распылить на эссенцию и вложить в «Закрывает» и «Набор».
        </p>
      )}
    </section>
  )
}