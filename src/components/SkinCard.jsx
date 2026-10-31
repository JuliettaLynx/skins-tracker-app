import { memo } from 'react'
import { rarityColor, rarityLabel } from '../lib/rarities.js'
import { skinImageSrc, skinKey } from '../lib/skins.js'
import { TIER_META } from '../lib/recommendations.js'

const btnCls =
  'grid place-items-center w-[22px] h-[22px] p-0 border border-[#2c3546] rounded-md bg-[#1a2130] text-text-h text-xs leading-none cursor-pointer hover:border-accent hover:bg-[#232c3d]'

function SkinCard({ skin, list, onMove, tier, onWishlist, isWished }) {
  const image = skinImageSrc(skin)
  const uuid = skinKey(skin)
  const tierMeta = tier ? TIER_META[tier] : null

  return (
    <li
      className="group relative w-[132px] border-4 border-[color:var(--rarity)] rounded-lg bg-[#0d1119] cursor-grab active:cursor-grabbing overflow-hidden"
      style={{ '--rarity': rarityColor(skin.rarity) }}
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/plain', uuid)}
      title={`${skin.champion} — ${skin.name} (${rarityLabel(skin.rarity)})${
        tierMeta ? ` · ${tierMeta.label}: ${tierMeta.description}` : ''
      }`}
    >
      {tierMeta && (
        <div className="absolute top-0 left-0 right-0 h-[3px] z-[5]" style={{ background: tierMeta.color }} />
      )}
      {image ? (
        <img className="block w-full aspect-[4/3] object-cover object-top bg-[#161d29]" src={image} alt={skin.name} loading="lazy" />
      ) : (
        <div className="grid place-items-center w-full aspect-[4/3] p-2 text-[11px] text-center bg-[#161d29] text-[color:var(--rarity)]">
          {rarityLabel(skin.rarity)}
        </div>
      )}
      <span className="block px-1.5 pt-[5px] pb-1.5 text-[11.5px] leading-tight text-text-h">{skin.name}</span>
      <span className="absolute top-1 right-1 flex gap-1 opacity-[0.45] transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {onWishlist && (
          <button
            type="button"
            className={btnCls}
            onClick={() => onWishlist(uuid)}
            title={isWished ? 'Убрать из вишлиста' : 'Добавить в вишлист'}
            style={isWished ? { color: '#FF6B8B', borderColor: '#FF6B8B' } : undefined}
          >
            {isWished ? '♥' : '♡'}
          </button>
        )}
        {list === 'collection' ? (
          <button type="button" className={btnCls} onClick={() => onMove(uuid, 'shards')} title="Перевести в осколки">◆</button>
        ) : (
          <button type="button" className={btnCls} onClick={() => onMove(uuid, 'collection')} title="Перевести в коллекцию">★</button>
        )}
        <button type="button" className={btnCls} onClick={() => onMove(uuid, 'rest')} title="Вернуть ко всем скинам">✕</button>
      </span>
    </li>
  )
}

export default memo(SkinCard)