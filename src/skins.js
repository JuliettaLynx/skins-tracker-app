import { rarityRank } from './rarities.js'

export const LIST = { collection: 'collection', shards: 'shards', rest: 'rest' }
export const LIST_TITLES = {
  collection: 'Коллекция',
  shards: 'Осколки',
  rest: 'Все скины чемпиона',
}

export const skinKey = (skin) => String(skin.id)
export const skinImageSrc = (skin) => skin.image ?? null

export const normalizeData = (data) => {
  const champions = data.champions ?? []
  const keyLengths = [...new Set(champions.map((c) => String(c.key).length))].sort((a, b) => b - a)
  const byKey = new Map(champions.map((c) => [String(c.key), c]))

  const championOf = (skinId) => {
    for (const length of keyLengths) {
      if (String(skinId).length !== length + 3) continue
      const champion = byKey.get(String(skinId).slice(0, length))
      if (champion) return champion
    }
    return null
  }

  const skins = []
  const chromas = []

  for (const rawSkin of data.skins ?? []) {
    const champion = championOf(rawSkin.id)
    if (!champion) continue

    const skin = {
      id: String(rawSkin.id),
      champion: champion.name,
      name: rawSkin.name ?? 'Без названия',
      rarity: rawSkin.rarity ?? '',
      skinLines: (rawSkin.skinlines ?? []).map((line) => line.name),
      image: rawSkin.image?.centered ?? null,
    }
    skins.push(skin)

    for (const rawChroma of rawSkin.chromas ?? []) {
      chromas.push({
        id: String(rawChroma.id),
        name: rawChroma.name ?? 'Хрома',
        fullName: rawChroma.fullName ?? rawChroma.name ?? '',
        image: rawChroma.path ?? null,
        colors: rawChroma.colors ?? [],
        skin: {
          id: skin.id,
          name: skin.name,
          image: skin.image,
          rarity: skin.rarity,
        },
        champion: skin.champion,
      })
    }
  }

  return { skins, chromas }
}

export const championSort = (a, b) => a.champion.localeCompare(b.champion, 'ru')
const byRarity = (a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a.name.localeCompare(b.name, 'ru')
const sortSkins = (list) => [...list].sort(byRarity)

export const buildRows = (skins, statusOf, query) => {
  const byChampion = new Map()

  for (const skin of skins) {
    if (!byChampion.has(skin.champion)) byChampion.set(skin.champion, [])
    byChampion.get(skin.champion).push(skin)
  }

  const rows = [...byChampion.entries()]
    .map(([champion, list]) => ({
      champion,
      collection: sortSkins(list.filter((s) => statusOf.get(skinKey(s)) === LIST.collection)),
      shards: sortSkins(list.filter((s) => statusOf.get(skinKey(s)) === LIST.shards)),
      rest: sortSkins(list.filter((s) => statusOf.get(skinKey(s)) === undefined)),
    }))
    .sort(championSort)
    .map((row, index) => ({ ...row, num: index + 1 }))

  const needle = query.trim().toLowerCase()
  if (!needle) return rows

  return rows.filter((row) => row.champion.toLowerCase().includes(needle))
}

export const buildLines = (skins, statusOf) => {
  const byLine = new Map()

  for (const skin of skins) {
    for (const line of skin.skinLines ?? []) {
      if (!byLine.has(line)) byLine.set(line, { name: line, total: 0, collection: 0, shards: 0 })
      const stats = byLine.get(line)
      stats.total += 1
      const status = statusOf.get(skinKey(skin))
      if (status === LIST.collection) stats.collection += 1
      else if (status === LIST.shards) stats.shards += 1
    }
  }

  return [...byLine.values()]
}

// ------------------ CHROMAS ------------------

export const CHROMA_FILTER = {
  all: 'all',
  ownedSkins: 'ownedSkins',
  withOwnedChroma: 'withOwnedChroma',
}

export const CHROMA_FILTER_LABELS = {
  [CHROMA_FILTER.all]: 'Все скины с хромами',
  [CHROMA_FILTER.ownedSkins]: 'Только скины из коллекции',
  [CHROMA_FILTER.withOwnedChroma]: 'Только где есть мои хромы',
}

export const buildChromaIndex = (chromas) => {
  const bySkin = new Map()
  for (const chroma of chromas) {
    const id = chroma.skin.id
    if (!bySkin.has(id)) {
      bySkin.set(id, {
        skinId: id,
        skin: chroma.skin,
        champion: chroma.champion,
        all: [],
        total: 0,
      })
    }
    const row = bySkin.get(id)
    row.all.push(chroma)
    row.total += 1
  }
  return [...bySkin.values()]
}

// collectionSkinSet — id скинов ТОЛЬКО из коллекции (без осколков).
// Это осознанное решение: «мои скины» = купленные, осколки — временные.
export const filterChromaRows = (
  rows,
  query,
  { filter = CHROMA_FILTER.all, collectionSkinSet, ownedChromaSet } = {}
) => {
  const needle = String(query ?? '').trim().toLowerCase()

  return rows.filter((row) => {
    if (filter === CHROMA_FILTER.ownedSkins && !collectionSkinSet?.has(row.skinId)) return false
    if (filter === CHROMA_FILTER.withOwnedChroma) {
      if (!row.all.some((c) => ownedChromaSet?.has(c.id))) return false
    }
    if (!needle) return true
    return (
      row.champion.toLowerCase().includes(needle) ||
      row.skin.name.toLowerCase().includes(needle)
    )
  })
}