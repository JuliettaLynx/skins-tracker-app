import { rarityColor, rarityLabel } from '../rarities.js'
import { skinImageSrc, skinKey } from '../skins.js'

// Card with the splash of the skin, thick rarity-coloured border, name below.
export default function SkinCard({ skin, list, onMove }) {
  const image = skinImageSrc(skin)
  const uuid = skinKey(skin)

  return (
    <li
      className="skin-card"
      style={{ '--rarity': rarityColor(skin.rarity) }}
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/plain', uuid)}
      title={`${skin.champion} — ${skin.name} (${rarityLabel(skin.rarity)})`}
    >
      {image ? (
        <img className="skin-card__img" src={image} alt={skin.name} loading="lazy" />
      ) : (
        <div className="skin-card__img skin-card__img--empty">{rarityLabel(skin.rarity)}</div>
      )}
      <span className="skin-card__name">{skin.name}</span>
      <span className="skin-card__actions">
        {list === 'collection' ? (
          <button type="button" onClick={() => onMove(uuid, 'shards')} title="Перевести в осколки">
            ◆
          </button>
        ) : (
          <button type="button" onClick={() => onMove(uuid, 'collection')} title="Перевести в коллекцию">
            ★
          </button>
        )}
        <button type="button" onClick={() => onMove(uuid, 'rest')} title="Вернуть ко всем скинам">
          ✕
        </button>
      </span>
    </li>
  )
}
