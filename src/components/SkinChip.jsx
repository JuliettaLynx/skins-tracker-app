import { rarityColor } from '../rarities.js'
import { skinKey } from '../skins.js'

// Compact name-only entry with a rarity border, used by the "all skins" column.
export default function SkinChip({ skin, onMove }) {
  const uuid = skinKey(skin)

  return (
    <li
      className="skin-chip"
      style={{ '--rarity': rarityColor(skin.rarity) }}
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/plain', uuid)}
      title={`${skin.name} (${skin.rarity})`}
    >
      <span className="skin-chip__name">{skin.name}</span>
      <button type="button" onClick={() => onMove(uuid, 'collection')} title="В коллекцию">
        ★
      </button>
      <button type="button" onClick={() => onMove(uuid, 'shards')} title="В осколки">
        ◆
      </button>
    </li>
  )
}
