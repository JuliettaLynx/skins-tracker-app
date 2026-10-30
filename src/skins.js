export const LIST = {
  collection: 'collection',
  shards: 'shards',
  rest: 'rest',
}

export const LIST_TITLES = {
  collection: 'Коллекция',
  shards: 'Осколки',
  rest: 'Все скины чемпиона',
}

// Stable identity of a skin: champion key + skin number, never reassigned.
export const skinKey = (skin) => String(skin.id)

// data.json keeps images as absolute https urls.
export const skinImageSrc = (skin) => skin.image ?? null

// Flattens data.json into the shape the UI works with.
// A skin id is "<champion key><3-digit skin number>", e.g. 266001 or 84001.
// The 3-digit rule matters: key "1" (Annie) and "10" (Kayle) share prefixes,
// so "1001" must resolve to Annie, not Kayle.
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

  return (data.skins ?? [])
    .map((skin) => {
      const champion = championOf(skin.id)
      return {
        id: skin.id,
        champion: champion?.name ?? 'Без чемпиона',
        name: skin.name ?? 'Без названия',
        rarity: skin.rarity ?? '',
        skinLines: (skin.skinlines ?? []).map((line) => line.name),
        image: skin.image?.centered ?? null,
      }
    })
    .filter((skin) => skin.champion !== 'Без чемпиона')
}

export const championSort = (a, b) => a.champion.localeCompare(b.champion, 'ru')

// Splits the whole catalogue into per-champion rows split by list.
// `statusOf` maps a skin key (see skinKey) to a LIST value.
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

  const needle = query.trim().toLowerCase()
  if (!needle) return rows

  return rows.filter((row) => row.champion.toLowerCase().includes(needle))
}

// Aggregates skin lines: how many skins the line has and how many are owned.
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
