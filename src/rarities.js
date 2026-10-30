// Palette per rarity, provided by the tracker owner.
// Keys are the rarity codes used in data.json.
export const RARITY_COLORS = {
  kNoRarity: '#00AF57',
  kRare: '#DAA932',
  kEpic: '#0CBDCB',
  kMythic: '#B412B2',
  kLegendary: '#D31A26',
  kTranscendent: '#DED6E7',
  kUltimate: '#DF7F17',
  kExalted: '#B0B95E',
}

export const RARITY_LABELS = {
  kNoRarity: 'Без редкости',
  kRare: 'Редкий',
  kEpic: 'Эпический',
  kMythic: 'Мифический',
  kLegendary: 'Легендарный',
  kTranscendent: 'Божественный',
  kUltimate: 'Абсолютный',
  kExalted: 'Возвышенный',
}

export const FALLBACK_RARITY_COLOR = '#7A8699'

export const rarityColor = (rarity) => RARITY_COLORS[rarity] ?? FALLBACK_RARITY_COLOR

export const rarityLabel = (rarity) => RARITY_LABELS[rarity] ?? rarity ?? 'Неизвестно'

// Highest rarity first, so skins sort from the rarest down to "Без редкости".
export const RARITY_ORDER = [
  'kExalted',
  'kUltimate',
  'kTranscendent',
  'kLegendary',
  'kMythic',
  'kEpic',
  'kRare',
  'kNoRarity',
]

// Unknown rarity goes to the end of the list.
export const rarityRank = (rarity) => {
  const index = RARITY_ORDER.indexOf(rarity)
  return index === -1 ? RARITY_ORDER.length : index
}

// A single accent color per list, used by the two-tone progress bars.
export const LIST_COLORS = {
  collection: '#C89B3C',
  shards: '#3FA7FF',
}
