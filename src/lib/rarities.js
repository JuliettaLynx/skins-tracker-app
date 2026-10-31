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

export const rarityRank = (rarity) => {
  const index = RARITY_ORDER.indexOf(rarity)
  return index === -1 ? RARITY_ORDER.length : index
}

export const LIST_COLORS = {
  collection: '#C89B3C',
  shards: '#3FA7FF',
}
