// Parses the inventory export (an object with "skins" and "shards" arrays)
// into the two id lists the tracker works with.
//
// The catalogue id of a skin equals itemId / storeItemId from the export,
// so matching is a direct lookup and never depends on names.

const asId = (value) => {
  if (value === null || value === undefined || value === '') return null
  const id = String(value)
  return id === '0' ? null : id
}

// A shard does not always carry a usable storeItemId: rental and generic loot
// entries keep the skin inside lootName, e.g. "CHAMPION_SKIN_RENTAL_103015".
const idFromLootName = (entry) => {
  for (const field of [entry?.lootName, entry?.upgradeLootName]) {
    const match = /CHAMPION_SKIN(?:_RENTAL)?_(\d+)/.exec(String(field ?? ''))
    if (match) return match[1]
  }
  return null
}

const shardId = (entry) => asId(entry?.storeItemId) ?? idFromLootName(entry)

export function parseInventory(raw, knownIds) {
  const result = { collection: [], shards: [], skipped: 0 }

  const push = (bucket, value) => {
    const id = asId(value)
    if (!id) {
      result.skipped += 1
      return
    }
    // Anything the catalogue does not know (wards, chromas, champion unlocks) is skipped.
    if (knownIds && !knownIds.has(id)) {
      result.skipped += 1
      return
    }
    if (!bucket.includes(id)) bucket.push(id)
  }

  for (const entry of raw?.skins ?? []) {
    if (entry?.owned === false || entry?.rental === true) continue
    // The export may mix champions and chromas in; only plain skins are counted.
    if (entry?.inventoryType && entry.inventoryType !== 'CHAMPION_SKIN') continue
    push(result.collection, entry?.itemId)
  }

  for (const entry of raw?.shards ?? []) {
    push(result.shards, shardId(entry))
  }

  return result
}

// Import tops the lists up instead of replacing them, so manual edits survive.
export const mergeLists = (current, incoming) => {
  const next = [...current]
  for (const id of incoming) if (!next.includes(id)) next.push(id)
  return next
}
