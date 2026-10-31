import { RARITY_WEIGHTS } from './parameters.js'

const MIN_GROUP_SIZE = 2

export const TIERS = {
  upgradeNow: 'upgrade-now',
  upgradeGroup: 'upgrade-group',
  newChampion: 'new-champion',
  advance: 'advance',
  disenchant: 'disenchant',
}

export const TIER_META = {
  [TIERS.upgradeNow]: {
    short: '✓', label: 'Закрывает', color: '#2c9b5a',
    description: 'Один осколок завершает линейку или чемпиона — самое ценное вложение',
  },
  [TIERS.upgradeGroup]: {
    short: '⊞', label: 'Набор', color: '#813fa9',
    description: 'Закрывает группу, если обновить все осколки этого набора',
  },
  [TIERS.newChampion]: {
    short: '★', label: 'Чемпион', color: '#2e6ca3',
    description: 'Открывает нового чемпиона в твоём ростере, даже если не закрывает линейку',
  },
  [TIERS.advance]: {
    short: '·', label: 'Продолжает', color: '#C89B3C',
    description: 'Продолжает начатую группу, но пока не закрывает',
  },
  [TIERS.disenchant]: {
    short: '✕', label: 'Отложить', color: '#E74C3C',
    description: 'Начнёт новую коллекцию, которую не закрыть текущими осколками. Лучше отложить',
  },
}

export const buildGroupMaps = (skins) => {
  const bySkinline = new Map()
  const byChampion = new Map()
  for (const skin of skins) {
    for (const slId of skin.skinLineIds) {
      if (!bySkinline.has(slId)) bySkinline.set(slId, [])
      bySkinline.get(slId).push(skin.id)
    }
    if (!byChampion.has(skin.championId)) byChampion.set(skin.championId, [])
    byChampion.get(skin.championId).push(skin.id)
  }
  return { bySkinline, byChampion }
}

const countIn = (ids, set) => {
  let n = 0
  for (const id of ids) if (set.has(id)) n += 1
  return n
}

// Базовое состояние считается один раз на (skins, collection)
export const buildBaseLine = (data) => {
  const { skins, champions } = data
  const collectionSet = new Set(data.state.collection)
  const shardsSet = new Set(data.state.shards)
  const { bySkinline, byChampion } = buildGroupMaps(skins)

  let baseValid = 0
  let baseCompleted = 0
  for (const ids of bySkinline.values()) {
    if (ids.length < MIN_GROUP_SIZE) continue
    const owned = countIn(ids, collectionSet)
    if (owned === 0) continue
    baseValid += 1
    if (owned === ids.length) baseCompleted += 1
  }
  for (const ids of byChampion.values()) {
    if (ids.length < MIN_GROUP_SIZE) continue
    const owned = countIn(ids, collectionSet)
    if (owned === 0) continue
    baseValid += 1
    if (owned === ids.length) baseCompleted += 1
  }

  return {
    skins,
    champions,
    collectionSet,
    shardsSet,
    bySkinline,
    byChampion,
    baseValid,
    baseCompleted,
    totalSkins: skins.length,
    totalRarityWeight: skins.reduce((s, sk) => s + (RARITY_WEIGHTS[sk.rarity] ?? 0), 0),
    totalChampions: champions?.length ?? 0,
    skinById: new Map(skins.map((s) => [s.id, s])),
  }
}

const completionistGain = (base, validDelta, completedDelta) => {
  if (base.baseValid + validDelta === 0) return 0
  const before = base.baseValid > 0 ? (base.baseCompleted / base.baseValid) * 15 : 0
  const after = ((base.baseCompleted + completedDelta) / (base.baseValid + validDelta)) * 15
  return after - before
}

