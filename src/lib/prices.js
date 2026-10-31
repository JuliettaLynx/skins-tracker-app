export const DEFAULT_RP_BY_RARITY = {
  kNoRarity: 750,
  kRare: 750,
  kEpic: 1350,
  kMythic: 15000,
  kLegendary: 1820,
  kTranscendent: 0,
  kUltimate: 3250,
  kExalted: 32000,
}

export const DEFAULT_OE_BY_RARITY = {
  kNoRarity: 520,
  kRare: 520,
  kEpic: 1050,
  kMythic: 0,
  kLegendary: 1520,
  kTranscendent: 0,
  kUltimate: 0,
  kExalted: 0,
}

const FALLBACK_PRICE = { RP: 750, OE: 520, available: false, isSale: false, region: 'RU' }

export const getSkinPrice = (skin, priceMap) => {
  if (!skin) return { ...FALLBACK_PRICE }

  const exact = priceMap?.[String(skin.id)]
  
  if (exact) {
    return {
      RP: exact.RP ?? DEFAULT_RP_BY_RARITY[skin.rarity] ?? FALLBACK_PRICE.RP,
      OE: exact.OE ?? DEFAULT_OE_BY_RARITY[skin.rarity] ?? FALLBACK_PRICE.OE,
      available: exact.available !== false,
      isSale: exact.isSale === true,
      region: exact.region ?? FALLBACK_PRICE.region,
    }
  }

  return {
    RP: DEFAULT_RP_BY_RARITY[skin.rarity] ?? FALLBACK_PRICE.RP,
    OE: DEFAULT_OE_BY_RARITY[skin.rarity] ?? FALLBACK_PRICE.OE,
    available: false, 
    isSale: false,
    region: FALLBACK_PRICE.region,
  }
}

export const normalizePriceMap = (raw) => {
  if (!raw || typeof raw !== 'object') return null
  const map = {}
  for (const [id, price] of Object.entries(raw)) {
    map[String(id)] = {
      RP: Number(price.RP) || 0,
      OE: Number(price.OE) || 0,
      available: price.available !== false,
      isSale: price.isSale === true,
      region: price.region || 'RU',
    }
  }
  return map
}

export const parseStorePrices = (rawItems) => {
  const map = {}
  if (!Array.isArray(rawItems)) return map

  const now = new Date()

  for (const item of rawItems) {
    if (item.inventoryType !== 'CHAMPION_SKIN' || item.active === false) continue
    
    const id = String(item.itemId)
    let price = item.prices?.find(p => p.currency === 'RP')?.cost
    let isSale = false

    if (item.sale && item.sale.prices) {
      const start = item.sale.startDate ? new Date(item.sale.startDate) : null
      const end = item.sale.endDate ? new Date(item.sale.endDate) : null
      if ((!start || now >= start) && (!end || now <= end)) {
        price = item.sale.prices.find(p => p.currency === 'RP')?.cost ?? price
        isSale = true
      }
    }

    if (price) {
      map[id] = { RP: price, available: true, isSale }
    }
  }
  return map
}
