import { useRef, useState } from 'react'

// Lets the user drop or pick an inventory JSON file.
// The file has two arrays: "skins" and "shards".
// After parsing, onImport is called with the raw object.
export default function ImportBar({ onImport, disabled }) {
  const fileRef = useRef(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    setResult(null)
    setError('')
    try {
      const text = await file.text()
      const raw = JSON.parse(text)
      const info = onImport(raw)
      setResult(info)
      // Clear after 5 seconds.
      setTimeout(() => setResult(null), 5000)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="import-bar">
      <button
        className="import-bar__btn"
        type="button"
        disabled={disabled}
        onClick={() => fileRef.current?.click()}
      >
        Загрузить инвентарь
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = '' }}
      />
      {error && <span className="import-bar__error">{error}</span>}
      {result && (
        <span className="import-bar__result">
          +{result.collection} в коллекцию, +{result.shards} в осколки
          {result.skipped > 0 ? `, пропущено ${result.skipped}` : ''}
        </span>
      )}
    </div>
  )
}