// Расчёт для произвольного набора id (shards, wishlist, видимые строки).
// extraSet позволяет учесть предметы, которые ещё не куплены, но которые мы планируем купить (например, вишлист).
export const recommendFor = (itemIds, base, ownedSet = base.collectionSet, extraSet = new Set()) => {
  const result = new Map()
  const shardsSet = base.shardsSet
  const totalSkins = base.totalSkins
  const totalRarityWeight = base.totalRarityWeight
  const totalChampions = base.totalChampions

  // Множество всех доступных предметов (осколки + планируемые к покупке)
  const potentialSet = extraSet.size > 0 ? new Set([...shardsSet, ...extraSet]) : shardsSet

  const compGainBase = totalSkins > 0 ? 30 / totalSkins : 0
  const rosterGainBase = totalChampions > 0 ? 20 / totalChampions : 0

  for (const itemId of itemIds) {
    const skin = base.skinById.get(itemId)
    if (!skin) continue

    const groups = []
    for (let i = 0; i < skin.skinLineIds.length; i++) {
      const slId = skin.skinLineIds[i]
      const ids = base.bySkinline.get(slId) ?? []
      if (ids.length < MIN_GROUP_SIZE) continue
      groups.push({
        type: 'skinline', id: slId, name: skin.skinLines[i],
        total: ids.length,
        owned: countIn(ids, ownedSet),
        inShards: countIn(ids, shardsSet),
        inPotential: countIn(ids, potentialSet),
      })
    }
    const champIds = base.byChampion.get(skin.championId) ?? []
    const championGroup = champIds.length >= MIN_GROUP_SIZE ? {
      type: 'champion', id: skin.championId, name: skin.champion,
      total: champIds.length,
      owned: countIn(champIds, ownedSet),
      inShards: countIn(champIds, shardsSet),
      inPotential: countIn(champIds, potentialSet),
    } : null
    if (championGroup) groups.push(championGroup)

    let completesNow = false
    let completesWithGroup = false
    let startsNew = false
    let validDelta = 0
    let completedDelta = 0
    let missingToComplete = Infinity

    for (const g of groups) {
      // Сколько нужно купить, чтобы закрыть группу (только за счет осколков)
      const missingWithShards = Math.max(0, g.total - g.owned)
      
      // Сколько нужно купить, чтобы закрыть группу (с учетом вишлиста)
      const missingWithPotential = Math.max(0, g.total - g.owned)

      // Берем лучший (наименьший) вариант нехватки для этой группы
      const currentMissing = Math.min(missingWithShards, missingWithPotential)
      if (currentMissing < missingToComplete) {
        missingToComplete = currentMissing
      }

      if (g.owned + 1 === g.total) {
        // Покупка этого скина закрывает группу прямо сейчас
        completesNow = true
        completedDelta += 1
        if (missingToComplete > 1) missingToComplete = 1
      } else {
        if (g.owned === 0) {
          startsNew = true
          if (g.inPotential > 0) validDelta += 1
        }
        if (g.owned + g.inPotential === g.total) {
          completesWithGroup = true
        }
      }
    }

    if (missingToComplete === Infinity) missingToComplete = 0

    const isNewChampion = championGroup?.owned === 0

    let tier
    if (completesNow) tier = TIERS.upgradeNow
    else if (completesWithGroup) tier = TIERS.upgradeGroup
    else if (isNewChampion) tier = TIERS.newChampion
    else if (startsNew) tier = TIERS.disenchant
    else tier = TIERS.advance

    const rarGain = totalRarityWeight > 0
      ? ((RARITY_WEIGHTS[skin.rarity] ?? 0) / totalRarityWeight) * 25 : 0
    const rosterGain = isNewChampion ? rosterGainBase : 0
    const cGain = completionistGain(base, validDelta, completedDelta)
    const gain = compGainBase + rarGain + rosterGain + cGain

    result.set(itemId, {
      id: itemId,
      skin,
      tier,
      gain: Math.round(gain * 100) / 100,
      breakdown: { compGain: compGainBase, rarGain, rosterGain, cGain },
      completesNow,
      completesWithGroup,
      startsNew,
      groups,
      missingToComplete,
    })
  }

  return result
}

// Удобный враппер для осколков — с сортировкой и summary.
export const buildShardRecommendations = (state, data) => {
  const base = buildBaseLine({ ...data, state })
  const recs = recommendFor(state.shards, base)
  const list = [...recs.values()]

  const tierOrder = {
    [TIERS.upgradeNow]: 0,
    [TIERS.upgradeGroup]: 1,
    [TIERS.newChampion]: 2,
    [TIERS.advance]: 3,
    [TIERS.disenchant]: 4,
  }
  list.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier] || b.gain - a.gain)

  const byTier = (t) => list.filter((r) => r.tier === t)
  const sumGain = (arr) => Math.round(arr.reduce((s, r) => s + r.gain, 0) * 100) / 100

  return {
    list,
    recommendationsById: recs,
    base, // переиспользуется для wishlist и lazy-расчёта
    summary: {
      total: list.length,
      upgradeNow: byTier(TIERS.upgradeNow).length,
      upgradeGroup: byTier(TIERS.upgradeGroup).length,
      newChampion: byTier(TIERS.newChampion).length,
      advance: byTier(TIERS.advance).length,
      disenchant: byTier(TIERS.disenchant).length,
      potentialGain: {
        upgradeNow: sumGain(byTier(TIERS.upgradeNow)),
        upgradeGroup: sumGain(byTier(TIERS.upgradeGroup)),
        newChampion: sumGain(byTier(TIERS.newChampion)),
      },
    },
  }
}