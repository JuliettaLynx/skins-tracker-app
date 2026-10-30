const asId = (value) => {
  if (value === null || value === undefined || value === '') return null
  const id = String(value)
  return id === '0' ? null : id
}

const idFromLootName = (entry) => {
  for (const field of [entry?.lootName, entry?.upgradeLootName]) {
    const match = /CHAMPION_SKIN(?:_RENTAL)?_(\d+)/.exec(String(field ?? ''))
    if (match) return match[1]
  }
  return null
}

const shardId = (entry) => asId(entry?.storeItemId) ?? idFromLootName(entry)

// raw: { skins: [...], shards: [...] } из инвентаря
// { skinIds, chromaIds } — Set'ы id из каталога, чтобы отличать хромы от скинов
// и не пускать «неизвестные» (эмоции/варды/8-значные) в результат.
export function parseInventory(raw, { skinIds, chromaIds } = {}) {
  const result = { collection: [], shards: [], chromas: [], skipped: 0 }

  const pushUnique = (bucket, id) => {
    if (!bucket.includes(id)) bucket.push(id)
  }

  for (const entry of raw?.skins ?? []) {
    if (entry?.owned === false || entry?.rental === true) continue
    if (entry?.inventoryType && entry.inventoryType !== 'CHAMPION_SKIN') continue

    const id = asId(entry?.itemId)
    if (!id) {
      result.skipped += 1
      continue
    }

    // Порядок важен: сначала хромы. В data.json их id вложены в скины,
    // но пространства id не пересекаются.
    if (chromaIds?.has(id)) {
      pushUnique(result.chromas, id)
      continue
    }
    if (skinIds?.has(id)) {
      pushUnique(result.collection, id)
      continue
    }

    result.skipped += 1
  }

  for (const entry of raw?.shards ?? []) {
    const id = shardId(entry)
    if (!id) {
      result.skipped += 1
      continue
    }
    if (skinIds && !skinIds.has(id)) {
      result.skipped += 1
      continue
    }
    pushUnique(result.shards, id)
  }

  return result
}

export const mergeLists = (current, incoming) => {
  const next = [...current]
  for (const id of incoming) if (!next.includes(id)) next.push(id)
  return next
}
