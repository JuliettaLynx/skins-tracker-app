export default function ChromaChip({ chroma, onToggle }) {
  const color = chroma.colors?.[0] ?? '#7A8699'
  return (
    <li
      className="flex items-center gap-1 h-7 pl-1.5 pr-1 border rounded-xl bg-[#0f141d] text-xs max-w-full"
      style={{ borderColor: color }}
      title={chroma.fullName}
    >
      <span className="w-2 h-2 rounded-full flex-none" style={{ background: color }} />
      <span className="flex-1 min-w-0 truncate text-text-h leading-none">{chroma.name}</span>
      <button
        type="button"
        onClick={() => onToggle(chroma.id)}
        title="Добавить в имеющиеся"
        className="grid place-items-center w-5 h-5 flex-none rounded-lg border border-[#2c3546] bg-[#1a2130] text-text-h text-xs leading-none cursor-pointer hover:border-accent"
      >
        +
      </button>
    </li>
  )
}