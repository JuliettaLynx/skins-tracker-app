// Palette per rarity, provided by the tracker owner.
export const RARITY_COLORS = {
  'Без редкости': '#00AF57',
  'Редкий': '#DAA932',
  'Эпический': '#0CBDCB',
  'Мифический': '#B412B2',
  'Легендарный': '#D31A26',
  'Божественный': '#DED6E7',
  'Абсолютный': '#DF7F17',
  'Возвышенный': '#B0B95E',
}

export const FALLBACK_RARITY_COLOR = '#7A8699'

export const rarityColor = (rarity) => RARITY_COLORS[rarity] ?? FALLBACK_RARITY_COLOR

// A single accent color per list, used by the two-tone progress bars.
export const LIST_COLORS = {
  collection: '#C89B3C',
  shards: '#3FA7FF',
}
