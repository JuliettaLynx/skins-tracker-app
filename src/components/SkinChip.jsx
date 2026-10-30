import { memo } from 'react'
import { rarityColor, rarityLabel } from '../rarities.js'
import { skinKey } from '../skins.js'

const btnCls =
  'grid place-items-center w-[22px] h-[22px] p-0 border border-[#2c3546] rounded-lg bg-[#1a2130] text-text-h text-xs leading-none cursor-pointer hover:border-accent hover:bg-[#232c3d]'

function SkinChip({ skin, onMove, onWishlist, isWished }) {
  const uuid = skinKey(skin)

  return (
    <li
      className="flex items-center gap-1 max-w-full pl-[9px] pr-[3px] py-[2px] border-2 border-[color:var(--rarity)] rounded-xl bg-[#0f141d] text-xs cursor-grab active:cursor-grabbing"
      style={{ '--rarity': rarityColor(skin.rarity) }}
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/plain', uuid)}
      title={`${skin.name} (${rarityLabel(skin.rarity)})`}
    >
      <span className="max-w-[150px] truncate text-text-h">{skin.name}</span>
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
      <button type="button" className={btnCls} onClick={() => onMove(uuid, 'collection')} title="В коллекцию">
        ★
      </button>
      <button type="button" className={btnCls} onClick={() => onMove(uuid, 'shards')} title="В осколки">
        ◆
      </button>
    </li>
  )
}

export default memo(SkinChip)