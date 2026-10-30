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
      setTimeout(() => setResult(null), 5000)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center justify-center px-3 py-[7px] rounded-lg border border-[#3a4a28] bg-[#1a2611] text-[#8fc46a] text-[13px] leading-none cursor-pointer whitespace-nowrap transition-colors enabled:hover:bg-[#233316] enabled:hover:border-[#5aad35] disabled:opacity-[0.45] disabled:cursor-not-allowed"
      >
        Загрузить инвентарь
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = '' }}
      />
      {error && <span className="text-xs text-[#ff8f8f] max-w-[220px] truncate">{error}</span>}
      {result && (
        <span className="text-xs text-[#8fc46a] whitespace-nowrap">
          +{result.collection} в коллекцию, +{result.shards} в осколки
          {result.skipped > 0 ? `, пропущено ${result.skipped}` : ''}
        </span>
      )}
    </div>
  )
}