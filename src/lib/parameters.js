const MIN_SKINLINE_SIZE = 2
const MIN_CHAMPION_SIZE = 2
const MIN_CHROMA_SET_SIZE = 2

export const RARITY_WEIGHTS = {
  kTranscendent: 20,
  kExalted: 15,
  kUltimate: 10,
  kMythic: 7,
  kLegendary: 5,
  kEpic: 3,
  kRare: 2,
  kNoRarity: 0,
}

export const RANK_THRESHOLDS = [
  { rank: 'Iron', min: 0, max: 19 },
  { rank: 'Bronze', min: 20, max: 34 },
  { rank: 'Silver', min: 35, max: 49 },
  { rank: 'Gold', min: 50, max: 64 },
  { rank: 'Platinum', min: 65, max: 79 },
  { rank: 'Diamond', min: 80, max: 94 },
  { rank: 'Master', min: 95, max: 100 },
]

export const MAX_RANK_SCORE = 100

export const RANK_COLORS = {
  Iron: '#7A8699',
  Bronze: '#A97142',
  Silver: '#B7C4CF',
  Gold: '#DAA932',
  Platinum: '#0CBDCB',
  Diamond: '#4A9EFF',
  Master: '#B412B2',
}

const getRankIndex = (score) => RANK_THRESHOLDS.findLastIndex((r) => score >= r.min)
const getRank = (score) => RANK_THRESHOLDS[getRankIndex(score)].rank

export const PARAMETER_META = [
  { key: 'completeness', title: 'Полнота', description: 'Доля скинов в коллекции от общего числа в базе', max: 30 },
  { key: 'rarity', title: 'Редкость', description: 'Взвешенная редкость собранных скинов', max: 25 },
  { key: 'rosterBreadth', title: 'Охват чемпионов', description: 'Скины скольких чемпионов есть в коллекции', max: 20 },
  { key: 'completionist', title: 'Коллекционер', description: 'Закрытые линейки, чемпионы и наборы хром', max: 15 },
  { key: 'chromaCoverage', title: 'Покрытие хром', description: 'Доля собранных хром у имеющихся скинов', max: 10 },
]

export const computeParameters = (owned, data) => {
  // completeness (max 30)
  const completeness = data.skins.length > 0 ? (owned.skinIds.size / data.skins.length) * 30 : 0

  // rarity (max 25)
  const ownedSkins = data.skins.filter((s) => owned.skinIds.has(s.id))
  const maxPossibleRarityScore = data.skins.reduce((sum, s) => sum + (RARITY_WEIGHTS[s.rarity] ?? 0), 0)
  const actualRarityScore = ownedSkins.reduce((sum, s) => sum + (RARITY_WEIGHTS[s.rarity] ?? 0), 0)
  const rarity = maxPossibleRarityScore > 0 ? (actualRarityScore / maxPossibleRarityScore) * 25 : 0

  // rosterBreadth (max 20)
  const championIdsWithOwnedSkin = new Set(ownedSkins.map((s) => s.championId))
  const rosterBreadth =
    data.champions.length > 0 ? (championIdsWithOwnedSkin.size / data.champions.length) * 20 : 0

  // completionist (max 15)
  const skinlineMap = new Map()
  for (const skin of data.skins) {
    for (const slId of skin.skinLineIds ?? []) {
      if (!skinlineMap.has(slId)) skinlineMap.set(slId, { total: 0, owned: 0 })
      const entry = skinlineMap.get(slId)
      entry.total++
      if (owned.skinIds.has(skin.id)) entry.owned++
    }
  }
  const validSkinlines = [...skinlineMap.values()].filter(
    (e) => e.total >= MIN_SKINLINE_SIZE && e.owned > 0
  )
  const completedSkinlines = validSkinlines.filter((e) => e.owned === e.total).length

  const championMap = new Map()
  for (const skin of data.skins) {
    if (!championMap.has(skin.championId)) championMap.set(skin.championId, { total: 0, owned: 0 })
    const entry = championMap.get(skin.championId)
    entry.total++
    if (owned.skinIds.has(skin.id)) entry.owned++
  }
  const validChampions = [...championMap.values()].filter(
    (e) => e.total >= MIN_CHAMPION_SIZE && e.owned > 0
  )
  const completedChampions = validChampions.filter((e) => e.owned === e.total).length

  const chromaSetMap = new Map()
  for (const chroma of data.chromas) {
    const skinId = chroma.skin.id
    if (!chromaSetMap.has(skinId)) chromaSetMap.set(skinId, { total: 0, owned: 0 })
    const entry = chromaSetMap.get(skinId)
    entry.total++
    if (owned.chromaIds.has(chroma.id)) entry.owned++
  }
  const validChromaSets = [...chromaSetMap.values()].filter(
    (e) => e.total >= MIN_CHROMA_SET_SIZE && e.owned > 0
  )
  const completedChromaSets = validChromaSets.filter((e) => e.owned === e.total).length

  const maxCompletionist = validSkinlines.length + validChampions.length + validChromaSets.length
  const actualCompletionist = completedSkinlines + completedChampions + completedChromaSets
  const completionist = maxCompletionist > 0 ? (actualCompletionist / maxCompletionist) * 15 : 0

  // chromaCoverage (max 10)
  const chromasForOwnedSkins = data.chromas.filter((c) => owned.skinIds.has(c.skin.id))
  const ownedChromasForOwnedSkins = chromasForOwnedSkins.filter((c) => owned.chromaIds.has(c.id))
  const chromaCoverage =
    chromasForOwnedSkins.length > 0
      ? (ownedChromasForOwnedSkins.length / chromasForOwnedSkins.length) * 10
      : 0

  const score = completeness + rarity + rosterBreadth + completionist + chromaCoverage

  return {
    score,
    rank: getRank(score),
    rankIndex: getRankIndex(score),
    breakdown: {
      completeness: Math.round(completeness * 100) / 100,
      rarity: Math.round(rarity * 100) / 100,
      rosterBreadth: Math.round(rosterBreadth * 100) / 100,
      completionist: Math.round(completionist * 100) / 100,
      chromaCoverage: Math.round(chromaCoverage * 100) / 100,
    },
  }
}