import { sumRecommRp } from '../recommendations.js'
import CollapsibleChips from './CollapsibleChips.jsx'

function SetBlock({ block, renderItem }) {
  const gain = block.members.reduce((s, i) => s + i.gain, 0)
  const rp = sumRecommRp(block.members)
  const uniqueCount = new Set(block.members.map((m) => m.id)).size
  const hasDuplicates = uniqueCount < block.members.length

  return (
    <div className="rounded-xl border border-border p-2 bg-panel-soft min-w-0">
      <header className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-[11.5px]">
        <span className="flex items-center gap-1 min-w-0">
          <span className="text-muted">
            {block.type === 'skinline' ? 'Линейка' : 'Чемпион'}:
          </span>
          <span className="text-text-h font-semibold truncate">{block.name}</span>
          <span className="text-muted whitespace-nowrap">
            · {block.members.length} скина{hasDuplicates ? ' (пересекается)' : ''}
          </span>
        </span>
        <span
          className="tabular-nums text-muted whitespace-nowrap"
          title={
            hasDuplicates
              ? 'Сумма по этому набору. Скины, входящие в несколько наборов, показаны в каждом, но в общем счёте учитываются один раз.'
              : 'Сумма по этому набору'
          }
        >
          +{gain.toFixed(2)}
          {rp > 0 && ` · ${rp} RP`}
        </span>
      </header>
      <ul className="flex flex-wrap gap-1.5">
        {block.members.map(renderItem)}
      </ul>
    </div>
  )
}

// split — результат splitRecommItems(items).
// twoColumns — включить 2-колоночную сетку для блоков-наборов на >=1100px.
//   Чипы «Закрывает» (upgradeNow) и «Остальное» при этом растягиваются
//   на всю ширину — они не «наборы», а плоский список.
export default function RecommGroups({
  split,
  renderItem,
  individualLimit = 12,
  twoColumns = false,
}) {
  const { upgradeNow, blocks, others } = split

  const containerCls = twoColumns
    ? 'grid grid-cols-1 min-[1100px]:grid-cols-2 gap-3'
    : 'flex flex-col gap-2'

  const span2 = twoColumns ? 'min-[1100px]:col-span-2' : ''

  return (
    <div className={containerCls}>
      {upgradeNow.length > 0 && (
        <div className={span2}>
          <CollapsibleChips
            items={upgradeNow}
            renderItem={renderItem}
            limit={individualLimit}
          />
        </div>
      )}

      {blocks.map((block) => (
        <SetBlock key={block.key} block={block} renderItem={renderItem} />
      ))}

      {others.length > 0 && (
        <div className={span2}>
          <CollapsibleChips
            items={others}
            renderItem={renderItem}
            limit={individualLimit}
          />
        </div>
      )}
    </div>
  )
}