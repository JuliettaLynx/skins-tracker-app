import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import ChampionTable from './components/ChampionTable.jsx'
import ChromaTable from './components/ChromaTable.jsx'
import ParameterCards from './components/ParameterCards.jsx'
import LinePanel from './components/LinePanel.jsx'
import ImportBar from './components/ImportBar.jsx'
import { LIST_COLORS } from './rarities.js'
import {
  CHROMA_FILTER,
  LIST,
  buildChromaIndex,
  buildLines,
  buildRows,
  filterChromaRows,
  normalizeData,
} from './skins.js'
import { mergeLists, parseInventory } from './inventory.js'
import useLocalStorage from './hooks/useLocalStorage.js'

const STORAGE_KEYS = {
  collection: 'skins-tracker:collection',
  shards: 'skins-tracker:shards',
  chromas: 'skins-tracker:chromas',
  chromaFilter: 'skins-tracker:chroma-filter',
}

const readView = () => {
  if (typeof window === 'undefined') return 'skins'
  return /^#\/?chromas/.test(window.location.hash) ? 'chromas' : 'skins'
}

export default function App() {
  const [skins, setSkins] = useState([])
  const [chromaCatalogue, setChromaCatalogue] = useState([])
  const [champions, setChampions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [view, setView] = useState(readView)

  const [collection, setCollection] = useLocalStorage(STORAGE_KEYS.collection, [])
  const [shards, setShards] = useLocalStorage(STORAGE_KEYS.shards, [])
  const [chromas, setChromas] = useLocalStorage(STORAGE_KEYS.chromas, [])
  const [chromaFilter, setChromaFilter] = useLocalStorage(
    STORAGE_KEYS.chromaFilter,
    CHROMA_FILTER.all
  )

  useEffect(() => {
    if (!Object.values(CHROMA_FILTER).includes(chromaFilter)) {
      setChromaFilter(CHROMA_FILTER.all)
    }
  }, [chromaFilter, setChromaFilter])

  useEffect(() => {
    let alive = true
    fetch('/data.json')
      .then((response) => {
        if (!response.ok) throw new Error(`data.json: HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!alive) return
        const normalized = normalizeData(data)
        setSkins(normalized.skins)
        setChromaCatalogue(normalized.chromas)
        setChampions(normalized.champions)
        setLoading(false)
      })
      .catch((err) => {
        if (!alive) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const onHash = () => setView(readView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const statusOf = useMemo(() => {
    const map = new Map()
    for (const id of collection) map.set(id, LIST.collection)
    for (const id of shards) if (!map.has(id)) map.set(id, LIST.shards)
    return map
  }, [collection, shards])

  const collectionSkinSet = useMemo(() => new Set(collection), [collection])
  const ownedChromaSet = useMemo(() => new Set(chromas), [chromas])

  const knownSkinIds = useMemo(() => new Set(skins.map((s) => s.id)), [skins])
  const knownChromaIds = useMemo(
    () => new Set(chromaCatalogue.map((c) => c.id)),
    [chromaCatalogue]
  )

  const moveSkin = useCallback(
    (id, target) => {
      setCollection((prev) =>
        target === LIST.collection
          ? prev.includes(id)
            ? prev
            : [...prev, id]
          : prev.filter((x) => x !== id)
      )
      setShards((prev) =>
        target === LIST.shards
          ? prev.includes(id)
            ? prev
            : [...prev, id]
          : prev.filter((x) => x !== id)
      )
    },
    [setCollection, setShards]
  )

  const toggleChroma = useCallback(
    (id) => {
      setChromas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    },
    [setChromas]
  )

  const handleImport = useCallback(
    (raw) => {
      const parsed = parseInventory(raw, { skinIds: knownSkinIds, chromaIds: knownChromaIds })
      setCollection((prev) => mergeLists(prev, parsed.collection))
      setShards((prev) => mergeLists(prev, parsed.shards))
      setChromas((prev) => mergeLists(prev, parsed.chromas))
      return {
        collection: parsed.collection.length,
        shards: parsed.shards.length,
        chromas: parsed.chromas.length,
        skipped: parsed.skipped,
      }
    },
    [knownSkinIds, knownChromaIds, setCollection, setShards, setChromas]
  )

  const rows = useMemo(
    () => buildRows(skins, statusOf, deferredQuery),
    [skins, statusOf, deferredQuery]
  )
  const lines = useMemo(() => buildLines(skins, statusOf), [skins, statusOf])

  const chromaIndex = useMemo(() => buildChromaIndex(chromaCatalogue), [chromaCatalogue])
  const chromaRows = useMemo(
    () =>
      filterChromaRows(chromaIndex, deferredQuery, {
        filter: chromaFilter,
        collectionSkinSet,
        ownedChromaSet,
      }),
    [chromaIndex, deferredQuery, chromaFilter, collectionSkinSet, ownedChromaSet]
  )

  const chromaStats = useMemo(() => {
    let owned = 0
    for (const c of chromaCatalogue) if (ownedChromaSet.has(c.id)) owned += 1
    return { owned, total: chromaCatalogue.length }
  }, [chromaCatalogue, ownedChromaSet])

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 px-4 py-2.5 bg-[rgba(10,13,19,0.92)] backdrop-blur-[6px] border-b border-border">
        <h1 className="m-0 text-[20px] font-semibold text-text-h tracking-[-0.2px]">
          Трекер скинов
        </h1>

        <nav className="flex gap-1 text-[13px]">
          <a
            href="#/"
            className={`px-2.5 py-1 rounded-md border ${
              view === 'skins'
                ? 'border-accent text-accent bg-[rgba(200,155,60,0.1)]'
                : 'border-border text-muted hover:text-text-h'
            }`}
          >
            Скины
          </a>
          <a
            href="#/chromas"
            className={`px-2.5 py-1 rounded-md border ${
              view === 'chromas'
                ? 'border-accent text-accent bg-[rgba(200,155,60,0.1)]'
                : 'border-border text-muted hover:text-text-h'
            }`}
          >
            Хромы{' '}
            <span className="text-[11px] tabular-nums text-muted">
              {chromaStats.owned}/{chromaStats.total}
            </span>
          </a>
        </nav>

        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
          <div className="flex gap-3.5 text-[13px] text-muted whitespace-nowrap">
            <span style={{ color: LIST_COLORS.collection }}>коллекция {collection.length}</span>
            <span style={{ color: LIST_COLORS.shards }}>осколки {shards.length}</span>
            <span>
              хромы {chromaStats.owned}/{chromaStats.total}
            </span>
            <span>база {skins.length}</span>
          </div>
          <ImportBar onImport={handleImport} disabled={loading || skins.length === 0} />
        </div>
      </header>

      <div className="p-4 flex flex-col gap-6">
        <ParameterCards
          skins={skins}
          chromaCatalogue={chromaCatalogue}
          champions={champions}
          collection={collection}
          shards={shards}
          chromas={chromas}
        />

        <div
          className={`grid grid-cols-1 ${
            view === 'skins' ? 'min-[1100px]:grid-cols-[minmax(0,1fr)_360px]' : ''
          } items-start gap-4`}
        >
          <main className="min-w-0 overflow-x-auto">
            <div className="flex gap-2 mb-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={view === 'chromas' ? 'Поиск скина или чемпиона' : 'Поиск чемпиона'}
                className="flex-1 min-w-0 px-3 py-[7px] rounded-lg border border-border bg-[#0f141d] text-text-h text-[13px]"
              />
            </div>

            {error && (
              <p className="py-10 px-4 text-center text-[#ff8f8f]">
                Не удалось загрузить data.json: {error}
              </p>
            )}
            {!error && loading && (
              <p className="py-10 px-4 text-center text-muted">Загружаем базу скинов…</p>
            )}

            {!error && !loading && view === 'skins' && (
              rows.length === 0 ? (
                <p className="py-10 px-4 text-center text-muted">Ничего не найдено</p>
              ) : (
                <ChampionTable rows={rows} onMove={moveSkin} />
              )
            )}

            {!error && !loading && view === 'chromas' && (
              chromaRows.length === 0 ? (
                <p className="py-10 px-4 text-center text-muted">Ничего не найдено</p>
              ) : (
                <ChromaTable
                  rows={chromaRows}
                  ownedSet={ownedChromaSet}
                  onToggle={toggleChroma}
                  filter={chromaFilter}
                  onFilterChange={setChromaFilter}
                />
              )
            )}
          </main>

          {view === 'skins' && (
            <aside className="flex max-[1100px]:order-first max-[1100px]:w-full min-[1100px]:sticky min-[1100px]:top-[60px] min-[1100px]:max-h-[calc(100svh-76px)]">
              <LinePanel lines={lines} />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}