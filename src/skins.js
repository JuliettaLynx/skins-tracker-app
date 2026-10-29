// Where a skin currently lives. A skin occupies exactly one list at a time.
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

// skins.json stores image_path in Windows form: images\<uuid>.jpg
export const skinImageSrc = (skin) => {
  if (!skin.image_path) return null
  const posix = String(skin.image_path).split(String.fromCharCode(92)).join('/')
  return `/${posix.replace(/^\/+/, '')}`
}

// Stable identity of a skin. Numeric ids are reassigned on every parser run,
// while the uuid inside the url never changes, so localStorage keys use it.
export const skinKey = (skin) => {
  const tail = String(skin.url ?? '').split('/').pop() ?? ''
  return /^[0-9a-f-]{36}$/i.test(tail) ? tail : `skin-${skin.id}`
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

  const needle = query.trim().toLowerCase()

  return [...byChampion.entries()]
    .filter(([champion]) => !needle || champion.toLowerCase().includes(needle))
    .map(([champion, list]) => ({
      champion,
      collection: list.filter((s) => statusOf.get(skinKey(s)) === LIST.collection),
      shards: list.filter((s) => statusOf.get(skinKey(s)) === LIST.shards),
      rest: list.filter((s) => statusOf.get(skinKey(s)) === undefined),
    }))
    .sort(championSort)
}

// Aggregates skin lines: how many skins the line has and how many are owned.
export const buildLines = (skins, statusOf) => {
  const byLine = new Map()

  for (const skin of skins) {
    for (const line of skin.skin_lines ?? []) {
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
