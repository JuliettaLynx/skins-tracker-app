import { useCallback, useEffect, useMemo, useState } from 'react'
import ChampionTable from './components/ChampionTable.jsx'
import LinePanel from './components/LinePanel.jsx'
import ImportBar from './components/ImportBar.jsx'
import { LIST_COLORS } from './rarities.js'
import { LIST, buildLines, buildRows, normalizeData } from './skins.js'
import { mergeLists, parseInventory } from './inventory.js'
import useLocalStorage from './hooks/useLocalStorage.js'

const STORAGE_KEYS = {
  collection: 'skins-tracker:collection',
  shards: 'skins-tracker:shards',
}

export default function App() {
  const [skins, setSkins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [collection, setCollection] = useLocalStorage(STORAGE_KEYS.collection, [])
  const [shards, setShards] = useLocalStorage(STORAGE_KEYS.shards, [])

  useEffect(() => {
    let alive = true

    fetch('/data.json')
      .then((response) => {
        if (!response.ok) throw new Error(`data.json: HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!alive) return
        setSkins(normalizeData(data))
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

  const statusOf = useMemo(() => {
    const map = new Map()
    for (const id of collection) map.set(id, LIST.collection)
    for (const id of shards) {
      if (!map.has(id)) map.set(id, LIST.shards)
    }
    return map
  }, [collection, shards])

  // A skin lives in exactly one list, so moving means "put into target, drop out of the others".
  const moveSkin = useCallback(
    (id, target) => {
      setCollection((prev) =>
        target === LIST.collection ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
      )
      setShards((prev) =>
        target === LIST.shards ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
      )
    },
    [setCollection, setShards]
  )

  // Handles the uploaded inventory file: tops both lists up with what the file says.
  const handleImport = useCallback(
    (raw) => {
      const knownIds = new Set(skins.map((s) => s.id))
      const parsed = parseInventory(raw, knownIds)
      setCollection((prev) => mergeLists(prev, parsed.collection))
      setShards((prev) => mergeLists(prev, parsed.shards))
      return {
        collection: parsed.collection.length,
        shards: parsed.shards.length,
        skipped: parsed.skipped,
      }
    },
    [skins, setCollection, setShards]
  )

  const rows = useMemo(() => buildRows(skins, statusOf, query), [skins, statusOf, query])
  const lines = useMemo(() => buildLines(skins, statusOf), [skins, statusOf])

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 px-4 py-2.5 bg-[rgba(10,13,19,0.92)] backdrop-blur-[6px] border-b border-border">
        <h1 className="m-0 text-[20px] font-semibold text-text-h tracking-[-0.2px]">
          Трекер скинов
        </h1>
        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
          <div className="flex gap-3.5 text-[13px] text-muted whitespace-nowrap">
            <span style={{ color: LIST_COLORS.collection }}>коллекция {collection.length}</span>
            <span style={{ color: LIST_COLORS.shards }}>осколки {shards.length}</span>
            <span>база {skins.length}</span>
          </div>
          <ImportBar onImport={handleImport} disabled={loading || skins.length === 0} />
        </div>
      </header>

      <div className="grid grid-cols-1 min-[1100px]:grid-cols-[minmax(0,1fr)_360px] items-start gap-4 p-4">
        <main className="min-w-0 overflow-x-auto">
          {error && (
            <p className="py-10 px-4 text-center text-[#ff8f8f]">
              Не удалось загрузить data.json: {error}
            </p>
          )}
          {!error && loading && (
            <p className="py-10 px-4 text-center text-muted">Загружаем базу скинов…</p>
          )}
          {!error && !loading && rows.length === 0 && (
            <p className="py-10 px-4 text-center text-muted">Ничего не найдено</p>
          )}
          {!error && !loading && rows.length > 0 && (
            <ChampionTable rows={rows} onMove={moveSkin} />
          )}
        </main>

        <aside className="flex max-[1100px]:order-first max-[1100px]:w-full min-[1100px]:sticky min-[1100px]:top-[60px] min-[1100px]:max-h-[calc(100svh-76px)]">
          <LinePanel lines={lines} />
        </aside>
      </div>
    </div>
  )
}