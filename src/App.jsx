import { useCallback, useEffect, useMemo, useState } from 'react'
import ChampionTable from './components/ChampionTable.jsx'
import LinePanel from './components/LinePanel.jsx'
import { LIST_COLORS } from './rarities.js'
import { LIST, buildLines, buildRows, normalizeData } from './skins.js'
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

  const rows = useMemo(() => buildRows(skins, statusOf, query), [skins, statusOf, query])
  const lines = useMemo(() => buildLines(skins, statusOf), [skins, statusOf])

  return (
    <div className="app">
      <header className="topbar">
        <h1>Трекер скинов</h1>
        <div className="topbar__stats">
          <span style={{ color: LIST_COLORS.collection }}>коллекция {collection.length}</span>
          <span style={{ color: LIST_COLORS.shards }}>осколки {shards.length}</span>
          <span>база {skins.length}</span>
        </div>
        <input
          className="topbar__search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск чемпиона"
          aria-label="Поиск чемпиона"
        />
      </header>

      <div className="layout">
        <main className="content">
          {error && <p className="notice notice--error">Не удалось загрузить data.json: {error}</p>}
          {!error && loading && <p className="notice">Загружаем базу скинов…</p>}
          {!error && !loading && rows.length === 0 && <p className="notice">Ничего не найдено</p>}
          {!error && !loading && rows.length > 0 && <ChampionTable rows={rows} onMove={moveSkin} />}
        </main>

        <aside className="sidebar">
          <LinePanel lines={lines} />
        </aside>
      </div>
    </div>
  )
}
