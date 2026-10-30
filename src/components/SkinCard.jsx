import { rarityColor, rarityLabel } from '../rarities.js'
import { skinImageSrc, skinKey } from '../skins.js'

const btnCls =
  'grid place-items-center w-[22px] h-[22px] p-0 border border-[#2c3546] rounded-md bg-[#1a2130] text-text-h text-xs leading-none cursor-pointer hover:border-accent hover:bg-[#232c3d]'

// Card with the splash of the skin, thick rarity-coloured border, name below.
export default function SkinCard({ skin, list, onMove }) {
  const image = skinImageSrc(skin)
  const uuid = skinKey(skin)

  return (
    <li
      className="group relative w-[132px] border-4 border-[color:var(--rarity)] rounded-lg bg-[#0d1119] cursor-grab active:cursor-grabbing overflow-hidden"
      style={{ '--rarity': rarityColor(skin.rarity) }}
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/plain', uuid)}
      title={`${skin.champion} — ${skin.name} (${rarityLabel(skin.rarity)})`}
    >
      {image ? (
        <img
          className="block w-full aspect-[4/3] object-cover object-top bg-[#161d29]"
          src={image}
          alt={skin.name}
          loading="lazy"
        />
      ) : (
        <div className="grid place-items-center w-full aspect-[4/3] p-2 text-[11px] text-center bg-[#161d29] text-[color:var(--rarity)]">
          {rarityLabel(skin.rarity)}
        </div>
      )}
      <span className="block px-1.5 pt-[5px] pb-1.5 text-[11.5px] leading-tight text-text-h">
        {skin.name}
      </span>
      <span className="absolute top-1 right-1 flex gap-1 opacity-[0.45] transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {list === 'collection' ? (
          <button type="button" className={btnCls} onClick={() => onMove(uuid, 'shards')} title="Перевести в осколки">
            ◆
          </button>
        ) : (
          <button type="button" className={btnCls} onClick={() => onMove(uuid, 'collection')} title="Перевести в коллекцию">
            ★
          </button>
        )}
        <button type="button" className={btnCls} onClick={() => onMove(uuid, 'rest')} title="Вернуть ко всем скинам">
          ✕
        </button>
      </span>
    </li>
  )
}